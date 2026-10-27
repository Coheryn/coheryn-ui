/**
 * CoherynUI Vite Plugin — Source Scanner & Candidate Extractor
 *
 * Scans web template code (HTML, JSX, TSX, Vue, Svelte) and extracts
 * utility class candidates, layout recipes, variants, and arbitrary values.
 */

import { ExtractedCandidate } from './types';

const CLASS_ATTR_REGEX = /(?:class|className)\s*=\s*(?:["'`]([^"'`]+)["'`]|{`([^`]+)`})/g;
const STRING_LITERAL_REGEX = /["'`]\s*([a-zA-Z0-9_:\-[\]%#.,/ ]{2,})\s*["'`]/g;

// Standard web file extensions for source discovery
export const DEFAULT_INCLUDE_PATTERNS = [
  /\.(html|jsx|tsx|vue|svelte|astro|mdx?)$/,
];

export const DEFAULT_EXCLUDE_PATTERNS = [
  /[\\/]node_modules[\\/]/,
  /[\\/]\.git[\\/]/,
  /[\\/]dist[\\/]/,
  /[\\/]\.next[\\/]/,
  /[\\/]\.nuxt[\\/]/,
  /[\\/]\.output[\\/]/,
];

/**
 * Fast token validator filtering out common code tokens that are definitely not CSS classes.
 */
function isValidCandidate(token: string): boolean {
  if (!token || token.length < 2 || token.length > 80) return false;
  // Discard pure numbers, standard JS keywords, and symbols
  if (/^\d+$/.test(token)) return false;
  if (/^(true|false|null|undefined|const|let|var|function|return|import|export|from|default)$/.test(token)) return false;
  // Discard URLs and paths
  if (token.startsWith('http://') || token.startsWith('https://') || token.startsWith('/')) return false;
  // Discard JS operators
  if (/[;=()<>{}]/.test(token)) return false;

  return true;
}

/**
 * Extracts class candidates from source code text.
 */
export function extractCandidates(
  code: string,
  filePath: string,
  classPrefix = ''
): ExtractedCandidate[] {
  const candidates: ExtractedCandidate[] = [];
  const seen = new Set<string>();

  function addCandidate(token: string) {
    const trimmed = token.trim();
    if (!isValidCandidate(trimmed)) return;

    if (classPrefix && !trimmed.startsWith(classPrefix)) {
      return;
    }

    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      candidates.push({
        value: trimmed,
        file: filePath,
      });
    }
  }

  // Pass 1: Explicit class/className attributes
  let match: RegExpExecArray | null;
  while ((match = CLASS_ATTR_REGEX.exec(code)) !== null) {
    const classBlob = match[1] || match[2] || '';
    for (const token of classBlob.split(/\s+/)) {
      if (token) addCandidate(token);
    }
  }

  // Pass 2: Quoted string literals in JSX/TS/Vue (catches ternary branches, helper functions, arrays)
  let strMatch: RegExpExecArray | null;
  while ((strMatch = STRING_LITERAL_REGEX.exec(code)) !== null) {
    const rawVal = strMatch[1] || '';
    // If the string contains spaces, it's likely a class list
    if (rawVal.includes(' ')) {
      for (const token of rawVal.split(/\s+/)) {
        if (token) addCandidate(token);
      }
    } else {
      addCandidate(rawVal);
    }
  }

  return candidates;
}

/**
 * Determines whether a file path should be processed by the plugin scanner.
 */
export function shouldScanFile(
  filePath: string,
  include: (string | RegExp)[] = DEFAULT_INCLUDE_PATTERNS,
  exclude: (string | RegExp)[] = DEFAULT_EXCLUDE_PATTERNS
): boolean {
  for (const pattern of exclude) {
    if (typeof pattern === 'string' ? filePath.includes(pattern) : pattern.test(filePath)) {
      return false;
    }
  }

  for (const pattern of include) {
    if (typeof pattern === 'string' ? filePath.includes(pattern) : pattern.test(filePath)) {
      return true;
    }
  }

  return false;
}
