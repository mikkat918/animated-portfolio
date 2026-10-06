<script setup>
import { onMounted } from "vue";
import SiteHeader from "./components/layout/SiteHeader.vue";
import SiteFooter from "./components/layout/SiteFooter.vue";
import GalaxyBackdrop from "./components/GalaxyBackdrop.vue";
import PortfolioAssistant from "./components/PortfolioAssistant.vue";
import { loadPortfolio } from "./api/client.js";

onMounted(() => {
  void loadPortfolio();
});
</script>

<template>
  <div class="site-shell">
    <GalaxyBackdrop />
    <a class="skip-link" href="#main-content">Skip to content</a>
    <SiteHeader />
    <RouterView v-slot="{ Component, route }"
      ><Transition name="page" mode="out-in"
        ><component
          :is="Component"
          :key="route.path"
          id="main-content" /></Transition
    ></RouterView>
    <SiteFooter />
    <PortfolioAssistant />
  </div>
</template>
