/**
 * CoherynUI Assist — Accessible Collapse / Accordion Manager
 */

import { emitAssistEvent } from './utils.js';

export function isCollapsed(element: HTMLElement): boolean {
  return !element.classList.contains('active') && !element.classList.contains('open');
}

export function openCollapse(element: HTMLElement, trigger: HTMLElement | null = null): boolean {
  if (!isCollapsed(element)) return false;

  const allowed = emitAssistEvent(
    element,
    'cyn:show',
    { component: 'collapse', target: element, trigger },
    true
  );
  if (!allowed) return false;

  element.classList.add('active');
  element.classList.add('open');
  element.setAttribute('aria-hidden', 'false');

  if (trigger) {
    trigger.setAttribute('aria-expanded', 'true');
  }

  emitAssistEvent(element, 'cyn:shown', { component: 'collapse', target: element, trigger });
  return true;
}

export function closeCollapse(element: HTMLElement, trigger: HTMLElement | null = null): boolean {
  if (isCollapsed(element)) return false;

  const allowed = emitAssistEvent(
    element,
    'cyn:hide',
    { component: 'collapse', target: element, trigger },
    true
  );
  if (!allowed) return false;

  element.classList.remove('active');
  element.classList.remove('open');
  element.setAttribute('aria-hidden', 'true');

  if (trigger) {
    trigger.setAttribute('aria-expanded', 'false');
  }

  emitAssistEvent(element, 'cyn:hidden', { component: 'collapse', target: element, trigger });
  return true;
}

export function toggleCollapse(element: HTMLElement, trigger: HTMLElement | null = null): boolean {
  return isCollapsed(element) ? openCollapse(element, trigger) : closeCollapse(element, trigger);
}

