import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  createFallbackPreview,
  createGitHubProjectService,
} from "../server/github-projects.mjs";

const API = "https://api.test";

function response(body, { status = 200, headers = {} } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name.toLowerCase()] ?? null },
    json: async () => body,
  };
}

function repository({
  id = 1,
  name = "demo",
  owner = "mikkat918",
  private: isPrivate = false,
  archived = false,
  fork = false,
  description = "A demo repository",
  updated_at = "2026-01-01T00:00:00Z",
} = {}) {
  return {
    id,
    name,
    full_name: `${owner}/${name}`,
    owner: { login: owner },
    private: isPrivate,
    archived,
    fork,
    description,
    language: "JavaScript",
    topics: ["portfolio"],
    html_url: `https://github.com/${owner}/${name}`,
    homepage: "https://demo.example.com",
    default_branch: "main",
    created_at: "2025-01-01T00:00:00Z",
    updated_at,
  };
}

function successfulFetch(repositories, readme = "# Demo\nA useful project.") {
  return async (url) => {
    const parsed = new URL(url);
    if (parsed.pathname === "/users/mikkat918/repos") return response(repositories);
    if (parsed.pathname.endsWith("/readme")) {
      return response({ encoding: "base64", content: Buffer.from(readme).toString("base64") });
    }
    if (parsed.pathname.endsWith("/contents/portfolio-preview.png")) return response({}, { status: 404 });
    throw new Error(`Unexpected URL ${url}`);
  };
}

test("fetches all pages, deduplicates by stable repository id, and applies eligibility and overrides", async () => {
  const first = repository({ id: 42, name: "basa-vara" });
  const repos = [
    first,
    repository({ id: 7, name: "private", private: true }),
    repository({ id: 8, name: "fork", fork: true }),
    repository({ id: 9, name: "archived", archived: true }),
    repository({ id: 10, name: "portfolio" }),
  ];
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    const parsed = new URL(url);
    if (parsed.searchParams.get("page") === "1") {
      return response([first, repos[1]], {
        headers: { link: `<${API}/users/mikkat918/repos?type=owner&per_page=100&page=2>; rel="next"` },
      });
    }
    if (parsed.searchParams.get("page") === "2") return response([first, ...repos.slice(2)]);
    if (parsed.pathname.endsWith("/readme")) return response({ encoding: "base64", content: Buffer.from("# Basa Vara").toString("base64") });
    if (parsed.pathname.endsWith("/contents/portfolio-preview.png")) return response({}, { status: 404 });
    throw new Error(`Unexpected URL ${url}`);
  };
  const service = createGitHubProjectService({
    username: "mikkat918",
    apiBase: API,
    fetchImpl,
    overrides: {
      excludedRepoIds: ["10"],
      excludedRepoNames: ["portfolio"],
      featuredRepoIds: ["42"],
      overrides: { "42": { title: "Basa Vara — Featured", liveUrl: "https://basa.example.com" } },
    },
  });

  const result = await service.getProjects();
  assert.equal(calls.filter((url) => new URL(url).pathname === "/users/mikkat918/repos").length, 2);
  assert.deepEqual(result.projects.map((item) => item.id), ["42", "8"]);
  assert.equal(result.projects[0].slug, "basa-vara");
  assert.equal(result.projects[0].title, "Basa Vara — Featured");
  assert.equal(result.projects[0].featured, true);
  assert.equal(result.projects[0].liveUrl, "https://basa.example.com/");
  assert.equal(result.projects[0].repoUrl, "https://github.com/mikkat918/basa-vara");
  assert.equal(typeof result.projects[0].fallbackImage, "string");
  assert.match(result.projects[0].fallbackImage, /^data:image\/svg\+xml,/);
  assert.equal(typeof result.projects[0].images[0].url, "string");
  assert.equal(typeof result.projects[0].images[0].alt, "string");
  assert.equal(typeof result.projects[0].images[0].caption, "string");
  assert.equal(result.projects[0].description, "A demo repository");
  assert.match(result.projects[0].readmeSummary, /Basa Vara/);
});

test("uses an atomic completed snapshot and serves stale data after a later API failure", async () => {
  let clock = Date.parse("2026-01-01T00:00:00Z");
  let fail = false;
  let listCalls = 0;
  const fetchImpl = async (url) => {
    if (new URL(url).pathname === "/users/mikkat918/repos") listCalls += 1;
    if (fail) return response({}, { status: 503 });
    return successfulFetch([repository()])(url);
  };
  const service = createGitHubProjectService({
    username: "mikkat918",
    apiBase: API,
    fetchImpl,
    cacheTtlMs: 100,
    now: () => clock,
  });
  const initial = await service.getProjects();
  assert.equal(initial.projects.length, 1);
  clock += 101;
  fail = true;
  const stale = await service.getProjects();
  assert.equal(stale.projects.length, 1);
  assert.equal(stale.projects[0].id, "1");
  assert.equal(stale.stale, true);
  assert.match(stale.error, /last synchronized/);
  assert.equal((await service.getProjects()).projects.length, 1);
  assert.equal(listCalls, 2, "retry backoff avoids another GitHub request during the outage");
});

test("uses a README image only from a safe GitHub host and falls back when README URLs are unsafe", async () => {
  const readme = [
    "# Demo",
    "![safe](https://raw.githubusercontent.com/mikkat918/demo/main/screen.webp)",
    "![unsafe](https://evil.example/image.png)",
    "![script](javascript:alert(1))",
  ].join("\n");
  const service = createGitHubProjectService({
    username: "mikkat918",
    apiBase: API,
    fetchImpl: successfulFetch([repository()], readme),
  });
  const [{ projects }] = [await service.getProjects()];
  assert.equal(projects[0].previewImage, "https://raw.githubusercontent.com/mikkat918/demo/main/screen.webp");
  assert.deepEqual(projects[0].images.map(({ url }) => url), ["https://raw.githubusercontent.com/mikkat918/demo/main/screen.webp"]);
});

test("rejects unsafe README image links and provides a generated safe fallback", async () => {
  const readme = "![external](https://evil.example/image.png) ![script](javascript:alert(1))";
  const service = createGitHubProjectService({ username: "mikkat918", apiBase: API, fetchImpl: successfulFetch([repository()], readme) });
  const result = await service.getProjects();
  assert.match(result.projects[0].previewImage, /^data:image\/svg\+xml,/);
  assert.match(decodeURIComponent(result.projects[0].previewImage.split(",")[1]), /PROJECT PREVIEW/);

  const injected = decodeURIComponent(createFallbackPreview("<script>alert(1)</script>").split(",")[1]);
  assert.equal(injected.includes("<script>"), false);
});

test("loads and atomically persists only the last successful cache snapshot", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "github-projects-test-"));
  const cacheFile = path.join(directory, "projects.json");
  try {
    const service = createGitHubProjectService({ username: "mikkat918", apiBase: API, fetchImpl: successfulFetch([repository()]), cacheFile });
    const result = await service.getProjects();
    const saved = JSON.parse(await readFile(cacheFile, "utf8"));
    assert.equal(saved.projects[0].id, result.projects[0].id);
    assert.equal(saved.username, "mikkat918");

    const restored = createGitHubProjectService({ username: "mikkat918", apiBase: API, fetchImpl: async () => response({}, { status: 503 }), cacheFile, cacheTtlMs: 0 });
    const stale = await restored.getProjects();
    assert.equal(stale.projects[0].id, "1");
    assert.equal(stale.stale, true);

    const anotherAccount = createGitHubProjectService({ username: "someone-else", apiBase: API, fetchImpl: async () => response({}, { status: 503 }), cacheFile, cacheTtlMs: 0 });
    assert.deepEqual((await anotherAccount.getProjects()).projects, [], "a different configured account cannot read the old account cache");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("configuration changes invalidate persisted snapshots so title and exclusion overrides take effect", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "github-projects-config-test-"));
  const cacheFile = path.join(directory, "projects.json");
  try {
    const fetchImpl = successfulFetch([repository({ id: 95, name: "sample-project" })]);
    await createGitHubProjectService({ username: "mikkat918", apiBase: API, fetchImpl, cacheFile }).getProjects();
    let repoListRequests = 0;
    const refreshedFetch = async (url) => {
      if (new URL(url).pathname === "/users/mikkat918/repos") repoListRequests += 1;
      return successfulFetch([repository({ id: 95, name: "sample-project" })])(url);
    };
    const changed = await createGitHubProjectService({
      username: "mikkat918",
      apiBase: API,
      fetchImpl: refreshedFetch,
      cacheFile,
      overrides: { overrides: { "95": { title: "Updated title" } } },
    }).getProjects();
    assert.equal(changed.projects[0].title, "Updated title");
    assert.equal(repoListRequests, 1);

    const stale = await createGitHubProjectService({
      username: "mikkat918",
      apiBase: API,
      fetchImpl: async () => response({}, { status: 403, headers: { "x-ratelimit-remaining": "0", "retry-after": "30" } }),
      cacheFile,
      overrides: { overrides: { "95": { title: "Offline title" } } },
    }).getProjects();
    assert.equal(stale.stale, true);
    assert.equal(stale.projects[0].title, "Offline title");
    assert.equal(stale.projects[0].featured, false);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("prefers portfolio-preview.png to README images and deduplicates the gallery", async () => {
  const same = "https://raw.githubusercontent.com/mikkat918/demo/main/screen.webp";
  const fetchImpl = async (url) => {
    const parsed = new URL(url);
    if (parsed.pathname === "/users/mikkat918/repos") return response([repository()]);
    if (parsed.pathname.endsWith("/readme")) {
      const readme = `# Demo\n![first](${same})\n![duplicate](${same})`;
      return response({ encoding: "base64", size: readme.length, content: Buffer.from(readme).toString("base64") });
    }
    if (parsed.pathname.endsWith("/contents/portfolio-preview.png")) {
      return response({ type: "file", download_url: "https://raw.githubusercontent.com/mikkat918/demo/main/portfolio-preview.png" });
    }
    throw new Error(`Unexpected URL ${url}`);
  };
  const result = await createGitHubProjectService({ username: "mikkat918", apiBase: API, fetchImpl }).getProjects();
  const project = result.projects[0];
  assert.equal(project.previewImage, "https://raw.githubusercontent.com/mikkat918/demo/main/portfolio-preview.png");
  assert.equal(project.images[0].url, project.previewImage);
  assert.equal(project.images.filter(({ url }) => url === same).length, 1);
  assert.equal(project.description, "A demo repository");
  assert.match(project.readmeSummary, /Demo/);
  assert.deepEqual(project.languages, ["JavaScript"]);
});

test("concurrent getProjects calls share one in-flight repository snapshot", async () => {
  let requests = 0;
  let resolveList;
  const list = new Promise((resolve) => { resolveList = resolve; });
  const fetchImpl = async (url) => {
    const parsed = new URL(url);
    if (parsed.pathname === "/users/mikkat918/repos") {
      requests += 1;
      return list;
    }
    if (parsed.pathname.endsWith("/readme")) return response({ encoding: "base64", size: 0, content: "" });
    if (parsed.pathname.endsWith("/contents/portfolio-preview.png")) return response({}, { status: 404 });
    throw new Error(`Unexpected URL ${url}`);
  };
  const service = createGitHubProjectService({ username: "mikkat918", apiBase: API, fetchImpl });
  const one = service.getProjects();
  const two = service.getProjects();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(requests, 1);
  resolveList(response([repository()]));
  const [a, b] = await Promise.all([one, two]);
  assert.equal(a.projects[0].id, b.projects[0].id);
  assert.equal(requests, 1);
});

test("background reads return immediately while a cold snapshot syncs", async () => {
  let resolveList;
  const list = new Promise((resolve) => { resolveList = resolve; });
  const service = createGitHubProjectService({
    username: "mikkat918",
    apiBase: API,
    fetchImpl: async (url) => {
      const parsed = new URL(url);
      if (parsed.pathname === "/users/mikkat918/repos") return list;
      if (parsed.pathname.endsWith("/readme")) return response({ encoding: "base64", size: 0, content: "" });
      if (parsed.pathname.endsWith("/contents/portfolio-preview.png")) return response({}, { status: 404 });
      throw new Error(`Unexpected URL ${url}`);
    },
  });
  const startedAt = Date.now();
  const initial = await service.getProjects({ background: true });
  assert.equal(initial.stale, true);
  assert.deepEqual(initial.projects, []);
  assert.ok(Date.now() - startedAt < 100);
  resolveList(response([repository()]));
  for (let attempt = 0; attempt < 20 && service.getStatus().inFlight; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  assert.equal((await service.getProjects()).projects.length, 1);
});

test("request timeout remains active while the response body is being read", async () => {
  let aborted = false;
  const fetchImpl = async (_url, { signal }) => ({
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: () => new Promise((_, reject) => {
      signal.addEventListener("abort", () => {
        aborted = true;
        reject(new DOMException("Aborted", "AbortError"));
      }, { once: true });
    }),
  });
  const service = createGitHubProjectService({ username: "mikkat918", apiBase: API, fetchImpl, requestTimeoutMs: 5 });
  const result = await service.getProjects();
  assert.deepEqual(result.projects, []);
  assert.equal(result.stale, true);
  assert.equal(aborted, true);
});

test("a new eligible repository appears in the next complete snapshot, renames retain IDs, and deleted repos disappear", async () => {
  let page = [repository({ id: 81, name: "old-name" })];
  const fetchImpl = async (url) => {
    const parsed = new URL(url);
    if (parsed.pathname === "/users/mikkat918/repos") return response(page);
    if (parsed.pathname.endsWith("/readme")) return response({ encoding: "base64", size: 0, content: "" });
    if (parsed.pathname.endsWith("/contents/portfolio-preview.png")) return response({}, { status: 404 });
    throw new Error(`Unexpected URL ${url}`);
  };
  const service = createGitHubProjectService({ username: "mikkat918", apiBase: API, fetchImpl });
  assert.equal((await service.getProjects()).projects[0].slug, "old-name");
  page = [repository({ id: 81, name: "old-name" }), repository({ id: 82, name: "new-public-repository" })];
  const withNewRepository = await service.getProjects({ force: true });
  assert.equal(withNewRepository.projects.length, 2);
  assert.ok(withNewRepository.projects.some((project) => project.id === "82"));
  page = [repository({ id: 81, name: "new-name" })];
  const renamed = await service.getProjects({ force: true });
  assert.equal(renamed.projects.length, 1);
  assert.equal(renamed.projects[0].id, "81");
  assert.equal(renamed.projects[0].slug, "new-name");
  page = [];
  assert.deepEqual((await service.getProjects({ force: true })).projects, []);
});

test("403 and 429 rate-limit responses preserve and return the cached stale snapshot", async (t) => {
  for (const status of [403, 429]) {
    await t.test(`HTTP ${status}`, async () => {
      let time = Date.parse("2026-01-01T00:00:00Z");
      let failing = false;
      const fetchImpl = async (url) => {
        if (failing) return response({}, { status, headers: { "x-ratelimit-remaining": "0", "retry-after": "30" } });
        return successfulFetch([repository()])(url);
      };
      const service = createGitHubProjectService({ username: "mikkat918", apiBase: API, fetchImpl, cacheTtlMs: 10, now: () => time });
      assert.equal((await service.getProjects()).projects.length, 1);
      time += 11;
      failing = true;
      const result = await service.getProjects();
      assert.equal(result.stale, true);
      assert.equal(result.projects[0].id, "1");
      assert.match(result.error, /rate limit/i);
    });
  }
});
