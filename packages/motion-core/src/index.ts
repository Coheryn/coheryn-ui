/**
 * CoherynUI Motion — Stable 1.0 Advanced Animation Runtime
 *
 * Provides analytical physics-based spring solvers, FLIP layout transitions,
 * sequential timeline builders, and reduced-motion accessibility handling.
 */

export interface SpringConfig {
  stiffness?: number; // Hooke's spring constant (k)
  damping?: number;   // Damping coefficient (c)
  mass?: number;      // Inertial mass (m)
  restSpeed?: number; // Velocity threshold to mark completion
  restDistance?: number; // Distance threshold to mark completion
}

export interface AnimationController {
  stop(): void;
  pause(): void;
  resume(): void;
  finished: Promise<void>;
}

export function spring(config: SpringConfig = {}): SpringConfig {
  return {
    stiffness: config.stiffness ?? 280,
    damping: config.damping ?? 24,
    mass: config.mass ?? 1,
    restSpeed: config.restSpeed ?? 0.005,
    restDistance: config.restDistance ?? 0.005,
  };
}

/**
 * Analytical Spring Solver for 1D/Multi-D physical simulation.
 * Solves: m * x'' + c * x' + k * x = 0
 */
export class SpringSolver {
  private k: number;
  private c: number;
  private m: number;
  private w0: number;
  private zeta: number;
  private wd: number;

  constructor(config: SpringConfig = {}) {
    this.k = config.stiffness ?? 280;
    this.c = config.damping ?? 24;
    this.m = config.mass ?? 1;

    // Angular frequency and damping ratio
    this.w0 = Math.sqrt(this.k / this.m);
    this.zeta = this.c / (2 * Math.sqrt(this.k * this.m));
    this.wd = this.zeta < 1 ? this.w0 * Math.sqrt(1 - this.zeta * this.zeta) : 0;
  }

  /**
   * Evaluates position and velocity at time t (seconds) starting with initial displacement x0 and velocity v0.
   */
  public evaluate(t: number, x0: number, v0: number): { position: number; velocity: number } {
    if (this.zeta < 1) {
      // Underdamped oscillation
      const decay = Math.exp(-this.zeta * this.w0 * t);
      const sinTerm = Math.sin(this.wd * t);
      const cosTerm = Math.cos(this.wd * t);

      const a = x0;
      const b = (v0 + this.zeta * this.w0 * x0) / this.wd;

      const position = decay * (a * cosTerm + b * sinTerm);
      const velocity =
        -this.zeta * this.w0 * position +
        decay * (-a * this.wd * sinTerm + b * this.wd * cosTerm);

      return { position, velocity };
    } else {
      // Critically damped or overdamped
      const decay = Math.exp(-this.w0 * t);
      const position = (x0 + (v0 + this.w0 * x0) * t) * decay;
      const velocity = (v0 * (1 - this.w0 * t) - this.w0 * this.w0 * x0 * t) * decay;
      return { position, velocity };
    }
  }
}

/**
 * Animate an element or selector using springs or duration transitions.
 */
export function animate(
  target: string | HTMLElement,
  keyframes: Record<string, [number, number] | number>,
  options: { transition?: SpringConfig; duration?: number; onUpdate?: (val: Record<string, number>) => void } = {}
): AnimationController {
  const elements = typeof target === 'string' ? Array.from(document.querySelectorAll<HTMLElement>(target)) : [target];
  let isStopped = false;
  let isPaused = false;
  let animId = 0;

  let resolveFinished: () => void;
  const finished = new Promise<void>((resolve) => {
    resolveFinished = resolve;
  });

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Reduced motion: apply destination immediately and resolve
  if (prefersReducedMotion) {
    for (const el of elements) {
      for (const [prop, val] of Object.entries(keyframes)) {
        const dest = Array.isArray(val) ? val[1] : val;
        applyStyle(el, prop, dest);
      }
    }
    resolveFinished!();
    return {
      stop: () => {},
      pause: () => {},
      resume: () => {},
      finished,
    };
  }

  const solver = new SpringSolver(options.transition);
  const startTime = performance.now();

  const props = Object.entries(keyframes).map(([prop, val]) => {
    const from = Array.isArray(val) ? val[0] : 0;
    const to = Array.isArray(val) ? val[1] : val;
    return { prop, from, to, delta: to - from };
  });

  function tick(now: number) {
    if (isStopped) return;
    if (isPaused) {
      animId = requestAnimationFrame(tick);
      return;
    }

    const elapsed = (now - startTime) / 1000;
    let allResting = true;

    for (const el of elements) {
      for (const p of props) {
        // Evaluate spring from x0 = -p.delta to 0
        const sim = solver.evaluate(elapsed, -p.delta, 0);
        const current = p.to + sim.position;

        applyStyle(el, p.prop, current);

        if (Math.abs(sim.position) > 0.01 || Math.abs(sim.velocity) > 0.01) {
          allResting = false;
        }
      }
    }

    if (allResting) {
      for (const el of elements) {
        for (const p of props) {
          applyStyle(el, p.prop, p.to);
        }
      }
      resolveFinished();
    } else {
      animId = requestAnimationFrame(tick);
    }
  }

  animId = requestAnimationFrame(tick);

  return {
    stop() {
      isStopped = true;
      cancelAnimationFrame(animId);
      resolveFinished();
    },
    pause() {
      isPaused = true;
    },
    resume() {
      isPaused = false;
    },
    finished,
  };
}

function applyStyle(el: HTMLElement, prop: string, val: number) {
  if (prop === 'x' || prop === 'y') {
    el.style.transform = `${prop === 'x' ? 'translateX' : 'translateY'}(${val}px)`;
  } else if (prop === 'opacity') {
    el.style.opacity = `${val}`;
  } else if (prop === 'scale') {
    el.style.transform = `scale(${val})`;
  } else {
    (el.style as any)[prop] = `${val}px`;
  }
}

/**
 * Sequential and parallel animation timeline builder.
 */
export interface TimelineStep {
  target: string | HTMLElement;
  keyframes: Record<string, any>;
  options?: { at?: number | string };
}

export class TimelineBuilder {
  private steps: TimelineStep[] = [];

  public add(target: string | HTMLElement, keyframes: Record<string, any>, options?: { at?: number | string }): this {
    this.steps.push({ target, keyframes, options });
    return this;
  }

  public async play(): Promise<void> {
    for (const step of this.steps) {
      const anim = animate(step.target, step.keyframes);
      await anim.finished;
    }
  }

  public destroy(): void {
    this.steps.length = 0;
  }
}

export function timeline(): TimelineBuilder {
  return new TimelineBuilder();
}

/**
 * FLIP Layout Engine (First, Last, Invert, Play)
 */
export class FlipTransition {
  private firstRects = new Map<HTMLElement, DOMRect>();

  public read(elements: HTMLElement[]): void {
    this.firstRects.clear();
    for (const el of elements) {
      this.firstRects.set(el, el.getBoundingClientRect());
    }
  }

  public play(elements: HTMLElement[]): void {
    for (const el of elements) {
      const first = this.firstRects.get(el);
      if (!first) continue;

      const last = el.getBoundingClientRect();
      const deltaX = first.left - last.left;
      const deltaY = first.top - last.top;

      if (deltaX !== 0 || deltaY !== 0) {
        // Invert
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        el.style.transition = 'transform 0s';

        // Play
        requestAnimationFrame(() => {
          el.style.transition = 'transform 300ms cubic-bezier(0.2, 0, 0, 1)';
          el.style.transform = '';
        });
      }
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                 TOUCH & GESTURE RECOGNITION (COH-AMD-1.4)                  */
/* -------------------------------------------------------------------------- */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'selection' | 'success';

/**
 * Triggers safe, feature-detected tactile haptic feedback.
 */
export function triggerHaptic(pattern: HapticPattern = 'selection'): boolean {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const timings: Record<HapticPattern, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: 45,
      selection: 8,
      success: [15, 40, 20],
    };
    try {
      return navigator.vibrate(timings[pattern]);
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Global coordinator resolving conflicts between nested gesture recognizers.
 */
export class GestureCoordinator {
  private static activeClaimant: string | null = null;
  private static claimants = new Map<string, () => void>();

  public static register(id: string, onCancel: () => void): () => void {
    this.claimants.set(id, onCancel);
    return () => this.claimants.delete(id);
  }

  public static claim(id: string): boolean {
    if (this.activeClaimant && this.activeClaimant !== id) {
      const cancelFn = this.claimants.get(this.activeClaimant);
      if (cancelFn) cancelFn();
    }
    this.activeClaimant = id;
    return true;
  }

  public static release(id: string): void {
    if (this.activeClaimant === id) {
      this.activeClaimant = null;
    }
  }

  public static isClaimed(id: string): boolean {
    return this.activeClaimant === id;
  }
}

export interface PanGestureConfig {
  lockAxis?: 'x' | 'y';
  bounds?: { minX?: number; maxX?: number; minY?: number; maxY?: number };
  onPanStart?: (e: PointerEvent) => void;
  onPan?: (dx: number, dy: number, vx: number, vy: number) => void;
  onPanEnd?: (vx: number, vy: number) => void;
}

/**
 * Pan / Drag Gesture Controller with real-time velocity and spring integration.
 */
export function createPanGesture(element: HTMLElement, config: PanGestureConfig = {}): () => void {
  let isTracking = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let vx = 0;
  let vy = 0;
  const gestureId = `pan-${Math.random().toString(36).slice(2, 9)}`;

  const unregister = GestureCoordinator.register(gestureId, () => {
    if (isTracking) {
      isTracking = false;
      element.releasePointerCapture?.(pointerId);
      if (config.onPanEnd) config.onPanEnd(0, 0);
    }
  });

  let pointerId = 0;

  function onPointerDown(e: PointerEvent) {
    isTracking = true;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = performance.now();
    vx = 0;
    vy = 0;

    element.setPointerCapture?.(e.pointerId);
    GestureCoordinator.claim(gestureId);
    if (config.onPanStart) config.onPanStart(e);
  }

  function onPointerMove(e: PointerEvent) {
    if (!isTracking) return;

    const now = performance.now();
    const dt = Math.max((now - lastTime) / 1000, 0.001);

    // Exponentially smoothed velocity tracking (px/ms)
    const currentVx = (e.clientX - lastX) / dt;
    const currentVy = (e.clientY - lastY) / dt;
    vx = 0.8 * currentVx + 0.2 * vx;
    vy = 0.8 * currentVy + 0.2 * vy;

    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    if (config.lockAxis === 'x') dy = 0;
    if (config.lockAxis === 'y') dx = 0;

    if (config.bounds) {
      if (config.bounds.minX !== undefined) dx = Math.max(dx, config.bounds.minX);
      if (config.bounds.maxX !== undefined) dx = Math.min(dx, config.bounds.maxX);
      if (config.bounds.minY !== undefined) dy = Math.max(dy, config.bounds.minY);
      if (config.bounds.maxY !== undefined) dy = Math.min(dy, config.bounds.maxY);
    }

    if (config.onPan) config.onPan(dx, dy, vx, vy);
  }

  function onPointerUp(e: PointerEvent) {
    if (!isTracking) return;
    isTracking = false;
    element.releasePointerCapture?.(e.pointerId);
    GestureCoordinator.release(gestureId);
    if (config.onPanEnd) config.onPanEnd(vx, vy);
  }

  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointermove', onPointerMove);
  element.addEventListener('pointerup', onPointerUp);
  element.addEventListener('pointercancel', onPointerUp);

  return () => {
    unregister();
    element.removeEventListener('pointerdown', onPointerDown);
    element.removeEventListener('pointermove', onPointerMove);
    element.removeEventListener('pointerup', onPointerUp);
    element.removeEventListener('pointercancel', onPointerUp);
  };
}

export interface SwipeGestureConfig {
  thresholdDistance?: number;
  thresholdVelocity?: number; // px/ms
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

/**
 * Directional Swipe Recognizer.
 */
export function createSwipeGesture(element: HTMLElement, config: SwipeGestureConfig = {}): () => void {
  const distThreshold = config.thresholdDistance ?? 40;
  const velThreshold = config.thresholdVelocity ?? 0.3;

  return createPanGesture(element, {
    onPanEnd: (vx, vy) => {
      const absVx = Math.abs(vx);
      const absVy = Math.abs(vy);

      if (absVx > absVy && absVx > velThreshold) {
        if (vx > 0 && config.onSwipeRight) {
          triggerHaptic('light');
          config.onSwipeRight();
        } else if (vx < 0 && config.onSwipeLeft) {
          triggerHaptic('light');
          config.onSwipeLeft();
        }
      } else if (absVy > absVx && absVy > velThreshold) {
        if (vy > 0 && config.onSwipeDown) {
          triggerHaptic('light');
          config.onSwipeDown();
        } else if (vy < 0 && config.onSwipeUp) {
          triggerHaptic('light');
          config.onSwipeUp();
        }
      }
    },
  });
}

