import React from 'react';
import { Brand, Eyebrow, Navigation, Picker, SidebarShell, Status } from './Sidebar.styles';
export const views = ['Chat', 'Console', 'Network', 'Elements', 'Sources'] as const;
export type View = typeof views[number];

export function Sidebar({ view, demo, onChange, onPick, errorCounts }: { errorCounts: Record<'Console' | 'Network', number>; view: View; demo: boolean; onChange: (view: View) => void; onPick: () => void }) {
  return (
    <SidebarShell>
      <Brand>giggy<span>Dev</span></Brand>
      <Eyebrow>A LITTLE MORE CONTEXT.</Eyebrow>
      <Navigation aria-label="Debugger views">
        {views.map(item => {
          const count = item === 'Console' || item === 'Network' ? errorCounts[item] : 0;
          return (
          <button key={item} aria-label={item} aria-describedby={count ? `giggydev-${item}-errors` : undefined} autoFocus={item === 'Chat'} aria-pressed={view === item} onClick={() => onChange(item)}>{item}{count > 0 && <span className="error-count" id={`giggydev-${item}-errors`} aria-label={`${count} ${item.toLowerCase()} errors`}>{count > 99 ? '99+' : count}</span>}</button>
        );})}
      </Navigation>
      <Picker onClick={onPick}>⌖ Find component</Picker>
      <Status>● {demo ? 'PLAYGROUND DEMO' : 'DEVELOPMENT ONLY'}</Status>
    </SidebarShell>
  );
}
