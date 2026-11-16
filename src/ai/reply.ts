type Message = {type:'message'; content:string};
type Fix = {type:'fix'; sourceId:string; code:string; explanation:string};
type Decision = Message | Fix;

function decision(value: unknown): Decision | undefined {
  if (!value || typeof value !== 'object') return;
  const item = value as Record<string, unknown>;
  if (item.type === 'message' && typeof item.content === 'string') return {type:'message',content:item.content};
  if ((item.type === 'fix' || item.type === undefined) && typeof item.sourceId === 'string' && typeof item.code === 'string' && typeof item.explanation === 'string') {
    return {type:'fix',sourceId:item.sourceId,code:item.code,explanation:item.explanation};
  }
}
function parse(text: string): Decision | undefined {
  try { return decision(JSON.parse(text)); } catch { return; }
}

/** Accept exact JSON or one complete JSON decision wrapped in prose/fences.
 * Never repair or guess replacement code. Unstructured replies remain chat. */
export function readAIReply(raw: string): Decision {
  const exact = parse(raw.trim());
  if (exact) return exact;
  let start = -1, depth = 0, quoted = false, escaped = false;
  const found: Decision[] = [];
  for (let at = 0; at < raw.length; at++) {
    const char = raw[at];
    if (start < 0) {
      if (char === '{') { start = at; depth = 1; quoted = false; escaped = false; }
      continue;
    }
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === '{') depth++;
    else if (char === '}' && --depth === 0) {
      const value = parse(raw.slice(start, at + 1));
      if (value) found.push(value);
      start = -1;
    }
  }
  if (found.length === 1) return found[0];
  return {type:'message',content:(raw.trim() || 'The provider returned an empty reply.') + '\n\nNo reviewable code change was returned. No files were changed.'};
}
