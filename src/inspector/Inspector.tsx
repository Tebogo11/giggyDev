import { SourcesView } from './features/source/SourcesView';
import { startElementPicker } from './features/picker/picker';
import { ElementsView } from './features/picker/ElementsView';
import { record } from '../capture/store';
import { serialize } from '../capture';
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { capture } from '../capture/index';
import type { WidgetOptions } from '../runtime/mount-widget';
import { CaptureView } from './features/capture/CaptureView';
import { ChatPanel } from './features/chat/ChatPanel';
import { ContextTray } from './components/ContextTray';
import { Sidebar, type View } from './components/Sidebar';
import { Backdrop, Badge, ChatSlot, CloseButton, Dialog, Header, Main, Surface } from './styles/layout.styles';

export function Inspector({ open, options, onClose }: { open: boolean; options: WidgetOptions; onClose: () => void }) {
  const [picking, setPicking] = useState(false);
  const [view, setView] = useState<View>('Chat');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const entries = useSyncExternalStore(capture.subscribe, capture.snapshot);
  const dialog = useRef<HTMLDialogElement>(null);
  const attachments = entries.filter(entry => selected.has(entry.id));

  useEffect(() => {
    if (open && !picking) dialog.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus();
  }, [open, picking]);

  useEffect(() => {
    if (!picking || !open) return;
    return startElementPicker(element => {
      const entry = record('element', 'info', element.selector, serialize(element));
      setSelected(current => new Set([...current, entry.id]));
      setView('Elements');
      setPicking(false);
    }, () => setPicking(false));
  }, [picking, open]);

  function toggle(id: number) {
    setSelected(current => {
      const activeIds = new Set(entries.map(entry => entry.id));
      const next = new Set([...current].filter(value => activeIds.has(value)));
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    if (event.key !== 'Tab' || !dialog.current) return;
    const controls = Array.from(dialog.current.querySelectorAll<HTMLElement>('button:not(:disabled),input,select,summary,textarea:not(:disabled)')).filter(control => control.getClientRects().length > 0);
    const first = controls[0], last = controls.at(-1);
    const active = (dialog.current.getRootNode() as ShadowRoot).activeElement;
    if (event.shiftKey && active === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && active === last) { event.preventDefault(); first?.focus(); }
  }

  // Keep the inspector mounted so closing and reopening preserves context and chat.
  return (
    <Surface hidden={!open || picking}>
      <Backdrop onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
        <Dialog open={open} ref={dialog} aria-modal="true" aria-label="giggyDev debugger" onKeyDown={handleKeyDown}>
          <Sidebar errorCounts={{Console: entries.filter(entry => entry.kind === 'console' && entry.level === 'error').length, Network: entries.filter(entry => entry.kind === 'network' && entry.level === 'error').length}} view={view} demo={options.mode === 'demo'} onChange={setView} onPick={() => setPicking(true)} />
          <Main>
            <Header><h2>{view}</h2><div><Badge>CAPTURE PREVIEW</Badge><CloseButton aria-label="Close giggyDev" onClick={onClose}>×</CloseButton></div></Header>
            {view === 'Console' || view === 'Network' ? (
              <CaptureView key={view} kind={view === 'Console' ? 'console' : 'network'} entries={entries} selected={selected} onToggle={toggle} />
            ) : view === 'Elements' ? <ElementsView entries={entries} selected={selected} onToggle={toggle} /> : view === 'Sources' ? <SourcesView entries={entries} resolveSource={options.resolveSource} /> : null}
            <ChatSlot $active={view === 'Chat'}>
              <ChatPanel context={attachments} options={options} onClose={onClose} />
            </ChatSlot>
            <ContextTray entries={attachments} onRemove={toggle} />
          </Main>
        </Dialog>
      </Backdrop>
    </Surface>
  );
}
