/**
 * CoherynUI Webpack Plugin — Source Loader & Virtual CSS Provider
 */

import { extractCandidates, shouldScanFile } from './scanner';
import { CoherynWebpackPlugin } from './index';

export default function coherynLoader(this: any, content: string): string {
  const options = this.getOptions?.() || {};
  const resourcePath = this.resourcePath || '';

  // 1. If this is the virtual module, emit the compiled stylesheet
  if (
    resourcePath.endsWith('coherynui.css') ||
    resourcePath.includes('virtual:coherynui.css')
  ) {
    const pluginInstance = CoherynWebpackPlugin.getInstance();
    if (pluginInstance) {
      return pluginInstance.getCompiledCss();
    }
    return '/* CoherynUI — No active plugin instance found */';
  }

  // 2. Otherwise scan source file for class candidates
  if (shouldScanFile(resourcePath)) {
    const pluginInstance = CoherynWebpackPlugin.getInstance();
    if (pluginInstance) {
      const candidates = extractCandidates(content, resourcePath, options.classPrefix);
      pluginInstance.addCandidates(candidates);
    }
  }

  // Return original content untouched so subsequent loaders (babel, ts-loader, etc.) process it normally
  return content;
}
