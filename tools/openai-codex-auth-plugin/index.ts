import {
  emptyPluginConfigSchema,
  type OpenClawPluginApi,
  type ProviderAuthContext,
  type ProviderAuthResult,
} from "openclaw/plugin-sdk";
import { loginOpenAICodex } from "/root/.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/node_modules/@mariozechner/pi-ai/dist/index.js";

const PROVIDER_ID = "openai-codex";

async function runOAuth(ctx: ProviderAuthContext): Promise<ProviderAuthResult> {
  const progress = ctx.prompter.progress("Starting OpenAI Codex OAuth…");
  try {
    const oauthHandlers = ctx.oauth.createVpsAwareHandlers({
      isRemote: ctx.isRemote,
      runtime: ctx.runtime,
      prompter: ctx.prompter,
      openUrl: ctx.openUrl,
      spin: progress,
      localBrowserMessage: "Opening ChatGPT OAuth in your browser…",
      manualPromptMessage: "Paste the redirect URL (or authorization code)",
    });

    const creds = await loginOpenAICodex({
      onAuth: oauthHandlers.onAuth,
      onPrompt: oauthHandlers.onPrompt,
      onProgress: (message) => progress.update(message),
    });

    progress.stop("OpenAI Codex OAuth complete");

    return {
      profiles: [
        {
          profileId: `${PROVIDER_ID}:default`,
          credential: {
            type: "oauth",
            provider: PROVIDER_ID,
            access: creds.access,
            refresh: creds.refresh,
            expires: creds.expires,
            accountId: creds.accountId,
          },
        },
      ],
      notes: ["OAuth profile saved as openai-codex:default"],
    };
  } catch (error) {
    progress.stop("OpenAI Codex OAuth failed");
    throw error;
  }
}

const plugin = {
  id: "openai-codex-auth-plugin",
  name: "OpenAI Codex OAuth",
  description: "Provider auth plugin for openai-codex",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: "OpenAI Codex",
      aliases: ["codex", "chatgpt"],
      docsPath: "/providers/openai-codex",
      auth: [
        {
          id: "oauth",
          label: "ChatGPT OAuth",
          hint: "Login with ChatGPT Plus/Pro account",
          kind: "oauth_pkce",
          run: runOAuth,
        },
      ],
    });
  },
};

export default plugin;
