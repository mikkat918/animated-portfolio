<script setup>
import { computed, onMounted } from "vue";
import SiteHeader from "./components/SiteHeader.vue";
import PortfolioAssistant from "./components/PortfolioAssistant.vue";
import { loadPortfolio, portfolioState } from "./api/client.js";

const profile = computed(() => portfolioState.profile || {});
const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
onMounted(() => {
  void loadPortfolio();
});
</script>

<template>
  <div class="site-shell">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <SiteHeader />
    <RouterView v-slot="{ Component, route }"
      ><Transition name="page" mode="out-in"
        ><component
          :is="Component"
          :key="route.path"
          id="main-content" /></Transition
    ></RouterView>
    <footer class="site-footer section-wrap">
      <RouterLink class="footer-brand" to="/#top"
        ><b>{{ profile.name || "[YOUR NAME]" }}</b
        ><span>/ portfolio</span></RouterLink
      >
      <p>A considered place for work, process, and the details in between.</p>
      <nav class="footer-links" aria-label="Footer navigation">
        <RouterLink to="/#top">Home</RouterLink
        ><RouterLink to="/projects">Projects</RouterLink
        ><RouterLink to="/#contact">Contact</RouterLink
        ><a href="#top" @click.prevent="scrollTop">Back to top ↑</a>
      </nav>
      <div class="footer-bottom">
        <span
          >© {{ new Date().getFullYear() }} &nbsp;{{
            profile.name || "[YOUR NAME]"
          }}</span
        ><span>Built to be edited. No claims without context.</span>
      </div>
    </footer>
    <PortfolioAssistant />
  </div>
</template>
