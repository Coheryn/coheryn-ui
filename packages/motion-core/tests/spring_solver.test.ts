import { SpringSolver, spring } from '../src/index';

describe('SpringSolver Analytical Physics', () => {
  it('correctly calculates initial displacement and decay over time', () => {
    const config = spring({ stiffness: 300, damping: 20, mass: 1 });
    const solver = new SpringSolver(config);

    // Initial state at t = 0
    const state0 = solver.evaluate(0, -100, 0);
    expect(state0.position).toBeCloseTo(-100, 1);

    // At t = 1.0s, displacement should decay towards equilibrium (0)
    const state1 = solver.evaluate(1.0, -100, 0);
    expect(Math.abs(state1.position)).toBeLessThan(5);

    // At t = 2.0s, spring should be fully at rest
    const state2 = solver.evaluate(2.0, -100, 0);
    expect(Math.abs(state2.position)).toBeLessThan(0.1);
    expect(Math.abs(state2.velocity)).toBeLessThan(0.1);
  });

  it('handles critically damped springs without oscillation', () => {
    // Critical damping: zeta = 1 (c = 2 * sqrt(k * m))
    // k = 100, m = 1 -> c = 20
    const solver = new SpringSolver({ stiffness: 100, damping: 20, mass: 1 });
    const state = solver.evaluate(0.5, 50, 0);
    expect(state.position).toBeGreaterThan(0);
    expect(state.position).toBeLessThan(50);
  });
});
