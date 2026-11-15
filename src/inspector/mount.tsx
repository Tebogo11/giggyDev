import React from 'react';
import { createRoot } from 'react-dom/client';
import { StyleSheetManager } from 'styled-components';
import { Inspector } from './Inspector';
import type { WidgetOptions } from '../runtime/mount-widget';

interface MountOptions {
  container: HTMLElement;
  styleTarget: HTMLElement;
  launcher: HTMLButtonElement;
  options: WidgetOptions;
}

export function mountInspector({ container, styleTarget, launcher, options }: MountOptions) {
  const root = createRoot(container);
  function render(open: boolean) {
    launcher.setAttribute('aria-expanded', String(open));
    root.render(
      <StyleSheetManager target={styleTarget}>
        <Inspector open={open} options={options} onClose={() => {
          render(false);
          launcher.focus();
        }} />
      </StyleSheetManager>,
    );
  }
  return { open: () => render(true), dispose: () => root.unmount() };
}
