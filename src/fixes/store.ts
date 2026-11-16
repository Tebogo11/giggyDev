import { createHash, randomBytes } from 'node:crypto';
import { readFile, realpath, stat, open, rename, unlink } from 'node:fs/promises';
import type { FixProposal } from '../ai/types';
export interface EditableSource { id: string; file: string; path: string; code: string }
const fingerprint = (code: string) => createHash('sha256').update(code).digest('hex');
interface StoredProposal extends FixProposal { file: string; state: 'proposed' | 'applied' | 'undone' | 'cancelled' }

/** Review IDs reference server snapshots; callers cannot supply paths or replacement text on apply. */
export function createFixStore() {
  const proposals = new Map<string, StoredProposal>();
  const busy = new Set<string>();
  async function replace(file: string, expected: string, next: string) {
    if (await realpath(file) !== file || fingerprint(await readFile(file, 'utf8')) !== fingerprint(expected)) throw new Error('File changed since review. Generate a new fix; your edits were preserved.');
    const temporary = `${file}.giggydev-${randomBytes(8).toString('hex')}.tmp`;
    const handle = await open(temporary, 'wx', (await stat(file)).mode);
    try {
      await handle.writeFile(next);
      await handle.close();
      if (await realpath(file) !== file || fingerprint(await readFile(file, 'utf8')) !== fingerprint(expected)) throw new Error('File changed during apply. Your edits were preserved.');
      await rename(temporary, file);
    } finally { await handle.close().catch(() => {}); await unlink(temporary).catch(() => {}); }
  }
  return {
    latest(): FixProposal | null {
      const proposal = [...proposals.values()].at(-1);
      if (!proposal) return null;
      const { file, ...review } = proposal;
      return review;
    },
    propose(source: EditableSource, after: string, explanation: string): FixProposal {
      if (typeof after !== 'string' || !after.trim() || Buffer.byteLength(after) > 128 * 1024 || after.includes('\0') || after === source.code) throw new Error('AI did not propose a valid changed source file');
      if (proposals.size >= 20) { const old = [...proposals.values()].find(item => item.state !== 'applied'); if (old) proposals.delete(old.id); else throw new Error('Too many active fixes; restart the server to clear the review history'); }
      const proposal = { id: randomBytes(16).toString('hex'), path: source.path, file: source.file, before: source.code, after, explanation: explanation.slice(0, 2000), state: 'proposed' as const };
      proposals.set(proposal.id, proposal);
      const { file, state, ...publicProposal } = proposal;
      return publicProposal;
    },
    cancel(id: string) {
      const proposal = proposals.get(id);
      if (!proposal || proposal.state !== 'proposed') throw new Error('Only a pending proposal can be cancelled');
      if (busy.has(proposal.file)) throw new Error('Another edit is in progress');
      proposal.state = 'cancelled';
    },
    async apply(id: string) {
      const proposal = proposals.get(id);
      if (!proposal || proposal.state !== 'proposed') throw new Error('Fix is unavailable or already applied');
      if (busy.has(proposal.file)) throw new Error('Another edit is in progress');
      busy.add(proposal.file);
      try { await replace(proposal.file, proposal.before, proposal.after); proposal.state = 'applied'; } finally { busy.delete(proposal.file); }
    },
    async undo(id: string) {
      const proposal = proposals.get(id);
      if (!proposal || proposal.state !== 'applied') throw new Error('No applied fix is available to undo');
      if (busy.has(proposal.file)) throw new Error('Another edit is in progress');
      busy.add(proposal.file);
      try { await replace(proposal.file, proposal.after, proposal.before); proposal.state = 'undone'; } finally { busy.delete(proposal.file); }
    },
  };
}
