<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const canvas = ref(null);
let frame = 0;
let observer;
let cleanup = () => {};

onMounted(() => {
  const element = canvas.value;
  const context = element?.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const smallViewport = window.matchMedia("(max-width: 700px)");
  const stars = [];
  let width = 0;
  let height = 0;
  let visible = true;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let lastFrame = 0;

  const resize = () => {
    const bounds = element.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, smallViewport.matches ? 1.25 : 1.5);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    element.width = Math.round(width * ratio);
    element.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(
      smallViewport.matches ? 240 : 520,
      Math.round((width * height) / (smallViewport.matches ? 3600 : 2600)),
    );
    stars.length = 0;
    for (let i = 0; i < count; i += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.05 + 0.2,
        alpha: Math.random() * 0.5 + 0.18,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0009 + 0.0002,
        drift: (Math.random() - 0.5) * 0.045,
        tint: Math.random() > 0.86 ? "167, 139, 250" : "205, 220, 255",
      });
    }
  };

  const draw = (time = 0) => {
    frame = 0;
    if (!visible) return;
    const frameInterval = smallViewport.matches ? 42 : 34;
    if (!reducedMotion.matches && time - lastFrame < frameInterval) {
      frame = requestAnimationFrame(draw);
      return;
    }
    lastFrame = time;
    context.clearRect(0, 0, width, height);
    pointerX += (targetX - pointerX) * 0.025;
    pointerY += (targetY - pointerY) * 0.025;
    for (const star of stars) {
      const twinkle = reducedMotion.matches ? 1 : 0.76 + Math.sin(time * star.speed + star.phase) * 0.24;
      const parallax = finePointer.matches && !reducedMotion.matches ? 10 : 0;
      const x = star.x + pointerX * parallax + (reducedMotion.matches ? 0 : Math.sin(time * 0.00012 + star.phase) * 3);
      const y = star.y + pointerY * parallax + (reducedMotion.matches ? 0 : time * star.drift * 0.04) % height;
      context.beginPath();
      context.fillStyle = `rgba(${star.tint}, ${star.alpha * twinkle})`;
      context.arc(x, y, star.radius, 0, Math.PI * 2);
      context.fill();
    }
    if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
  };

  const onPointerMove = (event) => {
    targetX = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * -1;
    targetY = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * -1;
    if (!frame && visible) frame = requestAnimationFrame(draw);
  };
  const onMotionChange = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
  };
  const onVisibility = () => {
    visible = !document.hidden;
    if (visible && !frame) frame = requestAnimationFrame(draw);
    else if (!visible) cancelAnimationFrame(frame);
  };

  resize();
  frame = requestAnimationFrame(draw);
  const handleResize = () => {
    resize();
    if (!frame && visible) frame = requestAnimationFrame(draw);
  };
  if ("ResizeObserver" in window) {
    observer = new ResizeObserver(handleResize);
    observer.observe(element);
  } else {
    window.addEventListener("resize", handleResize, { passive: true });
  }
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", onMotionChange);
  else reducedMotion.addListener?.(onMotionChange);
  cleanup = () => {
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("resize", handleResize);
    if (reducedMotion.removeEventListener) reducedMotion.removeEventListener("change", onMotionChange);
    else reducedMotion.removeListener?.(onMotionChange);
  };
});

onUnmounted(() => {
  cleanup();
  observer?.disconnect();
  cancelAnimationFrame(frame);
});
</script>

<template>
  <div class="galaxy-backdrop" aria-hidden="true">
    <canvas ref="canvas"></canvas>
    <span class="nebula nebula-violet"></span>
    <span class="nebula nebula-cyan"></span>
    <span class="shooting-star shooting-star-one"></span>
    <span class="shooting-star shooting-star-two"></span>
    <span class="galaxy-horizon"></span>
  </div>
</template>

<style scoped>
.galaxy-backdrop {
  position: fixed;
  z-index: -1;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background: #050816;
}
canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.nebula {
  position: absolute;
  width: min(65vw, 760px);
  aspect-ratio: 1;
  border-radius: 50%;
  filter: blur(90px);
  opacity: .18;
  will-change: transform;
  animation: nebula-drift 42s ease-in-out infinite alternate;
}
.nebula-violet { top: -38%; left: -22%; background: radial-gradient(circle, rgba(109,40,217,.72), transparent 67%); }
.nebula-cyan { right: -28%; bottom: -48%; background: radial-gradient(circle, rgba(8,145,178,.6), transparent 68%); animation-delay: -18s; }
.galaxy-horizon {
  position: absolute;
  right: -25%; bottom: -52%; left: -25%; height: 75%;
  transform: perspective(500px) rotateX(63deg);
  transform-origin: center top;
  background: radial-gradient(ellipse at center, rgba(76,29,149,.15), transparent 63%);
  mask-image: linear-gradient(to bottom, #000, transparent 76%);
}
.shooting-star {
  position: absolute;
  top: 12%;
  left: -14%;
  width: clamp(70px, 10vw, 150px);
  height: 1px;
  opacity: 0;
  transform: rotate(33deg);
  transform-origin: left center;
  background: linear-gradient(90deg,transparent,rgba(196,181,253,.88),rgba(103,232,249,.42),transparent);
  filter: drop-shadow(0 0 5px rgba(167,139,250,.5));
  animation: shooting-star 18s ease-in infinite;
}
.shooting-star-two { top: 37%; animation-delay: 9s; animation-duration: 23s; }
@keyframes shooting-star {
  0%, 73% { opacity: 0; transform: translate3d(0,0,0) rotate(33deg); }
  75% { opacity: .8; }
  81% { opacity: 0; transform: translate3d(82vw,45vh,0) rotate(33deg); }
  100% { opacity: 0; transform: translate3d(82vw,45vh,0) rotate(33deg); }
}
@keyframes nebula-drift { to { transform: translate3d(6%, 4%, 0) scale(1.08); } }
@media (max-width: 700px) { .nebula { filter: blur(70px); opacity: .12; } }
@media (prefers-reduced-motion: reduce) { .nebula,.shooting-star { animation: none; } }
</style>
