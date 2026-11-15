import type { AIOptions, AIConfiguration, ModelOptions } from './types';
export interface ResolvedModel extends ModelOptions { key: string }
export function resolveModels(options: AIOptions = {}, env: Record<string, string | undefined>): ResolvedModel[] {
  const provider = options.provider ?? env.GIGGYDEV_AI_PROVIDER ?? 'openai';
  if (!['openai','anthropic','openai-compatible'].includes(provider)) throw new Error('Unsupported AI provider');
  const models = options.models ?? [{ id: 'default', provider: provider as ModelOptions['provider'], model: options.model ?? env.GIGGYDEV_AI_MODEL ?? '', apiKey: options.apiKey, baseURL: options.baseURL ?? env.GIGGYDEV_AI_BASE_URL }];
  const ids = new Set<string>();
  return models.map(model => {
    if (!model.id || ids.has(model.id) || !['openai','anthropic','openai-compatible'].includes(model.provider)) throw new Error('AI model IDs must be unique and use a supported provider');
    ids.add(model.id);
    if (model.apiKeyEnv !== undefined && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(model.apiKeyEnv)) throw new Error('apiKeyEnv must be an environment variable name such as OPENAI_API_KEY. Use apiKey for an explicit key value.');
    return { ...model, key: model.apiKey ?? options.apiKey ?? env[model.apiKeyEnv ?? 'GIGGYDEV_AI_KEY'] ?? env.AI_IN_CLIENT_API_KEY ?? env[model.provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY'] ?? '' };
  });
}
export const setupMessage = 'Add an AI key and model in .env.local (GIGGYDEV_AI_KEY and GIGGYDEV_AI_MODEL), or configure ai.models in the Vite plugin. Restart the dev server after changing setup.';
export function publicConfiguration(models: ResolvedModel[]): AIConfiguration {
  return { hasKey: models.some(model => !!model.key), models: models.filter(model => model.model).map(model => ({ id: model.id, label: model.label ?? `${model.provider} / ${model.model}`, provider: model.provider, model: model.model, ready: !!model.key })), setupMessage: models.some(model => model.model && model.key) ? undefined : setupMessage };
}
