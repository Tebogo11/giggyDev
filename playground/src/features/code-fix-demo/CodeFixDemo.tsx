import React, { useState } from 'react';
import styled from 'styled-components';
import { hasSourceUpdate } from './useResettablePadding';
import { IncorrectPaddingCard } from './IncorrectPaddingCard';

const Section = styled.section`
  padding: 56px 9%; border-bottom: 1px solid var(--border);
  h2 { font-size: 28px; margin: 18px 0; }
  p, li { color: var(--muted); font-size: 13px; line-height: 1.8; }
  .demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
  .demo-controls { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; }
  button { border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; color: var(--text); background: var(--panel); }
  .demo-review { margin-top: 18px; padding: 16px; border: 1px solid var(--border); border-radius: 10px; }
  .demo-review pre { overflow-x: auto; font: 12px/1.8 monospace; }
  .removed { color: #d14343; } .added { color: var(--accent); }
  #padding-fix-card { min-width: 0; }
  #padding-fix-card h3 { margin: 0 0 12px; }
  #padding-fix-card span { font-size: 11px; color: var(--accent); }
  @media(max-width:800px) { padding: 40px 6%; .demo-grid { grid-template-columns: 1fr; } }
`;
const prompt = 'In IncorrectPaddingCard.tsx, change the sourcePadding constant from 4px to 24px. It controls #padding-fix-card padding on all sides. Keep everything else unchanged.';

/** Remove this folder and its App import after reviewing the local edit flow. */
export function CodeFixDemo() {
  const hosted = import.meta.env.PROD;
  const [simulation, setSimulation] = useState<'idle' | 'review' | 'applied'>('idle');
  const [feedback, setFeedback] = useState('');
  const [showSource, setShowSource] = useState(false);
  async function copyPrompt() {
    try { await navigator.clipboard.writeText(prompt); setFeedback('Fix prompt copied. Paste it into Chat after selecting the card.'); }
    catch { setFeedback(prompt); }
  }
  function checkPadding() {
    const card = document.getElementById('padding-fix-card');
    if (!card) return;
    const style = getComputedStyle(card);
    const values = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft];
    setFeedback(values.every(value => value === '24px') ? 'Passed: padding is 24px on every side.' : `Not fixed yet: padding is ${values.join(' / ')}. Expected 24px on every side.`);
  }
  return <Section id="padding-test" aria-labelledby="padding-test-heading">
    <div className="label">{hosted ? 'SIMULATED / TRY A VISUAL CHANGE' : 'TEMPORARY / TEST A REAL CODE CHANGE'}</div>
    <h2 id="padding-test-heading">Fix this card's padding.</h2>
    <div className="demo-grid"><div>
      {hosted ? <>
        <p>Try a simulated review and approval. The card starts at 4px padding; approving the example changes it to 24px in this page only. No AI key, provider request or source-file edit is involved.</p>
        <ol><li>Choose Simulate padding fix.</li><li>Review the example diff and approve it.</li><li>Check the padding, then Undo simulated fix to try again.</li></ol>
        <p>To use Find component and apply a real source edit through the widget, <a href="#start">download and run locally</a>.</p>
      </> : <>
        <p>The card intentionally has too little padding. Use it to test a small, visible source edit and Undo.</p>
        <ol><li>Run locally with an AI key. Open the widget and choose Find component.</li><li>Click the card, then go to Chat. Enable Edit code and paste the fix prompt.</li><li>Send the edit request, review the proposed diff and approve it. The card should update to 24px padding.</li><li>Check padding, then use Undo and check again.</li></ol>
        <p>Source edits update the preview immediately. A full page refresh resets the preview to 4px, even if the source still says 24px. Use Undo to restore the actual source before repeating the real edit test.</p>
      </>}
      <div className="demo-controls">
        {hosted ? simulation === 'applied'
          ? <button onClick={() => { setSimulation('idle'); setFeedback('Simulated fix undone. Padding is back to 4px.'); }}>Undo simulated fix</button>
          : <button disabled={simulation === 'review'} onClick={() => { setSimulation('review'); setFeedback(''); }}>Simulate padding fix</button>
          : <button onClick={() => void copyPrompt()}>Copy padding fix prompt</button>}
        <button onClick={checkPadding}>Check card padding</button>
        {!hosted && <button onClick={() => { setShowSource(true); setFeedback('Showing the current source padding; no files changed.'); }}>Show source padding</button>}
      </div>
      {hosted && simulation === 'review' && <div className="demo-review" role="region" aria-label="Simulated padding diff">
        <h3>Review simulated fix</h3>
        <pre><span className="removed">- padding: '4px'</span>{'\n'}<span className="added">+ padding: '24px'</span></pre>
        <p>The card stays unchanged until you approve this example.</p>
        <div className="demo-controls"><button onClick={() => { setSimulation('applied'); setFeedback('Simulated fix applied: 24px padding. No files were changed.'); }}>Approve simulated fix</button><button onClick={() => { setSimulation('idle'); setFeedback('Simulation cancelled. The card is unchanged.'); }}>Cancel simulation</button></div>
      </div>}
      <p aria-live="polite" data-testid="padding-result">{feedback}</p>
    </div><IncorrectPaddingCard sourceUpdated={showSource || hasSourceUpdate()} demoPadding={hosted ? simulation === 'applied' ? '24px' : '4px' : undefined} /></div>
  </Section>;
}
