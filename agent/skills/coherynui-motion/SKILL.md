---
name: coherynui-motion
description: Implement physics-driven spring animations, FLIP layout morphing, and reduced-motion interactions with CoherynUI Motion.
---

# CoherynUI Motion Workflow

This skill guides coding assistants to compose physics-based browser animations using `@coherynui/motion`.

## 1. Principles
- **Analytical Spring Mechanics**: CoherynUI Motion solves damped harmonic equations ($m \cdot x'' + c \cdot x' + k \cdot x = 0$) in closed form with zero numerical drift.
- **FLIP Layout Transitions**: When DOM elements reorder, compute First, Last, Invert, Play matrices without layout thrashing.
- **Accessibility Invariant**: Automatically check `@media (prefers-reduced-motion: reduce)` and bypass animations to instant completion.

## 2. Using Springs & Timelines
```typescript
import { SpringSolver, animate, FlipTransition } from '@coherynui/motion';

// 1. Analytical Spring
const solver = new SpringSolver({ stiffness: 180, damping: 18, mass: 1.0 });
const solution = solver.solve({ from: 0, to: 300, initialVelocity: 0 });

// 2. Animate DOM Element
animate(element, {
  transform: ['translateY(20px)', 'translateY(0px)'],
  opacity: [0, 1]
}, {
  spring: { stiffness: 200, damping: 20 }
});
```

## 3. FLIP Transitions on Grid Reordering
When sorting or filtering items in a list:
```typescript
const flip = new FlipTransition(containerElement);
flip.captureFirst();
// Mutate DOM (e.g. reorder cards)
cards.sort(...);
flip.play({ duration: 400 });
```
