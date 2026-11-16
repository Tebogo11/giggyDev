import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {Readable} from 'node:stream';
import {EventEmitter} from 'node:events';
import {createAIMiddleware} from '../../.test-build/aiMiddleware.mjs';
import {createSourceRegistry} from '../../.test-build/sources.mjs';
import {createAIClient} from '../../.test-build/aiClient.mjs';

test('edit-enabled chat distinguishes explanation from a reviewed fix and never writes without approval',async()=>{
  const root=await mkdtemp(resolve('.test-build/edit-chat-'));const file=join(root,'Card.tsx');
  const before='export const Card=()=> <article>Before</article>;',after='export const Card=()=> <article>After</article>;';await writeFile(file,before);
  const registry=createSourceRegistry(root);const sourceId=await registry.register(file,before);
  const handler=createAIMiddleware(registry,'session',{models:[{id:'model',provider:'openai',model:'configured',apiKey:'dummy'}]},{});
  let decision={type:'message',content:'This spacing is too small.'};
  const original=globalThis.fetch;
  let expectedSource; let providerCalls=0;
  globalThis.fetch=async(_url,init)=>{
    providerCalls++;
    if(expectedSource) assert.ok(JSON.parse(init.body).messages[0].content.includes(expectedSource),'A selected element must retain fresh source after an approved edit and HMR registration');
    return new Response(`data: ${JSON.stringify({choices:[{delta:{content:JSON.stringify(decision)}}]})}\n\ndata: [DONE]\n\n`);
  };
  async function request(path,input){
    const req=Readable.from(input===undefined?[]:[JSON.stringify(input)]);Object.assign(req,{method:input===undefined?'GET':'POST',url:path,headers:{host:'localhost:5173','x-giggy-token':'session'}});
    const res=new EventEmitter();Object.assign(res,{statusCode:200,body:'',destroyed:false,headersSent:false,setHeader(){},write(text){this.headersSent=true;this.body+=text;},end(text=''){this.body+=text;}});
    await handler(req,res,()=>{});return res;
  }
  const input={modelId:'model',messages:[{role:'user',content:'Explain the padding'}],context:[{kind:'element',label:'card',detail:JSON.stringify({source:{id:sourceId,line:1,column:1}})}],editCode:true};
  try{
    const explanation=await request('/chat',input);assert.equal(explanation.statusCode,200);assert.match(explanation.body,/spacing is too small/);assert.doesNotMatch(explanation.body,/"type":"proposal"/);
    assert.equal(JSON.parse((await request('/review')).body),null);
    decision={type:'fix',sourceId,code:after,explanation:'Change the requested text'};
    const disabled=await request('/chat',{...input,editCode:false});assert.doesNotMatch(disabled.body,/"type":"proposal"/);assert.equal(JSON.parse((await request('/review')).body),null);
    const proposed=await request('/chat',{...input,messages:[{role:'user',content:'Change the card text'}]});
    const event=proposed.body.split('\n').filter(Boolean).map(line=>JSON.parse(line)).find(event=>event.type==='proposal');assert.ok(event.proposal.id);
    assert.equal(await readFile(file,'utf8'),before);
    assert.equal((await request('/apply',{id:event.proposal.id})).statusCode,200);assert.equal(await readFile(file,'utf8'),after);
    const refreshedId=await registry.register(file,after);
    expectedSource=after;
    decision={type:'fix',sourceId:refreshedId,code:after.replace('After','Twelve'),explanation:'Follow-up change'};
    const followup=await request('/chat',{...input,messages:[{role:'user',content:'Now change it again'}]});
    assert.equal(followup.statusCode,200,followup.body);
    const next=followup.body.split('\n').filter(Boolean).map(line=>JSON.parse(line)).find(event=>event.type==='proposal').proposal;
    assert.equal(next.before,after);
    assert.equal((await request('/apply',{id:next.id})).statusCode,200);
    const twelve=after.replace('After','Twelve');assert.equal(await readFile(file,'utf8'),twelve);
    const latestId=await registry.register(file,twelve);expectedSource=twelve;
    decision={type:'fix',sourceId:latestId,code:twelve.replace('Twelve','Another'),explanation:'Another change'};
    const pending=await request('/chat',input);
    const pendingId=pending.body.split('\n').filter(Boolean).map(line=>JSON.parse(line)).find(event=>event.type==='proposal').proposal.id;
    await writeFile(file,twelve+'\n// external edit');
    assert.notEqual((await request('/apply',{id:pendingId})).statusCode,200);
    assert.equal(await readFile(file,'utf8'),twelve+'\n// external edit');
    const calls=providerCalls;
    const unknown=await request('/chat',{...input,context:[{kind:'element',label:'card',detail:JSON.stringify({source:{id:'expired-session-id',line:1,column:1}})}]});
    assert.equal(unknown.statusCode,400);assert.match(unknown.body,/source could not be refreshed/);assert.equal(providerCalls,calls);
  }finally{globalThis.fetch=original;}
});

test('chat client receives an inline proposal through the same submit stream',async()=>{
  const original=globalThis.fetch;const proposal={id:'review',path:'Card.tsx',before:'before',after:'after',explanation:'Requested change'};
  const body=JSON.stringify({type:'proposal',proposal})+'\n'+JSON.stringify({type:'done'})+'\n';
  globalThis.fetch=async(url,init)=>{
    assert.equal(url,'/__giggydev/ai/chat');assert.equal(JSON.parse(init.body).editCode,true);
    return new Response(new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode(body.slice(0,23)));controller.enqueue(new TextEncoder().encode(body.slice(23)));controller.close();}}));
  };
  try{
    let received;let text='';
    await createAIClient('session').chat({modelId:'model',messages:[{role:'user',content:'Edit this'}],context:[],editCode:true},value=>text+=value,undefined,value=>received=value);
    assert.deepEqual(received,proposal);assert.equal(text,'');
  }finally{globalThis.fetch=original;}
});
