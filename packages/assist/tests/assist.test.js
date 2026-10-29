import test, { describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock browser DOM environment for testing
function setupDOM() {
  const elements = new Map();
  let activeElement = null;

  class MockClassList {
    constructor(el) {
      this.el = el;
      this.classes = new Set();
    }
    add(...cls) { cls.forEach(c => this.classes.add(c)); }
    remove(...cls) { cls.forEach(c => this.classes.delete(c)); }
    contains(c) { return this.classes.has(c); }
    toggle(c) {
      if (this.classes.has(c)) { this.classes.delete(c); return false; }
      else { this.classes.add(c); return true; }
    }
  }

  class MockElement {
    constructor(tag, id = '') {
      this.tagName = tag.toUpperCase();
      this.id = id;
      this.attributes = new Map();
      this.classList = new MockClassList(this);
      this.style = {};
      this.children = [];
      this.parentElement = null;
      this.offsetWidth = 100;
      this.offsetHeight = 30;
      if (id) elements.set('#' + id, this);
    }
    setAttribute(name, val) { this.attributes.set(name, String(val)); }
    getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
    removeAttribute(name) { this.attributes.delete(name); }
    hasAttribute(name) { return this.attributes.has(name); }
    appendChild(child) {
      child.parentElement = this;
      this.children.push(child);
      return child;
    }
    focus() { activeElement = this; }
    addEventListener(evt, fn) {
      if (!this._listeners) this._listeners = new Map();
      if (!this._listeners.has(evt)) this._listeners.set(evt, []);
      this._listeners.get(evt).push(fn);
    }
    removeEventListener(evt, fn) {
      if (!this._listeners || !this._listeners.has(evt)) return;
      this._listeners.set(evt, this._listeners.get(evt).filter(f => f !== fn));
    }
    closest(selector) {
      const parts = selector.split(',').map(s => s.trim());
      let cur = this;
      while (cur) {
        for (const sel of parts) {
          if (sel.startsWith('#') && cur.id === sel.slice(1)) return cur;
          if (sel.startsWith('.') && cur.classList.contains(sel.slice(1))) return cur;
          if (sel.startsWith('[') && sel.endsWith(']')) {
            const attr = sel.slice(1, -1);
            if (attr.includes('=')) {
              const [k, v] = attr.split('=');
              const cleanVal = v.replace(/["']/g, '');
              if (cur.getAttribute(k) === cleanVal) return cur;
            } else if (cur.hasAttribute(attr)) {
              return cur;
            }
          }
        }
        cur = cur.parentElement;
      }
      return null;
    }
    contains(other) {
      let cur = other;
      while (cur) {
        if (cur === this) return true;
        cur = cur.parentElement;
      }
      return false;
    }
    querySelectorAll(selector) {
      const results = [];
      const parts = selector.split(',').map(s => s.trim());
      function traverse(el) {
        for (const child of el.children) {
          let match = false;
          for (const sel of parts) {
            if (sel.startsWith('.') && child.classList.contains(sel.slice(1))) match = true;
            if (sel.startsWith('[') && sel.endsWith(']')) {
              const attr = sel.slice(1, -1);
              if (child.hasAttribute(attr)) match = true;
            }
          }
          if (match && !results.includes(child)) results.push(child);
          traverse(child);
        }
      }
      traverse(this);
      return results;
    }
    querySelector(selector) {
      return this.querySelectorAll(selector)[0] || null;
    }
    dispatchEvent(event) {
      if (this['on' + event.type]) this['on' + event.type](event);
      return !event.defaultPrevented;
    }
  }

  const documentMock = {
    body: new MockElement('body'),
    documentElement: { clientWidth: 1024 },
    listeners: new Map(),
    addEventListener(evt, fn) {
      if (!this.listeners.has(evt)) this.listeners.set(evt, []);
      this.listeners.get(evt).push(fn);
    },
    removeEventListener(evt, fn) {
      if (!this.listeners.has(evt)) return;
      const list = this.listeners.get(evt).filter(f => f !== fn);
      this.listeners.set(evt, list);
    },
    dispatchEvent(event) {
      const list = this.listeners.get(event.type) || [];
      for (const fn of list) fn(event);
      return !event.defaultPrevented;
    },
    querySelector(selector) {
      return elements.get(selector) || null;
    },
    get activeElement() {
      return activeElement;
    }
  };

  const windowMock = {
    innerWidth: 1040,
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  globalThis.document = documentMock;
  globalThis.window = windowMock;
  globalThis.CustomEvent = class {
    constructor(type, init = {}) {
      this.type = type;
      this.bubbles = init.bubbles ?? false;
      this.cancelable = init.cancelable ?? false;
      this.detail = init.detail ?? {};
      this.defaultPrevented = false;
    }
    preventDefault() { if (this.cancelable) this.defaultPrevented = true; }
  };

  return { documentMock, elements, MockElement };
}

describe('@coheryn/coherynui-js-assist Declarative Engine', () => {
  let assist;
  let dom;

  beforeEach(async () => {
    dom = setupDOM();
    assist = await import('../dist/index.js');
    assist.initAssist();
  });

  afterEach(() => {
    assist.destroyAssist();
  });

  test('toggleModal opens and closes modal with proper ARIA attributes', () => {
    const trigger = new dom.MockElement('button', 'btnTrigger');
    trigger.setAttribute('data-cyn-toggle', 'modal');
    trigger.setAttribute('data-cyn-target', '#demoModal');

    const modal = new dom.MockElement('div', 'demoModal');
    modal.classList.add('modal-backdrop');

    const modalBox = new dom.MockElement('div');
    modalBox.classList.add('modal-box');
    const closeBtn = new dom.MockElement('button');
    closeBtn.setAttribute('data-cyn-dismiss', 'modal');
    modalBox.appendChild(closeBtn);
    modal.appendChild(modalBox);

    dom.documentMock.body.appendChild(trigger);
    dom.documentMock.body.appendChild(modal);

    // Initial state
    assert.equal(assist.isModalOpen(modal), false);

    // Open modal
    assist.openModal(modal, trigger);
    assert.equal(assist.isModalOpen(modal), true);
    assert.equal(modal.getAttribute('aria-hidden'), 'false');
    assert.equal(modal.getAttribute('aria-modal'), 'true');
    assert.equal(modal.getAttribute('role'), 'dialog');
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');

    // Close modal
    assist.closeModal(modal);
    assert.equal(assist.isModalOpen(modal), false);
    assert.equal(modal.getAttribute('aria-hidden'), 'true');
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  });

  test('toggleDropdown toggles active class and reflects aria-expanded', () => {
    const trigger = new dom.MockElement('button', 'dropTrigger');
    trigger.setAttribute('data-cyn-toggle', 'dropdown');
    trigger.setAttribute('data-cyn-target', '#dropMenu');

    const menu = new dom.MockElement('div', 'dropMenu');
    menu.classList.add('dropdown-box');

    dom.documentMock.body.appendChild(trigger);
    dom.documentMock.body.appendChild(menu);

    assert.equal(assist.isDropdownOpen(menu), false);

    assist.openDropdown(menu, trigger);
    assert.equal(assist.isDropdownOpen(menu), true);
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');
    assert.equal(menu.getAttribute('aria-hidden'), 'false');

    assist.closeDropdown(menu);
    assert.equal(assist.isDropdownOpen(menu), false);
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(menu.getAttribute('aria-hidden'), 'true');
  });

  test('toggleCollapse expands and collapses target element', () => {
    const trigger = new dom.MockElement('button', 'colTrigger');
    trigger.setAttribute('data-cyn-toggle', 'collapse');
    trigger.setAttribute('data-cyn-target', '#colContent');

    const content = new dom.MockElement('div', 'colContent');

    dom.documentMock.body.appendChild(trigger);
    dom.documentMock.body.appendChild(content);

    assert.equal(assist.isCollapsed(content), true);

    assist.toggleCollapse(content, trigger);
    assert.equal(assist.isCollapsed(content), false);
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');
    assert.equal(content.getAttribute('aria-hidden'), 'false');

    assist.toggleCollapse(content, trigger);
    assert.equal(assist.isCollapsed(content), true);
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(content.getAttribute('aria-hidden'), 'true');
  });

  test('activateTab toggles active state and ARIA attributes for tabs', () => {
    const tabsContainer = new dom.MockElement('div');
    tabsContainer.setAttribute('data-cyn-tabs', '');

    const tablist = new dom.MockElement('div');
    tablist.setAttribute('role', 'tablist');

    const tabBtn1 = new dom.MockElement('button');
    tabBtn1.classList.add('cyn-tab-btn', 'active');
    tabBtn1.setAttribute('data-cyn-tab-target', '#panel1');
    tabBtn1.setAttribute('aria-selected', 'true');

    const tabBtn2 = new dom.MockElement('button');
    tabBtn2.classList.add('cyn-tab-btn');
    tabBtn2.setAttribute('data-cyn-tab-target', '#panel2');
    tabBtn2.setAttribute('aria-selected', 'false');

    tablist.appendChild(tabBtn1);
    tablist.appendChild(tabBtn2);
    tabsContainer.appendChild(tablist);

    const panelsContainer = new dom.MockElement('div');
    const panel1 = new dom.MockElement('div', 'panel1');
    panel1.classList.add('cyn-tabpanel', 'active');

    const panel2 = new dom.MockElement('div', 'panel2');
    panel2.classList.add('cyn-tabpanel');

    panelsContainer.appendChild(panel1);
    panelsContainer.appendChild(panel2);
    tabsContainer.appendChild(panelsContainer);

    dom.documentMock.body.appendChild(tabsContainer);

    // Initial state
    assert.equal(tabBtn1.classList.contains('active'), true);
    assert.equal(panel1.classList.contains('active'), true);
    assert.equal(tabBtn2.classList.contains('active'), false);
    assert.equal(panel2.classList.contains('active'), false);

    // Switch to tab 2
    assist.activateTab(tabBtn2);
    assert.equal(tabBtn1.classList.contains('active'), false);
    assert.equal(panel1.classList.contains('active'), false);
    assert.equal(tabBtn2.classList.contains('active'), true);
    assert.equal(panel2.classList.contains('active'), true);
    assert.equal(tabBtn2.getAttribute('aria-selected'), 'true');
    assert.equal(panel2.getAttribute('aria-hidden'), 'false');
  });

  test('single delegated click listener handles data-cyn-toggle and data-cyn-dismiss', () => {
    const trigger = new dom.MockElement('button', 'delegatedTrigger');
    trigger.setAttribute('data-cyn-toggle', 'modal');
    trigger.setAttribute('data-cyn-target', '#delegatedModal');

    const modal = new dom.MockElement('div', 'delegatedModal');
    modal.classList.add('modal-backdrop');

    const modalBox = new dom.MockElement('div');
    modalBox.classList.add('modal-box');
    const dismissBtn = new dom.MockElement('button');
    dismissBtn.setAttribute('data-cyn-dismiss', 'modal');
    modalBox.appendChild(dismissBtn);
    modal.appendChild(modalBox);

    dom.documentMock.body.appendChild(trigger);
    dom.documentMock.body.appendChild(modal);

    assert.equal(assist.isModalOpen(modal), false);

    // Simulate clicking the toggle button via document event delegation
    dom.documentMock.dispatchEvent({
      type: 'click',
      target: trigger,
      defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }
    });

    assert.equal(assist.isModalOpen(modal), true);
    assert.equal(modal.getAttribute('aria-hidden'), 'false');

    // Simulate clicking the dismiss button inside modal
    dom.documentMock.dispatchEvent({
      type: 'click',
      target: dismissBtn,
      defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }
    });

    assert.equal(assist.isModalOpen(modal), false);
    assert.equal(modal.getAttribute('aria-hidden'), 'true');
  });
});
