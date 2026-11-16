import { jsxDEV as original } from 'react/jsx-dev-runtime';
export { Fragment } from 'react/jsx-dev-runtime';

export function jsxDEV(...[type, props, key, isStatic, source, self]: Parameters<typeof original>) {
  const tagged = typeof type === 'string' && source ? {
    ...(typeof props === 'object' && props !== null ? props : {}), 'data-giggy-source': JSON.stringify({ id: source.fileName, line: source.lineNumber, column: source.columnNumber }),
  } : props;
  return original(type, tagged, key, isStatic, source, self);
}
