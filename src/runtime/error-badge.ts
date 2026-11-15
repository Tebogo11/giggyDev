import { capture } from '../capture';

/** Errors remain unread until the launcher is opened; clearing entries removes them. */
export function attachErrorBadge(launcher: HTMLButtonElement) {
  let acknowledgedId = 0;
  const badge = document.createElement('span');
  badge.id = 'giggydev-error-badge';
  badge.setAttribute('role', 'img');
  badge.style.cssText = 'position:absolute;top:-7px;right:-7px;width:22px;height:22px;padding:0;border:2px solid #151719;border-radius:50%;background:#dc2626;color:white;font:700 9px/18px system-ui;box-sizing:border-box;text-align:center;pointer-events:none';
  launcher.append(badge);
  launcher.setAttribute('aria-describedby', badge.id);
  function update() {
    const count = capture.snapshot().filter(entry => entry.level === 'error' && entry.id > acknowledgedId).length;
    badge.hidden = count === 0;
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.setAttribute('aria-label', `${count} unread errors`);
  }
  const unsubscribe = capture.subscribe(update);
  update();
  return {
    acknowledge() { acknowledgedId = capture.snapshot().at(-1)?.id ?? 0; update(); },
    dispose() { unsubscribe(); badge.remove(); launcher.removeAttribute('aria-describedby'); },
  };
}
