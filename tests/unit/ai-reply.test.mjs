import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readAIReply} from '../../.test-build/aiReply.mjs';

test('edit decisions accept wrapped JSON without changing replacement text',()=>{
  const fix={type:'fix',sourceId:'selected',code:'export const Card = () => <div style={{padding:"12px"}}>Text</div>;\n',explanation:'Use the latest requested padding.'};
  for(const raw of [JSON.stringify(fix),'Here is the proposal:\n```json\n'+JSON.stringify(fix)+'\n```', 'Proposal:\n'+JSON.stringify(fix)+'\nPlease review it.'])assert.deepEqual(readAIReply(raw),fix);
  const {type,...legacy}=fix;assert.deepEqual(readAIReply(JSON.stringify(legacy)),fix);
});

test('unstructured, malformed or ambiguous replies stay chat and never become guessed patches',()=>{
  for(const text of ['This is a normal explanation.', '{"type":"fix","code":"unescaped\nnewline"}', 'null', '', '{"type":"fix","sourceId":"missing-code"}', '{"type":"message","content":"first"}\n{"type":"message","content":"second"}']){
    const reply=readAIReply(text);assert.equal(reply.type,'message');assert.match(reply.content,/No files were changed/);
  }
});
