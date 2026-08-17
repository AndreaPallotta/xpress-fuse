const request = require("supertest");
const express = require("express");
const { xpressFuse } = require("../dist/index.js");

describe("xpress-fuse middleware bundle", () => {
  test("should apply default middlewares and return a successful JSON response", async () => {
    const app = express();
    app.use(xpressFuse(express));
    app.get("/", (_, res) => res.json({ message: "Hello, World!" }));

    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Hello, World!" });
  });

  test("should include security headers from helmet by default", async () => {
    const app = express();
    app.use(xpressFuse(express));
    app.get("/", (_, res) => res.json({ ok: true }));

    const res = await request(app).get("/");
    expect(res.headers["x-dns-prefetch-control"]).toBe("off");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
  });

  test("should allow disabling helmet when helmet: false", async () => {
    const app = express();
    app.use(xpressFuse(express, { helmet: false }));
    app.get("/", (_, res) => res.json({ ok: true }));

    const res = await request(app).get("/");
    expect(res.headers["x-frame-options"]).toBeUndefined();
  });

  test("should handle CORS preflight requests with defaults", async () => {
    const app = express();
    app.use(xpressFuse(express));
    app.options("/", (_, res) => res.sendStatus(200));

    const res = await request(app).options("/").set("Origin", "https://example.com");
    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });

  test("should allow custom CORS origin configuration", async () => {
    const app = express();
    app.use(xpressFuse(express, { cors: { origin: "https://mytrusteddomain.com" } }));
    app.options("/", (_, res) => res.sendStatus(200));

    const res = await request(app).options("/").set("Origin", "https://mytrusteddomain.com");
    expect(res.headers["access-control-allow-origin"]).toBe("https://mytrusteddomain.com");
  });

  test("should respect rate limiting configuration and return 429", async () => {
    const app = express();
    app.use(xpressFuse(express, { rateLimit: { windowMs: 1000, max: 2 } }));
    app.get("/rate", (_, res) => res.send("OK"));

    await request(app).get("/rate");
    await request(app).get("/rate");
    const res = await request(app).get("/rate");

    expect(res.status).toBe(429);
  });

  test("should work when called directly with options without passing express instance", async () => {
    const app = express();
    app.use(xpressFuse({ rateLimit: false, logging: false }));
    app.get("/no-express-arg", (_, res) => res.json({ direct: true }));

    const res = await request(app).get("/no-express-arg");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ direct: true });
  });

  test("should provide built-in health check endpoint when enabled", async () => {
    const app = express();
    app.use(xpressFuse(express, { healthCheck: true }));

    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });

  test("should support custom health check path and response payload", async () => {
    const app = express();
    app.use(
      xpressFuse(express, {
        healthCheck: {
          path: "/ping",
          response: { alive: true, version: "0.2.0" },
        },
      })
    );

    const res = await request(app).get("/ping");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ alive: true, version: "0.2.0" });
  });

  test("should mount directly using xpressFuse.attach helper", async () => {
    const app = express();
    xpressFuse.attach(app, { logging: false });
    app.get("/attach-test", (_, res) => res.json({ attached: true }));

    const res = await request(app).get("/attach-test");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ attached: true });
  });

  test("should parse JSON bodies correctly", async () => {
    const app = express();
    app.use(xpressFuse(express));
    app.post("/data", (req, res) => res.json({ received: req.body }));

    const payload = { user: "alice", role: "admin" };
    const res = await request(app).post("/data").send(payload);

    expect(res.status).toBe(200);
    expect(res.body.received).toEqual(payload);
  });
});
