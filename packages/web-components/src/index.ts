/**
 * @coheryn/coherynui-web-components
 *
 * Official Native Web Component Custom Elements for CoherynUI.
 * Delivers zero-framework, accessible UI elements compliant with W3C Custom Elements v1.
 * Works seamlessly in Vanilla HTML/JS, Vue, Svelte, Angular, Solid, PHP, Django, and Rails.
 */

import {
  trapFocus,
  rovingFocus,
  dismissOnEscape,
  dismissOnOutsideClick,
  scrollLock,
  FocusTrapController,
} from '@coheryn/coherynui-components';

/* -------------------------------------------------------------------------- */
/*                                BASE HELPERS                                */
/* -------------------------------------------------------------------------- */

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const CustomElementBase = isBrowser ? HTMLElement : (class {} as unknown as typeof HTMLElement);

/* -------------------------------------------------------------------------- */
/*                                  CYN-MODAL                                 */
/* -------------------------------------------------------------------------- */

export class CynModal extends CustomElementBase {
  static get observedAttributes() {
    return ['open', 'title'];
  }

  private _trap: FocusTrapController | null = null;
  private _unlockScroll: (() => void) | null = null;
  private _unbindEsc: (() => void) | null = null;
  private _backdrop: HTMLDivElement | null = null;
  private _dialogBox: HTMLDivElement | null = null;

  connectedCallback() {
    if (!isBrowser) return;
    this.render();
    if (this.hasAttribute('open')) {
      this.activateOverlay();
    }
  }

  disconnectedCallback() {
    this.cleanupOverlay();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    if (name === 'open') {
      if (this.hasAttribute('open')) {
        this.activateOverlay();
        this.dispatchEvent(new CustomEvent('cyn-open', { bubbles: true, composed: true }));
      } else {
        this.cleanupOverlay();
        this.dispatchEvent(new CustomEvent('cyn-close', { bubbles: true, composed: true }));
      }
    } else if (name === 'title' && this._dialogBox) {
      const heading = this._dialogBox.querySelector('.cyn-modal-title');
      if (heading) heading.textContent = newValue || '';
    }
  }

  public show() {
    this.setAttribute('open', '');
  }

  public close() {
    this.removeAttribute('open');
  }

  public toggle() {
    if (this.hasAttribute('open')) this.close();
    else this.show();
  }

  private render() {
    if (this._backdrop) return;

    // Create backdrop container
    this._backdrop = document.createElement('div');
    this._backdrop.className = 'modal-backdrop';
    this._backdrop.setAttribute('role', 'presentation');
    this._backdrop.addEventListener('click', (e) => {
      if (e.target === this._backdrop) this.close();
    });

    // Create dialog container
    this._dialogBox = document.createElement('div');
    this._dialogBox.className = 'modal-dialog';
    this._dialogBox.setAttribute('role', 'dialog');
    this._dialogBox.setAttribute('aria-modal', 'true');

    // Header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '1rem';

    const titleEl = document.createElement('h3');
    titleEl.className = 'cyn-modal-title text-xl font-bold';
    titleEl.textContent = this.getAttribute('title') || '';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-subtle p-1.5 radius-md';
    closeBtn.setAttribute('aria-label', 'Close modal');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    // Body container moving children inside
    const body = document.createElement('div');
    body.className = 'cyn-modal-body';
    while (this.firstChild) {
      body.appendChild(this.firstChild);
    }

    this._dialogBox.appendChild(header);
    this._dialogBox.appendChild(body);
    this._backdrop.appendChild(this._dialogBox);
    this.appendChild(this._backdrop);
  }

  private activateOverlay() {
    if (!this._backdrop) this.render();
    if (!this._backdrop) return;

    this._backdrop.classList.add('open');
    this._unlockScroll = scrollLock();
    this._unbindEsc = dismissOnEscape(() => this.close());
    if (this._dialogBox) {
      this._trap = trapFocus(this._dialogBox);
    }
  }

  private cleanupOverlay() {
    if (this._backdrop) {
      this._backdrop.classList.remove('open');
    }
    this._trap?.release();
    this._trap = null;
    this._unlockScroll?.();
    this._unlockScroll = null;
    this._unbindEsc?.();
    this._unbindEsc = null;
  }
}

/* -------------------------------------------------------------------------- */
/*                                  CYN-DRAWER                                */
/* -------------------------------------------------------------------------- */

export class CynDrawer extends CustomElementBase {
  static get observedAttributes() {
    return ['open', 'title', 'placement'];
  }

  private _trap: FocusTrapController | null = null;
  private _unlockScroll: (() => void) | null = null;
  private _unbindEsc: (() => void) | null = null;
  private _backdrop: HTMLDivElement | null = null;
  private _panel: HTMLDivElement | null = null;

  connectedCallback() {
    if (!isBrowser) return;
    this.render();
    if (this.hasAttribute('open')) this.activate();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    if (name === 'open') {
      if (this.hasAttribute('open')) {
        this.activate();
        this.dispatchEvent(new CustomEvent('cyn-open', { bubbles: true, composed: true }));
      } else {
        this.cleanup();
        this.dispatchEvent(new CustomEvent('cyn-close', { bubbles: true, composed: true }));
      }
    }
  }

  public show() {
    this.setAttribute('open', '');
  }

  public close() {
    this.removeAttribute('open');
  }

  public toggle() {
    if (this.hasAttribute('open')) this.close();
    else this.show();
  }

  private render() {
    if (this._backdrop) return;

    const isLeft = this.getAttribute('placement') === 'left';

    this._backdrop = document.createElement('div');
    this._backdrop.className = 'drawer-backdrop';
    this._backdrop.style.justifyContent = isLeft ? 'flex-start' : 'flex-end';
    this._backdrop.setAttribute('role', 'presentation');
    this._backdrop.addEventListener('click', (e) => {
      if (e.target === this._backdrop) this.close();
    });

    this._panel = document.createElement('div');
    this._panel.className = 'drawer-box';
    this._panel.setAttribute('role', 'dialog');
    this._panel.setAttribute('aria-modal', 'true');

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '1.5rem';
    header.style.paddingBottom = '1rem';
    header.style.borderBottom = '1px solid var(--cyn-color-border)';

    const titleEl = document.createElement('h3');
    titleEl.className = 'text-xl font-bold';
    titleEl.textContent = this.getAttribute('title') || 'Drawer';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-subtle p-1.5 radius-md';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.style.flex = '1';
    body.style.overflowY = 'auto';
    while (this.firstChild) {
      body.appendChild(this.firstChild);
    }

    this._panel.appendChild(header);
    this._panel.appendChild(body);
    this._backdrop.appendChild(this._panel);
    this.appendChild(this._backdrop);
  }

  private activate() {
    if (!this._backdrop) this.render();
    if (!this._backdrop) return;

    this._backdrop.classList.add('open');
    this._unlockScroll = scrollLock();
    this._unbindEsc = dismissOnEscape(() => this.close());
    if (this._panel) {
      this._trap = trapFocus(this._panel);
    }
  }

  private cleanup() {
    if (this._backdrop) this._backdrop.classList.remove('open');
    this._trap?.release();
    this._trap = null;
    this._unlockScroll?.();
    this._unlockScroll = null;
    this._unbindEsc?.();
    this._unbindEsc = null;
  }
}

/* -------------------------------------------------------------------------- */
/*                               CYN-BOTTOM-SHEET                             */
/* -------------------------------------------------------------------------- */

export class CynBottomSheet extends CustomElementBase {
  static get observedAttributes() {
    return ['open', 'title'];
  }

  private _backdrop: HTMLDivElement | null = null;
  private _panel: HTMLDivElement | null = null;
  private _unlockScroll: (() => void) | null = null;
  private _unbindEsc: (() => void) | null = null;

  connectedCallback() {
    if (!isBrowser) return;
    this.render();
    if (this.hasAttribute('open')) this.activate();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    if (name === 'open') {
      if (this.hasAttribute('open')) this.activate();
      else this.cleanup();
    }
  }

  public show() {
    this.setAttribute('open', '');
  }

  public close() {
    this.removeAttribute('open');
  }

  private render() {
    if (this._backdrop) return;

    this._backdrop = document.createElement('div');
    this._backdrop.className = 'bottomsheet-backdrop';
    this._backdrop.setAttribute('role', 'dialog');
    this._backdrop.setAttribute('aria-modal', 'true');
    this._backdrop.addEventListener('click', (e) => {
      if (e.target === this._backdrop) this.close();
    });

    this._panel = document.createElement('div');
    this._panel.className = 'bottomsheet-box';

    // Tactile handle bar
    const handle = document.createElement('div');
    handle.style.width = '44px';
    handle.style.height = '5px';
    handle.style.background = 'rgba(255,255,255,0.25)';
    handle.style.borderRadius = '9999px';
    handle.style.margin = '0 auto 1.25rem';
    handle.style.cursor = 'grab';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '1rem';

    const titleEl = document.createElement('h3');
    titleEl.className = 'text-xl font-bold';
    titleEl.textContent = this.getAttribute('title') || '';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-subtle p-1 radius-md';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    while (this.firstChild) {
      body.appendChild(this.firstChild);
    }

    this._panel.appendChild(handle);
    this._panel.appendChild(header);
    this._panel.appendChild(body);
    this._backdrop.appendChild(this._panel);
    this.appendChild(this._backdrop);
  }

  private activate() {
    if (!this._backdrop) this.render();
    if (!this._backdrop) return;
    this._backdrop.classList.add('open');
    this._unlockScroll = scrollLock();
    this._unbindEsc = dismissOnEscape(() => this.close());
  }

  private cleanup() {
    if (this._backdrop) this._backdrop.classList.remove('open');
    this._unlockScroll?.();
    this._unlockScroll = null;
    this._unbindEsc?.();
    this._unbindEsc = null;
  }
}

/* -------------------------------------------------------------------------- */
/*                                 CYN-POPOVER                                */
/* -------------------------------------------------------------------------- */

export class CynPopover extends CustomElementBase {
  static get observedAttributes() {
    return ['open'];
  }

  private _unbindOutside: (() => void) | null = null;
  private _unbindEsc: (() => void) | null = null;

  connectedCallback() {
    if (!isBrowser) return;
    this.classList.add('popover-anchor');
    if (this.hasAttribute('open')) this.bindListeners();
  }

  disconnectedCallback() {
    this.cleanupListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    if (name === 'open') {
      const card = this.querySelector('.popover-card');
      if (this.hasAttribute('open')) {
        card?.classList.add('open');
        this.bindListeners();
      } else {
        card?.classList.remove('open');
        this.cleanupListeners();
      }
    }
  }

  public show() {
    this.setAttribute('open', '');
  }

  public close() {
    this.removeAttribute('open');
  }

  public toggle() {
    if (this.hasAttribute('open')) this.close();
    else this.show();
  }

  private bindListeners() {
    this._unbindOutside = dismissOnOutsideClick(this, () => this.close());
    this._unbindEsc = dismissOnEscape(() => this.close());
  }

  private cleanupListeners() {
    this._unbindOutside?.();
    this._unbindOutside = null;
    this._unbindEsc?.();
    this._unbindEsc = null;
  }
}

/* -------------------------------------------------------------------------- */
/*                                 CYN-DROPDOWN                               */
/* -------------------------------------------------------------------------- */

export class CynDropdown extends CustomElementBase {
  static get observedAttributes() {
    return ['open'];
  }

  private _unbindOutside: (() => void) | null = null;
  private _unbindEsc: (() => void) | null = null;

  connectedCallback() {
    if (!isBrowser) return;
    this.classList.add('popover-anchor');
    if (this.hasAttribute('open')) this.bindListeners();
  }

  disconnectedCallback() {
    this.cleanupListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    if (name === 'open') {
      const menu = this.querySelector('.dropdown-box');
      if (this.hasAttribute('open')) {
        menu?.classList.add('open');
        this.bindListeners();
      } else {
        menu?.classList.remove('open');
        this.cleanupListeners();
      }
    }
  }

  public show() {
    this.setAttribute('open', '');
  }

  public close() {
    this.removeAttribute('open');
  }

  public toggle() {
    if (this.hasAttribute('open')) this.close();
    else this.show();
  }

  private bindListeners() {
    this._unbindOutside = dismissOnOutsideClick(this, () => this.close());
    this._unbindEsc = dismissOnEscape(() => this.close());

    // Roving focus across dropdown items
    const menu = this.querySelector('.dropdown-box') as HTMLElement;
    if (menu) {
      const items = Array.from(menu.querySelectorAll<HTMLElement>('.dropdown-item, button'));
      if (items.length > 0) {
        rovingFocus(menu, items, 'vertical');
      }
    }
  }

  private cleanupListeners() {
    this._unbindOutside?.();
    this._unbindOutside = null;
    this._unbindEsc?.();
    this._unbindEsc = null;
  }
}

/* -------------------------------------------------------------------------- */
/*                                  CYN-SWITCH                                */
/* -------------------------------------------------------------------------- */

export class CynSwitch extends CustomElementBase {
  static get observedAttributes() {
    return ['checked', 'disabled', 'label'];
  }

  private _track: HTMLDivElement | null = null;
  private _labelSpan: HTMLSpanElement | null = null;

  connectedCallback() {
    if (!isBrowser) return;
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    if (name === 'checked' && this._track) {
      this._track.classList.toggle('active', this.hasAttribute('checked'));
      this.setAttribute('aria-checked', this.hasAttribute('checked') ? 'true' : 'false');
    } else if (name === 'label' && this._labelSpan) {
      this._labelSpan.textContent = newValue || '';
    }
  }

  public toggle() {
    if (this.hasAttribute('disabled')) return;
    const next = !this.hasAttribute('checked');
    if (next) this.setAttribute('checked', '');
    else this.removeAttribute('checked');

    this.dispatchEvent(new CustomEvent('change', { detail: { checked: next }, bubbles: true }));
    this.dispatchEvent(new CustomEvent('cyn-change', { detail: { checked: next }, bubbles: true }));
  }

  private render() {
    if (this._track) return;

    this.setAttribute('role', 'switch');
    this.setAttribute('aria-checked', this.hasAttribute('checked') ? 'true' : 'false');
    this.setAttribute('tabindex', '0');
    this.className = 'switch-container touch-target select-none';

    this._track = document.createElement('div');
    this._track.className = 'switch-track' + (this.hasAttribute('checked') ? ' active' : '');

    const thumb = document.createElement('div');
    thumb.className = 'switch-thumb';
    this._track.appendChild(thumb);

    this._labelSpan = document.createElement('span');
    this._labelSpan.style.fontSize = '0.9rem';
    this._labelSpan.style.fontWeight = '500';
    this._labelSpan.textContent = this.getAttribute('label') || '';

    this.appendChild(this._track);
    if (this.getAttribute('label')) this.appendChild(this._labelSpan);

    this.addEventListener('click', () => this.toggle());
    this.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.toggle();
      }
    });
  }
}

/* -------------------------------------------------------------------------- */
/*                                  CYN-TABS                                  */
/* -------------------------------------------------------------------------- */

export class CynTabs extends CustomElementBase {
  connectedCallback() {
    if (!isBrowser) return;
    this.setupTabs();
  }

  private setupTabs() {
    const tabList = this.querySelector('[role="tablist"]') as HTMLElement;
    if (!tabList) return;

    const tabs = Array.from(tabList.querySelectorAll<HTMLElement>('[role="tab"]'));
    const panels = Array.from(this.querySelectorAll<HTMLElement>('[role="tabpanel"]'));

    if (tabs.length === 0) return;

    rovingFocus(tabList, tabs, 'horizontal', (selectedIdx) => {
      this.activateTab(selectedIdx, tabs, panels);
    });

    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => this.activateTab(idx, tabs, panels));
    });
  }

  private activateTab(index: number, tabs: HTMLElement[], panels: HTMLElement[]) {
    tabs.forEach((tab, i) => {
      const isSelected = i === index;
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    panels.forEach((panel, i) => {
      panel.style.display = i === index ? 'block' : 'none';
    });
  }
}

/* -------------------------------------------------------------------------- */
/*                            CYN-TOAST-CONTAINER                             */
/* -------------------------------------------------------------------------- */

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
}

export class CynToastContainer extends CustomElementBase {
  connectedCallback() {
    if (!isBrowser) return;
    this.setAttribute('role', 'region');
    this.setAttribute('aria-live', 'polite');
    this.setAttribute('aria-label', 'Notifications');
    this.className = 'toast-stack';
  }

  public show(options: ToastOptions) {
    const toast = document.createElement('div');
    toast.className = `toast-node ${options.variant || 'info'}`;

    const icons = { success: '✓', warning: '⚠', danger: '✕', info: 'ℹ' };
    const icon = icons[options.variant || 'info'];

    toast.innerHTML = `
      <span style="font-size: 1.15rem; font-weight: 700;">${icon}</span>
      <div style="flex: 1; min-width: 0;">
        <h4 style="font-size: 0.875rem; font-weight: 700; margin-bottom: 0.15rem;">${options.title}</h4>
        ${options.description ? `<p style="font-size: 0.775rem; color: var(--cyn-color-muted); line-height: 1.4;">${options.description}</p>` : ''}
      </div>
      <button style="background: none; border: none; color: var(--cyn-color-muted); cursor: pointer; padding: 0.2rem;">✕</button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn?.addEventListener('click', () => toast.remove());

    this.appendChild(toast);

    const dur = options.duration ?? 3500;
    if (dur > 0) {
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
      }, dur);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                         CUSTOM ELEMENT REGISTRATION                        */
/* -------------------------------------------------------------------------- */

export const CUSTOM_ELEMENTS_MAP = {
  'cyn-modal': CynModal,
  'cyn-drawer': CynDrawer,
  'cyn-bottom-sheet': CynBottomSheet,
  'cyn-popover': CynPopover,
  'cyn-dropdown': CynDropdown,
  'cyn-switch': CynSwitch,
  'cyn-tabs': CynTabs,
  'cyn-toast-container': CynToastContainer,
} as const;

export function defineCustomElements() {
  if (!isBrowser || !('customElements' in window)) return;

  Object.entries(CUSTOM_ELEMENTS_MAP).forEach(([tag, ctor]) => {
    if (!customElements.get(tag)) {
      customElements.define(tag, ctor as unknown as CustomElementConstructor);
    }
  });
}

// Auto-register when imported directly into a browser environment
if (isBrowser) {
  defineCustomElements();
}
