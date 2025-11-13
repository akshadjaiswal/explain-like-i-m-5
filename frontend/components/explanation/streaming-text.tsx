/**
 * Component for displaying streaming text with rich formatting
 * Supports markdown-like formatting, keyword highlighting, and proper typography
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  className?: string;
  startDelay?: number; // Delay in ms before starting animation (for staggered effect)
}

/**
 * Parse text and apply rich formatting:
 * - **bold** → <strong>
 * - *italic* → <em>
 * - `code` → <code>
 * - Bullet points (- or •) → styled lists
 * - Numbered lists (1. 2. etc) → styled lists
 * - Technical keywords → highlighted
 */
function formatText(text: string): React.ReactNode[] {
  if (!text) return [];

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let listType: "bullet" | "numbered" | null = null;

  const flushParagraph = (index: number) => {
    if (currentParagraph.length > 0) {
      const paragraphText = currentParagraph.join(" ");
      elements.push(
        <p key={`p-${index}`} className="mb-4 leading-relaxed">
          {formatInlineText(paragraphText)}
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushList = (index: number) => {
    if (listItems.length > 0) {
      if (listType === "bullet") {
        elements.push(
          <ul key={`ul-${index}`} className="mb-4 ml-4 space-y-2 list-none">
            {listItems}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${index}`} className="mb-4 ml-4 space-y-2 list-none">
            {listItems}
          </ol>
        );
      }
      listItems = [];
      listType = null;
    }
    inList = false;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Empty line - flush current paragraph/list
    if (!trimmedLine) {
      flushParagraph(index);
      flushList(index);
      return;
    }

    // Bullet point detection
    const bulletMatch = trimmedLine.match(/^[-•]\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph(index);
      if (!inList || listType !== "bullet") {
        flushList(index);
        inList = true;
        listType = "bullet";
      }
      listItems.push(
        <li key={`li-${index}`} className="flex items-start gap-2">
          <span className="text-primary mt-0.5 font-bold">•</span>
          <span className="flex-1">{formatInlineText(bulletMatch[1])}</span>
        </li>
      );
      return;
    }

    // Numbered list detection
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      flushParagraph(index);
      if (!inList || listType !== "numbered") {
        flushList(index);
        inList = true;
        listType = "numbered";
      }
      listItems.push(
        <li key={`li-${index}`} className="flex items-start gap-2">
          <span className="text-primary font-bold font-mono min-w-[1.5rem]">
            {numberedMatch[1]}.
          </span>
          <span className="flex-1">{formatInlineText(numberedMatch[2])}</span>
        </li>
      );
      return;
    }

    // Regular text - add to current paragraph
    flushList(index);
    currentParagraph.push(trimmedLine);
  });

  // Flush any remaining content
  flushParagraph(lines.length);
  flushList(lines.length);

  return elements;
}

/**
 * Format inline text with bold, italic, code, and keyword highlighting
 */
function formatInlineText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyCounter = 0;

  // Technical keywords to highlight
  const keywords = [
    "AI", "API", "CPU", "GPU", "RAM", "HTTP", "HTTPS", "JSON", "XML", "SQL",
    "quantum", "algorithm", "blockchain", "neural", "machine learning",
    "deep learning", "cryptocurrency", "encryption", "database", "server",
    "protocol", "framework", "library", "container", "cloud", "microservice",
  ];

  while (remaining) {
    // Try to match **bold**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      // Add text before match
      if (boldMatch.index > 0) {
        parts.push(
          <span key={`text-${keyCounter++}`}>
            {highlightKeywords(remaining.substring(0, boldMatch.index), keywords, keyCounter)}
          </span>
        );
      }
      // Add bold text
      parts.push(
        <strong key={`bold-${keyCounter++}`} className="font-bold text-foreground">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Try to match *italic*
    const italicMatch = remaining.match(/\*([^*]+)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) {
        parts.push(
          <span key={`text-${keyCounter++}`}>
            {highlightKeywords(remaining.substring(0, italicMatch.index), keywords, keyCounter)}
          </span>
        );
      }
      parts.push(
        <em key={`italic-${keyCounter++}`} className="italic text-muted-foreground">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
      continue;
    }

    // Try to match `code`
    const codeMatch = remaining.match(/`([^`]+)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) {
        parts.push(
          <span key={`text-${keyCounter++}`}>
            {highlightKeywords(remaining.substring(0, codeMatch.index), keywords, keyCounter)}
          </span>
        );
      }
      parts.push(
        <code
          key={`code-${keyCounter++}`}
          className="px-1.5 py-0.5 rounded bg-muted text-primary font-mono text-xs"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.substring(codeMatch.index + codeMatch[0].length);
      continue;
    }

    // No more matches - add remaining text with keyword highlighting
    parts.push(
      <span key={`text-${keyCounter++}`}>
        {highlightKeywords(remaining, keywords, keyCounter)}
      </span>
    );
    break;
  }

  return parts;
}

/**
 * Highlight technical keywords in text
 */
function highlightKeywords(
  text: string,
  keywords: string[],
  baseKey: number
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const remaining = text;
  let counter = 0;

  // Create case-insensitive regex for keywords
  const keywordPattern = new RegExp(
    `\\b(${keywords.join("|")})\\b`,
    "gi"
  );

  const matches = Array.from(remaining.matchAll(keywordPattern));
  let lastIndex = 0;

  matches.forEach((match) => {
    if (match.index !== undefined) {
      // Add text before keyword
      if (match.index > lastIndex) {
        parts.push(
          <span key={`kw-text-${baseKey}-${counter++}`}>
            {remaining.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add highlighted keyword
      parts.push(
        <span
          key={`kw-${baseKey}-${counter++}`}
          className="text-primary font-semibold"
        >
          {match[0]}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }
  });

  // Add remaining text
  if (lastIndex < remaining.length) {
    parts.push(
      <span key={`kw-text-${baseKey}-${counter++}`}>
        {remaining.substring(lastIndex)}
      </span>
    );
  }

  return parts.length > 0 ? parts : [text];
}

export function StreamingText({
  text,
  isStreaming,
  className,
  startDelay = 0,
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasStarted, setHasStarted] = useState(startDelay === 0);
  const displayedTextRef = useRef(displayedText);

  useEffect(() => {
    displayedTextRef.current = displayedText;
  }, [displayedText]);

  // Handle start delay
  useEffect(() => {
    if (startDelay > 0 && !hasStarted) {
      const delayTimeout = setTimeout(() => {
        setHasStarted(true);
      }, startDelay);

      return () => clearTimeout(delayTimeout);
    }
  }, [startDelay, hasStarted]);

  useEffect(() => {
    // Don't start animation until delay has passed
    if (!hasStarted) {
      return;
    }

    const previousText = displayedTextRef.current;

    // If text is shorter or empty, just set it asynchronously for smoothness
    if (!text || text.length <= previousText.length) {
      const frameId = window.requestAnimationFrame(() => {
        setDisplayedText(text);
        setIsAnimating(false);
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    // If streaming or text changed, animate character by character
    if (isStreaming || text !== previousText) {
      let timeoutId: number | undefined;
      const startFrame = window.requestAnimationFrame(() =>
        setIsAnimating(true)
      );
      let currentIndex = previousText.length;

      const animate = () => {
        if (currentIndex >= text.length) {
          setIsAnimating(false);
          return;
        }

        const remaining = text.length - currentIndex;
        const chunkSize = Math.min(
          64,
          Math.max(12, Math.ceil(remaining / 6))
        );
        const nextIndex = Math.min(currentIndex + chunkSize, text.length);
        setDisplayedText(text.substring(0, nextIndex));
        currentIndex = nextIndex;

        const delay =
          remaining > 400 ? 16 :
          remaining > 150 ? 24 :
          32;

        timeoutId = window.setTimeout(animate, delay);
      };

      timeoutId = window.setTimeout(animate, 0);

      return () => {
        window.cancelAnimationFrame(startFrame);
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    const frameId = window.requestAnimationFrame(() => {
      setDisplayedText(text);
      setIsAnimating(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [text, isStreaming, hasStarted]);

  const formattedContent = formatText(displayedText);

  return (
    <div className={cn("relative", className)}>
      <div className="text-sm text-foreground space-y-0">
        {formattedContent}
        {(isStreaming || isAnimating) && (
          <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
        )}
      </div>
    </div>
  );
}
