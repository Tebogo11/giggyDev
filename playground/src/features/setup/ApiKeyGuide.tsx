import React, { useState } from 'react';
import { CometSetup } from './CometSetup';
import { Guide } from './ApiKeyGuide.styles';

// Last checked against OpenAI's public model catalog on 15 November 2026.
const choices = [
  { id: 'gpt-6.1-sol', label: 'GPT-6.1 Sol — balanced coding and reasoning', description: 'A balanced starting point for explaining errors and proposing fixes.' },
  { id: 'gpt-6-luna', label: 'GPT-6 Luna — economical, focused tasks', description: 'A lower-cost option for focused questions and simple debugging.' },
];
export function ApiKeyGuide() {
  const [model, setModel] = useState(choices[0].id);
  const [copyMessage, setCopyMessage] = useState('');
  const template = `GIGGYDEV_AI_PROVIDER=openai\nGIGGYDEV_AI_KEY=replace-with-your-key\nGIGGYDEV_AI_MODEL=${model}`;
  async function copyTemplate() {
    try { await navigator.clipboard.writeText(template); setCopyMessage('Setup template copied. Replace the key placeholder in your local file.'); }
    catch { setCopyMessage('Clipboard unavailable. Select and copy the template below.'); }
  }
  return (
    <Guide id="api-key" aria-labelledby="api-key-heading">
      <div className="label">FIRST THINGS FIRST / CONNECT YOUR AI</div>
      <h2 id="api-key-heading">API key setup<span>.</span></h2>
      <p>Connect your preferred text model to giggyDev locally. OpenAI below is just one example: direct Anthropic models and OpenAI-compatible services can also be used. Your key stays on the development server. This page never asks you to paste a key into the browser; the hosted playground always uses simulated replies.</p>
      <div className="guide-grid">
        <article><h3>1. Get a provider API key</h3><p>For this example, sign in to the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">OpenAI API dashboard</a>, select your project and create a secret key. Save it securely for the next step.</p><p>Use the <a href="https://developers.openai.com/api/docs/quickstart" target="_blank" rel="noreferrer">official API quickstart</a> if you need help setting up your account and access.</p></article>
        <article><h3>2. Choose a model (OpenAI example)</h3><label>Example OpenAI model<select aria-label="Setup example model" value={model} onChange={event => { setModel(event.target.value); setCopyMessage(''); }}>{choices.map(choice => <option key={choice.id} value={choice.id}>{choice.label}</option>)}</select></label><p>{choices.find(choice => choice.id === model)?.description}</p><p>This updates the template, not the running server. Available models depend on your API project. <a href="https://developers.openai.com/api/docs/models" target="_blank" rel="noreferrer">Check the current model catalog</a>.</p></article>
        <article><h3>3. Add your local environment file</h3><p>In this repository, create <code>playground/.env.local</code>. When using the library in your own app, use your Vite env directory—normally the app’s root. Paste this template and replace the key placeholder:</p><pre aria-label="API environment template">{template}</pre><button type="button" onClick={() => void copyTemplate()}>Copy setup template</button><p aria-live="polite">{copyMessage}</p><p>Keep the key server-side and out of Git. Use unprefixed names as shown.</p></article>
        <article><h3>4. Restart and try Chat</h3><pre>npm run dev</pre><p>Restart after saving the file. Open the lime widget, choose Chat and select the configured model. Attach a log or request and send a question.</p><p>Missing setup? Check the filename, key and model ID. A provider authentication or access error means you should check the key and that your project can use the chosen model.</p><p>To offer several models, configure <code>ai.models</code> in the Vite plugin. Those entries populate the widget’s model dropdown; keys remain on the server.</p><a href="#ai">Explore AI chat</a></article>
      </div>
      <CometSetup />
      <p className="guide-note">These OpenAI model IDs are examples, not a requirement. For Anthropic or an OpenAI-compatible service, configure its provider, model ID and key in server plugin options. The production playground does not use live keys or apply fixes to your files.</p>
    </Guide>
  );
}
