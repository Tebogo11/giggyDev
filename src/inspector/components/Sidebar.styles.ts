import styled from 'styled-components';
import { theme } from '../styles/theme';

export const SidebarShell = styled.aside`
  width: 190px; flex-shrink: 0; background: #181b1ef2; padding: 26px 16px;
  display: flex; flex-direction: column; border-right: 1px solid ${theme.border};
  @media (max-width: 650px) { width: 115px; padding: 20px 8px; }
`;

export const Brand = styled.div`
  font-weight: 800; font-size: 23px; letter-spacing: -1px; margin: 0 8px 5px;
  span { color: ${theme.lime}; }
  @media (max-width: 650px) { font-size: 17px; }
`;

export const Eyebrow = styled.p`
  font-size: 9px; letter-spacing: 1.5px; color: #939ba2; margin: 0 8px 35px;
  @media (max-width: 650px) { font-size: 8px; letter-spacing: 0; }
`;

export const Navigation = styled.nav`
  display: grid; gap: 6px;
  button { border: 0; text-align: left; padding: 12px; border-radius: 9px; background: transparent; color: ${theme.muted}; }
  button[aria-pressed=true] { background: #a3f00015; color: #b4fa36; }
`;

export const Picker = styled.button`
  margin-top: auto; text-align: left; padding: 12px; border-radius: 9px;
  background: transparent; color: ${theme.muted}; border: 1px solid ${theme.border};
  &:disabled { cursor: not-allowed; }
`;

export const Status = styled.div`
  color: ${theme.lime}; font: 9px monospace; margin: 20px 8px 0;
  @media (max-width: 650px) { margin: 18px 0; font-size: 8px; }
`;
