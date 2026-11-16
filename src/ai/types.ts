import type { Entry } from '../capture';
export type Provider = 'openai' | 'anthropic' | 'openai-compatible';
export interface ModelOptions { id: string; provider: Provider; model: string; label?: string; apiKey?: string; apiKeyEnv?: string; baseURL?: string }
export interface AIOptions { provider?: Provider; model?: string; apiKey?: string; baseURL?: string; models?: ModelOptions[] }
export interface ModelChoice { id: string; label: string; provider: Provider; model: string; ready: boolean }
export interface AIConfiguration { hasKey?: boolean; models: ModelChoice[]; setupMessage?: string }
export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface ChatRequest { modelId: string; messages: ChatMessage[]; context: Entry[]; editCode?: boolean }
export interface FixProposal { id: string; path: string; before: string; after: string; explanation: string; state?: 'proposed' | 'applied' | 'undone' | 'cancelled' }
export interface AIClient {
  configuration(): Promise<AIConfiguration>;
  review(): Promise<FixProposal | null>;
  chat(request: ChatRequest, onDelta: (text: string) => void, signal?: AbortSignal, onProposal?: (proposal: FixProposal) => void): Promise<void>;
  propose(request: ChatRequest): Promise<FixProposal>;
  apply(id: string): Promise<void>;
  undo(id: string): Promise<void>;
  cancel(id: string): Promise<void>;
}
