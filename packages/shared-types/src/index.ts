/**
 * CoherynUI Design Tokens & Shared Types (@coherynui/tokens)
 *
 * Authoritative TypeScript definitions, schemas, and token dictionaries
 * for the Coheryn CSS Engine, bundler plugins, and runtime libraries.
 */

export interface CoherynThemeTokens {
  surface?: string;
  foreground?: string;
  brand?: string;
  [key: string]: string | undefined;
}

export interface TouchTokens {
  /** WCAG 2.2 SC 2.5.8 Target Size Minimum */
  min: '44px';
  /** Ergonomic comfortable touch target */
  comfortable: '48px';
}

export interface SpacingScale {
  '0': '0px';
  '1': '0.25rem';
  '2': '0.5rem';
  '3': '0.75rem';
  '4': '1rem';
  '5': '1.25rem';
  '6': '1.5rem';
  '8': '2rem';
  '10': '2.5rem';
  '12': '3rem';
  '16': '4rem';
  '20': '5rem';
  '24': '6rem';
}

export interface RadiusScale {
  none: '0px';
  sm: '0.375rem';
  md: '0.5rem';
  lg: '0.75rem';
  xl: '1rem';
  '2xl': '1.5rem';
  full: '9999px';
}

export interface MotionSpringPresets {
  default: { stiffness: 280; damping: 24; mass: 1 };
  gentle: { stiffness: 170; damping: 26; mass: 1 };
  wobbly: { stiffness: 180; damping: 12; mass: 1 };
  stiff: { stiffness: 400; damping: 30; mass: 1 };
}

export const TOUCH_TOKENS: TouchTokens = {
  min: '44px',
  comfortable: '48px',
};

export const SPACING_TOKENS: SpacingScale = {
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

export const RADIUS_TOKENS: RadiusScale = {
  none: '0px',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

export const MOTION_PRESETS: MotionSpringPresets = {
  default: { stiffness: 280, damping: 24, mass: 1 },
  gentle: { stiffness: 170, damping: 26, mass: 1 },
  wobbly: { stiffness: 180, damping: 12, mass: 1 },
  stiff: { stiffness: 400, damping: 30; mass: 1 },
};

export interface RenamingManifestJSON {
  version: string;
  mode: 'off' | 'safe' | 'aggressive';
  mappings: Record<string, string>;
  reverseMappings: Record<string, string>;
}

export interface CompilerDiagnostic {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  help?: string;
  file?: string;
  line?: number;
  column?: number;
}
