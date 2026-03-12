import { useEffect, useRef, useState } from "react";

/**
 * Scroll-triggered visibility hook with SEO-safe defaults.
 *
 * - Defaults to visible so crawlers/headless browsers always see content.
 * - After mount, hides below-fold elements and reveals them on scroll.
 * - Above-fold elements stay visible with no flash.
 * - Respects prefers-reduced-motion (always visible, no animation).
 */
export function useInView(
  threshold = 0.2
): [React.RefObject<HTMLElement | null>, boolean] {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const rect = el.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    if (rect.top < viewportHeight && rect.bottom > 0) {
      return;
    }

    setInView(false);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}
