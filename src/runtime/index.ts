import { createAIClient } from './ai-client';
import { mountWidget } from './mount-widget';
import { readSource } from './read-source';
declare const __GIGGY_DEV__: boolean;
declare const __GIGGY_SOURCE_TOKEN__: string;

// No DOM writes or collectors unless the development endpoint supplies the flag.
if (typeof __GIGGY_DEV__ !== 'undefined' && __GIGGY_DEV__ === true) {
  const token = typeof __GIGGY_SOURCE_TOKEN__ === 'undefined' ? '' : __GIGGY_SOURCE_TOKEN__;
  const prefix = new URL('.', import.meta.url).pathname;
  const dispose = mountWidget({
    mode: 'development',
    aiClient: token ? createAIClient(token, prefix) : undefined,
    resolveSource: token ? (location, signal) => readSource(location, token, signal, prefix) : undefined,
  });
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}
