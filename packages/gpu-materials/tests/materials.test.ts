import { createRefractiveMaterial } from '../src/index';

describe('CoherynUI GPU Materials — Fallback & Pipeline', () => {
  it('falls back to CSS Liquid Glass gracefully when WebGPU is unavailable', async () => {
    const dummyElement = {
      style: {},
      classList: {
        add: (cls: string) => {
          dummyElement.className = cls;
        },
      },
      className: '',
      prepend: () => {},
    } as unknown as HTMLElement;

    const instance = await createRefractiveMaterial({
      element: dummyElement,
      fallback: 'css-glass',
    });

    expect(instance).toBeDefined();
    expect(instance.tier).toBe('css-glass');
    expect(typeof instance.destroy).toBe('function');
  });
});
