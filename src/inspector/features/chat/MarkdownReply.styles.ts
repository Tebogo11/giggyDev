import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Reply = styled.div`
  line-height: 1.7; overflow-wrap: anywhere;
  p { white-space: normal; margin: 10px 0; }
  h1, h2, h3, h4, h5, h6 { line-height: 1.35; margin: 20px 0 10px; font-weight: 650; }
  h1 { font-size: 23px; } h2 { font-size: 20px; } h3 { font-size: 17px; }
  h4, h5, h6 { font-size: 14px; }
  > :first-child { margin-top: 0; }
  ul, ol { padding-left: 24px; margin: 10px 0; } li { margin: 5px 0; }
  a { color: ${theme.lime}; text-decoration: underline; }
  blockquote { border-left: 3px solid ${theme.border}; padding-left: 14px; margin: 12px 0; color: ${theme.muted}; }
  code { font: 12px/1.7 monospace; background: ${theme.panel}; padding: 2px 5px; border-radius: 4px; }
  .code-block { margin: 14px 0; border: 1px solid ${theme.border}; border-radius: 8px; overflow: hidden; }
  .code-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 7px 10px; background: ${theme.panel}; font-size: 11px; color: ${theme.muted}; }
  button { background: none; color: ${theme.lime}; border: 1px solid ${theme.border}; border-radius: 4px; padding: 3px 8px; cursor: pointer; }
  pre { margin: 0; padding: 12px; overflow-x: auto; white-space: pre; background: ${theme.background}; }
  pre code { padding: 0; background: none; }
  hr { border: 0; border-top: 1px solid ${theme.border}; margin: 18px 0; }
`;
