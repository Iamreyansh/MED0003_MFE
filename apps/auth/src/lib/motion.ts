import gsap from 'gsap';

export function prefersReducedMotion(): boolean {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return true;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function fadeUp(el: HTMLElement | null, duration = 0.22): void {
  if (!el || prefersReducedMotion()) {
    return;
  }
  gsap.fromTo(
    el,
    { y: 12, opacity: 0 },
    { y: 0, opacity: 1, duration, ease: 'power2.out' },
  );
}

export function fadeBanner(el: HTMLElement | null): void {
  if (!el || prefersReducedMotion()) {
    return;
  }
  gsap.fromTo(
    el,
    { y: -8, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.18, ease: 'power2.out' },
  );
}

export function shakeElement(el: HTMLElement | null): void {
  if (!el || prefersReducedMotion()) {
    return;
  }
  gsap.fromTo(
    el,
    { x: 0 },
    {
      x: 6,
      duration: 0.05,
      yoyo: true,
      repeat: 5,
      ease: 'power1.inOut',
      onComplete: () => {
        gsap.set(el, { x: 0 });
      },
    },
  );
}

export function scaleIn(el: HTMLElement | null, from = 0.5): void {
  if (!el || prefersReducedMotion()) {
    return;
  }
  gsap.fromTo(
    el,
    { scale: from, opacity: 0.6 },
    { scale: 1, opacity: 1, duration: 0.14, ease: 'power2.out' },
  );
}

export function slideStep(el: HTMLElement | null): void {
  if (!el || prefersReducedMotion()) {
    return;
  }
  gsap.fromTo(
    el,
    { x: 16, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.24, ease: 'power2.out' },
  );
}

export function pressScale(el: HTMLElement | null): void {
  if (!el || prefersReducedMotion()) {
    return;
  }
  gsap.fromTo(
    el,
    { scale: 0.96 },
    { scale: 1, duration: 0.14, ease: 'power2.out' },
  );
}

export function fadeOverlay(el: HTMLElement | null): void {
  if (!el || prefersReducedMotion()) {
    return;
  }
  gsap.fromTo(
    el,
    { opacity: 0 },
    { opacity: 1, duration: 0.18, ease: 'power2.out' },
  );
}

export function popPanel(el: HTMLElement | null): void {
  if (!el || prefersReducedMotion()) {
    return;
  }
  gsap.fromTo(
    el,
    { scale: 0.98, opacity: 0.96 },
    { scale: 1, opacity: 1, duration: 0.18, ease: 'power2.out' },
  );
}

export function bindTimelineVisibility(): () => void {
  function onVis() {
    if (document.hidden) {
      gsap.globalTimeline.pause();
      return;
    }
    gsap.globalTimeline.resume();
  }
  document.addEventListener('visibilitychange', onVis);
  return () => document.removeEventListener('visibilitychange', onVis);
}
