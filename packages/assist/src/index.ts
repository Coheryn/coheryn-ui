/**
 * CoherynUI Assist — Optional Declarative JavaScript Enhancement Layer (@coheryn/coherynui-js-assist)
 *
 * Provides progressive accessibility enhancement with single delegated event listening:
 * - data-cyn-toggle="modal|drawer|dropdown|collapse"
 * - data-cyn-dismiss="modal|drawer|dropdown|alert"
 * - data-cyn-tab-target="#id"
 * - Auto ARIA reflection, focus trapping, scroll locking, and roving tabindex
 */

import { initDispatcher, destroyDispatcher } from './dispatcher.js';
import { openModal, closeModal, toggleModal, isModalOpen } from './modal.js';
import { openDrawer, closeDrawer, toggleDrawer, isDrawerOpen } from './drawer.js';
import { openDropdown, closeDropdown, toggleDropdown, isDropdownOpen } from './dropdown.js';
import { activateTab } from './tabs.js';
import { openCollapse, closeCollapse, toggleCollapse, isCollapsed } from './collapse.js';
import { enableScrollLock, disableScrollLock } from './utils.js';

export * from './types.js';
export {
  initDispatcher,
  destroyDispatcher,
  openModal,
  closeModal,
  toggleModal,
  isModalOpen,
  openDrawer,
  closeDrawer,
  toggleDrawer,
  isDrawerOpen,
  openDropdown,
  closeDropdown,
  toggleDropdown,
  isDropdownOpen,
  activateTab,
  openCollapse,
  closeCollapse,
  toggleCollapse,
  isCollapsed,
  enableScrollLock,
  disableScrollLock,
};

let initialized = false;

export function initAssist(): void {
  if (initialized) return;
  initDispatcher();
  initialized = true;
}

export function destroyAssist(): void {
  if (!initialized) return;
  destroyDispatcher();
  initialized = false;
}

// Auto-initialize when running in browser environments
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAssist());
  } else {
    initAssist();
  }

  // Expose global namespace for standalone script tag usage
  (window as unknown as { CoherynAssist: unknown }).CoherynAssist = {
    initAssist,
    destroyAssist,
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    isDrawerOpen,
    openDropdown,
    closeDropdown,
    toggleDropdown,
    isDropdownOpen,
    activateTab,
    openCollapse,
    closeCollapse,
    toggleCollapse,
    isCollapsed,
  };
}

export default {
  initAssist,
  destroyAssist,
  openModal,
  closeModal,
  toggleModal,
  isModalOpen,
  openDrawer,
  closeDrawer,
  toggleDrawer,
  isDrawerOpen,
  openDropdown,
  closeDropdown,
  toggleDropdown,
  isDropdownOpen,
  activateTab,
  openCollapse,
  closeCollapse,
  toggleCollapse,
  isCollapsed,
};

