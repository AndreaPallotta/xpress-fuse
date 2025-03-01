const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const timeout = require("connect-timeout");

const _shouldCompress = (req, res) => {
    return !req.headers['x-no-compression'] && compression.filter(req, res);
};

const xpressFuse = (expressInstance, options = {}) => {
    if (!expressInstance || typeof expressInstance.json !== 'function') {
        throw new Error("xpress-fuse requires an Express instance.");
    }

    const {
        corsOptions: corsOptions = {},
        helmet: useHelmet = true,
        compression: useCompression = true,
        rateLimit: useRateLimit = { windowMs: 15 * 60 * 1000, max: 100 },
        logging = true,
        bodyParserLimit = "1mb",
        requestTimeout = 5000,
    } = options;

    const middlewares = [];

    if (corsOptions) {
        middlewares.push(cors({
            origin: corsOptions.origin || "*",
            methods: corsOptions.methods || "GET,POST,PUT,DELETE",
            allowedHeaders: corsOptions.allowedHeaders || "Content-Type,Authorization",
            credentials: corsOptions.credentials || false,
            maxAge: corsOptions.maxAge || 86400,
            preflightContinue: corsOptions.preflightContinue || false,
            optionsSuccessStatus: corsOptions.optionsSuccessStatus || 204,
        }));
    }

    if (useHelmet) middlewares.push(helmet());
    if (useCompression) middlewares.push(compression({ filter: _shouldCompress }));
    if (useRateLimit) middlewares.push(rateLimit(useRateLimit));
    if (logging) middlewares.push(morgan("dev"));

    middlewares.push(timeout(requestTimeout));

    middlewares.push(expressInstance.json({ limit: bodyParserLimit }));
    middlewares.push(expressInstance.urlencoded({ extended: true, limit: bodyParserLimit }));

    return middlewares;
};

module.exports = xpressFuse;
