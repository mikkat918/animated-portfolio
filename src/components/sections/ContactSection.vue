<script setup>
import { computed } from "vue";
import { portfolioState } from "../../api/client.js";
const profile = computed(() => portfolioState.profile || {});
const socials = computed(() =>
  [
    { label: "GitHub", value: profile.value.github, base: "https://github.com/" },
    {
      label: "LinkedIn",
      value: profile.value.linkedin,
      base: "https://www.linkedin.com/in/",
    },
  ]
    .filter((item) => item.value && !item.value.startsWith("["))
    .map((item) => ({
      label: item.label,
      href: item.value.startsWith("http") ? item.value : item.base + item.value,
    })),
);
const emailReady = computed(
  () => profile.value.email && !profile.value.email.startsWith("["),
);
const phoneReady = computed(
  () => profile.value.phone && !profile.value.phone.startsWith("["),
);
</script>

<template>
<section
      id="contact"
      class="section section-wrap contact-section"
    >
      <div
        class="contact-panel liquid-glass"
        data-reveal
      >
        <div class="contact-main">
          <p class="eyebrow">
            <i></i>
            06 — Start a conversation
          </p>

          <h2>
            Have something<br />
            good in <em>mind?</em>
          </h2>

          <p>
            For hiring, collaboration, or a thoughtful project brief, get in
            touch directly.
          </p>

          <a
            v-if="emailReady"
            class="button button-primary"
            :href="`mailto:${profile.email}`"
          >
            Send an email
            <span>↗</span>
          </a>

          <div class="contact-socials">
            <a
              v-if="phoneReady"
              :href="`tel:${profile.phone}`"
            >
              Call {{ profile.phone }} ↗
            </a>

            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.href"
              target="_blank"
              rel="noreferrer"
            >
              {{ social.label }} ↗
            </a>
          </div>
        </div>

        <dl class="contact-details">
          <div>
            <dt>Email</dt>

            <dd>
              <a
                v-if="emailReady"
                :href="`mailto:${profile.email}`"
              >
                {{ profile.email }}
              </a>

              <span v-else>
                {{ profile.email }}
              </span>
            </dd>
          </div>

          <div>
            <dt>Phone</dt>

            <dd>
              <a
                v-if="phoneReady"
                :href="`tel:${profile.phone}`"
              >
                {{ profile.phone }}
              </a>

              <span v-else>
                {{ profile.phone }}
              </span>
            </dd>
          </div>

          <div>
            <dt>Location</dt>
            <dd>{{ profile.location }}</dd>
          </div>
        </dl>
      </div>
    </section>
</template>

<style scoped>
.button-primary {
  color: #fff !important;
  background: linear-gradient(125deg, #7c3aed, #5b21b6) !important;
  box-shadow: 0 14px 36px rgba(76, 29, 149, .28) !important;
}

.eyebrow {
  color: var(--mint);
  font: 9px var(--mono);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
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
.project-info-meta .eyebrow {
  margin: 0;
  font-size: 7px;
}
.contact-section {
  padding-top: 76px;
  padding-bottom: 101px;
}
.contact-panel {
  display: grid;
  grid-template-columns: 1.35fr 0.65fr;
  align-items: center;
  gap: 9%;
  min-height: 405px;
  padding: 47px 58px;
  overflow: hidden;
  border-radius: 13px;
  background:
    radial-gradient(
      ellipse at 5% 5%,
      rgba(136, 182, 159, 0.12),
      transparent 42%
    ),
    linear-gradient(
      130deg,
      rgba(208, 231, 215, 0.075),
      rgba(169, 197, 184, 0.035) 55%,
      rgba(255, 255, 255, 0.025)
    );
}
.contact-main {
  max-width: 610px;
}
.contact-main .eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 17px;
}
.contact-main h2 {
  margin: 0;
  font-size: clamp(45px, 5.4vw, 68px);
  line-height: 1.03;
}
.contact-main > p:not(.eyebrow) {
  max-width: 455px;
  margin: 18px 0 20px;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.75;
}
.contact-main .button {
  min-height: 41px;
  font-size: 9px;
}
.contact-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 19px;
  color: #9eb2a7;
  font: 8px var(--mono);
}
.contact-socials a:hover {
  color: var(--mint);
}
.contact-details {
  display: grid;
  gap: 18px;
  margin: 0;
  padding-left: 24px;
  border-left: 1px solid var(--line);
}
.contact-details div {
  display: grid;
  gap: 7px;
  padding-bottom: 13px;
  border-bottom: 1px solid var(--line);
}
.contact-details div:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}
.contact-details dt {
  color: var(--faint);
  font: 7px var(--mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.contact-details dd {
  margin: 0;
  color: #d7ded8;
  font-size: 9px;
  font-weight: 600;
}
.contact-details a:hover {
  color: var(--mint);
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
@media (max-width: 980px) {
  .contact-panel {
    gap: 6%;
    padding: 39px;
  }
}
@media (max-width: 720px) {
  .contact-panel {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 35px 27px;
  }
  .contact-main h2 {
    font-size: clamp(43px, 10vw, 58px);
  }
  .contact-details {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    padding: 19px 0 0;
    border-top: 1px solid var(--line);
    border-left: 0;
  }
  .contact-details div:last-child {
    grid-column: 1 / -1;
  }
}
@media (max-width: 420px) {
  .contact-details {
    grid-template-columns: 1fr;
  }
  .contact-details div:last-child {
    grid-column: auto;
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
.button {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 13px;
  min-height: 56px;
  padding: 0 21px;

  border-radius: 999px;

  font-size: 12px;
  font-weight: 700;

  background: #111318;
  color: #fff;

  text-align: center;

  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}
.button:hover {
  transform: translateY(-3px);
}
.button-primary {
  color: #fff;
  background: #eff0f1;
  box-shadow: 0 13px 35px rgba(15, 23, 42, 0.15);
}
.button-primary:hover {
  background: var(--accent);
  box-shadow: 0 18px 45px rgba(208, 205, 214, 0.22);
}
.button-outline {
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: rgba(255, 255, 255, 0.62);
  color: #303641;
  backdrop-filter: blur(15px);
}
.button-outline:hover {
  border-color: rgba(124, 58, 237, 0.25);
  background: #fff;
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
.contact-section {
  padding-top: 40px;
}
.contact-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
  gap: 80px;
  overflow: hidden;
  padding: clamp(35px, 6vw, 85px);
  border-radius: 38px;
}
.contact-panel::before {
  content: "";
  position: absolute;
  width: 430px;
  height: 430px;
  right: -180px;
  top: -200px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.11);
  filter: blur(70px);
  pointer-events: none;
}
.contact-panel::after {
  content: "";
  position: absolute;
  width: 300px;
  height: 300px;
  left: 10%;
  bottom: -230px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.08);
  filter: blur(70px);
  pointer-events: none;
}
.contact-main, .contact-details {
  position: relative;
  z-index: 1;
}
.contact-main h2 {
  margin: 0;
  font-size: clamp(45px, 6vw, 90px);
  font-weight: 500;
  line-height: 0.91;
  letter-spacing: -0.06em;
}
.contact-main h2 em {
  font-family: Georgia, "Times New Roman", serif;
  font-style: italic;
  font-weight: 400;
  color: var(--accent);
}
.contact-main > p:not(.eyebrow) {
  max-width: 580px;
  margin: 28px 0 0;
  color: #707884;
  font-size: 15px;
  line-height: 1.8;
}
.contact-main .button {
  margin-top: 32px;
}
.contact-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 28px;
}
.contact-socials a {
  color: #737a84;
  font-size: 11px;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: #d8dce2;
  text-underline-offset: 5px;
  transition: color 0.25s ease;
}
.contact-socials a:hover {
  color: var(--accent);
}
.contact-details {
  align-self: end;
  margin: 0;
  border-top: 1px solid var(--line);
}
.contact-details > div {
  padding: 20px 0;
  border-bottom: 1px solid var(--line);
}
.contact-details dt {
  margin-bottom: 8px;
  color: #9ca3af;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.contact-details dd {
  margin: 0;
  color: #252a32;
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.contact-details a {
  transition: color 0.25s ease;
}
.contact-details a:hover {
  color: var(--accent);
}
@media (max-width: 1100px) {

  .contact-panel {
    gap: 50px;
  }
}
@media (max-width: 700px) {

  .section {
    padding-block: 80px;
  }

  .button {
    width: 100%;
  }

  .section h2 {
    font-size: clamp(40px, 12vw, 60px);
  }

  .contact-section {
    padding-top: 10px;
  }

  .contact-panel {
    grid-template-columns: 1fr;
    gap: 45px;
    padding: 30px 25px;
    border-radius: 28px;
  }

  .contact-main h2 {
    font-size: clamp(44px, 13vw, 66px);
  }

  .contact-details {
    width: 100%;
  }
}
@media (max-width: 420px) {

  .section {
    padding-block: 70px;
  }

  .section h2 {
    font-size: 39px;
  }

  .contact-panel {
    padding: 27px 20px;
  }
}

.contact-main > p:not(.eyebrow), .contact-details dt { color: #a6afcc; }
.eyebrow { color: #a78bfa; }
.project-info-meta .eyebrow { color: #a78bfa; }
.contact-panel { background: rgba(11,17,40,.76); }
.contact-details dd, .contact-details dd a, .contact-socials a { color: #e5eaff; }
.contact-socials a { color: #c7cdec; text-decoration-color: rgba(196,181,253,.28); }
.contact-details dt { color: #8994b5; }
.contact-details dd { color: #edf0ff; }
.contact-panel { border-color: rgba(196,181,253,.18); }
@media (max-width: 720px) {
  .contact-panel { padding: 27px 22px; }
}
</style>
