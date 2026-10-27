/**
 * CoherynUI Vite Plugin — Virtual Module Handler
 *
 * Manages virtual module resolution for `virtual:coherynui.css` and `coherynui.css`.
 */

export const DEFAULT_VIRTUAL_ID = 'virtual:coherynui.css';
export const RESOLVED_VIRTUAL_PREFIX = '\0';

export function isVirtualModuleId(id: string, customId = DEFAULT_VIRTUAL_ID): boolean {
  return (
    id === customId ||
    id === 'coherynui.css' ||
    id === `/${customId}` ||
    id.startsWith(`${customId}?`)
  );
}

export function toResolvedVirtualId(id: string, customId = DEFAULT_VIRTUAL_ID): string {
  const base = isVirtualModuleId(id, customId) ? customId : id;
  return `${RESOLVED_VIRTUAL_PREFIX}${base}`;
}

export function isResolvedVirtualId(id: string, customId = DEFAULT_VIRTUAL_ID): boolean {
  return (
    id === `${RESOLVED_VIRTUAL_PREFIX}${customId}` ||
    id === `${RESOLVED_VIRTUAL_PREFIX}coherynui.css` ||
    id.startsWith(`${RESOLVED_VIRTUAL_PREFIX}${customId}?`)
  );
}
