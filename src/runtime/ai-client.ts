import type { AIClient, ChatRequest } from '../ai/types';

export function createAIClient(token: string): AIClient {
  async function request(path: string, data?: unknown, signal?: AbortSignal) {
    const response = await fetch(`/__giggydev/ai/${path}`, {
      method: data === undefined ? 'GET' : 'POST',
      headers: { 'X-Giggy-Token': token, ...(data === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: data === undefined ? undefined : JSON.stringify(data), signal,
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error ?? `AI request failed (${response.status})`);
    }
    return response;
  }
  return {
    configuration: async () => (await request('config')).json(),
    review: async () => (await request('review')).json(),
    async chat(data: ChatRequest, onDelta, signal) {
      const response = await request('chat', data, signal);
      if (!response.body) throw new Error('AI response has no stream');
      const reader = response.body.getReader(), decoder = new TextDecoder();
      let buffer = '', completed = false;
      try {
        while (true) {
          const { value, done } = await reader.read();
          buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
          if (buffer.length > 256 * 1024) throw new Error('AI response exceeded its limit');
          let boundary;
          while ((boundary = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 1);
            if (!line.trim()) continue;
            const event = JSON.parse(line);
            if (event.type === 'delta') onDelta(String(event.text));
            if (event.type === 'error') throw new Error(event.message);
            if (event.type === 'done') completed = true;
          }
          if (done) break;
        }
        if (!completed) throw new Error('AI stream ended before completion');
      } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
    },
    propose: async data => (await request('propose', data)).json(),
    apply: async id => { await request('apply', { id }); },
    undo: async id => { await request('undo', { id }); },
  };
}
