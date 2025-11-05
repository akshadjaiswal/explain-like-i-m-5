/**
 * Smart caching service for explanations
 */

import { createServiceClient } from "@/lib/supabase/server";
import { ComplexityLevel, Explanation } from "@/types";
import { Database } from "@/types/database";
import { CACHE_CONFIG } from "@/lib/constants";

type ExplanationRow = Database["public"]["Tables"]["explanations"]["Row"];
type ExplanationUpdate = Database["public"]["Tables"]["explanations"]["Update"];
type ExplanationInsert = Database["public"]["Tables"]["explanations"]["Insert"];
type TopicRow = Database["public"]["Tables"]["topics"]["Row"];
type TopicUpdate = Database["public"]["Tables"]["topics"]["Update"];
type TopicInsert = Database["public"]["Tables"]["topics"]["Insert"];

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

  // Type assertion after validation
  const explanations = data as ExplanationRow[];

  // Update last_accessed and access_count
  const ids = explanations.map((e) => e.id);
  const updateData: ExplanationUpdate = {
    last_accessed: new Date().toISOString(),
    access_count: explanations[0].access_count + 1,
  };

  await supabase
    .from("explanations")
    .update<ExplanationUpdate>(updateData)
    .in("id", ids);

  return explanations.map(mapDbToExplanation);
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

  const insertData: ExplanationInsert = {
    topic_slug: topicSlug,
    topic_title: topicTitle,
    complexity_level: level,
    content,
    word_count: wordCount,
  };

  const { data, error } = await supabase
    .from("explanations")
    .insert<ExplanationInsert>(insertData)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to save explanation: ${error?.message || "No data returned"}`);
  }

  return mapDbToExplanation(data as ExplanationRow);
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
    // Type assertion after validation
    const topic = existing as TopicRow;

    const updateData: TopicUpdate = {
      view_count: topic.view_count + 1,
      last_generated: new Date().toISOString(),
    };

    // Update view count and last_generated
    await supabase
      .from("topics")
      .update<TopicUpdate>(updateData)
      .eq("id", topic.id);
  } else {
    // Create new topic
    const insertData: TopicInsert = {
      slug,
      title,
      view_count: 1,
      last_generated: new Date().toISOString(),
      is_trending: false,
    };

    await supabase.from("topics").insert<TopicInsert>(insertData);
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

  if (error || !data) {
    throw new Error(`Failed to get trending topics: ${error?.message || "No data returned"}`);
  }

  return (data as TopicRow[]).map(mapDbToTopic);
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

  if (error || !data) {
    throw new Error(`Failed to search topics: ${error?.message || "No data returned"}`);
  }

  return (data as TopicRow[]).map(mapDbToTopic);
}

// Helper functions to map database types to application types
function mapDbToExplanation(data: ExplanationRow): Explanation {
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

function mapDbToTopic(data: TopicRow) {
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
