import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import timeout from "connect-timeout";
import type { Request, Response, RequestHandler, Express } from "express";
import type {
  XpressFuseOptions,
  CorsOptions,
  RateLimitOptions,
  CompressionOptions,
  HealthCheckOptions,
} from "./types";

export * from "./types";

/**
 * Filter function that enables compression unless explicitly bypassed via x-no-compression header.
 */
const shouldCompress = (req: Request, res: Response): boolean => {
  if (req.headers["x-no-compression"]) {
    return false;
  }
  return compression.filter(req, res);
};

/**
 * Normalizes options and extracts Express instance if provided as the first argument.
 */
function parseArgs(
  arg1?: Express | typeof express | XpressFuseOptions,
  arg2?: XpressFuseOptions
): { expressInstance: typeof express; options: XpressFuseOptions } {
  let expressInstance: typeof express = express;
  let options: XpressFuseOptions = {};

  if (arg1 && typeof (arg1 as typeof express).json === "function") {
    expressInstance = arg1 as typeof express;
    options = arg2 || {};
  } else if (arg1 && typeof arg1 === "object") {
    options = arg1 as XpressFuseOptions;
  }

  return { expressInstance, options };
}

/**
 * Creates and returns an array of pre-configured, production-ready Express middleware.
 *
 * @example
 * ```ts
 * import express from "express";
 * import xpressFuse from "xpress-fuse";
 *
 * const app = express();
 * app.use(xpressFuse(express));
 * ```
 */
export function xpressFuse(
  expressOrOptions?: Express | typeof express | XpressFuseOptions,
  maybeOptions?: XpressFuseOptions
): RequestHandler[] {
  const { expressInstance, options } = parseArgs(expressOrOptions, maybeOptions);

  const {
    cors: corsOpt = true,
    helmet: helmetOpt = true,
    compression: compressionOpt = true,
    rateLimit: rateLimitOpt = { windowMs: 15 * 60 * 1000, max: 100 },
    logging: loggingOpt = "dev",
    timeout: timeoutOpt = 5000,
    bodyParser: bodyParserOpt = true,
    bodyParserLimit = "1mb",
    healthCheck: healthCheckOpt = false,
  } = options as XpressFuseOptions & { corsOptions?: CorsOptions; requestTimeout?: number };

  // Support legacy option aliases
  const rawCors = (options as { corsOptions?: CorsOptions }).corsOptions ?? corsOpt;
  const rawTimeout = (options as { requestTimeout?: number }).requestTimeout ?? timeoutOpt;

  const middlewares: RequestHandler[] = [];

  // 1. CORS
  if (rawCors !== false) {
    if (typeof rawCors === "object") {
      middlewares.push(
        cors({
          origin: rawCors.origin || "*",
          methods: rawCors.methods || "GET,POST,PUT,DELETE,PATCH,OPTIONS",
          allowedHeaders: rawCors.allowedHeaders || "Content-Type,Authorization",
          credentials: rawCors.credentials ?? false,
          maxAge: rawCors.maxAge || 86400,
          preflightContinue: rawCors.preflightContinue || false,
          optionsSuccessStatus: rawCors.optionsSuccessStatus || 204,
          ...rawCors,
        })
      );
    } else {
      middlewares.push(cors());
    }
  }

  // 2. Helmet Security Headers
  if (helmetOpt !== false) {
    middlewares.push(typeof helmetOpt === "object" ? helmet(helmetOpt) : helmet());
  }

  // 3. Compression
  if (compressionOpt !== false) {
    const compConfig: CompressionOptions =
      typeof compressionOpt === "object" ? { filter: shouldCompress, ...compressionOpt } : { filter: shouldCompress };
    middlewares.push(compression(compConfig));
  }

  // 4. Rate Limiting
  if (rateLimitOpt !== false) {
    const limitConfig: Partial<RateLimitOptions> =
      typeof rateLimitOpt === "object" ? rateLimitOpt : { windowMs: 15 * 60 * 1000, max: 100 };
    middlewares.push(rateLimit(limitConfig));
  }

  // 5. Request Logging
  if (loggingOpt !== false) {
    const format = typeof loggingOpt === "string" ? loggingOpt : "dev";
    middlewares.push(morgan(format));
  }

  // 6. Request Timeout
  if (rawTimeout !== false && typeof rawTimeout === "number" && rawTimeout > 0) {
    middlewares.push(timeout(rawTimeout));
  }

  // 7. Health Check Endpoint
  if (healthCheckOpt) {
    const healthConfig: HealthCheckOptions =
      typeof healthCheckOpt === "string"
        ? { path: healthCheckOpt }
        : typeof healthCheckOpt === "object"
        ? healthCheckOpt
        : { path: "/health" };

    const path = healthConfig.path || "/health";
    const handler: RequestHandler = (req, res, next) => {
      if (req.method === "GET" && req.path === path) {
        if (typeof healthConfig.response === "function") {
          const custom = healthConfig.response(req, res);
          if (custom) res.json(custom);
          return;
        }
        res.status(200).json(healthConfig.response || { status: "ok", timestamp: new Date().toISOString() });
        return;
      }
      next();
    };
    middlewares.push(handler);
  }

  // 8. Body Parsing
  if (bodyParserOpt !== false) {
    const limit =
      typeof bodyParserOpt === "object" && bodyParserOpt.limit
        ? bodyParserOpt.limit
        : bodyParserLimit;

    const jsonOpt =
      typeof bodyParserOpt === "object" && typeof bodyParserOpt.json === "object"
        ? { limit, ...bodyParserOpt.json }
        : { limit };

    const urlencodedOpt =
      typeof bodyParserOpt === "object" && typeof bodyParserOpt.urlencoded === "object"
        ? { extended: true, limit, ...bodyParserOpt.urlencoded }
        : { extended: true, limit };

    middlewares.push(expressInstance.json(jsonOpt));
    middlewares.push(expressInstance.urlencoded(urlencodedOpt));
  }

  return middlewares;
}

/**
 * Attaches the configured xpressFuse middleware stack directly onto an Express application instance.
 */
xpressFuse.attach = function attach(app: Express, options?: XpressFuseOptions): Express {
  const stack = xpressFuse(app as unknown as typeof express, options);
  for (const middleware of stack) {
    app.use(middleware);
  }
  return app;
};

export default xpressFuse;
