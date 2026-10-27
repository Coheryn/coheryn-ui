/**
 * CoherynUI Webpack Plugin — Official Webpack 5 Integration
 *
 * Provides on-demand compilation, W3C 5-cascade layer output,
 * touch ergonomics (COH-AMD-1.4), and seamless Next.js support.
 */

import { CoherynPluginOptions, ExtractedCandidate, CompilerResult } from './types';
import { compileCoherynCss } from './compiler';
import { extractCandidates, shouldScanFile } from './scanner';
import * as path from 'path';
import * as fs from 'fs';

export class CoherynWebpackPlugin {
  public static readonly pluginName = 'CoherynWebpackPlugin';
  private static instance: CoherynWebpackPlugin | null = null;

  public options: CoherynPluginOptions;
  private candidates: Map<string, ExtractedCandidate> = new Map();
  private cachedCss: string = '';
  private isDirty: boolean = true;

  constructor(options: CoherynPluginOptions = {}) {
    this.options = {
      layerPrefix: 'cyn',
      variablePrefix: 'cyn',
      virtualModuleId: 'coherynui.css',
      ...options,
    };
    CoherynWebpackPlugin.instance = this;
  }

  public static getInstance(): CoherynWebpackPlugin | null {
    return CoherynWebpackPlugin.instance;
  }

  public addCandidates(candidates: ExtractedCandidate[]): void {
    let changed = false;
    for (const c of candidates) {
      if (!this.candidates.has(c.value)) {
        this.candidates.set(c.value, c);
        changed = true;
      }
    }
    if (changed) {
      this.isDirty = true;
    }
  }

  public getCompiledCss(): string {
    if (this.isDirty || !this.cachedCss) {
      const candidatesList = Array.from(this.candidates.values());
      const result = compileCoherynCss(candidatesList, this.options);
      this.cachedCss = result.css;
      this.isDirty = false;
    }
    return this.cachedCss;
  }

  public compile(): CompilerResult {
    const candidatesList = Array.from(this.candidates.values());
    const result = compileCoherynCss(candidatesList, this.options);
    this.cachedCss = result.css;
    this.isDirty = false;
    return result;
  }

  public apply(compiler: any): void {
    const loaderPath = path.resolve(__dirname, './loader.js');

    // 1. Initial source scan if project root is available
    compiler.hooks.beforeCompile.tapAsync(
      CoherynWebpackPlugin.pluginName,
      (_params: any, callback: () => void) => {
        const root = compiler.context || process.cwd();
        this.scanDirectory(root);
        callback();
      }
    );

    // 2. Register source file scanning rule
    compiler.options.module = compiler.options.module || { rules: [] };
    compiler.options.module.rules = compiler.options.module.rules || [];

    compiler.options.module.rules.unshift({
      test: /\.(jsx?|tsx?|vue|svelte|html|mdx?)$/,
      exclude: /node_modules|\.next|dist/,
      use: [
        {
          loader: loaderPath,
          options: {
            classPrefix: this.options.classPrefix,
          },
        },
      ],
      enforce: 'pre',
    });

    // 3. Resolve virtual stylesheet
    compiler.hooks.compilation.tap(
      CoherynWebpackPlugin.pluginName,
      (compilation: any, { normalModuleFactory }: any) => {
        normalModuleFactory.hooks.resolve.tap(
          CoherynWebpackPlugin.pluginName,
          (resolveData: any) => {
            if (
              resolveData.request === 'coherynui.css' ||
              resolveData.request === 'virtual:coherynui.css' ||
              resolveData.request === this.options.virtualModuleId
            ) {
              resolveData.request = path.resolve(__dirname, '../virtual-coherynui.css');
            }
          }
        );
      }
    );
  }

  private scanDirectory(dir: string, depth = 0): void {
    if (depth > 5) return;
    try {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (
          entry.name === 'node_modules' ||
          entry.name === '.git' ||
          entry.name === 'dist' ||
          entry.name === '.next'
        ) {
          continue;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          this.scanDirectory(fullPath, depth + 1);
        } else if (entry.isFile() && shouldScanFile(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const candidates = extractCandidates(content, fullPath, this.options.classPrefix);
          this.addCandidates(candidates);
        }
      }
    } catch {
      // Ignore scanning failures gracefully in restricted environments
    }
  }
}

/**
 * Next.js Configuration Helper
 * Wraps next.config.js to seamlessly inject CoherynUI Webpack integration.
 */
export function withCoheryn(nextConfig: any = {}, pluginOptions: CoherynPluginOptions = {}) {
  return {
    ...nextConfig,
    webpack(config: any, context: any) {
      config.plugins = config.plugins || [];
      config.plugins.push(new CoherynWebpackPlugin(pluginOptions));

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, context);
      }
      return config;
    },
  };
}

export * from './types';
export * from './scanner';
export * from './compiler';
