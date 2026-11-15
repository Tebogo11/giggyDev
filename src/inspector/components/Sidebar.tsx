import React from 'react';
import { Brand, Eyebrow, Navigation, Picker, SidebarShell, Status } from './Sidebar.styles';
export const views = ['Chat', 'Console', 'Network', 'Elements', 'Sources'] as const;
export type View = typeof views[number];

export function Sidebar({ view, demo, onChange, onPick }: { view: View; demo: boolean; onChange: (view: View) => void; onPick: () => void }) {
  return (
    <SidebarShell>
      <Brand>giggy<span>Dev</span></Brand>
      <Eyebrow>A LITTLE MORE CONTEXT.</Eyebrow>
      <Navigation aria-label="Debugger views">
        {views.map(item => (
          <button key={item} autoFocus={item === 'Chat'} aria-pressed={view === item} onClick={() => onChange(item)}>{item}</button>
        ))}
      </Navigation>
      <Picker onClick={onPick}>⌖ Find component</Picker>
      <Status>● {demo ? 'PLAYGROUND DEMO' : 'DEVELOPMENT ONLY'}</Status>
    </SidebarShell>
  );
}
