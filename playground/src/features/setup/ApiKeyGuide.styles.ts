import styled from 'styled-components';

export const Guide = styled.section`
  padding: 56px 9%; border-bottom: 1px solid var(--border);
  h2 { font-size: 32px; letter-spacing: -1px; margin: 18px 0 12px; }
  > p { color: var(--muted); font-size: 13px; line-height: 1.9; max-width: 760px; }
  .comet-setup { margin-top: 40px; padding-top: 28px; border-top: 1px solid var(--border); }
  .comet-setup > h3 { font-size: 23px; }
  .comet-setup > p { color: var(--muted); font-size: 12px; line-height: 1.8; }
  .guide-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 26px; }
  article { min-width: 0; padding: 24px; border: 1px solid var(--border); border-radius: 12px; background: var(--panel); }
  h3 { margin: 0 0 12px; font-size: 14px; }
  article p, li { color: var(--muted); font-size: 12px; line-height: 1.8; }
  a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
  select, button { font: inherit; border: 1px solid var(--border); border-radius: 6px; background: var(--background); color: var(--text); padding: 9px; max-width: 100%; }
  select { display: block; width: 100%; margin: 10px 0; }
  label { font-size: 12px; }
  pre { white-space: pre-wrap; overflow-wrap: anywhere; font: 11px/1.8 monospace; color: var(--text); }
  .guide-note { font-size: 11px; color: var(--muted); margin-top: 20px; line-height: 1.8; }
  @media (max-width: 800px) { padding: 40px 6%; .guide-grid { grid-template-columns: 1fr; } h2 { font-size: 28px; } }
`;
