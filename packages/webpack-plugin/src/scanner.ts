/**
 * CoherynUI Webpack Plugin — Source Scanner & Candidate Extractor
 */

import { ExtractedCandidate } from './types';

const SCANNABLE_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.jsx',
  '.tsx',
  '.vue',
  '.svelte',
  '.astro',
  '.md',
  '.mdx',
  '.js',
  '.ts',
]);

const CLASS_ATTR_REGEX = /(?:class|className)\s*=\s*(?:["']([^"']*)["']|\{`([^`]*)`\}|\{["']([^"']*)["']\})/g;
const TOKEN_SPLIT_REGEX = /[\s\r\n\t]+/;

export function shouldScanFile(filePath: string): boolean {
  if (
    filePath.includes('node_modules') ||
    filePath.includes('.git') ||
    filePath.includes('dist') ||
    filePath.includes('.next')
  ) {
    return false;
  }
  const lastDot = filePath.lastIndexOf('.');
  if (lastDot === -1) return false;
  const ext = filePath.slice(lastDot).toLowerCase();
  return SCANNABLE_EXTENSIONS.has(ext);
}

export function extractCandidates(
  code: string,
  filePath: string,
  classPrefix?: string
): ExtractedCandidate[] {
  const candidates: ExtractedCandidate[] = [];
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  CLASS_ATTR_REGEX.lastIndex = 0;

  while ((match = CLASS_ATTR_REGEX.exec(code)) !== null) {
    const rawContent = match[1] || match[2] || match[3] || '';
    const tokens = rawContent.split(TOKEN_SPLIT_REGEX);

    for (const rawToken of tokens) {
      let token = rawToken.trim();

      // Clean template interpolation syntax ${...}
      if (token.startsWith('${') || token.endsWith('}')) {
        token = token.replace(/^\$\{[^}]*\}?/, '').replace(/\}$/, '');
      }

      if (!token || token.length < 2) continue;

      if (classPrefix && !token.startsWith(classPrefix)) {
        continue;
      }

      // Filter out invalid CSS class characters or JS code artifacts
      if (/^[a-zA-Z0-9_\-:[\]/%.#!]+$/.test(token) && !seen.has(token)) {
        seen.add(token);
        candidates.push({
          value: token,
          file: filePath,
        });
      }
    }
  }

  return candidates;
}
