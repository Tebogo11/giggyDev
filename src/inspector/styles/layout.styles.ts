import styled from 'styled-components';
import { theme } from './theme';

export const Surface = styled.div`
  color-scheme: dark;
  font: 13px Sora, system-ui, sans-serif;
  color: ${theme.text};
  * { box-sizing: border-box; }
  :where(button, input, select, textarea) { font: inherit; }
  :where(button) { cursor: pointer; color: inherit; }
  :is(button, input, select, summary, textarea):focus-visible {
    outline: 2px solid ${theme.lime}; outline-offset: 3px;
  }
`;

export const Backdrop = styled.div`
  position: fixed; inset: 0; background: #080a0d66; backdrop-filter: blur(5px);
  display: grid; place-items: center;
`;

export const Dialog = styled.dialog`
  position: relative; display: flex; margin: 0; padding: 0;
  width: 80vw; height: 80vh; max-width: none; max-height: none;
  border: 1px solid ${theme.border}; border-radius: 20px; overflow: hidden;
  background: rgb(21 23 25 / .8); color: ${theme.text}; box-shadow: 0 30px 100px #0008;
  @media (max-width: 650px) { width: 96vw; height: 92vh; }
`;

export const Main = styled.section`
  flex: 1; min-width: 0; display: flex; flex-direction: column;
`;

export const Header = styled.header`
  min-height: 70px; padding: 0 24px; border-bottom: 1px solid ${theme.border};
  display: flex; align-items: center; justify-content: space-between;
  h2 { font-size: 15px; font-weight: 500; }
  @media (max-width: 650px) { padding: 0 12px; }
`;

export const Badge = styled.span`
  font: 10px monospace; color: ${theme.muted}; border: 1px solid ${theme.border};
  padding: 5px 8px; border-radius: 6px;
  @media (max-width: 650px) { display: none; }
`;

export const CloseButton = styled.button`
  border: 0; background: transparent; color: ${theme.muted}; font-size: 24px; margin-left: 20px;
`;

export const EmptyState = styled.div`
  flex: 1; overflow: auto; display: grid; place-content: center; text-align: center; padding: 24px;
  h1 { font-size: 27px; letter-spacing: -1px; margin: 24px 0 10px; }
  p { color: ${theme.muted}; line-height: 1.8; max-width: 400px; }
  @media (max-width: 650px) { h1 { font-size: 21px; } }
`;

export const Mark = styled.div`
  margin: auto; width: 62px; height: 62px; display: grid; place-items: center;
  background: #a3f00012; border: 1px solid #a3f00035; border-radius: 20px;
  color: ${theme.lime}; font-size: 30px; font-weight: 800;
`;

export const ChatSlot = styled.div<{ $active: boolean }>`
  display: ${({ $active }) => $active ? 'contents' : 'none'};
`;
