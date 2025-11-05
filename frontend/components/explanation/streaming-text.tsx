/**
 * Component for displaying streaming text with typewriter effect
 */

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  className?: string;
}

export function StreamingText({
  text,
  isStreaming,
  className,
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText(text);
  }, [text]);

  return (
    <div className={cn("relative", className)}>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {displayedText}
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
        )}
      </p>
    </div>
  );
}
