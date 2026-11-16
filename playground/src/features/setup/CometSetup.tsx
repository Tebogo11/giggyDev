import React, { useState } from 'react';

/** Documentation examples only: credentials are never entered into this page. */
export function CometSetup() {
  const [target, setTarget] = useState('playground');
  const [copied, setCopied] = useState('');
  const playground = target === 'playground';
  const config = `import { defineConfig } from 'vite';
import giggyDev from '${playground ? '../dist/vite.js' : 'giggydev/vite'}';

export default defineConfig({
  plugins: [
    giggyDev({
      ai: {
        models: [
          {
            id: 'comet-claude',
            label: 'Claude via CometAPI',
            provider: 'openai-compatible',
            baseURL: 'https://api.cometapi.com/v1',
            model: 'claude-sonnet-5', // example: verify in the catalog
            apiKeyEnv: 'COMETAPI_KEY', // variable name, not the secret
          },
          {
            id: 'comet-gpt',
            label: 'GPT via CometAPI',
            provider: 'openai-compatible',
            baseURL: 'https://api.cometapi.com/v1',
            model: 'gpt-5.5', // replace with your chosen text model ID
            apiKeyEnv: 'COMETAPI_KEY',
          },
        ],
      },
    }),
    // Keep your existing React plugin after giggyDev.
  ],
});`;
  const env = 'COMETAPI_KEY=replace-with-your-cometapi-key';
  async function copy(text: string, label: string) {
    try { await navigator.clipboard.writeText(text); setCopied(`${label} copied.`); }
    catch { setCopied('Select and copy the example manually.'); }
  }
  return (
    <div className="comet-setup" aria-labelledby="comet-heading">
      <h3 id="comet-heading">One key, multiple text models with CometAPI</h3>
      <p>Prefer one account for several model providers? CometAPI is an optional gateway for text chat. Use a CometAPI key with its OpenAI-compatible endpoint, then choose among the models you configure in the widget. This integration supports text prompts and replies only for now.</p>
      <div className="guide-grid">
        <article>
          <h3>1. Create a key and choose text models</h3>
          <p>Create a <a href="https://www.cometapi.com/?ref=tebogo" target="_blank" rel="sponsored noopener noreferrer">CometAPI account</a>, then follow the <a href="https://www.cometapi.com/quickstart/" target="_blank" rel="noreferrer">CometAPI quickstart</a> to generate your API key. Browse <a href="https://www.cometapi.com/models/?search=claude" target="_blank" rel="noreferrer">Claude and other models</a>, check access and pricing, and copy the exact model ID. The IDs below are examples; choose models that support streaming Chat Completions.</p>
          <p className="guide-note">Affiliate disclosure: I may earn a commission from eligible purchases made through the CometAPI account link.</p>
          <p>Your selected logs, request payloads, source and prompts are sent through CometAPI when you use these models.</p>
          <h3>2. Save the key locally</h3>
          <p>Create <code>{playground ? 'playground/.env.local' : '.env.local'}</code> in your Vite env directory. Replace the placeholder; keep this file out of Git and never prefix the key with <code>VITE_</code>.</p>
          <pre aria-label="CometAPI environment template">{env}</pre>
          <button type="button" onClick={() => void copy(env, 'CometAPI environment')}>Copy CometAPI environment</button>
        </article>
        <article>
          <h3>3. Configure the widget's model choices</h3>
          <label>Setup location<select aria-label="CometAPI setup location" value={target} onChange={event => { setTarget(event.target.value); setCopied(''); }}><option value="playground">This playground</option><option value="consumer">Your Vite app</option></select></label>
          <p>Merge these options into <code>{playground ? 'playground/vite.config.ts' : 'vite.config.ts'}</code>. Replace your existing <code>ai.models</code> list or add these entries to it. An explicit list takes precedence over the default GIGGYDEV environment settings.</p>
          <pre aria-label="CometAPI Vite configuration">{config}</pre>
          <button type="button" onClick={() => void copy(config, 'CometAPI config')}>Copy CometAPI config</button>
        </article>
        <article>
          <h3>4. Restart and send a prompt</h3>
          <pre>npm run dev</pre>
          <p>Restart the local server, open Chat, select “Claude via CometAPI” or your other configured model, and attach relevant console entries, requests or a picked component. No separate API client or SDK is needed in your app.</p>
          <pre aria-label="CometAPI example prompt">Explain the selected error and request payload. Use the attached source to identify the likely cause. Suggest the smallest fix and a way to verify it.</pre>
          <button type="button" onClick={() => void copy('Explain the selected error and request payload. Use the attached source to identify the likely cause. Suggest the smallest fix and a way to verify it.', 'Example prompt')}>Copy example prompt</button>
          <p>To change files, enable Edit code, send your edit request, review the diff and approve it. Switching the model dropdown changes which configured model handles your next request.</p>
        </article>
        <article>
          <h3>Local setup, simulated hosted demo</h3>
          <p>These snippets configure your local project; changing this documentation does not connect a live key. The hosted playground keeps using simulated replies. Download the project and follow <a href="#start">Getting started</a> to try real text chat.</p>
          <p>If setup fails, check that COMETAPI_KEY is set, the model ID is available to your account, and the base URL ends in /v1 (not /chat/completions). Check account credits or limits for a 429 response.</p>
        </article>
      </div>
      <p aria-live="polite">{copied}</p>
    </div>
  );
}
