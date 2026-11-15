import React from 'react';
import type { Entry } from '../../../capture';
import { EntryList, EntryRow, Hint } from '../capture/CaptureView.styles';

export function ElementsView({ entries, selected, onToggle }: { entries: Entry[]; selected: Set<number>; onToggle: (id: number) => void }) {
  const elements = entries.filter(entry => entry.kind === 'element');
  return (
    <>
      <Hint>Use Find component to pick a rendered element. Element metadata stays here. Open Sources to inspect the selected JSX location. React ownership is not inferred.</Hint>
      <EntryList>
        {elements.length ? elements.map(entry => (
          <EntryRow key={entry.id}>
            <input type="checkbox" checked={selected.has(entry.id)} aria-label={`Attach ${entry.label}`} onChange={() => onToggle(entry.id)} />
            <details open><summary>{entry.label}</summary><pre>{entry.detail}</pre></details>
          </EntryRow>
        )) : <Hint>No element selected yet. Choose Find component, then click an element in your app.</Hint>}
      </EntryList>
    </>
  );
}
