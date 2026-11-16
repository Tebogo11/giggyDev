/** Deliberately limited Markdown for debugging replies, not a CommonMark parser. */
export type Inline = { type: 'text' | 'code'; text: string }
  | { type: 'strong' | 'em' | 'del'; children: Inline[] }
  | { type: 'link'; href?: string; children: Inline[] };
export type Block = { type: 'paragraph' | 'heading' | 'quote'; text: string; level?: number }
  | { type: 'code'; text: string; language: string }
  | { type: 'list'; ordered: boolean; start: number; items: Block[][] }
  | { type: 'rule' };

export function safeHref(value: string): string | undefined {
  try {
    const url = new URL(value, 'https://giggydev.invalid');
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? value : undefined;
  } catch { return undefined; }
}

export function inline(text: string, depth = 0): Inline[] {
  if (depth > 12) return [{ type: 'text', text }];
  const result: Inline[] = [];
  let plain = '';
  const flush = () => { if (plain) { result.push({ type: 'text', text: plain }); plain = ''; } };
  for (let at = 0; at < text.length;) {
    const rest = text.slice(at);
    if (rest[0] === '\\' && rest.length > 1 && /[\\`*_~[\]()!#]/.test(rest[1])) {
      plain += rest[1]; at += 2; continue;
    }
    const code = /^(`+)([\s\S]*?)\1(?!`)/.exec(rest);
    if (code) { flush(); result.push({ type: 'code', text: code[2] }); at += code[0].length; continue; }
    // No image loading: image syntax remains text. Labels can still use emphasis.
    const link = rest[0] === '[' && (at === 0 || text[at - 1] !== '!')
      ? /^\[([^\]\n]+)\]\(([^\s()]+)\)/.exec(rest) : null;
    if (link) { flush(); result.push({ type: 'link', href: safeHref(link[2]), children: inline(link[1], depth + 1) }); at += link[0].length; continue; }
    const marker = ['**', '__', '~~', '*', '_'].find(value => rest.startsWith(value));
    if (marker && !(marker.includes('_') && /\w/.test(text[at - 1] ?? ''))) {
      const end = text.indexOf(marker, at + marker.length);
      if (end > at + marker.length) {
        flush(); result.push({ type: marker.length === 1 ? 'em' : marker === '~~' ? 'del' : 'strong', children: inline(text.slice(at + marker.length, end), depth + 1) }); at = end + marker.length; continue;
      }
    }
    plain += text[at++];
  }
  flush(); return result;
}

const fence = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const heading = /^ {0,3}(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/;
const item = /^( *)([-+*]|\d+[.)])\s+(.*)$/;
const rule = /^ {0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/;
function startsBlock(line: string): boolean {
  return !line.trim() || fence.test(line) || heading.test(line) || item.test(line) || rule.test(line) || /^ {0,3}>/.test(line);
}

export function blocks(source: string, depth = 0): Block[] {
  if (depth > 12) return [{ type: 'paragraph', text: source }];
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const result: Block[] = [];
  for (let at = 0; at < lines.length;) {
    const line = lines[at];
    if (!line.trim()) { at++; continue; }
    const opening = fence.exec(line);
    if (opening) {
      const content: string[] = []; at++;
      const closing = new RegExp(`^ {0,3}${opening[1][0]}{${opening[1].length},}\\s*$`);
      while (at < lines.length && !closing.test(lines[at])) content.push(lines[at++]);
      if (at < lines.length) at++;
      result.push({ type: 'code', language: opening[2].trim().split(/\s/)[0], text: content.join('\n') }); continue;
    }
    const title = heading.exec(line);
    if (title) { result.push({ type: 'heading', level: title[1].length, text: title[2] }); at++; continue; }
    if (rule.test(line)) { result.push({ type: 'rule' }); at++; continue; }
    if (/^ {0,3}>/.test(line)) {
      const text: string[] = [];
      while (at < lines.length && /^ {0,3}>/.test(lines[at])) text.push(lines[at++].replace(/^ {0,3}> ?/, ''));
      result.push({ type: 'quote', text: text.join('\n') }); continue;
    }
    const first = item.exec(line);
    if (first) {
      const ordered = /^\d/.test(first[2]);
      const items: Block[][] = [];
      while (at < lines.length) {
        const current = item.exec(lines[at]);
        if (!current || current[1].length !== first[1].length || /^\d/.test(current[2]) !== ordered) break;
        const content = [current[3]]; at++;
        while (at < lines.length && lines[at].trim() && /^ +/.test(lines[at]) && (item.exec(lines[at])?.[1].length ?? lines[at].length - lines[at].trimStart().length) > first[1].length) {
          content.push(lines[at++].slice(first[1].length + 2));
        }
        items.push(blocks(content.join('\n'), depth + 1));
      }
      result.push({ type: 'list', ordered, start: ordered ? parseInt(first[2], 10) : 1, items }); continue;
    }
    const text = [line]; at++;
    while (at < lines.length && !startsBlock(lines[at])) text.push(lines[at++]);
    result.push({ type: 'paragraph', text: text.join('\n') });
  }
  return result;
}
