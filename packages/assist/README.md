# @coheryn/coherynui-js-assist

> **Optional Declarative JavaScript Progressive Enhancement for CoherynUI**  
> Single-delegated event listening, automated ARIA reflection, focus trapping, and roving keyboard navigation in ~2.5 kB brotli.

[![Homepage](https://img.shields.io/badge/docs-coheryntech.com-6366f1)](https://coheryntech.com/products/coheryn-ui)
[![GitHub](https://img.shields.io/badge/github-CoherynUI-1e293b)](https://github.com/Coheryn/coheryn-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE-MIT)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](../../LICENSE-APACHE)

---

## Overview

CoherynUI is built on a **CSS-First, Progressive Enhancement** philosophy. While pure CSS recipes handle structure and layout, `@coheryn/coherynui-js-assist` delivers an optional, dependency-free progressive enhancement layer for strict **WCAG 2.2 Level AA / Section 508** accessibility.

### Features
* **Zero Boilerplate:** Declare behavior via `data-cyn-*` attributes directly in HTML.
* **Single Delegated Event Dispatcher:** Listens at `document` root. Content injected dynamically via HTMX, Fetch, or SPA page transitions works immediately without re-initialization or memory leaks.
* **Focus Trapping & Focus Return:** Traps `Tab` / `Shift+Tab` cycles inside dialogs and restores focus to opening triggers on close.
* **Non-Layout-Shifting Scroll Lock:** Compensates for scrollbar width during modal presentation.
* **Roving Tabindex Navigation:** Full arrow key navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`) across tab lists.
* **Ultra-Lightweight:** Under 2.8 kB brotli compressed (~3.3 kB gzip). Zero runtime dependencies.

---

## Installation

```bash
# Using npm
npm install @coheryn/coherynui-js-assist

# Using pnpm
pnpm add @coheryn/coherynui-js-assist
```

Or via direct browser script tag:

```html
<script src="https://cdn.coheryntech.com/coherynui-assist.min.js" defer></script>
```

---

## Declarative Usage

### 1. Dialog Modal
```html
<button class="btn btn-primary" data-cyn-toggle="modal" data-cyn-target="#loginModal">
  Log In
</button>

<div class="modal-backdrop" id="loginModal" role="dialog" aria-modal="true" aria-hidden="true">
  <div class="modal-box">
    <button class="modal-close-btn" data-cyn-dismiss="modal" aria-label="Close dialog">✕</button>
    <h3>Sign In</h3>
    <button class="btn btn-secondary" data-cyn-dismiss="modal">Cancel</button>
  </div>
</div>
```

### 2. Contextual Popover Dropdown
```html
<div class="popover-anchor">
  <button class="btn btn-secondary" data-cyn-toggle="dropdown" data-cyn-target="#profileMenu">
    Options ▾
  </button>
  <div class="dropdown-box" id="profileMenu" role="menu" aria-hidden="true">
    <button class="dropdown-item" role="menuitem">Profile</button>
    <button class="dropdown-item text-danger" role="menuitem">Sign Out</button>
  </div>
</div>
```

### 3. Accessible Roving Tabs
```html
<div class="cyn-tabs cyn-tabs-pills" data-cyn-tabs>
  <div class="cyn-tablist" role="tablist">
    <button class="cyn-tab-btn active" role="tab" data-cyn-tab-target="#tab1">Overview</button>
    <button class="cyn-tab-btn" role="tab" data-cyn-tab-target="#tab2">Details</button>
  </div>
  <div class="cyn-tabpanel active" id="tab1" role="tabpanel">...</div>
  <div class="cyn-tabpanel" id="tab2" role="tabpanel">...</div>
</div>
```

---

## Programmatic API

```typescript
import {
  initAssist,
  destroyAssist,
  openModal,
  closeModal,
  toggleModal,
  openDropdown,
  closeDropdown,
  activateTab
} from '@coheryn/coherynui-js-assist';
```

## License

Dual-licensed under MIT or Apache 2.0.
