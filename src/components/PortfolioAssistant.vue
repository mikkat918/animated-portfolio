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
const messages = ref([]);
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
  await nextTick();
  input.value?.focus();
}

async function closeAssistant() {
  open.value = false;
  await nextTick();
  launcher.value?.focus();
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
  if (event.key === "Escape" && open.value) closeAssistant();
}

onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <div v-if="showAssistant" class="assistant-widget">
    <Transition name="assistant-panel">
      <section
        v-if="open"
        id="assistant-panel"
        class="assistant-panel glass-panel"
        role="dialog"
        aria-modal="false"
        aria-labelledby="assistant-title"
      >
        <header>
          <div>
            <p class="eyebrow"><i></i> OmniRoute powered</p>
            <h2 id="assistant-title">Portfolio guide</h2>
          </div>
          <button
            class="assistant-close"
            type="button"
            aria-label="Close portfolio guide"
            @click="closeAssistant"
          >
            ×
          </button>
        </header>
        <p class="assistant-intro">
          Ask about the work, skills, or anything shown on this portfolio.
        </p>
        <div
          class="assistant-messages"
          aria-live="polite"
          aria-relevant="additions text"
        >
          <p v-if="!messages.length" class="assistant-welcome">
            Hi. I can help you find your way around this portfolio.
          </p>
          <article
            v-for="(message, index) in messages"
            :key="index"
            class="assistant-message"
            :class="`from-${message.role}`"
          >
            <span>{{ message.role === "user" ? "YOU" : "GUIDE" }}</span>
            <p>{{ message.content }}</p>
          </article>
          <p v-if="pending" class="assistant-pending">Thinking…</p>
        </div>
        <p v-if="error" class="assistant-error" role="alert">{{ error }}</p>
        <form class="assistant-form" @submit.prevent="sendMessage">
          <label class="visually-hidden" for="assistant-question"
            >Ask about this portfolio</label
          ><input
            id="assistant-question"
            ref="input"
            v-model="draft"
            maxlength="1200"
            placeholder="Ask a question…"
            :disabled="pending"
          /><button
            type="submit"
            :disabled="pending || !draft.trim()"
            aria-label="Send question"
          >
            ↗
          </button>
        </form>
        <p class="assistant-note">
          Answers are generated from the portfolio content.
        </p>
      </section>
    </Transition>
    <button
      ref="launcher"
      class="assistant-launch"
      type="button"
      :aria-expanded="open"
      aria-controls="assistant-panel"
      @click="toggleAssistant"
    >
      <span class="assistant-spark">✳</span
      >{{ open ? "Close guide" : "Ask about my work" }}
    </button>
  </div>
</template>
