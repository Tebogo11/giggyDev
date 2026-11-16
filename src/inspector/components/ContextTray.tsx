import React from 'react';
import type { Entry } from '../../capture/index';
import { ContextBar } from './ContextTray.styles';

export function ContextTray({ entries, onRemove }: { entries: Entry[]; onRemove: (id: number) => void }) {
  return (
    <ContextBar aria-label="Selected context">
      <strong>{entries.length} selected</strong>
      {entries.map(entry => (
        <button key={entry.id} onClick={() => onRemove(entry.id)} aria-label={`Remove ${entry.label}`}>
          {entry.kind}: {entry.label.slice(0, 55)} ×
        </button>
      ))}
    </ContextBar>
  );
}
