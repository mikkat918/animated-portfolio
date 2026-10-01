import { onMounted, onUnmounted } from "vue";

export function useReveal() {
  let observer;
  let mutations;

  onMounted(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const reveal = (root) => {
      if (root.matches?.("[data-reveal]:not(.is-visible)")) watch(root);
      root.querySelectorAll?.("[data-reveal]:not(.is-visible)").forEach(watch);
    };
    const watch = (element) => {
      if (reducedMotion || !observer) element.classList.add("is-visible");
      else observer.observe(element);
    };

    if (!reducedMotion && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -34px 0px" },
      );
    }

    reveal(document);
    mutations = new MutationObserver((records) =>
      records.forEach((record) =>
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) reveal(node);
        }),
      ),
    );
    mutations.observe(document.querySelector("main") || document.body, {
      childList: true,
      subtree: true,
    });
  });

  onUnmounted(() => {
    observer?.disconnect();
    mutations?.disconnect();
  });
}
