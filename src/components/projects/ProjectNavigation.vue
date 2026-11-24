<script setup>
defineProps({ previous: { type: Object, default: null }, next: { type: Object, default: null } });
function routeFor(project) { return `/projects/${project.id || project.slug}`; }
</script>

<template>
  <nav class="project-navigation" aria-label="Project navigation">
    <RouterLink v-if="previous" :to="routeFor(previous)" class="neighbor"><span>← Previous</span><strong>{{ previous.title }}</strong></RouterLink>
    <RouterLink to="/projects" class="all-projects">All projects <span aria-hidden="true">↗</span></RouterLink>
    <RouterLink v-if="next" :to="routeFor(next)" class="neighbor next"><span>Next →</span><strong>{{ next.title }}</strong></RouterLink>
  </nav>
</template>

<style scoped>
.project-navigation { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 22px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.neighbor { display: grid; gap: 6px; min-width: 0; color: var(--muted); font-size: 11px; }
.neighbor span, .all-projects { color: var(--mint); font: 10px var(--mono); }
.neighbor strong { overflow: hidden; color: var(--text); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.next { text-align: right; }
.all-projects { flex: 0 0 auto; }
@media (max-width: 520px) { .project-navigation { flex-wrap: wrap; } .all-projects { order: 1; width: 100%; } }
</style>
