import React, { memo, useState } from 'react';
import { blocks, inline, type Block, type Inline } from './markdown';
import { Reply } from './MarkdownReply.styles';

function CodeBlock({ text, language }: { text: string; language?: string }) {
  const [feedback, setFeedback] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(text); setFeedback('Copied'); }
    catch { setFeedback('Select the code to copy'); }
  }
  return <div className="code-block">
    <div className="code-toolbar"><span>{language?.split(/\s/)[0] || 'text'}</span><button type="button" onClick={() => void copy()}>Copy code</button><span aria-live="polite">{feedback}</span></div>
    <pre><code>{text}</code></pre>
  </div>;
}

/** Render allowlisted elements, never provider-generated HTML. */
function renderInline(nodes: Inline[]): React.ReactNode {
  return nodes.map((node, key) => {
    switch (node.type) {
      case 'text': return <React.Fragment key={key}>{node.text}</React.Fragment>;
      case 'code': return <code key={key}>{node.text}</code>;
      case 'strong': return <strong key={key}>{renderInline(node.children)}</strong>;
      case 'em': return <em key={key}>{renderInline(node.children)}</em>;
      case 'del': return <del key={key}>{renderInline(node.children)}</del>;
      case 'link': return node.href ? <a key={key} href={node.href} target="_blank" rel="noreferrer noopener">{renderInline(node.children)}</a> : <React.Fragment key={key}>{renderInline(node.children)}</React.Fragment>;
    }
  });
}
function renderBlocks(nodes: Block[]): React.ReactNode {
  return nodes.map((node, key) => {
    switch (node.type) {
      case 'heading': return React.createElement('h' + node.level, {key}, renderInline(inline(node.text)));
      case 'paragraph': return <p key={key}>{renderInline(inline(node.text))}</p>;
      case 'quote': return <blockquote key={key}>{renderInline(inline(node.text))}</blockquote>;
      case 'code': return <CodeBlock key={key} text={node.text} language={node.language} />;
      case 'rule': return <hr key={key} />;
      case 'list': {
        const items = node.items.map((item, index) => <li key={index}>{renderBlocks(item)}</li>);
        return node.ordered ? <ol key={key} start={node.start}>{items}</ol> : <ul key={key}>{items}</ul>;
      }
    }
  });
}

// Completed replies do not reparse when another message receives a streamed delta.
export const MarkdownReply = memo(function MarkdownReply({ content }: { content: string }) {
  return <Reply className="markdown-reply">{renderBlocks(blocks(content))}</Reply>;
});
