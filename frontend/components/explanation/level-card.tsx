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

interface LevelCardProps {
  level: ComplexityLevel;
  content: string;
  isStreaming?: boolean;
  cached?: boolean;
  className?: string;
}

export function LevelCard({
  level,
  content,
  isStreaming = false,
  cached = false,
  className,
}: LevelCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-mono">
              <ComplexityBadge level={level} />
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {LEVEL_DESCRIPTIONS[level]}
            </p>
          </div>
          {content && <CacheIndicator cached={cached} />}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {content ? (
            <StreamingText
              text={content}
              isStreaming={isStreaming}
              className="text-foreground"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">Generating explanation...</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
