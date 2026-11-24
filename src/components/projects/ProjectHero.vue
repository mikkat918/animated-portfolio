<script setup>
import { computed } from "vue";

const props = defineProps({ project: { type: Object, required: true } });
const technologies = computed(() => [...new Set([
  ...(Array.isArray(props.project.languages) ? props.project.languages : []),
  ...(props.project.language ? [props.project.language] : []),
])]);
</script>

<template>
  <header class="project-hero" data-reveal>
    <p class="eyebrow"><i></i>{{ project.status || "Project" }} <span>·</span> {{ technologies.join(" · ") || "Web experience" }}</p>
    <div class="hero-grid">
      <div>
        <p class="project-kicker">SELECTED PROJECT / {{ project.slug || project.name || project.title }}</p>
        <h1>{{ project.title }}</h1>
        <p class="project-deck">{{ project.description || project.readmeSummary || "No project description is available yet." }}</p>
        <ul v-if="technologies.length" class="project-tech-list" aria-label="Technologies">
          <li v-for="item in technologies" :key="item">{{ item }}</li>
        </ul>
        <div class="project-links">
          <a v-if="project.liveUrl || project.live" class="button button-primary" :href="project.liveUrl || project.live" target="_blank" rel="noopener noreferrer">Live project <span aria-hidden="true">↗</span></a>
          <a v-if="project.repoUrl || project.github" class="button button-outline" :href="project.repoUrl || project.github" target="_blank" rel="noopener noreferrer">Source code <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div class="hero-index liquid-glass" aria-label="Project summary">
        <span>PROJECT FILE</span><strong>{{ project.title }}</strong>
        <dl><div><dt>Primary language</dt><dd>{{ project.language || "Not detected" }}</dd></div><div><dt>Repository</dt><dd>{{ project.repoUrl ? "Public source" : "Details" }}</dd></div></dl>
        <span class="hero-index-mark" aria-hidden="true">{{ String(project.slug || project.name || project.title).slice(0, 2).toUpperCase() }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.project-hero { 
  position: relative; 
  z-index: 1; 
}
.project-hero > .eyebrow { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  color: var(--mint); 
  font: 11px var(--mono); 
  letter-spacing: .11em; 
  text-transform: uppercase; 
}
.project-hero > .eyebrow i { 
  width: 7px; 
  height: 7px; 
  border-radius: 50%;
  background: var(--mint); 
  box-shadow: 0 0 16px var(--mint); 
}
.project-hero > .eyebrow span { 
  color: var(--faint); 
}
.hero-grid { 
  display: grid; 
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, .7fr); 
  align-items: end; gap: clamp(28px, 8vw, 120px); 
  margin-top: clamp(30px, 6vw, 76px); 
}
.project-kicker { 
  color: var(--faint); 
  font: 10px var(--mono); 
  letter-spacing: .16em; 
}
h1 { 
  max-width: 900px; 
  margin: 0; 
  font-size: clamp(52px, 9vw, 124px); 
  line-height: .93; 
  text-transform: uppercase; 
  overflow-wrap: anywhere; 
}
.project-deck { max-width: 590px; margin: 25px 0 0; color: var(--muted); font-size: clamp(14px, 1.5vw, 17px); line-height: 1.8; }
.project-tech-list { display: flex; flex-wrap: wrap; gap: 8px; margin: 22px 0 0; padding: 0; list-style: none; }
.project-tech-list li { padding: 7px 10px; border: 1px solid var(--line-strong); border-radius: 999px; color: var(--mint-soft); background: rgba(255,255,255,.035); font: 10px var(--mono); }
.project-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 25px; }
.hero-index { position: relative; min-height: 230px; padding: 24px; overflow: hidden; border-radius: 14px; }
.hero-index > span:first-child { color: var(--mint); font: 9px var(--mono); letter-spacing: .16em; }
.hero-index strong { display: block; max-width: 80%; margin-top: 38px; font: 500 clamp(22px, 3vw, 34px) "Syne", sans-serif; }
.hero-index dl { display: flex; gap: 34px; margin: 28px 0 0; }
.hero-index dl div { display: grid; gap: 6px; }
.hero-index dt { color: var(--faint); font: 9px var(--mono); text-transform: uppercase; }
.hero-index dd { margin: 0; color: var(--muted); font-size: 11px; }
.hero-index-mark { position: absolute; right: 12px; bottom: -39px; color: color-mix(in srgb,var(--accent) 7%,transparent); font: 190px/.8 "Syne", sans-serif; font-weight: 700; }
@media (max-width: 760px) { .hero-grid { grid-template-columns: 1fr; gap: 32px; } .hero-index { min-height: 190px; } .hero-index strong { margin-top: 24px; } }
</style>
