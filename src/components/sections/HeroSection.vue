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
            src="/image/me.png"
            :alt="`Portrait of ${profile.name || 'the portfolio owner'}`"
          />
          <div class="hero-photo-overlay"></div>
          <div class="hero-photo-info">
            <span>{{ profile.name }}</span>
            <small>{{ profile.role }} · {{ profile.location }}</small>
          </div>
        </div>

        <div class="floating-label label-top glass-panel" aria-hidden="true">
          <i></i>
          <span>
            <b>Interface first</b>
            <small>human, not just usable</small>
          </span>
        </div>

        <div class="floating-label label-bottom glass-panel" aria-hidden="true">
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
.hero {
  position: relative;
  display: grid;
  min-height: min(900px, 100svh);
  grid-template-columns: 1fr 0.92fr;
  align-items: center;
  gap: clamp(28px, 5vw, 72px);
  padding-block: 100px 56px;
}

.hero-copy {
  position: relative;
  z-index: 1;
  padding-block: 24px;
}

.availability {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  margin: 0 0 32px;
  color: #c7cdec;
  font: 9px var(--mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.availability-dot {
  position: relative;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #67e8f9;
  box-shadow: 0 0 12px rgba(103, 232, 249, 0.42);
}

.availability-dot::after {
  position: absolute;
  inset: -4px;
  border: 1px solid rgba(103, 232, 249, 0.35);
  border-radius: 50%;
  content: "";
  animation: ping 2.5s ease-out infinite;
}

.availability-sep { color: var(--faint); }

.hero-kicker {
  margin: 0 0 15px;
  color: var(--accent);
  font: 9px var(--mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0;
  font-size: clamp(48px, 6.2vw, 84px);
  line-height: 0.98;
}

.hero-byline {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 26px;
  color: #edf0ff;
  font-size: 12px;
}

.hero-byline span,
.hero-intro { color: var(--muted); }

.hero-intro {
  max-width: 455px;
  margin: 16px 0 26px;
  font-size: 13px;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
}

.hero-aside {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  padding: 20px 12px;
  perspective: 1200px;
}

.code-scene {
  position: relative;
  width: min(100%, 460px);
  padding: 20px 12px 26px;
  isolation: isolate;
}

.hero-photo-card {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border: 1px solid rgba(196, 181, 253, 0.24);
  border-radius: 30px;
  background: linear-gradient(145deg, #151b36, #080d1f);
  box-shadow: 0 32px 86px rgba(0, 0, 0, 0.38), inset 0 1px rgba(255, 255, 255, 0.1);
  transform: perspective(1200px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg));
  transition: transform 450ms ease, box-shadow 450ms ease;
  will-change: transform;
}

.code-scene:hover .hero-photo-card {
  transform: perspective(1200px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg)) translateY(-5px);
  box-shadow: 0 42px 105px rgba(0, 0, 0, 0.46), inset 0 1px rgba(255, 255, 255, 0.13);
}

.hero-photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 36%;
  transition: transform 650ms ease;
}

.code-scene:hover .hero-photo { transform: scale(1.04); }

.hero-photo-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, transparent 45%, rgba(5, 8, 20, 0.12) 62%, rgba(5, 8, 20, 0.88));
}

.hero-photo-info {
  position: absolute;
  right: 22px;
  bottom: 20px;
  left: 22px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hero-photo-info span {
  color: #f3f4ff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-photo-info small {
  color: #c1c9e6;
  font-size: 8px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.floating-label {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 12px;
  color: #edf0ff;
}

.floating-label > i {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border-radius: 50%;
  color: #c4b5fd;
  background: rgba(196, 181, 253, 0.12);
  font-style: normal;
}

.floating-label > i:empty::after {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #67e8f9;
  box-shadow: 0 0 10px rgba(103, 232, 249, 0.6);
  content: "";
}

.floating-label span { display: grid; gap: 3px; }
.floating-label b { font-size: 10px; }
.floating-label small { color: var(--muted); font-size: 8px; }
.label-top { top: 11%; right: -7%; }
.label-bottom { bottom: 12%; left: -8%; }

@keyframes ping {
  to { transform: scale(1.8); opacity: 0; }
}

@media (max-width: 900px) {
  .hero {
    min-height: auto;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 0.82fr);
    gap: 18px;
  }

  .hero h1 { font-size: clamp(46px, 7vw, 68px); }
  .hero-aside { padding-inline: 0; }
  .label-top { right: -3%; }
  .label-bottom { left: -3%; }
}

@media (max-width: 700px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 28px;
    padding-block: 130px 54px;
  }

  .hero-copy { padding-block: 0; }
  .availability { margin-bottom: 24px; }
  .hero h1 { font-size: clamp(46px, 11vw, 68px); }
  .hero-aside { padding-inline: 10px; }
  .code-scene { width: min(100%, 400px); }
  .hero-photo-card { border-radius: 24px; }
}

@media (max-width: 420px) {
  .hero-actions { flex-direction: column; align-items: stretch; }
  .hero-actions .button { width: 100%; }
  .floating-label { gap: 7px; padding: 9px 10px; }
  .label-top { right: -2%; }
  .label-bottom { left: -2%; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-photo-card,
  .hero-photo,
  .availability-dot::after {
    animation: none;
    transition: none;
  }

  .hero-photo-card,
  .code-scene:hover .hero-photo-card { transform: none; }

  .code-scene:hover .hero-photo { transform: none; }
}
</style>
