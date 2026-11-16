import type { Connect } from 'vite';
import type { SourceRegistry } from './source-registry';

export function createSourceMiddleware(registry: SourceRegistry, token: string): Connect.NextHandleFunction {
  return async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'application/json');
    function reply(status: number, data: unknown) { response.statusCode = status; response.end(JSON.stringify(data)); }
    if (request.method !== 'GET') return reply(405, { error: 'Only GET is supported' });
    const origin = request.headers.origin;
    const crossSite = request.headers['sec-fetch-site'] === 'cross-site';
    let sameOrigin = !origin;
    try { if (origin) sameOrigin = new URL(origin).host === request.headers.host; } catch { sameOrigin = false; }
    if (crossSite || !sameOrigin || request.headers['x-giggy-token'] !== token) return reply(403, { error: 'Source access denied' });
    try {
      const url = new URL(request.url ?? '/', 'http://localhost');
      const result = await registry.read(url.searchParams.get('id') ?? '', Number(url.searchParams.get('line')), Number(url.searchParams.get('column')));
      if (!result) return reply(404, { error: 'Source unavailable or changed. Pick the element again.' });
      reply(200, result);
    } catch { reply(404, { error: 'Source unavailable. Pick the element again.' }); }
  };
}
