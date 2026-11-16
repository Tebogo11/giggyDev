import { createHash } from 'node:crypto';
import { transform } from 'esbuild';

interface LoaderContext {
  resourcePath: string;
  cacheable(value: boolean): void;
  getOptions(): { port: number; compilerToken: string };
  async(): (error: Error | null, code?: string, map?: unknown) => void;
}
/** Runs before Next's SWC loader, retaining directives and original-file maps. */
export default function loader(this: LoaderContext, code: string) {
  const done = this.async();
  // Session-bound source IDs must not survive a Next compiler cache restart.
  this.cacheable(false);
  const { port, compilerToken } = this.getOptions();
  const file = this.resourcePath;
  void (async () => {
    const response = await fetch(`http://127.0.0.1:${port}/__giggydev/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Giggy-Compiler': compilerToken },
      body: JSON.stringify({ file, hash: createHash('sha256').update(code).digest('hex') }), signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error('giggyDev could not register this source. Restart Next.js or re-save the file.');
    const { id } = await response.json() as { id: string };
    const result = await transform(code, { loader: file.endsWith('.tsx') ? 'tsx' : 'jsx', jsx: 'automatic', jsxDev: true, jsxImportSource: 'giggydev/next', sourcefile: id, sourcemap: true, target: 'es2022' });
    const map = JSON.parse(result.map); map.sources = [file];
    done(null, result.code, map);
  })().catch(error => done(error instanceof Error ? error : new Error('giggyDev source transform failed')));
}
