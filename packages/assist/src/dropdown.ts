/**
 * CoherynUI Assist — Accessible Dropdown & Popover Manager
 */

import { emitAssistEvent, getFocusableElements } from './utils.js';

interface DropdownState {
  menu: HTMLElement;
  trigger: HTMLElement;
}

let activeDropdown: DropdownState | null = null;

export function isDropdownOpen(menu: HTMLElement): boolean {
  return menu.classList.contains('active') || menu.classList.contains('open');
}

export function openDropdown(menu: HTMLElement, trigger: HTMLElement): boolean {
  if (isDropdownOpen(menu)) return false;

  // Close any currently active dropdown first
  if (activeDropdown && activeDropdown.menu !== menu) {
    closeDropdown(activeDropdown.menu);
  }

  const allowed = emitAssistEvent(
    menu,
    'cyn:show',
    { component: 'dropdown', target: menu, trigger },
    true
  );
  if (!allowed) return false;

  menu.setAttribute('role', menu.getAttribute('role') || 'menu');
  menu.setAttribute('aria-hidden', 'false');
  trigger.setAttribute('aria-expanded', 'true');

  menu.classList.add('active');
  menu.classList.add('open');

  activeDropdown = { menu, trigger };

  emitAssistEvent(menu, 'cyn:shown', { component: 'dropdown', target: menu, trigger });
  return true;
}

export function closeDropdown(menu: HTMLElement): boolean {
  if (!isDropdownOpen(menu)) return false;

  const trigger = activeDropdown?.trigger ?? null;

  const allowed = emitAssistEvent(
    menu,
    'cyn:hide',
    { component: 'dropdown', target: menu, trigger },
    true
  );
  if (!allowed) return false;

  menu.classList.remove('active');
  menu.classList.remove('open');
  menu.setAttribute('aria-hidden', 'true');

  if (trigger) {
    trigger.setAttribute('aria-expanded', 'false');
  }

  if (activeDropdown?.menu === menu) {
    activeDropdown = null;
  }

  emitAssistEvent(menu, 'cyn:hidden', { component: 'dropdown', target: menu, trigger });
  return true;
}

export function toggleDropdown(menu: HTMLElement, trigger: HTMLElement): boolean {
  return isDropdownOpen(menu) ? closeDropdown(menu) : openDropdown(menu, trigger);
}

export function closeActiveDropdown(): boolean {
  if (!activeDropdown) return false;
  const { menu, trigger } = activeDropdown;
  const closed = closeDropdown(menu);
  if (closed && trigger) {
    trigger.focus();
  }
  return closed;
}

export function handleDropdownOutsideClick(e: MouseEvent): void {
  if (!activeDropdown) return;
  const target = e.target as HTMLElement;
  if (!target) return;

  if (
    !activeDropdown.menu.contains(target) &&
    !activeDropdown.trigger.contains(target)
  ) {
    closeDropdown(activeDropdown.menu);
  }
}

export function handleDropdownKeydown(e: KeyboardEvent): void {
  if (!activeDropdown) return;
  const { menu, trigger } = activeDropdown;

  if (e.key === 'Escape') {
    closeActiveDropdown();
    e.preventDefault();
    return;
  }

  // Arrow key navigation inside dropdown items
  if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
    const items = getFocusableElements(menu);
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex = 0;

    if (e.key === 'ArrowDown') {
      nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextIndex = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextIndex = items.length - 1;
      e.preventDefault();
    }

    items[nextIndex]?.focus();
  }
}

