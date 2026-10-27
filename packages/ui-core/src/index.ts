/**
 * CoherynUI Components — Framework-Neutral Accessible Primitives (@coherynui/components)
 *
 * Implements WAI-ARIA 1.2 / WCAG 2.2 AA compliant headless behaviors:
 * focus trapping, roving tabindex, keyboard interaction models, outside click dismissal,
 * and scroll locking for modals and popups.
 */

export interface FocusTrapController {
  release(): void;
}

export function trapFocus(container: HTMLElement): FocusTrapController {
  const focusableSelector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function getFocusableElements(): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
    );
  }

  const focusable = getFocusableElements();
  if (focusable.length > 0) {
    focusable[0].focus();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    const currentFocusables = getFocusableElements();
    if (currentFocusables.length === 0) {
      e.preventDefault();
      return;
    }

    const first = currentFocusables[0];
    const last = currentFocusables[currentFocusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }

  container.addEventListener('keydown', handleKeyDown);
  return {
    release: () => container.removeEventListener('keydown', handleKeyDown),
  };
}

export function rovingFocus(
  container: HTMLElement,
  items: HTMLElement[],
  orientation: 'horizontal' | 'vertical' | 'both' = 'horizontal',
  onSelect?: (index: number) => void
): { unbind(): void; setActive(index: number): void } {
  let currentIndex = 0;

  function updateTabIndices() {
    items.forEach((item, idx) => {
      item.setAttribute('tabindex', idx === currentIndex ? '0' : '-1');
    });
  }
  updateTabIndices();

  function onKeyDown(e: KeyboardEvent) {
    let nextIndex = currentIndex;
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';
    const isVertical = orientation === 'vertical' || orientation === 'both';

    if ((isHorizontal && e.key === 'ArrowRight') || (isVertical && e.key === 'ArrowDown')) {
      nextIndex = (currentIndex + 1) % items.length;
      e.preventDefault();
    } else if ((isHorizontal && e.key === 'ArrowLeft') || (isVertical && e.key === 'ArrowUp')) {
      nextIndex = (currentIndex - 1 + items.length) % items.length;
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextIndex = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextIndex = items.length - 1;
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === ' ') {
      onSelect?.(currentIndex);
      e.preventDefault();
      return;
    }

    if (nextIndex !== currentIndex) {
      currentIndex = nextIndex;
      updateTabIndices();
      items[currentIndex]?.focus();
    }
  }

  container.addEventListener('keydown', onKeyDown);
  return {
    unbind: () => container.removeEventListener('keydown', onKeyDown),
    setActive: (idx: number) => {
      currentIndex = idx;
      updateTabIndices();
      items[currentIndex]?.focus();
    },
  };
}

export function dismissOnEscape(callback: () => void): () => void {
  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      callback();
    }
  }
  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}

export function dismissOnOutsideClick(container: HTMLElement, callback: () => void): () => void {
  function onPointerDown(e: MouseEvent | TouchEvent) {
    if (container && !container.contains(e.target as Node)) {
      callback();
    }
  }
  document.addEventListener('pointerdown', onPointerDown);
  return () => document.removeEventListener('pointerdown', onPointerDown);
}

export function scrollLock(): () => void {
  if (typeof document === 'undefined') return () => {};
  const originalOverflow = document.body.style.overflow;
  const originalPaddingRight = document.body.style.paddingRight;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  document.body.style.overflow = 'hidden';
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  return () => {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  };
}
