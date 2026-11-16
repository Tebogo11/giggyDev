import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blocks, inline, safeHref} from '../../.test-build/markdown.mjs';

test('Markdown renders debugging structure and preserves code literally', () => {
  const parsed = blocks('# Diagnosis\n\n**Failed** request\n\n- First\n- Second\n  - Nested\n\n```ts\nconst value = "<script>";\n```');
  assert.deepEqual(parsed.map(node => node.type), ['heading','paragraph','list','code']);
  assert.equal(parsed[0].level, 1);
  assert.equal(parsed[2].items.length, 2);
  assert.equal(parsed[2].items[1][1].type, 'list');
  assert.equal(parsed[3].text, 'const value = "<script>";');
  assert.equal(inline('**bold** and `x_y`')[0].type, 'strong');
});

test('unfinished streamed fences remain code and raw HTML is plain text', () => {
  assert.deepEqual(blocks('```tsx\n<div>'), [{type:'code',language:'tsx',text:'<div>'}]);
  assert.deepEqual(blocks('<script>alert(1)</script>'), [{type:'paragraph',text:'<script>alert(1)</script>'}]);
  assert.equal(inline('unfinished **bold')[0].text, 'unfinished **bold');
  assert.equal(blocks('3. Third\n4. Fourth')[0].start, 3);
});

test('Markdown links reject active protocols and do not load images', () => {
  for (const value of ['javascript:alert', 'data:text/html,test', 'vbscript:bad', 'java\nscript:bad']) assert.equal(safeHref(value), undefined);
  for (const value of ['https://example.test', 'mailto:hello@example.test', '#start', '/guide']) assert.equal(safeHref(value), value);
  assert.equal(inline('[bad](javascript:alert)')[0].href, undefined);
  assert.equal(inline('![image](https://example.test/a.png)').some(node => node.type === 'link'), false);
});
