import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {Readable} from 'node:stream';
import {EventEmitter} from 'node:events';
import withGiggyDev from '../../.test-build/nextConfig.mjs';
import {developmentConfig} from '../../.test-build/nextWebpack.mjs';
import {createNextHandler} from '../../.test-build/nextBridge.mjs';
import loader from '../../.test-build/nextLoader.mjs';

test('Next production phases are unchanged and Turbopack is explicitly rejected',async()=>{
  const config={reactStrictMode:true};const wrapped=withGiggyDev(config);
  assert.equal(await wrapped('phase-production-build'),config);
  assert.equal(await wrapped('phase-production-server'),config);
  const previous=process.env.TURBOPACK;process.env.TURBOPACK='1';
  try {await assert.rejects(()=>wrapped('phase-development-server'),/next dev --webpack/);}
  finally {previous===undefined?delete process.env.TURBOPACK:process.env.TURBOPACK=previous;}
});

test('Next adapter composes rewrites, preserves existing webpack hooks and injects only browser entries',async()=>{
  let called=0;
  const config=developmentConfig({basePath:'/docs',webpack(value){called++;return value;},rewrites:async()=>[{source:'/old',destination:'/new'}]}, {port:4567,compilerToken:'compiler-only'});
  const routes=await config.rewrites();assert.equal(routes.beforeFiles[0].source,'/__giggydev/:path*');assert.equal(routes.afterFiles[0].source,'/old');
  class DefinePlugin {constructor(values){this.values=values;}}
  const result=config.webpack({entry:async()=>({'main-app':{import:['app.js'],dependOn:'shared'},main:['main.js'],'pages/demo':['page.js']})},{dev:true,isServer:false,webpack:{DefinePlugin}});
  const entries=await result.entry();const repeated=await result.entry();assert.equal(repeated['main-app'].import.filter(value=>value.endsWith('next-client.js')).length,1);assert.equal(called,1);assert.match(entries['main-app'].import[0],/next-client.js$/);assert.equal(entries['main-app'].dependOn,'shared');assert.deepEqual(entries['pages/demo'],['page.js']);
  assert.equal(result.module.rules[0].enforce,'pre');assert.equal(result.plugins[0].values.__GIGGY_NEXT_BASE__,'"/docs"');
  const server=config.webpack({entry:{main:['server.js']}},{dev:true,isServer:true,webpack:{DefinePlugin}});assert.deepEqual(server.entry,{main:['server.js']});
  const production=config.webpack({entry:{main:['prod.js']}},{dev:false,isServer:false,webpack:{DefinePlugin}});assert.equal(production.module,undefined);assert.equal(production.plugins,undefined);
});

test('Next compiler registration is separate from browser access and source reads reject changed files',async()=>{
  const root=await mkdtemp(resolve('.test-build/next-'));const file=join(root,'Card.tsx');const code='export const Card=()=> <article>Card</article>;';await writeFile(file,code);
  const service=createNextHandler(root,{},{});
  async function request(path,data,headers={}){
    const input=Readable.from(data===undefined?[]:[JSON.stringify(data)]);
    Object.assign(input,{method:data===undefined?'GET':'POST',url:path,headers:{host:'127.0.0.1:4567',origin:'http://localhost:3000','x-forwarded-host':'localhost:3000',...headers}});
    const output=new EventEmitter();Object.assign(output,{statusCode:200,body:'',headersSent:false,writableEnded:false,setHeader(){},end(text=''){this.body+=text;this.writableEnded=true;}});
    await service.handler(input,output);return output;
  }
  const data={file,hash:createHash('sha256').update(code).digest('hex')};
  assert.equal((await request('/__giggydev/register',data,{'x-giggy-compiler':service.token})).statusCode,403);
  const registered=await request('/__giggydev/register',data,{'x-giggy-compiler':service.compilerToken});const {id}=JSON.parse(registered.body);assert.ok(id);
  assert.equal((await request('/__giggydev/source?id='+id+'&line=1&column=1')).statusCode,403);
  const headers={'x-giggy-token':service.token};const source='/__giggydev/source?id='+id+'&line=1&column=1';
  assert.match((await request(source,undefined,headers)).body,/Card.tsx/);
  assert.equal((await request(source,undefined,{...headers,origin:'https://elsewhere.test'})).statusCode,403);
  await writeFile(file,code+'\n// changed');assert.notEqual((await request(source,undefined,headers)).statusCode,200);
  assert.equal((await request('/__giggydev/register',{...data,file:join(root,'secret.env')},{'x-giggy-compiler':service.compilerToken})).statusCode,400);
});

test('Next loader preserves client directives, source maps and opaque JSX metadata',async()=>{
  const original=globalThis.fetch;globalThis.fetch=async(url,init)=>{
    assert.match(String(url),/^http:\/\/127.0.0.1:4567\//);assert.equal(init.headers['X-Giggy-Compiler'],'compiler-only');assert.ok(!init.body.includes('use client'));
    return new Response(JSON.stringify({id:'opaque-source'}));
  };
  try {
    const code='"use client";\nexport default function Card(){ return <article style={{padding:4}}>Fix me</article>; }';
    const result=await new Promise((accept,reject)=>loader.call({resourcePath:resolve('Card.tsx'),getOptions:()=>({port:4567,compilerToken:'compiler-only'}),cacheable(value){assert.equal(value,false);},async:()=> (error,code,map)=>error?reject(error):accept({code,map})},code));
    assert.match(result.code,/^"use client"/);assert.match(result.code,/giggydev\/next\/jsx-dev-runtime/);assert.match(result.code,/opaque-source/);assert.deepEqual(result.map.sources,[resolve('Card.tsx')]);
  } finally {globalThis.fetch=original;}
});
