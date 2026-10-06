<script setup>
import { computed, ref } from "vue";
import ProjectCard from "../components/ProjectCard.vue";
import { loadPortfolio, portfolioState, refreshProjects } from "../api/client.js";
import { useReveal } from "../composables/useReveal";

useReveal();
const projects = computed(() => portfolioState.projects || []);
const query = ref("");
const technology = ref("");
const status = ref("");
const sortBy = ref("featured");
const refreshing = ref(false);
const refreshError = ref("");
const technologies = computed(() =>
  [...new Set(projects.value.flatMap((project) => [
    ...(Array.isArray(project.languages) ? project.languages : []),
    ...(project.language ? [project.language] : []),
  ]))].sort((a, b) => a.localeCompare(b)),
);
const statuses = computed(() =>
  [...new Set(projects.value.map((project) => project.status).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b)),
);
const filteredProjects = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase();
  const matches = projects.value.filter((project) => {
    const languages = [
      ...(Array.isArray(project.languages) ? project.languages : []),
      ...(project.language ? [project.language] : []),
    ];
    const text = [project.title, project.description, project.readmeSummary,
      ...languages, ...(project.topics || []), ...(project.tags || [])]
      .filter(Boolean).join(" ").toLocaleLowerCase();
    return (!needle || text.includes(needle)) &&
      (!technology.value || languages.includes(technology.value)) &&
      (!status.value || project.status === status.value);
  });
  return matches.sort((a, b) => {
    if (sortBy.value === "featured" && Boolean(a.featured) !== Boolean(b.featured))
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    const field = sortBy.value === "created" ? "createdAt" : "updatedAt";
    return new Date(b[field] || b.createdAt || 0) - new Date(a[field] || a.createdAt || 0);
  });
});
const hasFilters = computed(() => Boolean(query.value || technology.value || status.value || sortBy.value !== "featured"));
function clearFilters() {
  query.value = "";
  technology.value = "";
  status.value = "";
  sortBy.value = "featured";
}
async function refresh() {
  if (refreshing.value) return;
  refreshing.value = true;
  refreshError.value = "";
  try { await refreshProjects(); }
  catch (error) { refreshError.value = error?.message || "Could not refresh projects."; }
  finally { refreshing.value = false; }
}
</script>

<template>
  <main class="inner-page section-wrap projects-index">
    <header class="page-intro" data-reveal>
      <p class="eyebrow"><i></i> Selected work</p>
      <h1>Projects</h1>
      <p>Browse the projects, technologies, and ideas I’ve been working on.</p>
    </header>

    <section v-if="!portfolioState.loaded && !portfolioState.error" class="api-loading" aria-live="polite">
      <div class="loading-orb"><span></span></div>
      <p class="eyebrow"><i></i> Loading projects</p>
      <p>Preparing the project collection…</p>
    </section>
    <section v-else-if="portfolioState.error" class="api-loading" role="alert">
      <div class="state-icon">!</div>
      <p class="eyebrow"><i></i> Something went wrong</p>
      <h2>Projects couldn’t load.</h2>
      <p>There was a problem loading the project collection. Please try again.</p>
      <button class="button button-outline" type="button" @click="loadPortfolio({ force: true })">Try again <span aria-hidden="true">↻</span></button>
    </section>

    <template v-else>
      <div class="project-sync-row">
        <p>{{ portfolioState.projectSync?.syncing ? "Refreshing project data…" : "Projects are synced from GitHub." }}</p>
        <button class="filter-clear" type="button" :disabled="refreshing || portfolioState.projectSync?.syncing" @click="refresh">
          {{ refreshing || portfolioState.projectSync?.syncing ? "Refreshing…" : "Refresh projects" }}
        </button>
      </div>
      <p v-if="refreshError" class="project-sync-error" role="alert">{{ refreshError }}</p>
      <p v-else-if="portfolioState.projectSync?.error" class="project-sync-error" role="status">The latest sync could not complete. Showing the last available project data.</p>

      <form class="project-filters liquid-glass" role="search" aria-label="Filter projects" @submit.prevent>
        <label class="project-search"><span>Search projects</span><input v-model="query" type="search" placeholder="Name, description, or topic" /></label>
        <label><span>Technology</span><select v-model="technology"><option value="">All technologies</option><option v-for="item in technologies" :key="item" :value="item">{{ item }}</option></select></label>
        <label><span>Status</span><select v-model="status"><option value="">All statuses</option><option v-for="item in statuses" :key="item" :value="item">{{ item }}</option></select></label>
        <label><span>Sort by</span><select v-model="sortBy"><option value="featured">Featured</option><option value="updated">Recently updated</option><option value="created">Recently added</option></select></label>
        <button class="filter-clear" type="button" :disabled="!hasFilters" @click="clearFilters">Clear filters</button>
      </form>

      <p class="project-result-count" aria-live="polite">Showing {{ filteredProjects.length }} of {{ projects.length }} {{ projects.length === 1 ? "project" : "projects" }}</p>
      <div v-if="filteredProjects.length" class="projects-list">
        <ProjectCard v-for="project in filteredProjects" :key="project.id || project.slug" :project="project" />
      </div>
      <div v-else-if="projects.length" class="empty-projects glass-panel" aria-live="polite">
        <p>No projects match those filters. Try a different search or clear your filters.</p>
        <button class="filter-clear" type="button" @click="clearFilters">Clear filters</button>
      </div>
      <div v-else class="empty-projects glass-panel"><p>No projects are available yet. Please check back soon.</p></div>
    </template>
  </main>
</template>

<style scoped>
.projects-list {
  display: grid;
  gap: 18px;
}
.api-loading {
  padding-top: 205px;
  color: var(--muted);
  font-size: 11px;
}


.projects-index { min-height: 70vh; }
.projects-index .page-intro { margin-bottom: 42px; }
.projects-index .page-intro h1 { margin: 0; font-size: clamp(3.5rem, 9vw, 7rem); line-height: .95; letter-spacing: -.065em; }
.projects-index .page-intro > p:last-child { max-width: 620px; margin-top: 18px; line-height: 1.8; }
.projects-index .project-sync-row { margin-bottom: 12px; }
.projects-index .projects-list {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(14px, 1.6vw, 22px);
  margin-top: 20px;
}
.projects-index .api-loading { min-height: 42vh; }
.projects-index .project-filters {
  display: grid;
  grid-template-columns: minmax(220px, 2fr) repeat(3, minmax(125px, 1fr)) auto;
  align-items: end;
  gap: 12px;
  margin-bottom: 14px;
  padding: 16px;
  border-radius: 10px;
}
.projects-index .project-filters label { display: grid; gap: 7px; min-width: 0; }
.projects-index .project-filters label > span,
.projects-index .project-result-count,
.projects-index .project-sync-row,
.projects-index .project-sync-error {
  color: var(--faint);
  font: 12px var(--mono);
  letter-spacing: .035em;
}
.projects-index .project-filters input,
.projects-index .project-filters select {
  width: 100%;
  min-width: 0;
  height: 39px;
  padding: 0 11px;
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--text);
  background: rgba(8, 13, 32, .86);
  font: 11px "DM Sans", sans-serif;
}
.projects-index .project-filters input::placeholder { color: #8794ad; }
.projects-index .filter-clear {
  min-height: 39px;
  padding: 0 13px;
  border: 1px solid var(--line-strong);
  border-radius: 6px;
  color: var(--mint);
  background: rgba(255, 255, 255, .025);
  cursor: pointer;
  font-size: 10px;
  white-space: nowrap;
}
.projects-index .filter-clear:hover:not(:disabled) { border-color: var(--mint-soft); }
.projects-index .filter-clear:disabled { color: var(--faint); cursor: not-allowed; opacity: .62; }
.projects-index .project-result-count { margin: 0 0 14px; }
.projects-index .project-sync-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 0 14px; }
.projects-index .project-sync-row p,
.projects-index .project-sync-error { margin: 0; }
.projects-index .project-sync-error { margin: -7px 0 14px; color: #e7a9a0; }
.projects-index .projects-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(14px, 1.6vw, 22px); margin-top: 20px; }
.projects-index .projects-list :deep(.feature-project) { min-width: 0; min-height: 0; grid-template-columns: minmax(0, 1fr); }
.projects-index .projects-list :deep(.project-preview) { min-height: 0; aspect-ratio: 1.65; border-right: 0; border-bottom: 1px solid var(--line); }
.projects-index .projects-list :deep(.project-info) { justify-content: start; min-width: 0; padding: 23px; }
.projects-index .projects-list :deep(.project-info h3) { margin-top: 12px; }
.projects-index .projects-list :deep(.project-card-actions) { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 18px; }
.projects-index .projects-list :deep(.project-external-link) { color: var(--muted); font-size: 12px; }
.projects-index .projects-list :deep(.project-external-link:hover) { color: var(--mint); }
.projects-index .empty-projects { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 100px; padding: 20px 23px; border-radius: 10px; }
.projects-index .empty-projects p { margin: 0; color: var(--muted); font-size: 12px; }
.projects-index .project-sync-row .filter-clear { min-height: 34px; }
@media (max-width: 1024px) {
  .projects-index .projects-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .projects-index .project-filters { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .projects-index .project-search { grid-column: 1 / -1; }
}
@media (max-width: 640px) {
  .projects-index .projects-list { grid-template-columns: minmax(0, 1fr); }
  .projects-index .project-filters { grid-template-columns: 1fr; gap: 10px; }
  .projects-index .project-search { grid-column: auto; }
}
@media (max-width: 700px) { .projects-index .page-intro { margin-bottom: 28px; } }


.project-result-count, .project-sync-row { color: #a6afcc; }
.project-filters select, .project-filters input { color: #edf0ff; background: rgba(8,13,32,.86); }
.project-filters label > span { color: #a6afcc; }
.empty-projects { background: rgba(12,18,42,.78); }
.empty-projects { color: #edf0ff !important; border-color: rgba(196,181,253,.16) !important; background: linear-gradient(145deg,rgba(18,24,51,.78),rgba(8,13,31,.76)) !important; box-shadow: 0 20px 58px rgba(0,0,0,.24), inset 0 1px rgba(255,255,255,.07) !important; }
.detail-page .state-icon, .detail-page .loading-orb { color: #edf0ff !important; border-color: rgba(196,181,253,.17) !important; background: linear-gradient(145deg,rgba(18,24,51,.82),rgba(8,13,31,.82)) !important; box-shadow: 0 22px 58px rgba(0,0,0,.3), inset 0 1px rgba(255,255,255,.07) !important; }
</style>
