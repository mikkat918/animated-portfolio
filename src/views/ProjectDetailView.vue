<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { loadPortfolio, portfolioState } from "../api/client.js";
import NotFoundView from "./NotFoundView.vue";
import { useReveal } from "../composables/useReveal";

useReveal();
const route = useRoute();
const project = computed(() =>
  portfolioState.projects.find((item) => item.id === route.params.slug || item.slug === route.params.slug),
);
const adjacentProjects = computed(() => {
  const list = portfolioState.projects || [];
  const index = list.findIndex(
    (item) => item.id === project.value?.id || item.slug === project.value?.slug,
  );
  return {
    previous: index > 0 ? list[index - 1] : null,
    next: index >= 0 && index < list.length - 1 ? list[index + 1] : null,
  };
});
const imageIndex = ref(0);
const imageFailed = ref(false);
const fallbackFailed = ref(false);
const gallery = computed(() => {
  const items = Array.isArray(project.value?.images)
    ? project.value.images.filter((image) => image?.url)
    : [];
  if (items.length) return items;
  const fallback = project.value?.previewImage || project.value?.fallbackImage;
  return fallback
    ? [{ url: fallback, alt: project.value.title + " project preview", caption: "" }]
    : [];
});
const currentImage = computed(() => gallery.value[imageIndex.value] || null);
const imageSource = computed(() => {
  if (
    imageFailed.value &&
    project.value?.fallbackImage &&
    currentImage.value?.url !== project.value.fallbackImage
  ) {
    return project.value.fallbackImage;
  }
  return currentImage.value?.url || "";
});
const languages = computed(() => [
  ...new Set([
    ...(Array.isArray(project.value?.languages) ? project.value.languages : []),
    ...(project.value?.language ? [project.value.language] : []),
  ]),
]);
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}
watch(
  () => project.value?.slug,
  () => {
    imageIndex.value = 0;
    imageFailed.value = false;
    fallbackFailed.value = false;
  },
);
watch(gallery, () => {
  imageIndex.value = 0;
  imageFailed.value = false;
  fallbackFailed.value = false;
});
function moveImage(direction) {
  const length = gallery.value.length;
  if (length < 2) return;
  imageIndex.value = (imageIndex.value + direction + length) % length;
  imageFailed.value = false;
  fallbackFailed.value = false;
}
function onImageError() {
  if (
    !imageFailed.value &&
    project.value?.fallbackImage &&
    imageSource.value !== project.value.fallbackImage
  ) {
    imageFailed.value = true;
  } else {
    fallbackFailed.value = true;
  }
}
</script>

<template>
  <NotFoundView v-if="portfolioState.loaded && !project" />

  <main
    v-else-if="project"
    class="inner-page section-wrap detail-page"
  >
    <!-- Back navigation -->
    <RouterLink class="back-link" to="/projects">
      <span class="back-arrow">←</span>
      <span>Back to all projects</span>
    </RouterLink>

    <!-- Project heading -->
    <div class="detail-heading" data-reveal>
      <div class="detail-meta-row">
        <p class="eyebrow">
          <i></i>
          {{ project.status || "Project" }}

          <span v-if="project.language || project.languages?.length">
            ·
          </span>

          {{ languages.join(" · ") }}
        </p>

        <span class="detail-number">PROJECT / 01</span>
      </div>

      <h1>
        {{ project.title }}
      </h1>

      <p class="detail-deck">
        {{
          project.description ||
          project.readmeSummary ||
          "No description has been added to this repository yet."
        }}
      </p>

      <ul
        v-if="project.topics?.length || project.tags?.length"
        class="tag-list"
      >
        <li
          v-for="topic in [
            ...new Set([
              ...(project.topics || []),
              ...(project.tags || []),
            ]),
          ]"
          :key="topic"
        >
          {{ topic }}
        </li>
      </ul>

      <div class="detail-project-links">
        <a
          v-if="project.liveUrl || project.live"
          class="button button-primary"
          :href="project.liveUrl || project.live"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Open live project</span>
          <span aria-hidden="true">↗</span>
        </a>

        <a
          v-if="project.repoUrl || project.github"
          class="button button-outline"
          :href="project.repoUrl || project.github"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>View source</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>

    <!-- Project gallery -->
    <figure
      v-if="currentImage && !fallbackFailed"
      class="detail-gallery glass-panel"
      data-reveal
    >
      <div class="gallery-frame">
        <div class="gallery-glow"></div>

        <img
          :key="imageSource"
          :src="imageSource"
          :alt="currentImage.alt || project.title + ' project image'"
          :loading="imageIndex === 0 ? 'eager' : 'lazy'"
          decoding="async"
          sizes="(max-width: 720px) 100vw, 1160px"
          @error="onImageError"
        />

        <div class="gallery-overlay"></div>

        <div
          v-if="gallery.length > 1"
          class="gallery-counter"
          aria-live="polite"
        >
          <span>{{ String(imageIndex + 1).padStart(2, "0") }}</span>
          <i></i>
          <span>{{ String(gallery.length).padStart(2, "0") }}</span>
        </div>

        <div v-if="gallery.length > 1" class="gallery-controls">
          <button
            type="button"
            aria-label="Previous project image"
            @click="moveImage(-1)"
          >
            <span aria-hidden="true">←</span>
          </button>

          <button
            type="button"
            aria-label="Next project image"
            @click="moveImage(1)"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <figcaption
        v-if="currentImage.caption || gallery.length > 1"
        class="gallery-caption"
      >
        <span>{{ currentImage.caption }}</span>

        <span
          v-if="gallery.length > 1"
          aria-live="polite"
        >
          Image {{ imageIndex + 1 }} of {{ gallery.length }}
        </span>
      </figcaption>
    </figure>

    <!-- Gallery fallback -->
    <div
      v-else
      class="detail-art glass-panel"
      data-reveal
      aria-label="Project preview unavailable"
    >
      <div class="art-grid"></div>

      <div class="art-content">
        <span class="art-index">404 / PREVIEW</span>

        <strong>{{ project.title }}</strong>

        <span>PROJECT PREVIEW UNAVAILABLE</span>
      </div>
    </div>

    <!-- Project information -->
    <div
      v-if="project.description || project.readmeSummary"
      class="detail-content"
    >
      <section data-reveal>
        <p class="eyebrow">
          <i></i>
          Project overview
        </p>

        <p>
          {{
            project.description ||
            project.readmeSummary
          }}
        </p>
      </section>

      <section
        v-if="project.updatedAt || project.createdAt"
        data-reveal
      >
        <p class="eyebrow">
          <i></i>
          Project activity
        </p>

        <p v-if="project.updatedAt">
          Updated {{ formatDate(project.updatedAt) }}
        </p>

        <p v-else>
          Created {{ formatDate(project.createdAt) }}
        </p>
      </section>
    </div>

    <nav
      v-if="adjacentProjects.previous || adjacentProjects.next"
      class="project-neighbors"
      aria-label="Adjacent projects"
    >
      <RouterLink
        v-if="adjacentProjects.previous"
        :to="`/projects/${adjacentProjects.previous.id || adjacentProjects.previous.slug}`"
        class="project-neighbor project-neighbor-previous"
      >
        <span aria-hidden="true">←</span>
        <span><small>Previous project</small><strong>{{ adjacentProjects.previous.title }}</strong></span>
      </RouterLink>
      <RouterLink
        v-if="adjacentProjects.next"
        :to="`/projects/${adjacentProjects.next.id || adjacentProjects.next.slug}`"
        class="project-neighbor project-neighbor-next"
      >
        <span><small>Next project</small><strong>{{ adjacentProjects.next.title }}</strong></span>
        <span aria-hidden="true">→</span>
      </RouterLink>
    </nav>

    <!-- Page ending -->
    <div class="page-endnote glass-panel">
      <div class="endnote-label">
        <i></i>
        <span>Have a project in mind?</span>
      </div>

      <div class="detail-next-links">
        <RouterLink to="/projects">
          <span>Back to all work</span>
          <b>→</b>
        </RouterLink>

        <RouterLink to="/#contact">
          <span>Let's talk</span>
          <b>↗</b>
        </RouterLink>
      </div>
    </div>
  </main>

  <!-- API error -->
  <main
    v-else-if="portfolioState.error"
    class="inner-page section-wrap api-loading"
    role="alert"
  >
    <div class="state-icon">!</div>

    <p class="eyebrow">
      <i></i>
      Something went wrong
    </p>

    <h1>Project details<br /><em>couldn't load.</em></h1>

    <p>
      There was a problem loading this project. Please try again.
    </p>

    <button
      class="button button-outline"
      type="button"
      @click="loadPortfolio({ force: true })"
    >
      Try again
      <span>↻</span>
    </button>
  </main>

  <!-- Loading -->
  <main
    v-else
    class="inner-page section-wrap api-loading"
    aria-live="polite"
  >
    <div class="loading-orb">
      <span></span>
    </div>

    <p class="eyebrow">
      <i></i>
      Loading project
    </p>

    <p>Preparing project details…</p>
  </main>
</template>

<style scoped>
.detail-heading .eyebrow {
  margin: 0 0 18px;
}
.detail-heading h1 {
  margin: 0;
  font-size: clamp(52px, 7.5vw, 82px);
  line-height: 1.02;
}
.page-endnote {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 45px;
  padding: 19px 23px;
  border-radius: 9px;
}
.page-endnote > span {
  color: var(--faint);
  font: 8px var(--mono);
  letter-spacing: 0.1em;
}
.page-endnote a {
  color: var(--mint);
  font-size: 10px;
}
.page-endnote a span {
  margin-left: 10px;
}
.detail-page {
  padding-top: 142px;
}
.back-link {
  display: inline-flex;
  gap: 9px;
  margin-bottom: 45px;
  color: var(--mint);
  font-size: 11px;
}
.back-link span {
  color: var(--muted);
}
.detail-heading {
  max-width: 830px;
}
.detail-heading h1 {
  font-size: clamp(52px, 7vw, 78px);
}
.detail-heading .eyebrow span {
  padding-inline: 6px;
  color: var(--faint);
}
.detail-deck {
  max-width: 570px;
  margin: 18px 0 29px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.8;
}
.detail-art {
  position: relative;
  width: 100%;
  aspect-ratio: 1.9;
  overflow: hidden;
  border-radius: 11px;
  background: linear-gradient(
    135deg,
    rgba(214, 235, 222, 0.07),
    rgba(255, 255, 255, 0.02)
  );
}
.detail-art::after {
  position: absolute;
  inset: 12% 25%;
  border: 1px solid rgba(181, 215, 201, 0.15);
  border-radius: 9px;
  content: "";
  transform: rotate(-3deg);
  background: rgba(17, 28, 27, 0.35);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.18);
}
.detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 34px 10%;
  max-width: 840px;
  margin: 53px auto 0;
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
.detail-features {
  padding: 19px;
  border-radius: 10px;
}
.detail-features ul {
  display: grid;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.detail-features li {
  color: var(--muted);
  font-size: 10px;
}
.detail-features li::before {
  margin-right: 9px;
  color: var(--mint);
  content: "↗";
}
.detail-content .tag-list {
  display: flex;
}
.detail-content .tag-list li {
  padding: 6px 9px;
  border: 1px solid var(--line);
  border-radius: 4px;
  color: #aeb9b3;
  font-size: 8px;
}
.api-loading {
  padding-top: 205px;
  color: var(--muted);
  font-size: 11px;
}
@media (max-width: 720px) {
  .detail-page {
    padding-top: 124px;
  }
  .back-link {
    margin-bottom: 36px;
  }
  .detail-heading h1 {
    font-size: clamp(49px, 10vw, 68px);
  }
  .detail-art {
    aspect-ratio: 1.35;
  }
  .detail-content {
    grid-template-columns: 1fr;
    gap: 26px;
    margin-top: 37px;
  }
  .page-endnote {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
}
@media (max-width: 420px) {
  .detail-art {
    aspect-ratio: 1.05;
  }
}


/* =========================================================
   PROJECT DETAIL
   Premium editorial / liquid glass / spatial UI
   ========================================================= */

.detail-page {
  --detail-ink: #151515;
  --detail-muted: #77756f;
  --detail-soft: #9a9892;
  --detail-accent: #8a7357;

  --detail-line: rgba(21, 21, 21, 0.1);
  --detail-glass: rgba(255, 255, 255, 0.52);
  --detail-glass-strong: rgba(255, 255, 255, 0.72);

  position: relative;
  isolation: isolate;

  padding-top: clamp(110px, 13vw, 180px);
  padding-bottom: 100px;

  overflow: hidden;
}

/* Atmospheric background */
.detail-page::before {
  content: "";
  position: absolute;
  width: 760px;
  height: 760px;

  top: -340px;
  right: -260px;

  border-radius: 50%;
  pointer-events: none;
  z-index: -2;

  background:
    radial-gradient(
      circle,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0.35) 38%,
      transparent 70%
    );

  filter: blur(15px);
}

.detail-page::after {
  content: "";
  position: absolute;
  inset: 0;

  pointer-events: none;
  z-index: -3;

  opacity: 0.3;

  background-image:
    linear-gradient(
      rgba(21, 21, 21, 0.055) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(21, 21, 21, 0.055) 1px,
      transparent 1px
    );

  background-size: 80px 80px;

  mask-image: linear-gradient(
    to bottom,
    transparent,
    black 15%,
    black 80%,
    transparent
  );
}

/* =========================================================
   BACK LINK
   ========================================================= */

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;

  margin-bottom: clamp(48px, 7vw, 88px);

  color: var(--detail-muted);

  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;

  text-decoration: none;

  transition:
    color 220ms ease,
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.back-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 34px;
  height: 34px;

  border: 1px solid var(--detail-line);
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.4);

  transition:
    background 220ms ease,
    border-color 220ms ease,
    transform 260ms ease;
}

.back-link:hover {
  color: var(--detail-ink);
  transform: translateX(-4px);
}

.back-link:hover .back-arrow {
  border-color: rgba(21, 21, 21, 0.2);
  background: rgba(255, 255, 255, 0.8);
  transform: translateX(-3px);
}

.back-link:focus-visible {
  outline: 2px solid rgba(138, 115, 87, 0.4);
  outline-offset: 5px;
}

/* =========================================================
   HEADING
   ========================================================= */

.detail-heading {
  position: relative;
  max-width: 1120px;
  margin: 0 auto;

  text-align: left;
}

.detail-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  margin-bottom: 28px;
}

.detail-page .eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 9px;

  margin: 0;

  color: var(--detail-muted);

  font-size: 0.68rem;
  line-height: 1.3;
  font-weight: 750;

  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.detail-page .eyebrow i {
  width: 6px;
  height: 6px;

  flex: 0 0 auto;

  border-radius: 50%;

  background: var(--detail-accent);

  box-shadow:
    0 0 0 5px rgba(138, 115, 87, 0.08),
    0 0 18px rgba(138, 115, 87, 0.2);
}

.detail-number {
  color: rgba(21, 21, 21, 0.35);

  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.15em;
}

/* Main project title */
.detail-heading h1 {
  max-width: 1050px;
  margin: 0;

  color: var(--detail-ink);

  font-size: clamp(4rem, 9vw, 9.5rem);
  line-height: 0.87;
  letter-spacing: -0.075em;
  font-weight: 650;

  text-wrap: balance;
}

/* Decorative italic effect */
.detail-heading h1::first-letter {
  letter-spacing: -0.09em;
}

/* Description */
.detail-deck {
  max-width: 700px;

  margin: clamp(30px, 4vw, 48px) 0 0;

  color: var(--detail-muted);

  font-size: clamp(1rem, 1.5vw, 1.25rem);
  line-height: 1.75;
}

/* =========================================================
   TAGS
   ========================================================= */

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  margin: 30px 0 0;
  padding: 0;

  list-style: none;
}

.tag-list li {
  padding: 8px 12px;

  border: 1px solid rgba(21, 21, 21, 0.09);
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.38);

  color: rgba(21, 21, 21, 0.62);

  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.07em;

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  transition:
    background 200ms ease,
    transform 200ms ease,
    border-color 200ms ease;
}

.tag-list li:hover {
  background: rgba(255, 255, 255, 0.75);
  border-color: rgba(21, 21, 21, 0.16);
  transform: translateY(-2px);
}

/* =========================================================
   PROJECT LINKS
   ========================================================= */

.detail-project-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  margin-top: 36px;
}

.detail-page .button {
  min-height: 52px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 13px;

  padding: 0 21px;

  border-radius: 999px;

  font-size: 0.68rem;
  font-weight: 750;
  letter-spacing: 0.09em;
  text-transform: uppercase;

  text-decoration: none;

  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 280ms ease,
    background 220ms ease;
}

.detail-page .button span:last-child {
  font-size: 1rem;

  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.detail-page .button:hover {
  transform: translateY(-4px);
}

.detail-page .button:hover span:last-child {
  transform: translate(3px, -3px);
}

.detail-page .button:focus-visible {
  outline: 3px solid rgba(138, 115, 87, 0.25);
  outline-offset: 4px;
}

.detail-page .button-primary {
  color: #fff;
  background: #171717;
  border: 1px solid #171717;

  box-shadow:
    0 14px 35px rgba(21, 21, 21, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.detail-page .button-primary:hover {
  box-shadow:
    0 20px 45px rgba(21, 21, 21, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.detail-page .button-outline {
  color: var(--detail-ink);

  background: rgba(255, 255, 255, 0.4);

  border: 1px solid rgba(21, 21, 21, 0.13);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  box-shadow:
    0 10px 30px rgba(21, 21, 21, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.detail-page .button-outline:hover {
  background: rgba(255, 255, 255, 0.72);
}

/* =========================================================
   GALLERY
   ========================================================= */

.detail-gallery {
  position: relative;

  max-width: 1160px;
  margin: clamp(70px, 9vw, 125px) auto 0;

  padding: 10px;

  overflow: hidden;

  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: clamp(24px, 3vw, 38px);

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.72),
      rgba(255, 255, 255, 0.32)
    );

  box-shadow:
    0 40px 100px rgba(30, 30, 30, 0.1),
    0 10px 30px rgba(30, 30, 30, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);

  backdrop-filter: blur(24px) saturate(120%);
  -webkit-backdrop-filter: blur(24px);
}

.gallery-frame {
  position: relative;

  aspect-ratio: 16 / 9;

  overflow: hidden;

  border-radius: clamp(17px, 2.2vw, 28px);

  background:
    linear-gradient(
      135deg,
      #e7e5df,
      #f7f6f2
    );
}

.gallery-frame img {
  position: relative;
  z-index: 2;

  display: block;

  width: 100%;
  height: 100%;

  object-fit: cover;

  transition:
    transform 800ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 500ms ease;
}

.detail-gallery:hover .gallery-frame img {
  transform: scale(1.018);
}

/* Background glow behind image */
.gallery-glow {
  position: absolute;
  inset: -20%;

  background:
    radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.8),
      transparent 35%
    ),
    radial-gradient(
      circle at 75% 70%,
      rgba(180, 165, 145, 0.22),
      transparent 38%
    );

  filter: blur(25px);

  z-index: 0;
}

.gallery-overlay {
  position: absolute;
  inset: 0;

  z-index: 3;

  pointer-events: none;

  background:
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.12),
      transparent 22%,
      transparent 68%,
      rgba(0, 0, 0, 0.16)
    );
}

/* Counter */
.gallery-counter {
  position: absolute;
  z-index: 5;

  top: 20px;
  left: 20px;

  display: flex;
  align-items: center;
  gap: 9px;

  padding: 9px 12px;

  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;

  background: rgba(20, 20, 20, 0.24);

  color: rgba(255, 255, 255, 0.88);

  font-size: 0.58rem;
  font-weight: 750;
  letter-spacing: 0.1em;

  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
}

.gallery-counter i {
  width: 18px;
  height: 1px;

  background: rgba(255, 255, 255, 0.38);
}

/* Gallery buttons */
.gallery-controls {
  position: absolute;
  z-index: 6;

  right: 20px;
  bottom: 20px;

  display: flex;
  gap: 8px;
}

.gallery-controls button {
  width: 48px;
  height: 48px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;

  background: rgba(20, 20, 20, 0.28);

  color: #fff;

  cursor: pointer;

  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);

  transition:
    transform 220ms ease,
    background 220ms ease,
    border-color 220ms ease;
}

.gallery-controls button:hover {
  transform: translateY(-3px);
  background: rgba(20, 20, 20, 0.52);
  border-color: rgba(255, 255, 255, 0.55);
}

.gallery-controls button:active {
  transform: translateY(0);
}

.gallery-controls button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

/* Caption */
.gallery-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  min-height: 52px;
  padding: 7px 8px 1px;

  color: var(--detail-muted);

  font-size: 0.67rem;
  line-height: 1.5;
}

.gallery-caption span:last-child {
  flex: 0 0 auto;

  font-weight: 700;
  letter-spacing: 0.08em;
}

/* =========================================================
   IMAGE FALLBACK
   ========================================================= */

.detail-art {
  position: relative;

  max-width: 1160px;
  min-height: 550px;

  margin: clamp(70px, 9vw, 125px) auto 0;

  display: grid;
  place-items: center;

  overflow: hidden;

  border-radius: clamp(24px, 3vw, 38px);

  background:
    radial-gradient(
      circle at 50% 40%,
      rgba(255, 255, 255, 0.8),
      transparent 42%
    ),
    rgba(255, 255, 255, 0.42);

  border: 1px solid rgba(255, 255, 255, 0.8);

  box-shadow:
    0 40px 100px rgba(30, 30, 30, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);

  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.art-grid {
  position: absolute;
  inset: 0;

  opacity: 0.35;

  background-image:
    linear-gradient(
      rgba(21, 21, 21, 0.08) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(21, 21, 21, 0.08) 1px,
      transparent 1px
    );

  background-size: 60px 60px;

  mask-image: radial-gradient(
    circle,
    black,
    transparent 72%
  );
}

.art-content {
  position: relative;
  z-index: 2;

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;
}

.art-index {
  margin-bottom: 20px;

  color: var(--detail-accent);

  font-size: 0.62rem;
  font-weight: 750;
  letter-spacing: 0.15em;
}

.art-content strong {
  color: rgba(21, 21, 21, 0.1);

  font-size: clamp(5rem, 14vw, 11rem);
  line-height: 0.85;
  letter-spacing: -0.08em;
}

.art-content > span:last-child {
  margin-top: 25px;

  color: var(--detail-muted);

  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}

/* =========================================================
   PROJECT CONTENT
   ========================================================= */

.detail-content {
  max-width: 960px;

  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(220px, 0.7fr);
  gap: clamp(50px, 9vw, 130px);

  margin: clamp(70px, 9vw, 120px) auto 0;

  padding-top: 60px;

  border-top: 1px solid var(--detail-line);
}

.detail-content section {
  position: relative;
}

.detail-content section:first-child {
  max-width: 650px;
}

.detail-content section:nth-child(2) {
  padding-left: 30px;

  border-left: 1px solid var(--detail-line);
}

.detail-content .eyebrow {
  margin-bottom: 22px;
}

.detail-content section > p:last-child {
  margin: 0;

  color: var(--detail-muted);

  font-size: 1rem;
  line-height: 1.85;
}

/* =========================================================
   END NOTE
   ========================================================= */

.project-neighbors {
  max-width: 1160px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: clamp(45px, 7vw, 78px) auto 0;
}

.project-neighbor {
  min-width: 0;
  min-height: 84px;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 16px 20px;
  border: 1px solid var(--detail-line);
  border-radius: 16px;
  color: var(--detail-ink);
  background: rgba(15, 22, 47, .54);
  text-decoration: none;
  transition: transform 220ms ease, border-color 220ms ease, background 220ms ease;
}

.project-neighbor:hover {
  transform: translateY(-2px);
  border-color: rgba(196,181,253,.3);
  background: rgba(196,181,253,.08);
}

.project-neighbor > span:first-child[aria-hidden="true"] { font-size: 20px; }
.project-neighbor-next { justify-content: flex-end; text-align: right; }
.project-neighbor-next > span:last-child { font-size: 20px; }
.project-neighbor small,
.project-neighbor strong { display: block; }
.project-neighbor small { margin-bottom: 5px; color: var(--detail-muted); font-size: .62rem; }
.project-neighbor strong { overflow-wrap: anywhere; font-size: .9rem; }

.page-endnote {
  max-width: 1160px;

  margin: clamp(80px, 11vw, 150px) auto 0;
  padding: clamp(25px, 4vw, 42px);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;

  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 28px;

  background:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.66),
      rgba(255, 255, 255, 0.3)
    );

  box-shadow:
    0 25px 70px rgba(30, 30, 30, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);

  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.endnote-label {
  display: flex;
  align-items: center;
  gap: 10px;

  color: var(--detail-muted);

  font-size: 0.62rem;
  font-weight: 750;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.endnote-label i {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: var(--detail-accent);
}

.detail-next-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-next-links a {
  min-height: 44px;

  display: inline-flex;
  align-items: center;
  gap: 15px;

  padding: 0 17px;

  border: 1px solid rgba(21, 21, 21, 0.09);
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.35);

  color: var(--detail-ink);

  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;

  text-decoration: none;

  transition:
    transform 230ms ease,
    background 230ms ease,
    border-color 230ms ease;
}

.detail-next-links a span {
  white-space: nowrap;
}

.detail-next-links a b {
  font-size: 1rem;
  font-weight: 500;

  transition: transform 230ms ease;
}

.detail-next-links a:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(21, 21, 21, 0.15);
}

.detail-next-links a:hover b {
  transform: translate(3px, -2px);
}

/* =========================================================
   LOADING / ERROR STATES
   ========================================================= */

.api-loading {
  min-height: 70vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
}

.api-loading .eyebrow {
  margin: 25px 0 14px;
}

.api-loading > p:not(.eyebrow) {
  margin: 0 0 28px;

  color: var(--detail-muted);

  line-height: 1.7;
}

.api-loading h1 {
  margin: 0 0 20px;

  color: var(--detail-ink);

  font-size: clamp(3rem, 7vw, 6rem);
  line-height: 0.9;
  letter-spacing: -0.06em;
}

.api-loading h1 em {
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 400;
}

.api-loading .button {
  display: inline-flex;
  align-items: center;
  gap: 12px;

  min-height: 50px;
  padding: 0 22px;

  border: 1px solid rgba(21, 21, 21, 0.13);
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.42);

  cursor: pointer;

  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.state-icon {
  width: 62px;
  height: 62px;

  display: grid;
  place-items: center;

  border-radius: 50%;

  color: var(--detail-ink);

  font-size: 1.3rem;
  font-weight: 700;

  background: rgba(255, 255, 255, 0.6);

  border: 1px solid rgba(21, 21, 21, 0.08);

  box-shadow:
    0 20px 50px rgba(21, 21, 21, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

/* Loading orb */
.loading-orb {
  width: 72px;
  height: 72px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(21, 21, 21, 0.08);
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.5);

  box-shadow:
    0 20px 50px rgba(21, 21, 21, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);

  animation: loadingFloat 2.5s ease-in-out infinite;
}

.loading-orb span {
  width: 12px;
  height: 12px;

  border-radius: 50%;

  background: var(--detail-accent);

  box-shadow:
    0 0 0 8px rgba(138, 115, 87, 0.08),
    0 0 30px rgba(138, 115, 87, 0.22);

  animation: loadingPulse 1.5s ease-in-out infinite;
}

@keyframes loadingFloat {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

@keyframes loadingPulse {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.55;
  }

  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (min-width: 1500px) {
  .detail-page {
    padding-top: 170px;
  }

  .detail-heading {
    max-width: 1200px;
  }

  .detail-heading h1 {
    font-size: 9.5rem;
  }
}

@media (max-width: 1000px) {
  .detail-page {
    padding-top: 120px;
  }

  .detail-heading h1 {
    font-size: clamp(4rem, 10vw, 7rem);
  }

  .detail-content {
    gap: 50px;
  }

  .page-endnote {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 760px) {
  .detail-page {
    padding-top: 100px;
    padding-bottom: 70px;
  }

  .detail-page::after {
    background-size: 52px 52px;
  }

  .back-link {
    margin-bottom: 55px;
  }

  .detail-meta-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .detail-number {
    display: none;
  }

  .detail-heading h1 {
    font-size: clamp(3.5rem, 15vw, 6rem);
    line-height: 0.9;
  }

  .detail-deck {
    margin-top: 28px;
    font-size: 0.95rem;
  }

  .detail-project-links {
    flex-direction: column;
    align-items: stretch;
  }

  .detail-page .button {
    width: 100%;
  }

  .detail-gallery {
    margin-top: 65px;
    padding: 6px;
    border-radius: 22px;
  }

  .gallery-frame {
    aspect-ratio: 4 / 3;
    border-radius: 17px;
  }

  .gallery-counter {
    top: 12px;
    left: 12px;
  }

  .gallery-controls {
    right: 12px;
    bottom: 12px;
  }

  .gallery-controls button {
    width: 42px;
    height: 42px;
  }

  .gallery-caption {
    min-height: 46px;
    padding-inline: 7px;
    font-size: 0.6rem;
  }

  .detail-art {
    min-height: 400px;
    margin-top: 65px;
    border-radius: 22px;
  }

  .detail-content {
    grid-template-columns: 1fr;
    gap: 45px;

    margin-top: 65px;
    padding-top: 45px;
  }

  .detail-content section:nth-child(2) {
    padding-left: 0;
    padding-top: 35px;

    border-left: 0;
    border-top: 1px solid var(--detail-line);
  }

  .detail-content section > p:last-child {
    font-size: 0.92rem;
  }

  .page-endnote {
    margin-top: 75px;
    padding: 25px;

    border-radius: 22px;
  }

  .detail-next-links {
    width: 100%;

    display: grid;
    grid-template-columns: 1fr;
  }

  .project-neighbors { grid-template-columns: 1fr; }

  .detail-next-links a {
    justify-content: space-between;
  }
}

@media (max-width: 430px) {
  .detail-page {
    padding-left: 17px;
    padding-right: 17px;
  }

  .back-link {
    font-size: 0.62rem;
  }

  .detail-heading h1 {
    font-size: 3.35rem;
  }

  .tag-list {
    gap: 6px;
  }

  .tag-list li {
    padding: 7px 10px;
    font-size: 0.58rem;
  }

  .gallery-frame {
    aspect-ratio: 1 / 0.82;
  }

  .gallery-caption {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding-block: 10px;
  }

  .detail-art {
    min-height: 330px;
  }

  .art-content strong {
    font-size: 5rem;
  }

  .page-endnote {
    padding: 21px;
  }

  .endnote-label {
    font-size: 0.57rem;
  }
}

/* =========================================================
   REDUCED MOTION
   ========================================================= */

@media (prefers-reduced-motion: reduce) {
  .detail-page *,
  .detail-page *::before,
  .detail-page *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}


.detail-deck, .detail-content p { color: #a6afcc; }
.tag-list li { color: #c7cdec; border-color: rgba(196,181,253,.18); background: rgba(196,181,253,.06); }
.detail-gallery, .page-endnote { background: rgba(12,18,42,.78); }
.detail-content section { border-color: rgba(190,202,255,.13); }
.detail-page { --detail-ink: #edf0ff; --detail-muted: #a6afcc; --detail-soft: #7e89aa; --detail-accent: #c4b5fd; --detail-line: rgba(190,202,255,.14); --detail-glass: rgba(15,22,47,.7); --detail-glass-strong: rgba(10,15,34,.92); }
.detail-page .detail-art, .detail-page .page-endnote, .detail-page .state-icon, .detail-page .loading-orb { color: #edf0ff !important; border-color: rgba(196,181,253,.17) !important; background: linear-gradient(145deg,rgba(18,24,51,.82),rgba(8,13,31,.82)) !important; box-shadow: 0 22px 58px rgba(0,0,0,.3), inset 0 1px rgba(255,255,255,.07) !important; }
.detail-page .detail-art strong { color: rgba(196,181,253,.16) !important; }
.detail-page .detail-next-links a { color: #e5eaff !important; border-color: rgba(196,181,253,.18) !important; background: rgba(196,181,253,.06) !important; }
</style>
