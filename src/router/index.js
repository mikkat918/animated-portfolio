import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ProjectsView from "../views/ProjectsView.vue";
import ProjectDetailView from "../views/ProjectDetailView.vue";
import NotFoundView from "../views/NotFoundView.vue";

export default createRouter({
  history: createWebHistory(),
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) return savedPosition;
    if (to.hash)
      return new Promise((resolve) =>
        setTimeout(() => resolve({ el: to.hash, behavior: "smooth" }), 180),
      );
    return { top: 0 };
  },
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/projects", name: "projects", component: ProjectsView },
    { path: "/projects/:slug", name: "project", component: ProjectDetailView },
    { path: "/:pathMatch(.*)*", name: "not-found", component: NotFoundView },
  ],
});
