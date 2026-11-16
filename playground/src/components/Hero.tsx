import React from 'react';

export function Hero() {
  return (
    <>
      <section id="overview" className="hero">
        <div className="triangles" aria-hidden="true">{Array.from({ length: 16 }, (_, index) => <i key={index} />)}</div>
        <div className="label"><span /> YOUR BROWSER. A LITTLE MORE CONTEXT.</div>
        <h1>Less guessing.<br />More <em>getting it.</em></h1>
        <p className="intro">Meet giggyDev. A tiny debugging companion for React that brings console logs, network requests and selected context into one place.</p>
        <div className="actions"><a className="primary" href="#console">Explore the playground ↗</a><a className="secondary" href="#start">Get started</a></div>
        <div className="hero-footer"><span>01 / CONSOLE + NETWORK PREVIEW</span><span>BUILT FOR YOUR DEV FLOW</span></div>
      </section>
      <div className="strip"><span>CAPTURE THE SIGNAL</span><span>SELECT WHAT MATTERS</span><span>KEEP THE CONTEXT</span></div>
    </>
  );
}
