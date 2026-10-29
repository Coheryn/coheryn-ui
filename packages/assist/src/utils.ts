/**
 * CoherynUI Assist — Shared DOM and Accessibility Utilities
 */

import type { AssistEventType, AssistEventDetail } from './types.js';

export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
    return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
  });
}

export function emitAssistEvent(
  element: HTMLElement,
  type: AssistEventType,
  detail: AssistEventDetail,
  cancelable = false
): boolean {
  const event = new CustomEvent(type, {
    bubbles: true,
    cancelable,
    detail,
  });
  return element.dispatchEvent(event);
}

export function resolveTarget(trigger: HTMLElement, attr: string = 'data-cyn-target'): HTMLElement | null {
  const targetSelector = trigger.getAttribute(attr) || trigger.getAttribute('href');
  if (!targetSelector) return null;
  try {
    return document.querySelector<HTMLElement>(targetSelector);
  } catch {
    return null;
  }
}

let scrollLockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

export function enableScrollLock(): void {
  if (typeof document === 'undefined') return;
  if (scrollLockCount === 0) {
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  scrollLockCount++;
}

export function disableScrollLock(): void {
  if (typeof document === 'undefined') return;
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  }
}

