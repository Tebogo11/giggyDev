import {pathToFileURL} from 'node:url';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,mkdtemp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createSourceRegistry} from '../../.test-build/sources.mjs';
import {instrumentSource, jsxRuntimeCode} from '../../.test-build/instrumentation.mjs';
import {createSourceMiddleware} from '../../.test-build/sourceMiddleware.mjs';

test('JSX instrumentation resolves original source and refuses unknown, changed or outside files',async()=>{
  await mkdir('.test-build',{recursive:true});
  const root=await mkdtemp(resolve('.test-build/source-'));
  const file=join(root,'Button.tsx');
  const code='export const Button = () => (\n  <button id="source-test">Pick me</button>\n);';
  await writeFile(file,code);
  const registry=createSourceRegistry(root);
  const id=await registry.register(file,code);
  assert.ok(id);
  const transformed=await instrumentSource(code,file,registry);
  assert.match(transformed.code,/virtual:giggydev\/jsx-dev-runtime/);
  assert.ok(transformed.code.includes(id),'DOM source metadata must use the registered ID');
  const preview=await registry.read(id,2,3);
  assert.equal(preview.path,'Button.tsx');
  assert.equal(preview.line,2); assert.equal(preview.code,code);
  assert.match(preview.editorUrl,/^vscode:\/\/file\//);
  assert.equal(await registry.read('../package.json',1,1),null);
  const outside=resolve('.test-build/outside.tsx'); await writeFile(outside,code);
  assert.equal(await registry.register(outside,code),null);
  assert.equal(await registry.register(file,'x'.repeat(128*1024+1)),null);
  await writeFile(file,code+'\n// modified');
  assert.equal(await registry.read(id,2,3),null);
});

test('source endpoint requires same origin, a session token and registered locations',async()=>{
  const root=await mkdtemp(resolve('.test-build/source-http-'));
  const file=join(root,'Button.tsx'); const code='export const Button = () => <button />;';
  await writeFile(file,code);
  const registry=createSourceRegistry(root); const id=await registry.register(file,code);
  const middleware=createSourceMiddleware(registry,'test-token');
  async function request(overrides={}) {
    const result={statusCode:200,headers:{},body:''};
    await middleware({method:'GET',url:`/?id=${id}&line=1&column=1`,headers:{host:'localhost:5173',origin:'http://localhost:5173','x-giggy-token':'test-token'},...overrides},
      {setHeader(key,value){result.headers[key]=value;},set statusCode(value){result.statusCode=value;},end(body){result.body=body;}},()=>{});
    return result;
  }
  assert.equal((await request()).statusCode,200);
  assert.equal((await request({method:'POST'})).statusCode,405);
  assert.equal((await request({headers:{host:'localhost:5173'}})).statusCode,403);
  assert.equal((await request({headers:{host:'localhost:5173',origin:'https://evil.example','x-giggy-token':'test-token'}})).statusCode,403);
  assert.equal((await request({url:'/?id=not-registered&line=1&column=1'})).statusCode,404);
});

test('instrumented JSX runtime preserves fragments and adds intrinsic source metadata',async()=>{
  const file=resolve('.test-build/test-jsx-runtime.mjs');
  await writeFile(file,jsxRuntimeCode);
  const runtime=await import(pathToFileURL(file).href);
  assert.ok(runtime.Fragment);
  const element=runtime.jsxDEV('button',{children:'Test'},undefined,false,{fileName:'registered',lineNumber:2,columnNumber:3});
  assert.deepEqual(JSON.parse(element.props['data-giggy-source']),{id:'registered',line:2,column:3});
});

test('Vite development pipeline resolves the instrumented JSX runtime and fragments',async()=>{
  const {createServer}=await import('vite');
  const {default:giggyDev}=await import('../../.test-build/vite.mjs');
  const server=await createServer({
    configFile:false,root:resolve('playground'),plugins:[giggyDev()],
    server:{middlewareMode:true,hmr:false,watch:null,preTransformRequests:false},optimizeDeps:{noDiscovery:true,include:[]},
  });
  try {
    const transformed=await server.transformRequest('/src/components/Hero.tsx');
    assert.match(transformed.code,/giggydev:jsx-runtime/);
    const runtime=await server.transformRequest('virtual:giggydev/jsx-dev-runtime');
    assert.match(runtime.code,/data-giggy-source/);
    assert.match(runtime.code,/Fragment/);
  } finally {await server.close();}
});
