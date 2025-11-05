/**
 * Application-wide type definitions
 */

import { ComplexityLevel } from "./database";

export type { ComplexityLevel };

export interface Topic {
  id: string;
  slug: string;
  title: string;
  viewCount: number;
  lastGenerated: Date;
  isTrending: boolean;
  createdAt: Date;
}

export interface Explanation {
  id: string;
  topicSlug: string;
  topicTitle: string;
  complexityLevel: ComplexityLevel;
  content: string;
  wordCount: number;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
}

export interface ExplanationSet {
  topic: Topic;
  explanations: {
    beginner?: Explanation;
    intermediate?: Explanation;
    advanced?: Explanation;
    expert?: Explanation;
  };
}

export interface GenerateExplanationRequest {
  topic: string;
  levels?: ComplexityLevel[];
}

export interface GenerateExplanationResponse {
  topicSlug: string;
  topicTitle: string;
  explanations: Explanation[];
  cached: boolean;
}

export interface StreamChunk {
  level: ComplexityLevel;
  chunk: string;
  done: boolean;
}

export type ViewMode = "tabs" | "split" | "stack";

export interface UIPreferences {
  viewMode: ViewMode;
  theme: "light" | "dark" | "system";
}
