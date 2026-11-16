import { useState } from 'react';
import type { TestAction } from './TestSection';

export function usePlaygroundTests() {
  const [result, setResult] = useState('Choose a test above. Open the lime widget to inspect the result.');

  async function fetchProfile(cancel = false) {
    const controller = new AbortController();
    if (cancel) controller.abort();
    try {
      const response = await fetch('/demo/profile.json?token=demo-secret', { signal: controller.signal });
      setResult(`Fetch completed with status ${response.status}. Inspect Network in the widget.`);
    } catch { setResult('Request failed. Inspect Network in the widget.'); }
  }

  const consoleActions: TestAction[] = [
    { title: 'Log a structured object', description: 'Inspect nested data and redaction', run: () => {
      console.log('Profile loaded', { name: 'Alex', role: 'Developer', token: 'demo-secret' });
      setResult('Structured log created. Expand it in Console to inspect the object and redacted token.');
    } },
    { title: 'Trigger a performance warning', description: 'Find a warning with the severity filter', run: () => {
      console.warn('Slow render detected: ProfileCard took 240 ms');
      setResult('Warning created. Try filtering Console by warn.');
    } },
    { title: 'Throw an application error', description: 'Capture an uncaught error and stack trace', run: () => {
      setResult('Unhandled error scheduled. Inspect its message and stack in Console.');
      setTimeout(() => { throw new Error('Playground: unable to save profile'); }, 0);
    } },
  ];
  async function sendPayload() {
    try {
      const response = await fetch('/demo/profile.json', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Alex', preferences: { theme: 'light' }, token: 'payload-secret' }),
      });
      setResult(`POST completed with status ${response.status}. Expand requestPayload in Network; a static host may reject POST.`);
    } catch { setResult('POST failed. Its requestPayload is still available in Network.'); }
  }
  const networkActions: TestAction[] = [
    { title: 'Send a JSON payload', description: 'Inspect request fields and nested redaction', run: () => { void sendPayload(); } },
    { title: 'Fetch a profile', description: 'Successful JSON request + URL redaction', run: () => { void fetchProfile(); } },
    { title: 'Cancel a fetch request', description: 'Inspect an aborted request and failure details', run: () => { void fetchProfile(true); } },
    { title: 'Send an XMLHttpRequest', description: 'Verify capture beyond fetch', run: () => {
      const request = new XMLHttpRequest();
      request.open('GET', '/demo/profile.json?transport=xhr');
      request.onloadend = () => setResult(`XHR completed with status ${request.status}. Inspect Network in the widget.`);
      request.send();
    } },
  ];
  return { result, consoleActions, networkActions };
}
