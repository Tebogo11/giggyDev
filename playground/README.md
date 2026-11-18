# giggyDev playground

The playground is a React and Vite app in the giggyDev repository. It includes sample console events, network requests, a component picker exercise and a card for testing reviewed code fixes.

## Run locally

Use Node.js 20.19 or newer and run these commands from the repository root.

```sh
git clone https://github.com/Tebogo11/giggyDev.git
cd giggyDev
npm ci
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). The dev command builds the library before starting Vite. Restart it after changing library code or environment variables.

## Enable real AI replies and edits

1. Create a CometAPI key and choose the text model IDs you want to use.
2. Create `playground/.env.local` and add `COMETAPI_KEY=your-cometapi-api-key`.
3. Open `playground/vite.config.ts`. Update the `model` field for each CometAPI entry to an exact model ID available to your account.
4. Restart `npm run dev`, open the widget and choose a model in **Chat**.

For a single OpenAI or Anthropic model, replace the configured `giggyDev({ ai: { models: [...] } })` call with `giggyDev()`. Copy `playground/.env.example` to `playground/.env.local` and set the provider, key and model as described in the [API key setup](../README.md#api-key-setup).

## Try the widget

1. Trigger a console log or network request using the playground controls. Open the launcher, inspect the entry and tick its checkbox to attach it in Chat.
2. Click **Find component** and pick the demo counter button. Open **Sources** to see its JSX. In the hosted demo, this button has a curated source excerpt.
3. For a code fix, pick the cramped card in the padding exercise, enable **Edit code** in Chat and ask for 24px padding. Review and apply the change, then use **Undo** to restore the original padding.

## Build and preview the hosted demo

Run these commands from the repository root.

```sh
npm run build
npm run build:demo
npm run preview:demo
```

Open [http://127.0.0.1:4188](http://127.0.0.1:4188). The static demo uses simulated AI responses and browser-only edits, so it runs without provider setup.

For Netlify, connect the repository and keep the base directory at the repository root. The root `netlify.toml` sets Node.js 22, runs `npm run build && npm run build:demo` and publishes `playground/demo-dist`.
