import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const SourcePanel = styled.section`
  display: block; flex: none; margin: 18px 0; padding: 14px;
  background: ${theme.background}; border: 1px solid ${theme.border}; border-radius: 9px;
  h3 { margin: 0 0 10px; font-size: 12px; overflow-wrap: anywhere; }
  p { font-size: 11px; color: ${theme.muted}; line-height: 1.7; }
  a { color: ${theme.lime}; font-size: 11px; display: inline-block; margin: 8px 0; }
  pre { margin: 12px 0 0; overflow: auto; max-height: 350px; font: 11px/1.8 monospace; white-space: pre; }
`;
export const SourceLine = styled.span<{ $active: boolean }>`
  display: block; background: ${({ $active }) => $active ? '#a3f00020' : 'transparent'};
  border-left: 2px solid ${({ $active }) => $active ? theme.lime : 'transparent'};
  padding-right: 10px;
  .line-number { display: inline-block; width: 42px; color: ${theme.muted}; user-select: none; padding-left: 8px; }
`;
