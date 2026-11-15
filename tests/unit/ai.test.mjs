import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,writeFile,readFile,realpath} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {resolveModels,publicConfiguration} from '../../.test-build/aiConfig.mjs';
import {generate} from '../../.test-build/aiProvider.mjs';
import {createFixStore} from '../../.test-build/fixes.mjs';

test('AI setup exposes model choices but never credentials, and reports missing setup',()=>{
  const models=resolveModels({models:[{id:'one',provider:'openai',model:'configured-model',apiKey:'private-key'}]},{});
  const view=publicConfiguration(models);assert.equal(view.models[0].ready,true);assert.ok(!JSON.stringify(view).includes('private-key'));
  assert.match(publicConfiguration(resolveModels({},{})).setupMessage,/AI key and model/);
  assert.equal(resolveModels({}, {GIGGYDEV_AI_MODEL:'from-env',GIGGYDEV_AI_KEY:'env-secret'})[0].key,'env-secret');
});
test('provider adapter streams fragmented events and keeps the key in server request headers',async()=>{
  const original=globalThis.fetch; const frames='data: {"choices":[{"delta":{"content":"Hello "}}]}\n\ndata: {"choices":[{"delta":{"content":"world"}}]}\n\ndata: [DONE]\n\n';
  globalThis.fetch=async(url,init)=>{
    assert.equal(init.headers.Authorization,'Bearer server-secret');assert.ok(!init.body.includes('server-secret'));
    return new Response(new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode(frames.slice(0,17)));controller.enqueue(new TextEncoder().encode(frames.slice(17)));controller.close();}}));
  };
  try {let text='';for await(const chunk of generate({id:'one',provider:'openai',model:'test',key:'server-secret'},'system',[{role:'user',content:'question'}],new AbortController().signal))text+=chunk;assert.equal(text,'Hello world');}
  finally {globalThis.fetch=original;}
});
test('reviewed fix writes only on approval, preserves stale edits, and supports guarded undo',async()=>{
  await mkdir('.test-build',{recursive:true});const root=await mkdtemp(resolve('.test-build/fixes-'));let file=join(root,'Button.tsx');
  const before='export const value = 1;\n',after='export const value = 2;\n';await writeFile(file,before);file=await realpath(file);
  const store=createFixStore();const source={id:'registered',file,path:'Button.tsx',code:before};
  const proposal=store.propose(source,after,'Fix the value');assert.equal(await readFile(file,'utf8'),before);
  await store.apply(proposal.id);assert.equal(await readFile(file,'utf8'),after);assert.equal(store.latest().state,'applied');
  await writeFile(file,'user changed this');await assert.rejects(store.undo(proposal.id),/changed/);assert.equal(await readFile(file,'utf8'),'user changed this');
  await writeFile(file,after);await store.undo(proposal.id);assert.equal(await readFile(file,'utf8'),before);
  const stale=store.propose(source,after,'try');await writeFile(file,'concurrent edit');await assert.rejects(store.apply(stale.id),/changed/);assert.equal(await readFile(file,'utf8'),'concurrent edit');
});
import {createAIMiddleware} from '../../.test-build/aiMiddleware.mjs';
import {createSourceRegistry} from '../../.test-build/sources.mjs';
import {Readable} from 'node:stream';
import {EventEmitter} from 'node:events';

test('AI endpoints bind fixes to selected sources, expose no key, and restore review/undo after reload',async()=>{
  const root=await mkdtemp(resolve('.test-build/ai-http-'));const file=join(root,'Button.tsx');
  const before='export const Button = () => <button>Before</button>;',after='export const Button = () => <button>After</button>;';
  await writeFile(file,before);const registry=createSourceRegistry(root);const sourceId=await registry.register(file,before);
  const handler=createAIMiddleware(registry,'session-token',{models:[{id:'chosen',provider:'openai',model:'test-model',apiKey:'provider-secret'}]},{});
  const original=globalThis.fetch;
  globalThis.fetch=async(_url,init)=>{
    assert.equal(init.headers.Authorization,'Bearer provider-secret');
    const body=JSON.parse(init.body);assert.ok(body.messages[0].content.includes(before));assert.ok(!body.messages[0].content.includes(await realpath(file)));
    const fix=JSON.stringify({sourceId,code:after,explanation:'Change label'});
    return new Response(`data: ${JSON.stringify({choices:[{delta:{content:fix}}]})}\n\ndata: [DONE]\n\n`);
  };
  async function request(path,data,headers={}) {
    const input=Readable.from(data===undefined?[]:[JSON.stringify(data)]);
    Object.assign(input,{method:data===undefined?'GET':'POST',url:path,headers:{host:'localhost:5173',origin:'http://localhost:5173','x-giggy-token':'session-token',...headers}});
    const response=new EventEmitter();Object.assign(response,{statusCode:200,headersSent:false,destroyed:false,writableEnded:false,body:'',setHeader(){},write(text){this.headersSent=true;this.body+=text;},end(text=''){this.body+=text;this.writableEnded=true;}});
    await handler(input,response,()=>{});return response;
  }
  try {
    const config=await request('/config');assert.ok(!config.body.includes('provider-secret'));
    const input={modelId:'chosen',messages:[{role:'user',content:'Fix label'}],context:[{kind:'element',label:'button',detail:JSON.stringify({source:{id:sourceId,line:1,column:1}})}]};
    assert.equal((await request('/propose',{...input,modelId:'unknown'})).statusCode,422);
    const proposal=JSON.parse((await request('/propose',input)).body);assert.ok(proposal.id);assert.equal(await readFile(file,'utf8'),before);
    assert.equal((await request('/apply',{id:proposal.id,code:'ignored malicious override'})).statusCode,200);assert.equal(await readFile(file,'utf8'),after);
    assert.equal(JSON.parse((await request('/review')).body).state,'applied');
    assert.equal((await request('/undo',{id:proposal.id},{'x-giggy-token':'wrong'})).statusCode,403);assert.equal(await readFile(file,'utf8'),after);
    assert.equal((await request('/undo',{id:proposal.id})).statusCode,200);assert.equal(await readFile(file,'utf8'),before);
  } finally {globalThis.fetch=original;}
});

test('Anthropic streams use native headers and text events; incomplete streams fail clearly',async()=>{
  const original=globalThis.fetch;
  try {
    globalThis.fetch=async(_url,init)=>{
      assert.equal(init.headers['x-api-key'],'anthropic-secret');assert.equal(JSON.parse(init.body).system,'system');
      return new Response('data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Claude reply"}}\n\ndata: {"type":"message_stop"}\n\n');
    };
    let text='';for await(const chunk of generate({id:'anthropic',provider:'anthropic',model:'configured-model',key:'anthropic-secret'},'system',[{role:'user',content:'hello'}],new AbortController().signal))text+=chunk;
    assert.equal(text,'Claude reply');
    globalThis.fetch=async()=>new Response('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n');
    await assert.rejects(async()=>{for await(const chunk of generate({id:'openai',provider:'openai',model:'configured-model',key:'secret'},'system',[{role:'user',content:'hello'}],new AbortController().signal))void chunk;},/before completion/);
  } finally {globalThis.fetch=original;}
});

test('provider 429 errors distinguish exhausted quota from rate limits without echoing secrets',async()=>{
  const original=globalThis.fetch;
  async function rejection(error,headers={}) {
    globalThis.fetch=async()=>new Response(JSON.stringify({error:{...error,message:'private-provider-value'}}),{status:429,headers});
    let message='';try {for await(const text of generate({id:'one',provider:'openai',model:'test',key:'server-secret'},'system',[{role:'user',content:'hi'}],new AbortController().signal))void text;} catch(error){message=error.message;}
    assert.ok(!message.includes('private-provider-value'));return message;
  }
  try {
    assert.match(await rejection({code:'insufficient_quota'}),/quota or billing limit/);
    assert.match(await rejection({code:'rate_limit_exceeded'},{'retry-after':'12'}),/Wait 12 seconds/);
    assert.match(await rejection({}),/rate limit or API quota/);
  } finally {globalThis.fetch=original;}
});
