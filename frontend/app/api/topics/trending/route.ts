/**
 * API route for fetching trending topics
 */

import { NextRequest } from "next/server";
import { getTrendingTopics } from "@/lib/cache/service";
import { UI_CONFIG } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    const limit = limitParam
      ? parseInt(limitParam, 10)
      : UI_CONFIG.TRENDING_TOPICS_LIMIT;

    const topics = await getTrendingTopics(limit);

    return Response.json({ topics });
  } catch (error) {
    console.error("Trending topics error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch trending topics",
      },
      { status: 500 }
    );
  }
}
