/**
 * CoherynUI Assist — Accessible Off-Canvas Drawer & Bottom Sheet Manager
 */

import {
  emitAssistEvent,
  enableScrollLock,
  disableScrollLock,
  getFocusableElements,
} from './utils.js';

interface DrawerState {
  element: HTMLElement;
  trigger: HTMLElement | null;
  releaseTrap: () => void;
}

const activeDrawers: DrawerState[] = [];

export function isDrawerOpen(drawer: HTMLElement): boolean {
  return drawer.classList.contains('active') || drawer.classList.contains('open');
}

export function openDrawer(drawer: HTMLElement, trigger: HTMLElement | null = null): boolean {
  if (isDrawerOpen(drawer)) return false;

  const allowed = emitAssistEvent(
    drawer,
    'cyn:show',
    { component: 'drawer', target: drawer, trigger },
    true
  );
  if (!allowed) return false;

  drawer.setAttribute('role', drawer.getAttribute('role') || 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-hidden', 'false');

  if (trigger) {
    trigger.setAttribute('aria-expanded', 'true');
  }

  drawer.classList.add('active');
  drawer.classList.add('open');

  enableScrollLock();

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusables = getFocusableElements(drawer);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      closeDrawer(drawer);
      e.stopPropagation();
    }
  };

  drawer.addEventListener('keydown', handleKeydown);

  const state: DrawerState = {
    element: drawer,
    trigger,
    releaseTrap: () => drawer.removeEventListener('keydown', handleKeydown),
  };
  activeDrawers.push(state);

  const focusables = getFocusableElements(drawer);
  if (focusables.length > 0) {
    focusables[0].focus();
  } else {
    drawer.setAttribute('tabindex', '-1');
    drawer.focus();
  }

  emitAssistEvent(drawer, 'cyn:shown', { component: 'drawer', target: drawer, trigger });
  return true;
}

export function closeDrawer(drawer: HTMLElement): boolean {
  if (!isDrawerOpen(drawer)) return false;

  const stateIndex = activeDrawers.findIndex((s) => s.element === drawer);
  const state = stateIndex !== -1 ? activeDrawers[stateIndex] : null;
  const trigger = state?.trigger ?? null;

  const allowed = emitAssistEvent(
    drawer,
    'cyn:hide',
    { component: 'drawer', target: drawer, trigger },
    true
  );
  if (!allowed) return false;

  if (state) {
    state.releaseTrap();
    activeDrawers.splice(stateIndex, 1);
  }

  drawer.classList.remove('active');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');

  if (trigger) {
    trigger.setAttribute('aria-expanded', 'false');
  }

  disableScrollLock();

  if (trigger && typeof trigger.focus === 'function') {
    trigger.focus();
  }

  emitAssistEvent(drawer, 'cyn:hidden', { component: 'drawer', target: drawer, trigger });
  return true;
}

export function toggleDrawer(drawer: HTMLElement, trigger: HTMLElement | null = null): boolean {
  return isDrawerOpen(drawer) ? closeDrawer(drawer) : openDrawer(drawer, trigger);
}

export function closeTopmostDrawer(): boolean {
  if (activeDrawers.length === 0) return false;
  const top = activeDrawers[activeDrawers.length - 1];
  return closeDrawer(top.element);
}

export function handleDrawerBackdropClick(e: MouseEvent): void {
  const target = e.target as HTMLElement;
  if (!target) return;

  if (
    target.classList.contains('drawer-backdrop') ||
    target.classList.contains('cyn-drawer-backdrop')
  ) {
    closeDrawer(target);
  }
}

