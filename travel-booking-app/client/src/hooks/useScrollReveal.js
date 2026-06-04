import { useEffect, useRef, useState } from 'react';

/**
 * useScrollReveal — custom hook that triggers an animation class
 * when an element scrolls into the viewport. Supports optional
 * threshold, rootMargin, and one-shot vs repeatable reveal.
 *
 * @param {Object} options
 * @param {number}  options.threshold  — 0–1 visibility ratio  (default 0.15)
 * @param {string}  options.rootMargin — CSS margin string      (default '0px 0px -60px 0px')
 * @param {boolean} options.repeat     — reveal again each time element leaves/re-enters (default false)
 * @param {string}  options.animation  — Tailwind animation class to add (default 'animate-fade-in-up')
 * @returns {{ ref: React.RefObject, isRevealed: boolean }}
 */
export default function useScrollReveal(options = {}) {
  const {
    threshold = 0.15,
    rootMargin = '0px 0px -60px 0px',
    repeat = false,
    animation = 'animate-fade-in-up',
  } = options;

  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (!repeat) {
            observer.unobserve(el);
          }
        } else if (repeat) {
          setIsRevealed(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, repeat]);

  const className = isRevealed ? animation : 'opacity-0';

  return { ref, isRevealed, className };
}
