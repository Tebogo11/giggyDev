import React from 'react';
import { Guide } from './ApiKeyGuide.styles';

const config = `import { withGiggyDev } from 'giggydev/next';

export default withGiggyDev({
  reactStrictMode: true,
  // Keep your existing Next.js options here.
});`;
export function NextSetup() {
  return <Guide id="nextjs" aria-labelledby="nextjs-heading">
    <div className="label">NEXT.JS / INITIAL WEBPACK INTEGRATION</div>
    <h2 id="nextjs-heading">Use it with Next.js<span>.</span></h2>
    <p>The first Next.js adapter targets Next 16 with Webpack. It reuses the same debugging widget and AI configuration. Turbopack is not supported by this adapter. Real Next.js consumer verification must pass before publishing this integration.</p>
    <div className="guide-grid">
      <article><h3>1. Install and wrap your config</h3><pre>npm install giggydev esbuild</pre><p>Before publication, install the locally packed giggydev tarball instead. esbuild is used by the development source loader.</p><pre aria-label="Next.js configuration example">{config}</pre><p>Use an object config in <code>next.config.mjs</code>. Existing webpack hooks and rewrites are preserved.</p></article>
      <article><h3>2. Start Webpack development</h3><pre>npx next dev --webpack</pre><p>Put your provider key and model in the project's <code>.env.local</code>, as shown in <a href="#api-key">API key setup</a>. For a model allowlist, pass <code>{'{ ai: { models: [...] } }'}</code> as the second argument to withGiggyDev.</p><p>The launcher is injected in development. Select a JSX/TSX element to inspect original source, then use Chat, reviewed fixes and Undo. Server logs are not captured; the collectors run in the browser.</p><p>Production builds do not add the loader, launcher or development rewrites. Projects using CSP must allow the same-origin development module script.</p></article>
    </div>
  </Guide>;
}
