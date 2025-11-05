/**
 * Error handling for explanation page
 */

"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Explanation page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header showSearch />

      <main className="flex-1">
        <div className="container px-4 py-8 md:py-12">
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Oops! Something went wrong
              </h1>
              <p className="text-muted-foreground max-w-md">
                We encountered an error while generating your explanation. Please
                try again.
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={reset}>Try Again</Button>
              <Button variant="outline" onClick={() => (window.location.href = "/")}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
