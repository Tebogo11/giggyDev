import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import giggyDev from '../../.test-build/vite.mjs';
test('plugin fails closed for builds, production mode and production NODE_ENV', () => {
    const plugin = giggyDev();
    assert.equal(plugin.apply({}, { command: 'build', mode: 'development' }), false);
    assert.equal(plugin.apply({}, { command: 'serve', mode: 'production' }), false);
    const original = process.env.NODE_ENV;
    try {
        process.env.NODE_ENV = 'production';
        assert.equal(plugin.apply({}, { command: 'serve', mode: 'development' }), false);
        process.env.NODE_ENV = 'development';
        assert.equal(plugin.apply({}, { command: 'serve', mode: 'development' }), true);
    }
    finally {
        if (original === undefined)
            delete process.env.NODE_ENV;
        else
            process.env.NODE_ENV = original;
    }
});
test('development middleware serves lazy chunks, gates bootstrap and rejects unrelated paths', async () => {
    await mkdir('.test-build/chunks', { recursive: true });
    await writeFile('.test-build/client.js', '// fixture bootstrap');
    await writeFile('.test-build/chunks/mount-TEST.js', '// fixture chunk');
    let handle;
    giggyDev().configureServer({ middlewares: { use(prefix, handler) { if (prefix === '/__giggydev/') handle = handler; } } });
    async function request(url) {
        const result = { headers: {}, body: null, next: false };
        await handle({ url }, { setHeader(key, value) { result.headers[key] = value; }, end(body) { result.body = body; } }, error => { assert.ifError(error); result.next = true; });
        return result;
    }
    const bootstrap = await request('/client.js');
    assert.match(bootstrap.body, /const __GIGGY_DEV__ = true/);
    assert.equal(bootstrap.headers['Cache-Control'], 'no-store');
    const chunk = await request('/chunks/mount-TEST.js');
    assert.equal(chunk.body, '// fixture chunk');
    assert.equal((await request('/../package.json')).next, true);
    assert.equal((await request('/chunks/%2e%2e/package.json')).next, true);
});
