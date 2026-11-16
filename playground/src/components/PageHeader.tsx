import React from 'react';

export function PageHeader({ dark, onToggleTheme }: { dark: boolean; onToggleTheme: () => void }) {
  return (
    <header className="top">
      <nav aria-label="Page sections">
        <a href="#overview">Overview</a><a href="#api-key">API key setup</a><a href="#console">Console</a>
        <a href="#network">Network</a><a href="#picker">Picker</a><a href="#ai">AI chat</a><a href="#fixes">Fixes</a><a href="#start">Get started</a>
      </nav>
      <div className="header-actions"><button className="theme-toggle" aria-label="Dark mode" aria-pressed={dark} onClick={onToggleTheme}>{dark ? 'Light mode' : 'Dark mode'}</button><a className="logo" href="#overview">giggy<span>Dev</span></a></div>
    </header>
  );
}
