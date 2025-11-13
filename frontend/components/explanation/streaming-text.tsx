/**
 * Component for displaying streaming text with proper markdown rendering
 * Uses react-markdown with remark-gfm for full markdown support including tables
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  className?: string;
  startDelay?: number; // Delay in ms before starting animation (for staggered effect)
}

// Custom components for markdown elements with compact Tailwind styling
const markdownComponents: Components = {
  // Headers - compact sizing
  h1: ({ node, ...props }) => (
    <h1 className="text-lg md:text-xl font-bold mb-2 mt-3 text-foreground" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-base md:text-lg font-bold mb-1.5 mt-3 text-foreground" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-sm md:text-base font-semibold mb-1.5 mt-2.5 text-foreground" {...props} />
  ),
  h4: ({ node, ...props }) => (
    <h4 className="text-sm font-semibold mb-1 mt-2 text-foreground" {...props} />
  ),
  h5: ({ node, ...props }) => (
    <h5 className="text-xs md:text-sm font-semibold mb-1 mt-2 text-foreground" {...props} />
  ),
  h6: ({ node, ...props }) => (
    <h6 className="text-xs font-semibold mb-1 mt-2 text-muted-foreground" {...props} />
  ),

  // Paragraphs - small text, tight spacing
  p: ({ node, ...props }) => (
    <p className="mb-2 leading-snug text-sm text-foreground" {...props} />
  ),

  // Lists - compact spacing
  ul: ({ node, ...props }) => (
    <ul className="mb-2 ml-4 space-y-0.5 list-disc text-sm" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="mb-2 ml-4 space-y-0.5 list-decimal text-sm" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="text-foreground leading-snug text-sm" {...props} />
  ),

  // Tables - compact with remark-gfm support
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-3 rounded-md border border-border">
      <table className="min-w-full divide-y divide-border text-xs md:text-sm" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-muted/50" {...props} />,
  tbody: ({ node, ...props }) => (
    <tbody className="divide-y divide-border bg-background" {...props} />
  ),
  tr: ({ node, ...props }) => (
    <tr className="hover:bg-muted/30 transition-colors" {...props} />
  ),
  th: ({ node, ...props }) => (
    <th
      className="px-2 md:px-3 py-1.5 md:py-2 text-left text-xs md:text-sm font-semibold text-foreground border-r border-border last:border-r-0"
      {...props}
    />
  ),
  td: ({ node, ...props }) => (
    <td
      className="px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-foreground border-r border-border last:border-r-0 leading-tight"
      {...props}
    />
  ),

  // Code - compact monospace styling
  code: ({ node, className, children, ...props }) => {
    // Check if it's inline code by checking if there's a parent pre element
    const isInline = !className?.includes('language-');

    if (isInline) {
      return (
        <code
          className="px-1 py-0.5 rounded bg-muted/80 text-primary font-mono text-[11px] md:text-xs font-medium"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className={cn(
          "block px-3 py-2 my-2 rounded-md bg-muted/80 font-mono text-[11px] md:text-xs overflow-x-auto leading-tight",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ node, ...props }) => <pre className="mb-2 overflow-x-auto" {...props} />,

  // Blockquotes - compact
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="border-l-2 border-primary pl-3 italic my-2 text-muted-foreground text-sm"
      {...props}
    />
  ),

  // Links - compact
  a: ({ node, ...props }) => (
    <a
      className="text-primary hover:underline font-medium text-sm"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),

  // Horizontal rule
  hr: ({ node, ...props }) => <hr className="my-3 border-t border-border" {...props} />,

  // Strong/Bold
  strong: ({ node, ...props }) => (
    <strong className="font-bold text-foreground" {...props} />
  ),

  // Em/Italic
  em: ({ node, ...props }) => (
    <em className="italic text-muted-foreground" {...props} />
  ),

  // Strikethrough (GFM)
  del: ({ node, ...props }) => (
    <del className="line-through text-muted-foreground" {...props} />
  ),
};

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

  return (
    <div className={cn("relative text-sm", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {displayedText}
      </ReactMarkdown>
      {(isStreaming || isAnimating) && (
        <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-primary animate-pulse" />
      )}
    </div>
  );
}
