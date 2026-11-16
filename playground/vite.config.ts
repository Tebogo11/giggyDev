import { defineConfig } from "vite";
import giggyDev from "../dist/vite.js";

export default defineConfig({
  plugins: [
    giggyDev({
      ai: {
        models: [
          {
            id: "comet-claude",
            label: "Claude via CometAPI",
            provider: "openai-compatible",
            baseURL: "https://api.cometapi.com/v1",
            model: "claude-sonnet-5", // example: verify in the catalog
            apiKeyEnv: "COMETAPI_KEY", // variable name, not the secret
          },
          {
            id: "comet-gpt",
            label: "GPT via CometAPI",
            provider: "openai-compatible",
            baseURL: "https://api.cometapi.com/v1",
            model: "gpt-5.5", // replace with your chosen text model ID
            apiKeyEnv: "COMETAPI_KEY",
          },
        ],
      },
    }),
    // Keep your existing React plugin after giggyDev.
  ],
});
