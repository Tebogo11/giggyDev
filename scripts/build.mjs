import { build as bundle } from 'esbuild';
import { build } from 'tsup';
import { gzipSync } from 'node:zlib';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

await build({ entry: { vite: 'src/vite/index.ts' }, format: ['esm'], dts: true, clean: true });
const result = await bundle({
  entryPoints: { client: 'src/runtime/index.ts' },
  bundle: true,
  format: 'esm',
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',
  target: 'es2022',
  minify: true,
  treeShaking: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  outdir: 'dist',
  metafile: true,
});
// Keep the report outside dist so analysis metadata is never published.
await mkdir('.test-build', { recursive: true });
await writeFile('.test-build/bundle-report.json', JSON.stringify(result.metafile, null, 2));
let total = 0;
for (const file of Object.keys(result.metafile.outputs)) {
  const data = await readFile(file);
  total += data.length;
  console.log(`${file}: ${(data.length / 1024).toFixed(1)} KiB / ${(gzipSync(data).length / 1024).toFixed(1)} KiB gzip`);
}
console.log(`Browser runtime total: ${(total / 1024).toFixed(1)} KiB (UI loaded on first click)`);
