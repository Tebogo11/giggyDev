import type { Connect } from 'vite';
import { readFile } from 'node:fs/promises';

export const runtimePrefix = '/__giggydev/';

/** Only bundled runtime files are available through this development endpoint. */
export function createRuntimeMiddleware(directory: URL, sourceToken = ''): Connect.NextHandleFunction {
  return async (request, response, next) => {
    const filename = request.url?.split('?')[0].replace(/^\//, '') ?? '';
    if (!/^(client\.js|chunks\/[\w-]+\.js)$/.test(filename)) return next();
    try {
      const code = await readFile(new URL(filename, directory), 'utf8');
      response.setHeader('Content-Type', 'text/javascript');
      response.setHeader('Cache-Control', 'no-store');
      const flag = filename === 'client.js' ? `const __GIGGY_DEV__ = true; const __GIGGY_SOURCE_TOKEN__ = ${JSON.stringify(sourceToken)};\n` : '';
      response.end(flag + code);
    } catch (error) { next(error); }
  };
}
