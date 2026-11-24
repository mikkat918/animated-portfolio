<script setup>
defineProps({ project: { type: Object, required: true } });
</script>

<template>
  <section class="project-overview" aria-labelledby="overview-title">
    <div><p class="eyebrow"><i></i> Project overview</p><h2 id="overview-title">Built around <em>the work.</em></h2></div>
    <div class="overview-copy">
      <p>{{ project.description || project.readmeSummary || "A public project repository." }}</p>
      <p v-if="project.readmeSummary && project.description && project.readmeSummary !== project.description">{{ project.readmeSummary }}</p>
      <p class="overview-note">The project details shown here come from its repository description, README, and detected repository metadata.</p>
    </div>
  </section>
</template>

<style scoped>
.project-overview { display: grid; grid-template-columns: .9fr 1fr; gap: 8%; padding: clamp(40px, 8vw, 100px) 0; border-top: 1px solid var(--line); }
h2 { margin: 20px 0 0; font-size: clamp(33px, 5vw, 62px); line-height: 1; text-transform: uppercase; }
.overview-copy p { color: var(--muted); font-size: 15px; line-height: 1.9; }
.overview-copy .overview-note { margin-top: 26px; color: var(--faint); font: 10px/1.8 var(--mono); }
@media (max-width: 700px) { .project-overview { grid-template-columns: 1fr; gap: 24px; } }
</style>
