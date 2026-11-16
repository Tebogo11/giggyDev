import { cp, mkdtemp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import {consumerFingerprint} from './consumer-fixtures.mjs';
import {consumerInstall} from './consumer-install.mjs';

try {
const root = process.cwd();
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run through npm run verify:consumers.');
const run = (args, cwd, env = process.env) => execFileSync(process.execPath, [npm, ...args], { cwd, stdio: 'inherit', env });
run(['run','build'],root);
await mkdir('.test-build', {recursive:true});
const packed = JSON.parse(execFileSync(process.execPath, [npm, 'pack', '--ignore-scripts', '--json', '--pack-destination', '.test-build'], {encoding:'utf8'}));
const tarball = resolve('.test-build', packed[0].filename);
// Outside this repo: imports cannot accidentally resolve its node_modules.
const directory = await mkdtemp(join(tmpdir(), 'giggydev-consumers-'));
const vite = join(directory, 'vite');
const next = join(directory, 'next');
await cp('tests/fixtures/consumer', vite, {recursive:true});
await cp('tests/fixtures/next', next, {recursive:true});
await writeFile(join(vite, 'package.json'), JSON.stringify({name:'giggydev-vite-consumer',private:true,type:'module',scripts:{build:'vite build'},dependencies:{react:'^19.0.0','react-dom':'^19.0.0',vite:'^7.3.8'}}));
await writeFile(join(vite, 'vite.config.ts'), "import {defineConfig} from 'vite';\nimport giggyDev from 'giggydev/vite';\nexport default defineConfig({plugins:[giggyDev()]});\n");
for (const project of [vite, next]) {
  const install = consumerInstall(tarball);
  run(install.args, project, install.env);
  run(['run','build'], project);
}
async function scan(path) {
  for (const entry of await readdir(path, {withFileTypes:true})) {
    const file=join(path,entry.name);
    if (entry.isDirectory()) await scan(file);
    else if (/\.(?:js|html)$/.test(file)) {
      if (/giggydev-host|data-giggy-source|\/__giggydev\//.test(await readFile(file,'utf8'))) throw new Error(`Production widget code found: ${file}`);
    }
  }
}
await scan(join(vite,'dist'));
await scan(join(next,'.next','static'));
await writeFile(resolve(root,'.test-build/consumers.json'),JSON.stringify({vite,next,fingerprint:await consumerFingerprint(root)},null,2));
console.log('Installed tarball builds passed in isolated Vite and Next.js consumers. Run npm run test:next for live development checks.');

} catch {
  console.error("Consumer verification failed. Resolve the install/build error above, then rerun npm run verify:consumers.");
  process.exitCode = 1;
}
