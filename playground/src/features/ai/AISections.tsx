import React from 'react';
import styled from 'styled-components';

const Example = styled.div`
  padding: 22px;
  p, li { font-size: 12px; line-height: 1.8; }
  pre { font: 11px/1.8 monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
  .removed { color: #d14343; }
  .added { color: var(--accent); }
  a { display: inline-block; margin-top: 16px; color: var(--accent); font-size: 12px; }
`;
function openWidget() {
  document.getElementById('giggydev-host')?.shadowRoot?.querySelector<HTMLButtonElement>('button[aria-label="Open giggyDev"]')?.click();
}
export function AISections() {
  return <>
    <section id="ai" className="feature">
      <div><div className="label">04 / ASK WITH CONTEXT</div><h2>Real AI chat<span>.</span></h2><p>Choose a configured provider and model, attach logs, requests and source, then stream an answer. Keys stay on your development server.</p><small>{import.meta.env.PROD ? 'This is just a playground. Download giggyDev and try real AI locally. Hosted replies are simulated.' : 'Set the key and model in playground/.env.local for this repository, then restart npm run dev. Open the widget and choose Chat.'}</small></div>
      <div className="test-card"><div className="card-top"><span className="live"/> CHAT SETUP <span>SERVER SIDE</span></div><Example><pre>{`# .env.local\nGIGGYDEV_AI_KEY=your-provider-key\nGIGGYDEV_AI_MODEL=your-model-id`}</pre><p>In the hosted demo, send <code>Show Markdown preview</code> in Chat to try headings, lists and a copyable code block.</p><p>The widget dropdown lists your configured models. Missing credentials produce an actionable setup error locally.</p></Example><button onClick={openWidget}><b>Open AI playground</b><span>Choose Chat, select a model and send a message ↗</span></button></div>
    </section>
    <section id="fixes" className="feature">
      <div><div className="label">05 / YOU APPROVE THE CHANGE</div><h2>Reviewed code fixes<span>.</span></h2><p>Pick a component, attach the failure and describe the problem. With Edit code enabled, sending an edit request generates a reviewed diff for one selected source file. Approval applies that exact proposal; Undo restores it if the file has not changed again.</p><small>Edits are local and development-only. The hosted demo cannot read or write your files. Review history lasts for the development-server session.</small></div>
      <div className="test-card"><div className="card-top"><span className="live"/> APPROVAL FLOW <span>REVIEW FIRST</span></div><Example><ol><li>Ask about selected context.</li><li>Enable Edit code, send your edit request and review the diff.</li><li>Approve and apply, then test the result.</li><li>Use Undo if needed.</li></ol><details><summary>Preview an example diff</summary><pre><span className="removed">- setCount(count + 1);</span>{'\n'}<span className="added">+ setCount(value =&gt; value + 1);</span></pre><p>Illustration only. No files are modified.</p></details><a href="#start">Get started locally ↗</a></Example></div>
    </section>
  </>;
}
