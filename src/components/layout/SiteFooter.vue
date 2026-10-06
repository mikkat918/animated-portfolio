<script setup>
import { computed } from "vue";
import { portfolioState } from "../../api/client.js";

const profile = computed(() => portfolioState.profile || {});

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <footer class="site-footer section-wrap">
    <RouterLink class="footer-brand" to="/#top">
      <b>{{ profile.name || "MD. Rezabuddulla Khondokar Mikkat" }}</b>
      <span>/ portfolio</span>
    </RouterLink>

    <p>{{ profile.role || "Developer" }} based in {{ profile.location || "Dhaka, Bangladesh" }}.</p>

    <nav class="footer-links" aria-label="Footer navigation">
      <RouterLink to="/#top">Home</RouterLink>
      <RouterLink to="/projects">Projects</RouterLink>
      <RouterLink to="/#contact">Contact</RouterLink>
      <a href="#top" @click.prevent="scrollTop">Back to top ↑</a>
    </nav>

    <div class="footer-bottom">
      <span>© {{ new Date().getFullYear() }} {{ profile.name || "MD. Rezabuddulla Khondokar Mikkat" }}</span>
      <span>{{ profile.location || "Dhaka, Bangladesh" }}</span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 18px 30px;
  padding-block: 25px 17px;
  border-top: 1px solid var(--line);
}

.footer-brand {
  display: flex;
  align-items: baseline;
  gap: 7px;
  color: var(--text);
  font: 500 17px var(--serif);
}

.footer-brand b { font-weight: 500; }
.footer-brand span { color: var(--mint); font-size: 13px; }

.site-footer > p {
  grid-column: 1;
  margin: -10px 0 0;
  color: var(--muted);
  font-size: 9px;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 24px;
  grid-column: 2;
  grid-row: 1 / span 2;
}

.footer-links a {
  color: var(--muted);
  font-size: 9px;
  transition: color 180ms;
}

.footer-links a:hover { color: var(--mint); }

.footer-bottom {
  display: flex;
  grid-column: 1 / -1;
  justify-content: space-between;
  padding-top: 13px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font: 7px var(--mono);
}

@media (max-width: 720px) {
  .site-footer { grid-template-columns: 1fr; gap: 13px; }
  .site-footer > p { margin: -6px 0 0; }
  .footer-links { grid-column: 1; grid-row: auto; flex-wrap: wrap; gap: 17px; }
  .footer-bottom { gap: 10px; font-size: 6px; }
}

@media (max-width: 420px) {
  .footer-bottom { flex-direction: column; }
}
</style>
