<script setup>
import { computed, ref } from "vue";
import ProjectCard from "../components/ProjectCard.vue";
import { portfolioState, refreshProjects } from "../api/client.js";
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
    const projectLanguages = [
      ...(Array.isArray(project.languages) ? project.languages : []),
      ...(project.language ? [project.language] : []),
    ];
    const searchText = [
      project.title,
      project.description,
      project.readmeSummary,
      ...projectLanguages,
      ...(project.topics || []),
      ...(project.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    return (
      (!needle || searchText.includes(needle)) &&
      (!technology.value || projectLanguages.includes(technology.value)) &&
      (!status.value || project.status === status.value)
    );
  });
  return matches.sort((a, b) => {
    if (sortBy.value === "featured" && Boolean(a.featured) !== Boolean(b.featured)) {
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    }
    const field = sortBy.value === "created" ? "createdAt" : "updatedAt";
    return new Date(b[field] || b.createdAt || 0) - new Date(a[field] || a.createdAt || 0);
  });
});
const hasFilters = computed(
  () =>
    Boolean(
      query.value ||
        technology.value ||
        status.value ||
        sortBy.value !== "featured",
    ),
);
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
  try {
    await refreshProjects();
  } catch (error) {
    refreshError.value = error?.message || "Could not refresh projects.";
  } finally {
    refreshing.value = false;
  }
}
</script>

<template>
  <main class="inner-page section-wrap">
    <div class="page-intro" data-reveal>
      <p class="eyebrow"><i></i>03 — Selected work</p>
      <h1>Projects, made<br /><em>with intention.</em></h1>
      <p>Explore the work by name, technology, or status.</p>
    </div>
    <form class="project-filters glass-panel" role="search" @submit.prevent>
      <label class="project-search">
        <span>Search projects</span>
        <input
          v-model="query"
          type="search"
          placeholder="Search name, description, or topic"
        />
      </label>
      <label>
        <span>Technology</span>
        <select v-model="technology">
          <option value="">All technologies</option>
          <option v-for="item in technologies" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </label>
      <label>
        <span>Status</span>
        <select v-model="status">
          <option value="">All statuses</option>
          <option v-for="item in statuses" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </label>
      <label>
        <span>Sort by</span>
        <select v-model="sortBy">
          <option value="featured">Featured first</option>
          <option value="updated">Recently updated</option>
          <option value="created">Recently created</option>
        </select>
      </label>
      <button class="filter-clear" type="button" :disabled="!hasFilters" @click="clearFilters">
        Clear filters
      </button>
    </form>
    <div class="project-sync-row">
      <p v-if="portfolioState.projectSync?.syncedAt">
        Synced {{ portfolioState.projectSync.syncedAt }}
        <span v-if="portfolioState.projectSync.stale">· Showing saved project data</span>
      </p>
      <p v-else>Project list can be refreshed from the connected source.</p>
      <button class="filter-clear" type="button" :disabled="refreshing" @click="refresh">
        {{ refreshing ? "Refreshing…" : "Refresh projects" }}
      </button>
    </div>
    <p v-if="refreshError || portfolioState.projectSync?.error" class="project-sync-error" role="status">
      {{ refreshError || portfolioState.projectSync.error }}
    </p>
    <p class="project-result-count" aria-live="polite">
      {{ filteredProjects.length }}
      {{ filteredProjects.length === 1 ? "project" : "projects" }} shown
      <span v-if="projects.length">of {{ projects.length }}</span>
    </p>
    <div v-if="filteredProjects.length" class="projects-list">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id || project.slug"
        :project="project"
        data-reveal
      />
    </div>
    <div v-else-if="hasFilters" class="empty-projects glass-panel" data-reveal>
      <p>No projects match those filters.</p>
      <button class="button button-outline" type="button" @click="clearFilters">
        Clear filters
      </button>
    </div>
    <div v-else class="empty-projects glass-panel" data-reveal>
      <p>No public projects are available yet.</p>
    </div>
    <div class="page-endnote glass-panel" data-reveal>
      <span>HAVE SOMETHING IN MIND?</span
      ><RouterLink to="/#contact"
        >Start a conversation <span>→</span></RouterLink
      >
    </div>
  </main>
</template>
