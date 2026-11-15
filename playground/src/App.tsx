import { ApiKeyGuide } from './features/setup/ApiKeyGuide';
import { AISections } from './features/ai/AISections';
import { PickerDemo } from './features/component-picker/PickerDemo';
import { usePageTheme } from './usePageTheme';
import React from 'react';
import { PageHeader } from './components/PageHeader';
import { Hero } from './components/Hero';
import { GetStarted } from './components/GetStarted';
import { PageFooter } from './components/PageFooter';
import { TestSection } from './features/capture-tests/TestSection';
import { Page } from './styles/page.styles';
import { usePlaygroundTests } from './features/capture-tests/usePlaygroundTests';

export function App() {
  const { dark, toggleTheme } = usePageTheme();
  const { result, consoleActions, networkActions } = usePlaygroundTests();
  return (
    <Page $dark={dark} data-theme={dark ? 'dark' : 'light'}>
      <PageHeader dark={dark} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <ApiKeyGuide />
        <TestSection id="console" label="01 / THE CONSOLE, CONNECTED" title="Console capture"
          description="Catch logs, warnings, errors and unhandled failures while you use your app. Expand the details, filter the noise and check the entries you want to attach to a conversation."
          note="Run a test, open the lime button, then choose Console. Your browser console continues working normally." actions={consoleActions} />
        <TestSection id="network" label="02 / FOLLOW THE REQUEST" title="Network capture"
          description="See fetch and XMLHttpRequest activity with URLs, status codes and timing. Expand a request for metadata, then select it alongside your console errors."
          note="Expand a request to inspect its payload. JSON and form fields are redacted and size-limited. Response bodies and headers are not captured." actions={networkActions} />
        <PickerDemo />
        <AISections />
        <div role="status" className="result"><span>LAST TEST</span>{result}</div>
        <GetStarted />
      </main>
      <PageFooter />
    </Page>
  );
}
