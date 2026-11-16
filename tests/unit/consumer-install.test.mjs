import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,access} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {consumerInstall} from '../../scripts/consumer-install.mjs';

test('consumer install settings disable scripts without changing parent config or registry settings',()=>{
  const inherited={NPM_CONFIG_ALLOW_SCRIPTS:'example', 'npm_config_allow-scripts':'another',NPM_CONFIG_IGNORE_SCRIPTS:'false',npm_config_registry:'https://registry.example.test',CUSTOM:'retained'};
  const before={...inherited};
  const install=consumerInstall('library.tgz',inherited);
  assert.deepEqual(inherited,before);
  assert.ok(!Object.keys(install.env).some(key=>/^npm_config_allow[_-]scripts$/i.test(key)));
  assert.equal(install.env.npm_config_ignore_scripts,'true');
  assert.equal(install.env.npm_config_registry,inherited.npm_config_registry);
  assert.equal(install.env.CUSTOM,'retained');
  assert.ok(install.args.includes('--ignore-scripts'));
});

test('isolated consumer install handles inherited npm allow-scripts and runs no install scripts',async t=>{
  const npm=process.env.npm_execpath??join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
  if(!existsSync(npm)){t.skip('Run through npm run test:unit to locate npm');return;}
  const root=await mkdtemp(join(tmpdir(),'giggydev-npm-install-'));
  await writeFile(join(root,'package.json'),JSON.stringify({name:'install-fixture',version:'1.0.0',private:true,scripts:{postinstall:'node -e "require(\'fs\').writeFileSync(\'install-script-ran\',\'unexpected\')"'}}));
  const inherited={...process.env,npm_config_allow_scripts:'install-fixture'};
  const install=consumerInstall(undefined,inherited);
  const result=spawnSync(process.execPath,[npm,...install.args,'--offline'],{cwd:root,env:install.env,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  await assert.rejects(()=>access(join(root,'install-script-ran')),{code:'ENOENT'});
});
