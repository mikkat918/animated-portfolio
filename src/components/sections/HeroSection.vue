<script setup>
import { computed } from "vue";
import { portfolioState } from "../../api/client.js";

const profile = computed(() => portfolioState.profile || {});

function tiltHero(event) {
  if (event.pointerType === "touch") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  const card = event.currentTarget.querySelector(".hero-photo-card");

  card?.style.setProperty("--tilt-x", `${(x * 5).toFixed(2)}deg`);
  card?.style.setProperty("--tilt-y", `${(-y * 3.5).toFixed(2)}deg`);
}

function resetHero(event) {
  const card = event.currentTarget.querySelector(".hero-photo-card");
  card?.style.setProperty("--tilt-x", "0deg");
  card?.style.setProperty("--tilt-y", "0deg");
}
</script>

<template>
  <section id="top" class="hero section-wrap" aria-labelledby="hero-title">
    <div class="hero-copy">
      <p class="availability" data-reveal>
        <span class="availability-dot"></span>
        {{ profile.availability || "AVAILABLE FOR OPPORTUNITIES" }}
        <span class="availability-sep">·</span>
        {{ profile.location || "" }}
      </p>

      <p class="hero-kicker" data-reveal>Developer portfolio</p>

      <h1 id="hero-title" data-reveal>
        Ideas, shaped<br />
        into <em>interfaces.</em>
      </h1>

      <div class="hero-byline" data-reveal>
        <strong>Hello, I’m {{ profile.name }}</strong>
        <span>{{ profile.role }}</span>
      </div>

      <p class="hero-intro" data-reveal>
        {{
          profile.intro ||
          "I build web experiences and refine the details that make them clear and useful."
        }}
      </p>

      <div class="hero-actions" data-reveal>
        <a class="button button-primary" href="#work">
          <span>Explore selected work</span>
          <span aria-hidden="true">→</span>
        </a>
        <a class="button button-outline" href="#about">
          A little about me
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </div>

    <div class="hero-aside" aria-label="Profile photo">
      <div
        class="code-scene"
        data-reveal
        @pointermove="tiltHero"
        @pointerleave="resetHero"
      >
        <div class="hero-photo-card liquid-glass">
          <img
            class="hero-photo"
            src="/image/mikkat-profile.jpg"
            :alt="`Portrait of ${profile.name || 'the portfolio owner'}`"
          />
          <div class="hero-photo-overlay"></div>
          <div class="hero-photo-info">
            <span>{{ profile.name }}</span>
            <small>{{ profile.role }} · {{ profile.location }}</small>
          </div>
        </div>

        <div class="floating-label glass-surface glass-surface-compact label-top glass-panel" aria-hidden="true">
          <i></i>
          <span>
            <b>Interface first</b>
            <small>human, not just usable</small>
          </span>
        </div>

        <div class="floating-label glass-surface glass-surface-compact label-bottom glass-panel" aria-hidden="true">
          <i>+</i>
          <span>
            <b>Good details</b>
            <small>make the difference</small>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* =========================================
   HERO — LIQUID WATER GLASS
========================================= */

.hero {
  position: relative;
  display: grid;
  min-height: min(900px, 100svh);
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.92fr);
  align-items: center;
  gap: clamp(28px, 5vw, 72px);
  padding: 100px 0 56px;
  isolation: isolate;
}

.hero-copy {
  position: relative;
  z-index: 2;
  min-width: 0;
  padding-block: 24px;
}

/* Availability */

.availability {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  margin: 0 0 32px;
  color: #d6e5f8;
  font: 10px var(--mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.availability-dot {
  position: relative;
  flex: 0 0 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #75f5e6;
  box-shadow:
    0 0 8px rgba(117, 245, 230, 0.9),
    0 0 20px rgba(117, 245, 230, 0.45);
}

.availability-dot::after {
  position: absolute;
  inset: -4px;
  border: 1px solid rgba(117, 245, 230, 0.55);
  border-radius: inherit;
  content: "";
  animation: ping 2.5s ease-out infinite;
}

.availability-sep {
  color: var(--faint);
}

/* Heading */

.hero-kicker {
  margin: 0 0 15px;
  color: var(--accent);
  font: 10px var(--mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0;
  font-size: clamp(48px, 6.2vw, 84px);
  line-height: 0.98;
  letter-spacing: -0.055em;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.hero-byline {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 26px;
  color: #edf4ff;
  font-size: 12px;
  line-height: 1.7;
}

.hero-byline span,
.hero-intro {
  color: var(--muted);
}

.hero-intro {
  max-width: 455px;
  margin: 16px 0 26px;
  font-size: 13px;
  line-height: 1.9;
  text-wrap: pretty;
}

/* Buttons */

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 11px;
}

.hero-actions .button {
  min-height: 46px;
}

/* =========================================
   GLASS PHOTO SCENE
========================================= */

.hero-aside {
  position: relative;
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  padding: 28px 20px;
  perspective: 1400px;
}

.code-scene {
  position: relative;
  width: min(100%, 460px);
  padding: 20px 12px 26px;
  isolation: isolate;
}

/* Soft ambient liquid glow */

.code-scene::before {
  position: absolute;
  z-index: -1;
  inset: 12% -10%;
  border-radius: 50%;
  background:
    radial-gradient(
      ellipse at 30% 35%,
      rgba(88, 197, 255, 0.23),
      transparent 52%
    ),
    radial-gradient(
      ellipse at 75% 70%,
      rgba(173, 120, 255, 0.22),
      transparent 54%
    );
  filter: blur(34px);
  content: "";
  pointer-events: none;
}

/* Main portrait glass frame */

.hero-photo-card {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border: 1px solid rgba(231, 245, 255, 0.34);
  border-radius: 30px;
  background:
    linear-gradient(
      145deg,
      rgba(158, 199, 255, 0.16),
      rgba(17, 24, 50, 0.72) 50%,
      rgba(9, 13, 29, 0.94)
    );
  box-shadow:
    0 35px 90px rgba(0, 0, 0, 0.35),
    0 12px 32px rgba(92, 160, 255, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.42),
    inset 1px 0 0 rgba(255, 255, 255, 0.12),
    inset 0 -1px 0 rgba(255, 255, 255, 0.08);
  transform:
    perspective(1400px)
    rotateX(var(--tilt-y, 0deg))
    rotateY(var(--tilt-x, 0deg));
  transform-style: preserve-3d;
  transition:
    transform 450ms cubic-bezier(0.2, 0.75, 0.25, 1),
    box-shadow 450ms ease,
    border-color 450ms ease;
  will-change: transform;
}

/* Glass reflection */

.hero-photo-card::before {
  position: absolute;
  z-index: 2;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.19) 0%,
      rgba(255, 255, 255, 0.035) 18%,
      transparent 37%,
      transparent 75%,
      rgba(148, 205, 255, 0.09) 100%
    );
  content: "";
  pointer-events: none;
}

/* Fine glass edge */

.hero-photo-card::after {
  position: absolute;
  z-index: 3;
  inset: 1px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 29px;
  content: "";
  pointer-events: none;
}

.code-scene:hover .hero-photo-card {
  border-color: rgba(190, 232, 255, 0.55);
  transform:
    perspective(1400px)
    rotateX(var(--tilt-y, 0deg))
    rotateY(var(--tilt-x, 0deg))
    translateY(-5px);
  box-shadow:
    0 45px 110px rgba(0, 0, 0, 0.42),
    0 12px 40px rgba(91, 177, 255, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.48),
    inset 1px 0 0 rgba(255, 255, 255, 0.16);
}

/* Portrait image */

.hero-photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 36%;
  transition: transform 650ms cubic-bezier(0.2, 0.7, 0.25, 1);
}

.code-scene:hover .hero-photo {
  transform: scale(1.035);
}

/* Image bottom fade */

.hero-photo-overlay {
  position: absolute;
  z-index: 1;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      rgba(8, 13, 28, 0.02) 0%,
      transparent 36%,
      rgba(8, 13, 28, 0.18) 55%,
      rgba(5, 8, 20, 0.90) 100%
    );
  pointer-events: none;
}

.hero-photo-info {
  position: absolute;
  z-index: 4;
  right: 22px;
  bottom: 22px;
  left: 22px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.hero-photo-info span {
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
}

.hero-photo-info small {
  color: #c5d8f3;
  font-size: 9px;
  letter-spacing: 0.12em;
  line-height: 1.6;
  text-transform: uppercase;
}

/* =========================================
   FLOATING LIQUID GLASS LABELS
========================================= */

.floating-label {
  position: absolute;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: calc(100% - 8px);
  padding: 12px 15px;
  overflow: hidden;
  border: 1px solid rgba(226, 241, 255, 0.24);
  border-radius: 16px;
  background:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15),
      rgba(255, 255, 255, 0.045) 48%,
      rgba(125, 174, 255, 0.09)
    );
  color: #f1f6ff;
  box-shadow:
    0 14px 35px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
  -webkit-backdrop-filter: blur(22px) saturate(165%);
  backdrop-filter: blur(22px) saturate(165%);
  animation: glass-float 5s ease-in-out infinite;
}

.floating-label > i {
  display: grid;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid rgba(196, 181, 253, 0.24);
  border-radius: 50%;
  background: rgba(196, 181, 253, 0.14);
  color: #d8d0ff;
  font-style: normal;
}

.floating-label > i:empty::after {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #75f5e6;
  box-shadow: 0 0 12px rgba(117, 245, 230, 0.75);
  content: "";
}

.floating-label span {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.floating-label b {
  font-size: 11px;
  font-weight: 650;
  line-height: 1.4;
}

.floating-label small {
  color: #c5d2ea;
  font-size: 9px;
  line-height: 1.4;
}

.label-top {
  top: 11%;
  right: -7%;
  animation-delay: -1.5s;
}

.label-bottom {
  bottom: 12%;
  left: -8%;
  animation-delay: -3s;
}

/* =========================================
   ANIMATIONS
========================================= */

@keyframes ping {
  0% {
    transform: scale(0.9);
    opacity: 0.85;
  }

  100% {
    transform: scale(1.9);
    opacity: 0;
  }
}

@keyframes glass-float {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: 0 -7px;
  }
}

/* =========================================
   TABLET
========================================= */

@media (max-width: 900px) {
  .hero {
    min-height: auto;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 0.82fr);
    gap: 24px;
  }

  .hero h1 {
    font-size: clamp(44px, 6.3vw, 68px);
  }

  .hero-aside {
    padding-inline: 4px;
  }

  .code-scene {
    width: 100%;
  }

  .label-top {
    right: -2%;
  }

  .label-bottom {
    left: -2%;
  }
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 700px) {
  .hero {
    min-height: auto;
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    padding-block: 125px 54px;
  }

  .hero-copy {
    padding-block: 0;
  }

  .availability {
    margin-bottom: 24px;
    font-size: 9px;
  }

  .hero h1 {
    font-size: clamp(43px, 10.5vw, 66px);
    line-height: 1;
  }

  .hero-byline {
    margin-top: 20px;
  }

  .hero-intro {
    max-width: 100%;
    font-size: 13px;
  }

  .hero-aside {
    width: 100%;
    padding: 20px 12px;
  }

  .code-scene {
    width: min(100%, 400px);
    padding: 14px 10px 20px;
  }

  .hero-photo-card {
    border-radius: 24px;
  }

  .hero-photo-card::after {
    border-radius: 23px;
  }

  .floating-label {
    gap: 8px;
    padding: 10px 12px;
    border-radius: 13px;
  }

  .label-top {
    top: 9%;
    right: -1%;
  }

  .label-bottom {
    bottom: 9%;
    left: -1%;
  }
}

/* =========================================
   SMALL MOBILE
========================================= */

@media (max-width: 420px) {
  .hero {
    padding-top: 112px;
  }

  .hero h1 {
    font-size: clamp(39px, 10vw, 48px);
    letter-spacing: -0.045em;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions .button {
    width: 100%;
    justify-content: center;
  }

  .hero-aside {
    padding-inline: 8px;
  }

  .code-scene {
    padding-inline: 7px;
  }

  .hero-photo-card {
    border-radius: 20px;
  }

  .hero-photo-card::after {
    border-radius: 19px;
  }

  .hero-photo-info {
    right: 16px;
    bottom: 17px;
    left: 16px;
  }

  .floating-label {
    gap: 7px;
    max-width: 78%;
    padding: 9px 10px;
  }

  .floating-label > i {
    flex-basis: 24px;
    width: 24px;
    height: 24px;
  }

  .floating-label b {
    font-size: 10px;
  }

  .floating-label small {
    font-size: 8px;
  }

  .label-top {
    right: -1%;
  }

  .label-bottom {
    bottom: 8%;
    left: -1%;
  }
}

/* =========================================
   ACCESSIBILITY
========================================= */

@media (prefers-reduced-motion: reduce) {
  .hero-photo-card,
  .hero-photo,
  .availability-dot::after,
  .floating-label {
    animation: none;
    transition: none;
  }

  .hero-photo-card,
  .code-scene:hover .hero-photo-card {
    transform: none;
  }

  .code-scene:hover .hero-photo {
    transform: none;
  }

  .floating-label {
    translate: none;
  }
}
</style>
