<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps({ project: { type: Object, required: true } });
const stackRoot = ref(null);
const activeIndex = ref(0);
const failedImages = ref(new Set());
let observer;

const screenshots = computed(() => (Array.isArray(props.project.images) ? props.project.images : [])
  .filter((image) => image?.url && !/generated preview/i.test(image.alt || "") && !failedImages.value.has(image.url)));
const progress = computed(() => `${String(Math.min(activeIndex.value + 1, screenshots.value.length || 1)).padStart(2, "0")} / ${String(screenshots.value.length).padStart(2, "0")}`);

function observeCards() {
  observer?.disconnect();
  if (!stackRoot.value || !("IntersectionObserver" in window)) return;
  observer = new IntersectionObserver((entries) => {
    const current = entries.filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (current) activeIndex.value = Number(current.target.dataset.index);
  }, { rootMargin: "-38% 0px -38% 0px", threshold: [0, .2, .5, .8, 1] });
  stackRoot.value.querySelectorAll("[data-stack-step]").forEach((step) => observer.observe(step));
}

function handleImageError(url) {
  failedImages.value = new Set([...failedImages.value, url]);
}

onMounted(observeCards);
onUnmounted(() => observer?.disconnect());
watch(() => props.project.id, () => { failedImages.value = new Set(); activeIndex.value = 0; });
watch(screenshots, () => { activeIndex.value = 0; requestAnimationFrame(observeCards); });
</script>

<template>
  <section class="showcase" aria-labelledby="showcase-title">
    <header class="showcase-heading"><div><p class="eyebrow"><i></i> Project gallery</p><h2 id="showcase-title">A closer <em>look.</em></h2></div><p v-if="screenshots.length" class="showcase-count" aria-live="polite">{{ progress }}</p></header>
    <div v-if="screenshots.length" ref="stackRoot" class="screenshot-stack">
      <article v-for="(image, index) in screenshots" :key="image.url" class="stack-step" data-stack-step :data-index="index" :class="{ 'is-past': index < activeIndex, 'is-single': screenshots.length === 1 }">
        <div class="stack-card liquid-glass">
          <figure><img :src="image.url" :alt="image.alt || `${project.title} project image ${index + 1}`" :loading="index < 2 ? 'eager' : 'lazy'" decoding="async" @error="handleImageError(image.url)" /><figcaption>{{ image.caption || image.alt || `${project.title} · project image` }}</figcaption></figure>
          <div class="stack-caption"><p class="eyebrow"><i></i> View {{ String(index + 1).padStart(2, "0") }}</p><h3>{{ project.title }}</h3><p>{{ image.caption || image.alt || "Image from the project repository." }}</p><span class="caption-progress">{{ String(index + 1).padStart(2, "0") }} / {{ String(screenshots.length).padStart(2, "0") }}</span></div>
        </div>
      </article>
    </div>
    <div v-else class="gallery-empty liquid-glass"><span aria-hidden="true">＋</span><div><h3>Project imagery coming soon</h3><p>No project screenshots or gallery images are included in this repository's current portfolio data. Add screenshots to the project README to show them here.</p></div></div>
    <p v-if="screenshots.length > 1" class="scroll-hint"><span aria-hidden="true">↓</span> Scroll to explore</p>
  </section>
</template>

<style scoped>
.showcase { padding: clamp(30px, 6vw, 74px) 0 clamp(50px, 9vw, 110px); }
.showcase-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 28px; }
h2 { margin: 14px 0 0; font-size: clamp(38px, 6vw, 76px); line-height: .95; text-transform: uppercase; }
.showcase-count { margin: 0; color: var(--mint-soft); font: 12px var(--mono); }
.screenshot-stack { position: relative; }
.stack-step { min-height: 84svh; padding-top: 8svh; }
.stack-step.is-single { min-height: 0; padding-top: 0; }
.stack-step.is-single .stack-card { position: relative; top: auto; min-height: 0; }
.stack-card { position: sticky; top: 15vh; display: grid; min-height: min(65vh, 620px); grid-template-columns: minmax(0, 1.4fr) minmax(220px, .6fr); gap: clamp(20px, 4vw, 56px); align-items: center; padding: clamp(13px, 2vw, 24px); overflow: hidden; border: 1px solid var(--line-strong); border-radius: 16px; color: var(--text); background: var(--glass-card-bg); box-shadow: var(--glass-card-shadow); transition: opacity 350ms ease, transform 450ms cubic-bezier(.2,.7,.2,1); }
.stack-step.is-past .stack-card { opacity: .48; transform: translateY(-46px) scale(.975); }
figure { margin: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 10px; background: var(--bg-secondary); box-shadow: var(--shadow-soft); }
figure img { display: block; width: 100%; max-height: 55vh; aspect-ratio: 1.65; object-fit: contain; }
figcaption { padding: 9px 12px; color: var(--faint); font: 9px var(--mono); }
.stack-caption { position: relative; padding: 20px 8px; }
.stack-caption h3 { margin: 26px 0 12px; font-size: clamp(24px, 3vw, 39px); line-height: 1.02; text-transform: uppercase; overflow-wrap: anywhere; }
.stack-caption > p:not(.eyebrow) { max-width: 300px; color: var(--muted); font-size: 13px; line-height: 1.8; }
.caption-progress { display: inline-block; margin-top: 26px; color: var(--mint); font: 11px var(--mono); }
.gallery-empty { display: flex; align-items: center; gap: 22px; min-height: 210px; padding: clamp(22px, 4vw, 48px); border-radius: 14px; }
.gallery-empty > span { display: grid; flex: 0 0 52px; width: 52px; height: 52px; place-items: center; border: 1px solid var(--line-strong); border-radius: 50%; color: var(--mint); font-size: 24px; }
.gallery-empty h3 { margin: 0 0 8px; font-size: 21px; }
.gallery-empty p { max-width: 610px; margin: 0; color: var(--muted); font-size: 12px; line-height: 1.8; }
.scroll-hint { display: flex; justify-content: center; gap: 9px; color: var(--faint); font: 9px var(--mono); letter-spacing: .14em; text-transform: uppercase; }
.scroll-hint span { color: var(--mint); }
@media (max-width: 760px) { .stack-step { min-height: 76svh; padding-top: 7svh; } .stack-card { top: 13vh; min-height: 0; grid-template-columns: 1fr; gap: 4px; } .stack-step.is-single { min-height: 0; padding-top: 0; } .stack-step.is-single .stack-card { top: auto; } figure img { max-height: 38vh; aspect-ratio: 1.35; } .stack-caption { padding: 12px 4px 8px; } .stack-caption h3 { margin: 15px 0 8px; } .stack-caption > p:not(.eyebrow) { margin-bottom: 0; } .caption-progress { margin-top: 12px; } }
@media (prefers-reduced-motion: reduce) { .stack-card { transition: none; } .stack-step.is-past .stack-card { opacity: 1; transform: none; } }
</style>
