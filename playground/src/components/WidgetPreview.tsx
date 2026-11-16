import React, { useState } from 'react';
import styled from 'styled-components';

const Preview = styled.figure`
  margin: 0; padding: 30px 7% 52px; border-bottom: 1px solid var(--border);
  img { display: block; width: 100%; height: auto; border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 18px 60px #0002; }
  figcaption { font-size: 12px; line-height: 1.8; color: var(--muted); margin-top: 16px; text-align: center; }
  .missing-image { border: 1px dashed var(--border); padding: 30px; border-radius: 12px; font-size: 13px; color: var(--muted); }
`;
export function WidgetPreview() {
  const [missing, setMissing] = useState(false);
  return <Preview aria-label="Widget screenshot">
    {missing ? <div className="missing-image">The widget preview image is not available yet.</div> : <img src="/images/widget-preview.png" width="1659" height="652" alt="giggyDev open over the playground, showing a formatted AI explanation and code block beside Console, Network, Elements and Sources tabs." onError={() => setMissing(true)} />}
    <figcaption>Debug with the full picture: selected requests, readable answers and reviewed code fixes in your app.</figcaption>
  </Preview>;
}
