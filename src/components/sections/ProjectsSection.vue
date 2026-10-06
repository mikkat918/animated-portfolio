<script setup>
import { computed } from "vue";
import ProjectCard from "../ProjectCard.vue";
import { portfolioState } from "../../api/client.js";
const projects = computed(() => portfolioState.projects || []);
const selectedProjects = computed(() =>
  [...projects.value]
    .sort((a, b) => {
      if (Boolean(a.featured) !== Boolean(b.featured)) {
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      }
      return (
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
      );
    })
    .slice(0, 3),
);
</script>

<template>
<section id="work" class="section section-wrap work-section">
      <div class="section-heading" data-reveal>
        <div>
          <p class="eyebrow">
            <i></i>
            03 — Selected work
          </p>

          <h2>
            Selected projects.<br />
            <em>Room to grow.</em>
          </h2>
        </div>

        <RouterLink
          class="all-projects"
          to="/projects"
        >
          All projects
          <span>→</span>
        </RouterLink>
      </div>

      <div
        v-if="selectedProjects.length"
        class="home-project-grid"
      >
        <ProjectCard
          v-for="project in selectedProjects"
          :key="project.id || project.slug"
          :project="project"
          data-reveal
        />
      </div>

      <div
        v-else
        class="empty-projects glass-panel"
        data-reveal
      >
        <p>No public projects are available yet.</p>
      </div>
    </section>
</template>

<style scoped>
.eyebrow {
  color: var(--mint);
  font: 9px var(--mono);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.section-heading {
  display: grid;
  grid-template-columns: 1.2fr 0.7fr;
  align-items: end;
  gap: 7%;
  margin-bottom: 43px;
}
.section-intro .eyebrow, .section-heading .eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 19px;
}
.eyebrow i {
  display: inline-block;
  width: 22px;
  height: 1px;
  background: var(--mint-soft);
}
.section-heading h2 {
  margin: 0;
  font-size: clamp(38px, 4.6vw, 58px);
  line-height: 1.08;
}
.work-section {
  padding-top: 72px;
}
.section-heading {
  grid-template-columns: 1fr auto;
}
.section-heading h2 {
  font-size: clamp(39px, 4.8vw, 61px);
}
.all-projects {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--mint);
  font-size: 10px;
  font-weight: 600;
}
.all-projects {
  margin-bottom: 7px;
}
.all-projects span {
  font-size: 15px;
  transition: transform 200ms;
}
.all-projects:hover span {
  transform: translateX(4px);
}
.project-info-meta .eyebrow {
  margin: 0;
  font-size: 7px;
}
.contact-main .eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 17px;
}
.contact-main > p:not(.eyebrow) {
  max-width: 455px;
  margin: 18px 0 20px;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.75;
}
.page-intro .eyebrow, .detail-heading .eyebrow {
  margin: 0 0 18px;
}
.not-found > p:not(.eyebrow) {
  max-width: 465px;
  margin: 17px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
}
.detail-heading .eyebrow span {
  padding-inline: 6px;
  color: var(--faint);
}
.detail-content section > p:not(.eyebrow) {
  margin: 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.85;
}
.detail-content .eyebrow {
  margin: 0 0 12px;
  font-size: 8px;
}
.not-found .eyebrow {
  margin: 0 0 18px;
}
.assistant-panel .eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 6px;
  font-size: 7px;
}
@media (max-width: 720px) {
  .section-heading {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-bottom: 29px;
  }
  .section-heading h2 {
    font-size: clamp(38px, 9vw, 51px);
  }
  .work-section {
    padding-top: 64px;
  }
  .section-heading {
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 10px;
  }
  .section-heading .all-projects {
    margin-bottom: 5px;
    white-space: nowrap;
  }
}
@media (max-width: 420px) {
  .section-heading {
    grid-template-columns: 1fr;
  }
  .section-heading .all-projects {
    justify-self: start;
  }
}

.section {
  padding-block: clamp(90px, 10vw, 160px);
}
.eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 20px;

  color: var(--accent);

  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.section h2 em {
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 400;
  font-style: italic;
  color: var(--accent);
  letter-spacing: -0.045em;
}
.section-heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.7fr);
  align-items: end;
  gap: 50px;
}
.eyebrow i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.section h2 {
  margin: 0;
  font-size: clamp(42px, 5vw, 82px);
  font-weight: 500;
  line-height: 0.95;
  letter-spacing: -0.055em;
}
.work-section {
  position: relative;
}
.all-projects {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  justify-self: end;
  padding: 12px 17px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 8px 25px rgba(15, 23, 42, 0.04);
  font-size: 11px;
  font-weight: 700;
  transition:
    transform 0.3s ease,
    color 0.3s ease,
    box-shadow 0.3s ease;
}
.all-projects:hover {
  color: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
}
.all-projects span {
  transition: transform 0.3s ease;
}
.all-projects:hover span {
  transform: translateX(4px);
}
.home-project-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 25px;
  margin-top: 70px;
}
.home-project-grid :deep(.feature-project) {
  min-width: 0;
  grid-template-columns: 1fr;
}
.home-project-grid :deep(.project-preview) {
  min-height: 0;
  aspect-ratio: 1.65;
  border-bottom: 1px solid var(--line);
}
.home-project-grid :deep(.project-info) {
  min-width: 0;
  padding: 23px;
}
.home-project-grid :deep(.project-info h3) {
  margin-top: 12px;
}
.empty-projects {
  display: grid;
  min-height: 230px;
  margin-top: 60px;
  place-items: center;
  border-radius: 28px;
}
.empty-projects p {
  color: #9ca3af;
  font-size: 13px;
}
.contact-main > p:not(.eyebrow) {
  max-width: 580px;
  margin: 28px 0 0;
  color: #707884;
  font-size: 15px;
  line-height: 1.8;
}
@media (max-width: 700px) {

  .section {
    padding-block: 80px;
  }

  .section-heading {
    display: block;
  }

  .section h2 {
    font-size: clamp(40px, 12vw, 60px);
  }

  .home-project-grid {
    grid-template-columns: 1fr;
    margin-top: 50px;
  }

  .all-projects {
    margin-top: 28px;
  }
}
@media (max-width: 420px) {

  .section {
    padding-block: 70px;
  }

  .section h2 {
    font-size: 39px;
  }
}

.section-heading > p, .contact-main > p:not(.eyebrow) { color: #a6afcc; }
.section-heading h2 { color: #f3f4ff; }
.eyebrow { color: #a78bfa; }
.project-info-meta .eyebrow { color: #a78bfa; }
.empty-projects { background: rgba(12,18,42,.78); }
.all-projects { color: #edf0ff; background: rgba(15,22,47,.76); }
.work-section {
  border-color: rgba(190,202,255,.1) !important;
}
.home-project-grid {
  grid-template-columns: repeat(3,minmax(0,1fr)) !important;
  gap: clamp(14px,1.6vw,22px);
}

.empty-projects { color: #edf0ff !important; border-color: rgba(196,181,253,.16) !important; background: linear-gradient(145deg,rgba(18,24,51,.78),rgba(8,13,31,.76)) !important; box-shadow: 0 20px 58px rgba(0,0,0,.24), inset 0 1px rgba(255,255,255,.07) !important; }
.section-heading h2 { color: #f3f4ff; }
@media (max-width: 700px) {
  .home-project-grid { grid-template-columns: minmax(0,1fr) !important; }
}
@media (min-width: 701px) and (max-width: 1100px) {
  .home-project-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
}
</style>
