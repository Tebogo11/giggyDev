import type { SourceLocation, SourcePreview } from '../../../../src/inspector/features/source/types';

/** Curated public sample, not a copy of local project files or a filesystem endpoint. */
export async function simulatedSource(location: SourceLocation): Promise<SourcePreview> {
  if (location.id !== 'demo-picker-button') throw new Error('This hosted sample has source for the picker demo button only.');
  return {
    path: 'playground/src/features/component-picker/PickerDemo.tsx',
    code: `// Curated source sample for the hosted demo
export function PickerButton({ count, setCount }) {
  return (
    <button id="picker-demo-button" onClick={() => setCount(count + 1)}>
      <b>Increment demo counter</b>
      <span>Select me without triggering my action</span>
    </button>
  );
}`,
    startLine: 1, line: 4, column: 5, simulated: true,
  };
}
