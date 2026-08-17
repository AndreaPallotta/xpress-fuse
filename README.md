# xpress-fuse

A production-ready, lightweight middleware bundle for Express.js with first-class TypeScript support. Sane security, performance, and observability defaults in a single import.

---

## Features

- **Security Headers**: Powered by `helmet` with sensible default policies
- **CORS Support**: Pre-configured `cors` handling with full customization
- **Gzip / Brotli Compression**: Powered by `compression` with `x-no-compression` header bypass support
- **Rate Limiting**: Built-in `express-rate-limit` protecting routes against brute-force and DDoS
- **HTTP Request Logging**: Integrated `morgan` logging formatted for development and production
- **Body Parsing**: JSON and URL-encoded body parsing with configurable payload size limits
- **Request Timeout**: Prevents hanging requests with `connect-timeout`
- **Optional Health Check**: Zero-config `/health` endpoint for Kubernetes and load balancers
- **Dual Module Support**: Full CommonJS and ESM support with bundled TypeScript type definitions

---

## Installation

```bash
npm install xpress-fuse
```

Peer dependency: `express` (`^4.21.2` or `^5.0.0`).

---

## Usage

### TypeScript / ES Modules (ESM)

```ts
import express from "express";
import xpressFuse from "xpress-fuse";

const app = express();

// Apply default middleware stack
app.use(xpressFuse());

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

### CommonJS (CJS)

```js
const express = require("express");
const xpressFuse = require("xpress-fuse");

const app = express();

// Mount directly with the helper
xpressFuse.attach(app);

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

---

## Configuration

All middlewares can be customized or disabled by passing an options object:

```ts
import express from "express";
import xpressFuse from "xpress-fuse";

const app = express();

app.use(
  xpressFuse({
    cors: {
      origin: "https://yourdomain.com",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    helmet: {
      contentSecurityPolicy: false,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
    },
    logging: "combined", // "dev" | "combined" | "common" | "short" | "tiny"
    timeout: 10000, // 10s request timeout
    bodyParserLimit: "5mb",
    healthCheck: {
      path: "/healthz",
      response: { status: "healthy", uptime: process.uptime() },
    },
  })
);
```

---

## Options Reference

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `cors` | `boolean \| CorsOptions` | `true` | CORS settings or `false` to disable |
| `helmet` | `boolean \| HelmetOptions` | `true` | Helmet security headers or `false` to disable |
| `compression` | `boolean \| CompressionOptions` | `true` | Gzip/deflate compression or `false` to disable |
| `rateLimit` | `boolean \| RateLimitOptions` | `100 req / 15 min` | Rate limiting configuration or `false` to disable |
| `logging` | `boolean \| string` | `"dev"` | Morgan log format (`"dev"`, `"combined"`, etc.) or `false` |
| `timeout` | `number \| boolean` | `5000` | Request timeout in milliseconds or `false` to disable |
| `bodyParser` | `boolean \| BodyParserOptions` | `true` | Body parser settings or `false` to disable |
| `bodyParserLimit` | `string \| number` | `"1mb"` | Payload size limit for JSON and URL-encoded bodies |
| `healthCheck` | `boolean \| string \| HealthCheckOptions` | `false` | Route path or config for built-in health check |

---

## License

MIT License. Copyright (c) Andrea Pallotta.