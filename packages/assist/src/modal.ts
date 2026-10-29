/**
 * CoherynUI Assist — Accessible Modal Manager
 * Supports automated ARIA states, focus trapping, scroll lock, outside click, and focus restoration.
 */

import {
  emitAssistEvent,
  enableScrollLock,
  disableScrollLock,
  getFocusableElements,
} from './utils.js';

interface ModalState {
  element: HTMLElement;
  trigger: HTMLElement | null;
  releaseTrap: () => void;
}

const activeModals: ModalState[] = [];

export function isModalOpen(modal: HTMLElement): boolean {
  return modal.classList.contains('active') || modal.classList.contains('open');
}

export function openModal(modal: HTMLElement, trigger: HTMLElement | null = null): boolean {
  if (isModalOpen(modal)) return false;

  const allowed = emitAssistEvent(
    modal,
    'cyn:show',
    { component: 'modal', target: modal, trigger },
    true
  );
  if (!allowed) return false;

  // ARIA attributes
  modal.setAttribute('role', modal.getAttribute('role') || 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'false');

  if (trigger) {
    trigger.setAttribute('aria-expanded', 'true');
  }

  // Open classes
  modal.classList.add('active');
  modal.classList.add('open');

  enableScrollLock();

  // Focus trapping
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusables = getFocusableElements(modal);
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
      closeModal(modal);
      e.stopPropagation();
    }
  };

  modal.addEventListener('keydown', handleKeydown);

  const state: ModalState = {
    element: modal,
    trigger,
    releaseTrap: () => modal.removeEventListener('keydown', handleKeydown),
  };
  activeModals.push(state);

  // Focus initial element
  const focusables = getFocusableElements(modal);
  if (focusables.length > 0) {
    // Prefer input or close button, or first focusable
    focusables[0].focus();
  } else {
    modal.setAttribute('tabindex', '-1');
    modal.focus();
  }

  emitAssistEvent(modal, 'cyn:shown', { component: 'modal', target: modal, trigger });
  return true;
}

export function closeModal(modal: HTMLElement): boolean {
  if (!isModalOpen(modal)) return false;

  const stateIndex = activeModals.findIndex((s) => s.element === modal);
  const state = stateIndex !== -1 ? activeModals[stateIndex] : null;
  const trigger = state?.trigger ?? null;

  const allowed = emitAssistEvent(
    modal,
    'cyn:hide',
    { component: 'modal', target: modal, trigger },
    true
  );
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

  // Restore focus to trigger element (WCAG 2.2 AA)
  if (trigger && typeof trigger.focus === 'function') {
    trigger.focus();
  }

  emitAssistEvent(modal, 'cyn:hidden', { component: 'modal', target: modal, trigger });
  return true;
}

export function toggleModal(modal: HTMLElement, trigger: HTMLElement | null = null): boolean {
  return isModalOpen(modal) ? closeModal(modal) : openModal(modal, trigger);
}

export function closeTopmostModal(): boolean {
  if (activeModals.length === 0) return false;
  const top = activeModals[activeModals.length - 1];
  return closeModal(top.element);
}

export function handleModalBackdropClick(e: MouseEvent): void {
  const target = e.target as HTMLElement;
  if (!target) return;

  // If clicked directly on the backdrop (not inside modal-box/dialog)
  if (target.classList.contains('modal-backdrop') || target.classList.contains('cyn-modal-backdrop')) {
    closeModal(target);
  }
}

