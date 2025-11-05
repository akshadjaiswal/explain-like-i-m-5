/**
 * Tabbed interface for switching between complexity levels
 */

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplexityLevel } from "@/types";
import { COMPLEXITY_LEVELS, LEVEL_LABELS } from "@/lib/constants";
import { LevelCard } from "./level-card";
import { cn } from "@/lib/utils";

interface LevelTabsProps {
  explanations: Record<ComplexityLevel, string>;
  streamingStates?: Record<ComplexityLevel, boolean>;
  cachedStates?: Record<ComplexityLevel, boolean>;
  defaultLevel?: ComplexityLevel;
  className?: string;
}

const tabStyles: Record<ComplexityLevel, string> = {
  beginner: "data-[state=active]:bg-teal-500/10 data-[state=active]:text-teal-700 dark:data-[state=active]:text-teal-400",
  intermediate:
    "data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400",
  advanced:
    "data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400",
  expert:
    "data-[state=active]:bg-rose-500/10 data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-400",
};

export function LevelTabs({
  explanations,
  streamingStates = {} as Record<ComplexityLevel, boolean>,
  cachedStates = {} as Record<ComplexityLevel, boolean>,
  defaultLevel = COMPLEXITY_LEVELS.BEGINNER,
  className,
}: LevelTabsProps) {
  const levels = Object.values(COMPLEXITY_LEVELS) as ComplexityLevel[];

  return (
    <Tabs defaultValue={defaultLevel} className={cn("w-full", className)}>
      <TabsList className="grid w-full grid-cols-4 font-mono">
        {levels.map((level) => (
          <TabsTrigger
            key={level}
            value={level}
            className={cn("text-xs sm:text-sm", tabStyles[level])}
          >
            {LEVEL_LABELS[level]}
          </TabsTrigger>
        ))}
      </TabsList>

      {levels.map((level) => (
        <TabsContent key={level} value={level} className="mt-6">
          <LevelCard
            level={level}
            content={explanations[level] || ""}
            isStreaming={streamingStates[level] || false}
            cached={cachedStates[level] || false}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
