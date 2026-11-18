import { loadEnv } from 'vite';
import { createAIMiddleware } from '../ai/middleware';
import type { AIOptions } from '../ai/types';
import type { Plugin } from 'vite';
import { randomBytes } from 'node:crypto';
import { createRuntimeMiddleware, runtimePrefix } from './middleware';
import { createSourceRegistry } from './source-registry';
import { createSourceMiddleware } from './source-middleware';
import { instrumentSource, jsxRuntimeCode, jsxRuntimeId, resolvedJsxRuntimeId } from './instrumentation';

/** Configure once; application components need no wrapper or imports. */
export default function giggyDev(options: { ai?: AIOptions } = {}): Plugin {
  const token = randomBytes(24).toString('hex');
  let registry = createSourceRegistry(process.cwd());
  let environment: Record<string, string | undefined> = process.env;
  return {
    name: 'giggydev', enforce: 'pre',
    apply: (_, env) => env.command === 'serve'
      && env.mode === 'development'
      && process.env.NODE_ENV !== 'production',
    configResolved(config) { registry = createSourceRegistry(config.root); environment = { ...loadEnv(config.mode, config.envDir, ''), ...process.env }; },
    configureServer(server) {
      server.middlewares.use(`${runtimePrefix}ai`, createAIMiddleware(registry, token, options.ai, environment));
      server.middlewares.use(`${runtimePrefix}source`, createSourceMiddleware(registry, token));
      server.middlewares.use(runtimePrefix, createRuntimeMiddleware(new URL('./', import.meta.url), token));
    },
    resolveId(id) { if (id === jsxRuntimeId) return resolvedJsxRuntimeId; },
    load(id) { if (id === resolvedJsxRuntimeId) return jsxRuntimeCode; },
    transform: {
      // React also uses enforce: 'pre'. Read the original JSX before its Fast Refresh transform.
      order: 'pre',
      async handler(code, id, options) {
        if (options?.ssr || !/\.[jt]sx(?:\?|$)/.test(id)) return;
        return instrumentSource(code, id, registry);
      },
    },
    transformIndexHtml() {
      return [{ tag: 'script', attrs: { type: 'module', src: `${runtimePrefix}client.js` }, injectTo: 'body' }];
    },
  };
}
