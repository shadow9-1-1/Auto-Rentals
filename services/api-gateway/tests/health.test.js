const request = require("supertest");
const app = require("../src/app");

describe("Health API", () => {
  it("should return 200 OK for /health", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "ok");
  });
});
