/**
 * API route for retrying a single failed complexity level
 * Generates explanation for just one level and saves to database
 */

import { NextRequest } from "next/server";
import { generateExplanationComplete } from "@/lib/llm/client";
import { saveExplanation, getOrCreateTopic } from "@/lib/cache/service";
import { ComplexityLevel } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, topicSlug, level } = body;

    // Validation
    if (!topic || typeof topic !== "string") {
      return Response.json(
        { error: "Topic is required and must be a string" },
        { status: 400 }
      );
    }

    if (!topicSlug || typeof topicSlug !== "string") {
      return Response.json(
        { error: "Topic slug is required and must be a string" },
        { status: 400 }
      );
    }

    if (!level || typeof level !== "string") {
      return Response.json(
        { error: "Level is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate level is a valid complexity level
    const validLevels = ["beginner", "intermediate", "advanced", "expert"];
    if (!validLevels.includes(level)) {
      return Response.json(
        { error: `Invalid level. Must be one of: ${validLevels.join(", ")}` },
        { status: 400 }
      );
    }

    console.log(`🔄 Retrying single level: ${level} for topic: ${topic}`);

    // Ensure topic exists in database
    await getOrCreateTopic(topicSlug, topic);

    // Generate explanation for this specific level
    try {
      console.log(`🔄 Generating ${level} level...`);
      const content = await generateExplanationComplete({
        topic,
        level: level as ComplexityLevel,
      });

      // Save to database
      const explanation = await saveExplanation(
        topicSlug,
        topic,
        level as ComplexityLevel,
        content
      );

      console.log(`✅ Successfully generated and saved ${level} level`);

      return Response.json({
        success: true,
        explanation,
      });
    } catch (error) {
      console.error(`❌ Failed to generate ${level} level:`, error);
      throw new Error(
        `Failed to generate ${level} explanation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error("Retry API error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retry explanation",
      },
      { status: 500 }
    );
  }
}
