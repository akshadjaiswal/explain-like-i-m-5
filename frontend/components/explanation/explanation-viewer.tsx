/**
 * Main explanation viewer component
 * Uses non-streaming API with client-side animation for reliability
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

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 60000; // 60 seconds

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
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
  const [loadingMessage, setLoadingMessage] = useState("Generating explanations...");
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Per-level retry state
  const [retryingLevels, setRetryingLevels] = useState<
    Record<ComplexityLevel, boolean>
  >({} as Record<ComplexityLevel, boolean>);

  const [levelErrors, setLevelErrors] = useState<
    Record<ComplexityLevel, string | null>
  >({} as Record<ComplexityLevel, string | null>);

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
      setCachedStates({} as Record<ComplexityLevel, boolean>);
      setIsLoading(true);
      setError(null);
      setRetryCount(0);
      setLoadingMessage("Generating explanations...");

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

    // Generate explanations with retry logic
    const generateExplanations = async (attemptNumber: number = 0) => {
      try {
        if (attemptNumber > 0) {
          setLoadingMessage(`Retrying... (Attempt ${attemptNumber + 1}/${MAX_RETRIES + 1})`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attemptNumber));
        } else {
          setLoadingMessage("Generating explanations...");
        }

        const response = await fetchWithTimeout(
          "/api/explain",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              topic: topicTitle,
              levels: Object.values(COMPLEXITY_LEVELS),
            }),
          },
          REQUEST_TIMEOUT_MS
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Server returned ${response.status}`
          );
        }

        const data = await response.json();

        if (data.explanations) {
          const newExplanations = {} as Record<ComplexityLevel, string>;
          const newCached = {} as Record<ComplexityLevel, boolean>;

          data.explanations.forEach((exp: Explanation) => {
            newExplanations[exp.complexityLevel] = exp.content;
            newCached[exp.complexityLevel] = data.cached || false;
          });

          setExplanations(newExplanations);
          setCachedStates(newCached);
          setIsLoading(false);
          setError(null);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error(`Error generating explanations (attempt ${attemptNumber + 1}):`, err);

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to generate explanations";

        // Retry on failure (up to MAX_RETRIES)
        if (attemptNumber < MAX_RETRIES) {
          setRetryCount(attemptNumber + 1);
          return generateExplanations(attemptNumber + 1);
        }

        // All retries exhausted
        setError(
          `${errorMessage}. Please try again or search for a different topic.`
        );
        setIsLoading(false);
      }
    };

    generateExplanations();
  }, [slug]); // Only re-run when slug changes, not on every render

  // Handler for retrying a single level
  const handleRetryLevel = async (level: ComplexityLevel) => {
    console.log(`🔄 Retrying level: ${level}`);

    // Set retrying state
    setRetryingLevels((prev) => ({ ...prev, [level]: true }));
    setLevelErrors((prev) => ({ ...prev, [level]: null }));

    try {
      const response = await fetchWithTimeout(
        "/api/explain/retry",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: topicTitle,
            topicSlug: slug,
            level,
          }),
        },
        REQUEST_TIMEOUT_MS
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.explanation) {
        // Update the explanation for this level
        setExplanations((prev) => ({
          ...prev,
          [level]: data.explanation.content,
        }));
        setCachedStates((prev) => ({ ...prev, [level]: false }));
        console.log(`✅ Successfully retried ${level} level`);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error(`❌ Failed to retry ${level} level:`, err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate explanation";
      setLevelErrors((prev) => ({ ...prev, [level]: errorMessage }));
    } finally {
      setRetryingLevels((prev) => ({ ...prev, [level]: false }));
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium text-destructive">
            Error: {error}
          </p>
          {retryCount > 0 && (
            <p className="text-sm text-muted-foreground">
              Failed after {retryCount + 1} attempt{retryCount > 0 ? "s" : ""}.
            </p>
          )}
          <button
            onClick={() => {
              hasFetchedRef.current = false;
              setError(null);
              setRetryCount(0);
              setIsLoading(true);
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show skeleton if loading AND no content yet
  const hasAnyContent = Object.values(explanations).some(
    (content) => content && content.length > 0
  );

  if (isLoading && !hasAnyContent) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground animate-pulse">
            {loadingMessage}
          </p>
        </div>
        <ExplanationLoadingSkeleton />
      </div>
    );
  }

  return (
    <LevelTabs
      explanations={explanations}
      cachedStates={cachedStates}
      isLoading={isLoading}
      onRetryLevel={handleRetryLevel}
      retryingLevels={retryingLevels}
      levelErrors={levelErrors}
    />
  );
}
