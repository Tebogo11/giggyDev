import { record } from './store';
import { serialize } from './serialization';

export function captureConsole() {
  const restore: (() => void)[] = [];
  for (const level of ['log', 'info', 'debug', 'warn', 'error'] as const) {
    const original = console[level];
    const wrapper = (...args: unknown[]) => {
      original.apply(console, args);
      const detail = args.map(serialize).join(' ');
      record('console', level, detail, detail);
    };
    console[level] = wrapper;
    restore.push(() => { if (console[level] === wrapper) console[level] = original; });
  }
  const onError = (event: ErrorEvent) => record('console', 'error', event.message, serialize(event.error ?? event.message));
  const onRejection = (event: PromiseRejectionEvent) => {
    const reason = serialize(event.reason);
    record('console', 'error', `Unhandled rejection: ${reason}`, reason);
  };
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  return () => {
    restore.reverse().forEach(reset => reset());
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}
