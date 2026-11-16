import React, { useEffect, useRef, useState } from 'react';
import type { Entry } from '../../../capture';
import type { WidgetOptions } from '../../../runtime/mount-widget';
import type { AIConfiguration, ChatMessage, ChatRequest, FixProposal } from '../../../ai/types';
import { Composer, ComposerActions, Conversation } from './ChatPanel.styles';
import { EmptyState, Mark } from '../../styles/layout.styles';
import { MarkdownReply } from './MarkdownReply';
import { FixReview } from '../fixes/FixReview';

type Turn = ChatMessage & { id: number; fix?: FixProposal };
const setup = 'Add an AI key and model in .env.local, or configure ai.models in the Vite plugin. Restart the dev server after setup.';
interface ChatPanelProps { context: Entry[]; options: WidgetOptions; onClose: () => void }

export function ChatPanel({ context, options, onClose }: ChatPanelProps) {
  const demo = options.mode === 'demo';
  const client = options.aiClient;
  const [configuration, setConfiguration] = useState<AIConfiguration>({ models: [] });
  const [setupLoaded, setSetupLoaded] = useState(false);
  const [modelId, setModelId] = useState('');
  const [editCode, setEditCode] = useState(() => {
    try { return localStorage.getItem('giggydev-edit-code') === 'true'; } catch { return false; }
  });
  const [draft, setDraft] = useState('');
  // Conversation and review history live only in this mounted page session.
  const [messages, setMessages] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [error, setError] = useState('');
  const nextId = useRef(0);
  const activeRequest = useRef<AbortController | undefined>(undefined);
  const conversation = useRef<HTMLDivElement>(null);
  const followReply = useRef(true);
  const busy = pending || reviewBusy;

  useEffect(() => {
    if (followReply.current && conversation.current) conversation.current.scrollTop = conversation.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    let disposed = false;
    setSetupLoaded(false);
    if (demo) { setModelId('demo-fast'); return; }
    if (!client) setSetupLoaded(true);
    client?.configuration().then(result => {
      if (disposed) return;
      setConfiguration(result);
      setSetupLoaded(true);
      setModelId(result.models.find(model => model.ready)?.id ?? result.models[0]?.id ?? '');
    }).catch(() => { if (!disposed) setError('Could not load AI setup. Restart the development server.'); });
    return () => { disposed = true; activeRequest.current?.abort(); };
  }, [client, demo]);

  function changeEditCode(enabled: boolean) {
    setEditCode(enabled);
    try { localStorage.setItem('giggydev-edit-code', String(enabled)); } catch { /* Optional preference storage. */ }
  }
  function updateTurn(id: number, update: Partial<Turn>) {
    setMessages(current => current.map(turn => turn.id === id ? { ...turn, ...update } : turn));
  }
  function updateFix(id: number, state: NonNullable<FixProposal['state']>) {
    setMessages(current => current.map(turn => turn.id === id && turn.fix ? { ...turn, fix: { ...turn.fix, state } } : turn));
  }
  function request(question: string): ChatRequest {
    return {
      modelId, editCode: !demo && editCode, context,
      messages: [...messages.filter(turn => turn.content.trim()).map(({role, content}) => ({role, content: content.slice(0, 12000)})), {role: 'user', content: question}].slice(-20) as ChatMessage[],
    };
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || busy) return;
    setError('');
    if (!demo && (!client || !configuration.models.find(model => model.id === modelId)?.ready)) { setError(configuration.setupMessage ?? setup); return; }
    const payload = request(question);
    const userId = ++nextId.current, replyId = ++nextId.current;
    setMessages(current => [...current, {id:userId, role:'user', content:question}, {id:replyId, role:'assistant', content:''}]);
    setDraft(''); setPending(true); followReply.current = true;
    const abort = new AbortController(); activeRequest.current = abort;
    const append = (text: string) => setMessages(current => current.map(turn => turn.id === replyId ? {...turn, content:turn.content + text} : turn));
    try {
      if (demo) {
        const answer = await options.simulateReply?.(question, context) ?? 'This is a simulated playground reply.';
        append('This is just a playground. Download giggyDev and try it for yourself.\n\n' + answer);
      } else {
        await client!.chat(payload, append, abort.signal, fix => updateTurn(replyId, {content:fix.explanation, fix}));
      }
    } catch (reason) {
      const message = abort.signal.aborted ? 'Reply stopped.' : reason instanceof Error ? reason.message : 'AI request failed';
      updateTurn(replyId, {content:message});
      setError(message);
    } finally { setPending(false); activeRequest.current = undefined; }
  }
  function clearChat() {
    // Retain actionable cards so clearing text cannot discard approval or Undo.
    setMessages(current => current.filter(turn => turn.fix?.state === 'applied' || turn.fix && (turn.fix.state ?? 'proposed') === 'proposed').map(turn => ({...turn, content:''})));
    setDraft(''); setError(''); followReply.current = true;
  }
  const selectedModel = configuration.models.find(model => model.id === modelId);
  const keyMissing = !demo && setupLoaded && (selectedModel ? !selectedModel.ready : !(configuration.hasKey ?? configuration.models.some(model => model.ready)));
  const hasText = messages.some(turn => turn.content.trim());

  return <>
    {messages.length ? <Conversation ref={conversation} role="log" aria-label="Conversation" aria-live="polite" onScroll={event => {
      const node = event.currentTarget;
      followReply.current = node.scrollHeight - node.scrollTop - node.clientHeight < 40;
    }}>
      {messages.map(turn => <article key={turn.id} data-turn-id={turn.id}>
        <small>{turn.role === 'user' ? 'You' : demo ? 'Simulated reply' : 'AI reply'}</small>
        {turn.content ? <MarkdownReply content={turn.content} /> : !turn.fix && pending ? <p>Thinking.</p> : null}
        {turn.fix && client && <FixReview proposal={turn.fix} client={client} editCode={editCode} locked={busy} onStateChange={state => updateFix(turn.id, state)} onBusyChange={setReviewBusy} />}
      </article>)}
    </Conversation> : <EmptyState><Mark>g?</Mark><h1>Give your AI the full picture.</h1><p>Select logs, requests or a component, choose a model and ask about them.</p></EmptyState>}
    <Composer onSubmit={submit}>
      {demo ? <small>This is just a playground. Download giggyDev and try it for yourself. <a href={options.gettingStartedUrl ?? '#start'} onClick={onClose}>Get started</a></small>
        : keyMissing ? <small data-testid="api-key-help">Keys stay in .env.local or server plugin options. {configuration.setupMessage ?? setup}</small> : null}
      {error && <p role="alert">{error}{error.includes('(429)') && selectedModel?.provider === 'openai' && <><br/><a href="https://platform.openai.com/usage" target="_blank" rel="noreferrer">API usage</a>{' / '}<a href="https://platform.openai.com/settings/organization/billing/overview" target="_blank" rel="noreferrer">API billing</a></>}</p>}
      <textarea aria-label="Message" maxLength={12000} disabled={busy} value={draft} onChange={event => setDraft(event.target.value)} placeholder={editCode && !demo ? 'Ask a question or describe the code change you want.' : 'Ask about your selected context.'} />
      <ComposerActions aria-label="Chat actions">
        <button type="submit" disabled={busy || !draft.trim()}>{demo ? 'Send demo message' : 'Send message'}</button>
        {pending && <button type="button" onClick={() => activeRequest.current?.abort()}>Stop reply</button>}
        {!demo && <label className="edit-code-toggle"><input type="checkbox" role="switch" aria-label="Edit code" checked={editCode} disabled={busy} onChange={event => changeEditCode(event.target.checked)} />Edit code</label>}
        <button type="button" disabled={busy || (!hasText && !draft && !error)} onClick={clearChat}>Clear chat</button>
        <label className="model-select">Model <select aria-label="AI model" value={modelId} disabled={busy} onChange={event => {setModelId(event.target.value);setError('');}}>
          {demo ? <><option value="demo-fast">Demo - Fast (simulated)</option><option value="demo-reasoning">Demo - Reasoning (simulated)</option></>
            : <><option value="">Select a configured model</option>{configuration.models.map(model => <option key={model.id} value={model.id}>{model.label}{model.ready ? '' : ' - key required'}</option>)}</>}
        </select></label>
      </ComposerActions>
    </Composer>
  </>;
}
