import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes, createHash } from 'node:crypto';
import { readFile, realpath, stat } from 'node:fs/promises';
import { relative, isAbsolute, resolve } from 'node:path';
import type { AIOptions } from '../ai/types';
import { createAIMiddleware } from '../ai/middleware';
import { createSourceMiddleware } from '../vite/source-middleware';
import { createRuntimeMiddleware, runtimePrefix } from '../vite/middleware';
import { createSourceRegistry } from '../vite/source-registry';

/** One development-only Node service shared by Next's separate compiler targets. */
export function createNextHandler(root: string, ai: AIOptions = {}, env = process.env, directory = new URL('./', import.meta.url)) {
  const token = randomBytes(24).toString('hex');
  const compilerToken = randomBytes(24).toString('hex');
  const registry = createSourceRegistry(root);
  const projectRoot = realpath(resolve(root));
  const aiHandler = createAIMiddleware(registry, token, ai, env);
  const sourceHandler = createSourceMiddleware(registry, token);
  const runtimeHandler = createRuntimeMiddleware(directory, token);

  async function handler(request: IncomingMessage, response: ServerResponse) {
    response.setHeader('Cache-Control', 'no-store');
    const fail = (status: number) => { response.statusCode = status; response.end(); };
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
    try {
      if (pathname === `${runtimePrefix}register`) {
        // Compiler credential is never injected into a browser module.
        if (request.method !== 'POST' || request.headers['x-giggy-compiler'] !== compilerToken) return fail(403);
        let body = '';
        for await (const chunk of request) {
          body += chunk; if (body.length > 8192) return fail(413);
        }
        const input = JSON.parse(body);
        if (typeof input.file !== 'string' || typeof input.hash !== 'string' || !/\.[jt]sx$/.test(input.file)) return fail(400);
        const file = await realpath(input.file);
        const path = relative(await projectRoot, file);
        if (isAbsolute(path) || path === '..' || path.startsWith('../') || path.startsWith('..\\') || /(^|[/\\])(node_modules|\.git)([/\\]|$)/.test(path)) return fail(403);
        if ((await stat(file)).size > 128 * 1024) return fail(413);
        const code = await readFile(file, 'utf8');
        if (createHash('sha256').update(code).digest('hex') !== input.hash) return fail(409);
        const id = await registry.register(file, code);
        if (!id) return fail(403);
        response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ id })); return;
      }
      // Next's external rewrite supplies the original host. The shared handlers
      // still enforce their session token, Origin and Sec-Fetch-Site checks.
      const forwardedHost = request.headers['x-forwarded-host'];
      if (typeof forwardedHost === 'string' && !forwardedHost.includes(',')) request.headers.host = forwardedHost;
      if (pathname.startsWith(`${runtimePrefix}ai/`)) {
        request.url = request.url!.slice(`${runtimePrefix}ai`.length);
        await aiHandler(request, response, () => fail(404)); return;
      }
      if (pathname === `${runtimePrefix}source`) {
        request.url = request.url!.slice(`${runtimePrefix}source`.length) || '/';
        await sourceHandler(request, response, () => fail(404)); return;
      }
      if (pathname.startsWith(runtimePrefix)) {
        request.url = request.url!.slice(runtimePrefix.length);
        await runtimeHandler(request, response, () => fail(404)); return;
      }
      fail(404);
    } catch { if (!response.headersSent) fail(400); else response.end(); }
  }
  return { handler, token, compilerToken };
}

export async function startNextBridge(root: string, ai?: AIOptions) {
  const service = createNextHandler(root, ai);
  const server = createServer((request, response) => { void service.handler(request, response); });
  server.requestTimeout = 100_000;
  server.headersTimeout = 10_000;
  await new Promise<void>((accept, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => { server.removeListener('error', reject); accept(); });
  });
  server.unref();
  const address = server.address();
  if (!address || typeof address === 'string') { server.close(); throw new Error('Could not start giggyDev development service'); }
  return { ...service, port: address.port, close: () => server.close() };
}
