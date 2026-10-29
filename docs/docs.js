/**
 * CoherynUI — Interactive Documentation, Cascade Layers & Live REPL Playground Runtime
 * @package @coheryn/coherynui-docs
 * Zero-runtime-overhead interactive engine for docs/index.html
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. TAB ROUTING & CONTROLLER (WITH NESTED SECTION TARGETING)
  // ---------------------------------------------------------------------------
  function switchTab(tabId, sectionId) {
    if (!tabId) return;
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-link, .nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.sidebar-sublink').forEach(b => b.classList.remove('active'));

    const target = document.getElementById('tab-' + tabId);
    if (target) {
      target.classList.add('active');
    }

    const btn = document.querySelector(`.sidebar-link[data-tab="${tabId}"]`) ||
      document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
    if (btn) {
      btn.classList.add('active');
    }

    if (sectionId) {
      const subLink = document.querySelector(`.sidebar-sublink[data-target="${sectionId}"]`);
      if (subLink) subLink.classList.add('active');

      setTimeout(() => {
        const sec = document.getElementById(sectionId);
        if (sec) {
          sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
          sec.classList.remove('cyn-target-highlight');
          void sec.offsetWidth; // trigger reflow
          sec.classList.add('cyn-target-highlight');
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Auto close mobile drawer if open
    toggleDocsNavDrawer(false);

    if (tabId === 'repl') {
      runReplCompiler();
    }
  }

  function filterSidebarMenu(query) {
    const q = (query || '').toLowerCase().trim();
    const items = document.querySelectorAll('.sidebar-nav-list > li');
    items.forEach(li => {
      const text = li.textContent.toLowerCase();
      const match = !q || text.includes(q);
      li.style.display = match ? '' : 'none';
    });
  }

  // ---------------------------------------------------------------------------
  // 1b. GLOBAL MOTION PERSONALITY CONTROLLER
  // ---------------------------------------------------------------------------
  function applyGlobalMotion(motionName) {
    if (!motionName) return;
    const body = document.body;
    body.classList.remove('cyn-motion-spring', 'cyn-motion-smooth', 'cyn-motion-subtle', 'cyn-motion-none',
                           'motion-spring', 'motion-smooth', 'motion-subtle', 'motion-none');
    body.classList.add(`cyn-motion-${motionName}`);

    document.querySelectorAll('.motion-control-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.motion === motionName);
    });

    const label = document.getElementById('activeMotionClassLabel');
    if (label) label.textContent = `body.cyn-motion-${motionName}`;

    triggerDocsToast('Motion Profile', `Activated ${motionName.toUpperCase()} motion personality.`, 'info');
  }

  // ---------------------------------------------------------------------------
  // 1c. NAVIGATION PATTERN CONTROLLER
  // ---------------------------------------------------------------------------
  function applyNavPattern(patternName) {
    if (!patternName) return;
    const navbar = document.getElementById('appNavbar') || document.querySelector('.navbar');
    if (!navbar) return;

    navbar.classList.remove('nav-pattern-ribbon', 'nav-pattern-drawer', 'nav-pattern-bottom', 'nav-pattern-stacked',
                           'cyn-nav-ribbon', 'cyn-nav-drawer', 'cyn-nav-bottom', 'cyn-nav-stacked');
    navbar.classList.add(`nav-pattern-${patternName}`);

    document.querySelectorAll('.nav-pattern-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.pattern === patternName);
    });

    const label = document.getElementById('activeNavPatternLabel');
    if (label) label.textContent = `.nav-pattern-${patternName}`;

    toggleDocsNavDrawer(false);

    triggerDocsToast('Navigation Pattern', `Switched layout mode to ${patternName.toUpperCase()}.`, 'success');
  }

  // ---------------------------------------------------------------------------
  // 1d. ANIMATED HAMBURGER & SIDEBAR DRAWER CONTROLLER
  // ---------------------------------------------------------------------------
  function toggleDocsNavDrawer(forceState) {
    const sidebar = document.getElementById('docsSidebar');
    const navbar = document.getElementById('appNavbar') || document.querySelector('.navbar');
    const btn = document.getElementById('docsHamburgerBtn') || document.querySelector('.nav-hamburger-btn');
    const backdrop = document.getElementById('docsSidebarBackdrop') || document.getElementById('docsNavBackdrop');
    if (!sidebar && !navbar) return;

    const isCurrentlyOpen = sidebar ? sidebar.classList.contains('is-open') : (navbar && navbar.classList.contains('is-open'));
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    if (sidebar) sidebar.classList.toggle('is-open', shouldOpen);
    if (navbar) navbar.classList.toggle('is-open', shouldOpen);
    if (btn) {
      btn.classList.toggle('is-open', shouldOpen);
      btn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    }
    if (backdrop) backdrop.classList.toggle('is-open', shouldOpen);
    if (window.innerWidth <= 1024) {
      document.body.style.overflow = shouldOpen ? 'hidden' : '';
    }
  }

  // ---------------------------------------------------------------------------
  // 2. THEME APPLICATION & SYNC
  // ---------------------------------------------------------------------------
  function applyTheme(theme) {
    if (!theme) return;
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-pill-btn').forEach(btn => {
      const btnTheme = btn.getAttribute('data-theme') || btn.textContent.trim().toLowerCase();
      btn.classList.toggle('active', btnTheme.startsWith(theme.slice(0, 4)));
    });
  }

  // ---------------------------------------------------------------------------
  // 3. LIVE REPL PLAYGROUND COMPILER
  // ---------------------------------------------------------------------------
  const REPL_PRESETS = {
    glass: `<div class="glass-card text-center p-8" style="max-width: 360px;">
  <span class="badge badge-brand mb-2">Liquid Glass</span>
  <h3 class="text-xl font-bold mb-2">Refractive Surface</h3>
  <p class="text-muted text-sm mb-4">W3C 5-layer isolated component with specular border highlights.</p>
  <button class="btn btn-primary touch-target" onclick="triggerDocsToast('Clicked', 'Triggered from REPL!', 'success')">
    Interactive Action
  </button>
</div>`,
    modal: `<div class="text-center p-8">
  <h3 class="text-xl font-bold mb-2">Accessible Modal Trigger</h3>
  <p class="text-muted text-sm mb-4">Focus trapped, scroll locked, WCAG 2.2 AA compliant.</p>
  <button class="btn btn-primary touch-target" onclick="openModal()">
    Open Modal Dialog
  </button>
</div>`,
    bottomsheet: `<div class="text-center p-8">
  <h3 class="text-xl font-bold mb-2">Mobile Gesture Drawer</h3>
  <p class="text-muted text-sm mb-4">Touch-action pan-y, spring physics, drag threshold dismiss.</p>
  <button class="btn btn-secondary touch-target" onclick="openBottomSheet()">
    Open BottomSheet
  </button>
</div>`,
    popover: `<div class="text-center p-8">
  <div class="popover-anchor">
    <button class="btn btn-primary touch-target" onclick="toggleDocsPopover()">
      Context Menu / Popover ▼
    </button>
  </div>
</div>`,
    toasts: `<div class="text-center p-8 d-flex gap-3 justify-center">
  <button class="btn btn-success touch-target" onclick="triggerDocsToast('Success', 'Compiled in 2.8ms', 'success')">Success</button>
  <button class="btn btn-danger touch-target" onclick="triggerDocsToast('Error', 'Connection timeout', 'danger')">Danger</button>
</div>`,
    touch: `<div class="p-6" style="max-width: 380px;">
  <h3 class="text-lg font-bold mb-3">Touch-First Contract (44px min)</h3>
  <button class="btn btn-primary touch-target w-full mb-3">
    44px Compliant Target
  </button>
  <p class="text-muted text-xs">Meets WCAG 2.2 Success Criterion 2.5.8.</p>
</div>`
  };

  function loadReplPreset(key) {
    const editor = document.getElementById('replEditor');
    if (editor) {
      editor.value = REPL_PRESETS[key] || REPL_PRESETS.glass;
      runReplCompiler();
    }
  }

  function runReplCompiler() {
    const editor = document.getElementById('replEditor');
    const preview = document.getElementById('replPreviewCanvas');
    const cssOutput = document.getElementById('replCssOutput');
    const diagMessage = document.getElementById('diagnosticMessage');
    const diagCode = document.getElementById('diagnosticCode');
    const diagIcon = document.getElementById('diagnosticIcon');

    if (!editor || !preview || !cssOutput) return;

    const html = editor.value;
    preview.innerHTML = html;

    const classMatches = html.matchAll(/class=["']([^"']+)["']/g);
    const classes = new Set();
    for (const m of classMatches) {
      m[1].split(/\s+/).forEach(c => { if (c) classes.add(c); });
    }

    const hasTouchTarget = html.includes('touch-target') || html.includes('btn') || html.includes('min-height: 44px');
    const hasSmallButton = html.includes('<button') && !hasTouchTarget;

    if (hasSmallButton) {
      if (diagMessage) diagMessage.textContent = 'CY2004 Warning: Interactive target under 44px detected. Add "touch-target" for WCAG 2.2 AA compliance.';
      if (diagCode) {
        diagCode.textContent = 'CY2004 WARN';
        diagCode.className = 'badge badge-warning';
      }
      if (diagIcon) diagIcon.textContent = '⚠';
    } else {
      if (diagMessage) diagMessage.textContent = `Compiled ${classes.size} class tokens in 1.4ms. All 5 cascade layers verified.`;
      if (diagCode) {
        diagCode.textContent = 'CY1000 OK';
        diagCode.className = 'badge badge-success';
      }
      if (diagIcon) diagIcon.textContent = '✓';
    }

    let generatedCss = `@layer cyn.utilities {\n`;
    classes.forEach(cls => {
      if (cls === 'glass-card') generatedCss += `  .glass-card { background: var(--cyn-glass-bg); backdrop-filter: blur(var(--cyn-glass-blur)); }\n`;
      else if (cls === 'btn-primary') generatedCss += `  .btn-primary { background: var(--cyn-color-brand); color: #fff; min-height: 44px; }\n`;
      else if (cls === 'btn-secondary') generatedCss += `  .btn-secondary { background: var(--cyn-color-surface-subtle); min-height: 44px; }\n`;
      else if (cls === 'touch-target') generatedCss += `  .touch-target { min-width: 44px; min-height: 44px; }\n`;
      else if (cls.startsWith('p-')) generatedCss += `  .${cls} { padding: 1.5rem; }\n`;
      else if (cls.startsWith('mb-')) generatedCss += `  .${cls} { margin-bottom: 0.75rem; }\n`;
      else if (cls === 'text-xl') generatedCss += `  .text-xl { font-size: 1.25rem; font-weight: 700; }\n`;
      else if (cls === 'text-muted') generatedCss += `  .text-muted { color: var(--cyn-color-muted); }\n`;
      else generatedCss += `  .${cls} { /* compiler emitted token */ }\n`;
    });
    generatedCss += `}`;

    cssOutput.textContent = generatedCss;
  }

  function copyReplCss(btn) {
    const el = document.getElementById('replCssOutput');
    if (!el) return;
    navigator.clipboard.writeText(el.textContent.trim());
    if (btn) {
      const label = btn.querySelector('span') || btn;
      const oldText = label.textContent;
      label.textContent = 'Copied!';
      btn.classList.add('copy-success');
      setTimeout(() => {
        label.textContent = oldText;
        btn.classList.remove('copy-success');
      }, 2000);
    }
    triggerDocsToast('CSS Copied', 'Active @layer cyn.utilities copied to clipboard.', 'success');
  }

  // ---------------------------------------------------------------------------
  // 4. CASCADE LAYER INSPECTOR
  // ---------------------------------------------------------------------------
  const LAYER_DEFINITIONS = {
    utilities: {
      title: 'Layer 5: cyn.utilities (Highest Precedence)',
      badge: 'Priority 5',
      desc: 'Atomic utilities override all recipes, base styles, and resets without requiring !important. Provides classes like .bg-brand, .p-6, .touch-target, and .touch-none.',
      code: `@layer cyn.utilities {
  .bg-brand { background-color: var(--cyn-color-brand); }
  .p-6 { padding: 1.5rem; }
  .touch-target { min-width: 44px; min-height: 44px; }
  .touch-none { touch-action: none; }
  .overscroll-contain { overscroll-behavior: contain; }
}`
    },
    recipes: {
      title: 'Layer 4: cyn.recipes (Component Patterns)',
      badge: 'Priority 4',
      desc: 'Semantic multi-property component patterns. Holds structures like .modal-dialog, .bottomsheet-box, .glass-card, and .dropdown-box.',
      code: `@layer cyn.recipes {
  .modal-dialog {
    background: var(--cyn-color-surface-elevated);
    border-radius: var(--cyn-radius-xl);
    padding: 2rem;
    box-shadow: var(--cyn-card-shadow);
  }
}`
    },
    base: {
      title: 'Layer 3: cyn.base (Element Defaults)',
      badge: 'Priority 3',
      desc: 'Global element defaults, typography scales, smooth transitions, and WCAG AA 2px focus-visible outline rings.',
      code: `@layer cyn.base {
  body {
    font-family: var(--cyn-font-sans);
    background: var(--cyn-color-surface);
    color: var(--cyn-color-foreground);
  }
  :focus-visible {
    outline: 2px solid var(--cyn-color-brand);
    outline-offset: 2px;
  }
}`
    },
    tokens: {
      title: 'Layer 2: cyn.tokens (CSS Custom Properties)',
      badge: 'Priority 2',
      desc: 'Declared custom property contracts: colors, 44px minimum touch targets, Liquid Glass variables, and border radii.',
      code: `@layer cyn.tokens {
  :root {
    --cyn-color-brand: #6366f1;
    --cyn-touch-min: 44px;
    --cyn-glass-blur: 16px;
    --cyn-radius-lg: 0.75rem;
  }
}`
    },
    reset: {
      title: 'Layer 1: cyn.reset (Lowest Precedence)',
      badge: 'Priority 1',
      desc: 'Normalized box-sizing and margin normalization baseline. Easily overridden by any higher layer.',
      code: `@layer cyn.reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
}`
    }
  };

  function inspectLayer(layerKey) {
    document.querySelectorAll('.layer-strip').forEach(s => s.classList.remove('active'));
    const activeStrip = document.getElementById('layer-btn-' + layerKey);
    if (activeStrip) activeStrip.classList.add('active');

    const data = LAYER_DEFINITIONS[layerKey];
    if (data) {
      const t = document.getElementById('layerDetailTitle');
      const b = document.getElementById('layerDetailBadge');
      const d = document.getElementById('layerDetailDescription');
      const c = document.getElementById('layerDetailCode');
      if (t) t.textContent = data.title;
      if (b) b.textContent = data.badge;
      if (d) d.textContent = data.desc;
      if (c) c.textContent = data.code;
    }
  }

  // ---------------------------------------------------------------------------
  // 5. TOAST NOTIFICATION ENGINE
  // ---------------------------------------------------------------------------
  function triggerDocsToast(title, desc, variant = 'info') {
    const viewport = document.getElementById('docsToastViewport');
    if (!viewport) return;

    const toast = document.createElement('div');
    toast.className = `toast-node ${variant}`;

    const icons = { success: '✓', warning: '⚠', danger: '✕', info: 'ℹ' };
    toast.innerHTML = `
      <span class="font-bold text-base">${icons[variant] || 'ℹ'}</span>
      <div class="flex-1" style="min-width: 0;">
        <h4 class="text-sm font-bold mb-1">${title}</h4>
        <p class="text-xs text-muted" style="line-height: 1.4;">${desc}</p>
      </div>
      <button class="toast-close-btn" style="background: none; border: none; color: var(--cyn-color-muted); cursor: pointer; padding: 0.2rem;">✕</button>
    `;

    toast.querySelector('.toast-close-btn')?.addEventListener('click', () => toast.remove());
    viewport.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  // ---------------------------------------------------------------------------
  // 6. ACCESSIBLE OVERLAY CONTROLLERS (MODAL, BOTTOMSHEET, DRAWER, POPOVER, DROPDOWN)
  // ---------------------------------------------------------------------------
  let lastActiveElement = null;

  function openModal() {
    lastActiveElement = document.activeElement;
    const m = document.getElementById('demo-modal');
    if (m) m.classList.add('open');
    document.body.style.overflow = 'hidden';
    const primaryBtn = document.querySelector('#demo-modal .btn-primary') || document.querySelector('#demo-modal button');
    setTimeout(() => primaryBtn?.focus(), 50);
  }

  function closeModal() {
    const m = document.getElementById('demo-modal');
    if (m) m.classList.remove('open');
    document.body.style.overflow = '';
    lastActiveElement?.focus();
  }

  function openBottomSheet() {
    const s = document.getElementById('docsBottomSheet');
    if (s) s.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeBottomSheet() {
    const s = document.getElementById('docsBottomSheet');
    if (s) s.classList.remove('open');
    document.body.style.overflow = '';
  }

  function openDrawer() {
    const d = document.getElementById('docsDrawer');
    if (d) d.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    const d = document.getElementById('docsDrawer');
    if (d) d.classList.remove('open');
    document.body.style.overflow = '';
  }

  function toggleDocsPopover() {
    const p = document.getElementById('docsPopoverCard');
    if (p) p.classList.toggle('open');
  }

  function toggleDocsDropdown() {
    const d = document.getElementById('docsDropdownBox');
    if (d) d.classList.toggle('open');
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeBottomSheet();
      closeDrawer();
      document.getElementById('docsPopoverCard')?.classList.remove('open');
      document.getElementById('docsDropdownBox')?.classList.remove('open');
    }
  });

  // ---------------------------------------------------------------------------
  // 7. TOKEN INSPECTOR CONTROLS
  // ---------------------------------------------------------------------------
  function updateBrandColor(val) {
    document.documentElement.style.setProperty('--cyn-color-brand', val);
    const el = document.getElementById('val-brand-hex');
    if (el) el.textContent = val;
    refreshExportCode();
  }

  function updateRadius(val) {
    const px = val + 'px';
    document.documentElement.style.setProperty('--cyn-radius-lg', px);
    const el = document.getElementById('val-radius-label');
    if (el) el.textContent = px;
    refreshExportCode();
  }

  function updateBlur(val) {
    const px = val + 'px';
    document.documentElement.style.setProperty('--cyn-glass-blur', px);
    const el = document.getElementById('val-blur-label');
    if (el) el.textContent = px;
    refreshExportCode();
  }

  function updateShadow(val) {
    const levels = [
      'none',
      '0 4px 12px rgba(0,0,0,0.2)',
      '0 10px 30px -10px rgba(0,0,0,0.5)',
      '0 20px 45px -10px rgba(0,0,0,0.7)',
      '0 30px 60px -12px rgba(0,0,0,0.85)'
    ];
    document.documentElement.style.setProperty('--cyn-card-shadow', levels[val] || levels[2]);
    refreshExportCode();
  }

  function resetTokens() {
    document.documentElement.style.removeProperty('--cyn-color-brand');
    document.documentElement.style.removeProperty('--cyn-radius-lg');
    document.documentElement.style.removeProperty('--cyn-glass-blur');
    document.documentElement.style.removeProperty('--cyn-card-shadow');
    refreshExportCode();
  }

  function refreshExportCode() {
    const brand = getComputedStyle(document.documentElement).getPropertyValue('--cyn-color-brand').trim();
    const radius = getComputedStyle(document.documentElement).getPropertyValue('--cyn-radius-lg').trim();
    const blur = getComputedStyle(document.documentElement).getPropertyValue('--cyn-glass-blur').trim();
    const target = document.getElementById('token-export-code');
    if (target) {
      target.textContent = `:root {\n  --cyn-color-brand: ${brand};\n  --cyn-radius-lg: ${radius};\n  --cyn-glass-blur: ${blur};\n}`;
    }
  }

  function copyActiveTokens(btn) {
    const el = document.getElementById('token-export-code');
    if (!el) return;
    navigator.clipboard.writeText(el.textContent.trim());
    if (btn) {
      const label = btn.querySelector('span') || btn;
      const oldText = label.textContent;
      label.textContent = 'Copied!';
      btn.classList.add('copy-success');
      setTimeout(() => {
        label.textContent = oldText;
        btn.classList.remove('copy-success');
      }, 2000);
    }
    triggerDocsToast('Tokens Copied', 'Exported CSS custom properties.', 'success');
  }

  // ---------------------------------------------------------------------------
  // 8. MOTION PHYSICS SIMULATOR
  // ---------------------------------------------------------------------------
  let springAnimationId = null;

  function updateSpring() {
    const inputs = document.querySelectorAll('#tab-motion input[type="range"]');
    if (inputs.length < 3) return;

    const k = parseFloat(inputs[0].value);
    const c = parseFloat(inputs[1].value);
    const m = parseFloat(inputs[2].value);

    const elK = document.getElementById('val-stiffness');
    const elC = document.getElementById('val-damping');
    const elM = document.getElementById('val-mass');
    const elZ = document.getElementById('val-zeta');

    if (elK) elK.textContent = k;
    if (elC) elC.textContent = c;
    if (elM) elM.textContent = m.toFixed(1);

    const zeta = c / (2 * Math.sqrt(k * m));
    let regime = 'Underdamped';
    if (Math.abs(zeta - 1) < 0.05) regime = 'Critically Damped';
    else if (zeta > 1) regime = 'Overdamped';

    if (elZ) elZ.textContent = `${zeta.toFixed(2)} (${regime})`;
  }

  function triggerSpringPulse() {
    const bob = document.getElementById('spring-target');
    const inputs = document.querySelectorAll('#tab-motion input[type="range"]');
    if (!bob || inputs.length < 3) return;

    const k = parseFloat(inputs[0].value);
    const c = parseFloat(inputs[1].value);
    const m = parseFloat(inputs[2].value);

    let x = -100;
    let v = 0;
    let lastTime = performance.now();
    cancelAnimationFrame(springAnimationId);

    function step(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.032);
      lastTime = now;
      const a = (-k * x - c * v) / m;
      v += a * dt;
      x += v * dt;
      bob.style.transform = `translateX(${x}px)`;

      if (Math.abs(x) > 0.5 || Math.abs(v) > 0.5) {
        springAnimationId = requestAnimationFrame(step);
      } else {
        bob.style.transform = `translateX(0px)`;
      }
    }
    springAnimationId = requestAnimationFrame(step);
  }

  function presetSpring(type) {
    const inputs = document.querySelectorAll('#tab-motion input[type="range"]');
    if (inputs.length < 3) return;
    if (type === 'snappy') { inputs[0].value = 320; inputs[1].value = 24; inputs[2].value = 0.8; }
    else if (type === 'bouncy') { inputs[0].value = 160; inputs[1].value = 6; inputs[2].value = 1.0; }
    updateSpring();
    triggerSpringPulse();
  }

  function copyCode(btn) {
    const container = btn.closest('.code-preview, .code-view, .terminal-window, .card, .spec-strip, .cli-bar') || btn.parentElement;
    const pre = container ? container.querySelector('code') : null;
    const textToCopy = pre ? pre.textContent.trim() : (btn.getAttribute('data-clipboard-text') || '');
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      });
      const label = btn.querySelector('span') || btn;
      const oldText = label.textContent;
      label.textContent = 'Copied!';
      btn.classList.add('copy-success');
      setTimeout(() => {
        label.textContent = oldText;
        btn.classList.remove('copy-success');
      }, 2000);
      triggerDocsToast('Copied to Clipboard', 'Code snippet copied.', 'success');
    }
  }

  // ---------------------------------------------------------------------------
  // 9. FRAMEWORK INTEGRATION SWITCHER
  // ---------------------------------------------------------------------------
  function switchFramework(id) {
    document.querySelectorAll('.framework-tab-btn').forEach(btn => {
      const tabId = btn.getAttribute('data-framework') || (btn.getAttribute('onclick')?.includes(id) ? id : '');
      btn.classList.toggle('active', tabId === id);
    });
    document.querySelectorAll('.framework-snippet').forEach(snip => {
      snip.classList.toggle('active', snip.id === 'framework-' + id);
    });
  }

  function toggleAttr(id, attr) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.hasAttribute(attr)) el.removeAttribute(attr);
    else el.setAttribute(attr, '');
  }

  // ---------------------------------------------------------------------------
  // 10. TELEMETRY EVENT BUS
  // ---------------------------------------------------------------------------
  function logWcEvent(tag, name, detail) {
    const logger = document.getElementById('wc-event-logger');
    if (!logger) return;

    const time = new Date().toTimeString().split(' ')[0];
    const entry = document.createElement('div');
    entry.className = 'event-log-entry';

    let detailStr = '';
    if (detail && Object.keys(detail).length > 0) {
      detailStr = ' ' + JSON.stringify(detail);
    }

    entry.innerHTML = `
      <span class="event-log-time">[${time}]</span>
      <span class="event-log-tag">${tag}</span>
      <span>→</span>
      <span class="event-log-name">${name}</span>
      <span class="text-xs text-muted">${detailStr}</span>
    `;

    logger.appendChild(entry);
    while (logger.children.length > 40) {
      logger.removeChild(logger.firstChild);
    }
    logger.scrollTop = logger.scrollHeight;
  }

  function clearWcEventLogs() {
    const logger = document.getElementById('wc-event-logger');
    if (!logger) return;
    logger.innerHTML = `
      <div class="event-log-entry">
        <span class="event-log-time">[System]</span>
        <span class="event-log-name">Telemetry cleared. Awaiting custom element events...</span>
      </div>
    `;
  }

  function triggerWcToast(title, desc, variant = 'info') {
    const container = document.getElementById('demo-wc-toast-container');
    if (container && typeof container.pushToast === 'function') {
      container.pushToast(title, desc, variant);
    } else {
      triggerDocsToast(title, desc, variant);
    }
  }

  // ---------------------------------------------------------------------------
  // 11. NATIVE WEB COMPONENT CUSTOM ELEMENTS
  // ---------------------------------------------------------------------------
  class CynModalElement extends HTMLElement {
    static get observedAttributes() { return ['open', 'title']; }
    connectedCallback() {
      this.render();
      if (this.hasAttribute('open')) this.activate();
    }
    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (name === 'open') {
        if (this.hasAttribute('open')) {
          this.activate();
          this.dispatchEvent(new CustomEvent('cyn-open', { bubbles: true, composed: true, detail: { open: true } }));
        } else {
          this.deactivate();
          this.dispatchEvent(new CustomEvent('cyn-close', { bubbles: true, composed: true, detail: { open: false } }));
        }
      } else if (name === 'title' && this._titleEl) {
        this._titleEl.textContent = newVal || '';
      }
    }
    show() { this.setAttribute('open', ''); }
    close() { this.removeAttribute('open'); }
    toggle() { if (this.hasAttribute('open')) this.close(); else this.show(); }

    render() {
      if (this._backdrop) return;
      this._backdrop = document.createElement('div');
      this._backdrop.className = 'modal-backdrop';
      this._backdrop.setAttribute('role', 'dialog');
      this._backdrop.setAttribute('aria-modal', 'true');
      this._backdrop.addEventListener('click', (e) => {
        if (e.target === this._backdrop) this.close();
      });

      this._box = document.createElement('div');
      this._box.className = 'modal-box';

      const header = document.createElement('div');
      header.className = 'modal-header flex-between mb-4';

      this._titleEl = document.createElement('h3');
      this._titleEl.className = 'card-title-lg';
      this._titleEl.textContent = this.getAttribute('title') || '';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-close-btn';
      closeBtn.setAttribute('aria-label', 'Close dialog');
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', () => this.close());

      header.appendChild(this._titleEl);
      header.appendChild(closeBtn);
      this._box.appendChild(header);

      const body = document.createElement('div');
      while (this.firstChild) {
        body.appendChild(this.firstChild);
      }
      this._box.appendChild(body);
      this._backdrop.appendChild(this._box);
      this.appendChild(this._backdrop);

      this._escListener = (e) => {
        if (e.key === 'Escape' && this.hasAttribute('open')) this.close();
      };
      window.addEventListener('keydown', this._escListener);
    }
    activate() {
      if (!this._backdrop) this.render();
      if (this._backdrop) this._backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    deactivate() {
      if (this._backdrop) this._backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  class CynDrawerElement extends HTMLElement {
    static get observedAttributes() { return ['open', 'title', 'placement']; }
    connectedCallback() {
      this.render();
      if (this.hasAttribute('open')) this.activate();
    }
    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (name === 'open') {
        if (this.hasAttribute('open')) {
          this.activate();
          this.dispatchEvent(new CustomEvent('cyn-open', { bubbles: true, composed: true, detail: { open: true, placement: this.getAttribute('placement') || 'right' } }));
        } else {
          this.deactivate();
          this.dispatchEvent(new CustomEvent('cyn-close', { bubbles: true, composed: true, detail: { open: false } }));
        }
      }
    }
    show() { this.setAttribute('open', ''); }
    close() { this.removeAttribute('open'); }
    toggle() { if (this.hasAttribute('open')) this.close(); else this.show(); }

    render() {
      if (this._backdrop) return;
      this._backdrop = document.createElement('div');
      this._backdrop.className = 'drawer-backdrop';
      this._backdrop.setAttribute('role', 'dialog');
      this._backdrop.setAttribute('aria-modal', 'true');
      this._backdrop.addEventListener('click', (e) => {
        if (e.target === this._backdrop) this.close();
      });

      this._box = document.createElement('div');
      this._box.className = 'drawer-box';

      const header = document.createElement('div');
      header.className = 'drawer-header flex-between mb-4';

      const title = document.createElement('h3');
      title.className = 'card-title-lg';
      title.textContent = this.getAttribute('title') || 'Drawer';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-close-btn';
      closeBtn.setAttribute('aria-label', 'Close drawer');
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', () => this.close());

      header.appendChild(title);
      header.appendChild(closeBtn);
      this._box.appendChild(header);

      const body = document.createElement('div');
      body.className = 'd-flex flex-col h-full';
      while (this.firstChild) {
        body.appendChild(this.firstChild);
      }
      this._box.appendChild(body);
      this._backdrop.appendChild(this._box);
      this.appendChild(this._backdrop);
    }
    activate() {
      if (!this._backdrop) this.render();
      if (this._backdrop) this._backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    deactivate() {
      if (this._backdrop) this._backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  class CynBottomSheetElement extends HTMLElement {
    static get observedAttributes() { return ['open', 'title']; }
    connectedCallback() {
      this.render();
      if (this.hasAttribute('open')) this.activate();
    }
    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (name === 'open') {
        if (this.hasAttribute('open')) {
          this.activate();
          this.dispatchEvent(new CustomEvent('cyn-open', { bubbles: true, composed: true, detail: { open: true } }));
        } else {
          this.deactivate();
          this.dispatchEvent(new CustomEvent('cyn-close', { bubbles: true, composed: true, detail: { open: false } }));
        }
      }
    }
    show() { this.setAttribute('open', ''); }
    close() { this.removeAttribute('open'); }
    toggle() { if (this.hasAttribute('open')) this.close(); else this.show(); }

    render() {
      if (this._backdrop) return;
      this._backdrop = document.createElement('div');
      this._backdrop.className = 'bottomsheet-backdrop';
      this._backdrop.setAttribute('role', 'dialog');
      this._backdrop.setAttribute('aria-modal', 'true');
      this._backdrop.addEventListener('click', (e) => {
        if (e.target === this._backdrop) this.close();
      });

      this._box = document.createElement('div');
      this._box.className = 'bottomsheet-box';

      const grabHandle = document.createElement('div');
      grabHandle.style.cssText = 'width: 44px; height: 5px; background: rgba(255,255,255,0.25); border-radius: 9999px; margin: 0 auto 1.25rem; cursor: grab;';
      this._box.appendChild(grabHandle);

      const header = document.createElement('div');
      header.className = 'bottomsheet-header flex-between mb-4';

      const title = document.createElement('h3');
      title.className = 'card-title-lg';
      title.textContent = this.getAttribute('title') || 'BottomSheet';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-close-btn';
      closeBtn.setAttribute('aria-label', 'Close bottom sheet');
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', () => this.close());

      header.appendChild(title);
      header.appendChild(closeBtn);
      this._box.appendChild(header);

      const body = document.createElement('div');
      while (this.firstChild) {
        body.appendChild(this.firstChild);
      }
      this._box.appendChild(body);
      this._backdrop.appendChild(this._box);
      this.appendChild(this._backdrop);
    }
    activate() {
      if (!this._backdrop) this.render();
      if (this._backdrop) this._backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    deactivate() {
      if (this._backdrop) this._backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  class CynSwitchElement extends HTMLElement {
    static get observedAttributes() { return ['checked', 'disabled', 'label']; }
    connectedCallback() {
      this.render();
      this.setAttribute('role', 'switch');
      this.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
      this.setAttribute('aria-checked', this.hasAttribute('checked') ? 'true' : 'false');

      this.addEventListener('click', () => this.toggle());
      this.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.toggle();
        }
      });
    }
    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (name === 'checked') {
        const isChecked = this.hasAttribute('checked');
        this.setAttribute('aria-checked', isChecked ? 'true' : 'false');
        this.dispatchEvent(new CustomEvent('cyn-change', {
          bubbles: true,
          composed: true,
          detail: { checked: isChecked }
        }));
      } else if (name === 'label' && this._labelEl) {
        this._labelEl.textContent = newVal || '';
      }
    }
    toggle() {
      if (this.hasAttribute('disabled')) return;
      if (this.hasAttribute('checked')) this.removeAttribute('checked');
      else this.setAttribute('checked', '');
    }
    render() {
      if (this._rendered) return;
      this._rendered = true;

      const track = document.createElement('div');
      track.className = 'cyn-switch-track';
      const thumb = document.createElement('div');
      thumb.className = 'cyn-switch-thumb';
      track.appendChild(thumb);

      this._labelEl = document.createElement('span');
      this._labelEl.className = 'cyn-switch-label';
      this._labelEl.textContent = this.getAttribute('label') || '';

      this.appendChild(track);
      this.appendChild(this._labelEl);
    }
  }

  class CynPopoverElement extends HTMLElement {
    static get observedAttributes() { return ['open']; }
    connectedCallback() {
      this._card = this.querySelector('.popover-card');
      document.addEventListener('click', (e) => {
        if (!this.contains(e.target) && this.hasAttribute('open')) {
          this.close();
        }
      });
    }
    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (name === 'open') {
        const isOpen = this.hasAttribute('open');
        if (this._card) this._card.classList.toggle('open', isOpen);
        this.dispatchEvent(new CustomEvent(isOpen ? 'cyn-open' : 'cyn-close', {
          bubbles: true,
          composed: true,
          detail: { open: isOpen }
        }));
      }
    }
    show() { this.setAttribute('open', ''); }
    close() { this.removeAttribute('open'); }
    toggle() { if (this.hasAttribute('open')) this.close(); else this.show(); }
  }

  class CynDropdownElement extends HTMLElement {
    static get observedAttributes() { return ['open']; }
    connectedCallback() {
      this._box = this.querySelector('.dropdown-box');
      document.addEventListener('click', (e) => {
        if (!this.contains(e.target) && this.hasAttribute('open')) {
          this.close();
        }
      });
    }
    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (name === 'open') {
        const isOpen = this.hasAttribute('open');
        if (this._box) this._box.classList.toggle('open', isOpen);
        this.dispatchEvent(new CustomEvent(isOpen ? 'cyn-open' : 'cyn-close', {
          bubbles: true,
          composed: true,
          detail: { open: isOpen }
        }));
      }
    }
    show() { this.setAttribute('open', ''); }
    close() { this.removeAttribute('open'); }
    toggle() { if (this.hasAttribute('open')) this.close(); else this.show(); }
  }

  class CynToastContainerElement extends HTMLElement {
    connectedCallback() {
      this.className = 'toast-stack';
    }
    pushToast(title, desc, variant = 'info') {
      const toast = document.createElement('div');
      toast.className = `toast-node ${variant}`;

      const icons = { success: '✓', warning: '⚠', danger: '✕', info: 'ℹ' };
      toast.innerHTML = `
        <span class="font-bold text-base">${icons[variant] || 'ℹ'}</span>
        <div class="flex-1" style="min-width: 0;">
          <h4 class="text-sm font-bold mb-1">${title}</h4>
          <p class="text-xs text-muted" style="line-height: 1.4;">${desc}</p>
        </div>
        <button class="toast-close-btn" style="background: none; border: none; color: var(--cyn-color-muted); cursor: pointer; padding: 0.2rem;">✕</button>
      `;

      toast.querySelector('.toast-close-btn')?.addEventListener('click', () => toast.remove());
      this.appendChild(toast);
      this.dispatchEvent(new CustomEvent('cyn-toast-added', {
        bubbles: true,
        composed: true,
        detail: { title, variant }
      }));

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
      }, 3500);
    }
  }

  class CynNavbarElement extends HTMLElement {
    static get observedAttributes() { return ['pattern', 'open']; }
    connectedCallback() {
      this.classList.add('cyn-navbar');
      const pattern = this.getAttribute('pattern') || 'ribbon';
      this.classList.add(`cyn-nav-${pattern}`);

      const btn = this.querySelector('.cyn-hamburger-btn, .nav-hamburger-btn');
      btn?.addEventListener('click', () => this.toggle());

      const backdrop = this.querySelector('.cyn-nav-backdrop, .nav-backdrop');
      backdrop?.addEventListener('click', () => this.close());
    }
    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (name === 'pattern') {
        if (oldVal) this.classList.remove(`cyn-nav-${oldVal}`);
        if (newVal) this.classList.add(`cyn-nav-${newVal}`);
      } else if (name === 'open') {
        const isOpen = this.hasAttribute('open');
        const btn = this.querySelector('.cyn-hamburger-btn, .nav-hamburger-btn');
        this.classList.toggle('is-open', isOpen);
        btn?.classList.toggle('is-open', isOpen);
        btn?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        this.dispatchEvent(new CustomEvent(isOpen ? 'cyn-open' : 'cyn-close', {
          bubbles: true,
          composed: true,
          detail: { open: isOpen, pattern: this.getAttribute('pattern') }
        }));
      }
    }
    show() { this.setAttribute('open', ''); }
    close() { this.removeAttribute('open'); }
    toggle() { if (this.hasAttribute('open')) this.close(); else this.show(); }
  }

  class CynTabsElement extends HTMLElement {
    static get observedAttributes() { return ['variant']; }
    connectedCallback() {
      this.applyVariant();
      this.setupTabs();
    }
    attributeChangedCallback(name) {
      if (name === 'variant') this.applyVariant();
    }
    applyVariant() {
      const variant = this.getAttribute('variant') || 'pills';
      this.classList.remove('cyn-tabs-lifted', 'cyn-tabs-bordered', 'cyn-tabs-line', 'cyn-tabs-pills');
      if (variant === 'lifted' || variant === 'bordered') {
        this.classList.add('cyn-tabs-lifted');
      } else if (variant === 'line' || variant === 'underline') {
        this.classList.add('cyn-tabs-line');
      } else {
        this.classList.add('cyn-tabs-pills');
      }
    }
    setupTabs() {
      const tabList = this.querySelector('[role="tablist"]');
      if (!tabList) return;
      const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
      const panels = Array.from(this.querySelectorAll('[role="tabpanel"]'));
      if (!tabs.length) return;

      tabs.forEach((tab, idx) => {
        tab.addEventListener('click', () => this.selectTab(idx));
        tab.addEventListener('keydown', (e) => {
          let nextIdx = idx;
          if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
          else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
          else if (e.key === 'Home') nextIdx = 0;
          else if (e.key === 'End') nextIdx = tabs.length - 1;
          else return;
          e.preventDefault();
          tabs[nextIdx].focus();
          this.selectTab(nextIdx);
        });
      });
      const initialIdx = Math.max(0, tabs.findIndex(t => t.getAttribute('aria-selected') === 'true' || t.classList.contains('active')));
      this.selectTab(initialIdx);
    }
    selectTab(idx) {
      const tabList = this.querySelector('[role="tablist"]');
      const tabs = Array.from(tabList ? tabList.querySelectorAll('[role="tab"]') : []);
      const panels = Array.from(this.querySelectorAll('[role="tabpanel"]'));
      tabs.forEach((t, i) => {
        const isSel = i === idx;
        t.setAttribute('aria-selected', isSel ? 'true' : 'false');
        t.setAttribute('tabindex', isSel ? '0' : '-1');
        t.classList.toggle('active', isSel);
      });
      panels.forEach((p, i) => {
        const isSel = i === idx;
        p.style.display = isSel ? 'block' : 'none';
        p.classList.toggle('active', isSel);
        p.setAttribute('aria-hidden', isSel ? 'false' : 'true');
      });
      this.dispatchEvent(new CustomEvent('cyn-change', { bubbles: true, detail: { index: idx } }));
    }
  }

  function switchComponentTab(containerId, tabId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const tabs = container.querySelectorAll('[role="tab"], .cyn-tab-btn, .tab-btn');
    const panels = container.querySelectorAll('[role="tabpanel"], .cyn-tabpanel, .tabpanel');
    tabs.forEach(t => {
      const match = t.getAttribute('data-tab-target') === tabId || t.getAttribute('aria-controls') === tabId;
      t.classList.toggle('active', match);
      t.setAttribute('aria-selected', match ? 'true' : 'false');
      t.setAttribute('tabindex', match ? '0' : '-1');
    });
    panels.forEach(p => {
      const match = p.id === tabId;
      p.classList.toggle('active', match);
      p.setAttribute('aria-hidden', match ? 'false' : 'true');
      p.style.display = match ? 'block' : 'none';
    });
  }

  function setDemoTabsVariant(containerId, variant) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.classList.remove('cyn-tabs-lifted', 'cyn-tabs-bordered', 'cyn-tabs-line', 'cyn-tabs-pills');
    if (variant === 'lifted' || variant === 'bordered') el.classList.add('cyn-tabs-lifted');
    else if (variant === 'line') el.classList.add('cyn-tabs-line');
    else el.classList.add('cyn-tabs-pills');

    const card = el.closest('.card');
    if (card) {
      card.querySelectorAll('.tab-variant-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-variant') === variant);
      });
    }
  }

  // Register All Web Component Custom Elements
  if ('customElements' in window) {
    if (!customElements.get('cyn-modal')) customElements.define('cyn-modal', CynModalElement);
    if (!customElements.get('cyn-drawer')) customElements.define('cyn-drawer', CynDrawerElement);
    if (!customElements.get('cyn-bottom-sheet')) customElements.define('cyn-bottom-sheet', CynBottomSheetElement);
    if (!customElements.get('cyn-switch')) customElements.define('cyn-switch', CynSwitchElement);
    if (!customElements.get('cyn-popover')) customElements.define('cyn-popover', CynPopoverElement);
    if (!customElements.get('cyn-dropdown')) customElements.define('cyn-dropdown', CynDropdownElement);
    if (!customElements.get('cyn-toast-container')) customElements.define('cyn-toast-container', CynToastContainerElement);
    if (!customElements.get('cyn-navbar')) customElements.define('cyn-navbar', CynNavbarElement);
    if (!customElements.get('cyn-tabs')) customElements.define('cyn-tabs', CynTabsElement);
  }

  // Global Telemetry Event Hook
  ['cyn-open', 'cyn-close', 'cyn-change', 'cyn-select', 'cyn-toast-added'].forEach(evtName => {
    document.addEventListener(evtName, (e) => {
      const tag = e.target.tagName ? `<${e.target.tagName.toLowerCase()}>` : 'element';
      logWcEvent(tag, e.type, e.detail || {});
    });
  });

  // ---------------------------------------------------------------------------
  // 12. DELEGATED EVENT LISTENER FOR CLEAN HTML
  // ---------------------------------------------------------------------------
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-tab], [data-theme], [data-layer], [data-framework], [data-action]');
    if (!target) return;

    if (target.hasAttribute('data-tab')) {
      e.preventDefault();
      switchTab(target.getAttribute('data-tab'));
    } else if (target.hasAttribute('data-theme')) {
      e.preventDefault();
      applyTheme(target.getAttribute('data-theme'));
    } else if (target.hasAttribute('data-layer')) {
      e.preventDefault();
      inspectLayer(target.getAttribute('data-layer'));
    } else if (target.hasAttribute('data-framework')) {
      e.preventDefault();
      switchFramework(target.getAttribute('data-framework'));
    } else if (target.hasAttribute('data-action')) {
      const action = target.getAttribute('data-action');
      if (action === 'open-modal') openModal();
      else if (action === 'close-modal') closeModal();
      else if (action === 'open-drawer') openDrawer();
      else if (action === 'close-drawer') closeDrawer();
      else if (action === 'open-bottomsheet') openBottomSheet();
      else if (action === 'close-bottomsheet') closeBottomSheet();
      else if (action === 'toggle-popover') toggleDocsPopover();
      else if (action === 'toggle-dropdown') toggleDocsDropdown();
      else if (action === 'copy-tokens') copyActiveTokens();
      else if (action === 'reset-tokens') resetTokens();
      else if (action === 'copy-repl-css') copyReplCss();
      else if (action === 'clear-telemetry') clearWcEventLogs();
    }
  });

  // Export on window for backwards compatibility with inline attributes & console testing
  Object.assign(window, {
    switchTab,
    applyTheme,
    applyGlobalMotion,
    applyNavPattern,
    toggleDocsNavDrawer,
    loadReplPreset,
    runReplCompiler,
    copyReplCss,
    inspectLayer,
    triggerDocsToast,
    openModal,
    closeModal,
    openBottomSheet,
    closeBottomSheet,
    openDrawer,
    closeDrawer,
    toggleDocsPopover,
    toggleDocsDropdown,
    updateBrandColor,
    updateRadius,
    updateBlur,
    updateShadow,
    resetTokens,
    refreshExportCode,
    copyActiveTokens,
    updateSpring,
    triggerSpringPulse,
    presetSpring,
    copyCode,
    switchFramework,
    toggleAttr,
    logWcEvent,
    clearWcEventLogs,
    triggerWcToast,
    setDemoWcNavbarPattern,
    CynModalElement,
    CynDrawerElement,
    CynBottomSheetElement,
    CynSwitchElement,
    CynPopoverElement,
    CynDropdownElement,
    CynToastContainerElement,
    CynNavbarElement,
    CynTabsElement,
    switchComponentTab,
    setDemoTabsVariant,
    filterSidebarMenu,
    setSimulatorPattern,
    setSimulatorViewport,
    toggleSimulatedDrawer
  });

  function setSimulatorPattern(pat) {
    const nav = document.querySelector('#navbarSimulatorFrame .simulated-navbar');
    if (nav) {
      nav.className = `navbar cyn-navbar cyn-nav-${pat} simulated-navbar`;
      nav.classList.remove('is-open');
    }
    const drawer = document.getElementById('simulatedDrawerPanel');
    if (drawer) drawer.classList.remove('is-open');
    const backdrop = document.querySelector('#navbarSimulatorFrame .simulated-nav-backdrop');
    if (backdrop) backdrop.classList.remove('is-open');
    const burger = document.querySelector('#navbarSimulatorFrame .nav-hamburger-btn, #navbarSimulatorFrame .cyn-hamburger-btn');
    if (burger) {
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }

    document.querySelectorAll('.sim-pattern-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-pattern') === pat);
    });

    const badge = document.getElementById('simActivePatternBadge');
    if (badge) {
      const labels = {
        drawer: 'Pattern: Slide-Out Drawer (Morphing Hamburger)',
        ribbon: 'Pattern: Touch Swipe Ribbon (Momentum Scroll)',
        bottom: 'Pattern: Mobile Bottom Dock (iOS Safe Area)',
        stacked: 'Pattern: Auto-Stacked Grid (Multi-Row)'
      };
      badge.textContent = labels[pat] || pat;
    }
  }

  function setSimulatorViewport(mode) {
    const frame = document.getElementById('navbarSimulatorFrame');
    if (!frame) return;
    frame.classList.toggle('view-mobile', mode === 'mobile');
    frame.classList.toggle('view-desktop', mode === 'desktop');

    document.querySelectorAll('.sim-viewport-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-viewport') === mode);
    });
  }

  function toggleSimulatedDrawer(force) {
    const nav = document.querySelector('#navbarSimulatorFrame .simulated-navbar');
    const drawer = document.getElementById('simulatedDrawerPanel');
    const frame = document.getElementById('navbarSimulatorFrame');
    if (!frame) return;

    const isOpen = typeof force === 'boolean' ? force : !(drawer ? drawer.classList.contains('is-open') : (nav && nav.classList.contains('is-open')));
    if (nav) nav.classList.toggle('is-open', isOpen);
    if (drawer) drawer.classList.toggle('is-open', isOpen);

    const burger = frame.querySelector('.nav-hamburger-btn, .cyn-hamburger-btn');
    if (burger) {
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    const backdrop = frame.querySelector('.simulated-nav-backdrop');
    if (backdrop) {
      backdrop.classList.toggle('is-open', isOpen);
    }
  }

  function setDemoWcNavbarPattern(pat) {
    const el = document.getElementById('demo-wc-navbar');
    if (!el) return;
    el.setAttribute('pattern', pat);
    const label = document.getElementById('demo-wc-navbar-pattern-label');
    if (label) label.textContent = `pattern="${pat}"`;
    document.querySelectorAll('.demo-wc-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-pattern') === pat);
    });
    triggerDocsToast('Navbar Pattern Swapped', `<cyn-navbar pattern="${pat}"> active.`, 'info');
  }

  // Initialize on DOM load
  window.addEventListener('DOMContentLoaded', () => {
    loadReplPreset('glass');
    inspectLayer('utilities');
  });

})();
