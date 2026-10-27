import React, { useState } from 'react';
import {
  Button,
  IconButton,
  BottomSheet,
  GlassCard,
  Stack,
  Cluster,
  Badge,
  useHaptic,
} from '@coherynui/react';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hapticTriggered, setHapticTriggered] = useState(false);
  const { trigger: triggerHaptic } = useHaptic();

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleHapticTest = () => {
    triggerHaptic('medium');
    setHapticTriggered(true);
    setTimeout(() => setHapticTriggered(false), 1200);
  };

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
                Starter
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              onClick={toggleTheme}
              variant="subtle"
              size="md"
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            </IconButton>

            <a
              href="https://github.com/Coheryn/coheryn-ui"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-4 py-2 radius-lg text-sm weight-semibold bg-brand fg-primary hover:opacity-90 transition-opacity touch-target tap-transparent"
            >
              GitHub →
            </a>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------------- */}
      {/*                                HERO SECTION                                */}
      {/* -------------------------------------------------------------------------- */}
      <main className="flex-1 app-container py-12 md:py-20">
        <Stack gap="8" className="items-center text-center max-w-3xl mx-auto">
          <Cluster gap="2" className="justify-center">
            <Badge variant="brand">W3C 5-Layer Cascade</Badge>
            <Badge variant="success">WCAG 2.2 Touch Target</Badge>
            <Badge variant="warning">Liquid Glass Shaders</Badge>
          </Cluster>

          <h1 className="text-4xl md:text-6xl weight-bold tracking-tight leading-tight">
            Style the Next Generation with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              CoherynUI
            </span>
          </h1>

          <p className="text-lg md:text-xl fg-muted leading-relaxed">
            Independent, Rust-native, agent-native styling engine with sub-5ms Vite HMR,
            declarative mobile touch ergonomics, and progressive GPU materials.
          </p>

          <Cluster gap="4" className="justify-center pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setSheetOpen(true)}
              className="shadow-lg shadow-brand/25"
            >
              <span>📱 Open Bottom Sheet</span>
            </Button>

            <Button
              variant="glass"
              size="lg"
              onClick={handleHapticTest}
            >
              <span>{hapticTriggered ? '✓ Vibrate Triggered' : '⚡ Test Haptic Feedback'}</span>
            </Button>
          </Cluster>
        </Stack>

        {/* -------------------------------------------------------------------------- */}
        {/*                              FEATURE SHOWCASE                              */}
        {/* -------------------------------------------------------------------------- */}
        <section className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <GlassCard className="flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-3">⚡</div>
                <h3 className="text-xl weight-bold mb-2">Instant Vite HMR</h3>
                <p className="text-sm fg-muted leading-relaxed">
                  Compiles utility tokens on demand via virtual module resolution (<code>virtual:coherynui.css</code>)
                  with zero full-page reload flashes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-subtle text-xs font-mono fg-muted">
                @layer cyn.utilities
              </div>
            </GlassCard>

            {/* Feature 2 */}
            <GlassCard className="flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-3">📱</div>
                <h3 className="text-xl weight-bold mb-2">Touch Ergonomics</h3>
                <p className="text-sm fg-muted leading-relaxed">
                  Compliant with WCAG 2.2 SC 2.5.8 (44×44px min tap targets). Built-in support for
                  touch-action, overscroll containment, and velocity-tracked gestures.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-subtle text-xs font-mono fg-muted">
                COH-AMD-1.4 Specification
              </div>
            </GlassCard>

            {/* Feature 3 */}
            <GlassCard className="flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-3">💎</div>
                <h3 className="text-xl weight-bold mb-2">Liquid Glass Materials</h3>
                <p className="text-sm fg-muted leading-relaxed">
                  3-tier progressive optical refraction pipeline spanning WebGPU (WGSL),
                  WebGL2 fallbacks, and CSS-native Liquid Glass recipes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-subtle text-xs font-mono fg-muted">
                @coherynui/gpu-materials
              </div>
            </GlassCard>
          </div>
        </section>
      </main>

      {/* -------------------------------------------------------------------------- */}
      {/*                        MOBILE TOUCH BOTTOM SHEET (COH-AMD-1.4)             */}
      {/* -------------------------------------------------------------------------- */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Touch Ergonomics & Physics Drawer"
      >
        <Stack gap="4" className="pt-2 pb-4">
          <p className="text-sm fg-muted leading-relaxed">
            This drawer is driven by real-time pointer capture, touch-action isolation,
            and pull-to-dismiss dynamics. Drag downward on the handle or backdrop to dismiss.
          </p>

          <div className="p-4 radius-lg bg-surface border border-subtle">
            <div className="text-xs font-mono fg-brand mb-1">WCAG 2.2 SC 2.5.8 Contract</div>
            <div className="text-sm weight-semibold">--cyn-touch-min: 44px;</div>
          </div>

          <Cluster gap="3" className="pt-2 justify-end">
            <Button variant="subtle" size="md" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={() => setSheetOpen(false)}>
              Confirm Action
            </Button>
          </Cluster>
        </Stack>
      </BottomSheet>

      {/* -------------------------------------------------------------------------- */}
      {/*                                   FOOTER                                   */}
      {/* -------------------------------------------------------------------------- */}
      <footer className="border-t border-subtle py-8 px-6 text-sm fg-muted mt-auto">
        <div className="app-container flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© 2026 CoherynUI. Dual-licensed under MIT or Apache-2.0.</div>
          <div className="flex items-center gap-6">
            <a
              href="https://coheryntech.com/coherynui"
              className="hover:text-white transition-colors"
            >
              Documentation
            </a>
            <a
              href="https://github.com/Coheryn/coheryn-ui"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
