/**
 * Shared types for CoherynUI CSS runtimes and plugins.
 */

export interface CoherynThemeTokens {
  surface?: string;
  foreground?: string;
  brand?: string;
  [key: string]: string | undefined;
}

export interface RenamingManifestJSON {
  version: string;
  mode: 'off' | 'safe' | 'aggressive';
  mappings: Record<string, string>;
  reverseMappings: Record<string, string>;
}
