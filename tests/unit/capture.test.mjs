import { snapshotPayload, fetchPayload } from '../../.test-build/payload.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capture, serialize, startCapture } from '../../.test-build/capture.mjs';
test('serialization redacts nested secrets and handles cycles, errors and size limits', () => {
    const data = { name: 'Alex', password: 'private', nested: { apiKey: 'private' } };
    data.self = data;
    const text = serialize(data);
    assert.ok(!text.includes('private'));
    assert.ok(text.includes('[Circular]'));
    assert.ok(serialize(new Error('boom')).includes('boom'));
    assert.equal(serialize('x'.repeat(9000)).length, 8000);
});
test('capture preserves fetch responses, rejections and XHR behavior; bounds events and restores hooks', async () => {
    globalThis.location = new URL('http://localhost/');
    class XHR extends EventTarget {
        status = 200;
        open() { }
        setRequestHeader() { }
        send() { this.dispatchEvent(new Event('loadend')); }
    }
    globalThis.XMLHttpRequest = XHR;
    const win = new EventTarget();
    const response = new Response('{"ok":true}', { headers: { 'content-type': 'application/json' } }), failure = new Error('offline');
    win.fetch = async (input) => { if (String(input).includes('fail'))
        throw failure; return response; };
    globalThis.window = win;
    const fetchBefore = win.fetch, logBefore = console.log, openBefore = XHR.prototype.open;
    const stop = startCapture();
    try {
        console.warn('unit warning', { token: 'hidden' });
        assert.ok(capture.snapshot().some(e => e.label.includes('unit warning')));
        assert.ok(!capture.snapshot().at(-1).detail.includes('hidden'));
        assert.equal(await win.fetch('/profile?token=private', { method: 'POST', body: JSON.stringify({ name: 'Alex', password: 'private' }) }), response);
        assert.deepEqual(await response.json(), { ok: true });
        assert.ok(capture.snapshot().at(-1).detail.includes('requestPayload'));
        assert.ok(capture.snapshot().at(-1).detail.includes('Alex'));
        assert.ok(!capture.snapshot().at(-1).detail.includes('private'));
        await assert.rejects(win.fetch('/fail'), error => error === failure);
        const xhr = new XHR();
        xhr.open('GET', '/xhr');
        xhr.send(JSON.stringify({ name: 'XHR payload', token: 'private' }));
        assert.ok(capture.snapshot().at(-1).detail.includes('XHR payload'));
        assert.ok(!capture.snapshot().at(-1).detail.includes('private'));
        assert.ok(capture.snapshot().at(-1).detail.includes('XMLHttpRequest'));
        xhr.open('POST', '/form');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send('name=Alex&token=private');
        assert.ok(capture.snapshot().at(-1).detail.includes('Alex'));
        assert.ok(!capture.snapshot().at(-1).detail.includes('private'));
        for (let i = 0; i < 205; i++)
            win.dispatchEvent(Object.assign(new Event('error'), { message: `error-${i}` }));
        assert.equal(capture.snapshot().length, 200);
        capture.clear('console');
        assert.ok(capture.snapshot().every(e => e.kind !== 'console'));
    }
    finally {
        stop();
    }
    assert.equal(win.fetch, fetchBefore);
    assert.equal(console.log, logBefore);
    assert.equal(XHR.prototype.open, openBefore);
});

test('payload snapshots redact structured fields, bound size and leave streams untouched', async () => {
  const json = snapshotPayload(JSON.stringify({ name: 'Alex', nested: { token: 'private' } }));
  assert.ok(!serialize(json).includes('private'));
  assert.ok(serialize(json).includes('Alex'));
  const form = new FormData(); form.append('password', 'private'); form.append('tag', 'one'); form.append('tag', 'two');
  assert.ok(!serialize(snapshotPayload(form)).includes('private'));
  assert.deepEqual(snapshotPayload(new URLSearchParams('name=Alex')).data.name, ['Alex']);
  assert.equal(snapshotPayload('x'.repeat(4097)).format, 'omitted');
  const stream = new ReadableStream();
  assert.equal(snapshotPayload(stream).format, 'omitted'); assert.equal(stream.locked, false);
  const request = new Request('http://localhost/profile', { method: 'POST', body: '{"name":"Alex"}' });
  assert.equal(fetchPayload(request).format, 'omitted'); assert.equal(request.bodyUsed, false);
  assert.equal(await request.text(), '{"name":"Alex"}');
});
