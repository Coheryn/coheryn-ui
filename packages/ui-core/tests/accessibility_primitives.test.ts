import { trapFocus, rovingFocus, dismissOnEscape, scrollLock } from '../src/index';

describe('CoherynUI Components Headless Accessibility Primitives', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('manages roving tabindex correctly for navigation items', () => {
    const btn1 = document.createElement('button');
    const btn2 = document.createElement('button');
    const btn3 = document.createElement('button');
    container.appendChild(btn1);
    container.appendChild(btn2);
    container.appendChild(btn3);

    const controller = rovingFocus(container, [btn1, btn2, btn3], 'horizontal');

    expect(btn1.getAttribute('tabindex')).toBe('0');
    expect(btn2.getAttribute('tabindex')).toBe('-1');
    expect(btn3.getAttribute('tabindex')).toBe('-1');

    // Manually trigger arrow navigation
    controller.setActive(1);
    expect(btn1.getAttribute('tabindex')).toBe('-1');
    expect(btn2.getAttribute('tabindex')).toBe('0');

    controller.unbind();
  });

  it('locks and restores document body scroll', () => {
    expect(document.body.style.overflow).toBe('');
    const unlock = scrollLock();
    expect(document.body.style.overflow).toBe('hidden');

    unlock();
    expect(document.body.style.overflow).toBe('');
  });

  it('dismisses modal on Escape key press', () => {
    let dismissed = false;
    const unbind = dismissOnEscape(() => {
      dismissed = true;
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(dismissed).toBe(true);

    unbind();
  });
});
