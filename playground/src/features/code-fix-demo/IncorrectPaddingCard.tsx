import React from 'react';

// Edit sourcePadding for the latest requested value (24px is only an example).
// sourceUpdated becomes true after a hot edit. The 4px branch is an intentional
// first-load preview reset, not a missing value: do not add fallback padding.
// demoPadding is hosted-simulation-only and undefined in local edit tests.
// Use Show source padding after refresh to display the saved source value.
export function IncorrectPaddingCard({ demoPadding, sourceUpdated = false }: { demoPadding?: '4px' | '24px'; sourceUpdated?: boolean }) {
  const sourcePadding = '12px';
  const padding = demoPadding ?? (sourceUpdated ? sourcePadding : '4px');
  return (
    <article id="padding-fix-card" style={{ padding, border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--panel)' }}>
      <h3>Give this card some breathing room</h3>
      <p>Select this card with Find component, then ask the AI to correct its padding.</p>
      <span>Example target: 24px. Other values are valid when requested.</span>
    </article>
  );
}
