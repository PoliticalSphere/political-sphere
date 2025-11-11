import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { app } from "../src/app.ts";

let server: import("http").Server;
let agent: request.SuperTest<request.Test>;

// Use async/await style hooks to avoid callback issues in Vitest
beforeAll(async () => {
  server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  agent = request(server);
});

afterAll(() => {
  if (server) server.close();
});

describe("Health and Auth endpoints", () => {
  it("GET /health returns ok", async () => {
    const res = await agent.get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("can register and login", async () => {
    const username = `alpha-${Date.now()}`;
    const email = `${username}@example.com`;
    const password = "alphapass123";

    const reg = await agent
      .post("/auth/register")
      .send({ username, password, email })
      .set("Content-Type", "application/json");

    expect([200, 201]).toContain(reg.status);
    expect(reg.body?.tokens?.accessToken).toBeDefined();

    const login = await agent
      .post("/auth/login")
      .send({ username, password })
      .set("Content-Type", "application/json");

    expect(login.status).toBe(200);
    expect(login.body?.tokens?.accessToken).toBeDefined();
  });

  it("can create and list games", async () => {
    const username = `beta-${Date.now()}`;
    const email = `${username}@example.com`;
    const password = "betapass123";

    const reg = await agent
      .post("/auth/register")
      .send({ username, password, email })
      .set("Content-Type", "application/json");

    const token = reg.body.tokens.accessToken as string;

    const created = await agent
      .post("/game/create")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Game" });

    expect([200, 201]).toContain(created.status);
    expect(created.body?.game?.id).toBeDefined();

    const list = await agent.get("/game/list").set("Authorization", `Bearer ${token}`);

    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.games)).toBe(true);
  });
});
