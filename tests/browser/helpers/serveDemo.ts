import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve, extname, relative, isAbsolute } from 'node:path';

/** Exercise the built demo without requiring a local HTTP socket. */
export async function serveDemo(page: Page) {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== 'http://giggy.test') return route.abort();
    const root = resolve('playground/demo-dist');
    const path = resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    if (relative(root, path).startsWith('..') || isAbsolute(relative(root, path))) return route.abort();
    try {
      const body = await readFile(path);
      const types: Record<string, string> = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json' };
      await route.fulfill({ body, contentType: types[extname(path)] ?? 'text/plain' });
    } catch { await route.fulfill({ status: 404, body: 'Not found' }); }
  });
}
