import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,unlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {consumerFingerprint,ensureConsumerFixtures,readConsumerFixtures} from '../../scripts/consumer-fixtures.mjs';
import {playwrightChannel} from '../../scripts/playwright-channel.mjs';

test('browser selection uses installed Windows browsers without changing CI defaults',()=>{
  const env={PROGRAMFILES:'installed'};
  assert.equal(playwrightChannel(env,'win32',path=>path.endsWith('chrome.exe')),'chrome');
  assert.equal(playwrightChannel(env,'win32',path=>path.endsWith('msedge.exe')),'msedge');
  assert.equal(playwrightChannel(env,'win32',()=>false),undefined);
  assert.equal(playwrightChannel(env,'linux',()=>true),undefined);
  assert.equal(playwrightChannel({...env,PW_CHANNEL:'msedge'},'win32',()=>true),'msedge');
});

test('Next fixture launcher explains missing setup instead of dumping an ENOENT stack',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'giggydev-missing-fixture-'));
  const result=spawnSync(process.execPath,[fileURLToPath(new URL('../../scripts/serve-next-fixture.mjs',import.meta.url))],{cwd:directory,encoding:'utf8'});
  assert.equal(result.status,1);
  assert.match(result.stderr,/Run npm run test:next/);
  assert.doesNotMatch(result.stderr,/node:internal\/fs|at async open/);
});

test('Next preflight prepares missing fixtures, reuses valid ones and repairs stale or deleted builds',async()=>{
  const root=await mkdtemp(join(tmpdir(),'giggydev-fixture-preflight-'));
  const next=join(root,'installed-next'),vite=join(root,'installed-vite');let preparations=0;
  async function prepare(){
    preparations++;
    await Promise.all([
      mkdir(join(root,'.test-build'),{recursive:true}),mkdir(join(next,'node_modules/next/dist/bin'),{recursive:true}),
      mkdir(join(next,'.next'),{recursive:true}),mkdir(join(vite,'dist'),{recursive:true}),
    ]);
    await writeFile(join(next,'node_modules/next/dist/bin/next'),'fixture executable');
    await writeFile(join(next,'.next/BUILD_ID'),'verified-build');await writeFile(join(vite,'dist/index.html'),'verified-vite');
    await writeFile(join(root,'.test-build/consumers.json'),JSON.stringify({vite,next,fingerprint:await consumerFingerprint(root)}));
  }
  assert.equal((await ensureConsumerFixtures(prepare,root)).next,next);assert.equal(preparations,1);
  await ensureConsumerFixtures(prepare,root);assert.equal(preparations,1);
  await unlink(join(next,'.next/BUILD_ID'));
  await ensureConsumerFixtures(prepare,root);assert.equal(preparations,2);
  await mkdir(join(root,'src'),{recursive:true});await writeFile(join(root,'src/index.ts'),'changed library');
  assert.equal(await readConsumerFixtures(root),null);
  await ensureConsumerFixtures(prepare,root);assert.equal(preparations,3);
});

test('failed consumer setup does not launch Playwright with an incomplete manifest',async()=>{
  const root=await mkdtemp(join(tmpdir(),'giggydev-fixture-failure-'));
  await assert.rejects(()=>ensureConsumerFixtures(async()=>{throw new Error('Install failed');},root),/Install failed/);
  assert.equal(await readConsumerFixtures(root),null);
  await assert.rejects(()=>ensureConsumerFixtures(async()=>{},root),/did not produce verified fixtures/);
});
