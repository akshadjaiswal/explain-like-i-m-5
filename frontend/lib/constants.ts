/**
 * Application constants and configuration
 */

export const COMPLEXITY_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  EXPERT: "expert",
} as const;

export type ComplexityLevel =
  (typeof COMPLEXITY_LEVELS)[keyof typeof COMPLEXITY_LEVELS];

export const LEVEL_COLORS = {
  [COMPLEXITY_LEVELS.BEGINNER]: "rgb(var(--level-beginner))",
  [COMPLEXITY_LEVELS.INTERMEDIATE]: "rgb(var(--level-intermediate))",
  [COMPLEXITY_LEVELS.ADVANCED]: "rgb(var(--level-advanced))",
  [COMPLEXITY_LEVELS.EXPERT]: "rgb(var(--level-expert))",
} as const;

export const LEVEL_LABELS = {
  [COMPLEXITY_LEVELS.BEGINNER]: "Beginner",
  [COMPLEXITY_LEVELS.INTERMEDIATE]: "Intermediate",
  [COMPLEXITY_LEVELS.ADVANCED]: "Advanced",
  [COMPLEXITY_LEVELS.EXPERT]: "Expert",
} as const;

export const LEVEL_DESCRIPTIONS = {
  [COMPLEXITY_LEVELS.BEGINNER]: "Like explaining to a 5-year-old",
  [COMPLEXITY_LEVELS.INTERMEDIATE]: "High school level understanding",
  [COMPLEXITY_LEVELS.ADVANCED]: "College/undergraduate depth",
  [COMPLEXITY_LEVELS.EXPERT]: "Graduate/PhD level detail",
} as const;

// Gemini API configuration
export const GEMINI_CONFIG = {
  MODELS: [
    "gemini-2.0-flash-exp",      // Fastest, experimental (try first)
    "gemini-2.5-flash",          // Higher quota, production-ready fallback
  ],
  TEMPERATURES: {
    [COMPLEXITY_LEVELS.BEGINNER]: 0.8,
    [COMPLEXITY_LEVELS.INTERMEDIATE]: 0.6,
    [COMPLEXITY_LEVELS.ADVANCED]: 0.4,
    [COMPLEXITY_LEVELS.EXPERT]: 0.3,
  },
  MAX_TOKENS: 800,
  API_BASE: "https://generativelanguage.googleapis.com/v1beta/models",
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  TTL_DAYS: 30,
  REFRESH_AFTER_DAYS: 7,
} as const;

// App configuration
export const APP_CONFIG = {
  NAME: "ExplainLevels",
  DESCRIPTION: "Understand any topic at your level",
  URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;

// UI configuration
export const UI_CONFIG = {
  TRENDING_TOPICS_LIMIT: 12,
  RECENT_TOPICS_LIMIT: 5,
  SEARCH_DEBOUNCE_MS: 300,
} as const;
