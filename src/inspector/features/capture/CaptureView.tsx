import React, { useState } from 'react';
import { capture, type Entry } from '../../../capture/index';
import { EntryList, EntryRow, Hint, Level, Toolbar } from './CaptureView.styles';

interface CaptureViewProps {
  kind: Entry['kind'];
  entries: Entry[];
  selected: Set<number>;
  onToggle: (id: number) => void;
}
export function CaptureView({ kind, entries, selected, onToggle }: CaptureViewProps) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const levels = kind === 'console' ? ['log', 'info', 'debug', 'warn', 'error'] : ['success', 'error'];
  const rows = entries.filter(entry => entry.kind === kind
    && (filter === 'all' || entry.level === filter)
    && entry.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Toolbar>
        <input aria-label="Search entries" placeholder="Filter entries…" value={search} onChange={event => setSearch(event.target.value)} />
        <select aria-label="Severity" value={filter} onChange={event => setFilter(event.target.value)}>
          <option value="all">All levels</option>
          {levels.map(level => <option key={level}>{level}</option>)}
        </select>
        <button onClick={() => capture.clear(kind)}>Clear {kind}</button>
      </Toolbar>
      <EntryList>
        {rows.length ? rows.map(entry => (
          <EntryRow key={entry.id}>
            <input type="checkbox" aria-label={`Attach ${entry.label}`} checked={selected.has(entry.id)} onChange={() => onToggle(entry.id)} />
            <details>
              <summary><Level $level={entry.level}>{entry.level}</Level><time>{entry.time}</time> {entry.label}</summary>
              <pre>{entry.detail}</pre>
            </details>
          </EntryRow>
        )) : <Hint>No matching entries. Close the overlay and try a playground test.</Hint>}
      </EntryList>
      <Hint>Latest 200 events · {kind === 'console' ? 'Capture begins when the widget loads.' : 'Fetch + XHR metadata and bounded request payloads. Response bodies and headers are not captured.'}</Hint>
    </>
  );
}
