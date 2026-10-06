<script setup>
import { computed } from "vue";
import { portfolioState } from "../../api/client.js";
const experience = computed(() => portfolioState.experience || []);
</script>

<template>
<section
      v-if="experience.length"
      id="experience"
      class="section section-wrap experience-section"
    >
      <div class="section-intro" data-reveal>
        <div>
          <p class="eyebrow">
            <i></i>
            04 — Experience
          </p>

          <h2>
            The path is <em>yours to tell.</em>
          </h2>
        </div>

        <p>Professional experience and education.</p>
      </div>

      <div class="timeline">
        <article
          v-for="(item, index) in experience"
          :key="item.id || item.title"
          class="timeline-card glass-panel"
          data-reveal
        >
          <span class="timeline-index">
            0{{ index + 1 }}
          </span>

          <div>
            <p class="timeline-date">
              {{ item.period }}
            </p>

            <h3>{{ item.title }}</h3>

            <p>{{ item.description }}</p>
          </div>
        </article>
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
.section-intro {
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
.section-intro h2 {
  margin: 0;
  font-size: clamp(38px, 4.6vw, 58px);
  line-height: 1.08;
}
.section-intro > p {
  max-width: 410px;
  margin: 0 0 3px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.85;
}
.project-info-meta .eyebrow {
  margin: 0;
  font-size: 7px;
}
.experience-section {
  padding-top: 77px;
}
.timeline-card {
  display: grid;
  grid-template-columns: 27px 1fr auto;
  align-items: center;
  gap: 14px;
  min-height: 97px;
  padding: 18px 23px;
  border-radius: 9px;
  background: linear-gradient(
    110deg,
    rgba(223, 238, 228, 0.065),
    rgba(255, 255, 255, 0.02)
  );
  box-shadow: var(--shadow-inset);
}
.timeline-card p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 9px;
  line-height: 1.6;
}
.timeline {
  display: grid;
  gap: 10px;
}
.timeline-card {
  grid-template-columns: 35px 1fr;
}
.timeline-index {
  color: var(--mint);
  font: 9px var(--mono);
}
.timeline-card h3 {
  margin: 0;
  font: 500 17px var(--serif);
}
.timeline-date {
  color: var(--mint-soft) !important;
  font: 8px var(--mono) !important;
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
  .section-intro {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-bottom: 29px;
  }
  .section-intro h2 {
    font-size: clamp(38px, 9vw, 51px);
  }
  .section-intro > p {
    max-width: 550px;
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
.section-intro {
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
.section-intro > p {
  max-width: 570px;
  margin: 0;
  justify-self: end;
  color: #68707c;
  font-size: 15px;
  line-height: 1.8;
}
.experience-section {
  border-block: 1px solid rgba(15, 23, 42, 0.05);
  background: rgba(255, 255, 255, 0.45);
}
.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 70px;
}
.timeline::before {
  content: "";
  position: absolute;
  left: 20px;
  top: 25px;
  bottom: 25px;
  width: 1px;
  background: linear-gradient(
    to bottom,
    rgba(124, 58, 237, 0.35),
    rgba(15, 23, 42, 0.04),
    transparent
  );
}
.timeline-card {
  position: relative;
  display: grid;
  grid-template-columns: 42px 160px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
  padding: 25px;
  border-radius: 25px;
  transition:
    transform 0.4s ease,
    box-shadow 0.4s ease;
}
.timeline-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 30px 75px rgba(15, 23, 42, 0.1);
}
.timeline-index {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(124, 58, 237, 0.15);
  border-radius: 50%;
  background: #faf8ff;
  color: var(--accent);
  font-size: 9px;
  font-weight: 800;
}
.timeline-date {
  margin: 3px 0 0;
  color: #9ca3af;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.timeline-card h3 {
  margin: 0;
  font-size: 18px;
  letter-spacing: -0.02em;
}
.timeline-card > div > p:last-child {
  max-width: 800px;
  margin: 8px 0 0;
  color: #737b87;
  font-size: 13px;
  line-height: 1.7;
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

  .section-intro {
    display: block;
  }

  .section-intro > p {
    margin-top: 28px;
  }

  .section h2 {
    font-size: clamp(40px, 12vw, 60px);
  }

  .timeline {
    margin-top: 50px;
  }

  .timeline::before {
    display: none;
  }

  .timeline-card {
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 14px;
    padding: 20px;
    border-radius: 22px;
  }

  .timeline-date {
    margin-top: 0;
    margin-bottom: 8px;
  }
}
@media (max-width: 420px) {

  .section {
    padding-block: 70px;
  }

  .section h2 {
    font-size: 39px;
  }

  .timeline-card > div > p:last-child {
    font-size: 12px;
  }
}

.section-intro > p, .timeline-card p, .contact-main > p:not(.eyebrow) { color: #a6afcc; }
.section-intro h2 { color: #f3f4ff; }
.eyebrow { color: #a78bfa; }
.project-info-meta .eyebrow { color: #a78bfa; }
.timeline-card h3 { color: #edf0ff; }
.experience-section { background: rgba(10,15,35,.5); border-color: rgba(190,202,255,.1); }
.timeline-index { color: #c4b5fd; background: rgba(20,25,53,.9); }
.section-intro { position: relative; z-index: 1; }
.timeline-card { color: #edf0ff !important; border-color: rgba(196,181,253,.16) !important; background: linear-gradient(145deg,rgba(18,24,51,.78),rgba(8,13,31,.76)) !important; box-shadow: 0 20px 58px rgba(0,0,0,.24), inset 0 1px rgba(255,255,255,.07) !important; }
.section-intro h2 { color: #f3f4ff; }
</style>
