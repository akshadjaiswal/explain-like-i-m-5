/**
 * Main explanation viewer component with streaming support
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { LevelTabs } from "./level-tabs";
import { ExplanationLoadingSkeleton } from "./loading-skeleton";
import { ComplexityLevel, Explanation } from "@/types";
import { COMPLEXITY_LEVELS } from "@/lib/constants";

interface ExplanationViewerProps {
  slug: string;
  topicTitle: string;
  cached: Explanation[] | null;
}

export function ExplanationViewer({
  slug,
  topicTitle,
  cached,
}: ExplanationViewerProps) {
  const [explanations, setExplanations] = useState<
    Record<ComplexityLevel, string>
  >(() => {
    const initial = {} as Record<ComplexityLevel, string>;
    cached?.forEach((exp) => {
      initial[exp.complexityLevel] = exp.content;
    });
    return initial;
  });

  const [streamingStates, setStreamingStates] = useState<
    Record<ComplexityLevel, boolean>
  >({} as Record<ComplexityLevel, boolean>);

  const [cachedStates, setCachedStates] = useState<
    Record<ComplexityLevel, boolean>
  >(() => {
    const initial = {} as Record<ComplexityLevel, boolean>;
    cached?.forEach((exp) => {
      initial[exp.complexityLevel] = true;
    });
    return initial;
  });

  const [isLoading, setIsLoading] = useState(!cached || cached.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Track if we've already fetched to prevent duplicate calls
  const hasFetchedRef = useRef(false);
  const currentSlugRef = useRef(slug);

  useEffect(() => {
    // Reset state when slug changes for smooth navigation
    if (currentSlugRef.current !== slug) {
      hasFetchedRef.current = false;
      currentSlugRef.current = slug;

      // Clear previous content immediately for better UX
      setExplanations({} as Record<ComplexityLevel, string>);
      setStreamingStates({} as Record<ComplexityLevel, boolean>);
      setCachedStates({} as Record<ComplexityLevel, boolean>);
      setIsLoading(true);
      setError(null);

      // If we have cached data, populate immediately
      if (cached && cached.length > 0) {
        const initial = {} as Record<ComplexityLevel, string>;
        const cachedState = {} as Record<ComplexityLevel, boolean>;
        cached.forEach((exp) => {
          initial[exp.complexityLevel] = exp.content;
          cachedState[exp.complexityLevel] = true;
        });
        setExplanations(initial);
        setCachedStates(cachedState);
      }
    }

    // If all explanations are cached, no need to fetch
    if (cached && cached.length === 4) {
      setIsLoading(false);
      hasFetchedRef.current = true;
      return;
    }

    // Prevent duplicate fetches
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;

    // Generate explanations with streaming
    const generateExplanations = async () => {
      try {
        const response = await fetch("/api/explain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: topicTitle,
            levels: Object.values(COMPLEXITY_LEVELS),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate explanations");
        }

        // Check if the response is streaming or JSON
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("text/event-stream")) {
          // Handle streaming response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error("No reader available");
          }

          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.error) {
                    setError(data.error);
                    setIsLoading(false);
                    return;
                  }

                  if (data.level) {
                    const level = data.level as ComplexityLevel;

                    if (data.chunk) {
                      // Append chunk to existing content
                      setExplanations((prev) => ({
                        ...prev,
                        [level]: (prev[level] || "") + data.chunk,
                      }));
                      setStreamingStates((prev) => ({ ...prev, [level]: true }));
                    }

                    if (data.done) {
                      setStreamingStates((prev) => ({ ...prev, [level]: false }));
                      if (data.cached) {
                        setCachedStates((prev) => ({ ...prev, [level]: true }));
                      }
                    }
                  }
                } catch (e) {
                  console.error("Failed to parse SSE data:", e);
                }
              }
            }
          }

          setIsLoading(false);
        } else {
          // Handle JSON response (all cached)
          const data = await response.json();

          if (data.explanations) {
            const newExplanations = {} as Record<ComplexityLevel, string>;
            const newCached = {} as Record<ComplexityLevel, boolean>;

            data.explanations.forEach((exp: Explanation) => {
              newExplanations[exp.complexityLevel] = exp.content;
              newCached[exp.complexityLevel] = true;
            });

            setExplanations(newExplanations);
            setCachedStates(newCached);
          }

          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error generating explanations:", err);
        setError(
          err instanceof Error ? err.message : "Failed to generate explanations"
        );
        setIsLoading(false);
      }
    };

    generateExplanations();
  }, [slug]); // Only re-run when slug changes, not on every render

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium text-destructive">
            Error: {error}
          </p>
          <p className="text-sm text-muted-foreground">
            Please try again or search for a different topic.
          </p>
        </div>
      </div>
    );
  }

  // Show skeleton if loading AND no content yet
  const hasAnyContent = Object.values(explanations).some(content => content && content.length > 0);

  if (isLoading && !hasAnyContent) {
    return <ExplanationLoadingSkeleton />;
  }

  return (
    <LevelTabs
      explanations={explanations}
      streamingStates={streamingStates}
      cachedStates={cachedStates}
      isLoading={isLoading}
    />
  );
}
