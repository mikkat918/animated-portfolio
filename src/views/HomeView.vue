<script setup>
import { useReveal } from "../composables/useReveal.js";
import HeroSection from "../components/sections/HeroSection.vue";
import AboutSection from "../components/sections/AboutSection.vue";
import SkillsSection from "../components/sections/SkillsSection.vue";
import ProjectsSection from "../components/sections/ProjectsSection.vue";
import ExperienceSection from "../components/sections/ExperienceSection.vue";
import ServicesSection from "../components/sections/ServicesSection.vue";
import ContactSection from "../components/sections/ContactSection.vue";
useReveal();
</script>

<template>
  <main class="portfolio-home">
    <HeroSection />
    <AboutSection />
    <SkillsSection />
    <ProjectsSection />
    <ExperienceSection />
    <ServicesSection />
    <ContactSection />
  </main>
</template>

<style scoped>
.portfolio-home {
  --page-bg: rgba(5, 8, 22, 0.74);
  --surface: rgba(15, 22, 47, 0.68);
  --surface-strong: rgba(10, 15, 34, 0.88);
  --text: #edf0ff;
  --muted: #a6afcc;
  --soft: #7e89aa;
  --line: rgba(190, 202, 255, 0.14);
  --accent: #a78bfa;
  --accent-soft: rgba(167, 139, 250, 0.14);
  --shadow: 0 24px 70px rgba(0, 0, 0, 0.28);

  position: relative;
  overflow: hidden;
  color: var(--text);
  background:
    radial-gradient(
      circle at 8% 10%,
      rgba(109, 40, 217, 0.16),
      transparent 28%
    ),
    radial-gradient(
      circle at 92% 18%,
      rgba(8, 145, 178, 0.12),
      transparent 26%
    ),
    var(--page-bg);
}
.portfolio-home *, .portfolio-home *::before, .portfolio-home *::after {
  box-sizing: border-box;
}
.portfolio-home a {
  color: inherit;
  text-decoration: none;
}

.portfolio-home :deep(.section-wrap) {
  width: min(100% - 40px, 1500px);
  margin-inline: auto;
}

@media (max-width: 700px) {
  .portfolio-home :deep(.section-wrap) {
    width: min(100% - 28px, 1500px);
  }
}

@media (max-width: 420px) {
  .portfolio-home :deep(.section-wrap) {
    width: min(100% - 22px, 1500px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .portfolio-home *, .portfolio-home *::before, .portfolio-home *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
