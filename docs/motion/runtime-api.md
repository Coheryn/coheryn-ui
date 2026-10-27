# CoherynUI Motion — Runtime API & Physics Specification v1.0

**Status:** Approved Specification  
**Authority:** [CoherynUI CSS Engineering Master Plan v1.1](../../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md) — Section 9.2  
**Reference ADR:** [ADR-014: Motion Frame Scheduler, Spring Solver, Gestures, and Interruption](../../rfcs/0014-motion-frame-scheduler-spring-solver-gestures.md)

---

## 1. Overview & Core Philosophy

CoherynUI Motion ([@coherynui/motion](../../packages/motion-core/src/index.ts)) is a production-grade browser animation engine built on analytical spring mechanics. It operates independently of the native Rust compiler and is strictly opt-in.

---

## 2. Analytical Spring Physics

Unlike discrete Euler numerical integration (which drifts and blows up under varying frame rates), CoherynUI solves the harmonic oscillator differential equation analytically:

$$m \cdot x'' + c \cdot x' + k \cdot x = 0$$

Where:
* $k$ = Spring stiffness (`stiffness`, default `280`)
* $c$ = Damping coefficient (`damping`, default `24`)
* $m$ = Inertial mass (`mass`, default `1.0`)

### Zero Velocity Snapping
When an in-flight animation is interrupted or retargeted, the current position and velocity are fed directly as the initial conditions $(x_0, v_0)$ of the new trajectory, preventing unnatural visual snaps.

---

## 3. API Reference

### 3.1 `animate()`
```ts
import { animate, spring } from '@coherynui/motion';

const control = animate('.card', {
  x: [0, 100],
  opacity: [0, 1],
}, {
  transition: spring({ stiffness: 300, damping: 20 })
});

// Interrupt or control
control.pause();
control.resume();
control.stop();
await control.finished;
```

### 3.2 `timeline()`
```ts
import { timeline } from '@coherynui/motion';

const seq = timeline()
  .add('.title', { opacity: [0, 1] })
  .add('.panel', { y: [20, 0] }, { at: '-=0.1' });

await seq.play();
seq.destroy();
```

### 3.3 FLIP Layout Transitions
```ts
import { FlipTransition } from '@coherynui/motion';

const flip = new FlipTransition();
flip.read(cards);
// Mutate DOM (e.g. reorder list or toggle expanded)
flip.play(cards);
```
