<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { portfolioState } from "../api/client.js";

const route = useRoute();
const menuOpen = ref(false);
const scrolled = ref(false);
const activeSection = ref("top");
const menuToggle = ref(null);
const mobileNav = ref(null);
const profile = computed(() => portfolioState.profile || {});
const links = [
  { label: "Home", to: "/#top", id: "top" },
  { label: "About", to: "/#about", id: "about" },
  { label: "Skills", to: "/#skills", id: "skills" },
  { label: "Projects", to: "/#work", id: "work" },
  { label: "Experience", to: "/#experience", id: "experience" },
  { label: "Contact", to: "/#contact", id: "contact" },
];
let sectionObserver;
const onScroll = () => {
  scrolled.value = window.scrollY > 24;
};
const onKey = (event) => {
  if (event.key === "Escape") menuOpen.value = false;
};
const observeSections = () => {
  sectionObserver?.disconnect();
  const sections = links
    .map(({ id }) => document.getElementById(id))
    .filter(Boolean);
  if (!("IntersectionObserver" in window) || route.path !== "/") return;
  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) activeSection.value = visible.target.id;
    },
    { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.15, 0.35] },
  );
  sections.forEach((section) => sectionObserver.observe(section));
};
watch(menuOpen, async (open) => {
  document.body.classList.toggle("menu-open", open);
  await nextTick();
  if (open) mobileNav.value?.querySelector("a")?.focus();
  else if (menuToggle.value) menuToggle.value.focus();
});
watch(
  () => route.fullPath,
  async () => {
    menuOpen.value = false;
    await nextTick();
    observeSections();
  },
);
onMounted(() => {
  onScroll();
  observeSections();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("keydown", onKey);
});
onUnmounted(() => {
  sectionObserver?.disconnect();
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("keydown", onKey);
  document.body.classList.remove("menu-open");
});
</script>

<template>
  <header
    class="site-header"
    :class="{ 'is-scrolled': scrolled, 'menu-is-open': menuOpen }"
  >
    <div class="nav-shell glass-nav">
      <RouterLink class="wordmark" to="/#top" aria-label="Go to home"
        ><span class="mark">/</span
        ><span
          ><b>{{ profile.name || "[YOUR NAME]" }}</b
          ><small>DEVELOPER PORTFOLIO</small></span
        ></RouterLink
      >
      <nav class="desktop-nav" aria-label="Main navigation">
        <RouterLink
          v-for="link in links"
          :key="link.id"
          :to="link.to"
          :class="{
            'is-active': activeSection === link.id && route.path === '/',
          }"
          >{{ link.label }}</RouterLink
        >
      </nav>
      <button
        ref="menuToggle"
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="mobile-nav"
        :aria-label="
          menuOpen ? 'Close navigation menu' : 'Open navigation menu'
        "
        @click="menuOpen = !menuOpen"
      >
        <span></span><span></span>
      </button>
    </div>
    <Transition name="veil"
      ><button
        v-if="menuOpen"
        class="menu-veil"
        aria-label="Close navigation menu"
        @click="menuOpen = false"
      ></button
    ></Transition>
    <Transition name="drawer"
      ><nav
        v-if="menuOpen"
        id="mobile-nav"
        ref="mobileNav"
        class="mobile-nav glass-panel"
        aria-label="Mobile navigation"
      >
        <RouterLink v-for="link in links" :key="link.id" :to="link.to"
          >{{ link.label }}<span>↗</span></RouterLink
        >
      </nav></Transition
    >
  </header>
</template>
