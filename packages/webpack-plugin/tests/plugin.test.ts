/**
 * CoherynUI Webpack Plugin — Unit & Conformance Tests
 */

import { CoherynWebpackPlugin, withCoheryn } from '../src/index';
import { extractCandidates, shouldScanFile } from '../src/scanner';
import { compileCoherynCss } from '../src/compiler';

describe('@coherynui/webpack-plugin', () => {
  it('initializes with default options and singleton access', () => {
    const plugin = new CoherynWebpackPlugin();
    expect(CoherynWebpackPlugin.pluginName).toBe('CoherynWebpackPlugin');
    expect(plugin.options.layerPrefix).toBe('cyn');
    expect(plugin.options.variablePrefix).toBe('cyn');
    expect(CoherynWebpackPlugin.getInstance()).toBe(plugin);
  });

  describe('Candidate Extraction & File Filtering', () => {
    it('correctly filters scan-eligible file paths', () => {
      expect(shouldScanFile('src/components/Header.tsx')).toBe(true);
      expect(shouldScanFile('pages/index.jsx')).toBe(true);
      expect(shouldScanFile('public/index.html')).toBe(true);
      expect(shouldScanFile('docs/intro.mdx')).toBe(true);

      expect(shouldScanFile('node_modules/pkg/index.js')).toBe(false);
      expect(shouldScanFile('.next/static/chunks/main.js')).toBe(false);
      expect(shouldScanFile('dist/bundle.js')).toBe(false);
    });

    it('extracts class names from JSX/TSX and HTML attributes', () => {
      const code = `
        <div className="flex items-center justify-between p-6 radius-xl bg-surface">
          <button class="touch-target tap-transparent bg-brand fg-primary">
            Submit
          </button>
          <span className="text-lg weight-bold fg-muted">Title</span>
        </div>
      `;

      const candidates = extractCandidates(code, 'App.tsx');
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
      expect(values.has('fg-primary')).toBe(true);
    });
  });

  describe('W3C 5-Cascade Layer Compilation & Touch Ergonomics', () => {
    it('compiles strict 5-layer hierarchy and touch ergonomic rules', () => {
      const candidates = [
        { value: 'flex', file: 'test.html' },
        { value: 'items-center', file: 'test.html' },
        { value: 'p-4', file: 'test.html' },
        { value: 'touch-none', file: 'test.html' },
        { value: 'touch-target', file: 'test.html' },
        { value: 'tap-transparent', file: 'test.html' },
        { value: 'select-none', file: 'test.html' },
      ];

      const result = compileCoherynCss(candidates, { layerPrefix: 'cyn', variablePrefix: 'cyn' });

      // Layer declaration
      expect(result.css).toContain('@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;');

      // Reset
      expect(result.css).toContain('@layer cyn.reset');
      expect(result.css).toContain('-webkit-tap-highlight-color: transparent');

      // Tokens & 44px WCAG touch contract
      expect(result.css).toContain('@layer cyn.tokens');
      expect(result.css).toContain('--cyn-touch-min: 44px;');

      // Recipes
      expect(result.css).toContain('@layer cyn.recipes');
      expect(result.css).toContain('.glass');
      expect(result.css).toContain('.stack');

      // Utilities & Touch Ergonomics (COH-AMD-1.4)
      expect(result.css).toContain('@layer cyn.utilities');
      expect(result.css).toContain('touch-action: none');
      expect(result.css).toContain('min-inline-size: var(--cyn-touch-min, 44px)');
      expect(result.css).toContain('-webkit-tap-highlight-color: transparent');
      expect(result.css).toContain('user-select: none');
    });
  });

  describe('Next.js Integration Helper (withCoheryn)', () => {
    it('wraps Next.js config and registers Webpack plugin', () => {
      const baseConfig = {
        reactStrictMode: true,
      };

      const enhanced = withCoheryn(baseConfig, { layerPrefix: 'cyn' });
      expect(enhanced.reactStrictMode).toBe(true);
      expect(typeof enhanced.webpack).toBe('function');

      const mockWebpackConfig: any = { plugins: [] };
      enhanced.webpack(mockWebpackConfig, {});

      expect(mockWebpackConfig.plugins.length).toBe(1);
      expect(mockWebpackConfig.plugins[0]).toBeInstanceOf(CoherynWebpackPlugin);
    });
  });
});
