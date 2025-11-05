/**
 * Card displaying a single complexity level explanation
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplexityLevel } from "@/types";
import { ComplexityBadge } from "./complexity-badge";
import { CacheIndicator } from "./cache-indicator";
import { StreamingText } from "./streaming-text";
import { LEVEL_DESCRIPTIONS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LevelCardProps {
  level: ComplexityLevel;
  content: string;
  isStreaming?: boolean;
  cached?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function LevelCard({
  level,
  content,
  isStreaming = false,
  cached = false,
  isLoading = false,
  className,
}: LevelCardProps) {
  const showLoadingState = isLoading || (isStreaming && !content);

  return (
    <Card className={cn("transition-all duration-300", className)}>
      <CardHeader className="pb-3 md:pb-6">
        <div className="flex items-start justify-between gap-2 md:gap-4">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base md:text-lg font-mono">
              <ComplexityBadge level={level} />
            </CardTitle>
            <p className="text-xs md:text-sm text-muted-foreground">
              {LEVEL_DESCRIPTIONS[level]}
            </p>
          </div>
          {content && (
            <div className="animate-in fade-in duration-300">
              <CacheIndicator cached={cached} />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] sm:h-[350px] md:h-[400px] pr-2 md:pr-4">
          {showLoadingState ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 animate-in fade-in duration-300">
              <div className="w-full max-w-md space-y-3">
                <div className="h-3 w-full bg-primary/20 rounded animate-pulse"></div>
                <div className="h-3 w-[90%] bg-primary/20 rounded animate-pulse" style={{animationDelay: "100ms"}}></div>
                <div className="h-3 w-[95%] bg-primary/20 rounded animate-pulse" style={{animationDelay: "200ms"}}></div>
                <div className="pt-2"></div>
                <div className="h-3 w-full bg-primary/20 rounded animate-pulse" style={{animationDelay: "300ms"}}></div>
                <div className="h-3 w-[85%] bg-primary/20 rounded animate-pulse" style={{animationDelay: "400ms"}}></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce"></div>
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: "150ms"}}></div>
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: "300ms"}}></div>
              </div>
              <p className="text-sm font-medium">
                {isStreaming ? "Streaming explanation..." : "Generating explanation..."}
              </p>
            </div>
          ) : content ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <StreamingText
                text={content}
                isStreaming={isStreaming}
                className="text-foreground"
              />
            </div>
          ) : null}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
