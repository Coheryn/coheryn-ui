# @coherynui/web-components

> **Native W3C Custom Elements for CoherynUI**  
> Zero-framework, fully accessible custom elements with focus trapping, touch ergonomics, and cascade layer styling.

[![Homepage](https://img.shields.io/badge/docs-coheryntech.com-6366f1)](https://coheryntech.com/coherynui)
[![GitHub](https://img.shields.io/badge/github-CoherynUI-1e293b)](https://github.com/Coheryn/coheryn-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE-MIT)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](../../LICENSE-APACHE)

---

## Overview

`@coherynui/web-components` provides official native browser custom elements powered by the CoherynUI CSS Engine and `@coherynui/components` headless primitives.

These custom elements run in **any web environment without React**:
- **Vanilla HTML / JS** (Zero dependencies, pure browser standards)
- **Vue 3 / Nuxt**
- **Svelte / SvelteKit**
- **Angular**
- **SolidJS**
- **PHP, Django, Ruby on Rails, Laravel**

---

## Installation

```bash
# Using npm
npm install @coherynui/web-components @coherynui/components

# Using pnpm
pnpm add @coherynui/web-components @coherynui/components
```

---

## Custom Elements Taxonomy

| Custom Element Tag | Pattern | Description |
|---|---|---|
| `<cyn-modal>` | **Dialog Modal** | Centered modal with active focus trap (`Tab`/`Shift+Tab`), scroll locking, and `Escape` dismissal. |
| `<cyn-drawer>` | **Side Panel** | Slide-in drawer docking to `left` or `right` with smooth cubic-bezier transitions. |
| `<cyn-bottom-sheet>` | **Mobile Drawer** | Touch-first mobile sheet with grab handle and downward drag-to-dismiss threshold physics. |
| `<cyn-popover>` | **Context Card** | Anchored floating card with outside-click detection and escape dismissal. |
| `<cyn-dropdown>` | **Action Menu** | Accessible menu with roving arrow keyboard focus (`ArrowUp`/`ArrowDown`/`Enter`) and danger items. |
| `<cyn-switch>` | **Toggle Switch** | Tactile toggle switch with keyboard support (`Space`/`Enter`) and 44px minimum tap area. |
| `<cyn-tabs>` | **Tabbed Nav** | Accessible roving tabindex navigation across tab buttons and panels. |
| `<cyn-toast-container>` | **Notification Stack** | Stackable real-time notification region (`role="region"`, `aria-live="polite"`). |

---

## Usage Examples

### 1. Accessible Modal Dialog (`<cyn-modal>`)

```html
<button class="btn btn-primary" onclick="document.getElementById('authModal').show()">
  Open Modal
</button>

<cyn-modal id="authModal" title="Account Authentication">
  <p class="text-muted text-sm mb-4">
    Keyboard focus is strictly trapped inside this dialog.
  </p>
  <div class="flex justify-end gap-2">
    <button class="btn btn-secondary" onclick="document.getElementById('authModal').close()">
      Cancel
    </button>
    <button class="btn btn-primary" onclick="document.getElementById('authModal').close()">
      Confirm
    </button>
  </div>
</cyn-modal>

<script type="module">
  import '@coherynui/web-components';
</script>
```

---

### 2. Mobile Tactile BottomSheet (`<cyn-bottom-sheet>`)

```html
<cyn-bottom-sheet id="filterSheet" title="Filter Deployments">
  <p class="text-sm text-muted mb-4">
    Drag downward on the grab handle to dismiss.
  </p>
  <button class="btn btn-primary w-full" onclick="document.getElementById('filterSheet').close()">
    Apply Filters
  </button>
</cyn-bottom-sheet>
```

---

### 3. Stackable Live Notifications (`<cyn-toast-container>`)

```html
<cyn-toast-container id="toasts"></cyn-toast-container>

<button class="btn btn-success" onclick="triggerToast()">
  Trigger Toast
</button>

<script type="module">
  import '@coherynui/web-components';

  window.triggerToast = () => {
    document.getElementById('toasts').show({
      title: 'Deployment Ready',
      description: 'Rust compiler compiled assets in 2.8ms.',
      variant: 'success',
      duration: 3500
    });
  };
</script>
```

---

## Framework Integration

### Vue 3
Configure Vite/Vue compiler to treat `cyn-*` elements as native custom elements:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('cyn-')
        }
      }
    })
  ]
});
```

### Angular
Add `CUSTOM_ELEMENTS_SCHEMA` to your module:

```typescript
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
```

---

## License

Dual-licensed under either:
- **MIT License** ([LICENSE-MIT](../../LICENSE-MIT))
- **Apache License, Version 2.0** ([LICENSE-APACHE](../../LICENSE-APACHE))
