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
  cachedStates?: Record<ComplexityLevel, boolean>;
  defaultLevel?: ComplexityLevel;
  isLoading?: boolean;
  className?: string;
  onRetryLevel?: (level: ComplexityLevel) => void;
  retryingLevels?: Record<ComplexityLevel, boolean>;
  levelErrors?: Record<ComplexityLevel, string | null>;
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

// Stagger delays for each level (in ms) to create progressive reveal effect
const LEVEL_DELAYS: Record<ComplexityLevel, number> = {
  beginner: 0,          // Start immediately
  intermediate: 200,    // 200ms delay
  advanced: 400,        // 400ms delay
  expert: 600,          // 600ms delay
};

export function LevelTabs({
  explanations,
  cachedStates = {} as Record<ComplexityLevel, boolean>,
  defaultLevel = COMPLEXITY_LEVELS.BEGINNER,
  isLoading = false,
  className,
  onRetryLevel,
  retryingLevels = {} as Record<ComplexityLevel, boolean>,
  levelErrors = {} as Record<ComplexityLevel, string | null>,
}: LevelTabsProps) {
  const levels = Object.values(COMPLEXITY_LEVELS) as ComplexityLevel[];

  return (
    <Tabs defaultValue={defaultLevel} className={cn("w-full", className)}>
      <TabsList className="grid w-full h-auto grid-cols-2 gap-2 p-2 font-mono sm:grid-cols-4 sm:p-2 md:gap-1.5 md:p-1">
        {levels.map((level) => (
          <TabsTrigger
            key={level}
            value={level}
            className={cn(
              "w-full justify-center",
              "text-xs sm:text-sm md:text-base leading-tight",
              "min-h-[48px] sm:min-h-[42px]",
              "px-2 py-2 sm:px-3 md:px-4",
              "font-medium",
              "transition-all duration-200",
              "active:scale-95",
              tabStyles[level]
            )}
          >
            {LEVEL_LABELS[level]}
          </TabsTrigger>
        ))}
      </TabsList>

      {levels.map((level) => (
        <TabsContent key={level} value={level} className="mt-4 md:mt-6">
          <LevelCard
            level={level}
            content={explanations[level] || ""}
            cached={cachedStates[level] || false}
            isLoading={isLoading}
            startDelay={LEVEL_DELAYS[level]}
            error={levelErrors[level] || null}
            isRetrying={retryingLevels[level] || false}
            onRetry={onRetryLevel ? () => onRetryLevel(level) : undefined}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
