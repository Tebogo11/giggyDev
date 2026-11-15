import React from 'react';

export interface TestAction { title: string; description: string; run: () => void }
interface TestSectionProps {
  id: string;
  label: string;
  title: string;
  description: string;
  note: string;
  actions: TestAction[];
}
export function TestSection({ id, label, title, description, note, actions }: TestSectionProps) {
  return (
    <section id={id} className="feature">
      <div>
        <div className="label">{label}</div>
        <h2>{title}<span>.</span></h2>
        <p>{description}</p><small>{note}</small>
      </div>
      <div className="test-card">
        <div className="card-top"><span className="live" /> INTERACTIVE TESTS <span>{id.toUpperCase()}</span></div>
        {actions.map(action => (
          <button key={action.title} onClick={action.run}><b>{action.title}</b><span>{action.description} ↗</span></button>
        ))}
      </div>
    </section>
  );
}
