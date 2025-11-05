/**
 * Smart caching service for explanations
 */

import { createServiceClient } from "@/lib/supabase/server";
import { ComplexityLevel, Explanation } from "@/types";
import { CACHE_CONFIG } from "@/lib/constants";

/**
 * Check if cached explanations exist for a topic
 */
export async function getCachedExplanations(
  topicSlug: string
): Promise<Explanation[] | null> {
  const supabase = createServiceClient();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CACHE_CONFIG.TTL_DAYS);

  const { data, error } = await supabase
    .from("explanations")
    .select("*")
    .eq("topic_slug", topicSlug)
    .gte("created_at", cutoffDate.toISOString());

  if (error || !data || data.length === 0) {
    return null;
  }

  // Update last_accessed and access_count
  const ids = data.map((e) => e.id);
  await supabase
    .from("explanations")
    .update({
      last_accessed: new Date().toISOString(),
      access_count: data[0].access_count + 1,
    })
    .in("id", ids);

  return data.map(mapDbToExplanation);
}

/**
 * Save a new explanation to the cache
 */
export async function saveExplanation(
  topicSlug: string,
  topicTitle: string,
  level: ComplexityLevel,
  content: string
): Promise<Explanation> {
  const supabase = createServiceClient();

  const wordCount = content.split(/\s+/).length;

  const { data, error } = await supabase
    .from("explanations")
    .insert({
      topic_slug: topicSlug,
      topic_title: topicTitle,
      complexity_level: level,
      content,
      word_count: wordCount,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save explanation: ${error.message}`);
  }

  return mapDbToExplanation(data);
}

/**
 * Get or create a topic
 */
export async function getOrCreateTopic(
  slug: string,
  title: string
): Promise<void> {
  const supabase = createServiceClient();

  // Try to get existing topic
  const { data: existing } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .single();

  if (existing) {
    // Update view count and last_generated
    await supabase
      .from("topics")
      .update({
        view_count: existing.view_count + 1,
        last_generated: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    // Create new topic
    await supabase.from("topics").insert({
      slug,
      title,
      view_count: 1,
      last_generated: new Date().toISOString(),
      is_trending: false,
    });
  }
}

/**
 * Get trending topics
 */
export async function getTrendingTopics(limit: number = 12) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get trending topics: ${error.message}`);
  }

  return data.map(mapDbToTopic);
}

/**
 * Search topics by title or slug
 */
export async function searchTopics(query: string, limit: number = 5) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .or(`title.ilike.%${query}%,slug.ilike.%${query}%`)
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to search topics: ${error.message}`);
  }

  return data.map(mapDbToTopic);
}

// Helper functions to map database types to application types
function mapDbToExplanation(data: any): Explanation {
  return {
    id: data.id,
    topicSlug: data.topic_slug,
    topicTitle: data.topic_title,
    complexityLevel: data.complexity_level,
    content: data.content,
    wordCount: data.word_count,
    createdAt: new Date(data.created_at),
    lastAccessed: new Date(data.last_accessed),
    accessCount: data.access_count,
  };
}

function mapDbToTopic(data: any) {
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    viewCount: data.view_count,
    lastGenerated: new Date(data.last_generated),
    isTrending: data.is_trending,
    createdAt: new Date(data.created_at),
  };
}
