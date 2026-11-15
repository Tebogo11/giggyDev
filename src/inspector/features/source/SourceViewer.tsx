import React, { useEffect, useState } from 'react';
import type { WidgetOptions } from '../../../runtime/mount-widget';
import type { SourceLocation, SourcePreview } from './types';
import { SourceLine, SourcePanel } from './SourceViewer.styles';

export function SourceViewer({ location, resolveSource }: { location?: SourceLocation; resolveSource?: WidgetOptions['resolveSource'] }) {
  const [preview, setPreview] = useState<SourcePreview>();
  const [error, setError] = useState('');
  const id = location?.id, line = location?.line, column = location?.column;
  useEffect(() => {
    setPreview(undefined);
    setError('');
    if (!resolveSource || !id || !line || !column) return;
    const abort = new AbortController();
    resolveSource({ id, line, column }, abort.signal).then(result => {
      if (!abort.signal.aborted) setPreview(result);
    }).catch(reason => {
      if (!abort.signal.aborted) setError(reason instanceof Error ? reason.message : 'Source could not be loaded.');
    });
    return () => abort.abort();
  }, [id, line, column, resolveSource]);

  return (
    <SourcePanel aria-label="Source inspection">
      <h3>{preview ? `${preview.path}:${preview.line}:${preview.column}` : 'Source inspection'}</h3>
      {!location ? <p>No source location was found. Select a development-instrumented JSX element.</p>
        : !resolveSource ? <p>Source access is unavailable in this environment.</p>
        : error ? <p role="alert">{error}</p>
        : !preview ? <p>Loading source…</p>
        : <>
          <p>{preview.simulated ? 'Simulated source preview — hosted playground only.' : 'Original source excerpt; line numbers and indentation are preserved.'}{location.relation === 'ancestor' ? ' This location belongs to the nearest instrumented ancestor.' : ''}</p>
          {preview.editorUrl && <a href={preview.editorUrl}>Open in VS Code</a>}
          <pre aria-label="Source code">{preview.code.split('\n').map((text, index) => {
            const number = preview.startLine + index;
            return <SourceLine key={number} $active={number === preview.line} data-source-line={number}><span className="line-number">{number}</span>{text || ' '}</SourceLine>;
          })}</pre>
        </>}
    </SourcePanel>
  );
}
