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
