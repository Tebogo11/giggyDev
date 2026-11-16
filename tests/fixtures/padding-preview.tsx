import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useResettablePadding, markSourceUpdate } from '../../playground/src/features/code-fix-demo/useResettablePadding';

function Card({ sourcePadding }: {sourcePadding:string}) {
  const padding = useResettablePadding(sourcePadding);
  return <article id="preview-card" style={{padding}}>Padding preview</article>;
}
function Fixture() {
  const [sourcePadding, setSourcePadding] = useState(new URLSearchParams(location.search).get('source') ?? '4px');
  const [revision, setRevision] = useState(0);
  return <><Card key={revision} sourcePadding={sourcePadding}/><button onClick={()=>{markSourceUpdate();setRevision(value=>value+1);}}>Remount after source update</button><button onClick={()=>setSourcePadding('24px')}>Apply source update</button><button onClick={()=>setSourcePadding('4px')}>Undo source update</button></>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
