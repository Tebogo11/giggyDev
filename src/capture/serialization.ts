const sensitiveKey = /authorization|cookie|password|secret|token|api[-_]?key/i;

/** Snapshot objects safely; free-form strings are not guaranteed to be secret-free. */
export function serialize(value: unknown): string {
  const seen = new WeakSet<object>();
  try {
    const text = typeof value === 'string' ? value : JSON.stringify(value, (key, item) => {
      if (sensitiveKey.test(key)) return '[REDACTED]';
      if (item instanceof Error) return { message: item.message, stack: item.stack };
      if (typeof item === 'bigint') return `${item}n`;
      if (typeof item === 'object' && item !== null) {
        if (seen.has(item)) return '[Circular]';
        seen.add(item);
      }
      return item;
    }, 2);
    return (text ?? String(value)).slice(0, 8000);
  } catch { return '[Unable to serialize]'; }
}
export function safeUrl(raw: string) {
  try {
    const url = new URL(raw, location.href);
    url.username = '';
    url.password = '';
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (sensitiveKey.test(key)) url.searchParams.set(key, '[REDACTED]');
    }
    return url.href;
  } catch { return '[Invalid URL]'; }
}
export function isInternalRequest(url: string) {
  return /\/__giggydev\/|\/@vite\/|\/node_modules\//.test(url);
}
