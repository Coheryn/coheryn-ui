/**
 * CoherynUI Assist — Single Delegated Event Dispatcher
 * Monitors root document events for declarative data-cyn-* attributes.
 * Zero memory leaks, zero manual re-binding on dynamic DOM / HTMX injection.
 */

import {
  toggleModal,
  closeModal,
  closeTopmostModal,
  handleModalBackdropClick,
} from './modal.js';
import {
  toggleDrawer,
  closeDrawer,
  closeTopmostDrawer,
  handleDrawerBackdropClick,
} from './drawer.js';
import {
  toggleDropdown,
  closeActiveDropdown,
  handleDropdownOutsideClick,
  handleDropdownKeydown,
} from './dropdown.js';
import { activateTab, handleTabKeydown } from './tabs.js';
import { toggleCollapse, closeCollapse } from './collapse.js';
import { resolveTarget } from './utils.js';

let isListening = false;

function handleClick(e: MouseEvent): void {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  // 1. Handle dismiss triggers: [data-cyn-dismiss]
  const dismissTrigger = target.closest<HTMLElement>('[data-cyn-dismiss]');
  if (dismissTrigger) {
    const dismissType = dismissTrigger.getAttribute('data-cyn-dismiss');

    if (dismissType === 'modal') {
      const modal =
        resolveTarget(dismissTrigger) ||
        dismissTrigger.closest<HTMLElement>('.modal-backdrop, .cyn-modal-backdrop, [role="dialog"]');
      if (modal) {
        closeModal(modal);
        e.preventDefault();
        return;
      }
    } else if (dismissType === 'drawer') {
      const drawer =
        resolveTarget(dismissTrigger) ||
        dismissTrigger.closest<HTMLElement>('.drawer-backdrop, .cyn-drawer-backdrop, [data-cyn-drawer]');
      if (drawer) {
        closeDrawer(drawer);
        e.preventDefault();
        return;
      }
    } else if (dismissType === 'dropdown') {
      closeActiveDropdown();
      e.preventDefault();
      return;
    } else if (dismissType === 'alert') {
      const alert =
        resolveTarget(dismissTrigger) ||
        dismissTrigger.closest<HTMLElement>('.alert, .cyn-alert');
      if (alert) {
        alert.classList.add('cyn-fade-out');
        setTimeout(() => alert.remove(), 200);
        e.preventDefault();
        return;
      }
    }
  }

  // 2. Handle toggle triggers: [data-cyn-toggle]
  const toggleTrigger = target.closest<HTMLElement>('[data-cyn-toggle]');
  if (toggleTrigger) {
    const toggleType = toggleTrigger.getAttribute('data-cyn-toggle');
    const compTarget = resolveTarget(toggleTrigger);

    if (toggleType === 'modal' && compTarget) {
      toggleModal(compTarget, toggleTrigger);
      e.preventDefault();
      return;
    } else if (toggleType === 'drawer' && compTarget) {
      toggleDrawer(compTarget, toggleTrigger);
      e.preventDefault();
      return;
    } else if (toggleType === 'dropdown' && compTarget) {
      toggleDropdown(compTarget, toggleTrigger);
      e.preventDefault();
      return;
    } else if (toggleType === 'collapse' && compTarget) {
      toggleCollapse(compTarget, toggleTrigger);
      e.preventDefault();
      return;
    }
  }

  // 3. Handle tab buttons: [data-cyn-tab-target]
  const tabTrigger = target.closest<HTMLElement>('[data-cyn-tab-target]');
  if (tabTrigger) {
    activateTab(tabTrigger);
    e.preventDefault();
    return;
  }

  // 4. Handle backdrop clicks
  handleModalBackdropClick(e);
  handleDrawerBackdropClick(e);

  // 5. Handle dropdown outside clicks
  handleDropdownOutsideClick(e);
}

function handleKeydown(e: KeyboardEvent): void {
  // Global Escape priority: Dropdown -> Modal -> Drawer
  if (e.key === 'Escape') {
    if (closeActiveDropdown()) {
      e.preventDefault();
      return;
    }
    if (closeTopmostModal()) {
      e.preventDefault();
      return;
    }
    if (closeTopmostDrawer()) {
      e.preventDefault();
      return;
    }
  }

  // Dropdown keyboard navigation
  handleDropdownKeydown(e);

  // Tablist arrow navigation
  handleTabKeydown(e);
}

export function initDispatcher(): void {
  if (isListening || typeof document === 'undefined') return;
  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeydown);
  isListening = true;
}

export function destroyDispatcher(): void {
  if (!isListening || typeof document === 'undefined') return;
  document.removeEventListener('click', handleClick);
  document.removeEventListener('keydown', handleKeydown);
  isListening = false;
}

