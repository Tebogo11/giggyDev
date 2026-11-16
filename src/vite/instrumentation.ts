import { transformWithEsbuild } from 'vite';
import type { SourceRegistry } from './source-registry';

export const jsxRuntimeId = 'virtual:giggydev/jsx-dev-runtime';
export const resolvedJsxRuntimeId = '\0giggydev:jsx-runtime';

// Only intrinsic DOM elements are tagged. No React private fields are required.
export const jsxRuntimeCode = `
import { jsxDEV as original } from 'react/jsx-dev-runtime';
export { Fragment } from 'react/jsx-dev-runtime';
export function jsxDEV(type, props, key, isStatic, source, self) {
  const tagged = typeof type === 'string' && source ? {
    ...props,
    'data-giggy-source': JSON.stringify({ id: source.fileName, line: source.lineNumber, column: source.columnNumber })
  } : props;
  return original(type, tagged, key, isStatic, source, self);
}
`;

export async function instrumentSource(code: string, id: string, registry: SourceRegistry) {
  const filename = id.split('?')[0];
  const sourceId = await registry.register(filename, code);
  if (!sourceId) return null;
  const result = await transformWithEsbuild(code, filename, {
    loader: filename.endsWith('.tsx') ? 'tsx' : 'jsx',
    jsx: 'automatic', jsxDev: true, jsxImportSource: 'virtual:giggydev',
    sourcefile: sourceId, sourcemap: true,
  });
  // Keep browser stack traces mapped to the actual file while DOM metadata uses an opaque ID.
  if (result.map) result.map.sources = [filename];
  return { code: result.code, map: result.map };
}
