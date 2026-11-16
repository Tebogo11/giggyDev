import type { AIClient } from '../ai/types';
import type { SourceLocation, SourcePreview } from '../inspector/features/source/types';
import { attachErrorBadge } from './error-badge';
import { startCapture } from '../capture/index';
import type { Entry } from '../capture/index';

export interface WidgetOptions {
  mode: 'development' | 'demo';
  aiClient?: AIClient;
  gettingStartedUrl?: string;
  resolveSource?: (location: SourceLocation, signal?: AbortSignal) => Promise<SourcePreview>;
  simulateReply?: (message: string, context: Entry[]) => Promise<string>;
}

/** Start collectors immediately; load React and the inspector only on demand. */
export function mountWidget(options: WidgetOptions): () => void {
  if (document.getElementById('giggydev-host')) return () => {};

  const stopCapture = startCapture();
  const host = document.createElement('div');
  host.id = 'giggydev-host';
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none';
  const shadow = host.attachShadow({ mode: 'open' });
  const styleTarget = document.createElement('div');
  const container = document.createElement('div');
  container.style.pointerEvents = 'auto';
  const launcher = document.createElement('button');
  const glyph = document.createElement('span');
  glyph.textContent = 'g↗';
  launcher.append(glyph);
  launcher.setAttribute('aria-label', 'Open giggyDev');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.style.cssText = 'position:fixed;bottom:24px;left:24px;width:54px;height:54px;border:1px solid #b5ff35;border-radius:17px;background:#a3f000;color:#151719;font:800 26px system-ui;box-shadow:0 8px 32px #0005;cursor:pointer;pointer-events:auto';
  const errors = attachErrorBadge(launcher);
  shadow.append(styleTarget, container, launcher);
  document.body.append(host);

  let disposed = false;
  let inspector: Awaited<ReturnType<typeof import('../inspector/mount')['mountInspector']>> | undefined;

  launcher.onclick = async () => {
    errors.acknowledge();
    if (inspector) { inspector.open(); return; }
    launcher.disabled = true;
    try {
      const { mountInspector } = await import('../inspector/mount');
      if (disposed) return;
      inspector = mountInspector({ container, styleTarget, launcher, options });
      inspector.open();
    } catch {
      glyph.textContent = '!';
      launcher.title = 'Inspector failed to load. Click to retry.';
    } finally {
      launcher.disabled = false;
    }
  };

  return () => {
    disposed = true;
    errors.dispose();
    stopCapture();
    inspector?.dispose();
    host.remove();
  };
}
