# Release checklist: npm library, then Netlify playground

Chat uses one submit action; enable Edit code before requesting a reviewed edit. Apply and Undo stay inline in the conversation. A full page refresh clears this UI state.

The first Next.js adapter targets Next 16 **Webpack** development. Turbopack is not supported. Do not describe Next.js as verified until the installed-consumer build and browser checks below pass on a machine with registry access and local HTTP ports.

## 1. Review the interactive examples

- Run `npm run dev` and select the temporary padding card with Find component.
- Enable Edit code, paste the provided prompt, send the edit request and review the diff.
- Apply it, verify 24px padding, then Undo and verify 4px again.
- Check the rounded-square launcher badge and separate Console/Network error counts. Tab counts represent retained errors, not unread errors.
- Save the supplied screenshot as `playground/public/images/widget-preview.png`. Its after-hero section is already prepared. Confirm it displays at desktop and mobile widths.
- Remove `playground/src/features/code-fix-demo` and its App import/render when testing is finished.

## 2. Verify builds and installed consumers

Use Node 22 or a supported Node version >=20.19.

```sh
npm ci
npm run release:check
npm run verify:consumers
npm run test:next
```

`npm run test:next` automatically prepares fixtures when missing or stale; you do not need to create .test-build/consumers.json yourself. Next development and production tests use separate output directories.

On Windows, browser tests automatically use installed Chrome, then Edge, before falling back to Playwright-managed Chromium. No browser download is needed when Chrome or Edge is detected. To choose Edge explicitly in PowerShell, set `$env:PW_CHANNEL="msedge"` before `npm run test:next`; use `chrome` for Chrome. CI/non-Windows keeps managed Chromium. See https://playwright.dev/docs/browsers for supported channels.

The consumer verifier creates an npm tarball, installs it in temporary projects outside this repository, builds separate Vite and Next.js production apps, and scans their browser output for widget code. Next's browser suite checks real development injection, console capture, picker/source mapping and production exclusion. No live AI keys are needed. The GitHub Verify workflow runs the same consumer checks plus the offline browser suite.

Consumer fixture installs disable all install scripts. Their child environment omits an inherited allow-scripts override because npm 11 rejects that CLI/environment option for project installs, even with ignore-scripts enabled. This does not change your npm configuration. Registry access and local HTTP ports are still needed for full installed-consumer verification. A passing mock test is not a substitute for the real Next.js checks. Keep publication gated on those checks being green.

Inspect the archive with `npm pack --dry-run`. It should contain dist, package.json and README, with no playground, fixtures, source files or environment secrets. Check that both `giggydev/vite` and `giggydev/next` resolve from the installed archive.

## 3. Finalize package identity

- Confirm you own or can publish the npm name `giggydev`: `npm view giggydev name version` and, if it exists, `npm owner ls giggydev`. An E404 indicates no published package was found; recheck at publish time.
- If the name must change, update package metadata, import examples and the Next loader's `jsxImportSource` before rebuilding and rerunning consumer verification.
- Choose the project license and add its LICENSE file and package.json license field. No license has been selected automatically.
- Confirm the version (currently 0.1.0), author, repository and README.
- Remove `"private": true` only when you are ready to publish. It remains enabled to prevent accidental publication during review.
- Commit and push the reviewed files from a terminal that can write this repository's .git directory. Check the Verify workflow succeeds.

## 4. Publish npm interactively

Follow the [npm unscoped package guide](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/).

```sh
npm login
npm whoami
npm run release:check
npm publish --access public
```

Complete npm's account/2FA prompts yourself. Publishing is the final action after reviewing the exact archive. Verify installation in a fresh app using the published version. For subsequent automated releases, configure [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) rather than adding a long-lived token to the repository. No automatic publishing workflow is configured yet.

## 5. Host the playground on Netlify

Import `Tebogo11/giggyDev` into Netlify and select the actual release branch. Use the repository root as the base directory. The existing netlify.toml sets:

```toml
[build]
  command = "npm run build && npm run build:demo"
  publish = "playground/demo-dist"
```

Use Node 22 for the build. Deploy a preview and check the screenshot, section navigation, light/dark mode, capture buttons, picker and Markdown preview. Hosted replies must remain simulated and the hosted site must not offer local file apply/Undo. No provider API key is required in Netlify. The React playground is built separately from the npm library.

See [Netlify's Vite setup](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/) and [file-based build configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/).
