import React, { useState } from 'react';
import type { AIClient, FixProposal } from '../../../ai/types';
import { Review } from './FixReview.styles';

export function FixReview({ proposal, client, editCode }: { proposal: FixProposal; client: AIClient; editCode: boolean }) {
  const [state, setState] = useState<'proposed' | 'applied' | 'undone'>(proposal.state ?? 'proposed');
  const [pending, setPending] = useState(false), [error, setError] = useState('');
  const before = proposal.before.split('\n'), after = proposal.after.split('\n');
  let start = 0, end = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  while (end < before.length - start && end < after.length - start && before[before.length - end - 1] === after[after.length - end - 1]) end++;
  async function act(action: 'apply' | 'undo') {
    if (action === 'apply' && !editCode) return;
    setPending(true); setError('');
    try { await client[action](proposal.id); setState(action === 'apply' ? 'applied' : 'undone'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update the file'); }
    finally { setPending(false); }
  }
  return (
    <Review aria-label="Proposed fix">
      <div className="review-body"><h3>Review fix: {proposal.path}</h3><p>{proposal.explanation}</p>
      <pre aria-label="Fix diff">{before.slice(Math.max(0,start-3),start).map((line,index)=><span key={`context-${index}`}>{`  ${line}\n`}</span>)}{before.slice(start,before.length-end).map((line,index)=><span className="removed" key={`removed-${index}`}>{`- ${line}\n`}</span>)}{after.slice(start,after.length-end).map((line,index)=><span className="added" key={`added-${index}`}>{`+ ${line}\n`}</span>)}{after.slice(after.length-end,after.length-end+3).map((line,index)=><span key={`end-${index}`}>{`  ${line}\n`}</span>)}</pre>
      <details><summary>Review complete before and after files</summary><h4>Before</h4><pre>{proposal.before}</pre><h4>After</h4><pre>{proposal.after}</pre></details>
      <p>{state === 'proposed' ? 'No files have been changed. Approve this exact proposal to apply it.' : state === 'applied' ? 'Fix applied. Undo is available while this server session is running.' : 'Original contents restored.'}</p>
      {error && <p role="alert">{error}</p>}
      </div><div className="review-actions"><button disabled={!editCode || pending || state !== 'proposed'} onClick={() => void act('apply')}>Approve and apply fix</button>
      <button disabled={pending || state !== 'applied'} onClick={() => void act('undo')}>Undo fix</button></div>
    </Review>
  );
}
