import gsap from 'gsap';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  bindTimelineVisibility,
  fadeBanner,
  fadeOverlay,
  fadeUp,
  popPanel,
  prefersReducedMotion,
  pressScale,
  scaleIn,
  shakeElement,
  slideStep,
} from '../motion';

vi.mock('gsap', () => ({
  default: {
    fromTo: vi.fn(),
    set: vi.fn(),
    globalTimeline: { pause: vi.fn(), resume: vi.fn() },
  },
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('motion', () => {
  it('treats missing matchMedia as reduced motion', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(prefersReducedMotion()).toBe(true);
    fadeUp(document.createElement('div'));
    expect(gsap.fromTo).not.toHaveBeenCalled();
  });

  it('skips tweens when the user prefers reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    expect(prefersReducedMotion()).toBe(true);
    const el = document.createElement('div');
    fadeUp(el);
    fadeBanner(el);
    fadeOverlay(el);
    popPanel(el);
    shakeElement(el);
    scaleIn(el);
    slideStep(el);
    pressScale(el);
    expect(gsap.fromTo).not.toHaveBeenCalled();
  });

  it('runs tweens when motion is allowed', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    );
    const el = document.createElement('div');
    fadeUp(el);
    fadeBanner(el);
    fadeOverlay(el);
    popPanel(el);
    shakeElement(el);
    scaleIn(el);
    slideStep(el);
    pressScale(el);
    expect(gsap.fromTo).toHaveBeenCalled();
    const shake = vi.mocked(gsap.fromTo).mock.calls.find((call) => {
      const vars = call[2] as { onComplete?: () => void };
      return typeof vars.onComplete === 'function';
    });
    (shake?.[2] as { onComplete: () => void }).onComplete();
    expect(gsap.set).toHaveBeenCalled();
  });

  it('ignores null elements', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    );
    fadeUp(null);
    fadeBanner(null);
    fadeOverlay(null);
    popPanel(null);
    shakeElement(null);
    scaleIn(null);
    slideStep(null);
    pressScale(null);
    expect(gsap.fromTo).not.toHaveBeenCalled();
  });

  it('pauses the global timeline when the tab is hidden', () => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    const stop = bindTimelineVisibility();
    document.dispatchEvent(new Event('visibilitychange'));
    expect(gsap.globalTimeline.pause).toHaveBeenCalled();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(gsap.globalTimeline.resume).toHaveBeenCalled();
    stop();
  });
});
