import React, { useEffect, useRef, useState } from "react";
import type { Entry } from "../../../capture";
import type { WidgetOptions } from "../../../runtime/mount-widget";
import type {
  AIConfiguration,
  ChatMessage,
  ChatRequest,
  FixProposal,
} from "../../../ai/types";
import { Composer, ComposerActions, Conversation } from "./ChatPanel.styles";
import { EmptyState, Mark } from "../../styles/layout.styles";
import { FixReview } from "../fixes/FixReview";

const setup =
  "Add an AI key and model in .env.local: GIGGYDEV_AI_KEY and GIGGYDEV_AI_MODEL, or configure ai.models in the Vite plugin. Restart the dev server after setup.";
interface ChatPanelProps {
  context: Entry[];
  options: WidgetOptions;
  onClose: () => void;
}
export function ChatPanel({ context, options, onClose }: ChatPanelProps) {
  const demo = options.mode === "demo";
  const client = options.aiClient;
  const [configuration, setConfiguration] = useState<AIConfiguration>({
    models: [],
  });
  const [setupLoaded, setSetupLoaded] = useState(false);
  const [modelId, setModelId] = useState("");
  const [editCode, setEditCode] = useState(() => {
    try { return localStorage.getItem("giggydev-edit-code") === "true"; }
    catch { return false; }
  });
  function changeEditCode(enabled: boolean) {
    setEditCode(enabled);
    try { localStorage.setItem("giggydev-edit-code", String(enabled)); }
    catch { /* Keep the selection for this session when storage is unavailable. */ }
  }
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false),
    [proposing, setProposing] = useState(false);
  const [error, setError] = useState("");
  const [proposal, setProposal] = useState<FixProposal>();
  const conversation = useRef<HTMLDivElement>(null);
  const followReply = useRef(true);

  useEffect(() => {
    if (followReply.current && conversation.current)
      conversation.current.scrollTop = conversation.current.scrollHeight;
  }, [messages]);
  const activeRequest = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    let disposed = false;
    setSetupLoaded(false);
    if (demo) {
      setModelId("demo-fast");
      return;
    }
    if (!client) setSetupLoaded(true);
    client
      ?.review()
      .then((review) => {
        if (!disposed && review) setProposal(review);
      })
      .catch(() => {});
    client
      ?.configuration()
      .then((result) => {
        if (disposed) return;
        setConfiguration(result);
        setSetupLoaded(true);
        setModelId(
          result.models.find((model) => model.ready)?.id ??
            result.models[0]?.id ??
            "",
        );
      })
      .catch(() => {
        if (!disposed)
          setError("Could not load AI setup. Restart the development server.");
      });
    return () => {
      disposed = true;
      activeRequest.current?.abort();
    };
  }, [client, demo]);

  function request(question: string): ChatRequest {
    return {
      modelId,
      messages: [
        ...messages.filter((message) => message.content.trim()),
        { role: "user", content: question },
      ].slice(-20) as ChatMessage[],
      context,
    };
  }

  function ready() {
    if (
      !client ||
      !configuration.models.find((model) => model.id === modelId)?.ready
    ) {
      setError(configuration.setupMessage ?? setup);
      return false;
    }
    return true;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || pending || proposing) return;
    setError("");
    if (!demo && !ready()) return;
    const payload = request(question);
    const index = messages.length + 1;
    setDraft("");
    setPending(true);
    setMessages((current) => [
      ...current,
      { role: "user", content: question },
      { role: "assistant", content: "" },
    ]);

    const abort = new AbortController();
    activeRequest.current = abort;
    const append = (text: string) =>
      setMessages((current) =>
        current.map((message, at) =>
          at === index
            ? { ...message, content: message.content + text }
            : message,
        ),
      );
    try {
      if (demo) {
        const answer =
          (await options.simulateReply?.(question, context)) ??
          "This is a simulated playground reply.";
        append(
          "This is just a playground. Download giggyDev and try it for yourself.\n\n" +
            answer,
        );
      } else await client!.chat(payload, append, abort.signal);
    } catch (reason) {
      setError(
        abort.signal.aborted
          ? "Reply stopped."
          : reason instanceof Error
            ? reason.message
            : "AI request failed",
      );
    } finally {
      setPending(false);
      activeRequest.current = undefined;
    }
  }

  async function propose() {
    if (demo || !editCode || pending || proposing || !ready()) return;
    const question =
      draft.trim() ||
      [...messages].reverse().find((message) => message.role === "user")
        ?.content;
    if (!question) {
      setError("Describe the problem or the fix you want first.");
      return;
    }
    setError("");
    setProposing(true);
    setProposal(undefined);
    try {
      setProposal(await client!.propose(request(question)));
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not propose a fix",
      );
    } finally {
      setProposing(false);
    }
  }

  const selectedModel = configuration.models.find(model => model.id === modelId);
  const keyMissing = !demo && setupLoaded && (selectedModel ? !selectedModel.ready : !(configuration.hasKey ?? configuration.models.some(model => model.ready)));

  return (
    <>
      {messages.length ? (
        <Conversation
          ref={conversation}
          onScroll={(event) => {
            const node = event.currentTarget;
            followReply.current =
              node.scrollHeight - node.scrollTop - node.clientHeight < 40;
          }}
          role="log"
          aria-label="Conversation"
          aria-live="polite"
        >
          {messages.map((message, index) => (
            <article key={index}>
              <small>
                {message.role === "user"
                  ? "You"
                  : demo
                    ? "Simulated reply"
                    : "AI reply"}
              </small>
              <p>{message.content || (pending ? "Thinking…" : "")}</p>
            </article>
          ))}
        </Conversation>
      ) : (
        <EmptyState>
          <Mark>g↗</Mark>
          <h1>Give your AI the full picture.</h1>
          <p>
            Select logs, requests or a component, choose a model and ask about
            them.
          </p>
        </EmptyState>
      )}
      {proposal && client && (
        <FixReview key={proposal.id} proposal={proposal} client={client} editCode={editCode} />
      )}
      <Composer onSubmit={submit}>

        {demo ? (
          <small>
            This is just a playground. Download giggyDev and try it for
            yourself.{" "}
            <a href={options.gettingStartedUrl ?? "#start"} onClick={onClose}>
              Get started
            </a>
          </small>
        ) : keyMissing ? (
          <small data-testid="api-key-help">
            Keys stay in .env.local or server plugin options.{" "}
            {configuration.setupMessage ?? setup}
          </small>
        ) : null}
        {error && <p role="alert">{error}{error.includes('(429)') && selectedModel?.provider === 'openai' && <><br/><a href="https://platform.openai.com/usage" target="_blank" rel="noreferrer">API usage</a>{' · '}<a href="https://platform.openai.com/settings/organization/billing/overview" target="_blank" rel="noreferrer">API billing</a></>}</p>}
        <textarea
          aria-label="Message"
          disabled={pending || proposing}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about your selected context…"
        />
        <ComposerActions aria-label="Chat actions">
        <button
          type="submit"
          disabled={pending || proposing || !draft.trim()}
        >
          {demo ? "Send demo message" : "Send message"}
        </button>{" "}
        {pending && (
          <button type="button" onClick={() => activeRequest.current?.abort()}>
            Stop reply
          </button>
        )}
        {!demo && <label className="edit-code-toggle"><input type="checkbox" role="switch" aria-label="Edit code" checked={editCode} disabled={pending || proposing} onChange={(event) => changeEditCode(event.target.checked)} />Edit code</label>}
        {!demo && editCode && (
          <button
            type="button"
            disabled={pending || proposing}
            onClick={() => void propose()}
          >
            {proposing ? "Preparing fix…" : "Propose fix"}
          </button>
        )}
        <label className="model-select">
          Model{" "}
          <select
            aria-label="AI model"
            value={modelId}
            disabled={pending || proposing}
            onChange={(event) => {
              setModelId(event.target.value);
              setError("");
              setProposal(undefined);
            }}
          >
            {demo ? (
              <>
                <option value="demo-fast">Demo · Fast (simulated)</option>
                <option value="demo-reasoning">
                  Demo · Reasoning (simulated)
                </option>
              </>
            ) : (
              <>
                <option value="">Select a configured model</option>
                {configuration.models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                    {model.ready ? "" : " — key required"}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>
        </ComposerActions>
      </Composer>
    </>
  );
}
