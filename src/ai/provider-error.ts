/** Convert provider failures into actionable messages without echoing its raw body. */
export async function providerError(response: Response, provider: string): Promise<Error> {
  const name = provider === 'openai' ? 'OpenAI' : provider === 'anthropic' ? 'Anthropic' : 'AI provider';
  let payload: { error?: { code?: string; type?: string } } = {};
  if (response.body) {
    const reader = response.body.getReader(); const decoder = new TextDecoder(); let text = '', size = 0;
    try {
      while (true) {
        const {value,done} = await reader.read(); if (done) break;
        size += value.byteLength; if (size > 16384) break;
        text += decoder.decode(value, {stream:true});
      }
      if (size <= 16384) { try { payload = JSON.parse(text + decoder.decode()) ?? {}; } catch { /* Non-JSON error. */ } }
    } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  }
  if (response.status === 429) {
    const codes = [payload.error?.code, payload.error?.type];
    const quota = ['insufficient_quota','billing_hard_limit_reached','credits_exhausted','usage_limit_exceeded','organization_usage_limit_exceeded','project_usage_limit_exceeded','spend_limit_exceeded'];
    if (codes.some(code => quota.includes(code ?? ''))) return new Error(`${name} API quota or billing limit reached (429). Check API credits, billing and project/organization spend limits. Retrying will not resolve an exhausted quota.`);
    if (codes.some(code => ['rate_limit_exceeded','rate_limit_error','slow_down'].includes(code ?? ''))) {
      const header = response.headers.get('retry-after');
      const seconds = header ? (/^\d+(?:\.\d+)?$/.test(header) ? Number(header) : (Date.parse(header)-Date.now())/1000) : NaN;
      const wait = Number.isFinite(seconds) && seconds >= 0 ? `Wait ${Math.max(1,Math.ceil(seconds))} seconds before retrying` : 'Wait before retrying';
      return new Error(`${name} API rate limit reached (429). ${wait}, or reduce request frequency and selected context.`);
    }
    return new Error(`${name} returned 429: a rate limit or API quota/billing limit was reached. Check API usage and billing; wait if it is a temporary rate limit.`);
  }
  return new Error(`${name} rejected the request (${response.status}). Check the server-side key, model and endpoint.`);
}
