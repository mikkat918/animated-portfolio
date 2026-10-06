<script setup>
import { computed } from "vue";
import { portfolioState } from "../../api/client.js";
const profile = computed(() => portfolioState.profile || {});
const principles = computed(() => portfolioState.principles || []);
</script>

<template>
<section id="about" class="section section-wrap about-section">
      <div class="section-intro" data-reveal>
        <div>
          <p class="eyebrow">
            <i></i>
            01 — A little context
          </p>

          <h2>
            Good work starts<br />
            with <em>good questions.</em>
          </h2>
        </div>

        <p>{{ profile.about || profile.intro }}</p>
      </div>

      <div class="about-grid">
        <blockquote class="quote-card glass-panel" data-reveal>
          <span class="quote-mark">“</span>

          <p>
            {{
              profile.quote ||
              "I care about the point where a useful idea becomes an experience that feels clear, considered, and easy to use."
            }}
          </p>

          <footer>
            <b>{{ profile.name }}</b>
            <i></i>
            <span>{{ profile.location }}</span>
          </footer>
        </blockquote>

        <div class="principle-list">
          <article
            v-for="(item, index) in principles"
            :key="item.title"
            data-reveal
          >
            <span class="list-index">0{{ index + 1 }}</span>

            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>

            <span class="list-arrow" aria-hidden="true">↗</span>
          </article>
        </div>
      </div>
    </section>
</template>

<style scoped>
.quote-mark {
  color: var(--mint-soft);
  font: 38px/1 var(--serif);
}

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
.about-grid {
  display: grid;
  grid-template-columns: 0.85fr 1fr;
  align-items: stretch;
  gap: 6%;
}
.quote-card {
  display: flex;
  min-height: 268px;
  flex-direction: column;
  justify-content: space-between;
  margin: 0;
  padding: 24px 29px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(212, 230, 221, 0.075),
    rgba(255, 255, 255, 0.025)
  );
  box-shadow: var(--shadow-soft), var(--shadow-inset);
}
.quote-card > p {
  max-width: 420px;
  margin: 12px 0 25px;
  color: #e3e8e1;
  font: 500 19px/1.55 var(--serif);
}
.quote-card footer {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #86938d;
  font: 8px var(--mono);
  text-transform: uppercase;
}
.quote-card footer b {
  color: var(--mint);
  font-weight: 500;
}
.quote-card footer i {
  width: 25px;
  height: 1px;
  background: var(--line-strong);
}
.principle-list {
  border-top: 1px solid var(--line);
}
.principle-list article {
  display: grid;
  grid-template-columns: 34px 1fr 16px;
  gap: 14px;
  align-items: start;
  min-height: 80px;
  padding: 17px 2px;
  border-bottom: 1px solid var(--line);
  transition:
    padding 250ms var(--ease),
    background 250ms;
}
.principle-list article:hover {
  padding-inline: 9px;
  background: rgba(255, 255, 255, 0.016);
}
.list-index {
  padding-top: 3px;
  color: var(--mint-soft);
  font: 8px var(--mono);
}
.principle-list h3 {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 600;
}
.principle-list p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.65;
}
.list-arrow {
  color: var(--faint);
  font-size: 11px;
  transition:
    color 200ms,
    transform 200ms;
}
.principle-list article:hover .list-arrow, .service-list article:hover .list-arrow {
  color: var(--mint);
  transform: translate(2px, -2px);
}
.project-info-meta .eyebrow {
  margin: 0;
  font-size: 7px;
}
.service-list .list-index {
  align-self: center;
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
  .about-grid {
    grid-template-columns: 1fr;
    gap: 22px;
  }
  .quote-card {
    min-height: 225px;
  }
  .quote-card > p {
    font-size: 18px;
  }
  .service-list .list-arrow {
    grid-column: 3;
    grid-row: 1 / span 2;
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
.about-grid {
  display: grid;
  grid-template-columns: minmax(320px, 0.82fr) minmax(0, 1.18fr);
  gap: clamp(45px, 7vw, 110px);
  margin-top: 75px;
}
.glass-panel {
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.64);
  box-shadow: var(--shadow);
  backdrop-filter: blur(22px);
}
.quote-card {
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: clamp(28px, 4vw, 45px);
  border-radius: 30px;
  transition:
    transform 0.4s ease,
    box-shadow 0.4s ease;
}
.quote-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 35px 90px rgba(15, 23, 42, 0.12);
}
.quote-card::after {
  content: "";
  position: absolute;
  right: -90px;
  bottom: -110px;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.07);
  filter: blur(45px);
}
.quote-card > p {
  position: relative;
  margin: 25px 0 50px;
  color: #414854;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(19px, 2vw, 25px);
  line-height: 1.55;
}
.quote-card footer {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
}
.quote-card footer i {
  width: 24px;
  height: 1px;
  background: #d1d5db;
}
.quote-card footer span {
  color: #9ca3af;
}
.principle-list {
  border-top: 1px solid var(--line);
}
.principle-list article {
  display: grid;
  grid-template-columns: 45px minmax(0, 1fr) 30px;
  gap: 20px;
  align-items: start;
  padding: 25px 0;
  border-bottom: 1px solid var(--line);
  transition:
    padding 0.3s ease,
    background 0.3s ease;
}
.principle-list article:hover {
  padding-inline: 12px;
}
.list-index {
  padding-top: 4px;
  color: #a1a7b0;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;
}
.principle-list h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.02em;
  transition: color 0.25s ease;
}
.principle-list article:hover h3 {
  color: var(--accent);
}
.principle-list p {
  max-width: 650px;
  margin: 8px 0 0;
  color: #747c87;
  font-size: 13px;
  line-height: 1.7;
}
.list-arrow {
  color: #c4c8cf;
  font-size: 17px;
  transition:
    transform 0.3s ease,
    color 0.3s ease;
}
article:hover > .list-arrow {
  color: var(--accent);
  transform: translate(3px, -3px);
}
.contact-main > p:not(.eyebrow) {
  max-width: 580px;
  margin: 28px 0 0;
  color: #707884;
  font-size: 15px;
  line-height: 1.8;
}
@media (max-width: 1100px) {

  .about-grid {
    grid-template-columns: 1fr;
  }

  .quote-card {
    max-width: 760px;
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

  .about-grid {
    margin-top: 50px;
    gap: 35px;
  }

  .quote-card {
    padding: 27px;
    border-radius: 25px;
  }

  .quote-card > p {
    margin-bottom: 38px;
    font-size: 20px;
  }

  .principle-list article {
    grid-template-columns: 35px minmax(0, 1fr) 22px;
    gap: 12px;
  }
}
@media (max-width: 420px) {

  .section {
    padding-block: 70px;
  }

  .section h2 {
    font-size: 39px;
  }

  .principle-list article {
    gap: 8px;
  }

  .principle-list p {
    font-size: 12px;
  }
}

.section-intro > p, .principle-list p, .contact-main > p:not(.eyebrow) { color: #a6afcc; }
.section-intro h2 { color: #f3f4ff; }
.eyebrow { color: #a78bfa; }
.quote-card footer b { color: #edf0ff; }
.quote-card footer span { color: #9da8c8; }
.project-info-meta .eyebrow { color: #a78bfa; }
.principle-list article { border-color: rgba(190,202,255,.13); }
.principle-list h3 { color: #edf0ff; }
.section-intro { position: relative; z-index: 1; }
.quote-card { color: #edf0ff !important; border-color: rgba(196,181,253,.16) !important; background: linear-gradient(145deg,rgba(18,24,51,.78),rgba(8,13,31,.76)) !important; box-shadow: 0 20px 58px rgba(0,0,0,.24), inset 0 1px rgba(255,255,255,.07) !important; }
.quote-card > p, .principle-list h3 { color: #edf0ff; }
.principle-list p { color: #a6afcc; }
.section-intro h2 { color: #f3f4ff; }
</style>
