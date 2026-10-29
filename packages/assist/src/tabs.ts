/**
 * CoherynUI Assist — Accessible Tabs Manager
 * Follows WAI-ARIA 1.2 Tabs Pattern with Roving Tabindex and Keyboard Navigation.
 */

import { emitAssistEvent } from './utils.js';

export function activateTab(tabBtn: HTMLElement): boolean {
  const container = tabBtn.closest('[data-cyn-tabs]') || tabBtn.closest('.cyn-tabs') || tabBtn.parentElement;
  if (!container) return false;

  const targetSelector = tabBtn.getAttribute('data-cyn-tab-target') || tabBtn.getAttribute('data-cyn-target');
  if (!targetSelector) return false;

  let targetPanel: HTMLElement | null = null;
  try {
    targetPanel = document.querySelector<HTMLElement>(targetSelector);
  } catch {
    return false;
  }
  if (!targetPanel) return false;

  const allowed = emitAssistEvent(
    targetPanel,
    'cyn:show',
    { component: 'tabs', target: targetPanel, trigger: tabBtn },
    true
  );
  if (!allowed) return false;

  // 1. Deactivate all sibling tab buttons in this tab list
  const tablist = tabBtn.closest('[role="tablist"]') || tabBtn.parentElement;
  if (tablist) {
    const allButtons = Array.from(
      tablist.querySelectorAll<HTMLElement>('[data-cyn-tab-target], .cyn-tab-btn, [role="tab"]')
    );
    allButtons.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('tabindex', '-1');
    });
  }

  // 2. Activate current tab button
  tabBtn.classList.add('active');
  tabBtn.setAttribute('aria-selected', 'true');
  tabBtn.setAttribute('tabindex', '0');

  // 3. Deactivate sibling panels
  const panelParent = targetPanel.parentElement;
  if (panelParent) {
    const allPanels = Array.from(
      panelParent.querySelectorAll<HTMLElement>('.cyn-tabpanel, [role="tabpanel"]')
    );
    allPanels.forEach((panel) => {
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

export function handleTabKeydown(e: KeyboardEvent): void {
  const currentTab = (e.target as HTMLElement)?.closest<HTMLElement>(
    '[data-cyn-tab-target], .cyn-tab-btn, [role="tab"]'
  );
  if (!currentTab) return;

  const tablist = currentTab.closest('[role="tablist"]') || currentTab.parentElement;
  if (!tablist) return;

  const tabs = Array.from(
    tablist.querySelectorAll<HTMLElement>('[data-cyn-tab-target], .cyn-tab-btn, [role="tab"]')
  );
  if (tabs.length === 0) return;

  const currentIndex = tabs.indexOf(currentTab);
  let nextIndex = currentIndex;

  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    nextIndex = (currentIndex + 1) % tabs.length;
    e.preventDefault();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    e.preventDefault();
  } else if (e.key === 'Home') {
    nextIndex = 0;
    e.preventDefault();
  } else if (e.key === 'End') {
    nextIndex = tabs.length - 1;
    e.preventDefault();
  } else {
    return;
  }

  const nextTab = tabs[nextIndex];
  if (nextTab) {
    nextTab.focus();
    activateTab(nextTab);
  }
}

