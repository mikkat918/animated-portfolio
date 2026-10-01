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
    <RouterLink
      class="project-preview"
      :to="`/projects/${project.id || project.slug}`"
      :aria-label="`View ${project.title} project details`"
    >
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
      <template v-else>
        <span class="project-index-label"
          >PROJECT INDEX<br /><b>{{ project.id || project.slug }}</b></span
        >
        <div class="preview-grid" aria-hidden="true"></div>
        <div class="preview-window" aria-hidden="true">
          <div class="preview-bar">
            <i></i><i></i><i></i><span>PROJECT / {{ project.title }}</span>
          </div>
          <div class="preview-body">
            <div class="preview-rail"><i></i><i></i><i></i></div>
            <div class="preview-lines"><i></i><i></i><i></i><i></i><i></i></div>
          </div>
        </div>
        <span class="preview-caption">PROJECT PREVIEW</span>
      </template>
    </RouterLink>
    <div class="project-info">
      <div class="project-info-meta">
        <p class="eyebrow">{{ project.status || "Project" }}</p>
        <span v-if="project.updatedAt">{{ formatDate(project.updatedAt) }}</span>
      </div>
      <h3>{{ project.title }}</h3>
      <p>{{ project.description || project.readmeSummary || "No description has been added to this repository yet." }}</p>
      <ul v-if="technologies.length || project.topics?.length" class="project-tags">
        <li v-for="technology in technologies" :key="technology">
          {{ technology }}
        </li>
        <li v-for="topic in project.topics || []" :key="topic">{{ topic }}</li>
      </ul>
      <div class="project-card-actions">
        <RouterLink class="project-link" :to="`/projects/${project.id || project.slug}`"
          >View details <span aria-hidden="true">→</span></RouterLink
        >
        <a
          v-if="project.liveUrl || project.live"
          class="project-external-link"
          :href="project.liveUrl || project.live"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`Open ${project.title} live site in a new tab`"
          >Live site ↗</a
        >
        <a
          v-if="project.repoUrl || project.github"
          class="project-external-link"
          :href="project.repoUrl || project.github"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`Open ${project.title} source repository in a new tab`"
          >Source ↗</a
        >
      </div>
    </div>
  </article>
</template>
