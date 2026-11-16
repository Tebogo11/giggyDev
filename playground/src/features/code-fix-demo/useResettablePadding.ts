import { useEffect, useRef, useState } from 'react';

let sourceUpdated = false;
export function hasSourceUpdate() { return sourceUpdated; }
export function markSourceUpdate() { sourceUpdated = true; }

/** Show source edits during Fast Refresh, but start each page visit at 4px. */
export function useResettablePadding(sourcePadding: string) {
  const [padding, setPadding] = useState(sourceUpdated ? sourcePadding : '4px');
  const previous = useRef(sourcePadding);
  useEffect(() => {
    if (previous.current !== sourcePadding) {
      previous.current = sourcePadding;
      setPadding(sourcePadding);
    }
  }, [sourcePadding]);
  return padding;
}
