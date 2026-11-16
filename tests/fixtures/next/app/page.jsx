'use client';
export default function Page() {
  return <main><h1>Next.js consumer</h1><article id="next-card" style={{padding:4}}>Pick this card</article><button onClick={()=>console.error('Next fixture error')}>Trigger console error</button></main>;
}
