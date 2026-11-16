const MAX_PAYLOAD_CHARACTERS = 4096;

/** Inspect replayable values only. Never read Request, Blob or stream contents. */
export function snapshotPayload(body: unknown, contentType = ''): unknown {
  if (body == null) return { format: 'empty', data: null };
  if (typeof body === 'string') {
    if (body.length > MAX_PAYLOAD_CHARACTERS) return { format: 'omitted', reason: 'Payload exceeds 4096 characters' };
    try { return { format: 'json', data: JSON.parse(body) }; } catch { /* Not JSON. */ }
    if (contentType.includes('application/x-www-form-urlencoded')) return snapshotPayload(new URLSearchParams(body));
    return { format: 'text', data: body };
  }
  if (body instanceof URLSearchParams || (typeof FormData !== 'undefined' && body instanceof FormData)) {
    const fields: Record<string, unknown[]> = Object.create(null);
    let size = 0;
    let count = 0;
    for (const [key, value] of body.entries()) {
      size += key.length + (typeof value === 'string' ? value.length : 0);
      if (++count > 100 || size > MAX_PAYLOAD_CHARACTERS) return { format: 'omitted', reason: 'Form payload exceeds capture limit' };
      const item = typeof value === 'string' ? value : { file: true, size: value.size, type: value.type };
      (fields[key] ??= []).push(item);
    }
    return { format: 'form', data: fields };
  }
  return { format: 'omitted', reason: 'Binary, document and streaming bodies are not read' };
}

export function fetchPayload(input: RequestInfo | URL, init?: RequestInit): unknown {
  try {
    if (init?.body !== undefined) return snapshotPayload(init.body, new Headers(init.headers).get('content-type') ?? '');
    if (input instanceof Request && input.body) return { format: 'omitted', reason: 'Request body stream is not read' };
    return snapshotPayload(null);
  } catch { return { format: 'omitted', reason: 'Payload could not be inspected' }; }
}
