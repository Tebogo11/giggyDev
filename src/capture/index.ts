import { captureConsole } from './console';
import { captureFetch } from './fetch';
import { captureXhr } from './xhr';

export { capture } from './store';
export type { Entry } from './types';
export { serialize } from './serialization';

/** Collectors share one bounded store and return one cleanup function. */
export function startCapture() {
  const cleanups = [captureConsole(), captureFetch(), captureXhr()];
  return () => cleanups.reverse().forEach(dispose => dispose());
}
