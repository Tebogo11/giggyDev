import { providerError } from './provider-error';
import type { ResolvedModel } from './config';
import type { ChatMessage } from './types';

/** Provider credentials are used only by this Node adapter. No SDK enters the browser. */
export async function* generate(model: ResolvedModel, system: string, messages: ChatMessage[], signal: AbortSignal): AsyncGenerator<string> {
  const anthropic = model.provider === 'anthropic';
  const base = model.baseURL ?? (anthropic ? 'https://api.anthropic.com/v1' : 'https://api.openai.com/v1');
  const url = new URL(`${base.replace(/\/$/, '')}/${anthropic ? 'messages' : 'chat/completions'}`);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid server-side AI endpoint');
  const response = await fetch(url, {
    method: 'POST', signal,
    headers: anthropic ? { 'Content-Type': 'application/json', 'x-api-key': model.key, 'anthropic-version': '2023-06-01' } : { 'Content-Type': 'application/json', Authorization: `Bearer ${model.key}` },
    body: JSON.stringify(anthropic ? { model: model.model, system, messages, max_tokens: 8192, stream: true } : { model: model.model, messages: [{ role: 'system', content: system }, ...messages], stream: true }),
  });
  if (!response.ok) throw await providerError(response, model.provider);
  if (!response.body) throw new Error('AI provider returned an empty response.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '', total = 0, completed = false;
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      if (buffer.length > 512 * 1024) throw new Error('AI stream exceeded its limit');
      let boundary: number;
      while ((boundary = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, boundary).trim(); buffer = buffer.slice(boundary + 1);
        if (!line.startsWith('data:')) continue;
        const raw = line.slice(5).trim();
        if (raw === '[DONE]') { completed = true; continue; }
        const event = JSON.parse(raw);
        if (event.error || event.type === 'error') throw new Error('AI provider reported a streaming error');
        if (event.type === 'message_stop' || event.choices?.[0]?.finish_reason) completed = true;
        const text = anthropic ? (event.delta?.type === 'text_delta' ? event.delta.text : '') : event.choices?.[0]?.delta?.content;
        if (typeof text === 'string' && text) {
          total += text.length;
          if (total > 128 * 1024) throw new Error('AI reply exceeded its limit');
          yield text;
        }
      }
      if (done) break;
    }
    if (!completed) throw new Error('AI stream ended before completion. Try again.');
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
