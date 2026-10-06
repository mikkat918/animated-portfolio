<script setup>
import { computed } from "vue";
import { portfolioState } from "../../api/client.js";
const services = computed(() => portfolioState.services || []);
</script>

<template>
<section
      id="services"
      class="section section-wrap services-section"
    >
      <div class="section-intro" data-reveal>
        <div>
          <p class="eyebrow">
            <i></i>
            05 — Ways to work together
          </p>

          <h2>
            Useful, thoughtful,<br />
            <em>well made.</em>
          </h2>
        </div>

        <p>
          Frontend development and thoughtful interface implementation.
        </p>
      </div>

      <div class="service-list">
        <article
          v-for="(service, index) in services"
          :key="service.title"
          data-reveal
        >
          <span class="list-index">
            0{{ index + 1 }}
          </span>

          <h3>{{ service.title }}</h3>

          <p>{{ service.description }}</p>

          <span
            class="list-arrow"
            aria-hidden="true"
          >
            ↗
          </span>
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
.list-index {
  padding-top: 3px;
  color: var(--mint-soft);
  font: 8px var(--mono);
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
.services-section {
  padding-top: 78px;
}
.service-list {
  border-top: 1px solid var(--line);
}
.service-list article {
  display: grid;
  min-height: 72px;
  grid-template-columns: 44px 1fr 1.1fr 16px;
  gap: 14px;
  align-items: center;
  padding: 14px 5px;
  border-bottom: 1px solid var(--line);
  transition:
    padding 220ms var(--ease),
    background 220ms;
}
.service-list article:hover {
  padding-inline: 12px;
  background: rgba(255, 255, 255, 0.016);
}
.service-list .list-index {
  align-self: center;
}
.service-list h3 {
  margin: 0;
  font: 500 17px var(--serif);
}
.service-list p {
  margin: 0;
  color: var(--muted);
  font-size: 9px;
  line-height: 1.6;
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
  .service-list article {
    grid-template-columns: 31px 1fr 17px;
    gap: 10px;
    padding-block: 16px;
  }
  .service-list h3 {
    font-size: 15px;
  }
  .service-list p {
    grid-column: 2;
    grid-row: 2;
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
.service-list article {
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
.service-list article:hover {
  padding-inline: 12px;
}
.list-index {
  padding-top: 4px;
  color: #a1a7b0;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;
}
.service-list h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.02em;
  transition: color 0.25s ease;
}
.service-list article:hover h3 {
  color: var(--accent);
}
.service-list p {
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
.service-list {
  margin-top: 65px;
  border-top: 1px solid var(--line);
}
.service-list article {
  grid-template-columns: 50px minmax(200px, 0.7fr) minmax(0, 1fr) 30px;
  align-items: center;
}
.service-list article h3 {
  font-size: 20px;
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

  .service-list article {
    grid-template-columns: 35px minmax(0, 1fr) 22px;
    gap: 12px;
  }

  .service-list {
    margin-top: 50px;
  }

  .service-list article {
    grid-template-columns: 35px minmax(0, 1fr) 22px;
  }

  .service-list article h3 {
    font-size: 17px;
  }

  .service-list article p {
    grid-column: 2 / 3;
  }
}
@media (max-width: 420px) {

  .section {
    padding-block: 70px;
  }

  .section h2 {
    font-size: 39px;
  }

  .service-list article {
    gap: 8px;
  }

  .service-list p {
    font-size: 12px;
  }
}

.section-intro > p, .service-list p, .contact-main > p:not(.eyebrow) { color: #a6afcc; }
.section-intro h2 { color: #f3f4ff; }
.eyebrow { color: #a78bfa; }
.project-info-meta .eyebrow { color: #a78bfa; }
.service-list article { border-color: rgba(190,202,255,.13); }
.service-list h3 { color: #edf0ff; }
.section-intro { position: relative; z-index: 1; }
.service-list h3 { color: #edf0ff; }
.service-list p { color: #a6afcc; }
.section-intro h2 { color: #f3f4ff; }
</style>
