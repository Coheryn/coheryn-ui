import React, { useState } from 'react';
import {
  Button,
  IconButton,
  ButtonGroup,
  Dialog,
  Modal,
  BottomSheet,
  Drawer,
  Popover,
  Dropdown,
  ToastProvider,
  useToast,
  Tabs,
  Input,
  Label,
  Switch,
  Spinner,
  Badge,
  Card,
  GlassCard,
  Stack,
  Cluster,
  useHaptic,
} from '@coherynui/react';

function ShowcaseContent() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [gpuActive, setGpuActive] = useState(true);
  const [workspaceName, setWorkspaceName] = useState('Production Cluster Alpha');
  const [hapticTriggered, setHapticTriggered] = useState(false);

  const toast = useToast();
  const { trigger: triggerHaptic } = useHaptic();

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleHapticTest = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    triggerHaptic(type);
    setHapticTriggered(true);
    toast.info('Haptic Triggered', `Tactile ${type} vibration simulated.`);
    setTimeout(() => setHapticTriggered(false), 1200);
  };

  const menuItems = [
    { id: '1', label: 'Edit Workspace', icon: '✏️', onClick: () => toast.info('Edit Clicked', 'Opened workspace editor.') },
    { id: '2', label: 'API Keys', icon: '🔑', onClick: () => toast.success('API Keys', 'Navigated to API key credentials.') },
    { id: '3', label: 'Purge Cache', icon: '🗑️', danger: true, onClick: () => toast.error('Cache Purged', 'Cleared local CSS token cache.') },
  ];

  const tabItems = [
    {
      id: 'cascade',
      label: 'Cascade Layers',
      content: (
        <p className="text-sm fg-muted leading-relaxed">
          W3C <code>@layer cyn.*</code> enforces zero specificity leaks across resets, tokens, base styles, component recipes, and atomic utility rules.
        </p>
      ),
    },
    {
      id: 'touch',
      label: 'Touch Ergonomics',
      content: (
        <p className="text-sm fg-muted leading-relaxed">
          Every interactive primitive guarantees WCAG 2.2 SC 2.5.8 compliance with 44×44px minimum tap boundaries, touch-action containment, and spring drag thresholds.
        </p>
      ),
    },
    {
      id: 'agent',
      label: 'Agent Skills',
      content: (
        <p className="text-sm fg-muted leading-relaxed">
          Embeds 7 canonical offline skills and multi-client configuration generators for Claude Code, Cursor, Copilot, and Codex via <code>coherynui agent init</code>.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface fg-primary">
      {/* -------------------------------------------------------------------------- */}
      {/*                                NAVIGATION BAR                              */}
      {/* -------------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-subtle glass px-6 py-3.5">
        <div className="app-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 radius-lg bg-brand flex items-center justify-center font-bold text-white shadow-md">
              C
            </div>
            <div>
              <span className="text-lg weight-bold tracking-tight">CoherynUI</span>
              <span className="ml-2 text-xs weight-medium px-2 py-0.5 radius-full bg-brand/20 fg-brand">
                Complete UI Suite
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Dropdown
              trigger={
                <Button variant="subtle" size="sm">
                  <span>Workspace Actions ▼</span>
                </Button>
              }
              items={menuItems}
              placement="bottom-right"
            />

            <IconButton
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              onClick={toggleTheme}
              variant="subtle"
              size="md"
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            </IconButton>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setDrawerOpen(true)}
            >
              Settings Drawer →
            </Button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------------- */}
      {/*                                HERO SECTION                                */}
      {/* -------------------------------------------------------------------------- */}
      <main className="flex-1 app-container py-12 md:py-16">
        <Stack gap="8" className="items-center text-center max-w-3xl mx-auto mb-16">
          <Cluster gap="2" className="justify-center">
            <Badge variant="brand">W3C 5-Layer Cascade</Badge>
            <Badge variant="success">WCAG 2.2 Touch Target</Badge>
            <Badge variant="warning">Liquid Glass Shaders</Badge>
          </Cluster>

          <h1 className="text-4xl md:text-6xl weight-bold tracking-tight leading-tight">
            Every UI Primitive, Built Native with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              CoherynUI
            </span>
          </h1>

          <p className="text-lg md:text-xl fg-muted leading-relaxed">
            Modals, popovers, drawers, mobile bottom sheets, dropdown menus, and stackable live notifications — 100% unified with zero third-party fragmentation.
          </p>

          <Cluster gap="3" className="justify-center pt-2 flex-wrap">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setModalOpen(true)}
              className="shadow-lg shadow-brand/25"
            >
              <span>🛡️ Open Dialog Modal</span>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => setSheetOpen(true)}
            >
              <span>📱 Open BottomSheet</span>
            </Button>

            <Button
              variant="glass"
              size="lg"
              onClick={() => handleHapticTest('medium')}
            >
              <span>{hapticTriggered ? '✓ Vibrate Active' : '⚡ Simulate Haptics'}</span>
            </Button>
          </Cluster>
        </Stack>

        {/* -------------------------------------------------------------------------- */}
        {/*                           NOTIFICATION TRIGGERS                            */}
        {/* -------------------------------------------------------------------------- */}
        <section className="mb-12">
          <Card className="p-6">
            <h3 className="text-xl weight-bold mb-2">Live Stackable Toast Notifications</h3>
            <p className="text-sm fg-muted mb-4">
              Trigger real-time floating notifications with automatic timers, accessible status roles, and smooth spring dismiss:
            </p>
            <Cluster gap="3" className="flex-wrap">
              <Button
                variant="primary"
                size="md"
                onClick={() => toast.success('Compilation Succeeded', 'Rust compiler emitted @layer cyn.utilities in 3.1ms.')}
              >
                ✓ Success Toast
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => toast.warning('Touch Target Notice', 'CY2004: Element padded to 44px minimum target.')}
              >
                ⚠ Warning Toast
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => toast.error('Connection Dropped', 'Failed to reach cloud worker node.')}
              >
                ✕ Error Toast
              </Button>
              <Button
                variant="subtle"
                size="md"
                onClick={() => toast.info('Agent Sync', 'Initialized 7 canonical skills.')}
              >
                ℹ Info Toast
              </Button>
            </Cluster>
          </Card>
        </section>

        {/* -------------------------------------------------------------------------- */}
        {/*                         POPOVERS & FORMS SHOWCASE                          */}
        {/* -------------------------------------------------------------------------- */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl weight-bold mb-4">Contextual Popovers & Dropdowns</h3>
              <p className="text-sm fg-muted mb-4">
                Anchored floating containers with automated outside click detection and escape key handling:
              </p>
              <Cluster gap="4" className="items-center">
                <Popover
                  trigger={
                    <Button variant="secondary" size="md">
                      ℹ️ Engine Specification
                    </Button>
                  }
                  content={
                    <div>
                      <h4 className="text-sm weight-bold fg-primary mb-1">Zero Ambient Authority</h4>
                      <p className="text-xs fg-muted leading-relaxed">
                        Wasm plugin sandboxes execute with zero host filesystem access and deterministic fuel metering.
                      </p>
                    </div>
                  }
                  placement="top"
                />

                <Dropdown
                  trigger={
                    <Button variant="glass" size="md">
                      ⚙️ Quick Options ▼
                    </Button>
                  }
                  items={menuItems}
                  placement="bottom-left"
                />
              </Cluster>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl weight-bold mb-4">Form Primitives & Switch</h3>
              <Stack gap="3">
                <div>
                  <Label htmlFor="ws-name">Workspace Identifier</Label>
                  <Input
                    id="ws-name"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </div>
                <div className="pt-2">
                  <Switch
                    checked={gpuActive}
                    onChange={setGpuActive}
                    label={gpuActive ? 'Hardware WebGPU Refraction Enabled' : 'Fallback CSS Filter Active'}
                  />
                </div>
              </Stack>
            </Card>
          </div>
        </section>

        {/* -------------------------------------------------------------------------- */}
        {/*                        ROVING TABS & ACCORDIONS                            */}
        {/* -------------------------------------------------------------------------- */}
        <section className="mb-12">
          <GlassCard className="p-6">
            <h3 className="text-xl weight-bold mb-3">WAI-ARIA Roving Tabindex Navigation</h3>
            <p className="text-sm fg-muted mb-4">
              Navigate tabs using keyboard arrow keys (<kbd>←</kbd> / <kbd>→</kbd>) or <kbd>Home</kbd> / <kbd>End</kbd>:
            </p>
            <Tabs tabs={tabItems} defaultTab="cascade" />
          </GlassCard>
        </section>
      </main>

      {/* -------------------------------------------------------------------------- */}
      {/*                               MODAL DIALOG                                 */}
      {/* -------------------------------------------------------------------------- */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Accessible Modal Dialog"
        description="Keyboard focus is strictly trapped inside this dialog. Pressing Tab loops within targets; pressing Escape dismisses."
      >
        <Stack gap="4">
          <div>
            <Label htmlFor="cluster-tag">Cluster Tag</Label>
            <Input id="cluster-tag" defaultValue="production-v2.4" />
          </div>
          <Cluster gap="3" className="justify-end pt-2">
            <Button variant="subtle" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setModalOpen(false);
                toast.success('Saved', 'Cluster tag updated successfully.');
              }}
            >
              Confirm
            </Button>
          </Cluster>
        </Stack>
      </Dialog>

      {/* -------------------------------------------------------------------------- */}
      {/*                             BOTTOM SHEET DRAWER                            */}
      {/* -------------------------------------------------------------------------- */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Tactile BottomSheet Drawer"
      >
        <Stack gap="4" className="pt-2 pb-4">
          <p className="text-sm fg-muted leading-relaxed">
            Drag downward on the handle bar to dismiss, or tap outside the backdrop.
          </p>
          <div className="p-3 radius-lg bg-surface border border-subtle">
            <div className="text-xs font-mono fg-brand">WCAG 2.2 SC 2.5.8</div>
            <div className="text-sm weight-semibold">--cyn-touch-min: 44px;</div>
          </div>
          <Cluster gap="3" className="justify-end pt-2">
            <Button variant="subtle" onClick={() => setSheetOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSheetOpen(false);
                toast.info('Applied', 'BottomSheet selection confirmed.');
              }}
            >
              Apply Filter
            </Button>
          </Cluster>
        </Stack>
      </BottomSheet>

      {/* -------------------------------------------------------------------------- */}
      {/*                              SIDE DOCKED DRAWER                            */}
      {/* -------------------------------------------------------------------------- */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="System Settings"
        placement="right"
      >
        <Stack gap="4">
          <p className="text-sm fg-muted">
            Side navigation and administrative configuration drawer with scroll locking and escape key dismissal.
          </p>
          <div className="form-group">
            <Label>Engine Version</Label>
            <Input readOnly value="CoherynUI v1.0.0" />
          </div>
          <div className="form-group">
            <Label>Compiler Mode</Label>
            <Input readOnly value="Incremental Sub-5ms HMR" />
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setDrawerOpen(false);
              toast.success('Settings Saved', 'Applied configuration changes.');
            }}
          >
            Save Settings
          </Button>
        </Stack>
      </Drawer>

      {/* -------------------------------------------------------------------------- */}
      {/*                                   FOOTER                                   */}
      {/* -------------------------------------------------------------------------- */}
      <footer className="border-t border-subtle py-8 px-6 text-sm fg-muted mt-auto">
        <div className="app-container flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© 2026 CoherynUI. Dual-licensed under MIT or Apache-2.0.</div>
          <div className="flex items-center gap-6">
            <a href="https://coheryntech.com/products/coheryn-ui" className="hover:text-white transition-colors">
              Documentation
            </a>
            <a href="https://github.com/Coheryn/coheryn-ui" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider position="top-right">
      <ShowcaseContent />
    </ToastProvider>
  );
}
