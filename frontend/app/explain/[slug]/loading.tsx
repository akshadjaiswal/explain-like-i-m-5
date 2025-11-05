/**
 * Loading state for explanation page
 */

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ExplanationLoadingSkeleton } from "@/components/explanation/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
          {/* Topic Header Skeleton */}
          <div className="mb-8 space-y-2 text-center md:text-left">
            <Skeleton className="h-10 w-64 mx-auto md:mx-0" />
            <Skeleton className="h-4 w-96 mx-auto md:mx-0 max-w-full" />
          </div>

          {/* Explanation Viewer Skeleton */}
          <ExplanationLoadingSkeleton />
        </div>
      </main>

      <Footer />
    </div>
  );
}
