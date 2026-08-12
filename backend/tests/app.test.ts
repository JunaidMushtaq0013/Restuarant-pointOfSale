import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("GET /", () => {
  it("should return a successful response", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe("GET /api/inventory", () => {
  it("should reject a request without authentication", async () => {
    const response = await request(app).get("/api/inventory");

    expect(response.status).toBe(401);
expect(response.body.success).toBe(false);
expect(response.body.message).toBe("Authentication token is missing.");
  });
});