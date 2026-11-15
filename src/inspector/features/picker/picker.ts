import type { SourceLocation } from '../source/types';
export interface PickedElement {
  source?: SourceLocation;
  tag: string;
  selector: string;
  text: string;
  attributes: { id?: string; classes: string[]; role?: string; label?: string };
  bounds: { width: number; height: number };
}

function selectorFor(element: Element) {
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && parts.length < 5) {
    const tag = current.tagName.toLowerCase();
    if (current.id) { parts.unshift(`${tag}#${CSS.escape(current.id)}`); break; }
    const siblings = current.parentElement ? [...current.parentElement.children].filter(item => item.tagName === current!.tagName) : [current];
    parts.unshift(`${tag}:nth-of-type(${siblings.indexOf(current) + 1})`);
    current = current.parentElement;
  }
  return parts.join(' > ');
}
function describe(element: Element): PickedElement {
  const bounds = element.getBoundingClientRect();
  const editable = !!element.closest('input, textarea, [contenteditable]');
  const text = editable ? '' : (element instanceof HTMLElement ? element.innerText : element.textContent) ?? '';
  let source: SourceLocation | undefined;
  const sourceElement = element.closest('[data-giggy-source]');
  try {
    const parsed = JSON.parse(sourceElement?.getAttribute('data-giggy-source') ?? 'null');
    if (parsed && typeof parsed.id === 'string' && Number.isInteger(parsed.line) && Number.isInteger(parsed.column)) {
      source = { ...parsed, relation: sourceElement === element ? 'selected' : 'ancestor' };
    }
  } catch { /* Ignore malformed metadata from the host application. */ }
  return {
    source,
    tag: element.tagName.toLowerCase(), selector: selectorFor(element), text: text.trim().slice(0, 300),
    attributes: { id: element.id || undefined, classes: [...element.classList].slice(0, 8), role: element.getAttribute('role') ?? undefined, label: element.getAttribute('aria-label')?.slice(0, 160) },
    bounds: { width: Math.round(bounds.width), height: Math.round(bounds.height) },
  };
}

/** A short-lived DOM inspector. Selecting never dispatches the application's click. */
export function startElementPicker(onSelect: (element: PickedElement) => void, onCancel: () => void) {
  const host = document.createElement('div');
  host.id = 'giggydev-picker';
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none';
  const shadow = host.attachShadow({ mode: 'open' });
  const highlight = document.createElement('div');
  highlight.style.cssText = 'position:fixed;border:2px solid #a3f000;background:#a3f00018;box-sizing:border-box;pointer-events:none;display:none';
  highlight.setAttribute('data-testid', 'picker-highlight');
  const hint = document.createElement('div');
  hint.textContent = 'Select an element · Escape to cancel';
  hint.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);max-width:90vw;padding:12px 18px;border-radius:9px;background:#151719;color:#f5f7f8;border:1px solid #a3f000;font:12px system-ui;pointer-events:none';
  shadow.append(highlight, hint);
  const cursor = document.createElement('style');
  cursor.textContent = '* { cursor: crosshair !important; }';
  document.head.append(cursor);
  document.body.append(host);
  let active: Element | null = null;
  let finished = false;

  function targetOf(event: Event) {
    const target = event.composedPath().find(item => item instanceof Element) as Element | undefined;
    if (!target) return null;
    const root = target.getRootNode();
    const owner = root instanceof ShadowRoot ? root.host : target;
    if (owner.id === 'giggydev-host' || owner.id === 'giggydev-picker') return null;
    return target;
  }
  function show(element: Element | null) {
    active = element;
    if (!element) { highlight.style.display = 'none'; return; }
    const rect = element.getBoundingClientRect();
    Object.assign(highlight.style, { display: 'block', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    hint.textContent = `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''} · Click to select · Escape to cancel`;
  }
  const move = (event: PointerEvent) => show(targetOf(event));
  const reposition = () => show(active?.isConnected ? active : null);
  function block(event: Event) { event.preventDefault(); event.stopImmediatePropagation(); }
  function click(event: MouseEvent) {
    const element = targetOf(event);
    block(event);
    dispose();
    if (element) onSelect(describe(element)); else onCancel();
  }
  function keydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    block(event); dispose(); onCancel();
  }
  function dispose() {
    if (finished) return;
    finished = true;
    window.removeEventListener('pointermove', move, true);
    window.removeEventListener('click', click, true);
    window.removeEventListener('keydown', keydown, true);
    for (const event of ['pointerdown','pointerup','mousedown','mouseup','dblclick','contextmenu']) window.removeEventListener(event, block, true);
    window.removeEventListener('scroll', reposition, true);
    window.removeEventListener('resize', reposition);
    cursor.remove(); host.remove();
  }
  window.addEventListener('pointermove', move, true);
  window.addEventListener('click', click, true);
  window.addEventListener('keydown', keydown, true);
  for (const event of ['pointerdown','pointerup','mousedown','mouseup','dblclick','contextmenu']) window.addEventListener(event, block, true);
  window.addEventListener('scroll', reposition, true);
  window.addEventListener('resize', reposition);
  return dispose;
}
