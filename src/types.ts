import type { Request, Response, RequestHandler, Express } from "express";
import type { CorsOptions } from "cors";
import type { Options as RateLimitOptions } from "express-rate-limit";
import type { CompressionOptions } from "compression";
import type { OptionsJson, OptionsUrlencoded } from "body-parser";

export type { CorsOptions, RateLimitOptions, CompressionOptions, OptionsJson, OptionsUrlencoded };

export interface BodyParserOptions {
  /**
   * Options passed to express.json()
   */
  json?: OptionsJson | boolean;
  /**
   * Options passed to express.urlencoded()
   */
  urlencoded?: OptionsUrlencoded | boolean;
  /**
   * Shorthand payload size limit (e.g. "1mb", "10mb"). Default is "1mb".
   */
  limit?: string | number;
}

export interface HealthCheckOptions {
  /**
   * The endpoint path to serve the health check on. Default: "/health"
   */
  path?: string;
  /**
   * Custom response body or handler function. Default: { status: "ok", timestamp: ... }
   */
  response?: Record<string, unknown> | ((req: Request, res: Response) => void | Record<string, unknown>);
}

export interface XpressFuseOptions {
  /**
   * CORS configuration options or false to disable. Default: enabled with sane defaults.
   */
  cors?: CorsOptions | boolean;

  /**
   * Helmet security headers options or false to disable. Default: true.
   */
  helmet?: boolean | Record<string, unknown>;

  /**
   * Gzip/Brotli compression options or false to disable. Default: true.
   */
  compression?: boolean | CompressionOptions;

  /**
   * Rate limiting options or false to disable. Default: 100 requests per 15 minutes.
   */
  rateLimit?: boolean | Partial<RateLimitOptions>;

  /**
   * Request logging format (e.g. "dev", "combined", "common", "tiny", "short") or false to disable. Default: "dev".
   */
  logging?: boolean | string;

  /**
   * Request timeout in milliseconds or false to disable. Default: 5000 (5s).
   */
  timeout?: number | boolean;

  /**
   * Body parser configuration or false to disable. Default: enabled with 1mb limit.
   */
  bodyParser?: boolean | BodyParserOptions;

  /**
   * Shorthand body parser size limit (e.g. "1mb", "5mb").
   */
  bodyParserLimit?: string | number;

  /**
   * Health check route configuration or false to disable. Default: false.
   */
  healthCheck?: boolean | string | HealthCheckOptions;
}

export type ExpressInstanceOrOptions = Express | typeof import("express") | XpressFuseOptions;
