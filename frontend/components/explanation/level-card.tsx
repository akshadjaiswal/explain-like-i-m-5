/**
 * Card displaying a single complexity level explanation
 * with cute retry button for failed generations
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
import { RefreshCw, Sparkles } from "lucide-react";

interface LevelCardProps {
  level: ComplexityLevel;
  content: string;
  cached?: boolean;
  isLoading?: boolean;
  startDelay?: number;
  error?: string | null;
  isRetrying?: boolean;
  onRetry?: () => void;
  className?: string;
}

// Cute messages for empty/error states
const RETRY_MESSAGES = {
  empty: {
    emoji: "🤔",
    title: "Oops! Nothing here yet",
    message: "This explanation seems to have wandered off...",
    button: "Generate it for me!",
    icon: Sparkles,
  },
  error: {
    emoji: "😅",
    title: "Well, this is awkward...",
    message: "Something went wrong, but we can try again!",
    button: "Let's retry!",
    icon: RefreshCw,
  },
};

export function LevelCard({
  level,
  content,
  cached = false,
  isLoading = false,
  startDelay = 0,
  error = null,
  isRetrying = false,
  onRetry,
  className,
}: LevelCardProps) {
  const showLoadingState = (isLoading || isRetrying) && !content;
  const showEmptyState = !content && !isLoading && !isRetrying && !error;
  const showErrorState = !content && !isLoading && !isRetrying && error;

  const retryState = showErrorState ? RETRY_MESSAGES.error : RETRY_MESSAGES.empty;
  const RetryIcon = retryState.icon;

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
          {/* Loading State */}
          {showLoadingState && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 animate-in fade-in duration-300">
              <div className="w-full max-w-md space-y-3">
                <div className="h-3 w-full bg-primary/20 rounded animate-pulse"></div>
                <div
                  className="h-3 w-[90%] bg-primary/20 rounded animate-pulse"
                  style={{ animationDelay: "100ms" }}
                ></div>
                <div
                  className="h-3 w-[95%] bg-primary/20 rounded animate-pulse"
                  style={{ animationDelay: "200ms" }}
                ></div>
                <div className="pt-2"></div>
                <div
                  className="h-3 w-full bg-primary/20 rounded animate-pulse"
                  style={{ animationDelay: "300ms" }}
                ></div>
                <div
                  className="h-3 w-[85%] bg-primary/20 rounded animate-pulse"
                  style={{ animationDelay: "400ms" }}
                ></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce"></div>
                <div
                  className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <p className="text-sm font-medium">
                {isRetrying ? "Retrying..." : "Generating explanation..."}
              </p>
            </div>
          )}

          {/* Content State */}
          {content && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <StreamingText
                text={content}
                isStreaming={false}
                startDelay={startDelay}
                className="text-foreground"
              />
            </div>
          )}

          {/* Empty State - Show retry button */}
          {showEmptyState && onRetry && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-in fade-in duration-300">
              <div className="text-6xl mb-4 animate-bounce">{retryState.emoji}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {retryState.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                {retryState.message}
              </p>
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                <RetryIcon className="w-4 h-4" />
                {retryState.button}
              </button>
            </div>
          )}

          {/* Error State - Show retry button with error message */}
          {showErrorState && onRetry && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-in fade-in duration-300">
              <div className="text-6xl mb-4 animate-bounce">{retryState.emoji}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {retryState.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-2 max-w-xs">
                {retryState.message}
              </p>
              {error && (
                <p className="text-xs text-destructive mb-6 max-w-xs font-mono bg-destructive/10 px-3 py-2 rounded">
                  {error}
                </p>
              )}
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                <RetryIcon className="w-4 h-4" />
                {retryState.button}
              </button>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
