import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const Composer = styled.form`
  flex-shrink: 0;
  margin: 12px 24px 24px;
  border: 1px solid ${theme.border};
  background: ${theme.panel};
  border-radius: 12px;
  padding: 15px;
  a { color: ${theme.lime}; }
  [role="alert"] { color: #ffaaaa; font-size: 11px; line-height: 1.6; }
  textarea {
    display: block; width: 100%; resize: vertical; background: none;
    border: 0; color: ${theme.text}; min-height: 55px;
  }
  button { border: 0; border-radius: 6px; padding: 8px 12px; background: ${theme.lime}; color: ${theme.background}; }
  small { color: ${theme.muted}; display: block; margin-bottom: 8px; }
`;
export const ComposerActions = styled.div`
  display: flex; align-items: center; flex-wrap: wrap; gap: 10px;
  margin-top: 16px;
  button { margin: 0; }
  .edit-code-toggle { display: flex; align-items: center; gap: 6px; font-size: 11px; color: ${theme.text}; cursor: pointer; }
  .edit-code-toggle input { accent-color: ${theme.lime}; margin: 0; }
  .model-select {
    display: flex; align-items: center; gap: 8px; margin-left: auto;
    min-width: 0; max-width: 100%; flex: 0 1 260px;
    font-size: 11px; color: ${theme.muted};
  }
  select {
    flex: 1; min-width: 0; max-width: 100%; width: 100%;
    background: ${theme.background}; color: ${theme.text};
    border: 1px solid ${theme.border}; border-radius: 6px; padding: 7px;
  }
  @media (max-width: 650px) {
    .model-select { flex-basis: 100%; margin-left: 0; }
  }
`;
export const Conversation = styled.div`
  flex: 1; overflow: auto; padding: 18px 24px;
  article { margin-bottom: 18px; }
  p { white-space: pre-wrap; line-height: 1.7; overflow-wrap: anywhere; }
  small { color: ${theme.lime}; }
`;
