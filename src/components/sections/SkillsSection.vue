<script setup>
import { computed } from "vue";
import { portfolioState } from "../../api/client.js";
const skills = computed(() => portfolioState.skills || []);
</script>

<template>
<section id="skills" class="section section-wrap skills-section">
      <div class="section-intro" data-reveal>
        <div>
          <p class="eyebrow">
            <i></i>
            02 — Tools & practice
          </p>

          <h2>
            A toolkit in <em>progress.</em>
          </h2>
        </div>

        <p>
          Technologies and practices used to build this portfolio and its
          projects.
        </p>
      </div>

      <div class="skill-grid">
        <article
          v-for="(group, index) in skills"
          :key="group.title"
          class="skill-card clay-card"
          data-reveal
        >
          <div class="skill-card-meta">
            <span>0{{ index + 1 }}</span>
            <small>{{ group.note }}</small>
          </div>

          <h3>{{ group.title }}</h3>

          <ul>
            <li
              v-for="item in group.items"
              :key="item"
            >
              <i></i>
              {{ item }}
            </li>
          </ul>
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
.skill-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.skill-card {
  min-height: 230px;
  padding: 22px;
  border: 1px solid rgba(211, 228, 221, 0.13);
  border-radius: 12px;
  background: linear-gradient(
    145deg,
    rgba(225, 239, 230, 0.075),
    rgba(193, 216, 205, 0.028)
  );
  box-shadow:
    7px 9px 24px rgba(0, 0, 0, 0.18),
    -4px -4px 16px rgba(219, 239, 229, 0.018),
    inset 1px 1px rgba(255, 255, 255, 0.035);
  transition:
    transform 280ms var(--ease),
    border-color 250ms,
    box-shadow 250ms;
}
.skill-card:hover {
  transform: translateY(-4px);
  border-color: rgba(181, 215, 201, 0.26);
  box-shadow:
    10px 15px 30px rgba(0, 0, 0, 0.22),
    -4px -4px 18px rgba(219, 239, 229, 0.025),
    inset 1px 1px rgba(255, 255, 255, 0.045);
}
.skill-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--mint);
  font: 8px var(--mono);
}
.skill-card-meta small {
  color: var(--faint);
  font-size: 7px;
}
.skill-card h3 {
  margin: 22px 0 14px;
  font: 500 23px var(--serif);
}
.skill-card ul {
  display: flex;
  flex-wrap: wrap;
  gap: 7px 12px;
  margin: 0;
  padding: 13px 0 0;
  border-top: 1px solid var(--line);
  list-style: none;
}
.skill-card li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #a4afaa;
  font-size: 9px;
}
.skill-card li i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--mint-soft);
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
  .skill-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .skill-card {
    min-height: 190px;
    padding: 18px;
  }
  .skill-card h3 {
    margin-top: 18px;
    font-size: 21px;
  }
}
@media (max-width: 420px) {
  .skill-grid {
    grid-template-columns: 1fr;
  }
  .skill-card {
    min-height: 166px;
  }
  .skill-card h3 {
    margin-block: 14px 10px;
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
.skills-section {
  border-block: 1px solid rgba(15, 23, 42, 0.05);
}
.skill-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 17px;
  margin-top: 70px;
}
.skill-card {
  position: relative;
  overflow: hidden;
  min-height: 300px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 27px;
  background: #eef0f3;
  box-shadow:
    inset 4px 4px 10px rgba(255, 255, 255, 0.85),
    inset -5px -5px 12px rgba(15, 23, 42, 0.055),
    0 18px 45px rgba(15, 23, 42, 0.045);
  transition:
    transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 0.45s ease;
}
.skill-card:hover {
  transform: translateY(-9px);
  box-shadow:
    inset 4px 4px 10px rgba(255, 255, 255, 0.85),
    inset -5px -5px 12px rgba(15, 23, 42, 0.055),
    0 30px 70px rgba(15, 23, 42, 0.11);
}
.skill-card::after {
  content: "";
  position: absolute;
  width: 140px;
  height: 140px;
  right: -70px;
  bottom: -70px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.08);
  filter: blur(20px);
  transition: transform 0.5s ease;
}
.skill-card:hover::after {
  transform: scale(1.7);
}
.skill-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 55px;
}
.skill-card-meta > span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.72);
  color: #737984;
  font-size: 9px;
  font-weight: 800;
  box-shadow: 0 5px 14px rgba(15, 23, 42, 0.05);
}
.skill-card-meta small {
  color: #9ca2ab;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-align: right;
  text-transform: uppercase;
}
.skill-card h3 {
  margin: 0;
  font-size: 23px;
  font-weight: 700;
  letter-spacing: -0.04em;
}
.skill-card ul {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
}
.skill-card li {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #737a84;
  font-size: 12px;
}
.skill-card li i {
  width: 5px;
  height: 5px;
  flex: 0 0 5px;
  border-radius: 50%;
  background: var(--accent);
}
.contact-main > p:not(.eyebrow) {
  max-width: 580px;
  margin: 28px 0 0;
  color: #707884;
  font-size: 15px;
  line-height: 1.8;
}
@media (max-width: 1100px) {

  .skill-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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

  .skill-grid {
    grid-template-columns: 1fr;
    margin-top: 50px;
  }

  .skill-card {
    min-height: auto;
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

.section-intro > p, .contact-main > p:not(.eyebrow) { color: #a6afcc; }
.section-intro h2 { color: #f3f4ff; }
.eyebrow { color: #a78bfa; }
.project-info-meta .eyebrow { color: #a78bfa; }
.skills-section { border-color: rgba(190,202,255,.1); }
.skill-card { color: #edf0ff; border-color: rgba(196,181,253,.18); background: linear-gradient(145deg,rgba(22,28,58,.9),rgba(10,15,35,.88)); box-shadow: inset 0 1px rgba(255,255,255,.07), 0 18px 46px rgba(0,0,0,.22); }
.skill-card h3 { color: #edf0ff; }
.skill-card li { color: #a6afcc; }
.skill-card-meta > span { color: #c4b5fd; background: rgba(196,181,253,.1); }
.skill-card-meta small { color: #8994b5; }
.skills-section {
  border-color: rgba(190,202,255,.1) !important;
}
.skill-grid { gap: clamp(14px,2vw,22px); }
.skill-card {
  min-height: 270px;
  border-radius: 24px !important;
  border-color: rgba(196,181,253,.18) !important;
  background: linear-gradient(145deg,rgba(20,27,57,.82),rgba(9,14,33,.82)) !important;
  box-shadow: inset 0 1px rgba(255,255,255,.075),0 22px 54px rgba(0,0,0,.24) !important;
}
.skill-card:hover {
  transform: translateY(-5px) !important;
  border-color: rgba(196,181,253,.32) !important;
  box-shadow: inset 0 1px rgba(255,255,255,.1),0 28px 62px rgba(0,0,0,.32) !important;
}

.skill-card h3, .section-intro h2 { color: #f3f4ff; }
@media (max-width: 700px) {
  .skill-card { min-height: 0; padding: 22px; }
  .skill-card-meta { margin-bottom: 30px; }
}
</style>
