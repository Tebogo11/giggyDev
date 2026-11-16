import {readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import { build } from 'esbuild';

await build({
  entryPoints: { aiReply: 'src/ai/reply.ts', aiClient: 'src/runtime/ai-client.ts', nextWebpack: 'src/next/webpack.ts', nextConfig: 'src/next/index.ts', nextBridge: 'src/next/bridge.ts', nextLoader: 'src/next/loader.ts', markdown: 'src/inspector/features/chat/markdown.ts', aiConfig: 'src/ai/config.ts', aiProvider: 'src/ai/provider.ts', aiMiddleware: 'src/ai/middleware.ts', fixes: 'src/fixes/store.ts', capture: 'src/capture/index.ts', payload: 'src/capture/payload.ts', sources: 'src/vite/source-registry.ts', sourceMiddleware: 'src/vite/source-middleware.ts', instrumentation: 'src/vite/instrumentation.ts', vite: 'src/vite/index.ts' },
  bundle: true,
  external: ['vite', 'esbuild'],
  platform: 'node',
  format: 'esm',
  outdir: '.test-build',
  outExtension: { '.js': '.mjs' },
});

await build({ entryPoints: ['tests/fixtures/padding-preview.tsx'], bundle:true, platform:'browser', format:'esm', define:{'process.env.NODE_ENV':'"production"'}, outfile:'.test-build/padding-preview.js' });

const cardFile = resolve('playground/src/features/code-fix-demo/IncorrectPaddingCard.tsx');
const cardSource = await readFile(cardFile, 'utf8');
for (const padding of ['4px', '24px', '12px']) {
  if (!/const sourcePadding = '[^']*';/.test(cardSource)) throw new Error('Padding demo test target missing');
  await build({ stdin: {contents:cardSource.replace(/const sourcePadding = '[^']*';/, "const sourcePadding = '"+padding+"';"),loader:'tsx',resolveDir:dirname(cardFile)},bundle:true,platform:'node',format:'esm',external:['react','react/jsx-runtime'],outfile:'.test-build/card-'+padding+'.mjs' });
}
