# giggyDev

[Try the live playground](https://giggydev.netlify.app/) — explore the widget with simulated AI replies and code edits.

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

A red rounded-square badge at the launcher’s top right counts new captured console errors and failed network requests (including cancelled requests). Warnings do not increment it. Opening the widget acknowledges current errors, and clearing entries removes those entries from the count. Counts are bounded by the shared 200-entry store and display 99+ for large totals.

## Development source inspection

Place `giggyDev()` before React transform plugins in the Vite plugin array. JSX/TSX intrinsic elements are instrumented only during Vite client development. Find component shows the latest selection’s source in Elements and Sources, with original indentation, line numbers and a highlighted JSX location. Open in VS Code uses a registered-file URI at the selected line/column; it does not run a shell command. For an untagged child, the UI explicitly labels a nearest instrumented ancestor when one is available.

The source endpoint accepts registered opaque IDs, not arbitrary paths. Reads require a per-session token and same-origin requests, remain within the real project root, are limited to 128 KiB JSX/TSX files, and reject changed/unregistered locations. Excerpts cover at most 51 lines around the selection. SSR and React owner-chain lookup are outside this integration.

The hosted playground has no local-file endpoint or editor link: its picker button shows a curated simulated source preview. Both the picker and source inspection are ready for review; commits/pushes are on hold until that review. The notification badge uses fixed 22 × 22 pixel border-box sizing with 5px rounded corners. Console and Network tabs show their retained error counts until entries are cleared.

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

Pick and attach a source-mapped component, describe the problem in Chat, enable **Edit code**, then use **Send message** to request the change. Questions still receive normal answers when editing is enabled. The toggle defaults off and remembers your choice locally. The server asks the selected model for one existing selected JSX/TSX file replacement. It validates the result, stores an immutable review snapshot and returns a diff. **Approve and apply fix** submits only that review ID; it cannot change the approved replacement or select another path. Full before/after files are expandable for review.

Apply checks that the original contents and canonical path still match, then replaces the file through a temporary file and rename. Undo checks that the applied contents still match before restoring the original. Later edits are preserved by rejecting stale apply/Undo operations. Checks are optimistic; external editors should not write the same file during an apply.

Each review and Undo action stays inline with its chat turn. Playground source updates use an HMR boundary to retain the mounted debugger and its chat state. A manual page refresh or tab close clears chat and review UI; conversation is never saved in browser storage. Review history is in memory for the development-server session (up to 20 reviews); restarting the server clears it. Fixes do not execute shell commands, install dependencies or run your project tests. Verify the changed behavior in your app. Multi-file patches and unselected-file edits are outside this first implementation.

Automated tests use mocked provider streams and temporary source fixtures. No live provider key is needed for the test suite.

## Chat Markdown preview

Chat formats headings, paragraphs, emphasis, lists (including nested lists), links, quotes, inline code and fenced code blocks. Code blocks include a language label and Copy code button. The dependency-free renderer stays in the lazy inspector chunk and supports unfinished fences during streaming. It is a limited Markdown subset: tables, raw HTML rendering, images, syntax highlighting and full CommonMark compatibility are not included. Raw HTML is displayed as text, links are limited to HTTP(S), mailto and relative destinations, and code is never executed.

In the hosted playground, send **Show Markdown preview** in Chat for a deterministic example. No live key is used.

## Next.js integration (initial Webpack adapter)

Use Next 16 with **Webpack**: `next dev --webpack`. Turbopack is not supported by this adapter. Real installed-consumer and browser checks are required before treating the integration as release-ready.

```sh
npm install giggydev esbuild
```

```js
// next.config.mjs — pass an object configuration
import { withGiggyDev } from "giggydev/next";
export default withGiggyDev({ reactStrictMode: true });
```

Set the same GIGGYDEV_AI_KEY / GIGGYDEV_AI_MODEL variables in your Next project's .env.local. For provider/model allowlists, pass `{ ai: { models: [...] } }` as the second argument; keys stay on the server. Existing Webpack hooks, entries and rewrites are composed. The adapter adds browser bootstrap entries and JSX/TSX source tagging in development, using a loopback-only Node service behind same-origin Next rewrites. Compiler registration uses a separate credential from browser source/AI access. `basePath` is supported. Project files outside the configured root, dependencies, non-JSX files and changed snapshots are rejected. Browser console/network are captured; server logs and React owner chains are not.

Production build/start phases return the original Next configuration and do not start the service or add development entry points, loaders or rewrites. The optional esbuild peer is needed by the Next source loader; Vite remains an optional peer for Vite consumers. The library browser bundle still includes its own React runtime for isolation.

Run `npm run verify:consumers` to pack and install this build in separate temporary Vite and Next projects, compile their production clients, and scan for widget code. Run `npm run test:next` for real Next development capture/picker/source and production exclusion checks. Its pretest step automatically builds and installs missing or stale fixtures; verified fixtures are reused until library/fixture inputs change or a temporary build disappears. These commands need registry access and local HTTP ports. The GitHub Verify workflow runs both.

## Temporary padding test

The playground has a removable `features/code-fix-demo` folder. Pick the deliberately cramped card, copy the supplied prompt, enable Edit code, propose/review/apply the change, then check for 24px padding. Undo should restore 4px. The hosted demo offers a simulated review, approve and Undo flow that changes only the card in browser state; it resets on reload and makes no provider requests or source-file writes. Local mode still uses the real widget editing flow. Remove the folder and its App import after testing.

See [release guide](docs/release.md) for publishing gates and npm/Netlify steps.

Chat stays in memory when switching tabs, closing/reopening the widget, and applying or undoing a fix. A full page refresh clears it. Clear chat removes messages, the draft and chat errors without clearing selected context, the model or an applied fix's Undo action. Successful apply keeps its diff and Undo action in the same chat turn. Undo and cancellation leave an inline history note. Failed operations leave the current controls and error visible.

The temporary padding preview follows source changes during Fast Refresh but starts at 4px after a full page reload. This reset affects the demonstration, not the source file on disk; use Undo to restore the actual code.

Pending fix reviews include Cancel. Cancellation preserves chat and source files, and marks the server proposal cancelled so it cannot be applied later. A cancelled history note remains in the current chat. Cancel is disabled while an apply/cancel operation is in progress.

The composer has one submit action. Enabling Edit code allows the selected model to choose between a normal explanation and a proposed edit based on the latest user request. Normal mode streams text; edit-enabled mode validates a single structured answer or fix decision before displaying it. A proposal never writes until approved. Fixes and Undo use filesystem operations only, never Git commands. Existing staged changes are preserved; new file writes remain working-tree changes. An automated temporary-repository test checks index bytes and unstaged diffs.

Selected component chat context now resolves retired hot-update IDs back to the same registered canonical file and rereads its current contents before each request. This does not permit arbitrary paths, follow changed canonical targets, or weaken approval/Undo fingerprints. Source previews still require their registered content/location snapshot. If a selection cannot be resolved, edit mode reports it before contacting the provider.

Edit decisions accept one schema-valid JSON object, including objects wrapped in prose or a code fence. Plain or malformed replies remain chat with an explicit no-file-changes notice; replacement code is never guessed or repaired. An unchanged proposal returns a no-op explanation. The latest user request overrides earlier sizing preferences and static example labels.

The padding card keeps its editable value and first-load reset branch in one source file so the model can see both. The local Show source padding button displays the saved value after a refresh without changing the file. The 24px exercise target is an example; follow-up requests such as 12px are valid.

Fixture installs keep all install scripts disabled with --ignore-scripts. For npm 11 compatibility, the verifier removes inherited npm_config_allow_scripts only from these install subprocesses, preserves registry/auth settings, and leaves the parent environment and npm configuration unchanged.
