<script setup>
import { computed } from "vue";
import ProjectCard from "../components/ProjectCard.vue";
import { portfolioState } from "../api/client.js";
import { useReveal } from "../composables/useReveal";

useReveal();
const profile = computed(() => portfolioState.profile || {});
const principles = computed(() => portfolioState.principles || []);
const skills = computed(() => portfolioState.skills || []);
const projects = computed(() => portfolioState.projects || []);
const selectedProjects = computed(() =>
  [...projects.value]
    .sort((a, b) => {
      if (Boolean(a.featured) !== Boolean(b.featured)) {
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      }
      return (
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
      );
    })
    .slice(0, 3),
);
const experience = computed(() => portfolioState.experience || []);
const services = computed(() => portfolioState.services || []);
const socials = computed(() =>
  [
    {
      label: "GitHub",
      value: profile.value.github,
      base: "https://github.com/",
    },
    {
      label: "LinkedIn",
      value: profile.value.linkedin,
      base: "https://www.linkedin.com/in/",
    },
  ]
    .filter((item) => item.value && !item.value.startsWith("["))
    .map((item) => ({
      label: item.label,
      href: item.value.startsWith("http") ? item.value : item.base + item.value,
    })),
);
const emailReady = computed(
  () => profile.value.email && !profile.value.email.startsWith("["),
);
const phoneReady = computed(
  () => profile.value.phone && !profile.value.phone.startsWith("["),
);
function tiltHero(event) {
  if (
    event.pointerType === "touch" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  const card = event.currentTarget.querySelector(".code-window");
  card?.style.setProperty("--tilt-x", `${(x * 5).toFixed(2)}deg`);
  card?.style.setProperty("--tilt-y", `${(-y * 3.5).toFixed(2)}deg`);
}
function resetHero(event) {
  const card = event.currentTarget.querySelector(".code-window");
  card?.style.setProperty("--tilt-x", "0deg");
  card?.style.setProperty("--tilt-y", "0deg");
}
</script>

<template>
  <main>
    <section id="top" class="hero section-wrap" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="availability" data-reveal>
          <span class="availability-dot"></span
          >{{ profile.availability || "AVAILABILITY — EDIT THIS STATUS"
          }}<span class="availability-sep">·</span
          >{{ profile.location || "[YOUR LOCATION]" }}
        </p>
        <p class="hero-kicker" data-reveal>Independent developer / portfolio</p>
        <h1 id="hero-title" data-reveal>
          Ideas, shaped<br />into <em>interfaces.</em>
        </h1>
        <div class="hero-byline" data-reveal>
          <strong>Hello, I’m {{ profile.name || "[YOUR NAME]" }}</strong
          ><span>{{ profile.role || "[DEVELOPER TITLE]" }}</span>
        </div>
        <p class="hero-intro" data-reveal>
          {{
            profile.intro ||
            "I build thoughtful digital experiences. Add a short, specific introduction here to help visitors understand your focus and the kind of work you enjoy."
          }}
        </p>
        <div class="hero-actions" data-reveal>
          <a class="button button-primary" href="#work"
            >Explore selected work <span aria-hidden="true">→</span></a
          ><a class="button button-outline" href="#about"
            >A little about me <span aria-hidden="true">↓</span></a
          >
        </div>
        <div class="hero-focus" data-reveal>
          <span>Currently focused on</span>
          <p>{{ profile.currentFocus || "Learning · building · refining" }}</p>
        </div>
      </div>
      <div class="hero-aside" aria-label="A live code sample">
        <p class="slide-index">01 / 04</p>
        <div
          class="code-scene"
          data-reveal
          @pointermove="tiltHero"
          @pointerleave="resetHero"
        >
          <div class="code-window liquid-glass">
            <div class="code-window-bar">
              <span>thoughtful-ui.vue</span><b><i></i> LIVE</b>
            </div>
            <div class="code-lines" aria-hidden="true">
              <span>01</span><code>&lt;template&gt;</code><span>02</span
              ><code class="code-indent">&lt;experience</code><span>03</span
              ><code class="code-indent-2">clarity = "true"</code><span>04</span
              ><code class="code-indent-2">detail = "considered"</code
              ><span>05</span><code class="code-indent">/&gt;</code
              ><span>06</span><code>&lt;/template&gt;</code><span>07</span
              ><code class="code-comment"
                >// Make the useful feel effortless.</code
              >
            </div>
            <div class="code-window-foot">
              <span>COMPOSITION API</span><span>PREVIEW READY</span>
            </div>
          </div>
          <div class="floating-label label-top glass-panel">
            <i></i
            ><span
              ><b>Interface first</b><small>human, not just usable</small></span
            >
          </div>
          <div class="floating-label label-bottom glass-panel">
            <i>+</i
            ><span><b>Good details</b><small>make the difference</small></span>
          </div>
          <p class="code-caption">
            A system of small,<br />considered decisions.
          </p>
        </div>
      </div>
      <a class="scroll-cue" href="#about"
        ><span>SCROLL TO EXPLORE</span><i></i
      ></a>
    </section>

    <section id="about" class="section section-wrap about-section">
      <div class="section-intro" data-reveal>
        <div>
          <p class="eyebrow"><i></i>01 — A little context</p>
          <h2>Good work starts<br />with <em>good questions.</em></h2>
        </div>
        <p>{{ profile.about || profile.intro }}</p>
      </div>
      <div class="about-grid">
        <blockquote class="quote-card glass-panel" data-reveal>
          <span class="quote-mark">“</span>
          <p>
            {{
              profile.quote ||
              "I care about the point where a useful idea becomes an experience that feels clear, considered, and easy to use."
            }}
          </p>
          <footer>
            <b>{{ profile.name || "[YOUR NAME]" }}</b
            ><i></i><span>{{ profile.location || "[YOUR LOCATION]" }}</span>
          </footer>
        </blockquote>
        <div class="principle-list">
          <article
            v-for="(item, index) in principles"
            :key="item.title"
            data-reveal
          >
            <span class="list-index">0{{ index + 1 }}</span>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
            <span class="list-arrow" aria-hidden="true">↗</span>
          </article>
        </div>
      </div>
    </section>

    <section id="skills" class="section section-wrap skills-section">
      <div class="section-intro" data-reveal>
        <div>
          <p class="eyebrow"><i></i>02 — Tools & practice</p>
          <h2>A toolkit in <em>progress.</em></h2>
        </div>
        <p>
          A flexible set of skills makes better work possible. Update these
          groups with technologies you actually use.
        </p>
      </div>
      <div class="skill-grid">
        <article
          v-for="(group, index) in skills"
          :key="group.title"
          class="skill-card clay-card"
          data-reveal
        >
          <div class="skill-card-meta">
            <span>0{{ index + 1 }}</span
            ><small>{{ group.note }}</small>
          </div>
          <h3>{{ group.title }}</h3>
          <ul>
            <li v-for="item in group.items" :key="item"><i></i>{{ item }}</li>
          </ul>
        </article>
      </div>
      <p class="section-note">
        <b>NOTE</b> These are intentionally editable placeholders—not a claim
        about the owner’s experience.
      </p>
    </section>

    <section id="work" class="section section-wrap work-section">
      <div class="section-heading" data-reveal>
        <div>
          <p class="eyebrow"><i></i>03 — Selected work</p>
          <h2>One project. <em>Room to grow.</em></h2>
        </div>
        <RouterLink class="all-projects" to="/projects"
          >All projects <span>→</span></RouterLink
        >
      </div>
      <div v-if="selectedProjects.length" class="home-project-grid">
        <ProjectCard
          v-for="project in selectedProjects"
          :key="project.id || project.slug"
          :project="project"
          data-reveal
        />
      </div>
      <div v-else class="empty-projects glass-panel" data-reveal>
        <p>No public projects are available yet.</p>
      </div>
    </section>

    <section id="experience" class="section section-wrap experience-section">
      <div class="section-intro" data-reveal>
        <div>
          <p class="eyebrow"><i></i>04 — Experience</p>
          <h2>The path is <em>yours to tell.</em></h2>
        </div>
        <p>
          A clear timeline helps people understand how you got here. Add only
          verified roles, study, or milestones.
        </p>
      </div>
      <div v-if="experience.length" class="timeline">
        <article
          v-for="(item, index) in experience"
          :key="item.id || item.title"
          class="timeline-card glass-panel"
          data-reveal
        >
          <span class="timeline-index">0{{ index + 1 }}</span>
          <div>
            <p class="timeline-date">{{ item.period }}</p>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </article>
      </div>
      <div v-else class="empty-timeline glass-panel" data-reveal>
        <span class="empty-dash">—</span>
        <div>
          <strong>No timeline entries yet</strong>
          <p>
            Add a verified role, education entry, or relevant milestone in
            <code>src/data/portfolio.js</code>. Nothing has been invented for
            this portfolio.
          </p>
        </div>
        <span class="editable-label">EDITABLE CONTENT</span>
      </div>
    </section>

    <section id="services" class="section section-wrap services-section">
      <div class="section-intro" data-reveal>
        <div>
          <p class="eyebrow"><i></i>05 — Ways to work together</p>
          <h2>Useful, thoughtful,<br /><em>well made.</em></h2>
        </div>
        <p>
          A few areas to start a conversation. Tailor this list to the work you
          want to take on.
        </p>
      </div>
      <div class="service-list">
        <article
          v-for="(service, index) in services"
          :key="service.title"
          data-reveal
        >
          <span class="list-index">0{{ index + 1 }}</span>
          <h3>{{ service.title }}</h3>
          <p>{{ service.description }}</p>
          <span class="list-arrow" aria-hidden="true">↗</span>
        </article>
      </div>
    </section>

    <section id="contact" class="section section-wrap contact-section">
      <div class="contact-panel liquid-glass" data-reveal>
        <div class="contact-main">
          <p class="eyebrow"><i></i>06 — Start a conversation</p>
          <h2>Have something<br />good in <em>mind?</em></h2>
          <p>
            For hiring, collaboration, or a thoughtful project brief, get in
            touch directly.
          </p>
          <a
            v-if="emailReady"
            class="button button-primary"
            :href="`mailto:${profile.email}`"
            >Send an email <span>↗</span></a
          >
          <div class="contact-socials">
            <a v-if="phoneReady" :href="`tel:${profile.phone}`"
              >Call {{ profile.phone }} ↗</a
            ><a
              v-for="social in socials"
              :key="social.label"
              :href="social.href"
              target="_blank"
              rel="noreferrer"
              >{{ social.label }} ↗</a
            >
          </div>
        </div>
        <dl class="contact-details">
          <div>
            <dt>Email</dt>
            <dd>
              <a v-if="emailReady" :href="`mailto:${profile.email}`">{{
                profile.email
              }}</a
              ><span v-else>{{ profile.email || "[YOUR EMAIL]" }}</span>
            </dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              <a v-if="phoneReady" :href="`tel:${profile.phone}`">{{
                profile.phone
              }}</a
              ><span v-else>{{ profile.phone || "[YOUR PHONE]" }}</span>
            </dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{{ profile.location || "[YOUR LOCATION]" }}</dd>
          </div>
          <div>
            <dt>Response window</dt>
            <dd>{{ profile.responseWindow || "[ADD PREFERENCE]" }}</dd>
          </div>
        </dl>
      </div>
    </section>
  </main>
</template>
