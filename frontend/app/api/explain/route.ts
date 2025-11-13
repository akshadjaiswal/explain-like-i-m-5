/**
 * API route for generating explanations
 * Returns complete JSON responses for better reliability
 * Uses multi-provider LLM client: Groq (primary) → Gemini fallbacks
 */

import { NextRequest } from "next/server";
import { generateExplanationComplete } from "@/lib/llm/client";
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

    // Create or update topic
    await getOrCreateTopic(topicSlug, topicTitle);

    // Separate cached and missing levels
    const results: Explanation[] = [];
    const levelsToGenerate: ComplexityLevel[] = [];

    for (const level of requestedLevels) {
      const cachedLevel = cachedByLevel.get(level);
      if (cachedLevel) {
        results.push(cachedLevel);
      } else {
        levelsToGenerate.push(level);
      }
    }

    // Generate missing levels in parallel for speed
    if (levelsToGenerate.length > 0) {
      console.log(`Generating ${levelsToGenerate.length} missing levels in parallel...`);

      const generationPromises = levelsToGenerate.map(async (level) => {
        try {
          console.log(`🔄 Generating ${level} level...`);
          const content = await generateExplanationComplete({
            topic: topicTitle,
            level,
          });

          // Save to cache
          const explanation = await saveExplanation(
            topicSlug,
            topicTitle,
            level,
            content
          );

          console.log(`✅ ${level} level generated successfully`);
          return explanation;
        } catch (error) {
          console.error(`❌ Failed to generate ${level} level:`, error);
          throw new Error(
            `Failed to generate ${level} explanation: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      });

      // Wait for all generations to complete
      const generatedExplanations = await Promise.all(generationPromises);
      results.push(...generatedExplanations);
    }

    // Sort results to match requested order
    const sortedResults = requestedLevels
      .map((level) => results.find((r) => r.complexityLevel === level))
      .filter((r): r is Explanation => r !== undefined);

    return Response.json({
      topicSlug,
      topicTitle,
      explanations: sortedResults,
      cached: levelsToGenerate.length === 0,
      generatedCount: levelsToGenerate.length,
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
