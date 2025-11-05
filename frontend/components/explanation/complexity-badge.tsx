/**
 * Badge component showing complexity level with color coding
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { ComplexityLevel } from "@/types";
import { LEVEL_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ComplexityBadgeProps {
  level: ComplexityLevel;
  className?: string;
}

const levelStyles: Record<ComplexityLevel, string> = {
  beginner: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
  intermediate:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  advanced: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  expert: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};

export function ComplexityBadge({ level, className }: ComplexityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("font-mono text-xs", levelStyles[level], className)}
    >
      {LEVEL_LABELS[level]}
    </Badge>
  );
}
