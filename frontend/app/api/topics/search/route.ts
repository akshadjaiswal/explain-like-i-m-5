/**
 * API route for searching topics
 */

import { NextRequest } from "next/server";
import { searchTopics } from "@/lib/cache/service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return Response.json({ topics: [] });
    }

    const topics = await searchTopics(query.trim());

    return Response.json({ topics });
  } catch (error) {
    console.error("Search topics error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to search topics",
      },
      { status: 500 }
    );
  }
}
