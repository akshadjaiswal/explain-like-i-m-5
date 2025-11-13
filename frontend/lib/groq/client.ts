/**
 * Groq API client - Primary LLM provider with streaming support
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

class GroqAPIError extends Error {
  readonly status?: number;
  readonly retryAfterMs?: number;

  constructor(message: string, status?: number, retryAfterMs?: number) {
    super(message);
    this.name = "GroqAPIError";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }
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

/**
 * Generate explanation with streaming support (primary method)
 */
export async function* generateGroqExplanationStream(
  options: GroqGenerateOptions
): AsyncGenerator<string, void, unknown> {
  const { topic, level, temperature, maxTokens } = options;
  const prompt = createExplanationPrompt(topic, level);

  const groq = getGroqClient();

  try {
    const stream = await groq.chat.completions.create({
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
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error: any) {
    console.error("❌ Groq streaming error:", error);

    // Extract status and retry information
    const status = error?.status || error?.response?.status;
    const retryAfterMs = error?.headers?.["retry-after"]
      ? parseInt(error.headers["retry-after"]) * 1000
      : undefined;

    throw new GroqAPIError(
      error?.message || "Groq API streaming failed",
      status,
      retryAfterMs
    );
  }
}

/**
 * Generate explanation without streaming (for non-streaming contexts)
 */
export async function generateGroqExplanation(
  options: GroqGenerateOptions
): Promise<string> {
  const { topic, level, temperature, maxTokens } = options;
  const prompt = createExplanationPrompt(topic, level);

  const groq = getGroqClient();

  try {
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
      stream: false,
    });

    const text = response.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new GroqAPIError("Empty response from Groq API");
    }

    return text;
  } catch (error: any) {
    console.error("❌ Groq error:", error);

    // Extract status and retry information
    const status = error?.status || error?.response?.status;
    const retryAfterMs = error?.headers?.["retry-after"]
      ? parseInt(error.headers["retry-after"]) * 1000
      : undefined;

    throw new GroqAPIError(
      error?.message || "Groq API failed",
      status,
      retryAfterMs
    );
  }
}

export function isGroqAPIError(error: unknown): error is GroqAPIError {
  return error instanceof GroqAPIError;
}
