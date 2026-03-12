/**
 * Lightweight scroll-reveal observer (<1KB).
 *
 * Watches all [data-reveal] elements via a single IntersectionObserver.
 * When 15% of an element is visible, sets [data-revealed] which triggers
 * CSS animations defined in global.css. Each element reveals once.
 *
 * Supports:
 * - data-reveal           — opt in to reveal
 * - data-reveal-delay="N" — maps to --reveal-delay CSS variable (ms)
 * - data-reveal-glow      — also plays a single glow pulse on reveal
 *
 * Respects prefers-reduced-motion: elements get [data-revealed] immediately.
 *
 * Call initRevealObserver() once at app startup (main.tsx).
 */

const THRESHOLD = 0.15;

export function initRevealObserver(): (() => void) | undefined {
  if (typeof window === "undefined") return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    // Show everything immediately — no animation
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      el.setAttribute("data-revealed", "");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const el = entry.target as HTMLElement;

        // Apply stagger delay as CSS variable
        const delay = el.getAttribute("data-reveal-delay");
        if (delay) {
          el.style.setProperty("--reveal-delay", `${delay}ms`);
        }

        // If above fold on first paint, reveal without animation
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < vh && rect.bottom > 0 && !el.hasAttribute("data-reveal-below")) {
          el.style.animation = "none";
          el.style.opacity = "1";
          el.style.transform = "none";
        }

        el.setAttribute("data-revealed", "");
        observer.unobserve(el);
      }
    },
    { threshold: THRESHOLD }
  );

  // Observe all current [data-reveal] elements
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    // Mark elements that are below the fold so they get animated
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top >= vh || rect.bottom <= 0) {
      el.setAttribute("data-reveal-below", "");
    }
    observer.observe(el);
  });

  // Also observe elements added later (e.g. after route change)
  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (node.hasAttribute("data-reveal")) {
          observer.observe(node);
        }
        node.querySelectorAll?.("[data-reveal]").forEach((el) => {
          observer.observe(el);
        });
      }
    }
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    mutationObserver.disconnect();
  };
}
