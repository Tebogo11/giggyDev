import type { Entry } from '../../../capture';
import type { SourceLocation } from './types';
export function sourceFromEntry(entry?: Entry): SourceLocation | undefined {
  try {
    const source = JSON.parse(entry?.detail ?? '{}').source;
    if (source && typeof source.id === 'string' && Number.isInteger(source.line) && Number.isInteger(source.column)) return source;
  } catch { /* A truncated snapshot has no resolvable source. */ }
}
