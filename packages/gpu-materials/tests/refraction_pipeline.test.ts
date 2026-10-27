import { createRefractiveMaterial } from '../src/index';

describe('RefractiveMaterial 3-Tier Fallback', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('gracefully degrades to CSS glass when WebGPU is unavailable in standard environment', async () => {
    const material = await createRefractiveMaterial({
      element,
      fallback: 'css-glass',
      strength: 0.3,
    });

    expect(material.tier).toBeDefined();
    // Element should have CSS glass fallback applied
    expect(element.classList.contains('glass')).toBe(true);

    material.destroy();
    expect(element.classList.contains('glass')).toBe(false);
  });

  it('respects opaque fallback option when requested', async () => {
    const material = await createRefractiveMaterial({
      element,
      fallback: 'opaque',
    });

    expect(element.classList.contains('bg-surface')).toBe(true);
    material.destroy();
    expect(element.classList.contains('bg-surface')).toBe(false);
  });
});
