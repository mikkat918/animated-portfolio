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
  <main v-else-if="project" class="inner-page section-wrap detail-page">
    <RouterLink class="back-link" to="/projects"
      >← <span>Back to all projects</span></RouterLink
    >
    <div class="detail-heading" data-reveal>
      <p class="eyebrow">
        <i></i>{{ project.status || "Project" }}
        <span v-if="project.language || project.languages?.length">·</span>
        {{ languages.join(" · ") }}
      </p>
      <h1>{{ project.title }}</h1>
      <p class="detail-deck">{{ project.description || project.readmeSummary || "No description has been added to this repository yet." }}</p>
      <ul v-if="project.topics?.length || project.tags?.length" class="tag-list">
        <li v-for="topic in [...new Set([...(project.topics || []), ...(project.tags || [])])]" :key="topic">
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
          >Open live project ↗</a
        >
        <a
          v-if="project.repoUrl || project.github"
          class="button button-outline"
          :href="project.repoUrl || project.github"
          target="_blank"
          rel="noopener noreferrer"
          >View source ↗</a
        >
      </div>
    </div>
    <figure v-if="currentImage && !fallbackFailed" class="detail-gallery glass-panel" data-reveal>
      <img
        :key="imageSource"
        :src="imageSource"
        :alt="currentImage.alt || project.title + ' project image'"
        :loading="imageIndex === 0 ? 'eager' : 'lazy'"
        decoding="async"
        sizes="(max-width: 720px) 100vw, 1160px"
        @error="onImageError"
      />
      <figcaption v-if="currentImage.caption || gallery.length > 1">
        <span>{{ currentImage.caption }}</span>
        <span v-if="gallery.length > 1" aria-live="polite"
          >{{ imageIndex + 1 }} / {{ gallery.length }}</span
        >
      </figcaption>
      <div v-if="gallery.length > 1" class="gallery-controls">
        <button type="button" aria-label="Previous project image" @click="moveImage(-1)">
          <span aria-hidden="true">←</span>
        </button>
        <button type="button" aria-label="Next project image" @click="moveImage(1)">
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </figure>
    <div v-else class="detail-art glass-panel" data-reveal aria-label="Project preview unavailable">
      <span>{{ project.title }} / PROJECT PREVIEW</span>
    </div>
    <div v-if="project.description || project.readmeSummary" class="detail-content">
      <section data-reveal>
        <p class="eyebrow">Project overview</p>
        <p>{{ project.description || project.readmeSummary }}</p>
      </section>
      <section v-if="project.updatedAt || project.createdAt" data-reveal>
        <p class="eyebrow">Project activity</p>
        <p v-if="project.updatedAt">Updated {{ formatDate(project.updatedAt) }}</p>
        <p v-else>Created {{ formatDate(project.createdAt) }}</p>
      </section>
    </div>
    <div class="page-endnote glass-panel">
      <span>MORE TO EXPLORE</span
      ><RouterLink to="/projects">Back to all work <span>→</span></RouterLink>
    </div>
  </main>
  <main
    v-else-if="portfolioState.error"
    class="inner-page section-wrap api-loading"
    role="alert"
  >
    <p>Project details could not be loaded.</p>
    <button
      class="button button-outline"
      type="button"
      @click="loadPortfolio({ force: true })"
    >
      Try again
    </button>
  </main>
  <main v-else class="inner-page section-wrap api-loading" aria-live="polite">
    <span class="loading-shimmer"></span>
    <p>Loading project details…</p>
  </main>
</template>
