import type { Entry } from './types';

const MAX_ENTRIES = 200;
let entries: Entry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

export const capture = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  snapshot: () => entries,
  clear(kind: Entry['kind']) {
    entries = entries.filter(entry => entry.kind !== kind);
    listeners.forEach(notify => notify());
  },
};
export function record(kind: Entry['kind'], level: string, label: string, detail: string) {
  const entry: Entry = {
    id: nextId++, kind, level,
    label: label.slice(0, 500), detail: detail.slice(0, 10000),
    time: new Date().toLocaleTimeString(),
  };
  entries = [...entries.slice(-(MAX_ENTRIES - 1)), entry];
  listeners.forEach(notify => notify());
  return entry;
}
