const request = require("supertest");
const express = require("express");
const xpressFuse = require("../index");

describe("xpress-fuse middleware", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(xpressFuse(express));
    app.get("/", (_, res) => res.json({ message: "Hello, World!" }));
  });

  test("should apply middleware and return a successful response", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Hello, World!" });
  });

  test("should include security headers from helmet", async () => {
    const res = await request(app).get("/");
    expect(res.headers["x-dns-prefetch-control"]).toBe("off");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
  });

  test("should support CORS if enabled", async () => {
    const res = await request(app).options("/").set("Origin", "http://example.com");
    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });

  test("should respect rate limiting", async () => {
    const limitedApp = express();
    limitedApp.use(xpressFuse(express, { rateLimit: { windowMs: 1000, max: 2 } }));
    limitedApp.get("/", (_, res) => res.send("OK"));

    await request(limitedApp).get("/");
    await request(limitedApp).get("/");
    const res = await request(limitedApp).get("/");

    expect(res.status).toBe(429);
  });

  test("should throw an error if express instance is not passed", () => {
    expect(() => xpressFuse()).toThrow("xpress-fuse requires an Express instance.");
  });

  test("should not throw error if express instance is passed", () => {
    expect(() => xpressFuse(express)).not.toThrow();
  });
});
