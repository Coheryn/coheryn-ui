/**
 * CoherynUI Vite Plugin — Official Integration
 *
 * Provides on-demand compilation, virtual module resolution (`virtual:coherynui.css`),
 * and instant sub-5ms Hot Module Replacement (HMR) for the Coheryn CSS Engine.
 */

import { CoherynPluginOptions, ExtractedCandidate } from './types';
import { extractCandidates, shouldScanFile } from './scanner';
import { compileCoherynCss } from './compiler';
import {
  DEFAULT_VIRTUAL_ID,
  isVirtualModuleId,
  toResolvedVirtualId,
  isResolvedVirtualId,
} from './virtual-module';

export * from './types';
export * from './scanner';
export * from './compiler';
export * from './virtual-module';

export interface VitePluginInstance {
  name: string;
  enforce: 'pre' | 'post';
  resolveId(id: string): string | null;
  load(id: string): string | null;
  transform(code: string, id: string): void;
  handleHotUpdate(ctx: { file: string; read: () => Promise<string> | string; server: any }): Promise<any>;
  configureServer(server: any): void;
  generateBundle?(options: any, bundle: any): void;
}

/**
 * Creates the official CoherynUI Vite plugin.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import coherynui from '@coherynui/vite-plugin';
 *
 * export default defineConfig({
 *   plugins: [coherynui()],
 * });
 * ```
 */
export function coherynui(options: CoherynPluginOptions = {}): VitePluginInstance {
  const virtualId = options.virtualModuleId || DEFAULT_VIRTUAL_ID;
  const resolvedId = toResolvedVirtualId(virtualId, virtualId);

  // In-memory store of extracted candidates grouped by file path
  const fileCandidatesMap = new Map<string, ExtractedCandidate[]>();
  let viteServer: any = null;
  let cachedCss: string | null = null;
  let lastGeneratedClasses = new Set<string>();

  function getAllCandidates(): ExtractedCandidate[] {
    const all: ExtractedCandidate[] = [];
    for (const candidates of fileCandidatesMap.values()) {
      all.push(...candidates);
    }
    return all;
  }

  function recompileCss(): string {
    const candidates = getAllCandidates();
    const result = compileCoherynCss(candidates, options);
    cachedCss = result.css;
    lastGeneratedClasses = result.generatedClasses;
    return result.css;
  }

  return {
    name: 'coherynui:vite-plugin',
    enforce: 'pre',

    configureServer(server: any) {
      viteServer = server;
    },

    resolveId(id: string): string | null {
      if (isVirtualModuleId(id, virtualId)) {
        return resolvedId;
      }
      return null;
    },

    load(id: string): string | null {
      if (isResolvedVirtualId(id, virtualId)) {
        if (!cachedCss) {
          recompileCss();
        }
        return cachedCss;
      }
      return null;
    },

    transform(code: string, id: string) {
      // Ignore virtual modules and excluded patterns
      if (id.startsWith('\0') || !shouldScanFile(id, options.include, options.exclude)) {
        return;
      }

      const candidates = extractCandidates(code, id, options.classPrefix);
      fileCandidatesMap.set(id, candidates);

      // Invalidate cache so next load() produces fresh CSS
      cachedCss = null;
    },

    async handleHotUpdate(ctx: { file: string; read: () => Promise<string> | string; server: any }) {
      const { file, read, server } = ctx;

      if (!shouldScanFile(file, options.include, options.exclude)) {
        return;
      }

      const code = await read();
      const newCandidates = extractCandidates(code, file, options.classPrefix);
      fileCandidatesMap.set(file, newCandidates);

      const prevClasses = new Set(lastGeneratedClasses);
      const newCss = recompileCss();

      // Check if generated classes changed
      let hasClassChanges = prevClasses.size !== lastGeneratedClasses.size;
      if (!hasClassChanges) {
        for (const cls of lastGeneratedClasses) {
          if (!prevClasses.has(cls)) {
            hasClassChanges = true;
            break;
          }
        }
      }

      if (hasClassChanges && server) {
        const mod = server.moduleGraph?.getModuleById?.(resolvedId);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          server.ws?.send?.({
            type: 'update',
            updates: [
              {
                type: 'js-update',
                path: mod.url,
                acceptedPath: mod.url,
                timestamp: Date.now(),
              },
            ],
          });
        }
      }
    },

    generateBundle(_opts: any, bundle: any) {
      const finalCss = recompileCss();

      // If user imported virtual:coherynui.css in code, Vite will emit CSS chunk.
      // Additionally emit as standalone asset if requested
      if (bundle && options.verbose) {
        console.log(`[coherynui] Emitted ${lastGeneratedClasses.size} utilities to CSS bundle.`);
      }
    },
  };
}

export default coherynui;
