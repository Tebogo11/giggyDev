import {defineConfig} from '@playwright/test';
import {playwrightChannel} from './scripts/playwright-channel.mjs';
export default defineConfig({testDir:'./tests/browser',testMatch:'**/next.spec.ts',use:{headless:true,channel:playwrightChannel()},webServer:[
  {command:'node scripts/serve-next-fixture.mjs',url:'http://127.0.0.1:3197',timeout:120000},
  {command:'node scripts/serve-next-fixture.mjs --production',url:'http://127.0.0.1:3198',timeout:60000},
]});
