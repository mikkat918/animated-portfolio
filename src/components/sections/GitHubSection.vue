<script setup>
import { computed, onMounted, ref } from "vue";
import { githubState, loadGitHubInsights, portfolioState } from "../../api/client.js";

const currentYear = new Date().getUTCFullYear();
const minimumYear = 2011;
const requestedYear = ref(currentYear);
const repositoryQuery = ref("");
const repositoryLanguage = ref("");
const repositories = computed(() => portfolioState.projects || []);
const languages = computed(() => [...new Set(repositories.value.map((repo) => repo.language).filter(Boolean))].sort());
const filteredRepositories = computed(() => {
  const needle = repositoryQuery.value.trim().toLowerCase();
  return [...repositories.value]
    .filter((repo) => (!repositoryLanguage.value || repo.language === repositoryLanguage.value))
    .filter((repo) => !needle || [repo.title, repo.description, repo.language, ...(repo.topics || [])].join(" ").toLowerCase().includes(needle))
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 6);
});
const contribution = computed(() => githubState.contributions?.data || null);
const weeks = computed(() => {
  const days = contribution.value?.days || [];
  const result = [];
  for (let index = 0; index < days.length; index += 7) result.push(days.slice(index, index + 7));
  return result;
});
const months = computed(() => weeks.value.map((week, index) => {
  const month = week[0]?.date?.slice(0, 7);
  const previous = index ? weeks.value[index - 1]?.[0]?.date?.slice(0, 7) : "";
  if (!month || month === previous) return "";
  return new Date(`${month}-01T00:00:00Z`).toLocaleString("en", { month: "short", timeZone: "UTC" });
}));
const maxDailyCount = computed(() => Math.max(1, ...(contribution.value?.days || []).map((day) => day.contributionCount || 0)));
const weekdayLabels = ["Sun", "", "Tue", "", "Thu", "", "Sat"];

function intensity(day) {
  const count = Number(day.contributionCount) || 0;
  if (!count) return "0";
  const ratio = count / maxDailyCount.value;
  if (ratio <= 0.25) return "1";
  if (ratio <= 0.5) return "2";
  if (ratio <= 0.75) return "3";
  return "4";
}

function setYear(year) {
  if (year < minimumYear || year > currentYear || year === requestedYear.value) return;
  requestedYear.value = year;
  void loadGitHubInsights(year);
}

function formatNumber(value) {
  return Number.isFinite(value) ? new Intl.NumberFormat().format(value) : "—";
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

onMounted(() => void loadGitHubInsights(currentYear));
</script>

<template>
  <section id="github" class="section section-wrap github-section" aria-labelledby="github-title">
    <div class="section-intro" data-reveal>
      <div>
        <p class="eyebrow"><i></i> Open-source profile</p>
        <h2 id="github-title">Work in <em>public.</em></h2>
      </div>
      <p>Public repositories and activity from GitHub. Contribution totals appear only when the server has an authenticated GitHub connection.</p>
    </div>

    <section class="github-profile glass-panel" aria-label="GitHub profile overview" data-reveal>
      <div class="profile-identity">
        <img v-if="githubState.profile?.avatarUrl" :src="githubState.profile.avatarUrl" :alt="`${githubState.profile.username} GitHub avatar`" width="64" height="64" loading="lazy" decoding="async" />
        <div>
          <p class="eyebrow"><i></i> GitHub profile</p>
          <h3>{{ githubState.profile?.name || githubState.profile?.username || "mikkat918" }}</h3>
          <p>@{{ githubState.profile?.username || "mikkat918" }}<span v-if="githubState.profile?.bio"> · {{ githubState.profile.bio }}</span></p>
        </div>
      </div>
      <a class="profile-link" href="https://github.com/mikkat918" target="_blank" rel="noopener noreferrer">Open GitHub profile <span aria-hidden="true">↗</span></a>
      <dl v-if="githubState.profile" class="profile-stats">
        <div><dt>Public repositories</dt><dd>{{ formatNumber(githubState.profile.publicRepositories) }}</dd></div>
        <div><dt>Followers</dt><dd>{{ formatNumber(githubState.profile.followers) }}</dd></div>
        <div><dt>Following</dt><dd>{{ formatNumber(githubState.profile.following) }}</dd></div>
      </dl>
      <p v-else-if="githubState.loading" class="github-state" role="status">Loading public GitHub profile…</p>
      <p v-else-if="githubState.errors.profile" class="github-state" role="alert">{{ githubState.errors.profile }}</p>
    </section>

    <section class="contribution-panel glass-panel" aria-labelledby="contribution-title" data-reveal>
      <div class="contribution-heading">
        <div>
          <p class="eyebrow"><i></i> Contribution calendar</p>
          <h3 id="contribution-title">{{ requestedYear }} activity</h3>
        </div>
        <div class="year-controls" aria-label="Choose contribution year">
          <button type="button" :disabled="requestedYear <= minimumYear || githubState.loading" :aria-label="`Show ${requestedYear - 1} contributions`" @click="setYear(requestedYear - 1)">←</button>
          <span>{{ requestedYear }}</span>
          <button type="button" :disabled="requestedYear >= currentYear || githubState.loading" :aria-label="`Show ${requestedYear + 1} contributions`" @click="setYear(requestedYear + 1)">→</button>
        </div>
      </div>

      <p v-if="githubState.loading && githubState.year !== requestedYear" class="github-state" role="status">Loading contribution history…</p>
      <div v-else-if="contribution" class="contribution-content">
        <div class="contribution-summary">
          <p><strong>{{ formatNumber(contribution.total) }}</strong><span> contributions in {{ requestedYear }}</span></p>
          <p v-if="contribution.currentStreak !== null"><strong>{{ contribution.currentStreak }}</strong><span> day current streak</span></p>
          <p><strong>{{ contribution.longestStreak }}</strong><span> day longest streak in {{ requestedYear }}</span></p>
          <p v-if="contribution.recentContributions !== null"><strong>{{ formatNumber(contribution.recentContributions) }}</strong><span> in the last 30 days</span></p>
        </div>
        <div class="calendar-wrap">
          <div class="weekday-labels" aria-hidden="true"><span v-for="(label, index) in weekdayLabels" :key="index">{{ label }}</span></div>
          <div class="calendar-scroll">
            <div class="month-labels" :style="{ '--week-count': weeks.length }" aria-hidden="true"><span v-for="(month, index) in months" :key="`${month}-${index}`">{{ month }}</span></div>
            <div class="contribution-grid" :style="{ '--week-count': weeks.length }" role="group" :aria-label="`${formatNumber(contribution.total)} GitHub contributions in ${requestedYear}. Each square represents one day.`">
              <div v-for="(week, weekIndex) in weeks" :key="week[0]?.date || weekIndex" class="contribution-week">
                <span v-for="(day, dayIndex) in week" :key="day.date" class="contribution-day" :class="`contribution-level-${intensity(day)}`" role="img" :aria-label="`${formatNumber(day.contributionCount)} ${day.contributionCount === 1 ? 'contribution' : 'contributions'} on ${formatDate(day.date)}`" :title="`${formatNumber(day.contributionCount)} ${day.contributionCount === 1 ? 'contribution' : 'contributions'} on ${formatDate(day.date)}`" :style="{ gridRow: String((Number(day.weekday) + 1) || dayIndex + 1) }"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="calendar-legend" aria-label="Contribution intensity legend"><span>Less</span><i class="contribution-level-0"></i><i class="contribution-level-1"></i><i class="contribution-level-2"></i><i class="contribution-level-3"></i><i class="contribution-level-4"></i><span>More</span></div>
        <p v-if="githubState.contributions?.stale" class="github-state" role="status">Showing the last cached contribution data.</p>
      </div>
      <div v-else class="contribution-fallback" role="status">
        <span class="fallback-mark" aria-hidden="true">GH</span>
        <div>
          <h4>Contribution history isn’t connected yet.</h4>
          <p>{{ githubState.contributions?.error || "GitHub contribution data is unavailable right now." }}</p>
          <a href="https://github.com/mikkat918" target="_blank" rel="noopener noreferrer">View public GitHub profile <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>

    <section class="repository-panel" aria-labelledby="repositories-title" data-reveal>
      <div class="repository-heading">
        <div><p class="eyebrow"><i></i> Public repositories</p><h3 id="repositories-title">Projects on GitHub</h3></div>
        <a class="profile-link" href="https://github.com/mikkat918?tab=repositories" target="_blank" rel="noopener noreferrer">View all repositories <span aria-hidden="true">↗</span></a>
      </div>
      <form class="repository-filters" role="search" aria-label="Filter public repositories" @submit.prevent>
        <label for="github-repository-search"><span>Search repositories</span><input id="github-repository-search" name="repository-search" v-model="repositoryQuery" type="search" placeholder="Name, description, or topic" /></label>
        <label for="github-repository-language"><span>Language</span><select id="github-repository-language" name="repository-language" v-model="repositoryLanguage"><option value="">All languages</option><option v-for="language in languages" :key="language" :value="language">{{ language }}</option></select></label>
      </form>
      <p v-if="githubState.errors.activity" class="github-state" role="status">{{ githubState.errors.activity }}</p>
      <div v-if="filteredRepositories.length" class="repository-grid">
        <article v-for="repo in filteredRepositories" :key="repo.id" class="repository-card glass-panel">
          <div class="repository-card-top"><span v-if="repo.featured" class="featured-badge">Featured</span><span v-else class="repo-status">{{ repo.status || "Public repository" }}</span><span v-if="repo.language" class="repo-language"><i></i>{{ repo.language }}</span></div>
          <h4><a :href="repo.repoUrl" target="_blank" rel="noopener noreferrer">{{ repo.title }} <span aria-hidden="true">↗</span></a></h4>
          <p>{{ repo.description || repo.readmeSummary || "Public repository; no description has been added yet." }}</p>
          <ul v-if="repo.topics?.length" class="repo-topics" aria-label="Repository topics"><li v-for="topic in repo.topics.slice(0, 4)" :key="topic">{{ topic }}</li></ul>
          <div class="repo-metadata"><span aria-label="Stars">★ {{ formatNumber(repo.stars) }}</span><span aria-label="Forks">⑂ {{ formatNumber(repo.forks) }}</span><span v-if="repo.updatedAt">Updated {{ formatDate(repo.updatedAt) }}</span></div>
          <a v-if="repo.liveUrl" class="repo-live-link" :href="repo.liveUrl" target="_blank" rel="noopener noreferrer">Project website <span aria-hidden="true">↗</span></a>
        </article>
      </div>
      <p v-else-if="portfolioState.loaded" class="github-state" role="status">No public repositories match the selected filters.</p>
      <p v-else class="github-state" role="status">Loading public repositories…</p>
    </section>

    <section v-if="githubState.events.length" class="activity-panel" aria-labelledby="activity-title" data-reveal>
      <div class="repository-heading"><div><p class="eyebrow"><i></i> Recent public events</p><h3 id="activity-title">Recent activity</h3></div><p class="activity-window">Public GitHub events from the last 30 days</p></div>
      <ol class="activity-list"><li v-for="event in githubState.events.slice(0, 8)" :key="event.id"><span class="activity-dot" aria-hidden="true"></span><div><p>{{ event.description }} <a :href="event.repositoryUrl" target="_blank" rel="noopener noreferrer">{{ event.repository }}</a></p><time :datetime="event.createdAt">{{ formatDate(event.createdAt) }}</time></div></li></ol>
    </section>
  </section>
</template>

<style scoped>
.github-section { padding-block: clamp(76px, 8vw, 120px); }
.section-intro,.repository-heading,.contribution-heading { display:flex; align-items:end; justify-content:space-between; gap:26px; margin-bottom:30px; }
.section-intro h2 { max-width:620px; margin:0; font-size:clamp(38px,5vw,62px); line-height:.98; letter-spacing:-.05em; }
.section-intro>p { max-width:440px; margin:0; color:var(--muted); font-size:14px; line-height:1.8; }
.eyebrow { display:flex; align-items:center; gap:9px; margin:0 0 14px; color:var(--accent); font:600 10px/1.5 var(--mono); letter-spacing:.14em; text-transform:uppercase; }
.eyebrow i { width:18px; height:1px; background:currentColor; }
.github-profile,.contribution-panel,.repository-card { border-radius:12px; }
.github-profile { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:20px 28px; padding:24px; }
.profile-identity { display:flex; align-items:center; gap:16px; min-width:0; }
.profile-identity img { width:64px; height:64px; border:1px solid var(--line); border-radius:50%; object-fit:cover; }
.profile-identity .eyebrow { margin-bottom:5px; }
.profile-identity h3,.contribution-heading h3,.repository-heading h3 { margin:0; color:var(--text); font-size:clamp(19px,2.4vw,27px); line-height:1.2; }
.profile-identity>div>p:last-child { margin:4px 0 0; color:var(--muted); font-size:12px; line-height:1.55; }
.profile-link { display:inline-flex; align-items:center; gap:10px; color:var(--theme-accent-soft, var(--accent)); font-size:12px; font-weight:700; white-space:nowrap; }
.profile-link:hover,.repository-card h4 a:hover,.repo-live-link:hover { color:var(--accent); }
.profile-stats { display:flex; flex-wrap:wrap; grid-column:1/-1; gap:0; margin:0; padding-top:16px; border-top:1px solid var(--line); }
.profile-stats>div { display:grid; gap:5px; min-width:145px; padding-right:25px; }
.profile-stats dt { color:var(--muted); font-size:11px; }
.profile-stats dd { margin:0; color:var(--text); font:600 16px var(--mono); }
.github-state { margin:10px 0 0; color:var(--muted); font-size:12px; line-height:1.7; }
.contribution-panel { margin-top:16px; padding:clamp(20px,3.2vw,32px); }
.contribution-heading { align-items:center; margin-bottom:20px; }
.contribution-heading .eyebrow,.repository-heading .eyebrow { margin-bottom:8px; }
.year-controls { display:flex; align-items:center; gap:10px; color:var(--muted); font:12px var(--mono); }
.year-controls button { width:34px; height:34px; border:1px solid var(--line); border-radius:7px; color:var(--text); background:var(--surface); cursor:pointer; }
.year-controls button:hover:not(:disabled) { color:var(--accent); border-color:var(--accent); }
.year-controls button:disabled { cursor:not-allowed; opacity:.45; }
.contribution-summary { display:flex; flex-wrap:wrap; gap:9px 24px; margin-bottom:24px; }
.contribution-summary p { display:flex; align-items:baseline; gap:6px; margin:0; color:var(--muted); font-size:11px; }
.contribution-summary strong { color:var(--text); font:600 16px var(--mono); }
.calendar-wrap { display:flex; gap:8px; min-width:0; }
.weekday-labels { display:grid; flex:0 0 25px; grid-template-rows:repeat(7,12px); gap:3px; padding-top:21px; color:var(--faint); font:9px/12px var(--mono); }
.calendar-scroll { min-width:0; flex:1; overflow-x:auto; scrollbar-color:var(--line-strong) transparent; scrollbar-width:thin; }
.month-labels,.contribution-grid { display:grid; grid-template-columns:repeat(var(--week-count),12px); gap:3px; min-width:max-content; }
.month-labels { height:18px; color:var(--faint); font:9px/14px var(--mono); }
.month-labels span { white-space:nowrap; }
.contribution-grid { grid-template-rows:1fr; }
.contribution-week { display:grid; grid-template-rows:repeat(7,12px); gap:3px; }
.contribution-day { display:block; width:12px; height:12px; border-radius:3px; background:var(--heat-0); }
.contribution-level-0 { background:var(--heat-0); }
.contribution-level-1 { background:var(--heat-1); }
.contribution-level-2 { background:var(--heat-2); }
.contribution-level-3 { background:var(--heat-3); }
.contribution-level-4 { background:var(--heat-4); }
.calendar-legend { display:flex; align-items:center; justify-content:flex-end; gap:5px; margin-top:13px; color:var(--faint); font:9px var(--mono); }
.calendar-legend span:first-child { margin-right:4px; }
.calendar-legend span:last-child { margin-left:4px; }
.calendar-legend i { width:11px; height:11px; border-radius:3px; }
.contribution-fallback { display:flex; align-items:center; gap:17px; min-height:130px; padding:22px; border:1px dashed var(--line-strong); border-radius:9px; background:color-mix(in srgb,var(--surface) 86%,transparent); }
.fallback-mark { display:grid; flex:0 0 44px; width:44px; height:44px; place-items:center; border:1px solid var(--line-strong); border-radius:12px; color:var(--accent); font:700 14px var(--mono); }
.contribution-fallback h4 { margin:0 0 6px; color:var(--text); font-size:15px; }
.contribution-fallback p { margin:0 0 9px; color:var(--muted); font-size:12px; line-height:1.7; }
.contribution-fallback a,.repo-live-link { color:var(--theme-accent-soft,var(--accent)); font-size:11px; font-weight:700; }
.repository-panel,.activity-panel { margin-top:clamp(38px,5vw,58px); }
.repository-heading { align-items:end; margin-bottom:20px; }
.repository-filters { display:grid; grid-template-columns:minmax(220px,1fr) minmax(150px,.35fr); gap:12px; margin-bottom:15px; }
.repository-filters label { display:grid; gap:6px; color:var(--muted); font-size:11px; }
.repository-filters input,.repository-filters select { width:100%; min-height:40px; padding:0 12px; border:1px solid var(--line); border-radius:7px; color:var(--text); background:var(--surface); font:inherit; font-size:12px; }
.repository-filters input::placeholder { color:var(--faint); }
.repository-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:13px; }
.repository-card { display:flex; min-width:0; min-height:220px; flex-direction:column; padding:19px; }
.repository-card-top { display:flex; align-items:center; justify-content:space-between; gap:10px; min-height:18px; color:var(--muted); font:9px var(--mono); }
.featured-badge { color:var(--accent-soft); }
.repo-language { display:inline-flex; align-items:center; gap:6px; }
.repo-language i { width:7px; height:7px; border-radius:50%; background:var(--accent); }
.repository-card h4 { margin:17px 0 8px; font-size:17px; overflow-wrap:anywhere; }
.repository-card h4 a { color:var(--text); }
.repository-card h4 a span { color:var(--accent); font-size:13px; }
.repository-card>p { margin:0; color:var(--muted); font-size:11px; line-height:1.7; }
.repo-topics { display:flex; flex-wrap:wrap; gap:5px; margin:13px 0 0; padding:0; list-style:none; }
.repo-topics li { padding:4px 7px; border:1px solid var(--line); border-radius:99px; color:var(--muted); font:9px var(--mono); }
.repo-metadata { display:flex; flex-wrap:wrap; gap:12px; margin-top:auto; padding-top:17px; color:var(--faint); font:9px var(--mono); }
.repo-live-link { display:inline-flex; gap:6px; align-self:flex-start; margin-top:10px; }
.activity-window { margin:0; color:var(--muted); font-size:11px; }
.activity-list { display:grid; gap:0; margin:0; padding:0; list-style:none; border-top:1px solid var(--line); }
.activity-list li { display:grid; grid-template-columns:10px minmax(0,1fr); gap:14px; padding:15px 2px; border-bottom:1px solid var(--line); }
.activity-dot { width:7px; height:7px; margin-top:6px; border-radius:50%; background:var(--accent); }
.activity-list p { margin:0; color:var(--text); font-size:12px; line-height:1.55; }
.activity-list p a { color:var(--theme-accent-soft,var(--accent)); font-weight:700; }
.activity-list time { display:block; margin-top:4px; color:var(--faint); font:9px var(--mono); }
@media(max-width:900px) { .repository-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .section-intro { align-items:start; flex-direction:column; gap:14px; } }
@media(max-width:620px) { .github-section { padding-block:68px; } .github-profile { grid-template-columns:1fr; padding:19px; } .profile-link { justify-self:start; } .profile-stats { gap:14px 0; } .profile-stats>div { min-width:33%; padding-right:7px; } .contribution-heading,.repository-heading { align-items:start; flex-direction:column; gap:14px; } .contribution-summary { gap:12px 17px; } .calendar-wrap { margin-inline:-8px; } .repository-filters,.repository-grid { grid-template-columns:1fr; } .repository-card { min-height:0; } .activity-window { margin-top:-8px; } }
</style>
