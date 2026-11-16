import {existsSync} from 'node:fs';
import {join} from 'node:path';

/** Prefer an installed Windows browser to avoid a second large browser download.
 * CI/non-Windows keeps Playwright's managed Chromium; PW_CHANNEL overrides both. */
export function playwrightChannel(env = process.env, platform = process.platform, exists = existsSync) {
  if (env.PW_CHANNEL) return env.PW_CHANNEL;
  if (platform !== 'win32') return undefined;
  const chrome = [env.PROGRAMFILES, env['PROGRAMFILES(X86)'], env.LOCALAPPDATA]
    .filter(Boolean).map(root => join(root,'Google','Chrome','Application','chrome.exe'));
  if (chrome.some(path => exists(path))) return 'chrome';
  const edge = [env['PROGRAMFILES(X86)'], env.PROGRAMFILES, env.LOCALAPPDATA]
    .filter(Boolean).map(root => join(root,'Microsoft','Edge','Application','msedge.exe'));
  if (edge.some(path => exists(path))) return 'msedge';
  return undefined;
}
