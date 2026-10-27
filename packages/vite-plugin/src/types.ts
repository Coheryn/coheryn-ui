/**
 * CoherynUI Vite Plugin — Type Definitions & Configuration Schema
 */

export interface CoherynPluginOptions {
  /**
   * Virtual module identifier used to import CoherynUI CSS.
   * @default 'virtual:coherynui.css'
   */
  virtualModuleId?: string;

  /**
   * Path patterns to include for class candidate extraction.
   * Defaults to scanning web files (.html, .jsx, .tsx, .vue, .svelte, .astro, .mdx).
   */
  include?: (string | RegExp)[];

  /**
   * Path patterns to exclude from candidate extraction.
   * Defaults to node_modules, dist, .git, and build artifacts.
   */
  exclude?: (string | RegExp)[];

  /**
   * Cascade layer namespace prefix.
   * Configures `@layer <prefix>.reset, <prefix>.tokens...`
   * @default 'cyn'
   */
  layerPrefix?: string;

  /**
   * CSS custom property variable prefix.
   * Configures `--<prefix>-color-surface, --<prefix>-touch-min...`
   * @default 'cyn'
   */
  variablePrefix?: string;

  /**
   * Optional class name prefix required for candidate recognition.
   * e.g., 'ui-' matches '.ui-flex', '.ui-stack'.
   * @default ''
   */
  classPrefix?: string;

  /**
   * Enable production class mangling & minification in build mode.
   * @default false
   */
  minify?: boolean;

  /**
   * Enable verbose console diagnostics during compilation & HMR.
   * @default false
   */
  verbose?: boolean;

  /**
   * Custom theme tokens override.
   */
  tokens?: {
    spacing?: Record<string, string>;
    radius?: Record<string, string>;
    colors?: Record<string, string>;
  };
}

export interface ExtractedCandidate {
  value: string;
  file: string;
  line?: number;
  column?: number;
}

export interface CompilerResult {
  css: string;
  generatedClasses: Set<string>;
  diagnostics: Array<{
    code: string;
    message: string;
    severity: 'warning' | 'error';
    suggestion?: string;
  }>;
}

export interface VitePluginHookContext {
  id: string;
  code?: string;
}
