import { build } from 'esbuild';

await build({
  entryPoints: { aiConfig: 'src/ai/config.ts', aiProvider: 'src/ai/provider.ts', aiMiddleware: 'src/ai/middleware.ts', fixes: 'src/fixes/store.ts', capture: 'src/capture/index.ts', payload: 'src/capture/payload.ts', sources: 'src/vite/source-registry.ts', sourceMiddleware: 'src/vite/source-middleware.ts', instrumentation: 'src/vite/instrumentation.ts', vite: 'src/vite/index.ts' },
  bundle: true,
  external: ['vite'],
  platform: 'node',
  format: 'esm',
  outdir: '.test-build',
  outExtension: { '.js': '.mjs' },
});
