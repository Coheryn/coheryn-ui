# CoherynUI Components — Component Catalog & Taxonomy v1.0

**Status:** Approved Specification  
**Authority:** [CoherynUI CSS Engineering Master Plan v1.1](../../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md) — Section 12.1  
**Amendment:** [CoherynUI v1.2 Amendment (COH-AMD-1.2)](../../resources/Coheryn_UI_Amendment_v1.2.md)  
**Reference ADR:** [ADR-013: Full UI Component Catalog, Accessibility, and SSR Contracts](../../rfcs/0013-full-ui-component-catalog-accessibility-ssr.md)

---

## 1. Overview

**CoherynUI Components** is the official, first-party accessible UI library of CoherynUI. It delivers complete headless behavioral primitives via `@coheryn/coherynui-components` and a production-ready React component facade via `@coheryn/coherynui-react`, styled natively using the CoherynUI CSS Engine.

---

## 2. Component Taxonomy (8 Families, 48 Patterns)

| Family | Components | Architecture Model |
|---|---|---|
| **Actions** | `Button`, `IconButton`, `ButtonGroup`, `SplitButton`, `ToggleButton` | Native buttons with tokenized states (hover, active, focus-visible) and loading spinner slots. |
| **Forms** | `Input`, `Textarea`, `Label`, `Checkbox`, `RadioGroup`, `Switch`, `Select`, `Combobox`, `Slider`, `Range`, `DatePicker`, `TimePicker`, `FileUpload`, `FormField` | Controlled and uncontrolled state; ARIA invalid and description binding; zero layout shifts. |
| **Overlays** | `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, `DropdownMenu`, `ContextMenu`, `Drawer`, `HoverCard` | Focus trap, scroll-lock, outside click and escape key dismissal, portal rendering. |
| **Navigation** | `Navbar`, `Sidebar`, `Breadcrumbs`, `Tabs`, `Menubar`, `NavigationMenu`, `Pagination`, `Stepper`, `CommandPalette` | Roving tabindex keyboard navigation, current item indicators (`aria-current`), collapsible sidebars. |
| **Feedback** | `Alert`, `Toast`, `Progress`, `Spinner`, `Skeleton`, `StatusBadge`, `EmptyState` | ARIA live regions, progress bars with percentage indicators, accessible skeleton loaders. |
| **Data Display** | `Table`, `DataTable`, `Card`, `Avatar`, `Accordion`, `TreeView`, `List`, `Timeline`, `Stats` | Composable compound cards, multi-level accordions, semantic tables with sortable column headers. |
| **Layout** | `Container`, `Stack`, `Cluster`, `Grid`, `SplitPane`, `ResizablePanels`, `Separator`, `AspectRatio` | Adaptive layout primitives from the CoherynUI CSS Engine recipe layer. |
| **Media & Materials** | `Image`, `Carousel`, `GlassCard`, `GlassToolbar`, `FloatingDock`, `RefractivePanel` | Integrated with Tier 1 CSS Liquid Glass and Tier 3 WebGPU refraction (`@coheryn/coherynui-gpu-materials`). |
