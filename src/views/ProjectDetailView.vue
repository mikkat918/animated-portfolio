<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { loadPortfolio, portfolioState } from "../api/client.js";
import { useReveal } from "../composables/useReveal";
import NotFoundView from "./NotFoundView.vue";
import ProjectHero from "../components/projects/ProjectHero.vue";
import ProjectOverview from "../components/projects/ProjectOverview.vue";
import ProjectScreenshotStack from "../components/projects/ProjectScreenshotStack.vue";
import ProjectNavigation from "../components/projects/ProjectNavigation.vue";

useReveal();
const route = useRoute();
const projects = computed(() => portfolioState.projects || []);
const project = computed(() => projects.value.find((item) =>
  item.id === route.params.slug || item.slug === route.params.slug));
const adjacent = computed(() => {
  const index = projects.value.findIndex((item) => item.id === project.value?.id);
  return {
    previous: index > 0 ? projects.value[index - 1] : null,
    next: index >= 0 && index < projects.value.length - 1 ? projects.value[index + 1] : null,
  };
});
</script>

<template>
  <main v-if="project" class="inner-page section-wrap detail-page">
    <RouterLink class="back-link" to="/projects"><span aria-hidden="true">←</span> Back to all projects</RouterLink>
    <ProjectHero :project="project" />
    <ProjectOverview :project="project" />
    <ProjectScreenshotStack :key="project.id || project.slug" :project="project" />
    <ProjectNavigation :previous="adjacent.previous" :next="adjacent.next" />
  </main>

  <NotFoundView v-else-if="portfolioState.loaded" />

  <main v-else-if="portfolioState.error" class="inner-page section-wrap detail-state" role="alert">
    <p class="eyebrow"><i></i> Project details unavailable</p>
    <h1>Couldn’t load<br /><em>this project.</em></h1>
    <p>There was a problem loading the project collection. Please try again.</p>
    <button class="button button-outline" type="button" @click="loadPortfolio({ force: true })">Try again <span aria-hidden="true">↻</span></button>
  </main>

  <main v-else class="inner-page section-wrap detail-state" role="status">
    <p class="eyebrow"><i></i> Loading project</p>
    <p>Preparing project details…</p>
  </main>
</template>

<style scoped>
.detail-page { padding-top: clamp(125px, 14vw, 190px); padding-bottom: clamp(65px, 9vw, 120px); }
.back-link { display: inline-flex; align-items: center; gap: 10px; margin-bottom: clamp(38px, 6vw, 72px); color: var(--muted); font: 10px var(--mono); }
.back-link span { color: var(--mint); transition: transform 180ms ease; }
.back-link:hover span { transform: translateX(-4px); }
.detail-state { min-height: 70vh; padding-top: 200px; color: var(--muted); }
.detail-state .eyebrow { display: flex; align-items: center; gap: 9px; color: var(--mint); font: 10px var(--mono); text-transform: uppercase; }
.detail-state .eyebrow i { width: 6px; height: 6px; border-radius: 50%; background: var(--mint); }
.detail-state h1 { font-size: clamp(48px, 8vw, 90px); text-transform: uppercase; }
@media (max-width: 700px) { .detail-page { padding-top: 120px; } .back-link { margin-bottom: 38px; } }
</style>
