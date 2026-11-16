import React, { useState } from 'react';

export function PickerDemo() {
  const [count, setCount] = useState(0);
  return (
    <section id="picker" className="feature">
      <div>
        <div className="label">03 / POINT TO THE PROBLEM</div>
        <h2>Component picker<span>.</span></h2>
        <p>Open the widget and choose Find component. Hover to highlight, then click to capture an element's selector, visible text and dimensions. The widget returns to Elements and attaches the selection.</p>
        <small>Try picking the button: selection should not increment the counter. Escape cancels. Development mode resolves instrumented JSX to its file and source excerpt. The hosted demo shows a labelled sample. React ownership is not inferred.</small>
      </div>
      <article id="picker-demo" className="test-card">
        <div className="card-top"><span className="live" /> PICKER TARGETS <span>ELEMENTS</span></div>
        <button data-giggy-source={import.meta.env.PROD ? JSON.stringify({ id: 'demo-picker-button', line: 4, column: 5 }) : undefined} id="picker-demo-button" onClick={() => setCount(value => value + 1)}><b>Increment demo counter</b><span>Select me without triggering my action ↗</span></button>
        <p data-testid="picker-demo-count" style={{ padding: '0 22px' }}>Counter: {count}</p>
        <a href="#console" style={{ display: 'block', padding: 22 }}>Try selecting this link ↗</a>
      </article>
    </section>
  );
}
