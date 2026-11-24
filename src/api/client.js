import { reactive } from "vue";

const emptyPortfolio = () => ({
  profile: null,
  principles: [],
  skills: [],
  projects: [],
  projectSync: { syncedAt: null, stale: false, error: false },
  experience: [],
  education: null,
  services: [],
});

export const portfolioState = reactive({
  ...emptyPortfolio(),
  loaded: false,
  error: null,
});

export const githubState = reactive({
  profile: null,
  events: [],
  contributions: null,
  contributionsByYear: {},
  year: null,
  loaded: false,
  loading: false,
  errors: { profile: "", activity: "", contributions: "" },
});

let pendingPortfolioRequest;
let projectSyncPollTimer;
const pendingGitHubRequests = new Map();

export async function loadPortfolio({ force = false } = {}) {
  if (!force && portfolioState.loaded) return portfolioState;
  if (!force && pendingPortfolioRequest) return pendingPortfolioRequest;

  pendingPortfolioRequest = fetch("/api/portfolio", {
    headers: { Accept: "application/json" },
  })
    .then(async (response) => {
      if (!response.ok)
        throw new Error(`Portfolio request failed (${response.status}).`);
      const result = await response.json();
      for (const key of Object.keys(emptyPortfolio())) {
        portfolioState[key] = result?.[key] ?? emptyPortfolio()[key];
      }
      portfolioState.error = null;
      portfolioState.loaded = true;
      clearTimeout(projectSyncPollTimer);
      if (portfolioState.projectSync?.syncing) {
        projectSyncPollTimer = setTimeout(() => {
          void loadPortfolio({ force: true });
        }, 1500);
      }
      return portfolioState;
    })
    .catch((error) => {
      portfolioState.error =
        error instanceof Error
          ? error.message
          : "Unable to load portfolio data.";
      portfolioState.loaded = false;
      return portfolioState;
    })
    .finally(() => {
      pendingPortfolioRequest = undefined;
    });

  return pendingPortfolioRequest;
}

export async function sendAssistantMessage(message, history = []) {
  const response = await fetch("/api/assistant", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, history }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      result.error || `Assistant request failed (${response.status}).`,
    );
  return result.reply;
}

export async function refreshProjects() {
  const response = await fetch("/api/projects/refresh", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: "{}",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || `Project refresh failed (${response.status}).`);
  }
  portfolioState.projects = result.projects || portfolioState.projects;
  portfolioState.projectSync = result.projectSync || portfolioState.projectSync;
  return portfolioState.projects;
}

export async function getApiHealth() {
  const response = await fetch("/api/health", {
    headers: { Accept: "application/json" },
  });
  if (!response.ok)
    throw new Error(`Health request failed (${response.status}).`);
  return response.json();
}

export async function loadGitHubInsights(year = new Date().getUTCFullYear(), { force = false } = {}) {
  if (githubState.contributionsByYear[year] && !force) {
    githubState.year = year;
    githubState.contributions = githubState.contributionsByYear[year];
    return githubState;
  }
  if (pendingGitHubRequests.has(year)) return pendingGitHubRequests.get(year);

  githubState.loading = true;
  const pending = fetch(`/api/github?year=${encodeURIComponent(year)}`, {
    headers: { Accept: "application/json" },
  })
    .then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `GitHub request failed (${response.status}).`);
      githubState.profile = result.profile || null;
      githubState.events = Array.isArray(result.events) ? result.events : [];
      githubState.contributions = result.contributions || null;
      githubState.contributionsByYear[year] = githubState.contributions;
      githubState.year = year;
      githubState.errors = {
        profile: result.errors?.profile || "",
        activity: result.errors?.activity || "",
        contributions: result.contributions?.error || "",
      };
      githubState.loaded = true;
      return githubState;
    })
    .catch((error) => {
      githubState.errors = {
        ...githubState.errors,
        profile: error instanceof Error ? error.message : "GitHub data is temporarily unavailable.",
      };
      githubState.loaded = false;
      return githubState;
    })
    .finally(() => {
      githubState.loading = false;
      pendingGitHubRequests.delete(year);
    });

  pendingGitHubRequests.set(year, pending);
  return pending;
}
