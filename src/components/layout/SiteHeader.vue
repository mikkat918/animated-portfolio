<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { portfolioState } from "../../api/client.js";

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
    :class="{
      'is-scrolled': scrolled,
      'menu-is-open': menuOpen,
    }"
  >
    <!-- Ambient background glow -->
    <div class="header-atmosphere" aria-hidden="true">
      <span></span>
    </div>

    <!-- Main navigation -->
    <div class="nav-shell glass-nav">
      <!-- Brand -->
      <RouterLink
        class="wordmark"
        to="/#top"
        aria-label="Go to home"
      >
        

        <span class="brand-copy">
          <b>MD. Rezabuddulla Khondokar Mikkat</b>
          <small>DEVELOPER PORTFOLIO</small>
        </span>
      </RouterLink>

      <!-- Desktop navigation -->
      <nav
        class="desktop-nav"
        aria-label="Main navigation"
      >
        <RouterLink
          v-for="(link, index) in links"
          :key="link.id"
          :to="link.to"
          :class="{
            'is-active':
              activeSection === link.id && route.path === '/',
          }"
        >
          <span class="nav-number">
            {{ String(index + 1).padStart(2, "0") }}
          </span>

          <span class="nav-label">
            {{ link.label }}
          </span>
        </RouterLink>
      </nav>

      <!-- Contact CTA -->
      <RouterLink
        class="nav-contact"
        to="/#contact"
      >
        <span>Let’s talk</span>
        <span class="contact-arrow" aria-hidden="true">↗</span>
      </RouterLink>

      <!-- Mobile menu toggle -->
      <button
        ref="menuToggle"
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="mobile-nav"
        :aria-label="
          menuOpen
            ? 'Close navigation menu'
            : 'Open navigation menu'
        "
        @click="menuOpen = !menuOpen"
      >
        <span class="menu-toggle-label">
          {{ menuOpen ? "CLOSE" : "MENU" }}
        </span>

        <span class="menu-icon" aria-hidden="true">
          <i></i>
          <i></i>
        </span>
      </button>
    </div>

    <!-- Mobile backdrop -->
    <Transition name="veil">
      <button
        v-if="menuOpen"
        class="menu-veil"
        type="button"
        aria-label="Close navigation menu"
        @click="menuOpen = false"
      ></button>
    </Transition>

    <!-- Mobile drawer -->
    <Transition name="drawer">
      <nav
        v-if="menuOpen"
        id="mobile-nav"
        ref="mobileNav"
        class="mobile-nav glass-panel"
        aria-label="Mobile navigation"
      >
        <div class="mobile-nav-head">
          <span>Navigation</span>
          <span>00 — 05</span>
        </div>

        <div class="mobile-nav-line"></div>

        <RouterLink
          v-for="(link, index) in links"
          :key="link.id"
          :to="link.to"
          class="mobile-nav-link"
          :class="{
            'is-active':
              activeSection === link.id && route.path === '/',
          }"
        >
          <span class="mobile-link-number">
            {{ String(index + 1).padStart(2, "0") }}
          </span>

          <span class="mobile-link-label">
            {{ link.label }}
          </span>

          <span class="mobile-link-arrow" aria-hidden="true">
            ↗
          </span>
        </RouterLink>

        <RouterLink
          class="mobile-contact"
          to="/#contact"
        >
          <span>
            <small>AVAILABLE FOR WORK</small>
            <strong>Let’s talk</strong>
          </span>

          <span class="mobile-contact-arrow" aria-hidden="true">
            ↗
          </span>
        </RouterLink>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  z-index: 30;
  top: 17px;
  left: 0;
  right: 0;
  padding-inline: 24px;
}
.nav-shell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100%, 1160px);
  height: 80px;
  margin-inline: auto;
  padding: 0 20px;
  border: 1px solid transparent;
  border-radius: 12px;
  transition:
    background var(--duration),
    border-color var(--duration),
    box-shadow var(--duration),
    backdrop-filter var(--duration);
}
.site-header.is-scrolled .nav-shell, .site-header.menu-is-open .nav-shell {
  border-color: var(--line);
  background: rgba(18, 25, 26, 0.83);
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}
.wordmark {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  font-size: 11px;
  letter-spacing: 0.01em;
}
.wordmark > span:last-child {
  display: grid;
  gap: 2px;
}
.wordmark b {
  font-size: 11px;
  font-weight: 700;
}
.wordmark small {
  color: var(--faint);
  font: 7px var(--mono);
  letter-spacing: 0.09em;
}
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 29px;
}
.desktop-nav a {
  position: relative;
  padding-block: 8px;
  color: #9fa9a5;
  font-size: 11px;
  transition: color var(--duration);
}
.desktop-nav a::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  content: "";
  transform: scaleX(0);
  transform-origin: right;
  background: var(--mint);
  transition: transform var(--duration) var(--ease);
}
.desktop-nav a:hover, .desktop-nav a.is-active {
  color: var(--text);
}
.desktop-nav a.is-active::after, .desktop-nav a:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
.menu-toggle {
  display: none;
}
.menu-veil {
  position: fixed;
  z-index: -1;
  inset: -17px -24px;
  width: calc(100vw + 48px);
  height: 100vh;
  border: 0;
  background: rgba(3, 7, 7, 0.7);
  backdrop-filter: blur(4px);
}
.mobile-nav {
  position: absolute;
  top: 69px;
  right: 24px;
  left: 24px;
  display: grid;
  gap: 0;
  max-height: calc(100vh - 94px);
  max-height: calc(100svh - 94px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 10px 20px;
  border-radius: 12px;
  background: rgba(17, 24, 24, 0.97);
}
.mobile-nav a {
  display: flex;
  justify-content: space-between;
  padding: 15px 1px;
  border-bottom: 1px solid var(--line);
  font-size: 13px;
}
.mobile-nav a:last-child {
  border-bottom: 0;
}
.mobile-nav a span {
  color: var(--faint);
  font: 10px var(--mono);
}
@media (max-width: 980px) {
  .desktop-nav {
    gap: 18px;
  }
  .desktop-nav a {
    font-size: 10px;
  }
}
@media (max-width: 720px) {
  .site-header {
    top: 10px;
    padding-inline: 12px;
  }
  .nav-shell {
    height: 80px;
    padding-inline: 14px;
  }
  .site-header.is-scrolled .nav-shell, .site-header.menu-is-open .nav-shell {
    height: 54px;
  }
  .desktop-nav {
    display: none;
  }
  .menu-toggle {
    display: grid;
    width: 38px;
    height: 38px;
    place-content: center;
    gap: 5px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.025);
    cursor: pointer;
    box-shadow: var(--shadow-inset);
  }
  .menu-toggle span {
    display: block;
    width: 14px;
    height: 1px;
    background: var(--text);
    transition: transform 180ms;
  }
  .menu-is-open .menu-toggle span:first-child {
    transform: translateY(3px) rotate(45deg);
  }
  .menu-is-open .menu-toggle span:last-child {
    transform: translateY(-3px) rotate(-45deg);
  }
  .mobile-nav {
    top: 62px;
    right: 12px;
    left: 12px;
  }
  body.menu-open {
    overflow: hidden;
  }
}


/* =========================================================
   SITE HEADER
   Premium editorial / liquid glass / spatial UI
   ========================================================= */

.site-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;

  z-index: 80;

  padding: 18px 24px;

  pointer-events: none;
}

.site-header > * {
  pointer-events: auto;
}

/* =========================================================
   ATMOSPHERE
   ========================================================= */

.header-atmosphere {
  position: absolute;
  top: -120px;
  left: 50%;

  width: 560px;
  height: 240px;

  transform: translateX(-50%);

  pointer-events: none;
  opacity: 0.7;

  filter: blur(60px);
}

.header-atmosphere span {
  display: block;
  width: 100%;
  height: 100%;

  border-radius: 50%;

  background:
    radial-gradient(
      circle,
      rgba(167, 139, 250, 0.08),
      transparent 62%
    );
}

/* =========================================================
   NAV SHELL
   ========================================================= */

.nav-shell {
  position: relative;

  width: min(1540px, 100%);
  min-height: 66px;

  margin: 0 auto;

  display: flex;
  align-items: center;

  padding: 7px 8px 7px 13px;

  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 22px;

  background:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.76),
      rgba(248, 250, 252, 0.58)
    );

  box-shadow:
    0 18px 55px rgba(15, 23, 42, 0.075),
    0 4px 16px rgba(15, 23, 42, 0.035),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);

  backdrop-filter: blur(25px) saturate(145%);
  -webkit-backdrop-filter: blur(25px) saturate(145%);

  transition:
    min-height 0.35s ease,
    border-radius 0.35s ease,
    box-shadow 0.35s ease,
    background 0.35s ease;
}

.nav-shell::before {
  content: "";

  position: absolute;
  inset: 0;

  border-radius: inherit;

  pointer-events: none;

  background:
    linear-gradient(
      115deg,
      rgba(255, 255, 255, 0.32),
      transparent 35%,
      transparent 70%,
      rgba(255, 255, 255, 0.18)
    );
}

.site-header.is-scrolled {
  padding-top: 12px;
}

.site-header.is-scrolled .nav-shell {
  min-height: 58px;

  border-radius: 19px;

  background:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.86),
      rgba(248, 250, 252, 0.72)
    );

  box-shadow:
    0 16px 48px rgba(15, 23, 42, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.98);
}

/* =========================================================
   WORDMARK
   ========================================================= */

.wordmark {
  position: relative;
  z-index: 2;

  min-width: 0;

  display: flex;
  align-items: center;
  gap: 20px;

  color: inherit;
  text-decoration: none;
}

.brand-mark {
  position: relative;
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(124, 58, 237, 0.14);
  border-radius: 14px;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.96),
      rgba(237, 233, 254, 0.78)
    );
  color: #7c3aed;
  box-shadow:
    0 8px 22px rgba(124, 58, 237, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.98);
  overflow: hidden;
}

.brand-mark::before {
  content: "";
  position: absolute;
  width: 23px;
  height: 23px;
  border: 1px solid rgba(124, 58, 237, 0.14);
  border-radius: 50%;
  animation: brandOrbit 7s linear infinite;
}

.brand-mark span {
  position: relative;
  z-index: 2;
  font-size: 23px;
  font-weight: 400;
  line-height: 1;
  transform: translateY(-1px);
}

.brand-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
}

.brand-copy b {
  display: block;
  max-width: 340px;
  overflow: hidden;
  color: #0f172a;
  font-size: 15px;
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -0.025em;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.brand-copy small {
  display: block;
  color: #64748b;
  font-size: 8.5px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.18em;
}

/* =========================================================
   DESKTOP NAV
   ========================================================= */

.desktop-nav {
  
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 3px;
  margin: 0;
  padding: 5px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.34);
  box-shadow:
    0 8px 24px rgba(15, 23, 42, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.desktop-nav a {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 15px;
  border-radius: 11px;
  color: #64748b;
  font-size: 11px;
  font-weight: 750;
  line-height: 1;
  letter-spacing: 0.045em;
  text-decoration: none;
  white-space: nowrap;
  transition:
    color 0.25s ease,
    background 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.desktop-nav a:hover {
  color: #334155;
  background: rgba(255, 255, 255, 0.68);
  transform: translateY(-1px);
}

.desktop-nav a.is-active {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.82);
  box-shadow:
    0 4px 12px rgba(15, 23, 42, 0.055),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.nav-number {
  color: #a8b0bd;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;
  font-size: 8px;
  font-weight: 650;
  line-height: 1;
  letter-spacing: 0;
  transition: color 0.25s ease;
}

.desktop-nav a.is-active .nav-number {
  color: #8b5cf6;
}

.desktop-nav a.is-active::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 4px;
  width: 4px;
  height: 4px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: #8b5cf6;
  box-shadow:
    0 0 0 3px rgba(139, 92, 246, 0.08),
    0 0 10px rgba(139, 92, 246, 0.22);
}

/* =========================================================
   CONTACT
   ========================================================= */

.nav-contact {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-left: 12px;
  padding: 13px 17px 13px 19px;
  min-height: 44px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  background: #0f172a;
  color: #fff;
  font-size: 11px;
  font-weight: 750;
  line-height: 1;
  letter-spacing: 0.025em;
  text-decoration: none;
  white-space: nowrap;
  box-shadow:
    0 8px 20px rgba(15, 23, 42, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition:
    transform 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.nav-contact span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  line-height: 1;
  transition: transform 0.25s ease;
}

.nav-contact:hover {
  transform: translateY(-2px);
  background: #7c3aed;
  box-shadow:
    0 12px 28px rgba(124, 58, 237, 0.22);
}

.nav-contact:hover span {
  transform: translate(2px, -2px);
}

.nav-contact:active {
  transform: translateY(0) scale(0.97);
}

.contact-arrow {
  width: 21px;
  height: 21px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.08);

  font-size: 10px;

  transition: transform 0.25s ease;
}

.nav-contact:hover .contact-arrow {
  transform: translate(1px, -1px);
}

/* =========================================================
   MOBILE TOGGLE
   ========================================================= */

.menu-toggle {
  display: none;

  align-items: center;
  gap: 9px;

  margin-left: auto;
  padding: 8px 9px 8px 12px;

  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.58);
  color: #475569;

  cursor: pointer;

  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease;
}

.menu-toggle:hover {
  border-color: rgba(124, 58, 237, 0.2);
  background: rgba(237, 233, 254, 0.5);
}

.menu-toggle:active {
  transform: scale(0.96);
}

.menu-toggle-label {
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.menu-icon {
  position: relative;

  width: 24px;
  height: 20px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
}

.menu-icon i {
  display: block;
  width: 100%;
  height: 1.5px;

  border-radius: 999px;
  background: currentColor;

  transition:
    transform 0.3s ease,
    width 0.3s ease;
}

.menu-is-open .menu-icon i:first-child {
  transform: translateY(3.25px) rotate(45deg);
}

.menu-is-open .menu-icon i:last-child {
  transform: translateY(-3.25px) rotate(-45deg);
}

/* =========================================================
   MOBILE VEIL
   ========================================================= */

.menu-veil {
  position: fixed;
  inset: 0;
  z-index: -1;

  width: 100%;
  height: 100%;

  border: 0;

  background: rgba(15, 23, 42, 0.16);

  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);

  cursor: pointer;
}

/* =========================================================
   MOBILE DRAWER
   ========================================================= */

.mobile-nav {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;

  width: min(390px, calc(100vw - 28px));

  padding: 17px;

  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 25px;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.9),
      rgba(248, 250, 252, 0.78)
    );

  box-shadow:
    0 28px 75px rgba(15, 23, 42, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);

  backdrop-filter: blur(28px) saturate(145%);
  -webkit-backdrop-filter: blur(28px) saturate(145%);
}

.mobile-nav-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 1px 3px 10px;

  color: #94a3b8;

  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.17em;
  text-transform: uppercase;
}

.mobile-nav-head span:last-child {
  color: #cbd5e1;

  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;

  letter-spacing: 0.08em;
}

.mobile-nav-line {
  width: 100%;
  height: 1px;
  margin-bottom: 8px;

  background: rgba(148, 163, 184, 0.12);
}

.mobile-nav-link {
  position: relative;

  display: grid;
  grid-template-columns: 30px 1fr 25px;
  align-items: center;
  gap: 8px;

  padding: 13px 10px;

  border-bottom: 1px solid rgba(148, 163, 184, 0.09);
  border-radius: 13px;

  color: #64748b;

  text-decoration: none;

  transition:
    background 0.25s ease,
    color 0.25s ease,
    transform 0.25s ease;
}

.mobile-nav-link:last-of-type {
  border-bottom-color: transparent;
}

.mobile-nav-link:hover {
  background: rgba(255, 255, 255, 0.66);
  color: #0f172a;

  transform: translateX(3px);
}

.mobile-nav-link.is-active {
  background: rgba(237, 233, 254, 0.5);
  color: #0f172a;
}

.mobile-link-number {
  color: #b7bec9;

  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;

  font-size: 7px;
}

.mobile-nav-link.is-active .mobile-link-number {
  color: #8b5cf6;
}

.mobile-link-label {
  font-size: 13px;
  font-weight: 650;
  letter-spacing: -0.015em;
}

.mobile-link-arrow {
  justify-self: end;

  color: #cbd5e1;
  font-size: 13px;

  transition:
    color 0.25s ease,
    transform 0.25s ease;
}

.mobile-nav-link:hover .mobile-link-arrow {
  color: #7c3aed;
  transform: translate(2px, -2px);
}

/* =========================================================
   MOBILE CONTACT
   ========================================================= */

.mobile-contact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  margin-top: 12px;
  padding: 14px;

  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 16px;

  background: #0f172a;
  color: #fff;

  text-decoration: none;

  box-shadow:
    0 10px 25px rgba(15, 23, 42, 0.1);

  transition:
    transform 0.25s ease,
    background 0.25s ease;
}

.mobile-contact:hover {
  transform: translateY(-2px);
  background: #7c3aed;
}

.mobile-contact small {
  display: block;
  margin-bottom: 4px;

  color: #a78bfa;

  font-size: 6px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.mobile-contact strong {
  display: block;

  font-size: 13px;
  font-weight: 650;
}

.mobile-contact-arrow {
  width: 32px;
  height: 32px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.07);

  font-size: 14px;

  transition: transform 0.25s ease;
}

.mobile-contact:hover .mobile-contact-arrow {
  transform: translate(2px, -2px);
}

/* =========================================================
   DRAWER TRANSITION
   ========================================================= */

.drawer-enter-active,
.drawer-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.97);
}

.drawer-enter-to,
.drawer-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* =========================================================
   VEIL TRANSITION
   ========================================================= */

.veil-enter-active,
.veil-leave-active {
  transition: opacity 0.25s ease;
}

.veil-enter-from,
.veil-leave-to {
  opacity: 0;
}

.veil-enter-to,
.veil-leave-from {
  opacity: 1;
}

/* =========================================================
   ANIMATIONS
   ========================================================= */

@keyframes brandOrbit {
  from {
    transform: rotate(0deg) scale(0.9);
  }

  to {
    transform: rotate(360deg) scale(0.9);
  }
}

/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 980px) {
  .site-header {
    padding-inline: 16px;
  }

  .desktop-nav a {
    padding-inline: 9px;
  }

  .nav-number {
    display: none;
  }

  .brand-copy b {
    max-width: 200px;
  }
}

/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 760px) {
  .site-header {
    padding: 12px;
  }

  .site-header.is-scrolled {
    padding-top: 9px;
  }

  .nav-shell {
    min-height: 58px;
    padding: 6px 7px 6px 9px;
    border-radius: 19px;
  }

  .site-header.is-scrolled .nav-shell {
    min-height: 54px;
    border-radius: 17px;
  }

  .desktop-nav,
  .nav-contact {
    display: none;
  }

  .menu-toggle {
    display: flex;
  }

  .brand-mark {
    width: 35px;
    height: 35px;
    flex-basis: 35px;
    border-radius: 11px;
  }

  .brand-copy b {
    max-width: calc(100vw - 145px);
    font-size: 9px;
  }

  .brand-copy small {
    font-size: 5.5px;
  }

  .mobile-nav {
    top: calc(100% + 8px);
  }
}

/* =========================================================
   SMALL MOBILE
   ========================================================= */

@media (max-width: 430px) {
  .site-header {
    padding-inline: 9px;
  }

  .nav-shell {
    padding-left: 7px;
  }

  .brand-copy b {
    max-width: calc(100vw - 135px);

    font-size: 8px;
  }

  .brand-copy small {
    font-size: 5px;
    letter-spacing: 0.14em;
  }

  .menu-toggle-label {
    display: none;
  }

  .menu-toggle {
    width: 40px;
    height: 40px;

    justify-content: center;

    padding: 8px;

    border-radius: 12px;
  }

  .mobile-nav {
    right: 0;

    width: calc(100vw - 18px);

    border-radius: 21px;
  }
}

/* =========================================================
   ACCESSIBILITY
   ========================================================= */

.wordmark:focus-visible,
.desktop-nav a:focus-visible,
.nav-contact:focus-visible,
.menu-toggle:focus-visible,
.mobile-nav-link:focus-visible,
.mobile-contact:focus-visible {
  outline: 2px solid rgba(124, 58, 237, 0.5);
  outline-offset: 3px;
}

/* =========================================================
   REDUCED MOTION
   ========================================================= */

@media (prefers-reduced-motion: reduce) {
  .site-header *,
  .site-header {
    animation: none !important;
    transition: none !important;
  }
}


.site-header.is-scrolled .nav-shell, .site-header.menu-is-open .nav-shell {
  border-color: rgba(196, 181, 253, 0.2);
  background: rgba(8, 12, 30, 0.86);
  box-shadow: 0 14px 44px rgba(0, 0, 0, 0.3);
}
.wordmark small, .desktop-nav a { color: #a6afcc; }
.desktop-nav a:hover, .desktop-nav a.is-active { color: #f3f4ff; }
.nav-contact { color: white; background: #6d28d9; }
.nav-contact:hover { background: #7c3aed; }
.menu-toggle { color: #e5e7ff; border-color: rgba(196,181,253,.2); background: rgba(15,22,47,.75); }
.menu-toggle span { background: #e5e7ff; }
.mobile-nav { background: rgba(8,12,30,.98); }
.mobile-nav a { border-color: rgba(190,202,255,.13); }
.menu-veil { background: rgba(3,5,16,.64); }
.site-header .nav-shell { border-color: rgba(196,181,253,.2) !important; background: linear-gradient(135deg,rgba(18,24,51,.92),rgba(8,13,31,.88)) !important; box-shadow: 0 18px 55px rgba(0,0,0,.32), inset 0 1px rgba(255,255,255,.08) !important; }
.site-header.is-scrolled .nav-shell { background: rgba(8,12,30,.94) !important; }
.site-header .brand-mark { color: #c4b5fd !important; border-color: rgba(196,181,253,.2) !important; background: linear-gradient(145deg,rgba(196,181,253,.16),rgba(15,22,47,.92)) !important; }
.site-header .brand-copy b { color: #edf0ff !important; }
.site-header .brand-copy small { color: #9da8c8 !important; }
.site-header .desktop-nav { border-color: rgba(190,202,255,.1) !important; background: rgba(6,10,26,.54) !important; }
.site-header .desktop-nav a { color: #a6afcc !important; }
.site-header .desktop-nav a:hover, .site-header .desktop-nav a.is-active { color: #f3f4ff !important; background: rgba(196,181,253,.1) !important; }
.site-header .nav-contact { color: #fff !important; background: #6d28d9 !important; }
.site-header .menu-toggle { color: #e5e7ff !important; border-color: rgba(196,181,253,.2) !important; background: rgba(15,22,47,.9) !important; }
.site-header .menu-toggle i { background: currentColor !important; }
.site-header .mobile-nav { border-color: rgba(196,181,253,.2) !important; background: rgba(8,12,30,.98) !important; }
.site-header .mobile-nav-head, .site-header .mobile-nav-link { color: #a6afcc !important; }
.site-header .mobile-nav-link.is-active { color: #f3f4ff !important; background: rgba(196,181,253,.1) !important; }
@media (max-width: 720px) {
  .nav-contact { display: none; }
}
@media (max-width: 900px) {
  .desktop-nav { display: none; }
  .menu-toggle { display: grid; width: 38px; height: 38px; place-content: center; gap: 5px; border: 1px solid var(--line); border-radius: 8px; cursor: pointer; }
  .nav-shell { gap: 12px; }
  .nav-contact { margin-left: auto; }
  .mobile-nav { position: absolute; top: 69px; right: 24px; left: 24px; display: grid; gap: 0; max-height: calc(100svh - 94px); overflow-y: auto; padding: 10px 20px; border-radius: 16px; }
  .mobile-nav a { display: flex; justify-content: space-between; padding: 15px 1px; border-bottom: 1px solid var(--line); font-size: 13px; }
  .mobile-nav a:last-child { border-bottom: 0; }
  .menu-veil { position: fixed; z-index: -1; inset: -17px -24px; width: calc(100vw + 48px); height: 100vh; border: 0; backdrop-filter: blur(4px); }
}
@media (max-width: 720px) { .mobile-nav { top: 62px; right: 12px; left: 12px; } }
</style>
