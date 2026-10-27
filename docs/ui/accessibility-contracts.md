# CoherynUI Components — Accessibility Contracts & Interaction Models v1.0

**Status:** Approved Specification  
**Authority:** [CoherynUI CSS Engineering Master Plan v1.1](../../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md) — Section 12.1  
**Conformance Target:** WAI-ARIA 1.2 / WCAG 2.2 Level AA  

---

## 1. Non-Negotiable Accessibility Principles

Every component in CoherynUI Components satisfies the following interaction criteria:

1. **Full Keyboard Operability:** All interactive components can be navigated, opened, activated, and dismissed using keyboard alone.
2. **Focus Management:**
   - **Dialogs & Modals:** Focus is automatically trapped within the modal container upon opening and restored to the trigger element upon closing.
   - **Tabs, Toolbars, Menus:** Focus is managed via roving `tabindex` (active item has `tabindex="0"`, inactive items have `tabindex="-1"`). Arrow keys navigate between items.
3. **Screen Reader Semantics:**
   - ARIA roles (`role="dialog"`, `role="tablist"`, `role="tab"`, `role="switch"`).
   - Dynamic state reflection (`aria-expanded`, `aria-checked`, `aria-selected`, `aria-invalid`, `aria-controls`).
4. **Perception & Preferences:**
   - Contrast ratio exceeds 4.5:1 for normal text and 3:1 for large text across light and dark themes.
   - High contrast mode and `forced-colors: active` preserved.
   - Reduced motion and reduced transparency preferences respected immediately.
