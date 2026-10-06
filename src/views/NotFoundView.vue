<template>
  <main class="not-found section-wrap">
    <div class="not-found-orbit orbit-one"></div>
    <div class="not-found-orbit orbit-two"></div>

    <div class="not-found-content">
      <div class="not-found-code" aria-hidden="true">
        <span>4</span>
        <span class="zero">0</span>
        <span>4</span>
      </div>

      <p class="eyebrow">
        <i></i>
        404 — Off the map
      </p>

      <h1>
        This page took<br />
        <em>a little detour.</em>
      </h1>

      <p class="not-found-description">
        The address might have changed, but you can find your way back.
      </p>

      <div class="not-found-actions">
        <RouterLink class="button button-primary" to="/">
          Return home
          <span aria-hidden="true">↗</span>
        </RouterLink>

        <RouterLink class="button button-outline" to="/projects">
          View projects
          <span aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </div>

    <div class="not-found-card glass-panel" aria-hidden="true">
      <div class="card-top">
        <span>PAGE STATUS</span>
        <span class="status-dot"></span>
      </div>

      <div class="card-number">404</div>

      <div class="card-footer">
        <span>LOCATION UNKNOWN</span>
        <span>↗</span>
      </div>
    </div>

    <div class="not-found-footer">
      <span>01</span>
      <span></span>
      <span>RETURN TO ORIGIN</span>
    </div>
  </main>
</template>

<style scoped>
.not-found h1 {
  margin: 0;
  font-size: clamp(52px, 7.5vw, 82px);
  line-height: 1.02;
}
.not-found > p:not(.eyebrow) {
  max-width: 465px;
  margin: 17px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
}
.not-found {
  min-height: 70vh;
  padding-top: 210px;
  padding-bottom: 100px;
}
.not-found .eyebrow {
  margin: 0 0 18px;
}
.not-found .button {
  margin-top: 24px;
}

.not-found h1 { color: #edf0ff; }
</style>
