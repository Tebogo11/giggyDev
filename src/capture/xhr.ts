import { snapshotPayload } from './payload';
import { record } from './store';
import { isInternalRequest, safeUrl, serialize } from './serialization';

export function captureXhr() {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;
  const originalHeader = XMLHttpRequest.prototype.setRequestHeader;
  const requests = new WeakMap<XMLHttpRequest, { method: string; url: string; contentType?: string }>();
  // Forward every argument to preserve the native overloads and authentication options.
  const open = function (this: XMLHttpRequest, ...args: Parameters<typeof originalOpen>) {
    requests.set(this, { method: args[0], url: safeUrl(String(args[1])) });
    return Reflect.apply(originalOpen, this, args);
  } as typeof originalOpen;
  const setHeader = function (this: XMLHttpRequest, name: string, value: string) {
    const result = originalHeader.call(this, name, value);
    const request = requests.get(this);
    if (request && name.toLowerCase() === 'content-type') request.contentType = value;
    return result;
  };
  const send = function (this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
    const request = requests.get(this);
    const requestPayload = snapshotPayload(body, request?.contentType);
    const started = performance.now();
    const done = () => {
      if (!request || isInternalRequest(request.url)) return;
      record('network', this.status >= 200 && this.status < 400 ? 'success' : 'error',
        `${request.method} ${request.url} — ${this.status || 'failed'}`, serialize({
          ...request, status: this.status,
          duration: `${Math.round(performance.now() - started)} ms`,
          transport: 'XMLHttpRequest', requestPayload, note: 'Response bodies and headers are not recorded.',
        }));
    };
    this.addEventListener('loadend', done, { once: true });
    try { return originalSend.call(this, body); }
    catch (error) { this.removeEventListener('loadend', done); throw error; }
  };
  XMLHttpRequest.prototype.open = open;
  XMLHttpRequest.prototype.send = send;
  XMLHttpRequest.prototype.setRequestHeader = setHeader;
  return () => {
    if (XMLHttpRequest.prototype.open === open) XMLHttpRequest.prototype.open = originalOpen;
    if (XMLHttpRequest.prototype.send === send) XMLHttpRequest.prototype.send = originalSend;
    if (XMLHttpRequest.prototype.setRequestHeader === setHeader) XMLHttpRequest.prototype.setRequestHeader = originalHeader;
  };
}
