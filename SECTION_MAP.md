# Portfolio Section Map

## Home page sections

- Hero: `src/components/sections/HeroSection.vue`
- About: `src/components/sections/AboutSection.vue`
- Skills: `src/components/sections/SkillsSection.vue`
- Featured projects: `src/components/sections/ProjectsSection.vue`
- Experience: `src/components/sections/ExperienceSection.vue`
- Services: `src/components/sections/ServicesSection.vue`
- Contact: `src/components/sections/ContactSection.vue`
- Home page composition and shared reveal setup: `src/views/HomeView.vue`

## Layout and project pages

- Header and navigation: `src/components/layout/SiteHeader.vue`
- Footer: `src/components/layout/SiteFooter.vue`
- Projects listing and filters: `src/views/ProjectsIndexView.vue`
- Project detail and gallery: `src/views/ProjectDetailView.vue`
- Project card and image fallback: `src/components/ProjectCard.vue`
- Not found page: `src/views/NotFoundView.vue`
- Portfolio assistant: `src/components/PortfolioAssistant.vue`
- Animated background: `src/components/GalaxyBackdrop.vue`

## Shared data and behavior

- Portfolio content: `src/data/portfolio.js`
- GitHub project sync options: `src/data/github-projects.js`
- API client and shared portfolio state: `src/api/client.js`
- GitHub API and image handling: `server/github-projects.mjs`
- Shared reveal animation: `src/composables/useReveal.js`
- Router: `src/router/index.js`
- Global tokens, reset, accessibility, and page transitions: `src/style.css` and `src/portfolio-theme.css`
