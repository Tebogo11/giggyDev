import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Review = styled.section`
  display: flex; flex-direction: column; flex: none; margin: 12px 24px; padding: 14px;
  border: 1px solid ${theme.border}; border-radius: 9px; background: ${theme.background}; max-height: 35vh; min-height: 120px; overflow: hidden; flex-shrink: 1;
  .review-body { min-height: 0; overflow: auto; }
  .review-actions { flex-shrink: 0; display: flex; flex-wrap: wrap; gap: 8px; padding-top: 10px; border-top: 1px solid #343a40; }
  h3 { font-size: 13px; margin: 0 0 8px; overflow-wrap: anywhere; }
  p, summary { font-size: 11px; line-height: 1.7; }
  pre { font: 11px/1.7 monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
  .removed { display: block; background: #ef444420; color: #ffaaaa; }
  .added { display: block; background: #a3f00015; color: #c4e989; }
  button { margin-right: 8px; padding: 8px; border: 1px solid ${theme.border}; background: ${theme.panel}; border-radius: 6px; }
`;
