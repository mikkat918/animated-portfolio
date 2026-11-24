const DEFAULT_API_BASE = "https://api.github.com";
const GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
const REST_API_VERSION = "2022-11-28";

function responseError(response) {
  return new Error(`GitHub request failed (${response.status}).`);
}

function asPublicProfile(user) {
  if (!user || typeof user !== "object") return null;
  return {
    username: String(user.login || ""),
    name: String(user.name || ""),
    bio: String(user.bio || ""),
    avatarUrl: typeof user.avatar_url === "string" ? user.avatar_url : "",
    profileUrl: typeof user.html_url === "string" ? user.html_url : "",
    publicRepositories: Number.isFinite(user.public_repos) ? user.public_repos : null,
    followers: Number.isFinite(user.followers) ? user.followers : null,
    following: Number.isFinite(user.following) ? user.following : null,
    location: String(user.location || ""),
  };
}

function describeEvent(event) {
  const payload = event.payload || {};
  switch (event.type) {
    case "PushEvent": {
      const count = Array.isArray(payload.commits) ? payload.commits.length : 0;
      return count ? `Pushed ${count} ${count === 1 ? "commit" : "commits"}` : "Pushed code";
    }
    case "CreateEvent":
      return payload.ref_type === "repository" ? "Created a repository" : `Created ${payload.ref_type || "a ref"}`;
    case "ReleaseEvent":
      return `${payload.action === "published" ? "Published" : "Updated"} a release`;
    case "PullRequestEvent":
      return `${String(payload.action || "Updated").replace(/^./, (letter) => letter.toUpperCase())} a pull request`;
    case "IssuesEvent":
      return `${String(payload.action || "Updated").replace(/^./, (letter) => letter.toUpperCase())} an issue`;
    case "WatchEvent":
      return "Starred a repository";
    case "ForkEvent":
      return "Forked a repository";
    default:
      return event.type?.replace(/Event$/, "").replace(/([a-z])([A-Z])/g, "$1 $2") || "Public activity";
  }
}

function asPublicEvent(event) {
  if (!event || typeof event !== "object" || !event.repo?.name || !event.created_at) return null;
  const repoName = String(event.repo.name);
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repoName)) return null;
  return {
    id: String(event.id || `${repoName}-${event.created_at}`),
    type: String(event.type || "PublicEvent"),
    description: describeEvent(event),
    repository: repoName,
    repositoryUrl: `https://github.com/${repoName.split("/").map(encodeURIComponent).join("/")}`,
    createdAt: String(event.created_at),
    public: true,
  };
}

function getCalendarMetrics(calendar, year, today = new Date()) {
  const days = (calendar?.weeks || [])
    .flatMap((week) => week.contributionDays || [])
    .filter((day) => typeof day.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day.date))
    .sort((a, b) => a.date.localeCompare(b.date));
  const annualDays = days.filter((day) => day.date.startsWith(`${year}-`));
  const counts = new Map(days.map((day) => [day.date, Number(day.contributionCount) || 0]));

  let longestStreak = 0;
  let run = 0;
  for (const day of annualDays) {
    if (Number(day.contributionCount) > 0) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 0;
    }
  }

  let currentStreak = null;
  if (year === today.getUTCFullYear()) {
    let cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    if (!(counts.get(cursor.toISOString().slice(0, 10)) > 0)) cursor.setUTCDate(cursor.getUTCDate() - 1);
    let streak = 0;
    while (counts.get(cursor.toISOString().slice(0, 10)) > 0) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    currentStreak = streak;
  }

  const recentStart = new Date(today);
  recentStart.setUTCDate(recentStart.getUTCDate() - 29);
  const recentContributions = days
    .filter((day) => day.date >= recentStart.toISOString().slice(0, 10) && day.date <= today.toISOString().slice(0, 10))
    .reduce((sum, day) => sum + (Number(day.contributionCount) || 0), 0);

  return {
    year,
    total: Number(calendar?.totalContributions) || 0,
    days,
    currentStreak,
    longestStreak,
    recentContributions: year === today.getUTCFullYear() ? recentContributions : null,
  };
}

export function createGitHubInsightsService({
  username,
  token = "",
  apiBase = DEFAULT_API_BASE,
  graphqlEndpoint = GRAPHQL_ENDPOINT,
  fetchImpl = globalThis.fetch,
  cacheTtlMs = 15 * 60_000,
  requestTimeoutMs = 8_000,
  now = Date.now,
} = {}) {
  if (!username || typeof username !== "string") throw new TypeError("A GitHub username is required.");
  if (typeof fetchImpl !== "function") throw new TypeError("A fetch implementation is required.");

  const base = String(apiBase).replace(/\/+$/, "");
  let overviewCache = null;
  let overviewPending;
  const contributionCache = new Map();
  const contributionPending = new Map();

  async function fetchJson(url, { body, headers = {} } = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
    try {
      const response = await fetchImpl(url, {
        method: body ? "POST" : "GET",
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": REST_API_VERSION,
          "User-Agent": "mikkat-portfolio-github-insights",
          ...headers,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: controller.signal,
        redirect: "error",
      });
      if (!response.ok) throw responseError(response);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async function getOverview() {
    if (overviewCache && overviewCache.expiresAt > now()) return { ...overviewCache.value, stale: false };
    if (overviewPending) return overviewPending;
    overviewPending = (async () => {
      const [userResult, eventsResult] = await Promise.allSettled([
        fetchJson(`${base}/users/${encodeURIComponent(username)}`),
        fetchJson(`${base}/users/${encodeURIComponent(username)}/events/public?per_page=30`),
      ]);
      const profile = userResult.status === "fulfilled" ? asPublicProfile(userResult.value) : null;
      const events = eventsResult.status === "fulfilled" && Array.isArray(eventsResult.value)
        ? eventsResult.value.map(asPublicEvent).filter(Boolean).slice(0, 30)
        : [];
      const errors = {
        profile: userResult.status === "rejected" ? "GitHub profile data is temporarily unavailable." : "",
        activity: eventsResult.status === "rejected" ? "Recent public activity is temporarily unavailable." : "",
      };
      const value = { username, profile, events, errors, syncedAt: new Date(now()).toISOString() };
      if (profile || events.length) overviewCache = { value, expiresAt: now() + cacheTtlMs };
      if (!profile && overviewCache) return { ...overviewCache.value, errors, stale: true };
      return { ...value, stale: false };
    })().finally(() => { overviewPending = undefined; });
    return overviewPending;
  }

  async function getContributions(year) {
    if (!token) {
      return { year, configured: false, data: null, error: "Add a server-side GITHUB_TOKEN to load contribution history. Public profile, repository, and activity data remain available without it." };
    }
    const cached = contributionCache.get(year);
    if (cached && cached.expiresAt > now()) return { ...cached.value, stale: false };
    if (contributionPending.has(year)) return contributionPending.get(year);
    const pending = (async () => {
      const from = `${year}-01-01T00:00:00Z`;
      const to = `${year}-12-31T23:59:59Z`;
      try {
        const result = await fetchJson(graphqlEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
          body: {
            query: `query PortfolioContributions($login: String!, $from: DateTime!, $to: DateTime!) { user(login: $login) { contributionsCollection(from: $from, to: $to) { contributionCalendar { totalContributions weeks { contributionDays { contributionCount date weekday } } } } } }`,
            variables: { login: username, from, to },
          },
        });
        const calendar = result?.data?.user?.contributionsCollection?.contributionCalendar;
        if (result?.errors?.length || !calendar) throw new Error("GitHub contribution data is unavailable.");
        const value = {
          year,
          configured: true,
          data: getCalendarMetrics(calendar, year, new Date(now())),
          error: "",
        };
        contributionCache.set(year, { value, expiresAt: now() + cacheTtlMs });
        return { ...value, stale: false };
      } catch {
        const stale = contributionCache.get(year);
        return stale
          ? { ...stale.value, stale: true, error: "Could not refresh GitHub data; showing the previous contribution snapshot." }
          : { year, configured: true, data: null, error: "GitHub contribution history could not be loaded. Check the token permissions and try again." };
      }
    })().finally(() => contributionPending.delete(year));
    contributionPending.set(year, pending);
    return pending;
  }

  return {
    async getInsights(year) {
      const [overview, contributions] = await Promise.all([getOverview(), getContributions(year)]);
      return { ...overview, contributions };
    },
  };
}

export { asPublicEvent, asPublicProfile, describeEvent, getCalendarMetrics };
