/**
 * Multi-provider LLM client for generating explanations
 * Provider priority: Groq (primary) → Gemini 2.0 Flash → Gemini 2.5 Flash
 */

import { createExplanationPrompt } from "@/lib/ai/prompts";
import { GEMINI_CONFIG, GROQ_CONFIG } from "@/lib/constants";
import { ComplexityLevel } from "@/types";
import {
  generateGroqExplanationStream,
  generateGroqExplanation,
  isGroqAPIError,
} from "@/lib/groq/client";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const temporarilyDisabledModels = new Map<string, number>();
const RATE_LIMIT_BUFFER_MS = 500;
const DEFAULT_RETRY_AFTER_MS = 5000;

class GeminiAPIError extends Error {
  readonly status: number;
  readonly modelId: string;
  readonly retryAfterMs?: number;
  readonly rawBody: string;

  constructor(modelId: string, status: number, message: string, rawBody: string, retryAfterMs?: number) {
    super(`Model ${modelId} failed: ${status} - ${message}`);
    this.name = "GeminiAPIError";
    this.status = status;
    this.modelId = modelId;
    this.retryAfterMs = retryAfterMs;
    this.rawBody = rawBody;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

function isGeminiAPIError(error: unknown): error is GeminiAPIError {
  return error instanceof GeminiAPIError;
}

function parseRetryDelay(delay?: string | null): number | undefined {
  if (!delay) return undefined;

  // Retry delay can be formatted as "4s" or "4.6s" etc.
  const match = delay.match(/([\d.]+)s/);
  if (!match) return undefined;

  const seconds = parseFloat(match[1]);
  return Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : undefined;
}

function extractErrorDetails(rawBody: string): { message: string; retryAfterMs?: number } {
  try {
    const parsed = JSON.parse(rawBody);
    const message =
      parsed?.error?.message ||
      parsed?.message ||
      rawBody;

    const retryInfo = parsed?.error?.details?.find(
      (detail: Record<string, unknown>) =>
        detail?.["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
    );

    const retryDelay = parseRetryDelay(retryInfo?.retryDelay as string | undefined);

    return {
      message,
      retryAfterMs: retryDelay,
    };
  } catch {
    return {
      message: rawBody,
    };
  }
}

function isModelAvailable(modelId: string): boolean {
  const disabledUntil = temporarilyDisabledModels.get(modelId);
  if (disabledUntil === undefined) {
    return true;
  }

  if (disabledUntil <= Date.now()) {
    temporarilyDisabledModels.delete(modelId);
    return true;
  }

  return false;
}

function getGeminiModelsToTry(): { models: string[]; usingFallback: boolean } {
  const availableModels = GEMINI_CONFIG.MODELS.filter(isModelAvailable);
  if (availableModels.length > 0) {
    return { models: availableModels, usingFallback: false };
  }

  // All models temporarily disabled – fall back to trying everything
  return { models: [...GEMINI_CONFIG.MODELS], usingFallback: true };
}

function temporarilyDisableModel(modelId: string, retryAfterMs?: number) {
  const backoffMs = (retryAfterMs ?? DEFAULT_RETRY_AFTER_MS) + RATE_LIMIT_BUFFER_MS;
  temporarilyDisabledModels.set(modelId, Date.now() + backoffMs);
  console.warn(
    `⏳ Temporarily disabling model ${modelId} for ${backoffMs}ms due to rate limit`
  );
}

export interface GenerateOptions {
  topic: string;
  level: ComplexityLevel;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Call Gemini API with a specific model using fetch and streaming
 */
async function callGeminiStreamingAPI(
  modelId: string,
  prompt: string,
  temperature: number,
  maxTokens: number
): Promise<ReadableStream<Uint8Array>> {
  const url = `${GEMINI_CONFIG.API_BASE}/${modelId}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topK: 40,
        topP: 0.95,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const { message, retryAfterMs } = extractErrorDetails(errorText);
    throw new GeminiAPIError(modelId, response.status, message, errorText, retryAfterMs);
  }

  if (!response.body) {
    throw new Error("No response body from Gemini API");
  }

  return response.body;
}

/**
 * Generate an explanation with streaming support and multi-provider fallback
 * Priority: Groq (primary) → Gemini 2.0 Flash → Gemini 2.5 Flash
 */
export async function* generateExplanationStream(
  options: GenerateOptions
): AsyncGenerator<string, void, unknown> {
  const { topic, level, temperature, maxTokens } = options;
  const prompt = createExplanationPrompt(topic, level);
  const temp = temperature ?? GROQ_CONFIG.TEMPERATURE;
  const tokens = maxTokens ?? GROQ_CONFIG.MAX_TOKENS;

  let lastError: Error | null = null;

  // 1. Try Groq first (PRIMARY PROVIDER)
  try {
    console.log("🚀 Trying Groq (primary provider)");
    for await (const text of generateGroqExplanationStream({
      topic,
      level,
      temperature: temp,
      maxTokens: tokens,
    })) {
      yield text;
    }
    console.log("✅ Successfully used Groq (primary)");
    return;
  } catch (error) {
    lastError = error as Error;
    console.error("❌ Groq failed:", error);

    // If Groq is rate limited, add some delay info
    if (isGroqAPIError(error) && error.isRateLimited) {
      console.warn("⏳ Groq rate limited, falling back to Gemini");
    }
  }

  // 2. Try Gemini models as fallback
  const { models } = getGeminiModelsToTry();

  for (const modelId of models) {
    if (!isModelAvailable(modelId)) {
      console.warn(`⏭️ Skipping Gemini model ${modelId} (temporarily rate-limited)`);
      continue;
    }

    try {
      console.log(`🔄 Trying Gemini fallback model: ${modelId}`);

      const stream = await callGeminiStreamingAPI(modelId, prompt, temp, tokens);
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                yield text;
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      console.log(`✅ Successfully used Gemini fallback model: ${modelId}`);
      return;
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Gemini model ${modelId} failed:`, error);
      if (isGeminiAPIError(error) && error.isRateLimited) {
        temporarilyDisableModel(modelId, error.retryAfterMs);
      }
      // Continue to next model
      continue;
    }
  }

  // All providers failed
  throw lastError || new Error("All LLM providers failed");
}

/**
 * Generate a complete explanation by collecting streamed chunks
 * This provides the benefits of streaming (faster TTFB) with complete output
 * Priority: Groq (primary) → Gemini 2.0 Flash → Gemini 2.5 Flash
 */
export async function generateExplanationComplete(
  options: GenerateOptions
): Promise<string> {
  let fullText = "";

  for await (const chunk of generateExplanationStream(options)) {
    fullText += chunk;
  }

  return fullText;
}

/**
 * Generate a complete explanation (non-streaming) with multi-provider fallback
 * Priority: Groq (primary) → Gemini 2.0 Flash → Gemini 2.5 Flash
 */
export async function generateExplanation(
  options: GenerateOptions
): Promise<string> {
  const { topic, level, temperature, maxTokens } = options;
  const prompt = createExplanationPrompt(topic, level);
  const temp = temperature ?? GROQ_CONFIG.TEMPERATURE;
  const tokens = maxTokens ?? GROQ_CONFIG.MAX_TOKENS;

  let lastError: Error | null = null;

  // 1. Try Groq first (PRIMARY PROVIDER)
  try {
    console.log("🚀 Trying Groq (primary provider)");
    const result = await generateGroqExplanation({
      topic,
      level,
      temperature: temp,
      maxTokens: tokens,
    });
    console.log("✅ Successfully used Groq (primary)");
    return result;
  } catch (error) {
    lastError = error as Error;
    console.error("❌ Groq failed:", error);

    // If Groq is rate limited, add some delay info
    if (isGroqAPIError(error) && error.isRateLimited) {
      console.warn("⏳ Groq rate limited, falling back to Gemini");
    }
  }

  // 2. Try Gemini models as fallback
  const { models } = getGeminiModelsToTry();

  for (const modelId of models) {
    if (!isModelAvailable(modelId)) {
      console.warn(`⏭️ Skipping Gemini model ${modelId} (temporarily rate-limited)`);
      continue;
    }

    try {
      console.log(`🔄 Trying Gemini fallback model: ${modelId}`);

      const url = `${GEMINI_CONFIG.API_BASE}/${modelId}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: temp,
            maxOutputTokens: tokens,
            topK: 40,
            topP: 0.95,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const { message, retryAfterMs } = extractErrorDetails(errorText);
        throw new GeminiAPIError(modelId, response.status, message, errorText, retryAfterMs);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      console.log(`✅ Successfully used Gemini fallback model: ${modelId}`);
      return text;
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Gemini model ${modelId} failed:`, error);
      if (isGeminiAPIError(error) && error.isRateLimited) {
        temporarilyDisableModel(modelId, error.retryAfterMs);
      }
      // Continue to next model
      continue;
    }
  }

  // All providers failed
  throw lastError || new Error("All LLM providers failed");
}
