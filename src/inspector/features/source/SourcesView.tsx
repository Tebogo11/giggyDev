import React from 'react';
import type { Entry } from '../../../capture';
import type { WidgetOptions } from '../../../runtime/mount-widget';
import { EntryList } from '../capture/CaptureView.styles';
import { SourceViewer } from './SourceViewer';
import { sourceFromEntry } from './selection';

export function SourcesView({ entries, resolveSource }: { entries: Entry[]; resolveSource?: WidgetOptions['resolveSource'] }) {
  const latest = entries.filter(entry => entry.kind === 'element').at(-1);
  return <EntryList><SourceViewer location={sourceFromEntry(latest)} resolveSource={resolveSource} /></EntryList>;
}
