import styled from 'styled-components';
import { theme } from '../styles/theme';

export const ContextBar = styled.div`
  border-top: 1px solid ${theme.border}; padding: 12px 18px; display: flex; gap: 8px;
  align-items: center; flex-wrap: wrap; max-height: 110px; overflow: auto; font-size: 10px;
  button { background: #a3f00012; border: 1px solid #a3f00035; padding: 6px; color: #b4fa36; border-radius: 5px; }
`;
