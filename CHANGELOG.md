# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-08-17

### Added
- Complete TypeScript rewrite with strict type definitions and declaration generation (`.d.ts`, `.d.mts`).
- Dual module export supporting both CommonJS (`dist/index.js`) and ECMAScript Modules (`dist/index.mjs`).
- Flexible invocation: Call `xpressFuse(options)` directly without needing to pass the `express` constructor.
- Convenient helper method: `xpressFuse.attach(app, options)` to mount the full stack onto an Express instance in one line.
- Optional built-in health check endpoint (`healthCheck: true` or custom path and payload).
- Fine-grained body-parser configuration supporting separate json and urlencoded options.
- Automated CI and NPM Trusted Publisher release workflows.

### Changed
- Refactored option normalization with full backwards compatibility for legacy aliases (`corsOptions`, `requestTimeout`).
- Replaced jest test suite with comprehensive integration tests covering security headers, CORS, rate limiting, and body parsing.

---

## [0.1.0] - 2025-03-01

### Added
- Initial release of xpress-fuse middleware bundle with CORS, Helmet, Compression, Rate Limiting, and Morgan logging.
