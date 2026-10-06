<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { getApiHealth, sendAssistantMessage } from "../api/client.js";

const configured = ref(false);
const checked = ref(false);
const open = ref(false);
const pending = ref(false);
const error = ref("");
const draft = ref("");
const input = ref(null);
const launcher = ref(null);
const assistantRoot = ref(null);
const panel = ref(null);
const messages = ref([]);
const inertedElements = new Map();
const showAssistant = computed(() => checked.value && configured.value);
const history = computed(() =>
  messages.value.slice(-10).map(({ role, content }) => ({ role, content })),
);

onMounted(async () => {
  try {
    configured.value = Boolean((await getApiHealth()).assistantConfigured);
  } catch {
    configured.value = false;
  }
  checked.value = true;
});

async function toggleAssistant() {
  if (open.value) {
    open.value = false;
    await nextTick();
    launcher.value?.focus();
    return;
  }
  open.value = true;
  setBackgroundInert(true);
  await nextTick();
  input.value?.focus();
}

async function closeAssistant() {
  open.value = false;
  setBackgroundInert(false);
  await nextTick();
  launcher.value?.focus();
}

function setBackgroundInert(inert) {
  if (inert) {
    let branch = assistantRoot.value;
    while (branch?.parentElement && branch.parentElement !== document.body) {
      const parent = branch.parentElement;
      for (const sibling of parent.children) {
        if (sibling === branch) continue;
        if (!inertedElements.has(sibling)) {
          inertedElements.set(sibling, sibling.inert);
        }
        sibling.inert = true;
      }
      branch = parent;
    }
    return;
  }

  for (const [element, wasInert] of inertedElements) {
    element.inert = wasInert;
  }
  inertedElements.clear();
}

async function sendMessage() {
  const content = draft.value.trim();
  if (!content || pending.value || content.length > 2000) return;
  draft.value = "";
  error.value = "";
  messages.value.push({ role: "user", content });
  pending.value = true;
  try {
    const reply = await sendAssistantMessage(
      content,
      history.value.slice(0, -1),
    );
    messages.value.push({ role: "assistant", content: reply });
  } catch (requestError) {
    error.value =
      requestError instanceof Error
        ? requestError.message
        : "The assistant is unavailable right now.";
  } finally {
    pending.value = false;
    await nextTick();
    input.value?.focus();
  }
}

function onKey(event) {
  if (!open.value) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeAssistant();
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = panel.value?.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  const stops = [...(focusable || [])].filter(
    (element) => element.getClientRects().length > 0,
  );
  if (!stops.length) {
    event.preventDefault();
    panel.value?.focus();
    return;
  }

  const first = stops[0];
  const last = stops[stops.length - 1];
  if (event.shiftKey && (document.activeElement === first || !panel.value?.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !panel.value?.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
  }
}

function onFocusIn(event) {
  if (open.value && panel.value && !panel.value.contains(event.target)) {
    input.value?.focus();
  }
}

onMounted(() => {
  document.addEventListener("keydown", onKey);
  document.addEventListener("focusin", onFocusIn);
});
onUnmounted(() => {
  document.removeEventListener("keydown", onKey);
  document.removeEventListener("focusin", onFocusIn);
  setBackgroundInert(false);
});
</script>

<template>
  <div v-if="showAssistant" ref="assistantRoot" class="assistant-root">
    <Transition
      enter-active-class="assistant-panel-enter-active"
      enter-from-class="assistant-panel-enter-from"
      enter-to-class="assistant-panel-enter-to"
      leave-active-class="assistant-panel-leave-active"
      leave-from-class="assistant-panel-leave-from"
      leave-to-class="assistant-panel-leave-to"
    >
      <section
        v-if="open"
        ref="panel"
        id="assistant-panel"
        class="assistant-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-title"
      >
        <!-- Ambient layers -->
        <div class="panel-orb panel-orb-one" aria-hidden="true"></div>
        <div class="panel-orb panel-orb-two" aria-hidden="true"></div>
        <div class="panel-noise" aria-hidden="true"></div>

        <!-- Header -->
        <header class="assistant-header">
          <div class="header-content">
            <div class="assistant-identity">
              <div class="assistant-symbol" aria-hidden="true">
                <span class="symbol-core">✦</span>
                <span class="symbol-ring"></span>
              </div>

              <div class="assistant-heading">
                <p class="assistant-eyebrow">
                  <span class="status-dot">
                    <span></span>
                  </span>
                  OmniRoute powered
                </p>

                <h2 id="assistant-title">Portfolio guide</h2>
              </div>
            </div>

            <button
              class="close-button"
              type="button"
              aria-label="Close portfolio guide"
              @click="closeAssistant"
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </button>
          </div>

          <div class="header-line">
            <span></span>
          </div>
        </header>

        <!-- Intro -->
        <div class="assistant-intro">
          <div class="intro-label">
            <span>AI / 01</span>
            <span class="intro-line"></span>
          </div>

          <p>
            Ask about the work, skills, experience, or anything
            shown on this portfolio.
          </p>
        </div>

        <!-- Messages -->
        <div
          class="assistant-messages custom-scrollbar"
          aria-live="polite"
          aria-relevant="additions text"
        >
          <!-- Empty state -->
          <div v-if="!messages.length" class="assistant-empty">
            <div class="empty-orbit" aria-hidden="true">
              <span class="orbit orbit-a"></span>
              <span class="orbit orbit-b"></span>
              <span class="orbit-center">✦</span>
            </div>

            <p class="empty-kicker">Hello there</p>

            <p class="empty-copy">
              Hi. I can help you find your way around this portfolio.
            </p>

            <div class="suggestion-pills" aria-hidden="true">
              <span>Projects</span>
              <span>Skills</span>
              <span>Experience</span>
            </div>
          </div>

          <!-- Messages -->
          <article
            v-for="(message, index) in messages"
            :key="index"
            class="message"
            :class="message.role === 'user' ? 'message-user' : 'message-guide'"
          >
            <div class="message-meta">
              <span class="message-index">
                {{ String(index + 1).padStart(2, "0") }}
              </span>

              <span>
                {{ message.role === "user" ? "YOU" : "GUIDE" }}
              </span>
            </div>

            <div class="message-bubble">
              <p>{{ message.content }}</p>
            </div>
          </article>

          <!-- Thinking -->
          <div v-if="pending" class="thinking-state">
            <div class="thinking-avatar" aria-hidden="true">
              <span>✦</span>
            </div>

            <div class="thinking-content">
              <span class="thinking-label">GUIDE</span>

              <div class="thinking-bubble">
                <span class="thinking-dots">
                  <i></i>
                  <i></i>
                  <i></i>
                </span>

                <span>Thinking</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <Transition
          enter-active-class="error-enter-active"
          enter-from-class="error-enter-from"
          enter-to-class="error-enter-to"
          leave-active-class="error-leave-active"
          leave-from-class="error-leave-from"
          leave-to-class="error-leave-to"
        >
          <div v-if="error" class="assistant-error" role="alert">
            <span class="error-icon" aria-hidden="true">!</span>

            <div>
              <strong>Something went wrong</strong>
              <p>{{ error }}</p>
            </div>
          </div>
        </Transition>

        <!-- Input -->
        <div class="assistant-input-area">
          <form class="assistant-form" @submit.prevent="sendMessage">
            <label class="sr-only" for="assistant-question">
              Ask about this portfolio
            </label>

            <div class="input-prefix" aria-hidden="true">
              <span>↳</span>
            </div>

            <input
              id="assistant-question"
              ref="input"
              v-model="draft"
              maxlength="1200"
              placeholder="Ask something about my work…"
              :disabled="pending"
            />

            <div class="input-counter" aria-hidden="true">
              {{ draft.length }}
            </div>

            <button
              type="submit"
              :disabled="pending || !draft.trim()"
              aria-label="Send question"
              class="send-button"
            >
              <span class="send-icon">↗</span>
            </button>
          </form>

          <div class="assistant-footer">
            <span>AI ASSISTANT</span>

            <span class="footer-separator"></span>

            <span>Portfolio context only</span>

            <span class="footer-key">
              <kbd>Enter</kbd>
              <span>to send</span>
            </span>
          </div>
        </div>
      </section>
    </Transition>

    <!-- Launcher -->
    <button
      ref="launcher"
      class="assistant-launcher"
      type="button"
      :inert="open"
      :aria-expanded="open"
      aria-controls="assistant-panel"
      @click="toggleAssistant"
    >
      <span class="launcher-glow" aria-hidden="true"></span>

      <span class="launcher-icon" aria-hidden="true">
        <span class="launcher-star">✦</span>
        <span class="launcher-pulse"></span>
      </span>

      <span class="launcher-copy">
        <small>AI GUIDE</small>
        <strong>
          {{ open ? "Close guide" : "Ask about my work" }}
        </strong>
      </span>

      <span class="launcher-arrow" aria-hidden="true">
        {{ open ? "×" : "↗" }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.assistant-widget {
  position: fixed;
  z-index: 24;
  right: max(22px, calc((100vw - var(--container)) / 2));
  bottom: 20px;
}
.assistant-launch {
  display: inline-flex;
  min-height: 43px;
  align-items: center;
  gap: 9px;
  padding: 0 15px;
  border: 1px solid rgba(181, 215, 201, 0.3);
  border-radius: 999px;
  color: #dbe8df;
  background: rgba(24, 36, 32, 0.92);
  box-shadow:
    0 9px 28px rgba(0, 0, 0, 0.25),
    inset 0 1px rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(14px);
  cursor: pointer;
  font-size: 10px;
}
.assistant-launch:hover {
  border-color: rgba(181, 215, 201, 0.55);
  background: #22312a;
}
.assistant-spark {
  color: var(--mint);
  font-size: 14px;
}
.assistant-panel {
  position: absolute;
  right: 0;
  bottom: 55px;
  display: grid;
  width: min(370px, calc(100vw - 32px));
  max-height: min(530px, calc(100svh - 105px));
  grid-template-rows: auto auto minmax(130px, 1fr) auto auto auto;
  padding: 19px;
  overflow: hidden;
  border-radius: 13px;
  background: rgba(17, 25, 24, 0.96);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.45);
}
.assistant-panel > header {
  display: flex;
  align-items: start;
  justify-content: space-between;
}
.assistant-panel .eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 6px;
  font-size: 7px;
}
.assistant-panel h2 {
  margin: 0;
  font-size: 20px;
  letter-spacing: -0.04em;
}
.assistant-close {
  display: grid;
  width: 29px;
  height: 29px;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.035);
  color: var(--muted);
  cursor: pointer;
  font-size: 18px;
}
.assistant-intro {
  margin: 9px 0 13px;
  color: var(--muted);
  font-size: 9px;
  line-height: 1.6;
}
.assistant-messages {
  display: flex;
  min-height: 130px;
  flex-direction: column;
  gap: 10px;
  padding: 12px 5px 12px 0;
  overflow-y: auto;
  border-block: 1px solid var(--line);
  scrollbar-color: rgba(181, 215, 201, 0.25) transparent;
  scrollbar-width: thin;
}
.assistant-welcome, .assistant-pending {
  margin: auto 0;
  color: #9aa8a0;
  font-size: 10px;
  line-height: 1.6;
}
.assistant-message {
  max-width: 92%;
  padding: 9px 11px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.025);
}
.assistant-message.from-user {
  align-self: end;
  border-color: rgba(181, 215, 201, 0.2);
  background: rgba(181, 215, 201, 0.07);
}
.assistant-message > span {
  color: var(--mint);
  font: 6px var(--mono);
  letter-spacing: 0.1em;
}
.assistant-message p {
  margin: 5px 0 0;
  color: #c7d0c9;
  font-size: 9px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.assistant-error {
  margin: 9px 0 0;
  color: #e7a9a0;
  font-size: 8px;
  line-height: 1.5;
}
.assistant-form {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.assistant-form input {
  min-width: 0;
  flex: 1;
  padding: 11px 12px;
  border: 1px solid var(--line);
  border-radius: 6px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.035);
  font:
    10px "DM Sans",
    sans-serif;
}
.assistant-form input:focus-visible {
  border-color: var(--mint);
  outline: 2px solid var(--mint);
  outline-offset: 2px;
}
.assistant-form button {
  width: 39px;
  border: 0;
  border-radius: 6px;
  color: #112019;
  background: var(--mint);
  cursor: pointer;
  font-size: 16px;
}
.assistant-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.assistant-note {
  margin: 8px 0 0;
  color: var(--faint);
  font: 7px var(--mono);
}
.assistant-panel-enter-active, .assistant-panel-leave-active {
  transition:
    opacity 180ms ease,
    transform 220ms var(--ease);
}
.assistant-panel-enter-from, .assistant-panel-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}


/* =========================================================
   PORTFOLIO AI ASSISTANT
   Premium liquid-glass / spatial UI
   ========================================================= */

.assistant-root {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  pointer-events: none;
  font-family: inherit;
}

.assistant-root button,
.assistant-root input {
  font: inherit;
}

.assistant-panel,
.assistant-launcher {
  pointer-events: auto;
}

/* =========================================================
   PANEL
   ========================================================= */

.assistant-panel {
  position: relative;
  width: min(430px, calc(100vw - 32px));
  max-height: min(720px, calc(100vh - 105px));
  overflow: hidden;
  display: flex;
  flex-direction: column;

  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 30px;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.92),
      rgba(248, 249, 252, 0.78)
    );

  box-shadow:
    0 35px 100px rgba(15, 23, 42, 0.17),
    0 10px 35px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);

  backdrop-filter: blur(30px) saturate(145%);
  -webkit-backdrop-filter: blur(30px) saturate(145%);

  isolation: isolate;
}

.panel-noise {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.035;

  background-image:
    radial-gradient(circle at 20% 20%, #000 0.5px, transparent 0.6px),
    radial-gradient(circle at 80% 70%, #000 0.5px, transparent 0.6px);

  background-size: 12px 12px, 17px 17px;
}

.panel-orb {
  position: absolute;
  z-index: -1;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(40px);
}

.panel-orb-one {
  width: 150px;
  height: 150px;
  top: -75px;
  right: -45px;
  background: rgba(139, 92, 246, 0.17);
}

.panel-orb-two {
  width: 120px;
  height: 120px;
  left: -70px;
  bottom: 80px;
  background: rgba(96, 165, 250, 0.1);
}

/* =========================================================
   HEADER
   ========================================================= */

.assistant-header {
  position: relative;
  flex: 0 0 auto;
  padding: 20px 20px 0;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.assistant-identity {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 13px;
}

.assistant-symbol {
  position: relative;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 14px;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.9),
      rgba(237, 233, 254, 0.68)
    );

  box-shadow:
    0 8px 24px rgba(109, 40, 217, 0.11),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.symbol-core {
  position: relative;
  z-index: 2;
  color: #7c3aed;
  font-size: 17px;
  animation: symbolFloat 4s ease-in-out infinite;
}

.symbol-ring {
  position: absolute;
  width: 25px;
  height: 25px;
  border: 1px solid rgba(124, 58, 237, 0.18);
  border-radius: 50%;
  animation: ringRotate 8s linear infinite;
}

.assistant-heading {
  min-width: 0;
}

.assistant-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 4px;

  color: #7c3aed;
  font-size: 8px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.status-dot {
  position: relative;
  display: flex;
  width: 6px;
  height: 6px;
}

.status-dot span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.08);
}

.status-dot::before {
  content: "";
  position: absolute;
  inset: -3px;
  border: 1px solid rgba(139, 92, 246, 0.35);
  border-radius: 50%;
  animation: statusPulse 2s ease-out infinite;
}

.assistant-heading h2 {
  margin: 0;

  color: #0f172a;
  font-size: 19px;
  font-weight: 650;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.close-button {
  position: relative;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.6);
  color: #64748b;

  cursor: pointer;

  transition:
    transform 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease;
}

.close-button:hover {
  transform: rotate(90deg);
  border-color: rgba(124, 58, 237, 0.22);
  background: rgba(237, 233, 254, 0.8);
  color: #6d28d9;
}

.close-button:active {
  transform: rotate(90deg) scale(0.92);
}

.close-button span {
  position: absolute;
  width: 12px;
  height: 1.5px;
  border-radius: 999px;
  background: currentColor;
}

.close-button span:first-child {
  transform: rotate(45deg);
}

.close-button span:last-child {
  transform: rotate(-45deg);
}

.header-line {
  height: 1px;
  margin-top: 18px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.13);
}

.header-line span {
  display: block;
  width: 28%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(124, 58, 237, 0.4),
    transparent
  );
}

/* =========================================================
   INTRO
   ========================================================= */

.assistant-intro {
  flex: 0 0 auto;
  padding: 15px 20px 4px;
}

.intro-label {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 7px;

  color: #94a3b8;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.intro-line {
  width: 30px;
  height: 1px;
  background: rgba(148, 163, 184, 0.3);
}

.assistant-intro p {
  max-width: 350px;
  margin: 0;

  color: #64748b;
  font-size: 12px;
  line-height: 1.65;
}

/* =========================================================
   MESSAGES
   ========================================================= */

.assistant-messages {
  flex: 1 1 auto;
  min-height: 0;
  min-height: 170px;
  max-height: 365px;
  margin: 12px 12px 0;
  padding: 6px 8px 10px;

  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
}

.assistant-messages::-webkit-scrollbar {
  width: 4px;
}

.assistant-messages::-webkit-scrollbar-track {
  background: transparent;
}

.assistant-messages::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.18);
}

.message {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 14px;
  animation: messageAppear 0.35s ease both;
}

.message-user {
  align-items: flex-end;
}

.message-guide {
  align-items: flex-start;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 4px;

  color: #94a3b8;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.message-user .message-meta {
  color: #8b5cf6;
}

.message-index {
  opacity: 0.55;
}

.message-bubble {
  max-width: 88%;
  padding: 11px 14px;

  border-radius: 17px;

  box-shadow:
    0 5px 18px rgba(15, 23, 42, 0.045),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.message-bubble p {
  margin: 0;
  font-size: 12px;
  line-height: 1.65;
}

.message-user .message-bubble {
  border: 1px solid rgba(15, 23, 42, 0.9);
  border-top-right-radius: 5px;

  background: #0f172a;
  color: #fff;

  box-shadow:
    0 9px 24px rgba(15, 23, 42, 0.14);
}

.message-guide .message-bubble {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-top-left-radius: 5px;

  background: rgba(255, 255, 255, 0.72);
  color: #475569;
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

.assistant-empty {
  min-height: 180px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 20px;
  text-align: center;
}

.empty-orbit {
  position: relative;
  width: 58px;
  height: 58px;
  margin-bottom: 13px;
}

.orbit {
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(124, 58, 237, 0.13);
  border-radius: 50%;
}

.orbit-a {
  transform: rotate(30deg) scaleX(0.48);
  animation: orbitSpin 6s linear infinite;
}

.orbit-b {
  transform: rotate(-30deg) scaleX(0.48);
  animation: orbitSpinReverse 7s linear infinite;
}

.orbit-center {
  position: absolute;
  inset: 18px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.8);
  color: #8b5cf6;
  font-size: 13px;

  box-shadow:
    0 6px 20px rgba(124, 58, 237, 0.1);
}

.empty-kicker {
  margin: 0 0 5px;

  color: #7c3aed;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.empty-copy {
  max-width: 250px;
  margin: 0;

  color: #64748b;
  font-size: 11px;
  line-height: 1.65;
}

.suggestion-pills {
  display: flex;
  gap: 6px;
  margin-top: 13px;
}

.suggestion-pills span {
  padding: 5px 8px;

  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.52);
  color: #94a3b8;

  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

/* =========================================================
   THINKING
   ========================================================= */

.thinking-state {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 4px 0 12px;
  padding: 0 3px;

  animation: messageAppear 0.3s ease both;
}

.thinking-avatar {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(124, 58, 237, 0.12);
  border-radius: 9px;

  background: rgba(237, 233, 254, 0.6);
  color: #8b5cf6;
  font-size: 10px;
}

.thinking-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.thinking-label {
  padding-left: 2px;

  color: #94a3b8;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.thinking-bubble {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 8px 11px;

  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.58);

  color: #94a3b8;
  font-size: 10px;
}

.thinking-dots {
  display: flex;
  gap: 3px;
}

.thinking-dots i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #8b5cf6;
  animation: thinkingDot 1.2s ease-in-out infinite;
}

.thinking-dots i:nth-child(2) {
  animation-delay: 0.15s;
}

.thinking-dots i:nth-child(3) {
  animation-delay: 0.3s;
}

/* =========================================================
   ERROR
   ========================================================= */

.assistant-error {
  display: flex;
  align-items: flex-start;
  gap: 9px;

  margin: 3px 20px 9px;
  padding: 10px 11px;

  border: 1px solid rgba(239, 68, 68, 0.14);
  border-radius: 13px;

  background: rgba(254, 242, 242, 0.75);
  color: #b91c1c;
}

.error-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;

  display: grid;
  place-items: center;

  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);

  font-size: 10px;
  font-weight: 800;
}

.assistant-error strong {
  display: block;
  margin-bottom: 2px;
  font-size: 9px;
}

.assistant-error p {
  margin: 0;
  font-size: 9px;
  line-height: 1.5;
  opacity: 0.82;
}

/* =========================================================
   INPUT
   ========================================================= */

.assistant-input-area {
  flex: 0 0 auto;
  padding: 12px 20px 15px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(255, 255, 255, 0.22);
}

.assistant-form {
  position: relative;

  display: flex;
  align-items: center;
  gap: 6px;

  min-height: 49px;
  padding: 5px 5px 5px 10px;

  border: 1px solid rgba(148, 163, 184, 0.19);
  border-radius: 17px;

  background: rgba(255, 255, 255, 0.72);

  box-shadow:
    0 7px 24px rgba(15, 23, 42, 0.045),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);

  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
}

.assistant-form:focus-within {
  border-color: rgba(124, 58, 237, 0.3);

  background: rgba(255, 255, 255, 0.88);

  box-shadow:
    0 8px 28px rgba(124, 58, 237, 0.07),
    0 0 0 4px rgba(124, 58, 237, 0.045);
}

.input-prefix {
  width: 22px;
  flex: 0 0 22px;

  color: #a78bfa;
  font-size: 16px;
}

.assistant-form input {
  min-width: 0;
  flex: 1;

  border: 0;
  outline: 0;

  background: transparent;
  color: #0f172a;

  font-size: 11px;
}

.assistant-form input::placeholder {
  color: #a1a1aa;
}

.assistant-form input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.input-counter {
  padding: 0 3px;

  color: #cbd5e1;
  font-size: 7px;
  font-variant-numeric: tabular-nums;
}

.send-button {
  position: relative;

  width: 37px;
  height: 37px;
  flex: 0 0 37px;

  display: grid;
  place-items: center;

  border: 0;
  border-radius: 12px;

  background: #0f172a;
  color: #fff;

  cursor: pointer;

  box-shadow:
    0 7px 16px rgba(15, 23, 42, 0.15);

  transition:
    transform 0.22s ease,
    background 0.22s ease,
    box-shadow 0.22s ease;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #7c3aed;

  box-shadow:
    0 10px 24px rgba(124, 58, 237, 0.22);
}

.send-button:active:not(:disabled) {
  transform: translateY(0) scale(0.95);
}

.send-button:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.send-icon {
  font-size: 16px;
  line-height: 1;
  transition: transform 0.2s ease;
}

.send-button:hover:not(:disabled) .send-icon {
  transform: translate(1px, -1px);
}

.assistant-footer {
  display: flex;
  align-items: center;
  gap: 6px;

  margin-top: 9px;

  color: #a1a1aa;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.footer-separator {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #d4d4d8;
}

.footer-key {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;

  text-transform: none;
  letter-spacing: 0;
}

.footer-key kbd {
  padding: 2px 4px;

  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 4px;

  background: rgba(255, 255, 255, 0.55);
  color: #94a3b8;

  font-size: 7px;
}

/* =========================================================
   LAUNCHER
   ========================================================= */

.assistant-launcher {
  position: relative;

  display: flex;
  align-items: center;
  gap: 10px;

  min-height: 56px;
  padding: 7px 8px 7px 9px;

  overflow: hidden;

  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 999px;

  background:
    linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.98),
      rgba(30, 27, 55, 0.97)
    );

  color: #fff;

  box-shadow:
    0 18px 50px rgba(15, 23, 42, 0.2),
    0 4px 16px rgba(15, 23, 42, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);

  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  cursor: pointer;

  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s ease;
}

.assistant-launcher:hover {
  transform: translateY(-3px) scale(1.015);

  box-shadow:
    0 23px 60px rgba(15, 23, 42, 0.25),
    0 5px 20px rgba(15, 23, 42, 0.12);
}

.assistant-launcher:active {
  transform: translateY(-1px) scale(0.98);
}

.launcher-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;

  background:
    radial-gradient(
      circle at 15% 50%,
      rgba(139, 92, 246, 0.25),
      transparent 35%
    ),
    linear-gradient(
      105deg,
      transparent 35%,
      rgba(255, 255, 255, 0.08) 50%,
      transparent 65%
    );

  transform: translateX(-100%);
  transition: transform 0.8s ease;
}

.assistant-launcher:hover .launcher-glow {
  transform: translateX(100%);
}

.launcher-icon {
  position: relative;

  width: 40px;
  height: 40px;
  flex: 0 0 40px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 13px;

  background: rgba(255, 255, 255, 0.09);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.launcher-star {
  position: relative;
  z-index: 2;

  color: #c4b5fd;
  font-size: 16px;

  transition:
    transform 0.35s ease,
    color 0.35s ease;
}

.assistant-launcher:hover .launcher-star {
  transform: rotate(90deg) scale(1.1);
  color: #fff;
}

.launcher-pulse {
  position: absolute;
  inset: 8px;

  border: 1px solid rgba(196, 181, 253, 0.25);
  border-radius: 50%;

  animation: launcherPulse 3s ease-out infinite;
}

.launcher-copy {
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;

  padding-right: 3px;
}

.launcher-copy small {
  color: #a78bfa;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.launcher-copy strong {
  color: #fff;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}

.launcher-arrow {
  position: relative;

  width: 34px;
  height: 34px;
  margin-left: 2px;

  display: grid;
  place-items: center;

  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;

  background: rgba(255, 255, 255, 0.06);

  color: rgba(255, 255, 255, 0.72);
  font-size: 15px;

  transition:
    transform 0.25s ease,
    background 0.25s ease;
}

.assistant-launcher:hover .launcher-arrow {
  transform: translate(1px, -1px);
  background: rgba(255, 255, 255, 0.11);
}

/* =========================================================
   TRANSITIONS
   ========================================================= */

.assistant-panel-enter-active {
  transition:
    opacity 0.3s ease,
    transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
}

.assistant-panel-enter-from {
  opacity: 0;
  transform: translateY(18px) scale(0.96);
}

.assistant-panel-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.assistant-panel-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.22s ease;
}

.assistant-panel-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.assistant-panel-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

.error-enter-active,
.error-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.error-enter-from,
.error-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* =========================================================
   ANIMATIONS
   ========================================================= */

@keyframes symbolFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0);
  }

  50% {
    transform: translateY(-2px) rotate(8deg);
  }
}

@keyframes ringRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes statusPulse {
  0% {
    transform: scale(0.7);
    opacity: 0.8;
  }

  70%,
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

@keyframes launcherPulse {
  0% {
    transform: scale(0.7);
    opacity: 0.8;
  }

  70%,
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

@keyframes orbitSpin {
  from {
    transform: rotate(0deg) scaleX(0.48);
  }

  to {
    transform: rotate(360deg) scaleX(0.48);
  }
}

@keyframes orbitSpinReverse {
  from {
    transform: rotate(360deg) scaleX(0.48);
  }

  to {
    transform: rotate(0deg) scaleX(0.48);
  }
}

@keyframes thinkingDot {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.35;
  }

  30% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* =========================================================
   ACCESSIBILITY
   ========================================================= */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

button:focus-visible,
input:focus-visible {
  outline: 2px solid rgba(124, 58, 237, 0.55);
  outline-offset: 3px;
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width: 640px) {
  .assistant-root {
    right: 14px;
    bottom: 14px;
    left: 14px;
  }

  .assistant-panel {
    width: 100%;
    max-height: calc(100vh - 92px);
    border-radius: 25px;
  }

  .assistant-header {
    padding: 17px 17px 0;
  }

  .assistant-intro {
    padding-inline: 17px;
  }

  .assistant-messages { margin-inline: 9px; }

  .assistant-input-area {
    padding-inline: 17px;
  }

  .assistant-launcher {
    min-height: 52px;
  }

  .launcher-icon {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }

  .launcher-copy strong {
    font-size: 10px;
  }
}

@media (max-width: 430px) {
  .assistant-root {
    right: 10px;
    bottom: 10px;
    left: 10px;
  }

  .assistant-panel {
    border-radius: 22px;
  }

  .assistant-heading h2 {
    font-size: 17px;
  }

  .assistant-intro p {
    font-size: 11px;
  }

  .message-bubble {
    max-width: 92%;
  }

  .assistant-footer {
    font-size: 6.5px;
  }

  .footer-key {
    display: none;
  }

  .assistant-launcher {
    width: 100%;
    justify-content: space-between;
  }

  .launcher-copy {
    flex: 1;
  }
}

@supports (height: 100dvh) {
  .assistant-panel { max-height: min(720px, calc(100dvh - 105px)); }
  @media (max-width: 640px) {
    .assistant-panel { max-height: calc(100dvh - 92px); }
  }
}

/* =========================================================
   REDUCED MOTION
   ========================================================= */

@media (prefers-reduced-motion: reduce) {
  .assistant-panel *,
  .assistant-launcher *,
  .assistant-panel,
  .assistant-launcher {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}


.assistant-intro, .assistant-note { color: #a6afcc; }
.assistant-form input { color: #edf0ff; background: rgba(8,13,32,.86); }
.assistant-launch, .assistant-form button { color: #fff; background: #6d28d9; }
.assistant-panel { color: #edf0ff; background: rgba(8,12,30,.98); }
.assistant-panel h2, .assistant-message p { color: #edf0ff; }
.assistant-message, .assistant-form input { border-color: rgba(190,202,255,.15); }
.assistant-note, .assistant-message > span { color: #a6afcc; }
</style>
