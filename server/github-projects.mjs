import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_API_BASE = "https://api.github.com";
const PAGE_SIZE = 100;
const MAX_PAGES = 100;
const MAX_APPROVED_REPOSITORIES = 20;
const MAX_README_ENRICHMENTS = 4;
const MAX_README_BYTES = 48 * 1024;
const MAX_README_IMAGES = 5;
const PREVIEW_FILENAME = "portfolio-preview.png";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function encodeSvg(value) {
  return `data:image/svg+xml,${encodeURIComponent(value)}`;
}

export function createFallbackPreview(title, language = "") {
  const safeTitle = escapeHtml(String(title || "Project").slice(0, 48));
  const safeLanguage = escapeHtml(String(language || "Portfolio project").slice(0, 32));
  return encodeSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#20302c"/><stop offset="1" stop-color="#111817"/></linearGradient></defs><rect width="960" height="600" fill="url(#g)"/><rect x="42" y="42" width="876" height="516" rx="28" fill="#ffffff" fill-opacity=".035" stroke="#b5d8cb" stroke-opacity=".24"/><circle cx="80" cy="82" r="7" fill="#b5d8cb"/><circle cx="106" cy="82" r="7" fill="#b5d8cb" fill-opacity=".55"/><circle cx="132" cy="82" r="7" fill="#b5d8cb" fill-opacity=".3"/><path d="M80 132h800" stroke="#b5d8cb" stroke-opacity=".16"/><text x="80" y="330" fill="#edf3ef" font-family="Arial,sans-serif" font-size="52" font-weight="600">${safeTitle}</text><text x="82" y="386" fill="#b5d8cb" font-family="Arial,sans-serif" font-size="23">${safeLanguage}</text><text x="82" y="510" fill="#a6b6af" font-family="monospace" font-size="16" letter-spacing="3">PROJECT PREVIEW</text></svg>`,
  );
}

function safeWebUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return "";
    return url.href;
  } catch {
    return "";
  }
}

function safeImageUrl(value, repo) {
  if (typeof value !== "string" || !value.trim()) return "";
  let url;
  try {
    if (/^(?:javascript|data|vbscript):/i.test(value.trim())) return "";
    if (value.startsWith("//")) return "";
    if (/^https:\/\//i.test(value)) {
      url = new URL(value);
      if (url.protocol !== "https:") return "";
    } else {
      const decoded = decodeURIComponent(value);
      if (decoded.includes("\\") || decoded.split("/").some((part) => part === ".." || part === ".")) return "";
      const clean = value.replace(/^\.\//, "");
      if (clean.startsWith("/") || !clean || clean.length > 300) return "";
      url = new URL(
        `${encodeURIComponent(repo.default_branch || "main")}/${clean
          .split("/")
          .map((part) => encodeURIComponent(decodeURIComponent(part)))
          .join("/")}`,
        `https://raw.githubusercontent.com/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/`,
      );
    }
  } catch {
    return "";
  }
  const host = url.hostname.toLowerCase();
  if (
    host !== "raw.githubusercontent.com" &&
    host !== "user-images.githubusercontent.com" &&
    !host.endsWith(".githubusercontent.com")
  ) return "";
  return url.href;
}

export function extractReadmeImages(markdown, repo) {
  if (typeof markdown !== "string") return [];
  const images = [];
  const patterns = [ /!\[([^\]]*)\]\(\s*(?:<([^>]+)>|([^\s)]+))[^)]*\)/g, /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi ];
  for (const pattern of patterns) {
    for (const match of markdown.matchAll(pattern)) {
      const candidate = pattern === patterns[0] ? (match[2] || match[3]) : match[1];
      const normalized = safeImageUrl(candidate, repo);
      if (normalized && !images.some((image) => image.url === normalized)) {
        images.push({ url: normalized, alt: (pattern === patterns[0] ? match[1] : "") || "Project preview" });
      }
      if (images.length >= MAX_README_IMAGES) return images;
    }
  }
  return images;
}

function summarizeReadme(markdown) {
  if (typeof markdown !== "string") return "";
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~>#|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 240);
}

function parseLinkHeader(header) {
  if (!header) return "";
  for (const part of header.split(",")) {
    const match = part.match(/<([^>]+)>\s*;\s*rel="?([^";]+)"?/i);
    if (match && match[2].split(/\s+/).includes("next")) return match[1];
  }
  return "";
}

function normalizeOverrides(value) {
  return value && typeof value === "object" ? value : {};
}

function repoOverrides(config, repo) {
  const table = normalizeOverrides(config.overrides);
  return table[String(repo.id)] || table[repo.full_name] || table[repo.name] || {};
}

function applyCachedConfiguration(projects, config) {
  const excludedIds = new Set((config.excludedRepoIds || []).map(String));
  const excludedNames = new Set((config.excludedRepoNames || []).map((name) => String(name).toLowerCase()));
  const featuredIds = new Set((config.featuredRepoIds || []).map(String));
  return projects
    .filter((project) => !excludedIds.has(String(project.id)) && !excludedNames.has(String(project.name || "").toLowerCase()))
    .map((project) => {
      const repoUrl = safeWebUrl(project.repoUrl || project.github);
      const fullName = repoUrl ? new URL(repoUrl).pathname.split("/").filter(Boolean).slice(0, 2).join("/") : "";
      const table = normalizeOverrides(config.overrides);
      const repoOverride = table[String(project.id)] || table[fullName] || table[project.name] || {};
      return {
        ...project,
        title: String(repoOverride.title || project.title || project.name || "Project").slice(0, 120),
        description: String(repoOverride.description || project.description || "").trim().slice(0, 500),
        status: String(repoOverride.status || project.status || "Repository available").slice(0, 80),
        featured: Boolean(repoOverride.featured ?? (config.featuredRepoIds ? featuredIds.has(String(project.id)) : project.featured)),
      };
    });
}

function buildGallery(selected, readmeImages, title, fallbackImage) {
  const gallery = [];
  const add = (url, alt) => {
    if (url && !gallery.some((image) => image.url === url)) {
      gallery.push({ url, alt: alt || `${title} project preview`, caption: `${title} project preview` });
    }
  };
  add(selected, `${title} project preview`);
  for (const image of readmeImages) add(image.url, image.alt);
  if (!gallery.length) add(fallbackImage, `${title} generated preview`);
  return gallery;
}

function normalizeRepo(repo, config, readme = "", dedicatedPreview = "") {
  const overrides = repoOverrides(config, repo);
  const title = String(overrides.title || repo.name || "Project").slice(0, 120);
  const description = String(overrides.description || repo.description || "").trim().slice(0, 500);
  const readmeSummary = summarizeReadme(readme);
  const topics = Array.isArray(repo.topics)
    ? repo.topics.filter((topic) => typeof topic === "string").slice(0, 20)
    : [];
  const readmeImages = extractReadmeImages(readme, repo);
  const customImage = safeImageUrl(overrides.previewImage, repo);
  const language = typeof repo.language === "string" ? repo.language : "";
  const fallbackImage = createFallbackPreview(title, language);
  const selectedPreview = customImage || dedicatedPreview || readmeImages[0]?.url || fallbackImage;
  const liveUrl = safeWebUrl(overrides.liveUrl || repo.homepage);
  const id = String(repo.id);
  const featuredIds = new Set((config.featuredRepoIds || []).map(String));
  const featured = Boolean(overrides.featured ?? featuredIds.has(id));
  return {
    id,
    repoId: id,
    slug: String(repo.name || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || id,
    title,
    name: repo.name,
    description,
    readmeSummary,
    language,
    languages: language ? [language] : [],
    tags: [...new Set([...(language ? [language] : []), ...topics])].slice(0, 12),
    topics,
    status: String(overrides.status || "Repository available").slice(0, 80),
    repoUrl: safeWebUrl(repo.html_url),
    github: safeWebUrl(repo.html_url),
    live: liveUrl,
    liveUrl,
    createdAt: repo.created_at || "",
    updatedAt: repo.updated_at || "",
    featured,
    previewImage: selectedPreview,
    fallbackImage,
    images: buildGallery(customImage || dedicatedPreview || readmeImages[0]?.url, readmeImages, title, fallbackImage),
    fork: Boolean(repo.fork),
  };
}

function excluded(repo, config) {
  const ids = new Set((config.excludedRepoIds || []).map(String));
  const names = new Set((config.excludedRepoNames || []).map((name) => String(name).toLowerCase()));
  return ids.has(String(repo.id)) || names.has(String(repo.name || "").toLowerCase());
}

function eligible(repo, config, username) {
  if (!repo || repo.private !== false || repo.archived && !config.includeArchived || repo.fork && config.includeForks === false || excluded(repo, config)) return false;
  if (repo.owner?.login?.toLowerCase() !== username.toLowerCase()) return false;
  return true;
}

function isRateLimited(response) {
  return response.status === 429 || response.status === 403 && Number(response.headers?.get?.("x-ratelimit-remaining")) === 0;
}

function retryDelay(response) {
  const retryAfter = Number(response.headers?.get?.("retry-after"));
  const reset = Number(response.headers?.get?.("x-ratelimit-reset"));
  if (retryAfter > 0) return Math.min(retryAfter, 3600);
  if (reset > 0) return Math.max(1, Math.min(reset - Math.floor(Date.now() / 1000), 3600));
  return 60;
}

export function createGitHubProjectService({
  username,
  overrides = {},
  apiBase = DEFAULT_API_BASE,
  fetchImpl = globalThis.fetch,
  cacheTtlMs = 15 * 60_000,
  requestTimeoutMs = 8_000,
  cacheFile = "",
  now = Date.now,
}) {
  if (!username || typeof username !== "string") throw new TypeError("A GitHub username is required.");
  if (typeof fetchImpl !== "function") throw new TypeError("A fetch implementation is required.");
  const config = { ...overrides };
  const configSignature = JSON.stringify(config);
  const base = String(apiBase).replace(/\/+$/, "");
  let cache = null;
  let inFlight = null;
  let lastError = "";
  let retryAt = 0;
  let failureBackoffMs = 15_000;
  let diskLoaded = false;

  async function loadDiskCache() {
    if (diskLoaded) return;
    diskLoaded = true;
    if (!cacheFile) return;
    try {
      const saved = JSON.parse(await readFile(cacheFile, "utf8"));
      if (saved.username?.toLowerCase() === username.toLowerCase() && Array.isArray(saved.projects) && typeof saved.syncedAt === "string" && Number.isFinite(Date.parse(saved.syncedAt))) {
        cache = {
          projects: applyCachedConfiguration(saved.projects, config),
          syncedAt: saved.syncedAt,
          configSignature: saved.configSignature || "",
        };
      }
    } catch {
      // Persistence is best-effort; a missing or invalid cache never blocks live sync.
    }
  }

  async function persistCache(snapshot) {
    if (!cacheFile) return;
    const target = path.resolve(cacheFile);
    const temporary = `${target}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
    try {
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(temporary, JSON.stringify(snapshot), { encoding: "utf8", mode: 0o600 });
      await rename(temporary, target);
    } catch {
      // Disk persistence is optional; retain the in-memory snapshot.
      try { await import("node:fs/promises").then(({ unlink }) => unlink(temporary)); } catch { /* best-effort cleanup */ }
    }
  }

  async function request(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
    try {
      const response = await fetchImpl(url, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "portfolio-github-project-sync",
        },
        signal: controller.signal,
        redirect: "error",
      });
      return {
        response,
        readJson: () => response.json(),
        close: () => clearTimeout(timeout),
      };
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  async function jsonRequest(url) {
    const pending = await request(url);
    try {
      const { response } = pending;
      if (!response.ok) {
        if (isRateLimited(response)) retryAt = now() + retryDelay(response) * 1000;
        const error = new Error(isRateLimited(response) ? "GitHub rate limit reached." : `GitHub request failed (${response.status}).`);
        error.status = response.status;
        throw error;
      }
      return { response, body: await pending.readJson() };
    } finally {
      pending.close();
    }
  }

  async function fetchAllRepositories() {
    let next = `${base}/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&direction=desc&per_page=${PAGE_SIZE}&page=1`;
    const repos = [];
    const seenPages = new Set();
    for (let page = 0; next && page < MAX_PAGES; page += 1) {
      const current = new URL(next).href;
      if (seenPages.has(current)) throw new Error("GitHub pagination loop detected.");
      seenPages.add(current);
      const { response, body } = await jsonRequest(current);
      if (!Array.isArray(body)) throw new Error("GitHub returned an invalid repository list.");
      repos.push(...body);
      next = parseLinkHeader(response.headers?.get?.("link"));
      if (next && new URL(next).origin !== new URL(base).origin) throw new Error("GitHub returned an unsafe pagination URL.");
    }
    if (next) throw new Error("GitHub repository pagination exceeded the safety limit.");
    return repos;
  }

  async function fetchApprovedRepositories() {
    const names = Array.isArray(config.approvedRepositories) ? config.approvedRepositories.slice(0, MAX_APPROVED_REPOSITORIES) : [];
    const repos = [];
    for (const fullName of names) {
      if (typeof fullName !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(fullName)) continue;
      try {
        const { body } = await jsonRequest(`${base}/repos/${fullName.split("/").map(encodeURIComponent).join("/")}`);
        if (body.private === false && (!body.archived || config.includeArchived) && !(body.fork && config.includeForks === false) && !excluded(body, config)) repos.push(body);
      } catch (error) {
        if (error.status === 403 || error.status === 429) throw error;
      }
    }
    return repos;
  }

  async function fetchReadme(repo) {
    const { body } = await jsonRequest(`${base}/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/readme`);
    if (body.size > MAX_README_BYTES || body.encoding !== "base64" || typeof body.content !== "string") return "";
    const buffer = Buffer.from(body.content.replace(/\s/g, ""), "base64");
    if (buffer.length > MAX_README_BYTES) return "";
    return buffer.toString("utf8");
  }

  async function fetchPreviewAsset(repo) {
    const pending = await request(`${base}/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/contents/${PREVIEW_FILENAME}`);
    try {
      const { response } = pending;
      if (response.status === 404) return "";
      if (!response.ok) {
        if (isRateLimited(response)) {
          retryAt = now() + retryDelay(response) * 1000;
          throw new Error("GitHub rate limit reached.");
        }
        return "";
      }
      const body = await pending.readJson();
      const download = safeImageUrl(body.download_url, repo);
      return body.type === "file" ? download : "";
    } finally {
      pending.close();
    }
  }

  async function buildSnapshot() {
    const own = await fetchAllRepositories();
    const approved = await fetchApprovedRepositories();
    const byId = new Map();
    for (const repo of [...own, ...approved]) {
      const approvedExternal = Array.isArray(config.approvedRepositories) && config.approvedRepositories.some((name) => String(name).toLowerCase() === String(repo.full_name).toLowerCase());
      if (eligible(repo, config, username) || approvedExternal && repo.private === false && (!repo.archived || config.includeArchived) && !excluded(repo, config)) byId.set(String(repo.id), repo);
    }
    let repos = [...byId.values()];
    if (config.sort === "created") repos.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    else if (config.sort === "featured") repos.sort((a, b) => Number((config.featuredRepoIds || []).map(String).includes(String(b.id))) - Number((config.featuredRepoIds || []).map(String).includes(String(a.id))) || String(b.updated_at).localeCompare(String(a.updated_at)));
    else repos.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));

    const readmes = new Map();
    for (const repo of repos.slice(0, MAX_README_ENRICHMENTS)) {
      try {
        readmes.set(String(repo.id), await fetchReadme(repo));
      } catch (error) {
        if (/rate limit/i.test(error.message)) break;
      }
    }
    const dedicatedPreviews = new Map();
    for (const repo of repos.slice(0, MAX_README_ENRICHMENTS)) {
      try {
        const image = await fetchPreviewAsset(repo);
        if (image) dedicatedPreviews.set(String(repo.id), image);
      } catch (error) {
        if (/rate limit/i.test(error.message)) break;
      }
    }
    const projects = repos.map((repo) => normalizeRepo(
      repo,
      config,
      readmes.get(String(repo.id)) || "",
      dedicatedPreviews.get(String(repo.id)) || "",
    ));
    return projects;
  }

  async function refresh() {
    if (inFlight) return inFlight;
    if (retryAt > now()) throw new Error(`GitHub rate limit retry in ${Math.ceil((retryAt - now()) / 1000)} seconds.`);
    inFlight = (async () => {
      try {
        const projects = await buildSnapshot();
      const snapshot = { username, configSignature, projects, syncedAt: new Date(now()).toISOString() };
        cache = snapshot;
        lastError = "";
        retryAt = 0;
        failureBackoffMs = 15_000;
        await persistCache(snapshot);
        return { ...snapshot, stale: false };
      } catch (error) {
        lastError = error?.message === "GitHub rate limit reached." || /^GitHub rate limit retry/.test(error?.message || "")
          ? "GitHub rate limit reached; showing the last synchronized project list."
          : "GitHub could not be reached; showing the last synchronized project list.";
        if (retryAt <= now()) {
          retryAt = now() + failureBackoffMs;
          failureBackoffMs = Math.min(failureBackoffMs * 2, 5 * 60_000);
        }
        throw error;
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  }

  async function getProjects({ force = false, background = false } = {}) {
    await loadDiskCache();
    const fresh = cache && cache.configSignature === configSignature && now() - Date.parse(cache.syncedAt) < cacheTtlMs;
    if (!force && fresh) return { ...cache, stale: false };
    if (background) {
      void refresh().catch(() => {});
      return {
        projects: cache?.projects || [],
        syncedAt: cache?.syncedAt || null,
        stale: true,
        ...(cache && lastError ? { error: lastError } : {}),
      };
    }
    try {
      return await refresh();
    } catch {
      return {
        projects: cache?.projects || [],
        syncedAt: cache?.syncedAt || null,
        stale: true,
        ...(lastError ? { error: lastError } : {}),
      };
    }
  }

  function getStatus() {
    return {
      syncedAt: cache?.syncedAt || null,
      stale: !cache || now() - Date.parse(cache.syncedAt) >= cacheTtlMs,
      inFlight: Boolean(inFlight),
      error: lastError || undefined,
      retryAt: retryAt || undefined,
    };
  }

  return { getProjects, refresh, getStatus };
}
