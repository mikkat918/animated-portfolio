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
      <RouterLink class="wordmark" to="/#top">
        <span class="brand-copy">
          <b>MD. Rezabuddulla Khondokar Mikkat</b>
          <small>DEVELOPER PORTFOLIO</small>
        </span>
      </RouterLink>

      <!-- Desktop navigation -->
      <nav class="desktop-nav" aria-label="Main navigation">
        <RouterLink
          v-for="(link, index) in links"
          :key="link.id"
          :to="link.to"
          :class="{
            'is-active': activeSection === link.id && route.path === '/',
          }"
        >
          <span class="nav-number">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="nav-label">{{ link.label }}</span>
        </RouterLink>
      </nav>

      <!-- Contact CTA -->
      <RouterLink class="nav-contact" to="/#contact">
        <span>Let’s talk</span>
        <!-- <span class="contact-arrow" aria-hidden="true">↗</span> -->
      </RouterLink>

      <button
        class="theme-toggle"
        type="button"
        :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        :title="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        @click="toggleTheme"
      >
        <span aria-hidden="true">{{ theme === 'dark' ? '☼' : '☾' }}</span>
      </button>

      <!-- Mobile menu toggle -->
      <button
        ref="menuToggle"
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="mobile-nav"
        :aria-label="menuOpen ? 'Close navigation menu' : 'Open navigation menu'"
        @click="menuOpen = !menuOpen"
      >
        <span class="menu-toggle-label">{{ menuOpen ? 'CLOSE' : 'MENU' }}</span>
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
          <span>00 — {{ String(links.length).padStart(2, '0') }}</span>
        </div>

        <div class="mobile-nav-line"></div>

        <RouterLink
          v-for="(link, index) in links"
          :key="link.id"
          :to="link.to"
          class="mobile-nav-link"
          :class="{
            'is-active': activeSection === link.id && route.path === '/',
          }"
        >
          <span class="mobile-link-number">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="mobile-link-label">{{ link.label }}</span>
          <span class="mobile-link-arrow" aria-hidden="true">↗</span>
        </RouterLink>

        <RouterLink class="mobile-contact" to="/#contact">
          <span>
            <small>AVAILABLE FOR WORK</small>
            <strong>Let’s talk</strong>
          </span>
          <span class="mobile-contact-arrow" aria-hidden="true">↗</span>
        </RouterLink>
      </nav>
    </Transition>
  </header>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const menuOpen = ref(false)
const scrolled = ref(false)
const activeSection = ref('top')
const menuToggle = ref(null)
const mobileNav = ref(null)
const theme = ref('dark')

const links = [
  { label: 'Home', to: '/#top', id: 'top' },
  { label: 'About', to: '/#about', id: 'about' },
  { label: 'Skills', to: '/#skills', id: 'skills' },
  { label: 'Projects', to: '/#work', id: 'work' },
  { label: 'Education', to: '/#education', id: 'education' },
  { label: 'GitHub', to: '/#github', id: 'github' },
  { label: 'Contact', to: '/#contact', id: 'contact' },
]

function applyTheme(value) {
  theme.value = value
  document.documentElement.dataset.theme = value
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value === 'dark' ? '#0C0C0C' : '#FFF9F5')
}

function toggleTheme() {
  const next = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  try { localStorage.setItem('portfolio-theme', next) } catch { /* Storage may be disabled. */ }
}

let sectionObserver

const onScroll = () => {
  scrolled.value = window.scrollY > 24
}

const onKey = (event) => {
  if (event.key === 'Escape' && menuOpen.value) {
    menuOpen.value = false
    nextTick(() => menuToggle.value?.focus())
  }
}

const observeSections = () => {
  sectionObserver?.disconnect()
  sectionObserver = undefined

  if (route.path !== '/' || !('IntersectionObserver' in window)) return

  const sections = links
    .map(({ id }) => document.getElementById(id))
    .filter(Boolean)

  if (!sections.length) return

  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (visible) activeSection.value = visible.target.id
    },
    {
      rootMargin: '-18% 0px -62% 0px',
      threshold: [0, 0.15, 0.35],
    },
  )

  sections.forEach((section) => sectionObserver.observe(section))
}

watch(menuOpen, async (open) => {
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('menu-open', open)
  }

  await nextTick()

  if (open) {
    mobileNav.value?.querySelector('a')?.focus()
  }
})

watch(
  () => route.fullPath,
  async () => {
    menuOpen.value = false
    await nextTick()
    observeSections()
  },
)

onMounted(() => {
  let preferred
  try { preferred = localStorage.getItem('portfolio-theme') } catch { /* Use the system preference. */ }
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  applyTheme(preferred === 'light' || preferred === 'dark' ? preferred : systemTheme)
  onScroll()
  observeSections()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  sectionObserver?.disconnect()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  document.body.classList.remove('menu-open')
})
</script>

<style scoped>
/* =========================================================
   SITE HEADER — LIQUID WATER GLASS
   Scoped to this component; matches the template class names.
   ========================================================= */

.site-header {
  --glass-text: var(--text);
  --glass-muted: var(--muted);
  --glass-violet: var(--mint-soft);
  --glass-cyan: var(--mint);
  --glass-border: rgba(246, 196, 83, 0.22);
  --glass-speed: 260ms;

  position: fixed;
  z-index: 100;
  inset: 0 0 auto;
  padding: 18px 24px;
  color: var(--glass-text);
  pointer-events: none;
  transition: padding var(--glass-speed) ease;
}

.theme-toggle {
  position: relative;
  z-index: 2;
  display: inline-grid;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: var(--text);
  background: var(--surface);
  cursor: pointer;
  font-size: 21px;
  line-height: 1;
  transition: transform 180ms ease, border-color 180ms ease, color 180ms ease;
  pointer-events: auto;
}

.theme-toggle:hover { transform: translateY(-1px); color: var(--accent); border-color: var(--accent); }

.site-header,
.site-header *,
.site-header *::before,
.site-header *::after {
  box-sizing: border-box;
}

.site-header > * {
  pointer-events: auto;
}

/* Soft refracted light behind the glass */
.header-atmosphere {
  position: absolute;
  z-index: 0;
  top: -105px;
  left: 50%;
  width: min(720px, 92vw);
  height: 260px;
  transform: translateX(-50%);
  border-radius: 50%;
  background:
    radial-gradient(ellipse at 34% 52%, rgba(135, 91, 255, 0.30), transparent 58%),
    radial-gradient(ellipse at 68% 44%, rgba(51, 216, 255, 0.20), transparent 55%);
  filter: blur(42px);
  opacity: 0.9;
  pointer-events: none;
}

.header-atmosphere span {
  position: absolute;
  inset: 18% 20%;
  border-radius: inherit;
  background: radial-gradient(ellipse, rgba(255, 255, 255, 0.16), transparent 68%);
  filter: blur(25px);
}

/* Main liquid-glass capsule */
.nav-shell {
  position: relative;
  z-index: 3;
  isolation: isolate;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(10px, 1.4vw, 22px);
  width: min(1540px, 100%);
  min-height: 72px;
  margin-inline: auto;
  padding: 9px 11px 9px 18px;
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  background:
    radial-gradient(ellipse at 12% 0%, rgba(255, 255, 255, 0.12), transparent 38%),
    linear-gradient(125deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02) 42%, rgba(246, 196, 83, 0.035) 72%),
    rgba(18, 19, 23, 0.92);
  box-shadow:
    0 22px 65px rgba(0,  0, 0, 0.18),
    0 5px 18px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.32),
    inset 0 -1px 0 rgba(255, 255, 255, 0.06);
  -webkit-backdrop-filter: blur(30px) saturate(175%);
  backdrop-filter: blur(30px) saturate(175%);
  transition:
    min-height var(--glass-speed) ease,
    padding var(--glass-speed) ease,
    border-color var(--glass-speed) ease,
    border-radius var(--glass-speed) ease,
    background var(--glass-speed) ease,
    box-shadow var(--glass-speed) ease;
}

.nav-shell::before,
.nav-shell::after {
  position: absolute;
  z-index: -1;
  inset: 0;
  content: "";
  border-radius: inherit;
  pointer-events: none;
}

/* Moving-looking reflection, without a heavy animation */
.nav-shell::before {
  background:
    linear-gradient(118deg, rgba(255, 255, 255, 0.17), transparent 24%, transparent 66%, rgba(139, 224, 255, 0.07)),
    radial-gradient(ellipse at 50% -40%, rgba(255, 255, 255, 0.12), transparent 65%);
}

.nav-shell::after {
  inset: 1px;
  border: 1px solid rgba(255, 255, 255, 0.055);
}

.site-header.is-scrolled {
  padding-top: 10px;
}

.site-header.is-scrolled .nav-shell {
  min-height: 60px;
  border-color: rgba(246, 196, 83, 0.2);
  border-radius: 20px;
  background: rgba(13, 14, 18, 0.96);
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

/* Brand text */
.wordmark {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 0 1 285px;
  align-items: center;
  min-width: 0;
  color: var(--glass-text);
  text-decoration: none;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  min-width: 0;
}

.brand-copy b {
  display: block;
  max-width: 100%;
  overflow: hidden;
  color: var(--glass-text);
  font-size: clamp(10px, 0.88vw, 13px);
  font-weight: 760;
  line-height: 1.3;
  letter-spacing: -0.025em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-copy small {
  display: block;
  color: var(--glass-muted);
  font-size: 10px;
  font-weight: 750;
  line-height: 1.3;
  letter-spacing: 0.16em;
}

/* Desktop navigation island */
.desktop-nav {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 0 1 auto;
  align-items: center;
  gap: 3px;
  min-width: 0;
  margin: 0;
  padding: 5px;
  border: 1px solid rgba(222, 225, 255, 0.13);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.015)), rgba(10, 13, 32, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 5px 18px rgba(0, 0, 0, 0.05);
  -webkit-backdrop-filter: blur(20px) saturate(155%);
  backdrop-filter: blur(20px) saturate(155%);
}

.desktop-nav a {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 12px clamp(8px, 0.85vw, 13px);
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--glass-muted);
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.025em;
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--glass-speed) ease, background var(--glass-speed) ease, border-color var(--glass-speed) ease, box-shadow var(--glass-speed) ease, transform var(--glass-speed) ease;
}

.desktop-nav a:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.13);
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
}

.desktop-nav a.is-active {
  border-color: rgba(201, 185, 255, 0.22);
  background: linear-gradient(135deg, rgba(181, 156, 255, 0.23), rgba(122, 214, 255, 0.09)), rgba(255, 255, 255, 0.045);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.20), 0 4px 16px rgba(116, 91, 255, 0.10);
}

.desktop-nav a.is-active::after {
  position: absolute;
  bottom: 4px;
  left: 50%;
  width: 15px;
  height: 2px;
  content: "";
  transform: translateX(-50%);
  border-radius: 999px;
  background: linear-gradient(90deg, var(--glass-violet), var(--glass-cyan));
  box-shadow: 0 0 13px rgba(174, 153, 255, 0.7);
}

.nav-number {
  color: #8e98b8;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0;
}

.desktop-nav a.is-active .nav-number {
  color: var(--glass-violet);
}

/* Contact call to action */
.nav-contact {
  position: relative;
  z-index: 2;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 44px;
  padding: 10px 12px 10px 15px;
  border: 1px solid rgba(246, 196, 83, 0.3);
  border-radius: 999px;
  background: linear-gradient(110deg, #f6c453, #ffe4b1);
  color: #261a00;
  font-size: 15px;
  font-weight: 760;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 7px 24px rgba(246, 196, 83, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition: transform var(--glass-speed) ease, background var(--glass-speed) ease, border-color var(--glass-speed) ease, box-shadow var(--glass-speed) ease;
}

.nav-contact:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 228, 177, 0.7);
  background: #ffe4b1;
  box-shadow: 0 11px 30px rgba(246, 196, 83, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.nav-contact:active {
  transform: scale(0.97);
}

.contact-arrow,
.mobile-contact-arrow {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 1px solid rgba(255, 255, 255, 0.19);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.10);
  transition: transform var(--glass-speed) ease;
}

.nav-contact:hover .contact-arrow,
.mobile-contact:hover .mobile-contact-arrow {
  transform: translate(2px, -2px);
}

/* Mobile menu toggle */
.menu-toggle {
  position: relative;
  z-index: 4;
  display: none;
  align-items: center;
  justify-content: center;
  gap: 9px;
  flex: 0 0 auto;
  margin-left: auto;
  padding: 10px 12px;
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  background: rgba(18, 19, 23, 0.9);
  color: var(--glass-text);
  cursor: pointer;
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  backdrop-filter: blur(18px) saturate(150%);
  transition: background var(--glass-speed) ease, border-color var(--glass-speed) ease, transform var(--glass-speed) ease;
}

.menu-toggle:hover {
  border-color: rgba(194, 174, 255, 0.42);
  background: rgba(246, 196, 83, 0.12);
}

.menu-toggle:active {
  transform: scale(0.96);
}

.menu-toggle-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.menu-icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 20px;
  height: 20px;
}

.menu-icon i {
  display: block;
  width: 100%;
  height: 1.5px;
  border-radius: 999px;
  background: currentColor;
  transition: transform var(--glass-speed) ease;
}

.menu-is-open .menu-icon i:first-child {
  transform: translateY(3.25px) rotate(45deg);
}

.menu-is-open .menu-icon i:last-child {
  transform: translateY(-3.25px) rotate(-45deg);
}

/* Backdrop must sit above page content but below the drawer */
.menu-veil {
  position: fixed;
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: rgba(3, 4, 8, 0.68);
  -webkit-backdrop-filter: blur(8px) saturate(115%);
  backdrop-filter: blur(8px) saturate(115%);
  cursor: pointer;
}

/* Floating liquid-glass mobile drawer */
.mobile-nav {
  position: absolute;
  z-index: 2;
  top: calc(100% + 10px);
  right: 24px;
  width: min(390px, calc(100vw - 48px));
  max-height: calc(100vh - 115px);
  max-height: calc(100svh - 115px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 17px;
  border: 1px solid rgba(246, 196, 83, 0.18);
  border-radius: 24px;
  background: rgba(13, 14, 18, 0.98);
  color: var(--glass-text);
  box-shadow: 0 28px 85px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.24);
  -webkit-backdrop-filter: blur(34px) saturate(170%);
  backdrop-filter: blur(34px) saturate(170%);
}

.mobile-nav-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 3px 12px;
  color: var(--glass-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.mobile-nav-head span:last-child {
  color: var(--glass-violet);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 0.07em;
}

.mobile-nav-line {
  height: 1px;
  margin-bottom: 8px;
  background: linear-gradient(90deg, rgba(185, 164, 255, 0.55), rgba(140, 236, 255, 0.18), transparent);
}

.mobile-nav-link {
  position: relative;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 22px;
  align-items: center;
  gap: 8px;
  padding: 14px 10px;
  border: 1px solid transparent;
  border-bottom-color: rgba(222, 225, 255, 0.10);
  border-radius: 13px;
  color: var(--glass-muted);
  text-decoration: none;
  transition: background var(--glass-speed) ease, color var(--glass-speed) ease, transform var(--glass-speed) ease, border-color var(--glass-speed) ease;
}

.mobile-nav-link:last-of-type {
  border-bottom-color: transparent;
}

.mobile-nav-link:hover {
  transform: translateX(3px);
  background: rgba(255, 255, 255, 0.075);
  color: #fff;
}

.mobile-nav-link.is-active {
  border-color: rgba(246, 196, 83, 0.22);
  background: rgba(246, 196, 83, 0.08);
  color: var(--mint-soft);
}

.mobile-link-number {
  color: #8993b3;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9px;
}

.mobile-nav-link.is-active .mobile-link-number {
  color: var(--glass-violet);
}

.mobile-link-label {
  min-width: 0;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: -0.01em;
}

.mobile-link-arrow {
  justify-self: end;
  color: #9aa4c3;
  font-size: 14px;
  transition: color var(--glass-speed) ease, transform var(--glass-speed) ease;
}

.mobile-nav-link:hover .mobile-link-arrow {
  transform: translate(2px, -2px);
  color: var(--glass-cyan);
}

.mobile-contact {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 13px;
  padding: 14px;
  border: 1px solid rgba(216, 205, 255, 0.24);
  border-radius: 17px;
  background: linear-gradient(120deg, rgba(170, 143, 255, 0.21), rgba(91, 213, 255, 0.09)), rgba(255, 255, 255, 0.04);
  color: #fff;
  text-decoration: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: transform var(--glass-speed) ease, background var(--glass-speed) ease, border-color var(--glass-speed) ease;
}

.mobile-contact:hover {
  transform: translateY(-2px);
  border-color: rgba(216, 205, 255, 0.42);
  background: linear-gradient(120deg, rgba(170, 143, 255, 0.28), rgba(91, 213, 255, 0.13));
}

.mobile-contact small {
  display: block;
  margin-bottom: 5px;
  color: var(--glass-violet);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.mobile-contact strong {
  display: block;
  font-size: 13px;
  font-weight: 700;
}

/* Vue transitions */
.drawer-enter-active,
.drawer-leave-active {
  transform-origin: top right;
  transition: opacity 240ms ease, transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(-10px) scale(0.975);
  opacity: 0;
}

.drawer-enter-to,
.drawer-leave-from {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.veil-enter-active,
.veil-leave-active {
  transition: opacity 220ms ease;
}

.veil-enter-from,
.veil-leave-to {
  opacity: 0;
}

.veil-enter-to,
.veil-leave-from {
  opacity: 1;
}

:global(body.menu-open) {
  overflow: hidden;
}

/* Keyboard accessibility */
.wordmark:focus-visible,
.desktop-nav a:focus-visible,
.nav-contact:focus-visible,
.theme-toggle:focus-visible,
.menu-toggle:focus-visible,
.mobile-nav-link:focus-visible,
.mobile-contact:focus-visible {
  outline: 2px solid var(--glass-cyan);
  outline-offset: 4px;
}

/* Switch to compact navigation before desktop content gets cramped */
@media (max-width: 1080px) {
  .site-header {
    padding: 14px 18px;
  }

  .nav-shell {
    min-height: 64px;
    gap: 12px;
    padding: 8px 10px 8px 14px;
    border-radius: 21px;
  }

  .site-header.is-scrolled .nav-shell {
    min-height: 57px;
    border-radius: 18px;
  }

  .wordmark {
    flex-basis: auto;
    flex-grow: 1;
  }

  .brand-copy b {
    max-width: min(52vw, 390px);
    font-size: clamp(10px, 1.2vw, 13px);
  }

  .desktop-nav,
  .nav-contact {
    display: none;
  }

  .menu-toggle {
    display: inline-flex;
  }

  .mobile-nav {
    top: calc(100% + 9px);
    right: 18px;
  }
}

@media (max-width: 480px) {
  .site-header {
    padding: 10px;
  }

  .site-header.is-scrolled {
    padding-top: 7px;
  }

  .nav-shell {
    min-height: 60px;
    gap: 8px;
    padding: 7px 8px 7px 12px;
    border-radius: 18px;
  }

  .site-header.is-scrolled .nav-shell {
    min-height: 54px;
    border-radius: 16px;
  }

  .brand-copy b {
    max-width: calc(100vw - 115px);
    font-size: clamp(10px, 2.5vw, 11px);
  }

  .brand-copy small {
    font-size: 9px;
    letter-spacing: 0.12em;
  }

  .menu-toggle {
    gap: 7px;
    padding: 8px 9px;
    border-radius: 12px;
  }

  .menu-toggle-label {
    display: none;
  }

  .mobile-nav {
    right: 0;
    width: calc(100vw - 20px);
    max-height: calc(100svh - 90px);
    padding: 13px;
    border-radius: 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-header *,
  .site-header *::before,
  .site-header *::after {
    animation: none !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
