import React, { useState } from 'react';
import { ConfigStack, SetupChoices, SetupSteps } from './GetStarted.styles';

type Target = 'playground' | 'consumer';
function CodeBlock({ title, code }: { title: string; code: string }) {
  const [feedback, setFeedback] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(code); setFeedback('Copied. Replace key placeholders in your local file.'); }
    catch { setFeedback('Select and copy the code manually.'); }
  }
  return <div className="code"><span>{title}</span><pre aria-label={title}>{code}</pre><button onClick={() => void copy()}>Copy {title.toLowerCase()}</button>{feedback && <p aria-live="polite" className="copy-result">{feedback}</p>}</div>;
}
export function GetStarted() {
  const [target, setTarget] = useState<Target>('playground');
  const [multiple, setMultiple] = useState(false);
  const playground = target === 'playground';
  const importPath = playground ? '../dist/vite.js' : 'giggydev/vite';
  const configPath = playground ? 'playground/vite.config.ts' : 'vite.config.ts';
  const envPath = playground ? 'playground/.env.local' : '.env.local';
  const basic = `import { defineConfig } from 'vite';
import giggyDev from '${importPath}';

export default defineConfig({
  plugins: [giggyDev()],
});`;
  const full = `import { defineConfig } from 'vite';
import giggyDev from '${importPath}';

export default defineConfig({
  plugins: [
    giggyDev({
      ai: {
        models: [
          {
            id: 'sol',
            provider: 'openai',
            model: 'gpt-6.1-sol',
            label: 'GPT-6.1 Sol',
            apiKeyEnv: 'OPENAI_API_KEY', // variable name
          },
          {
            id: 'luna',
            provider: 'openai',
            model: 'gpt-6-luna',
            label: 'GPT-6 Luna',
            apiKeyEnv: 'OPENAI_API_KEY',
          },
        ],
      },
    }),
  ],
});`;
  const env = multiple ? '# Both configured models use this server-side key.\nOPENAI_API_KEY=replace-with-your-openai-key' : `GIGGYDEV_AI_PROVIDER=openai
GIGGYDEV_AI_KEY=replace-with-your-openai-key
GIGGYDEV_AI_MODEL=gpt-6.1-sol`;
  const alternate = `// Add entries to ai.models as needed:
{
  id: 'claude',
  provider: 'anthropic',
  model: 'your-anthropic-model-id',
  label: 'Claude',
  apiKeyEnv: 'ANTHROPIC_API_KEY',
},
{
  id: 'compatible',
  provider: 'openai-compatible',
  model: 'your-compatible-model-id',
  baseURL: 'https://your-provider.example/v1',
  apiKeyEnv: 'COMPATIBLE_API_KEY',
}

// Add matching keys to ${envPath}:
// ANTHROPIC_API_KEY=your-key
// COMPATIBLE_API_KEY=your-key`;
  return (
    <section id="start" className="getting-started" aria-labelledby="getting-started-heading">
      <div>
        <div className="label">COMPLETE SETUP / FROM INSTALL TO FIRST FIX</div>
        <h2 id="getting-started-heading">Get started.<br/>Fully configured.</h2>
        <p>Choose your setup, copy the matching Vite configuration and environment file, then restart the development server. The browser model dropdown is populated by your server configuration.</p>
        <SetupChoices aria-label="Setup target">
          <button aria-pressed={playground} onClick={() => setTarget('playground')}>Run this playground</button>
          <button aria-pressed={!playground} onClick={() => setTarget('consumer')}>Existing Vite app</button>
        </SetupChoices>
        <SetupChoices aria-label="AI setup choice">
          <button aria-pressed={!multiple} onClick={() => setMultiple(false)}>Single model</button>
          <button aria-pressed={multiple} onClick={() => setMultiple(true)}>Multiple models</button>
        </SetupChoices>
        <SetupSteps>
          <li><strong>{playground ? 'Download and install.' : 'Install the local package.'}</strong> {playground ? 'Use the repository commands alongside this guide. npm run dev builds the library before launching the playground.' : 'Install giggydev from npm in your existing React app.'}</li>
          <li><strong>Configure {configPath}.</strong> {playground ? 'The playground imports the built integration from dist.' : 'Use giggydev/vite in your existing configuration, preserving your other plugins.'} Put <code>giggyDev()</code> before React transform plugins for source inspection. No app wrapper is required.</li>
          <li><strong>Create {envPath}.</strong> {multiple ? 'Set OPENAI_API_KEY for the two configured models. Add provider-specific keys if you enable more providers.' : 'Set the provider key and exact model ID as shown.'} <a href="#api-key">Follow the API key setup guide</a>. <code>apiKeyEnv</code> names a variable such as <code>OPENAI_API_KEY</code>; the actual value goes in the environment file. Keep local keys out of Git. Server-side plugin options also accept <code>ai.apiKey</code> for explicit configuration.</li>
          <li><strong>Restart and test.</strong> Run <code>npm run dev</code>{playground ? ' and open http://127.0.0.1:5173.' : ' using your app’s normal Vite command.'} Trigger a console/network example, open the lime widget and choose Chat. {multiple ? 'Choose Sol or Luna in the model dropdown.' : 'Your environment model appears in the dropdown.'} Missing setup produces an actionable error.</li>
          <li><strong>Review a real fix locally.</strong> Pick and attach a component, select relevant failures, ask a question, then send the edit request. Inspect the full diff before Approve and apply fix. Undo preserves later edits by refusing a stale restore.</li>
        </SetupSteps>
        <p className="note">The hosted playground uses simulated replies and source samples. Live chat and file edits run through the local development server. Consumer production builds exclude the widget, instrumentation and development endpoints. Next.js 16 Webpack is also supported; see the Next.js setup section.</p>
        <p><a href="https://github.com/Tebogo11/giggyDev" target="_blank" rel="noreferrer">View or download the repository ↗</a></p>
      </div>
      <ConfigStack>
        <CodeBlock title="Install commands" code={playground ? `git clone https://github.com/Tebogo11/giggyDev.git
cd giggyDev
npm install
# Complete the config and env steps below, then:
npm run dev` : `npm install -D giggydev`} />
        <CodeBlock key={`${target}-${multiple}-config`} title={configPath} code={multiple ? full : basic} />
        <CodeBlock key={`${target}-${multiple}-env`} title={envPath} code={env} />
        <details><summary>React plugin order, additional providers and explicit key options</summary><p>For an app already using @vitejs/plugin-react, keep its existing import and use <code>plugins: [giggyDev(...), react()]</code>. The examples above do not require that additional package in this playground.</p><pre>{alternate}</pre><p>Model-level <code>apiKey</code> overrides <code>ai.apiKey</code>; environment keys are the fallback. <code>apiKeyEnv</code> lets each model name its own private environment variable. Changing the dropdown affects the next request; it does not change your environment file.</p></details>
        <details><summary>Local validation and hosted playground build</summary><pre>{`npm run typecheck
npm run test:unit
npm run build
npm run build:playground
npm run build:demo
npm run build:fixture
npm run test:build
npx playwright install chromium
npm run test:browser`}</pre><p>Netlify uses <code>npm run build &amp;&amp; npm run build:demo</code> and publishes <code>playground/demo-dist</code>. Both playground builds keep the simulated widget; playground source and output are excluded from the library package.</p></details>
      </ConfigStack>
    </section>
  );
}
