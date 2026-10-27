/**
 * CoherynUI Vite Plugin — Comprehensive Conformance & Integration Tests
 */

import { coherynui } from '../src/index';
import { extractCandidates, shouldScanFile } from '../src/scanner';
import { compileCoherynCss } from '../src/compiler';
import { isVirtualModuleId, toResolvedVirtualId } from '../src/virtual-module';

describe('@coherynui/vite-plugin', () => {
  it('initializes with default settings and correct plugin name', () => {
    const plugin = coherynui();
    expect(plugin.name).toBe('coherynui:vite-plugin');
    expect(plugin.enforce).toBe('pre');
  });

  describe('Virtual Module Resolution', () => {
    const plugin = coherynui();

    it('resolves virtual:coherynui.css to private resolved ID', () => {
      const resolved = plugin.resolveId('virtual:coherynui.css');
      expect(resolved).toBe('\0virtual:coherynui.css');
    });

    it('resolves alias coherynui.css to private resolved ID', () => {
      const resolved = plugin.resolveId('coherynui.css');
      expect(resolved).toBe('\0virtual:coherynui.css');
    });

    it('returns null for unrelated files', () => {
      expect(plugin.resolveId('./src/main.ts')).toBeNull();
      expect(plugin.resolveId('react')).toBeNull();
    });

    it('supports custom virtualModuleId', () => {
      const customPlugin = coherynui({ virtualModuleId: 'virtual:custom.css' });
      expect(customPlugin.resolveId('virtual:custom.css')).toBe('\0virtual:custom.css');
      expect(customPlugin.resolveId('virtual:coherynui.css')).toBeNull();
    });
  });

  describe('Candidate Extraction & File Filtering', () => {
    it('accurately identifies scan-eligible web file extensions', () => {
      expect(shouldScanFile('src/App.tsx')).toBe(true);
      expect(shouldScanFile('src/components/Header.vue')).toBe(true);
      expect(shouldScanFile('src/routes/+page.svelte')).toBe(true);
      expect(shouldScanFile('index.html')).toBe(true);
      expect(shouldScanFile('docs/guide.mdx')).toBe(true);

      // Excluded paths
      expect(shouldScanFile('node_modules/pkg/index.js')).toBe(false);
      expect(shouldScanFile('.git/config')).toBe(false);
      expect(shouldScanFile('dist/bundle.js')).toBe(false);
    });

    it('extracts class names from JSX/TSX and HTML attributes', () => {
      const jsx = `
        <div className="flex items-center justify-between p-6 radius-xl bg-surface">
          <button class="touch-target tap-transparent bg-brand fg-primary hover:opacity-90">
            Click
          </button>
          <span className={\`text-lg weight-bold \${active ? 'fg-primary' : 'fg-muted'}\`}>Title</span>
        </div>
      `;

      const candidates = extractCandidates(jsx, 'App.tsx');
      const values = new Set(candidates.map((c) => c.value));

      expect(values.has('flex')).toBe(true);
      expect(values.has('items-center')).toBe(true);
      expect(values.has('justify-between')).toBe(true);
      expect(values.has('p-6')).toBe(true);
      expect(values.has('radius-xl')).toBe(true);
      expect(values.has('bg-surface')).toBe(true);
      expect(values.has('touch-target')).toBe(true);
      expect(values.has('tap-transparent')).toBe(true);
      expect(values.has('bg-brand')).toBe(true);
      expect(values.has('text-lg')).toBe(true);
      expect(values.has('weight-bold')).toBe(true);
      expect(values.has('fg-primary')).toBe(true);
      expect(values.has('fg-muted')).toBe(true);
    });

    it('respects optional classPrefix filter', () => {
      const code = `<div class="cyn-flex cyn-p-4 bg-red other-class"></div>`;
      const candidates = extractCandidates(code, 'App.tsx', 'cyn-');
      const values = candidates.map((c) => c.value);

      expect(values).toEqual(['cyn-flex', 'cyn-p-4']);
    });
  });

  describe('CSS Compilation & Cascade Layers', () => {
    it('compiles valid W3C 5-layer hierarchy and touch ergonomics', () => {
      const candidates = [
        { value: 'flex', file: 'test.html' },
        { value: 'items-center', file: 'test.html' },
        { value: 'p-6', file: 'test.html' },
        { value: 'touch-none', file: 'test.html' },
        { value: 'touch-pan-y', file: 'test.html' },
        { value: 'touch-target', file: 'test.html' },
        { value: 'tap-transparent', file: 'test.html' },
        { value: 'select-none', file: 'test.html' },
        { value: 'overscroll-contain', file: 'test.html' },
        { value: 'stack', file: 'test.html' },
        { value: 'glass', file: 'test.html' },
      ];

      const result = compileCoherynCss(candidates);

      // Layer declaration contract
      expect(result.css).toContain(
        '@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;'
      );

      // Reset contract
      expect(result.css).toContain('@layer cyn.reset');
      expect(result.css).toContain('-webkit-tap-highlight-color: transparent;');

      // Tokens contract
      expect(result.css).toContain('@layer cyn.tokens');
      expect(result.css).toContain('--cyn-touch-min: 44px;');
      expect(result.css).toContain('--cyn-touch-comfortable: 48px;');
      expect(result.css).toContain('--cyn-space-6: 1.5rem;');

      // Recipes contract
      expect(result.css).toContain('@layer cyn.recipes');
      expect(result.css).toContain('.stack {');
      expect(result.css).toContain('.glass {');

      // Utilities contract
      expect(result.css).toContain('@layer cyn.utilities');
      expect(result.css).toContain('.flex {\n    display: flex;\n  }');
      expect(result.css).toContain('.touch-none {\n    touch-action: none;\n  }');
      expect(result.css).toContain('.touch-pan-y {\n    touch-action: pan-y;\n  }');
      expect(result.css).toContain('.overscroll-contain {\n    overscroll-behavior: contain;\n  }');
      expect(result.css).toContain('.tap-transparent {\n    -webkit-tap-highlight-color: transparent;\n  }');
      expect(result.css).toContain('.select-none {\n    user-select: none;\n    -webkit-user-select: none;\n  }');
      expect(result.css).toContain('min-inline-size: var(--cyn-touch-min, 44px);');
    });

    it('supports custom layerPrefix and variablePrefix configuration', () => {
      const candidates = [{ value: 'flex', file: 'test.html' }, { value: 'touch-target', file: 'test.html' }];
      const result = compileCoherynCss(candidates, {
        layerPrefix: 'coheryn',
        variablePrefix: 'coheryn',
      });

      expect(result.css).toContain(
        '@layer coheryn.reset, coheryn.tokens, coheryn.base, coheryn.recipes, coheryn.utilities;'
      );
      expect(result.css).toContain('--coheryn-touch-min: 44px;');
      expect(result.css).toContain('min-inline-size: var(--coheryn-touch-min, 44px);');
    });

    it('compiles arbitrary values and variant prefixes correctly', () => {
      const candidates = [
        { value: 'p-[27px]', file: 'test.html' },
        { value: 'bg-[#172033]', file: 'test.html' },
        { value: 'hover:bg-brand', file: 'test.html' },
        { value: 'sm:p-4', file: 'test.html' },
        { value: 'dark:bg-surface', file: 'test.html' },
      ];

      const result = compileCoherynCss(candidates);

      expect(result.css).toContain('.p-\\[27px\\] {\n    padding: 27px;\n  }');
      expect(result.css).toContain('.bg-\\[\\#172033\\] {\n    background-color: #172033;\n  }');
      expect(result.css).toContain('.hover\\:bg-brand:hover');
      expect(result.css).toContain('@media (min-width: 640px)');
      expect(result.css).toContain('[data-theme="dark"] .dark\\:bg-surface');
    });
  });

  describe('Hot Module Replacement (HMR) Simulation', () => {
    it('triggers HMR module invalidation and websocket dispatch on new classes', async () => {
      const plugin = coherynui();

      let invalidatedMod: any = null;
      let sentWsMessage: any = null;

      const mockServer = {
        moduleGraph: {
          getModuleById: (id: string) => ({
            id,
            url: '/@id/' + id,
          }),
          invalidateModule: (mod: any) => {
            invalidatedMod = mod;
          },
        },
        ws: {
          send: (msg: any) => {
            sentWsMessage = msg;
          },
        },
      };

      plugin.configureServer(mockServer);

      // Initial load
      plugin.transform('<div class="flex p-4"></div>', 'src/App.tsx');
      const initialCss = plugin.load('\0virtual:coherynui.css');
      expect(initialCss).toContain('.flex');

      // Update introducing new touch-action and layout classes
      await plugin.handleHotUpdate({
        file: 'src/App.tsx',
        read: () => '<div class="flex p-4 touch-none stack"></div>',
        server: mockServer,
      });

      // Assert HMR module invalidation occurred
      expect(invalidatedMod).not.toBeNull();
      expect(invalidatedMod.id).toBe('\0virtual:coherynui.css');

      // Assert websocket notification sent
      expect(sentWsMessage).not.toBeNull();
      expect(sentWsMessage.type).toBe('update');
      expect(sentWsMessage.updates[0].type).toBe('js-update');

      // New load returns updated stylesheet
      const updatedCss = plugin.load('\0virtual:coherynui.css');
      expect(updatedCss).toContain('.touch-none');
      expect(updatedCss).toContain('.stack');
    });
  });
});
