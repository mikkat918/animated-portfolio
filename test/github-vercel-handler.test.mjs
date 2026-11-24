import test from "node:test";
import assert from "node:assert/strict";
import { createGitHubRequestHandler } from "../api/github.js";

test("Vercel GitHub handler returns public data and an explicit no-token fallback", async () => {
  const handler = createGitHubRequestHandler({
    environment: { GITHUB_USERNAME: "mikkat918" },
    fetchImpl: async (url) => {
      if (String(url).endsWith("/events/public?per_page=30")) {
        return Response.json([]);
      }
      return Response.json({
        login: "mikkat918",
        name: "Mikkat",
        html_url: "https://github.com/mikkat918",
        avatar_url: "https://avatars.githubusercontent.com/u/1",
        public_repos: 4,
        followers: 2,
        following: 3,
      });
    },
  });

  const response = await handler(new Request("https://portfolio.example/api/github?year=2026"));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.profile.username, "mikkat918");
  assert.equal(body.profile.publicRepositories, 4);
  assert.equal(body.contributions.configured, false);
  assert.equal(body.contributions.data, null);
  assert.match(body.contributions.error, /GITHUB_TOKEN/);
  assert.equal(JSON.stringify(body).includes("token"), false);
});

test("Vercel GitHub handler validates method and year", async () => {
  const handler = createGitHubRequestHandler({ fetchImpl: async () => { throw new Error("must not fetch"); } });
  assert.equal((await handler(new Request("https://portfolio.example/api/github?year=1900"))).status, 400);
  assert.equal((await handler(new Request("https://portfolio.example/api/github", { method: "POST" }))).status, 405);
});
