/**
 * Supabase Database Types
 * Based on the schema defined in the PRD
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ComplexityLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface Database {
  public: {
    Tables: {
      topics: {
        Row: {
          id: string;
          slug: string;
          title: string;
          view_count: number;
          last_generated: string;
          is_trending: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          view_count?: number;
          last_generated?: string;
          is_trending?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          view_count?: number;
          last_generated?: string;
          is_trending?: boolean;
          created_at?: string;
        };
      };
      explanations: {
        Row: {
          id: string;
          topic_slug: string;
          topic_title: string;
          complexity_level: ComplexityLevel;
          content: string;
          word_count: number;
          created_at: string;
          last_accessed: string;
          access_count: number;
        };
        Insert: {
          id?: string;
          topic_slug: string;
          topic_title: string;
          complexity_level: ComplexityLevel;
          content: string;
          word_count: number;
          created_at?: string;
          last_accessed?: string;
          access_count?: number;
        };
        Update: {
          id?: string;
          topic_slug?: string;
          topic_title?: string;
          complexity_level?: ComplexityLevel;
          content?: string;
          word_count?: number;
          created_at?: string;
          last_accessed?: string;
          access_count?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      complexity_level: ComplexityLevel;
    };
  };
}
