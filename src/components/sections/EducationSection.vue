<script setup>
import { computed } from "vue";
import { portfolioState } from "../../api/client.js";

const education = computed(() => portfolioState.education);
</script>

<template>
  <section v-if="education" id="education" class="section section-wrap education-section" aria-labelledby="education-title">
    <div class="section-intro" data-reveal>
      <div>
        <p class="eyebrow"><i></i> Education & research</p>
        <h2 id="education-title">A foundation in <em>computer science.</em></h2>
      </div>
      <p>My academic background and thesis work are part of how I approach software and interface development.</p>
    </div>

    <div class="education-grid">
      <article class="education-card glass-panel" data-reveal>
        <span class="education-label">{{ education.status }}</span>
        <h3>{{ education.degree }}</h3>
        <p>{{ education.institution }}</p>
        <div class="education-result"><span>CGPA</span><strong>{{ education.cgpa }}</strong></div>
      </article>
      <article class="thesis-card glass-panel" data-reveal>
        <span class="education-label">Academic thesis</span>
        <h3>DevAssist — An Automated Developer Support Platform for Software Engineering</h3>
        <p>The thesis title is verified. Further project details and materials are not available in the portfolio yet.</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.education-section { padding-block: clamp(76px, 8vw, 118px); }
.section-intro { display:grid; grid-template-columns:minmax(0,1fr) minmax(260px,.65fr); align-items:end; gap:7%; margin-bottom:36px; }
.eyebrow { display:flex; align-items:center; gap:9px; margin:0 0 18px; color:var(--accent); font:600 10px/1.5 var(--mono); letter-spacing:.14em; text-transform:uppercase; }
.eyebrow i { width:18px; height:1px; background:currentColor; }
.section-intro h2 { max-width:650px; margin:0; font-size:clamp(36px,4.8vw,58px); line-height:1; letter-spacing:-.045em; }
.section-intro > p { max-width:430px; margin:0; color:var(--muted); font-size:14px; line-height:1.8; }
.education-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.education-card,.thesis-card { min-height:220px; padding:clamp(22px,3vw,34px); border-radius:12px; }
.education-label { display:inline-flex; margin-bottom:26px; color:var(--accent); font:600 10px var(--mono); letter-spacing:.12em; text-transform:uppercase; }
.education-card h3,.thesis-card h3 { max-width:560px; margin:0 0 10px; font-size:clamp(21px,2.5vw,30px); line-height:1.2; }
.education-card p,.thesis-card p { max-width:540px; margin:0; color:var(--muted); font-size:13px; line-height:1.75; }
.education-result { display:flex; align-items:baseline; gap:14px; margin-top:25px; padding-top:15px; border-top:1px solid var(--line); color:var(--muted); font:11px var(--mono); }
.education-result strong { color:var(--text); font-size:14px; }
@media(max-width:720px) { .section-intro { grid-template-columns:1fr; gap:14px; } .education-grid { grid-template-columns:1fr; } .education-card,.thesis-card { min-height:0; } }
</style>
