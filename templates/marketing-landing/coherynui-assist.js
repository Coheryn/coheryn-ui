/**
 * CoherynUI Assist v1.1.0 (coherynui-assist.js)
 * Declarative, zero-dependency progressive enhancement layer for CoherynUI.
 *
 * Supported Attributes:
 * - data-cyn-toggle="modal|drawer|dropdown|collapse"
 * - data-cyn-dismiss="modal|drawer|dropdown|alert"
 * - data-cyn-tab-target="#id"
 * - data-cyn-tabs (container for roving keyboard navigation)
 *
 * (c) Coheryn. Licensed under MIT / Apache-2.0.
 */
(function (global) {
  'use strict';

  var FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function getFocusableElements(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(function (el) {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
    });
  }

  function emitAssistEvent(element, type, detail, cancelable) {
    if (cancelable === undefined) cancelable = false;
    var event = new CustomEvent(type, {
      bubbles: true,
      cancelable: cancelable,
      detail: detail
    });
    return element.dispatchEvent(event);
  }

  function resolveTarget(trigger, attr) {
    if (attr === undefined) attr = 'data-cyn-target';
    var targetSelector = trigger.getAttribute(attr) || trigger.getAttribute('href');
    if (!targetSelector) return null;
    try {
      return document.querySelector(targetSelector);
    } catch (e) {
      return null;
    }
  }

  var scrollLockCount = 0;
  var originalOverflow = '';
  var originalPaddingRight = '';

  function enableScrollLock() {
    if (typeof document === 'undefined') return;
    if (scrollLockCount === 0) {
      originalOverflow = document.body.style.overflow;
      originalPaddingRight = document.body.style.paddingRight;
      var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = scrollbarWidth + 'px';
      }
    }
    scrollLockCount++;
  }

  function disableScrollLock() {
    if (typeof document === 'undefined') return;
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    }
  }

  // --- Modal Manager ---
  var activeModals = [];

  function isModalOpen(modal) {
    return modal.classList.contains('active') || modal.classList.contains('open');
  }

  function openModal(modal, trigger) {
    if (trigger === undefined) trigger = null;
    if (isModalOpen(modal)) return false;

    var allowed = emitAssistEvent(modal, 'cyn:show', { component: 'modal', target: modal, trigger: trigger }, true);
    if (!allowed) return false;

    modal.setAttribute('role', modal.getAttribute('role') || 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'false');

    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    }

    modal.classList.add('active');
    modal.classList.add('open');
    enableScrollLock();

    function handleKeydown(e) {
      if (e.key === 'Tab') {
        var focusables = getFocusableElements(modal);
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        var first = focusables[0];
        var last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      } else if (e.key === 'Escape') {
        closeModal(modal);
        e.stopPropagation();
      }
    }

    modal.addEventListener('keydown', handleKeydown);

    var state = {
      element: modal,
      trigger: trigger,
      releaseTrap: function () {
        modal.removeEventListener('keydown', handleKeydown);
      }
    };
    activeModals.push(state);

    var focusables = getFocusableElements(modal);
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      modal.setAttribute('tabindex', '-1');
      modal.focus();
    }

    emitAssistEvent(modal, 'cyn:shown', { component: 'modal', target: modal, trigger: trigger });
    return true;
  }

  function closeModal(modal) {
    if (!isModalOpen(modal)) return false;

    var stateIndex = activeModals.findIndex(function (s) { return s.element === modal; });
    var state = stateIndex !== -1 ? activeModals[stateIndex] : null;
    var trigger = state ? state.trigger : null;

    var allowed = emitAssistEvent(modal, 'cyn:hide', { component: 'modal', target: modal, trigger: trigger }, true);
    if (!allowed) return false;

    if (state) {
      state.releaseTrap();
      activeModals.splice(stateIndex, 1);
    }

    modal.classList.remove('active');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');

    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }

    disableScrollLock();

    if (trigger && typeof trigger.focus === 'function') {
      trigger.focus();
    }

    emitAssistEvent(modal, 'cyn:hidden', { component: 'modal', target: modal, trigger: trigger });
    return true;
  }

  function toggleModal(modal, trigger) {
    return isModalOpen(modal) ? closeModal(modal) : openModal(modal, trigger);
  }

  function closeTopmostModal() {
    if (activeModals.length === 0) return false;
    var top = activeModals[activeModals.length - 1];
    return closeModal(top.element);
  }

  // --- Drawer Manager ---
  var activeDrawers = [];

  function isDrawerOpen(drawer) {
    return drawer.classList.contains('active') || drawer.classList.contains('open');
  }

  function openDrawer(drawer, trigger) {
    if (trigger === undefined) trigger = null;
    if (isDrawerOpen(drawer)) return false;

    var allowed = emitAssistEvent(drawer, 'cyn:show', { component: 'drawer', target: drawer, trigger: trigger }, true);
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

    function handleKeydown(e) {
      if (e.key === 'Tab') {
        var focusables = getFocusableElements(drawer);
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        var first = focusables[0];
        var last = focusables[focusables.length - 1];

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
    }

    drawer.addEventListener('keydown', handleKeydown);

    var state = {
      element: drawer,
      trigger: trigger,
      releaseTrap: function () {
        drawer.removeEventListener('keydown', handleKeydown);
      }
    };
    activeDrawers.push(state);

    var focusables = getFocusableElements(drawer);
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      drawer.setAttribute('tabindex', '-1');
      drawer.focus();
    }

    emitAssistEvent(drawer, 'cyn:shown', { component: 'drawer', target: drawer, trigger: trigger });
    return true;
  }

  function closeDrawer(drawer) {
    if (!isDrawerOpen(drawer)) return false;

    var stateIndex = activeDrawers.findIndex(function (s) { return s.element === drawer; });
    var state = stateIndex !== -1 ? activeDrawers[stateIndex] : null;
    var trigger = state ? state.trigger : null;

    var allowed = emitAssistEvent(drawer, 'cyn:hide', { component: 'drawer', target: drawer, trigger: trigger }, true);
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

    emitAssistEvent(drawer, 'cyn:hidden', { component: 'drawer', target: drawer, trigger: trigger });
    return true;
  }

  function toggleDrawer(drawer, trigger) {
    return isDrawerOpen(drawer) ? closeDrawer(drawer) : openDrawer(drawer, trigger);
  }

  function closeTopmostDrawer() {
    if (activeDrawers.length === 0) return false;
    var top = activeDrawers[activeDrawers.length - 1];
    return closeDrawer(top.element);
  }

  // --- Dropdown Manager ---
  var activeDropdown = null;

  function isDropdownOpen(menu) {
    return menu.classList.contains('active') || menu.classList.contains('open');
  }

  function openDropdown(menu, trigger) {
    if (isDropdownOpen(menu)) return false;

    if (activeDropdown && activeDropdown.menu !== menu) {
      closeDropdown(activeDropdown.menu);
    }

    var allowed = emitAssistEvent(menu, 'cyn:show', { component: 'dropdown', target: menu, trigger: trigger }, true);
    if (!allowed) return false;

    menu.setAttribute('role', menu.getAttribute('role') || 'menu');
    menu.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');

    menu.classList.add('active');
    menu.classList.add('open');

    activeDropdown = { menu: menu, trigger: trigger };

    emitAssistEvent(menu, 'cyn:shown', { component: 'dropdown', target: menu, trigger: trigger });
    return true;
  }

  function closeDropdown(menu) {
    if (!isDropdownOpen(menu)) return false;

    var trigger = activeDropdown ? activeDropdown.trigger : null;

    var allowed = emitAssistEvent(menu, 'cyn:hide', { component: 'dropdown', target: menu, trigger: trigger }, true);
    if (!allowed) return false;

    menu.classList.remove('active');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');

    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }

    if (activeDropdown && activeDropdown.menu === menu) {
      activeDropdown = null;
    }

    emitAssistEvent(menu, 'cyn:hidden', { component: 'dropdown', target: menu, trigger: trigger });
    return true;
  }

  function toggleDropdown(menu, trigger) {
    return isDropdownOpen(menu) ? closeDropdown(menu) : openDropdown(menu, trigger);
  }

  function closeActiveDropdown() {
    if (!activeDropdown) return false;
    var menu = activeDropdown.menu;
    var trigger = activeDropdown.trigger;
    var closed = closeDropdown(menu);
    if (closed && trigger) {
      trigger.focus();
    }
    return closed;
  }

  // --- Tabs Manager ---
  function activateTab(tabBtn) {
    var container = tabBtn.closest('[data-cyn-tabs]') || tabBtn.closest('.cyn-tabs') || tabBtn.parentElement;
    if (!container) return false;

    var targetSelector = tabBtn.getAttribute('data-cyn-tab-target') || tabBtn.getAttribute('data-cyn-target');
    if (!targetSelector) return false;

    var targetPanel = null;
    try {
      targetPanel = document.querySelector(targetSelector);
    } catch (e) {
      return false;
    }
    if (!targetPanel) return false;

    var allowed = emitAssistEvent(targetPanel, 'cyn:show', { component: 'tabs', target: targetPanel, trigger: tabBtn }, true);
    if (!allowed) return false;

    // 1. Deactivate sibling buttons
    var tablist = tabBtn.closest('[role="tablist"]') || tabBtn.parentElement;
    if (tablist) {
      var allButtons = Array.from(tablist.querySelectorAll('[data-cyn-tab-target], .cyn-tab-btn, [role="tab"]'));
      allButtons.forEach(function (btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
        btn.setAttribute('tabindex', '-1');
      });
    }

    // 2. Activate clicked button
    tabBtn.classList.add('active');
    tabBtn.setAttribute('aria-selected', 'true');
    tabBtn.setAttribute('tabindex', '0');

    // 3. Deactivate sibling panels
    var panelParent = targetPanel.parentElement;
    if (panelParent) {
      var allPanels = Array.from(panelParent.querySelectorAll('.cyn-tabpanel, [role="tabpanel"]'));
      allPanels.forEach(function (panel) {
        panel.classList.remove('active');
        panel.setAttribute('aria-hidden', 'true');
      });
    }

    // 4. Activate target panel
    targetPanel.classList.add('active');
    targetPanel.setAttribute('aria-hidden', 'false');

    emitAssistEvent(targetPanel, 'cyn:shown', { component: 'tabs', target: targetPanel, trigger: tabBtn });
    return true;
  }

  // --- Collapse Manager ---
  function isCollapsed(element) {
    return !element.classList.contains('active') && !element.classList.contains('open');
  }

  function openCollapse(element, trigger) {
    if (!isCollapsed(element)) return false;

    var allowed = emitAssistEvent(element, 'cyn:show', { component: 'collapse', target: element, trigger: trigger }, true);
    if (!allowed) return false;

    element.classList.add('active');
    element.classList.add('open');
    element.setAttribute('aria-hidden', 'false');

    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    }

    emitAssistEvent(element, 'cyn:shown', { component: 'collapse', target: element, trigger: trigger });
    return true;
  }

  function closeCollapse(element, trigger) {
    if (isCollapsed(element)) return false;

    var allowed = emitAssistEvent(element, 'cyn:hide', { component: 'collapse', target: element, trigger: trigger }, true);
    if (!allowed) return false;

    element.classList.remove('active');
    element.classList.remove('open');
    element.setAttribute('aria-hidden', 'true');

    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    }

    emitAssistEvent(element, 'cyn:hidden', { component: 'collapse', target: element, trigger: trigger });
    return true;
  }

  function toggleCollapse(element, trigger) {
    return isCollapsed(element) ? openCollapse(element, trigger) : closeCollapse(element, trigger);
  }

  // --- Single Delegated Event Dispatcher ---
  var isListening = false;

  function handleClick(e) {
    var target = e.target;
    if (!target) return;

    // 1. Dismiss action
    var dismissTrigger = target.closest('[data-cyn-dismiss]');
    if (dismissTrigger) {
      var dismissType = dismissTrigger.getAttribute('data-cyn-dismiss');
      if (dismissType === 'modal') {
        var modal = resolveTarget(dismissTrigger) || dismissTrigger.closest('.modal-backdrop, .cyn-modal-backdrop, [role="dialog"]');
        if (modal) {
          closeModal(modal);
          e.preventDefault();
          return;
        }
      } else if (dismissType === 'drawer') {
        var drawer = resolveTarget(dismissTrigger) || dismissTrigger.closest('.drawer-backdrop, .cyn-drawer-backdrop, [data-cyn-drawer]');
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
        var alertEl = resolveTarget(dismissTrigger) || dismissTrigger.closest('.alert, .cyn-alert');
        if (alertEl) {
          alertEl.classList.add('cyn-fade-out');
          setTimeout(function () { alertEl.remove(); }, 200);
          e.preventDefault();
          return;
        }
      }
    }

    // 2. Toggle action
    var toggleTrigger = target.closest('[data-cyn-toggle]');
    if (toggleTrigger) {
      var toggleType = toggleTrigger.getAttribute('data-cyn-toggle');
      var compTarget = resolveTarget(toggleTrigger);

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

    // 3. Tab trigger
    var tabTrigger = target.closest('[data-cyn-tab-target]');
    if (tabTrigger) {
      activateTab(tabTrigger);
      e.preventDefault();
      return;
    }

    // 4. Modal backdrop click
    if (target.classList.contains('modal-backdrop') || target.classList.contains('cyn-modal-backdrop')) {
      closeModal(target);
    }

    // 5. Drawer backdrop click
    if (target.classList.contains('drawer-backdrop') || target.classList.contains('cyn-drawer-backdrop')) {
      closeDrawer(target);
    }

    // 6. Dropdown outside click
    if (activeDropdown && !activeDropdown.menu.contains(target) && !activeDropdown.trigger.contains(target)) {
      closeDropdown(activeDropdown.menu);
    }
  }

  function handleKeydown(e) {
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

    // Dropdown arrow navigation
    if (activeDropdown && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
      var items = getFocusableElements(activeDropdown.menu);
      if (items.length > 0) {
        var currentIndex = items.indexOf(document.activeElement);
        var nextIndex = 0;
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
        if (items[nextIndex]) items[nextIndex].focus();
      }
    }

    // Tablist arrow navigation
    var currentTab = e.target ? e.target.closest('[data-cyn-tab-target], .cyn-tab-btn, [role="tab"]') : null;
    if (currentTab) {
      var tablist = currentTab.closest('[role="tablist"]') || currentTab.parentElement;
      if (tablist) {
        var tabs = Array.from(tablist.querySelectorAll('[data-cyn-tab-target], .cyn-tab-btn, [role="tab"]'));
        if (tabs.length > 0) {
          var curIdx = tabs.indexOf(currentTab);
          var targetIdx = curIdx;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            targetIdx = (curIdx + 1) % tabs.length;
            e.preventDefault();
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            targetIdx = (curIdx - 1 + tabs.length) % tabs.length;
            e.preventDefault();
          } else if (e.key === 'Home') {
            targetIdx = 0;
            e.preventDefault();
          } else if (e.key === 'End') {
            targetIdx = tabs.length - 1;
            e.preventDefault();
          }
          if (targetIdx !== curIdx && tabs[targetIdx]) {
            tabs[targetIdx].focus();
            activateTab(tabs[targetIdx]);
          }
        }
      }
    }
  }

  function initAssist() {
    if (isListening || typeof document === 'undefined') return;
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    isListening = true;
  }

  function destroyAssist() {
    if (!isListening || typeof document === 'undefined') return;
    document.removeEventListener('click', handleClick);
    document.removeEventListener('keydown', handleKeydown);
    isListening = false;
  }

  // Public API
  var CoherynAssist = {
    initAssist: initAssist,
    destroyAssist: destroyAssist,
    openModal: openModal,
    closeModal: closeModal,
    toggleModal: toggleModal,
    isModalOpen: isModalOpen,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    toggleDrawer: toggleDrawer,
    isDrawerOpen: isDrawerOpen,
    openDropdown: openDropdown,
    closeDropdown: closeDropdown,
    toggleDropdown: toggleDropdown,
    isDropdownOpen: isDropdownOpen,
    activateTab: activateTab,
    openCollapse: openCollapse,
    closeCollapse: closeCollapse,
    toggleCollapse: toggleCollapse,
    isCollapsed: isCollapsed,
    enableScrollLock: enableScrollLock,
    disableScrollLock: disableScrollLock
  };

  // Auto-init on DOM ready
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAssist);
    } else {
      initAssist();
    }
    window.CoherynAssist = CoherynAssist;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoherynAssist;
  } else if (typeof define === 'function' && define.amd) {
    define([], function () { return CoherynAssist; });
  } else {
    global.CoherynAssist = CoherynAssist;
  }
})(typeof window !== 'undefined' ? window : this);
