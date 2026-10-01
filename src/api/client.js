import { reactive } from "vue";

const emptyPortfolio = () => ({
  profile: null,
  principles: [],
  skills: [],
  projects: [],
  projectSync: { syncedAt: null, stale: false, error: false },
  experience: [],
  services: [],
});

export const portfolioState = reactive({
  ...emptyPortfolio(),
  loaded: false,
  error: null,
});

let pendingPortfolioRequest;
let projectSyncPollTimer;

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
