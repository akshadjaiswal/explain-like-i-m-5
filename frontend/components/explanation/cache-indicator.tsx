/**
 * Indicator showing whether content is cached or freshly generated
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CacheIndicatorProps {
  cached: boolean;
  className?: string;
}

export function CacheIndicator({ cached, className }: CacheIndicatorProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={`font-mono text-xs gap-1 ${className}`}
          >
            {cached ? (
              <>
                <Zap className="h-3 w-3" />
                Cached
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                Fresh
              </>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {cached
              ? "Loaded from cache - instant response"
              : "Freshly generated explanation"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
