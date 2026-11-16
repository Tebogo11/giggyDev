import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveModels} from '../../.test-build/aiConfig.mjs';
test('apiKeyEnv rejects secret values with a safe variable-name error',()=>{
  const secret='sk-example-secret-not-a-real-key';
  assert.throws(()=>resolveModels({models:[{id:'one',provider:'openai',model:'example',apiKeyEnv:secret}]},{}),error=>/environment variable name/.test(error.message)&&!error.message.includes(secret));
});
