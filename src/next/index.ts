import { developmentConfig } from './webpack';
import { resolve } from 'node:path';
import type { AIOptions } from '../ai/types';
import { startNextBridge } from './bridge';

export interface NextOptions { root?: string; ai?: AIOptions }

/** Initial Next.js adapter: an object next.config and Next 16 Webpack development. */
export function withGiggyDev<T extends object>(nextConfig: T, options: NextOptions = {}) {
  let service: ReturnType<typeof startNextBridge> | undefined;
  return async function configure(phase: string): Promise<T> {
    if (phase !== 'phase-development-server' || process.env.NODE_ENV === 'production') return nextConfig;
    if (process.env.TURBOPACK || process.argv.some(value => value === '--turbo' || value === '--turbopack')) {
      throw new Error('giggyDev Next.js integration currently supports Webpack. Start Next with next dev --webpack.');
    }
    if (typeof nextConfig !== 'object' || nextConfig === null) throw new Error('Pass a Next.js configuration object to withGiggyDev.');
    service ??= startNextBridge(resolve(options.root ?? process.cwd()), options.ai);
    const bridge = await service;
    return developmentConfig(nextConfig, bridge);
  };
}
export default withGiggyDev;
