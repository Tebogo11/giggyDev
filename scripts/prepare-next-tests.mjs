import {execFileSync} from 'node:child_process';
import {ensureConsumerFixtures} from './consumer-fixtures.mjs';

try {
  await ensureConsumerFixtures(async () => {
    console.log('Next.js test fixtures are missing or stale. Building and verifying isolated consumers first…');
    const npm = process.env.npm_execpath;
    if (!npm) throw new Error('Start this check with npm run test:next.');
    execFileSync(process.execPath,[npm,'run','verify:consumers'],{stdio:'inherit',env:process.env});
  });
} catch {
  console.error('Next.js fixture preparation failed. Resolve the install/build error above, then rerun npm run test:next.');
  process.exitCode = 1;
}
