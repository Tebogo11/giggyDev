import { fetchPayload } from './payload';
import { record } from './store';
import { isInternalRequest, safeUrl, serialize } from './serialization';

export function captureFetch() {
  const original = window.fetch;
  const wrapper: typeof fetch = async (input, init) => {
    const rawUrl = input instanceof Request ? input.url : String(input);
    if (isInternalRequest(rawUrl)) return original.call(window, input, init);
    const url = safeUrl(rawUrl);
    const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
    const requestPayload = fetchPayload(input, init);
    const started = performance.now();
    const duration = () => `${Math.round(performance.now() - started)} ms`;
    try {
      const response = await original.call(window, input, init);
      record('network', response.ok ? 'success' : 'error', `${method} ${url} — ${response.status}`, serialize({
        method, url, status: response.status, duration: duration(),
        contentType: response.headers.get('content-type'),
        requestPayload, note: 'Response bodies and headers are not recorded.',
      }));
      // Return the original Response, without cloning or consuming its stream.
      return response;
    } catch (error) {
      record('network', 'error', `${method} ${url} — failed`, serialize({ method, url, requestPayload, error: serialize(error), duration: duration() }));
      throw error;
    }
  };
  window.fetch = wrapper;
  return () => { if (window.fetch === wrapper) window.fetch = original; };
}
