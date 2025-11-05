/**
 * Utility functions for slug generation and manipulation
 */

import slugifyLib from "slugify";

/**
 * Convert a topic string to a URL-friendly slug
 */
export function createSlug(topic: string): string {
  return slugifyLib(topic, {
    lower: true,
    strict: true,
    trim: true,
  });
}

/**
 * Convert a slug back to a readable title
 */
export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
