# giggyDev

A development-only debugging overlay for React/Vite. Console and network capture, filtering, expandable metadata and selected context are implemented. The hosted playground includes simulated chat. DOM element picking and Vite development source inspection are available. Configured AI chat and reviewed single-file fixes are available locally. Next.js integration is planned.

## Local playground

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. The dev command builds the library automatically. Restart it after editing library source. The playground is a standalone React landing page with section navigation and seven interactive tests:

- Console: structured object (with nested key redaction), performance warning, uncaught error and stack.
- Network: JSON POST payload, successful fetch, cancelled fetch, XMLHttpRequest.

Run a test, open the lime widget and choose Console or Network. Check a row to attach it, then switch to Chat to review the context tray. Expand rows, filter severity, search or clear the current capture list. Clearing or evicting an entry also removes it from the displayed context.

## Separate builds

| Command | Output | Widget |
| --- | --- | --- |
| `npm run build` | `dist/` | Library runtime and Vite integration only |
| `npm run build:playground` | `playground/dist/` | Production playground with widget + simulated replies |
| `npm run build:demo` | `playground/demo-dist/` | Production playground with widget + simulated replies |

`netlify.toml` builds the library, builds the demo and publishes **only** `playground/demo-dist`. Use `npm run preview:demo` to preview it locally on port 4188. The demo explicitly opts into browser capture and has no source-reading, editor, file-writing or AI endpoints.

The library build uses only `src/vite/index.ts` and `src/runtime/index.ts` as entry points. Package files are restricted to `dist/` (plus npm's automatic metadata/readme files). Neither playground build nor its source, fixtures or tests enters the library package. The package is private and not published yet.

## Verification

```sh
npx playwright install chromium
npm test
```

`npm test` checks TypeScript, runs capture unit tests, builds the library, both playground targets and a consumer production fixture, checks build separation/production exclusion, then runs Playwright. Browser tests cover interactive capture, filtering, selection/removal, clearing, dismissal, production exclusion and the explicit hosted demo. Dedicated test ports are 5187, 4187 and 4188.

For a faster loop, use `npm run test:unit`. `npm run test:build` checks existing build artifacts. `npm pack --dry-run` lists exactly what would be packaged.

## Capture coverage

- Wraps log/info/debug/warn/error while preserving native output, and captures browser error and unhandled-rejection events.
- Captures completed fetch/XHR metadata: URL, method, status and duration, including rejected/aborted fetches. It captures bounded request payloads from explicit fetch bodies and XHR sends: JSON, text, URL-encoded data and FormData fields. It does not read response bodies, Request body streams, binary contents or request/response headers.
- Redacts sensitive object keys and sensitive URL query parameters; removes URL user info/fragments. Free-form log text can still contain secrets. Selected context is sent to the chosen provider only when you submit a local chat or fix request. Hosted replies are simulated.
- Keeps the latest 200 events across both views and truncates displayed details. Console objects are snapshots, not live references. Capture begins when the widget loads; server logs, WebSockets and resource loads are outside this milestone.

## Production boundaries

React and React DOM are runtime dependencies; Vite is a peer. Build and test tools are development dependencies. Dependency classification is not the production boundary.

The Vite integration activates only for `serve` + `development`, with a production NODE_ENV veto. Consumer production builds and preview servers get no injected runtime or endpoint. The library browser entry fails closed without a development flag. The playground is a separate, explicit opt-in: its production entry mounts the widget with a simulated-reply callback. That callback and the landing page never enter the library package.

## Next milestones

Next.js integration with a documented bundler/version support matrix.
### Offline browser check

In environments that block local HTTP connections, the same built hosted demo can be exercised with Playwright route fulfillment from local artifacts (no live server):

```powershell
$env:PW_OFFLINE = '1'
$env:PW_CHANNEL = 'chrome' # optional: use installed Chrome instead of downloaded Chromium
npx playwright test
Remove-Item Env:PW_OFFLINE
Remove-Item Env:PW_CHANNEL
```

Build the demo first with `npm run build:demo`. This check exercises the built React page, all seven controls, captured data, context selection/removal, simulated replies, navigation persistence, clear, Escape and mobile overflow. It supplements the real HTTP integration suite; it does not verify development middleware.

## Code layout

- `src/vite/`: public plugin entry and development runtime middleware.

- `src/runtime/index.ts`: development flag guard.
- `src/runtime/mount-widget.ts`: collectors and the tiny launcher; dynamically imports the inspector on first click.
- `src/capture/`: public capture entry, bounded store, shared types, serialization/redaction, and separate console/fetch/XHR collectors.
- `src/inspector/`: inspector layout, sidebar, capture view, context tray and chat panel.
- feature-owned `*.styles.ts` files: named styled-components. StyleSheetManager targets the widget's Shadow DOM, keeping widget CSS isolated.
- `playground/src/components/`: individual landing sections.
- `playground/src/features/capture-tests/`: reusable test cards and interactive actions.
- `playground/src/features/simulated-chat/`: hosted-only bootstrap and deterministic simulated replies; no provider requests or file edits.

Unit tests live in `tests/unit`, browser checks in `tests/browser`, and bundle checks in `tests/build`. Production consumer fixtures stay under `tests/fixtures`.

## Bundle policy

The browser runtime uses ESM code splitting, tree shaking, minification and production React builds even when injected into a development app. Only the launcher and capture store load initially; React, styled-components and the inspector load on first click. The self-contained inspector does not rely on the host application's React version.

`npm run build` prints raw/gzip chunk sizes and writes a dependency report to `.test-build/bundle-report.json`. Build tests enforce a 12 KiB bootstrap budget and a 120 KiB gzip total runtime budget. Consumer production exclusion is checked using `tests/fixtures/consumer`, since the production playground intentionally includes the widget.

To try simulated replies, run `npm run build:playground` then `npm run preview` (port 4173), or use the Netlify demo. Trigger an error, attach it in Console, switch to Chat and send “Why did this fail?”. Replies are labelled simulated and remain when navigating between views. Local `npm run dev` uses plugin injection and server-side AI configuration.

The playground starts with a white background. Its header dark-mode toggle persists the choice locally; the debugger keeps its charcoal theme. Request payload capture is limited to 4096 characters (forms also to 100 fields), with sensitive structured keys redacted. Free-form text may still contain secrets. Expand a network row to inspect `requestPayload`; the JSON POST demo can receive 404/405 from a static host, which does not prevent payload capture.

## Picking elements and error notifications

Open the widget and choose **Find component**. The overlay hides and hovering highlights the target with a crosshair cursor. Clicking captures the DOM tag, selector, visible text and dimensions, returns to Elements and automatically selects that snapshot as context. It prevents the application click action. Escape cancels, restores the overlay and removes picker listeners/styles. The playground Picker section includes a counter and link for interactive checks. Input values are not read. React ownership and cross-frame inspection are not inferred. Eligible development JSX selections resolve to a file/line and an original source excerpt. The production playground uses a labelled curated source sample.

A red circular badge at the launcher’s top right counts new captured console errors and failed network requests (including cancelled requests). Warnings do not increment it. Opening the widget acknowledges current errors, and clearing entries removes those entries from the count. Counts are bounded by the shared 200-entry store and display 99+ for large totals.

## Development source inspection

Place `giggyDev()` before React transform plugins in the Vite plugin array. JSX/TSX intrinsic elements are instrumented only during Vite client development. Find component shows the latest selection’s source in Elements and Sources, with original indentation, line numbers and a highlighted JSX location. Open in VS Code uses a registered-file URI at the selected line/column; it does not run a shell command. For an untagged child, the UI explicitly labels a nearest instrumented ancestor when one is available.

The source endpoint accepts registered opaque IDs, not arbitrary paths. Reads require a per-session token and same-origin requests, remain within the real project root, are limited to 128 KiB JSX/TSX files, and reject changed/unregistered locations. Excerpts cover at most 51 lines around the selection. SSR and React owner-chain lookup are outside this integration.

The hosted playground has no local-file endpoint or editor link: its picker button shows a curated simulated source preview. Both the picker and source inspection are ready for review; commits/pushes are on hold until that review. The notification badge uses fixed 22 × 22 pixel border-box sizing for a true circle.

## AI keys and model selection

For this repository, copy `playground/.env.example` to `playground/.env.local`, enter your key and exact provider model ID, then restart `npm run dev`. In a consumer app, use that app's Vite env directory (normally its project root).

```env
GIGGYDEV_AI_PROVIDER=openai
GIGGYDEV_AI_KEY=your-provider-key
GIGGYDEV_AI_MODEL=your-provider-model-id
```

The plugin supports OpenAI, Anthropic and server-configured OpenAI-compatible endpoints. It reads Vite's env directory and process environment. Keys stay in Node. For the default model, explicit `ai.apiKey`/`ai.model` options take precedence over environment setup. Provider-specific `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` are also supported. Legacy `AI_IN_CLIENT_API_KEY` remains a fallback.

For multiple choices, define an allowlist. The widget dropdown displays these labels; selecting an item sends its ID, never its key. No provider is silently substituted. Model IDs are deliberately supplied by you rather than hardcoded into the library.

```ts
export default defineConfig({
  plugins: [giggyDev({
    ai: {
      models: [
        { id: 'openai-coding', provider: 'openai', model: 'your-openai-model-id', apiKeyEnv: 'OPENAI_API_KEY', label: 'OpenAI coding' },
        { id: 'claude-coding', provider: 'anthropic', model: 'your-anthropic-model-id', apiKeyEnv: 'ANTHROPIC_API_KEY', label: 'Claude coding' },
      ],
    },
  })],
});
```

An OpenAI-compatible choice can set `baseURL` on that model. The URL is server configuration; browser requests cannot override it. Chat streams text, supports Stop reply, and reports missing setup without contacting a provider. Selected logs/requests and up to three selected registered source files supply context. Headers/env files are not added as context. Free-form logs or hardcoded source literals can still contain secrets.

The production playground always uses simulated replies and shows “This is just a playground. Download giggyDev and try it for yourself.” with a Get started link. It never asks for a live key or exposes local editing endpoints.

## Reviewed fixes and Undo

Pick and attach a source-mapped component, describe the problem in Chat, then click **Propose fix**. The server asks the selected model for one existing selected JSX/TSX file replacement. It validates the result, stores an immutable review snapshot and returns a diff. **Approve and apply fix** submits only that review ID; it cannot change the approved replacement or select another path. Full before/after files are expandable for review.

Apply checks that the original contents and canonical path still match, then replaces the file through a temporary file and rename. Undo checks that the applied contents still match before restoring the original. Later edits are preserved by rejecting stale apply/Undo operations. Checks are optimistic; external editors should not write the same file during an apply.

The latest review can be recovered after a browser reload, so Vite refresh does not hide Undo. Review history is in memory for the development-server session (up to 20 reviews); restarting the server clears it. Fixes do not execute shell commands, install dependencies or run your project tests. Verify the changed behavior in your app. Multi-file patches and unselected-file edits are outside this first implementation.

Automated tests use mocked provider streams and temporary source fixtures. No live provider key is needed for the test suite.
