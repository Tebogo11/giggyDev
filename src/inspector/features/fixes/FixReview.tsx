import React, { useState } from 'react';
import type { AIClient, FixProposal } from '../../../ai/types';
import { Review } from './FixReview.styles';

type FixState = NonNullable<FixProposal['state']>;
interface Props {
  proposal: FixProposal;
  client: AIClient;
  editCode: boolean;
  locked: boolean;
  onStateChange: (state: FixState) => void;
  onBusyChange: (busy: boolean) => void;
}
export function FixReview({ proposal, client, editCode, locked, onStateChange, onBusyChange }: Props) {
  const state = proposal.state ?? 'proposed';
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const before = proposal.before.split('\n'), after = proposal.after.split('\n');
  let start = 0, end = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  while (end < before.length - start && end < after.length - start && before[before.length - end - 1] === after[after.length - end - 1]) end++;
  async function act(action: 'apply' | 'undo' | 'cancel') {
    if (pending || locked || action === 'apply' && !editCode) return;
    setPending(true); setError(''); onBusyChange(true);
    try {
      await client[action](proposal.id);
      onStateChange(action === 'apply' ? 'applied' : action === 'cancel' ? 'cancelled' : 'undone');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not complete this action'); }
    finally { setPending(false); onBusyChange(false); }
  }
  if (state === 'undone' || state === 'cancelled') return <Review aria-label="Fix history"><p>{state === 'undone' ? 'Fix undone. Original contents restored:' : 'Fix proposal cancelled. No files changed:'} {proposal.path}</p></Review>;
  return <Review aria-label={state === 'applied' ? 'Applied fix' : 'Proposed fix'}>
    <div className="review-body"><h3>{state === 'applied' ? 'Applied fix' : 'Review fix'}: {proposal.path}</h3>
      <pre aria-label="Fix diff">{before.slice(Math.max(0,start-3),start).map((line,index)=><span key={`context-${index}`}>{`  ${line}\n`}</span>)}{before.slice(start,before.length-end).map((line,index)=><span className="removed" key={`removed-${index}`}>{`- ${line}\n`}</span>)}{after.slice(start,after.length-end).map((line,index)=><span className="added" key={`added-${index}`}>{`+ ${line}\n`}</span>)}{after.slice(after.length-end,after.length-end+3).map((line,index)=><span key={`end-${index}`}>{`  ${line}\n`}</span>)}</pre>
      <details><summary>Review complete before and after files</summary><h4>Before</h4><pre>{proposal.before}</pre><h4>After</h4><pre>{proposal.after}</pre></details>
      <p>{state === 'applied' ? 'Applied to your working file. Undo is available here. Git staging is unchanged.' : 'No files have been changed. Review this proposal before applying it.'}</p>
      {error && <p role="alert">{error}</p>}
    </div>
    <div className="review-actions">{state === 'applied'
      ? <button type="button" disabled={locked || pending} onClick={() => void act('undo')}>Undo fix</button>
      : <><button type="button" disabled={!editCode || locked || pending} onClick={() => void act('apply')}>Approve and apply fix</button><button type="button" aria-label="Cancel fix" disabled={locked || pending} onClick={() => void act('cancel')}>Cancel</button></>}
    </div>
  </Review>;
}
