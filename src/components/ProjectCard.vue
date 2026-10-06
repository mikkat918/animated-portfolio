<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({ project: { type: Object, required: true } });
const imageFailed = ref(false);
const fallbackFailed = ref(false);
const imageUrl = computed(() =>
  imageFailed.value
    ? props.project.fallbackImage || ""
    : props.project.previewImage || props.project.fallbackImage || "",
);
watch(
  () => [props.project.previewImage, props.project.fallbackImage],
  () => {
  imageFailed.value = false;
    fallbackFailed.value = false;
  },
);

const technologies = computed(() => [
  ...new Set([
    ...(Array.isArray(props.project.languages) ? props.project.languages : []),
    ...(props.project.language ? [props.project.language] : []),
  ]),
]);

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function failImage() {
  if (!imageFailed.value && props.project.fallbackImage && props.project.previewImage) {
    imageFailed.value = true;
  } else {
    fallbackFailed.value = true;
  }
}
</script>

<template>
  <article class="feature-project glass-panel">
    <!-- Project visual -->
    <RouterLink
      class="project-preview"
      :to="`/projects/${project.id || project.slug}`"
      :aria-label="`View ${project.title} project details`"
    >
      <div class="preview-surface">
        <!-- Real project image -->
        <img
          v-if="imageUrl && !fallbackFailed"
          class="project-preview-image"
          :src="imageUrl"
          :alt="project.title + ' project preview'"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 720px) 100vw, 60vw"
          @error="failImage"
        />

        <!-- Generated fallback -->
        <template v-else>
          <div class="fallback-art" aria-hidden="true">
            <div class="fallback-glow fallback-glow-one"></div>
            <div class="fallback-glow fallback-glow-two"></div>

            <span class="project-index-label">
              <small>PROJECT INDEX</small>
              <b>{{ project.id || project.slug }}</b>
            </span>

            <div class="preview-grid"></div>

            <div class="preview-window">
              <div class="preview-bar">
                <div class="window-dots">
                  <i></i>
                  <i></i>
                  <i></i>
                </div>

                <span>PROJECT / {{ project.title }}</span>

                <em>01</em>
              </div>

              <div class="preview-body">
                <div class="preview-rail">
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </div>

                <div class="preview-content">
                  <div class="preview-heading"></div>

                  <div class="preview-lines">
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                    <i></i>
                  </div>

                  <div class="preview-blocks">
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Preview overlay -->
        <div class="preview-overlay" aria-hidden="true">
          <span class="preview-overlay-label">View project</span>

          <span class="preview-arrow">↗</span>
        </div>

        <!-- Project number -->
        <span class="preview-number" aria-hidden="true">
          {{ project.id || project.slug }}
        </span>

        <span class="preview-caption">
          PROJECT PREVIEW
        </span>
      </div>
    </RouterLink>

    <!-- Project information -->
    <div class="project-info">
      <div class="project-info-meta">
        <div class="project-status">
          <span class="status-dot"></span>
          <p class="eyebrow">
            {{ project.status || "Project" }}
          </p>
        </div>

        <span v-if="project.updatedAt" class="project-date">
          {{ formatDate(project.updatedAt) }}
        </span>
      </div>

      <div class="project-title-row">
        <h3>{{ project.title }}</h3>

        <span class="title-mark" aria-hidden="true">
          ↗
        </span>
      </div>

      <p class="project-description">
        {{
          project.description ||
          project.readmeSummary ||
          "No description has been added to this repository yet."
        }}
      </p>

      <!-- Technologies -->
      <ul
        v-if="technologies.length || project.topics?.length"
        class="project-tags"
        aria-label="Project technologies and topics"
      >
        <li
          v-for="technology in technologies"
          :key="technology"
        >
          <span class="tag-dot"></span>
          {{ technology }}
        </li>

        <li
          v-for="topic in project.topics || []"
          :key="topic"
        >
          <span class="tag-dot"></span>
          {{ topic }}
        </li>
      </ul>

      <!-- Actions -->
      <div class="project-card-actions">
        <RouterLink
          class="project-link"
          :to="`/projects/${project.id || project.slug}`"
        >
          <span>View details</span>
          <span class="action-arrow" aria-hidden="true">→</span>
        </RouterLink>

        <div class="external-links">
          <a
            v-if="project.liveUrl || project.live"
            class="project-external-link"
            :href="project.liveUrl || project.live"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`Open ${project.title} live site in a new tab`"
          >
            Live site
            <span aria-hidden="true">↗</span>
          </a>

          <a
            v-if="project.repoUrl || project.github"
            class="project-external-link"
            :href="project.repoUrl || project.github"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`Open ${project.title} source repository in a new tab`"
          >
            Source
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.project-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--mint);
  font-size: 10px;
  font-weight: 600;
}
.project-link span {
  font-size: 15px;
  transition: transform 200ms;
}
.project-link:hover span {
  transform: translateX(4px);
}
.feature-project {
  display: grid;
  min-height: 362px;
  grid-template-columns: 1.2fr 0.83fr;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(
    110deg,
    rgba(213, 234, 224, 0.075),
    rgba(255, 255, 255, 0.026)
  );
  box-shadow:
    var(--shadow-soft),
    inset 0 1px rgba(255, 255, 255, 0.035);
  transition:
    border-color 250ms,
    transform 300ms var(--ease);
}
.feature-project:hover {
  transform: translateY(-3px);
  border-color: rgba(181, 215, 201, 0.24);
}
.project-preview {
  position: relative;
  display: grid;
  min-height: 362px;
  place-items: center;
  overflow: hidden;
  border-right: 1px solid var(--line);
  background:
    radial-gradient(
      ellipse at 55% 45%,
      rgba(121, 163, 145, 0.08),
      transparent 58%
    ),
    rgba(6, 15, 15, 0.18);
}
.project-index-label, .preview-caption {
  position: absolute;
  z-index: 2;
  left: 22px;
  color: #82918a;
  font: 7px/1.8 var(--mono);
  letter-spacing: 0.06em;
}
.project-index-label {
  top: 20px;
}
.project-index-label b {
  color: #c5d7cc;
  font-size: 13px;
  font-weight: 400;
}
.preview-caption {
  right: 17px;
  bottom: 14px;
  left: auto;
  color: #687873;
  font-size: 6px;
}
.preview-grid {
  position: absolute;
  inset: 0;
  opacity: 0.2;
  background-image:
    linear-gradient(rgba(191, 219, 203, 0.13) 1px, transparent 1px),
    linear-gradient(90deg, rgba(191, 219, 203, 0.13) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: linear-gradient(
    90deg,
    transparent,
    black 20%,
    black 80%,
    transparent
  );
}
.preview-window {
  position: relative;
  width: 54%;
  aspect-ratio: 1.37;
  overflow: hidden;
  transform: rotate(-3deg) translateY(5px);
  border: 1px solid rgba(187, 216, 198, 0.25);
  border-radius: 9px;
  background: rgba(17, 28, 27, 0.75);
  box-shadow: 0 22px 52px rgba(0, 0, 0, 0.23);
  transition:
    transform 380ms var(--ease),
    border-color 250ms;
}
.feature-project:hover .preview-window {
  transform: rotate(-0.5deg) translateY(-2px) scale(1.015);
  border-color: rgba(187, 216, 198, 0.39);
}
.preview-bar {
  display: flex;
  height: 34px;
  align-items: center;
  gap: 5px;
  padding-inline: 10px;
  border-bottom: 1px solid var(--line);
  color: #72827b;
}
.preview-bar i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #a9b9ab;
  opacity: 0.65;
}
.preview-bar i:first-child {
  background: #d6ab91;
}
.preview-bar span {
  margin-left: auto;
  font: 6px var(--mono);
}
.preview-body {
  display: grid;
  height: calc(100% - 34px);
  grid-template-columns: 24% 1fr;
}
.preview-rail {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 17px 8px;
  border-right: 1px solid var(--line);
}
.preview-rail i, .preview-lines i {
  display: block;
  height: 4px;
  border-radius: 4px;
  background: rgba(170, 199, 181, 0.25);
}
.preview-rail i:nth-child(2) {
  width: 72%;
}
.preview-rail i:nth-child(3) {
  width: 61%;
}
.preview-lines {
  display: grid;
  align-content: start;
  gap: 9px;
  padding: 20px 12px;
}
.preview-lines i {
  width: 72%;
  height: 5px;
  background: rgba(170, 199, 181, 0.33);
}
.preview-lines i:nth-child(2) {
  width: 46%;
}
.preview-lines i:nth-child(3) {
  width: 91%;
  height: 2px;
  margin-top: 5px;
}
.preview-lines i:nth-child(4) {
  width: 78%;
  height: 2px;
}
.preview-lines i:nth-child(5) {
  width: 83%;
  height: 2px;
}
.project-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 39px 39px 37px;
}
.project-info-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.project-info-meta .eyebrow {
  margin: 0;
  font-size: 7px;
}
.project-info-meta > span {
  color: var(--faint);
  font: 6px var(--mono);
  letter-spacing: 0.05em;
}
.project-info h3 {
  margin: 17px 0 9px;
  color: #e6e9e2;
  font: 500 32px var(--serif);
  letter-spacing: -0.03em;
}
.project-info > p {
  max-width: 400px;
  margin: 0;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.75;
}
.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 19px 0 20px;
  padding: 0;
  list-style: none;
}
.project-tags li {
  padding: 6px 9px;
  border: 1px solid var(--line);
  border-radius: 4px;
  color: #9ba8a1;
  font: 7px var(--mono);
}
.project-link {
  margin-top: 3px;
}
@media (max-width: 720px) {
  .feature-project {
    grid-template-columns: 1fr;
  }
  .project-preview {
    min-height: unset;
    aspect-ratio: 1.6;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
  .preview-window {
    width: 53%;
  }
  .project-info {
    padding: 26px 23px;
  }
  .project-info h3 {
    font-size: 29px;
  }
}
@media (max-width: 420px) {
  .project-preview {
    aspect-ratio: 1.25;
  }
  .project-info-meta > span {
    font-size: 5px;
  }
}


/* =========================================================
   FEATURE PROJECT CARD
   Premium editorial / liquid glass / spatial UI
   ========================================================= */

.feature-project {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);

  overflow: hidden;

  border: 1px solid rgba(255, 255, 255, 0.78);
  border-radius: 30px;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.76),
      rgba(248, 250, 252, 0.58)
    );

  box-shadow:
    0 24px 70px rgba(15, 23, 42, 0.075),
    0 5px 20px rgba(15, 23, 42, 0.035),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);

  backdrop-filter: blur(24px) saturate(135%);
  -webkit-backdrop-filter: blur(24px) saturate(135%);

  isolation: isolate;

  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.45s ease,
    border-color 0.45s ease;
}

.feature-project::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;

  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(167, 139, 250, 0.09),
      transparent 30%
    ),
    radial-gradient(
      circle at 100% 100%,
      rgba(96, 165, 250, 0.06),
      transparent 32%
    );
}

.feature-project:hover {
  transform: translateY(-5px);

  border-color: rgba(255, 255, 255, 0.95);

  box-shadow:
    0 34px 90px rgba(15, 23, 42, 0.11),
    0 10px 30px rgba(15, 23, 42, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 1);
}

/* =========================================================
   PROJECT PREVIEW
   ========================================================= */

.project-preview {
  position: relative;
  display: block;
  min-height: 390px;
  overflow: hidden;

  color: inherit;
  text-decoration: none;

  background: #eef1f6;
}

.preview-surface {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.project-preview-image {
  width: 100%;
  height: 100%;
  display: block;

  object-fit: cover;

  filter: saturate(0.92);
  transform: scale(1.001);

  transition:
    transform 0.8s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.6s ease;
}

.feature-project:hover .project-preview-image {
  transform: scale(1.045);
  filter: saturate(1.04);
}

/* =========================================================
   FALLBACK ART
   ========================================================= */

.fallback-art {
  position: absolute;
  inset: 0;
  overflow: hidden;

  background:
    radial-gradient(
      circle at 20% 15%,
      rgba(167, 139, 250, 0.2),
      transparent 30%
    ),
    radial-gradient(
      circle at 85% 80%,
      rgba(96, 165, 250, 0.13),
      transparent 35%
    ),
    linear-gradient(
      145deg,
      #f8fafc 0%,
      #eef2f7 52%,
      #e9edf4 100%
    );
}

.fallback-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  pointer-events: none;
}

.fallback-glow-one {
  width: 180px;
  height: 180px;
  top: -90px;
  right: -50px;
  background: rgba(139, 92, 246, 0.14);
}

.fallback-glow-two {
  width: 150px;
  height: 150px;
  bottom: -90px;
  left: -60px;
  background: rgba(59, 130, 246, 0.1);
}

.project-index-label {
  position: absolute;
  top: 24px;
  left: 25px;

  display: flex;
  flex-direction: column;
  gap: 4px;

  z-index: 3;
}

.project-index-label small {
  color: #94a3b8;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.2em;
}

.project-index-label b {
  color: #475569;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

/* Grid */
.preview-grid {
  position: absolute;
  inset: 0;

  opacity: 0.5;

  background-image:
    linear-gradient(
      rgba(100, 116, 139, 0.07) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(100, 116, 139, 0.07) 1px,
      transparent 1px
    );

  background-size: 42px 42px;

  mask-image: linear-gradient(
    to bottom,
    black,
    transparent 85%
  );
}

/* Fake browser window */
.preview-window {
  position: absolute;
  top: 50%;
  left: 50%;

  width: 74%;
  height: 57%;

  overflow: hidden;

  transform:
    translate(-50%, -45%)
    perspective(1000px)
    rotateX(3deg)
    rotateY(-4deg);

  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 15px;

  background: rgba(255, 255, 255, 0.72);

  box-shadow:
    0 25px 60px rgba(15, 23, 42, 0.12),
    0 5px 15px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);

  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  transition:
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.7s ease;
}

.feature-project:hover .preview-window {
  transform:
    translate(-50%, -48%)
    perspective(1000px)
    rotateX(1deg)
    rotateY(-1deg);

  box-shadow:
    0 32px 75px rgba(15, 23, 42, 0.15),
    0 7px 20px rgba(15, 23, 42, 0.07);
}

.preview-bar {
  height: 30px;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 0 10px;

  border-bottom: 1px solid rgba(148, 163, 184, 0.12);

  background: rgba(255, 255, 255, 0.58);

  color: #94a3b8;

  font-size: 6px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.preview-bar > span {
  overflow: hidden;
  flex: 1;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.preview-bar em {
  color: #cbd5e1;
  font-style: normal;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.window-dots {
  display: flex;
  gap: 4px;
}

.window-dots i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #d4d8df;
}

.preview-body {
  display: flex;
  height: calc(100% - 30px);
}

.preview-rail {
  width: 20%;
  padding: 18px 10px;

  border-right: 1px solid rgba(148, 163, 184, 0.1);
}

.preview-rail i {
  display: block;
  width: 100%;
  height: 4px;
  margin-bottom: 9px;

  border-radius: 999px;
  background: #dfe3e9;
}

.preview-rail i:first-child {
  width: 72%;
  background: #c9bdf0;
}

.preview-content {
  flex: 1;
  padding: 18px;
}

.preview-heading {
  width: 48%;
  height: 9px;
  margin-bottom: 14px;

  border-radius: 999px;
  background: #cbd2dc;
}

.preview-lines {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.preview-lines i {
  display: block;
  width: 100%;
  height: 4px;

  border-radius: 999px;
  background: #e0e4e9;
}

.preview-lines i:nth-child(2) {
  width: 82%;
}

.preview-lines i:nth-child(3) {
  width: 91%;
}

.preview-lines i:nth-child(4) {
  width: 64%;
}

.preview-lines i:nth-child(5) {
  width: 74%;
}

.preview-blocks {
  display: flex;
  gap: 7px;
  margin-top: 17px;
}

.preview-blocks span {
  width: 48%;
  height: 44px;

  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 7px;

  background:
    linear-gradient(
      145deg,
      rgba(226, 232, 240, 0.85),
      rgba(241, 245, 249, 0.5)
    );
}

/* =========================================================
   PREVIEW OVERLAY
   ========================================================= */

.preview-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(15, 23, 42, 0.22);

  opacity: 0;

  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);

  transition:
    opacity 0.4s ease,
    backdrop-filter 0.4s ease;
}

.feature-project:hover .preview-overlay {
  opacity: 1;

  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.preview-overlay-label {
  padding: 10px 14px;

  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;

  background: rgba(15, 23, 42, 0.7);
  color: #fff;

  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;

  transform: translateY(8px);
  transition: transform 0.4s ease;
}

.feature-project:hover .preview-overlay-label {
  transform: translateY(0);
}

.preview-arrow {
  position: absolute;
  right: 18px;
  bottom: 18px;

  width: 38px;
  height: 38px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.12);
  color: #fff;

  font-size: 15px;

  transform: translateY(8px);
  transition: transform 0.4s ease;
}

.feature-project:hover .preview-arrow {
  transform: translateY(0);
}

.preview-number {
  position: absolute;
  right: 22px;
  top: 20px;
  z-index: 6;

  padding: 6px 9px;

  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.56);
  color: #64748b;

  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 7px;
  font-weight: 700;

  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.preview-caption {
  position: absolute;
  left: 20px;
  bottom: 18px;
  z-index: 6;

  color: rgba(255, 255, 255, 0.85);

  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.16em;

  text-shadow: 0 2px 8px rgba(15, 23, 42, 0.25);
}

/* =========================================================
   PROJECT INFO
   ========================================================= */

.project-info {
  min-width: 0;
  display: flex;
  flex-direction: column;

  padding: 35px 36px 30px;
}

.project-info-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  margin-bottom: 22px;
}

.project-status {
  display: flex;
  align-items: center;
  gap: 7px;
}

.project-status .eyebrow {
  margin: 0;

  color: #7c3aed;

  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;
  background: #8b5cf6;

  box-shadow:
    0 0 0 4px rgba(139, 92, 246, 0.07);
}

.project-date {
  color: #a1a1aa;

  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.project-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.project-info h3 {
  max-width: 470px;
  margin: 0;

  color: #0f172a;

  font-size: clamp(28px, 3vw, 42px);
  font-weight: 620;
  line-height: 1.02;
  letter-spacing: -0.055em;
}

.title-mark {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(148, 163, 184, 0.17);
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.5);
  color: #94a3b8;

  font-size: 13px;

  transition:
    transform 0.3s ease,
    color 0.3s ease,
    background 0.3s ease;
}

.feature-project:hover .title-mark {
  transform: translate(2px, -2px);
  background: rgba(237, 233, 254, 0.7);
  color: #7c3aed;
}

.project-description {
  max-width: 500px;
  margin: 20px 0 0;

  color: #64748b;

  font-size: 12px;
  line-height: 1.8;
}

/* =========================================================
   TAGS
   ========================================================= */

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  margin: 23px 0 0;
  padding: 0;

  list-style: none;
}

.project-tags li {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  padding: 6px 9px;

  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.46);
  color: #64748b;

  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.05em;

  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease;
}

.project-tags li:hover {
  transform: translateY(-2px);
  border-color: rgba(124, 58, 237, 0.17);
  background: rgba(237, 233, 254, 0.48);
}

.tag-dot {
  width: 3px;
  height: 3px;

  border-radius: 50%;
  background: #a78bfa;
}

/* =========================================================
   ACTIONS
   ========================================================= */

.project-card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  margin-top: auto;
  padding-top: 30px;

  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: 9px;

  color: #0f172a;

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-decoration: none;

  transition:
    color 0.25s ease,
    gap 0.25s ease;
}

.project-link:hover {
  gap: 13px;
  color: #7c3aed;
}

.action-arrow {
  font-size: 15px;
  font-weight: 400;
}

.external-links {
  display: flex;
  align-items: center;
  gap: 13px;
}

.project-external-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  color: #94a3b8;

  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: none;

  transition:
    color 0.25s ease,
    transform 0.25s ease;
}

.project-external-link:hover {
  color: #475569;
  transform: translateY(-1px);
}

.project-external-link span {
  font-size: 10px;
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 1000px) {
  .feature-project {
    grid-template-columns: 1fr;
  }

  .project-preview {
    min-height: 360px;
  }

  .project-info {
    min-height: 350px;
    padding: 30px;
  }

  .project-info h3 {
    font-size: clamp(28px, 5vw, 40px);
  }
}

@media (max-width: 720px) {
  .feature-project {
    border-radius: 24px;
  }

  .project-preview {
    min-height: 300px;
  }

  .preview-window {
    width: 76%;
    height: 58%;
  }

  .project-info {
    min-height: auto;
    padding: 25px 23px 23px;
  }

  .project-info-meta {
    margin-bottom: 17px;
  }

  .project-description {
    margin-top: 15px;
    font-size: 11px;
    line-height: 1.75;
  }

  .project-tags {
    margin-top: 18px;
  }

  .project-card-actions {
    margin-top: 27px;
    padding-top: 22px;
  }
}

@media (max-width: 480px) {
  .feature-project {
    border-radius: 21px;
  }

  .project-preview {
    min-height: 250px;
  }

  .project-index-label {
    top: 17px;
    left: 17px;
  }

  .preview-number {
    top: 14px;
    right: 14px;
  }

  .preview-caption {
    left: 15px;
    bottom: 14px;
  }

  .preview-window {
    width: 82%;
    height: 57%;
  }

  .project-info {
    padding: 22px 18px 20px;
  }

  .project-info h3 {
    font-size: 27px;
  }

  .title-mark {
    width: 28px;
    height: 28px;
    flex-basis: 28px;
    font-size: 11px;
  }

  .project-date {
    font-size: 7px;
  }

  .project-card-actions {
    align-items: flex-start;
    flex-direction: column;
    gap: 17px;
  }

  .external-links {
    width: 100%;
    justify-content: space-between;
  }
}

/* =========================================================
   REDUCED MOTION
   ========================================================= */

@media (prefers-reduced-motion: reduce) {
  .feature-project,
  .feature-project *,
  .project-preview-image,
  .preview-window {
    animation: none !important;
    transition: none !important;
  }
}


.home-project-grid :deep(.feature-project) {
  min-width: 0;
  grid-template-columns: 1fr;
}
.home-project-grid :deep(.project-preview) {
  min-height: 0;
  aspect-ratio: 1.65;
  border-bottom: 1px solid var(--line);
}
.home-project-grid :deep(.project-info) {
  min-width: 0;
  padding: 23px;
}
.home-project-grid :deep(.project-info h3) {
  margin-top: 12px;
}

.project-info > p, .project-info-meta span, .project-external-link { color: #a6afcc; }
.project-info h3 { color: #edf0ff; }
.project-preview { background: linear-gradient(145deg,#101735,#090d20); }
.feature-project { background: rgba(12,18,42,.78); box-shadow: 0 18px 48px rgba(0,0,0,.24); }
.feature-project:hover { box-shadow: 0 24px 58px rgba(0,0,0,.38); }
.project-index-label, .preview-caption { color: #a6afcc; }
.project-info-meta .eyebrow { color: #a78bfa; }
.project-tags li { color: #c7cdec; border-color: rgba(196,181,253,.18); background: rgba(196,181,253,.06); }
.project-link { color: #dbe3ff; }
.feature-project { color: #edf0ff !important; border-color: rgba(196,181,253,.17) !important; background: linear-gradient(145deg,rgba(18,24,51,.88),rgba(8,13,31,.88)) !important; box-shadow: 0 22px 58px rgba(0,0,0,.3), inset 0 1px rgba(255,255,255,.07) !important; }
.feature-project .project-info h3, .feature-project .project-link { color: #edf0ff !important; }
.feature-project .project-description, .feature-project .project-date { color: #a6afcc !important; }
.feature-project .project-tags li { color: #d8ddf4 !important; border-color: rgba(196,181,253,.18) !important; background: rgba(196,181,253,.07) !important; }
.feature-project .project-preview { background: linear-gradient(145deg,#111735,#080d20) !important; }
</style>
