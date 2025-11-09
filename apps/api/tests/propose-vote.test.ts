import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.ts";

let server: import("http").Server;
let agent: request.SuperTest<request.Test>;

beforeAll(async () => {
  server = await new Promise((resolve) => {
    const s = createApp().listen(0, () => resolve(s));
  });
  agent = request(server);
});

afterAll(() => {
  if (server) server.close();
});

async function register(username: string, password: string) {
  const res = await agent
    .post("/auth/register")
    .send({ username, password })
    .set("Content-Type", "application/json");
  expect([200, 201]).toContain(res.status);
  return res.body.tokens.accessToken as string;
}

describe("Proposal & Voting flow", () => {
  it("allows a proposal and a vote to be processed", async () => {
    const userA = `userA-${Date.now()}`;
    const userB = `userB-${Date.now()}`;
    const pass = "pass12345";

    const tokenA = await register(userA, pass);
    const tokenB = await register(userB, pass);

    // User A creates game
    const gameRes = await agent
      .post("/game/create")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Voting Test" });
    expect([200, 201]).toContain(gameRes.status);
    const gameId = gameRes.body.game.id as string;

    // User B joins game
    const joinRes = await agent
      .post(`/game/${gameId}/join`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(joinRes.status).toBe(200);

    // User A proposes
    const proposeRes = await agent
      .post(`/game/${gameId}/action`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        type: "propose",
        payload: { title: "Tax Reform", description: "Adjust brackets" },
      });
    expect(proposeRes.status).toBe(200);
    type Proposal = {
      id: string;
      title: string;
      description: string;
      status?: string;
    };
    const proposals: Proposal[] = proposeRes.body.game.proposals as Proposal[];
    expect(proposals.length).toBeGreaterThan(0);
    const proposalId = proposals[proposals.length - 1].id;

    // User B votes FOR
    const voteRes = await agent
      .post(`/game/${gameId}/action`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        type: "vote",
        payload: { proposalId, choice: "for", playerId: "ignored" },
      });
    expect(voteRes.status).toBe(200);
    type Vote = { playerId: string; proposalId: string; choice: string };
    const votes: Vote[] = voteRes.body.game.votes as Vote[];
    expect(votes.length).toBeGreaterThan(0);
    expect(votes[votes.length - 1].proposalId).toBe(proposalId);
  });
});
