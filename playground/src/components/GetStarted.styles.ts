import styled from 'styled-components';

export const SetupChoices = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap; margin: 22px 0;
  button { padding: 10px 12px; border: 1px solid var(--border); border-radius: 7px; background: var(--panel); color: var(--text); font-size: 11px; }
  button[aria-pressed=true] { border-color: var(--accent); color: var(--accent); }
`;
export const ConfigStack = styled.div`
  min-width: 0; display: grid; gap: 18px;
  .code { min-width: 0; width: 100%; align-self: stretch; }
  pre { max-width: 100%; overflow: auto; }
  button { border: 1px solid var(--border); border-radius: 6px; background: var(--background); color: var(--text); padding: 8px 12px; font-size: 11px; }
  details { border: 1px solid var(--border); background: var(--panel); border-radius: 10px; padding: 18px; min-width: 0; }
  summary { cursor: pointer; font-size: 12px; }
  .copy-result { font-size: 10px; }
`;
export const SetupSteps = styled.ol`
  padding-left: 20px; color: var(--muted); font-size: 12px; line-height: 1.9;
  li { margin-bottom: 16px; }
  strong { color: var(--text); }
  code { overflow-wrap: anywhere; }
  a { color: var(--accent); text-decoration: underline; }
`;
