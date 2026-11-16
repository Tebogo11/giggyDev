import { defineConfig } from '@playwright/test';
import {playwrightChannel} from './scripts/playwright-channel.mjs';
export default defineConfig({ testDir: './tests/browser', testMatch: process.env.PW_OFFLINE ? '**/offline.spec.ts' : '**/overlay.spec.ts', use: { headless: true, channel: playwrightChannel() }, webServer: process.env.PW_OFFLINE ? [] : [
        { command: 'npm run dev -- --port 5187 --strictPort', wait: { stdout: /:5187/ }, timeout: 30000 },
        { command: 'npm run preview -- --port 4187 --strictPort', wait: { stdout: /:4187/ }, timeout: 15000 },
        { command: 'npm run preview:demo -- --strictPort', wait: { stdout: /:4188/ }, timeout: 15000 },
    ] });
