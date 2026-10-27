/**
 * CoherynUI Webpack Plugin — CSS Compiler Engine
 *
 * Implements the canonical 5-layer W3C cascade layer compiler:
 * @layer <prefix>.reset, <prefix>.tokens, <prefix>.base, <prefix>.recipes, <prefix>.utilities;
 */

import { CoherynPluginOptions, CompilerResult, ExtractedCandidate } from './types';

interface Declaration {
  property: string;
  value: string;
  important?: boolean;
}

interface ParsedToken {
  variants: string[];
  baseUtility: string;
  valuePart?: string;
  arbitrary: boolean;
  important: boolean;
}

const SPACING_MAP: Record<string, string> = {
  '0': '0px',
  '1': '0.25rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '8': '2rem',
  '10': '2.5rem',
  '12': '3rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
};

const RADIUS_MAP: Record<string, string> = {
  none: '0px',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

function escapeSelector(raw: string): string {
  return raw
    .replace(/:/g, '\\:')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/#/g, '\\#')
    .replace(/%/g, '\\%')
    .replace(/\./g, '\\.')
    .replace(/\//g, '\\/');
}

export function parseClassToken(raw: string): ParsedToken {
  let trimmed = raw.trim();
  let important = false;

  if (trimmed.startsWith('!')) {
    important = true;
    trimmed = trimmed.slice(1);
  }
  if (trimmed.endsWith('!')) {
    important = true;
    trimmed = trimmed.slice(0, -1);
  }

  // Split variants on ':' respecting arbitrary brackets like p-[calc(100%-2rem)]
  const variants: string[] = [];
  let current = '';
  let inBracket = false;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '[') {
      inBracket = true;
      current += ch;
    } else if (ch === ']') {
      inBracket = false;
      current += ch;
    } else if (ch === ':' && !inBracket) {
      if (current) {
        variants.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }

  const utilityBody = current;

  // Split utility into base and value
  let baseUtility = utilityBody;
  let valuePart: string | undefined = undefined;
  let arbitrary = false;

  const bracketStart = utilityBody.indexOf('[');
  if (bracketStart !== -1 && utilityBody.endsWith(']')) {
    arbitrary = true;
    baseUtility = utilityBody.slice(0, bracketStart).replace(/-$/, '');
    valuePart = utilityBody.slice(bracketStart + 1, -1);
  } else {
    const lastDash = utilityBody.lastIndexOf('-');
    if (lastDash !== -1) {
      baseUtility = utilityBody.slice(0, lastDash);
      valuePart = utilityBody.slice(lastDash + 1);
    }
  }

  return {
    variants,
    baseUtility,
    valuePart,
    arbitrary,
    important,
  };
}

function resolveDeclarations(
  token: ParsedToken,
  varPrefix: string
): Declaration[] | null {
  const { baseUtility: base, valuePart: val, arbitrary, important } = token;
  const vp = varPrefix;

  // Arbitrary values: p-[20px], bg-[#ffffff], w-[50%]
  if (arbitrary && val) {
    const cleanVal = val.replace(/_/g, ' ');
    if (base === 'p') return [{ property: 'padding', value: cleanVal, important }];
    if (base === 'px') return [{ property: 'padding-inline', value: cleanVal, important }];
    if (base === 'py') return [{ property: 'padding-block', value: cleanVal, important }];
    if (base === 'm') return [{ property: 'margin', value: cleanVal, important }];
    if (base === 'mx') return [{ property: 'margin-inline', value: cleanVal, important }];
    if (base === 'my') return [{ property: 'margin-block', value: cleanVal, important }];
    if (base === 'w') return [{ property: 'width', value: cleanVal, important }];
    if (base === 'h') return [{ property: 'height', value: cleanVal, important }];
    if (base === 'bg') return [{ property: 'background-color', value: cleanVal, important }];
    if (base === 'color' || base === 'fg') return [{ property: 'color', value: cleanVal, important }];
    if (base === 'z') return [{ property: 'z-index', value: cleanVal, important }];
    if (base === 'gap') return [{ property: 'gap', value: cleanVal, important }];
  }

  // Display
  if (base === 'flex' && !val) return [{ property: 'display', value: 'flex', important }];
  if (base === 'grid' && !val) return [{ property: 'display', value: 'grid', important }];
  if (base === 'block' && !val) return [{ property: 'display', value: 'block', important }];
  if (base === 'inline' && !val) return [{ property: 'display', value: 'inline', important }];
  if (base === 'inline-flex' || (base === 'inline' && val === 'flex')) return [{ property: 'display', value: 'inline-flex', important }];
  if (base === 'inline-grid' || (base === 'inline' && val === 'grid')) return [{ property: 'display', value: 'inline-grid', important }];
  if (base === 'hidden' && !val) return [{ property: 'display', value: 'none', important }];

  // Container Queries Root
  if (base === 'cq-root' || (base === 'cq' && val === 'root')) return [{ property: 'container-type', value: 'inline-size', important }];

  // Flexbox & Layout
  if (base === 'flex' && val === 'col') return [{ property: 'flex-direction', value: 'column', important }];
  if (base === 'flex' && val === 'row') return [{ property: 'flex-direction', value: 'row', important }];
  if (base === 'flex' && val === 'wrap') return [{ property: 'flex-wrap', value: 'wrap', important }];
  if (base === 'flex' && val === 'nowrap') return [{ property: 'flex-wrap', value: 'nowrap', important }];
  if (base === 'flex' && val === '1') return [{ property: 'flex', value: '1 1 0%', important }];
  if (base === 'flex' && val === 'auto') return [{ property: 'flex', value: '1 1 auto', important }];
  if (base === 'flex' && val === 'none') return [{ property: 'flex', value: 'none', important }];

  // Alignment
  if (base === 'items' && val === 'center') return [{ property: 'align-items', value: 'center', important }];
  if (base === 'items' && val === 'start') return [{ property: 'align-items', value: 'flex-start', important }];
  if (base === 'items' && val === 'end') return [{ property: 'align-items', value: 'flex-end', important }];
  if (base === 'justify' && val === 'center') return [{ property: 'justify-content', value: 'center', important }];
  if (base === 'justify' && val === 'between') return [{ property: 'justify-content', value: 'space-between', important }];
  if (base === 'justify' && val === 'start') return [{ property: 'justify-content', value: 'flex-start', important }];
  if (base === 'justify' && val === 'end') return [{ property: 'justify-content', value: 'flex-end', important }];

  // Spacing (Padding, Margin, Gap)
  if (base === 'p' && val && SPACING_MAP[val]) return [{ property: 'padding', value: SPACING_MAP[val], important }];
  if (base === 'px' && val && SPACING_MAP[val]) return [{ property: 'padding-inline', value: SPACING_MAP[val], important }];
  if (base === 'py' && val && SPACING_MAP[val]) return [{ property: 'padding-block', value: SPACING_MAP[val], important }];
  if (base === 'm' && val && SPACING_MAP[val]) return [{ property: 'margin', value: SPACING_MAP[val], important }];
  if (base === 'gap' && val && SPACING_MAP[val]) return [{ property: 'gap', value: SPACING_MAP[val], important }];

  // Typography
  if (base === 'text' && val === 'xs') return [{ property: 'font-size', value: '0.75rem', important }, { property: 'line-height', value: '1rem', important }];
  if (base === 'text' && val === 'sm') return [{ property: 'font-size', value: '0.875rem', important }, { property: 'line-height', value: '1.25rem', important }];
  if (base === 'text' && val === 'base') return [{ property: 'font-size', value: '1rem', important }, { property: 'line-height', value: '1.5rem', important }];
  if (base === 'text' && val === 'lg') return [{ property: 'font-size', value: '1.125rem', important }, { property: 'line-height', value: '1.75rem', important }];
  if (base === 'text' && val === 'xl') return [{ property: 'font-size', value: '1.25rem', important }, { property: 'line-height', value: '1.75rem', important }];
  if (base === 'text' && val === '2xl') return [{ property: 'font-size', value: '1.5rem', important }, { property: 'line-height', value: '2rem', important }];
  if (base === 'text' && val === '3xl') return [{ property: 'font-size', value: '1.875rem', important }, { property: 'line-height', value: '2.25rem', important }];
  if (base === 'text' && val === '4xl') return [{ property: 'font-size', value: '2.25rem', important }, { property: 'line-height', value: '2.5rem', important }];
  if (base === 'weight' && val === 'normal') return [{ property: 'font-weight', value: '400', important }];
  if (base === 'weight' && val === 'medium') return [{ property: 'font-weight', value: '500', important }];
  if (base === 'weight' && val === 'semibold') return [{ property: 'font-weight', value: '600', important }];
  if (base === 'weight' && val === 'bold') return [{ property: 'font-weight', value: '700', important }];

  // Border Radius
  if (base === 'radius' && val && RADIUS_MAP[val]) return [{ property: 'border-radius', value: RADIUS_MAP[val], important }];

  // Colors
  if (base === 'bg' && val === 'surface') return [{ property: 'background-color', value: `var(--${vp}-color-surface, #ffffff)`, important }];
  if (base === 'bg' && val === 'brand') return [{ property: 'background-color', value: `var(--${vp}-color-brand, #3b82f6)`, important }];
  if (base === 'fg' && val === 'primary') return [{ property: 'color', value: `var(--${vp}-color-foreground, #172033)`, important }];
  if (base === 'fg' && val === 'muted') return [{ property: 'color', value: 'rgba(100, 116, 139, 1)', important }];

  // Touch & Gesture Ergonomics (COH-AMD-1.4)
  if ((base === 'touch' && val === 'auto') || base === 'touch-auto') return [{ property: 'touch-action', value: 'auto', important }];
  if ((base === 'touch' && val === 'none') || base === 'touch-none') return [{ property: 'touch-action', value: 'none', important }];
  if ((base === 'touch-pan' && val === 'x') || base === 'touch-pan-x') return [{ property: 'touch-action', value: 'pan-x', important }];
  if ((base === 'touch-pan' && val === 'y') || base === 'touch-pan-y') return [{ property: 'touch-action', value: 'pan-y', important }];
  if ((base === 'touch' && val === 'pinch') || base === 'touch-pinch') return [{ property: 'touch-action', value: 'pinch-zoom', important }];
  if ((base === 'touch' && val === 'manipulation') || base === 'touch-manipulation') return [{ property: 'touch-action', value: 'manipulation', important }];
  if ((base === 'overscroll' && val === 'contain') || base === 'overscroll-contain') return [{ property: 'overscroll-behavior', value: 'contain', important }];
  if ((base === 'overscroll' && val === 'none') || base === 'overscroll-none') return [{ property: 'overscroll-behavior', value: 'none', important }];
  if ((base === 'tap' && val === 'transparent') || base === 'tap-transparent') return [{ property: '-webkit-tap-highlight-color', value: 'transparent', important }];
  if ((base === 'select' && val === 'none') || base === 'select-none') {
    return [
      { property: 'user-select', value: 'none', important },
      { property: '-webkit-user-select', value: 'none', important },
    ];
  }
  if ((base === 'touch' && val === 'target') || base === 'touch-target') {
    return [
      { property: 'min-inline-size', value: `var(--${vp}-touch-min, 44px)`, important },
      { property: 'min-block-size', value: `var(--${vp}-touch-min, 44px)`, important },
    ];
  }

  // Dimensions & Helpers
  if (base === 'min-h' && val === 'screen') return [{ property: 'min-height', value: '100vh', important }];
  if (base === 'w' && val === 'full') return [{ property: 'width', value: '100%', important }];
  if (base === 'h' && val === 'full') return [{ property: 'height', value: '100%', important }];

  return null;
}

function isAdaptiveOrMaterialRecipe(name: string): boolean {
  return [
    'stack', 'cluster', 'grid-auto', 'center', 'sidebar', 'flow', 'cover', 'switcher',
    'glass', 'glass-strong', 'glass-frost', 'liquid-glass'
  ].includes(name);
}

function emitReset(vp: string): string {
  return `  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    -webkit-tap-highlight-color: transparent;
  }
  body {
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    color: var(--${vp}-color-foreground, #172033);
    background-color: var(--${vp}-color-surface, #ffffff);
  }
  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
  }
  input, button, textarea, select {
    font: inherit;
  }\n`;
}

function emitTokens(vp: string, customTokens?: CoherynPluginOptions['tokens']): string {
  let out = '/* CoherynUI Design Tokens */\n:root {\n';

  // Spacing
  const spacing = customTokens?.spacing || SPACING_MAP;
  for (const [k, v] of Object.entries(spacing)) {
    out += `  --${vp}-space-${k}: ${v};\n`;
  }

  // Radius
  const radius = customTokens?.radius || RADIUS_MAP;
  for (const [k, v] of Object.entries(radius)) {
    out += `  --${vp}-radius-${k}: ${v};\n`;
  }

  // Touch Target Ergonomics (COH-AMD-1.4)
  out += `  --${vp}-touch-min: 44px;\n`;
  out += `  --${vp}-touch-comfortable: 48px;\n`;

  // Colors
  const colors = customTokens?.colors || {
    surface: '#ffffff',
    foreground: '#172033',
    brand: '#3b82f6',
  };
  for (const [k, v] of Object.entries(colors)) {
    out += `  --${vp}-color-${k}: ${v};\n`;
  }

  out += '}\n\n[data-theme="dark"] {\n';
  out += `  --${vp}-color-surface: #101827;\n`;
  out += `  --${vp}-color-foreground: #f5f7fb;\n`;
  out += `  --${vp}-color-brand: #60a5fa;\n`;
  out += '}\n';

  return out;
}

function emitRecipes(vp: string): string {
  return `  /* Adaptive Layout Primitives (§6.4) */
  .stack {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .cluster {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--${vp}-space-4, 1rem);
  }
  .grid-auto {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--${vp}-grid-min, 16rem), 1fr));
    gap: var(--${vp}-space-4, 1rem);
  }
  .center {
    box-sizing: content-box;
    margin-inline: auto;
    max-inline-size: var(--${vp}-max-width, 60ch);
  }
  .sidebar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--${vp}-space-4, 1rem);
  }

  /* Liquid Glass Shader Recipes (§4.2) */
  .glass {
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: var(--${vp}-radius-lg, 0.75rem);
  }
  .glass-strong {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(24px) saturate(200%);
    -webkit-backdrop-filter: blur(24px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: var(--${vp}-radius-xl, 1rem);
  }\n`;
}

function emitUtilityRule(classVal: string, token: ParsedToken, decls: Declaration[]): string {
  let indent = '  ';
  let prefix = '';
  let suffix = '';
  let pseudo = '';
  let themePrefix = '';

  for (const variant of token.variants) {
    switch (variant) {
      // Breakpoints
      case 'sm':
        prefix += '  @media (min-width: 640px) {\n';
        suffix = '  }\n' + suffix;
        indent += '  ';
        break;
      case 'md':
        prefix += '  @media (min-width: 768px) {\n';
        suffix = '  }\n' + suffix;
        indent += '  ';
        break;
      case 'lg':
        prefix += '  @media (min-width: 1024px) {\n';
        suffix = '  }\n' + suffix;
        indent += '  ';
        break;
      case 'xl':
        prefix += '  @media (min-width: 1280px) {\n';
        suffix = '  }\n' + suffix;
        indent += '  ';
        break;

      // Container Queries
      case 'cq':
        prefix += '  @container (min-width: 320px) {\n';
        suffix = '  }\n' + suffix;
        indent += '  ';
        break;
      case 'cq-sm':
        prefix += '  @container (min-width: 480px) {\n';
        suffix = '  }\n' + suffix;
        indent += '  ';
        break;

      // Dark Mode
      case 'dark':
        themePrefix = '[data-theme="dark"] ';
        break;

      // Pseudos
      case 'hover':
        pseudo += ':hover';
        break;
      case 'focus':
        pseudo += ':focus';
        break;
      case 'active':
        pseudo += ':active';
        break;
      case 'disabled':
        pseudo += ':disabled';
        break;
    }
  }

  const selector = `${indent}${themePrefix}.${escapeSelector(classVal)}${pseudo} {\n`;
  let body = '';
  for (const d of decls) {
    body += `${indent}  ${d.property}: ${d.value}${d.important ? ' !important' : ''};\n`;
  }
  const closing = `${indent}}\n`;

  return prefix + selector + body + closing + suffix;
}

export function compileCoherynCss(
  candidates: ExtractedCandidate[],
  options: CoherynPluginOptions = {}
): CompilerResult {
  const lp = options.layerPrefix || 'cyn';
  const vp = options.variablePrefix || 'cyn';

  const layers = [
    `${lp}.reset`,
    `${lp}.tokens`,
    `${lp}.base`,
    `${lp}.recipes`,
    `${lp}.utilities`,
  ];

  let out = `/* CoherynUI CSS Engine — Generated Stylesheet */\n`;
  out += `@layer ${layers.join(', ')};\n\n`;

  // Layer 1: Reset
  out += `@layer ${lp}.reset {\n`;
  out += emitReset(vp);
  out += `}\n\n`;

  // Layer 2: Tokens
  out += `@layer ${lp}.tokens {\n`;
  out += emitTokens(vp, options.tokens);
  out += `}\n\n`;

  // Layer 3: Base
  out += `@layer ${lp}.base {\n`;
  out += `  :root {\n    color-scheme: light dark;\n  }\n`;
  out += `}\n\n`;

  // Layer 4: Recipes
  out += `@layer ${lp}.recipes {\n`;
  out += emitRecipes(vp);
  out += `}\n\n`;

  // Layer 5: Utilities
  out += `@layer ${lp}.utilities {\n`;

  const uniqueClasses = new Set<string>();
  for (const c of candidates) {
    uniqueClasses.add(c.value);
  }

  let compiledUtilitiesCount = 0;
  for (const rawClass of Array.from(uniqueClasses).sort()) {
    if (isAdaptiveOrMaterialRecipe(rawClass)) {
      continue;
    }

    const token = parseClassToken(rawClass);
    const decls = resolveDeclarations(token, vp);

    if (decls && decls.length > 0) {
      out += emitUtilityRule(rawClass, token, decls);
      compiledUtilitiesCount++;
    }
  }

  out += `}\n`;

  return {
    css: out,
    classesCount: compiledUtilitiesCount,
    layers,
  };
}
