import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Toolbar = styled.div`
  display: flex; gap: 10px; padding: 18px; flex-wrap: wrap;
  input { flex: 1; min-width: 100px; }
  input, select, button { background: ${theme.panel}; border: 1px solid ${theme.border}; border-radius: 7px; padding: 8px; color: ${theme.text}; }
  @media (max-width: 650px) { padding: 10px; gap: 6px; > * { max-width: 100%; } }
`;

export const EntryList = styled.div.attrs({ className: 'entries' })`
  flex: 1; overflow: auto; padding: 0 18px;
`;

export const EntryRow = styled.article.attrs({ className: 'entry' })`
  display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid ${theme.border}; align-items: baseline;
  input { accent-color: ${theme.lime}; }
  details { min-width: 0; flex: 1; }
  summary { cursor: pointer; overflow-wrap: anywhere; font: 12px/1.8 monospace; }
  time { color: #89939c; font-size: 10px; }
  pre { white-space: pre-wrap; overflow-wrap: anywhere; font: 12px/1.7 monospace; background: ${theme.background}; padding: 14px; border-radius: 8px; }
`;

export const Level = styled.span<{ $level: string }>`
  color: ${({ $level }) => $level === 'error' ? '#ff8f8f' : $level === 'warn' ? '#ebcb78' : theme.lime};
  margin-right: 12px;
`;

export const Hint = styled.p`
  color: ${theme.muted}; line-height: 1.7; font-size: 10px; margin: 10px 18px;
`;
