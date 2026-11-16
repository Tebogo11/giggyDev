import { fileURLToPath } from 'node:url';
type Entry = string | string[] | { import: string | string[]; [key: string]: unknown };
interface WebpackConfig {
  entry?: Record<string, Entry> | (() => Record<string, Entry> | Promise<Record<string, Entry>>);
  module?: { rules?: unknown[] };
  plugins?: unknown[];
}
interface WebpackContext {
  dev: boolean; isServer: boolean;
  webpack: { DefinePlugin: new (values: Record<string, string>) => unknown };
}
type Rewrite = { source: string; destination: string; [key: string]: unknown };
type Rewrites = Rewrite[] | { beforeFiles?: Rewrite[]; afterFiles?: Rewrite[]; fallback?: Rewrite[] };
interface Config {
  basePath?: string;
  webpack?: (config: WebpackConfig, context: WebpackContext) => WebpackConfig;
  rewrites?: () => Rewrites | Promise<Rewrites>;
}

export function developmentConfig<T extends object>(nextConfig: T, bridge: {port:number;compilerToken:string}): T {
  const original = nextConfig as Config;
    const client = fileURLToPath(new URL('./next-client.js', import.meta.url));
    const loader = fileURLToPath(new URL('./next-loader.cjs', import.meta.url));
    return {
      ...nextConfig,
      async rewrites() {
        const existing = await original.rewrites?.() ?? [];
        const route = { source: '/__giggydev/:path*', destination: `http://127.0.0.1:${bridge.port}/__giggydev/:path*`, locale: false };
        return Array.isArray(existing) ? { beforeFiles: [route], afterFiles: existing, fallback: [] }
          : { ...existing, beforeFiles: [route, ...existing.beforeFiles ?? []] };
      },
      webpack(input: WebpackConfig, context: WebpackContext) {
        const config = original.webpack?.(input, context) ?? input;
        if (!context.dev) return config;
        config.module ??= {}; config.module.rules ??= [];
        config.module.rules.push({ test: /\.[jt]sx$/, exclude: /[/\\](node_modules|\.next|\.git)[/\\]/, enforce: 'pre', use: [{ loader, options: { port: bridge.port, compilerToken: bridge.compilerToken } }] });
        if (!context.isServer) {
          config.plugins ??= [];
          config.plugins.push(new context.webpack.DefinePlugin({ __GIGGY_NEXT_BASE__: JSON.stringify(original.basePath ?? '') }));
          const entries = config.entry;
          config.entry = async () => {
            const result = { ...typeof entries === 'function' ? await entries() : entries };
            for (const name of ['main', 'main-app']) {
              const entry = result[name]; if (!entry) continue;
              if (typeof entry === 'object' && !Array.isArray(entry)) result[name] = { ...entry, import: [client, ...(typeof entry.import === 'string' ? [entry.import] : entry.import).filter(value => value !== client)] };
              else result[name] = [client, ...(typeof entry === 'string' ? [entry] : entry).filter(value => value !== client)];
            }
            return result;
          };
        }
        return config;
      },
    } as T;
}
