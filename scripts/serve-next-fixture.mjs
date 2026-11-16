import {createRequire} from 'node:module';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {readConsumerFixtures} from './consumer-fixtures.mjs';
let fixtures;
try { fixtures=await readConsumerFixtures(); }
catch { console.error('Could not read Next.js fixture setup. Run npm run test:next to prepare it again.'); process.exit(1); }
if(!fixtures) { console.error('Next.js test fixtures are missing or stale. Run npm run test:next to build and prepare them automatically.'); process.exit(1); }
const {next}=fixtures;
const require=createRequire(join(next,'package.json'));
const production=process.argv.includes('--production');
const child=spawn(process.execPath,[require.resolve('next/dist/bin/next'),production?'start':'dev',...production?[]:['--webpack'],'--hostname','127.0.0.1','--port',production?'3198':'3197'],{cwd:next,stdio:'inherit'});
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>{child.kill(signal);});
child.on('exit',code=>{process.exitCode=code??1;});
