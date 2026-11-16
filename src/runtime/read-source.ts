import type { SourceLocation, SourcePreview } from '../inspector/features/source/types';

export async function readSource(location: SourceLocation, token: string, signal?: AbortSignal, prefix = '/__giggydev/'): Promise<SourcePreview> {
  const query = new URLSearchParams({ id: location.id, line: String(location.line), column: String(location.column) });
  const response = await fetch(`${prefix}source?${query}`, { headers: { 'X-Giggy-Token': token }, signal });
  if (!response.ok) throw new Error('Source unavailable or changed. Pick the element again.');
  return response.json();
}
