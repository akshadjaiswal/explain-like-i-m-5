/**
 * API route for generating explanations
 * Handles both streaming and cached responses
 * Uses multi-provider LLM client: Groq (primary) → Gemini fallbacks
 */

import { NextRequest } from "next/server";
import { generateExplanationStream } from "@/lib/llm/client";
import {
  getCachedExplanations,
  saveExplanation,
  getOrCreateTopic,
} from "@/lib/cache/service";
import { createSlug, slugToTitle } from "@/lib/utils/slugify";
import { COMPLEXITY_LEVELS } from "@/lib/constants";
import { ComplexityLevel, Explanation } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, levels } = body;

    if (!topic || typeof topic !== "string") {
      return Response.json(
        { error: "Topic is required and must be a string" },
        { status: 400 }
      );
    }

    const topicSlug = createSlug(topic);
    const topicTitle = slugToTitle(topicSlug);

    // Default to all levels if not specified
    const requestedLevels: ComplexityLevel[] = levels || [
      COMPLEXITY_LEVELS.BEGINNER,
      COMPLEXITY_LEVELS.INTERMEDIATE,
      COMPLEXITY_LEVELS.ADVANCED,
      COMPLEXITY_LEVELS.EXPERT,
    ];

    // Check cache first
    const cached = await getCachedExplanations(topicSlug);
    const cachedByLevel = new Map<ComplexityLevel, Explanation>();
    cached?.forEach((item) => cachedByLevel.set(item.complexityLevel, item));
    const allLevelsCached = requestedLevels.every((level) =>
      cachedByLevel.has(level)
    );

    if (cached && allLevelsCached) {
      // All explanations are cached - return immediately
      await getOrCreateTopic(topicSlug, topicTitle);

      return Response.json({
        topicSlug,
        topicTitle,
        explanations: cached,
        cached: true,
      });
    }

    // Create or update topic
    await getOrCreateTopic(topicSlug, topicTitle);

    // Generate missing explanations with streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (const level of requestedLevels) {
            // Check if this level is cached
            const cachedLevel = cachedByLevel.get(level);

            if (cachedLevel) {
              // Send cached explanation
              const chunk = JSON.stringify({
                level,
                content: cachedLevel.content,
                done: true,
                cached: true,
              });
              controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
            } else {
              // Generate new explanation with streaming
              let fullContent = "";

              for await (const text of generateExplanationStream({
                topic: topicTitle,
                level,
              })) {
                fullContent += text;

                const chunk = JSON.stringify({
                  level,
                  chunk: text,
                  done: false,
                  cached: false,
                });
                controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
              }

              // Save to cache
              await saveExplanation(topicSlug, topicTitle, level, fullContent);

              // Send completion marker
              const doneChunk = JSON.stringify({
                level,
                done: true,
                cached: false,
              });
              controller.enqueue(encoder.encode(`data: ${doneChunk}\n\n`));
            }
          }

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          const errorChunk = JSON.stringify({
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
          controller.enqueue(encoder.encode(`data: ${errorChunk}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to process request",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const topicSlug = searchParams.get("slug");

    if (!topicSlug) {
      return Response.json(
        { error: "Topic slug is required" },
        { status: 400 }
      );
    }

    const cached = await getCachedExplanations(topicSlug);

    if (!cached || cached.length === 0) {
      return Response.json(
        { error: "No cached explanations found" },
        { status: 404 }
      );
    }

    const topicTitle = cached[0].topicTitle;

    return Response.json({
      topicSlug,
      topicTitle,
      explanations: cached,
      cached: true,
    });
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch explanations",
      },
      { status: 500 }
    );
  }
}
