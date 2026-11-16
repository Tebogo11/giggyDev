import {access, readFile, readdir} from 'node:fs/promises';
import {join, isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';

/** Match installed fixtures to the library/fixture inputs that were verified. */
export async function consumerFingerprint(root = process.cwd()) {
  const hash = createHash('sha256');
  async function add(relative) {
    const path = join(root, relative);
    let entries;
    try { entries = await readdir(path, {withFileTypes:true}); }
    catch (error) {
      if (error.code === 'ENOTDIR') { hash.update(relative.replaceAll('\\','/')); hash.update(await readFile(path)); return; }
      if (error.code === 'ENOENT') { hash.update(`missing:${relative}`); return; }
      throw error;
    }
    for (const entry of entries.sort((a,b)=>a.name.localeCompare(b.name))) await add(join(relative,entry.name));
  }
  for (const input of ['src','tests/fixtures/consumer','tests/fixtures/next','package.json','package-lock.json','scripts/build.mjs']) await add(input);
  return hash.digest('hex');
}

export async function readConsumerFixtures(root = process.cwd()) {
  try {
    const state = JSON.parse(await readFile(join(root,'.test-build/consumers.json'),'utf8'));
    if (typeof state.next !== 'string' || typeof state.vite !== 'string' || !isAbsolute(state.next) || !isAbsolute(state.vite)) return null;
    if (state.fingerprint !== await consumerFingerprint(root)) return null;
    await Promise.all([
      access(join(state.next,'node_modules/next/dist/bin/next')),
      access(join(state.next,'.next/BUILD_ID')),
      access(join(state.vite,'dist/index.html')),
    ]);
    return state;
  } catch (error) {
    if (error instanceof SyntaxError || ['ENOENT','ENOTDIR'].includes(error.code)) return null;
    throw error;
  }
}

export async function ensureConsumerFixtures(prepare, root = process.cwd()) {
  const existing = await readConsumerFixtures(root);
  if (existing) return existing;
  await prepare();
  const prepared = await readConsumerFixtures(root);
  if (!prepared) throw new Error('Consumer setup did not produce verified fixtures. Run npm run verify:consumers and resolve its build or install errors.');
  return prepared;
}
