import { ComplexityLevel } from "@/types";

const PROMPTS: Record<ComplexityLevel, string> = {
  beginner: `Explain "{{topic}}" as if talking to a 5-year-old. Use simple words, fun analogies, and short sentences. Make it exciting and easy to understand. Keep it under 200 words.`,
  intermediate: `Explain "{{topic}}" at a high school level. Introduce proper terminology but keep it accessible. Use 2-3 paragraphs. Keep it under 300 words.`,
  advanced: `Explain "{{topic}}" at an undergraduate college level. Include technical details, proper terminology, and some complexity. Assume prior knowledge of basic concepts. Keep it under 400 words.`,
  expert: `Explain "{{topic}}" at a graduate/PhD level. Include nuanced details, current research context, technical depth, and field-specific terminology. Keep it under 500 words.`,
};

export function createExplanationPrompt(topic: string, level: ComplexityLevel): string {
  return PROMPTS[level].replace("{{topic}}", topic);
}

export const PROMPT_TEMPLATES = PROMPTS;
