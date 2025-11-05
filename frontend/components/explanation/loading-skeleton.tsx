/**
 * Loading skeleton for explanation cards with enhanced animations
 */

"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="space-y-4 animate-in fade-in duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 animate-pulse" />
        <Skeleton className="h-6 w-20 animate-pulse" style={{ animationDelay: "75ms" }} />
      </div>

      {/* Content skeleton */}
      <Card className="transition-all duration-300">
        <CardHeader className="pb-3 md:pb-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-28 animate-pulse" />
            <Skeleton className="h-5 w-16 animate-pulse" style={{ animationDelay: "150ms" }} />
          </div>
          <Skeleton className="h-3 w-48 mt-2 animate-pulse" style={{ animationDelay: "100ms" }} />
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Simulating text lines with varying widths */}
          <Skeleton className="h-4 w-full animate-pulse" style={{ animationDelay: "200ms" }} />
          <Skeleton className="h-4 w-[95%] animate-pulse" style={{ animationDelay: "250ms" }} />
          <Skeleton className="h-4 w-[90%] animate-pulse" style={{ animationDelay: "300ms" }} />
          <div className="pt-2"></div>
          <Skeleton className="h-4 w-full animate-pulse" style={{ animationDelay: "350ms" }} />
          <Skeleton className="h-4 w-[85%] animate-pulse" style={{ animationDelay: "400ms" }} />
          <Skeleton className="h-4 w-[92%] animate-pulse" style={{ animationDelay: "450ms" }} />
          <div className="pt-2"></div>
          <Skeleton className="h-4 w-[88%] animate-pulse" style={{ animationDelay: "500ms" }} />
          <Skeleton className="h-4 w-full animate-pulse" style={{ animationDelay: "550ms" }} />
          <Skeleton className="h-4 w-[75%] animate-pulse" style={{ animationDelay: "600ms" }} />
        </CardContent>
      </Card>
    </div>
  );
}

export function ExplanationLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tabs skeleton */}
      <div className="grid grid-cols-4 gap-2 p-1 bg-muted rounded-lg">
        <Skeleton className="h-12 rounded-md animate-pulse" />
        <Skeleton className="h-12 rounded-md animate-pulse" style={{ animationDelay: "50ms" }} />
        <Skeleton className="h-12 rounded-md animate-pulse" style={{ animationDelay: "100ms" }} />
        <Skeleton className="h-12 rounded-md animate-pulse" style={{ animationDelay: "150ms" }} />
      </div>

      {/* Single card skeleton (tabs will show one at a time) */}
      <LoadingSkeleton delay={200} />
    </div>
  );
}
