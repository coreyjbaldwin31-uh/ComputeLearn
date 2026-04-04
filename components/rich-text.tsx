"use client";

import type { ReactNode } from "react";

/**
 * Lightweight inline rich-text renderer for curriculum content.
 * Supports a safe subset of markdown-like formatting:
 *  - `code` → <code>
 *  - **bold** → <strong>
 *  - *italic* → <em>
 *  - ```lang\ncode\n``` → <pre><code>
 *  - Lines starting with > → <blockquote>
 *  - Lines starting with - → <li> in <ul>
 *
 * Zero dependencies. No dangerouslySetInnerHTML. All output is React elements.
 */

type RichTextProps = {
  content: string;
  className?: string;
};

type InlineToken =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string };

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push({ type: "code", value: codeMatch[1] });
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold: **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      tokens.push({ type: "bold", value: boldMatch[1] });
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *text* (not preceded by *)
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      tokens.push({ type: "italic", value: italicMatch[1] });
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Plain text until next special char
    const nextSpecial = remaining.slice(1).search(/[`*]/);
    if (nextSpecial === -1) {
      tokens.push({ type: "text", value: remaining });
      remaining = "";
    } else {
      tokens.push({ type: "text", value: remaining.slice(0, nextSpecial + 1) });
      remaining = remaining.slice(nextSpecial + 1);
    }
  }

  return tokens;
}

function renderInlineTokens(tokens: InlineToken[]): ReactNode[] {
  return tokens.map((token, i) => {
    switch (token.type) {
      case "code":
        return (
          <code key={i} className="rt-code">
            {token.value}
          </code>
        );
      case "bold":
        return <strong key={i}>{token.value}</strong>;
      case "italic":
        return <em key={i}>{token.value}</em>;
      case "text":
        return <span key={i}>{token.value}</span>;
    }
  });
}

function renderInline(text: string): ReactNode[] {
  return renderInlineTokens(tokenizeInline(text));
}

type Block =
  | { type: "paragraph"; content: string }
  | { type: "codeblock"; language: string; content: string }
  | { type: "blockquote"; content: string }
  | { type: "list"; items: string[] };

function parseBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block: ```lang
    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: "codeblock",
        language,
        content: codeLines.join("\n"),
      });
      i++; // skip closing ```
      continue;
    }

    // Blockquote: > text
    if (line.startsWith("> ")) {
      blocks.push({ type: "blockquote", content: line.slice(2) });
      i++;
      continue;
    }

    // List items: - item
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    // Skip blank lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular paragraph
    blocks.push({ type: "paragraph", content: line });
    i++;
  }

  return blocks;
}

export function RichText({ content, className }: RichTextProps) {
  // Fast path: if no special characters, render as plain text
  if (
    !content.includes("`") &&
    !content.includes("**") &&
    !content.includes("*") &&
    !content.includes("```") &&
    !content.startsWith("> ") &&
    !content.startsWith("- ")
  ) {
    return <p className={className}>{content}</p>;
  }

  // Check if multi-line (has blocks)
  if (content.includes("\n")) {
    const blocks = parseBlocks(content);
    return (
      <div className={className}>
        {blocks.map((block, i) => {
          switch (block.type) {
            case "paragraph":
              return <p key={i}>{renderInline(block.content)}</p>;
            case "codeblock":
              return (
                <pre
                  key={i}
                  className="rt-codeblock"
                  data-language={block.language}
                >
                  <code>{block.content}</code>
                </pre>
              );
            case "blockquote":
              return (
                <blockquote key={i} className="rt-blockquote">
                  {renderInline(block.content)}
                </blockquote>
              );
            case "list":
              return (
                <ul key={i} className="rt-list">
                  {block.items.map((item, j) => (
                    <li key={j}>{renderInline(item)}</li>
                  ))}
                </ul>
              );
          }
        })}
      </div>
    );
  }

  // Single line with inline formatting
  return <p className={className}>{renderInline(content)}</p>;
}

/** Convenience: render an array of content strings as RichText paragraphs */
export function RichTextBlock({
  content,
  className,
}: {
  content: string[];
  className?: string;
}) {
  return (
    <div className={className}>
      {content.map((text, i) => (
        <RichText key={i} content={text} />
      ))}
    </div>
  );
}
