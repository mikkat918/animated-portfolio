import { createGitHubInsightsService } from "../server/github-insights.mjs";

const currentYear = () => new Date().getUTCFullYear();

export function createGitHubRequestHandler({
  environment = process.env,
  fetchImpl = globalThis.fetch,
  now = Date.now,
} = {}) {
  const username = environment.GITHUB_USERNAME || "mikkat918";
  const parsedTtl = Number(environment.GITHUB_CACHE_TTL_MS || 900_000);
  const insights = createGitHubInsightsService({
    username,
    token: environment.GITHUB_TOKEN || "",
    fetchImpl,
    cacheTtlMs: Math.min(86_400_000, Math.max(60_000, parsedTtl || 900_000)),
    now,
  });

  return async function handleGitHubRequest(request) {
    if (request.method !== "GET") {
      return Response.json(
        { error: "Method not allowed." },
        { status: 405, headers: { Allow: "GET", "Cache-Control": "no-store" } },
      );
    }

    const url = new URL(request.url);
    const year = Number(url.searchParams.get("year") || currentYear());
    if (!Number.isInteger(year) || year < 2011 || year > currentYear()) {
      return Response.json(
        { error: `Year must be between 2011 and ${currentYear()}.` },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    try {
      const body = await insights.getInsights(year);
      return Response.json(body, { headers: { "Cache-Control": "no-store" } });
    } catch {
      return Response.json(
        { error: "GitHub portfolio data is temporarily unavailable." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
  };
}

let handleRequest;

export default {
  fetch(request) {
    handleRequest ||= createGitHubRequestHandler();
    return handleRequest(request);
  },
};
