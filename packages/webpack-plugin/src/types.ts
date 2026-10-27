/**
 * CoherynUI Webpack Plugin — Type Definitions
 */

export interface CoherynPluginOptions {
  /**
   * The cascade layer prefix. Defaults to 'cyn'.
   * Resulting layers: @layer <prefix>.reset, <prefix>.tokens, <prefix>.base, <prefix>.recipes, <prefix>.utilities;
   */
  layerPrefix?: string;

  /**
   * The CSS custom property variable prefix. Defaults to 'cyn' (--cyn-*).
   */
  variablePrefix?: string;

  /**
   * Filter class names by prefix. If defined, only classes starting with this prefix are compiled.
   */
  classPrefix?: string;

  /**
   * Glob patterns of source files to scan for utility classes.
   */
  scan?: string[];

  /**
   * The virtual module identifier to resolve to the compiled stylesheet.
   * Defaults to 'coherynui.css' and 'virtual:coherynui.css'.
   */
  virtualModuleId?: string;

  /**
   * Design token overrides.
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
  classesCount: number;
  layers: string[];
}
