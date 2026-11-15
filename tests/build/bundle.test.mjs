import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
async function files(directory) {
    const found = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = `${directory}/${entry.name}`;
        if (entry.isDirectory())
            found.push(...await files(path));
        else
            found.push(path);
    }
    return found;
}
async function code(directory) {
    return (await Promise.all((await files(directory)).filter(file => file.endsWith('.js')).map(file => readFile(file, 'utf8')))).join('\n');
}
test('consumer production excludes runtime while both hosted playground builds include it', async () => {
    assert.doesNotMatch(await readFile('.test-build/consumer/index.html', 'utf8'), /__giggydev|giggydev-host/);
    assert.doesNotMatch(await code('.test-build/consumer'), /data-giggy-source|__giggydev|giggydev-host/);
    for (const directory of ['playground/dist', 'playground/demo-dist']) {
        assert.match(await code(directory), /giggydev-host/);
        assert.match(await code(directory), /This is a simulated reply/);
        assert.equal(JSON.parse(await readFile(`${directory}/demo/profile.json`, 'utf8')).name, 'Alex');
    }
});
test('library excludes playground and simulated replies', async () => {
    assert.doesNotMatch(await code('dist'), /Less guessing|Fetch a profile|Page sections|This is a simulated reply/);
    const pkg = JSON.parse(await readFile('package.json', 'utf8'));
    assert.deepEqual(pkg.files, ['dist']);
});
test('bootstrap defers the UI and runtime stays within size budgets', async () => {
    const entry = await readFile('dist/client.js', 'utf8');
    assert.match(entry, /import\(/);
    assert.ok(Buffer.byteLength(entry) < 12 * 1024, 'Bootstrap must stay below 12 KiB');
    let gzip = 0;
    for (const file of (await files('dist')).filter(file => file.endsWith('.js')))
        gzip += gzipSync(await readFile(file)).length;
    assert.ok(gzip < 120 * 1024, `Runtime exceeds 120 KiB gzip: ${gzip}`);
});
