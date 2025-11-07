/**
 * Groq API client used as a fallback LLM provider
 */

import Groq from "groq-sdk";
import { createExplanationPrompt } from "@/lib/ai/prompts";
import { GROQ_CONFIG } from "@/lib/constants";
import { ComplexityLevel } from "@/types";

export interface GroqGenerateOptions {
  topic: string;
  level: ComplexityLevel;
  temperature?: number;
  maxTokens?: number;
}

let cachedClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  return cachedClient;
}

export async function generateGroqExplanation(
  options: GroqGenerateOptions
): Promise<string> {
  const { topic, level, temperature, maxTokens } = options;
  const prompt = createExplanationPrompt(topic, level);

  const groq = getGroqClient();

  const response = await groq.chat.completions.create({
    model: GROQ_CONFIG.MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are an expert educator that adapts explanations to the requested complexity level. Respond with structured markdown and no additional commentary.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: temperature ?? GROQ_CONFIG.TEMPERATURE,
    max_tokens: maxTokens ?? GROQ_CONFIG.MAX_TOKENS,
  });

  const text = response.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error("Empty response from Groq API");
  }

  return text;
}
