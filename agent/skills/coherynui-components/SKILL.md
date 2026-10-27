---
name: coherynui-components
description: Search, select, and compose accessible CoherynUI components with strict focus and keyboard management.
---

# CoherynUI Accessible Components Workflow

Use this skill when composing UI components with `@coherynui/components` (headless) and `@coherynui/react` (styled).

## 1. Discover Components via Registry
Query the registry for matching components:
- In MCP: call `components_search` with intent (e.g. `query: "accessible modal"`, `query: "roving tabs"`).
- In CLI: inspect `registry/index.json`.

## 2. Component Guidelines & Accessibility Invariants
- **Dialog / Modal**:
  - Requires `role="dialog"`, `aria-modal="true"`.
  - Must use `trapFocus`, `dismissOnEscape`, and `scrollLock`.
  - Always restore focus to the triggering element upon close.
- **Tabs**:
  - Horizontal tabs require roving tabindex (`tabindex="0"` for active, `-1` for inactive).
  - Arrow keys (`ArrowLeft`, `ArrowRight`, `Home`, `End`) must navigate focus automatically.
- **Switches & Form Controls**:
  - Must use native `<button role="switch" aria-checked="...">` with accessible labels.
  - Form errors must be linked via `aria-describedby` or announced politely with `role="alert"`.

## 3. Code Example
```tsx
import { Dialog, Button, Tabs } from '@coherynui/react';
import { useState } from 'react';

export function ConfirmDeploy() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>Deploy Release</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Confirm Production Deploy">
        <p className="text-sm fg-muted mb-4">Are you ready to deploy to global edge nodes?</p>
        <div className="cluster justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
        </div>
      </Dialog>
    </>
  );
}
```
