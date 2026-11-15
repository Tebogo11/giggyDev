import type { Entry } from '../../../../src/capture/index';

/** Deterministic playground behavior. No provider calls, keys or filesystem access. */
export async function simulateReply(_message: string, context: Entry[]): Promise<string> {
  if (!context.length) {
    return 'This is a simulated reply. Attach a console entry or network request, then ask again to see how selected context shapes a debugging suggestion.';
  }
  const element = context.find(entry => entry.kind === 'element');
  if (element) return `This is a simulated reply based on ${context.length} selected entries.\n\nSelected DOM element: ${element.label}\n\nInspect its captured text and dimensions alongside the selected logs and requests. React ownership and source locations are not resolved yet; no file has been read or edited.`;
  const errors = context.filter(entry => entry.level === 'error');
  const network = context.filter(entry => entry.kind === 'network');
  const summary = `This is a simulated reply based on ${context.length} selected ${context.length === 1 ? 'entry' : 'entries'}.`;
  if (network.some(entry => entry.label.includes('failed'))) {
    return `${summary}\n\nA selected request failed or was cancelled. In this playground, Cancel a fetch request intentionally uses an aborted signal. In an application, inspect the AbortController lifecycle and whether a component unmounted before the request completed. No code has been changed.`;
  }
  if (errors.length) {
    return `${summary}\n\nSelected error: ${errors[0].label.slice(0, 240)}\n\nThe playground intentionally throws this error. In an application, start with the stack trace, find the original source location and inspect the failing operation before proposing a fix. Source inspection and reviewed edits are not connected yet.`;
  }
  return `${summary}\n\n${network.length ? 'The selected requests completed. Compare status codes and timings with the expected application behavior.' : 'The selected logs provide a snapshot of application state. Check the expanded object and warning details against the behavior you expected.'}\n\nThis demo uses predefined guidance, not a live AI diagnosis.`;
}
