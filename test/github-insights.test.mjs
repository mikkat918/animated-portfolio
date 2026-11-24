import test from "node:test";
import assert from "node:assert/strict";
import { createGitHubInsightsService, getCalendarMetrics } from "../server/github-insights.mjs";

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => null },
    json: async () => body,
  };
}

const account = {
  login: "mikkat918",
  name: "MD. Rezabuddulla Khondokar Mikkat",
  public_repos: 8,
  followers: 3,
  following: 7,
  html_url: "https://github.com/mikkat918",
};

test("public profile and public events work without a token and contribution graph is explicitly unavailable", async () => {
  const calls = [];
  const service = createGitHubInsightsService({
    username: "mikkat918",
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options });
      if (String(url).endsWith("/users/mikkat918")) return response(account);
      return response([{ id: 1, type: "PushEvent", created_at: "2026-01-02T10:00:00Z", repo: { name: "mikkat918/site" }, payload: { commits: [{}, {}] } }]);
    },
    now: () => Date.parse("2026-01-03T12:00:00Z"),
  });

  const result = await service.getInsights(2026);
  assert.equal(result.profile.username, "mikkat918");
  assert.equal(result.profile.publicRepositories, 8);
  assert.equal(result.events[0].description, "Pushed 2 commits");
  assert.equal(result.events[0].public, true);
  assert.equal(result.contributions.configured, false);
  assert.match(result.contributions.error, /GITHUB_TOKEN/);
  assert.equal(calls.length, 2);
  assert.ok(calls.every(({ options }) => !options.headers.Authorization));
});

test("authenticated contribution query returns actual calendar and derived day metrics without returning the token", async () => {
  const calls = [];
  const calendar = {
    totalContributions: 4,
    weeks: [{ contributionDays: [
      { date: "2025-12-28", weekday: 0, contributionCount: 0 },
      { date: "2025-12-29", weekday: 1, contributionCount: 0 },
      { date: "2025-12-30", weekday: 2, contributionCount: 0 },
      { date: "2025-12-31", weekday: 3, contributionCount: 0 },
      { date: "2026-01-01", weekday: 4, contributionCount: 1 },
      { date: "2026-01-02", weekday: 5, contributionCount: 0 },
      { date: "2026-01-03", weekday: 6, contributionCount: 3 },
    ] }],
  };
  const service = createGitHubInsightsService({
    username: "mikkat918",
    token: "test-secret-token",
    now: () => Date.parse("2026-01-03T12:00:00Z"),
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options });
      if (String(url).endsWith("/users/mikkat918")) return response(account);
      if (String(url).includes("events/public")) return response([]);
      assert.equal(options.headers.Authorization, "Bearer test-secret-token");
      assert.match(JSON.parse(options.body).query, /contributionCalendar/);
      return response({ data: { user: { contributionsCollection: { contributionCalendar: calendar } } } });
    },
  });

  const result = await service.getInsights(2026);
  assert.equal(result.contributions.configured, true);
  assert.equal(result.contributions.data.total, 4);
  assert.equal(result.contributions.data.currentStreak, 1);
  assert.equal(result.contributions.data.longestStreak, 1);
  assert.equal(result.contributions.data.recentContributions, 4);
  assert.equal(JSON.stringify(result).includes("test-secret-token"), false);
  assert.equal(calls.length, 3);
});

test("calendar metric helper calculates the best streak and leaves historic current streak unavailable", () => {
  const days = Array.from({ length: 7 }, (_, index) => ({
    date: `2024-01-0${index + 1}`,
    contributionCount: [2, 1, 0, 3, 2, 1, 0][index],
  }));
  const metrics = getCalendarMetrics({ totalContributions: 9, weeks: [{ contributionDays: days }] }, 2024, new Date("2026-01-01T00:00:00Z"));
  assert.equal(metrics.total, 9);
  assert.equal(metrics.longestStreak, 3);
  assert.equal(metrics.currentStreak, null);
  assert.equal(metrics.recentContributions, null);
});
