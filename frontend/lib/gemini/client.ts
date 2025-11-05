/**
 * Gemini AI client for generating explanations
 */

import { GEMINI_CONFIG } from "@/lib/constants";
import { ComplexityLevel } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

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
    throw new Error(`Model ${modelId} failed: ${response.status} - ${errorText}`);
  }

  if (!response.body) {
    throw new Error("No response body from Gemini API");
  }

  return response.body;
}

/**
 * Generate an explanation with streaming support and model fallback
 */
export async function* generateExplanationStream(
  options: GenerateOptions
): AsyncGenerator<string, void, unknown> {
  const { topic, level, temperature, maxTokens } = options;
  const prompt = createPrompt(topic, level);
  const temp = temperature ?? GEMINI_CONFIG.TEMPERATURES[level];
  const tokens = maxTokens ?? GEMINI_CONFIG.MAX_TOKENS;

  let lastError: Error | null = null;

  // Try each model in order
  for (const modelId of GEMINI_CONFIG.MODELS) {
    try {
      console.log(`🔄 Trying Gemini model: ${modelId}`);

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
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      console.log(`✅ Successfully used model: ${modelId}`);
      return;
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Model ${modelId} failed:`, error);
      // Continue to next model
      continue;
    }
  }

  // All models failed
  throw lastError || new Error("All Gemini models failed");
}

/**
 * Generate a complete explanation (non-streaming) with model fallback
 */
export async function generateExplanation(
  options: GenerateOptions
): Promise<string> {
  const { topic, level, temperature, maxTokens } = options;
  const prompt = createPrompt(topic, level);
  const temp = temperature ?? GEMINI_CONFIG.TEMPERATURES[level];
  const tokens = maxTokens ?? GEMINI_CONFIG.MAX_TOKENS;

  let lastError: Error | null = null;

  // Try each model in order
  for (const modelId of GEMINI_CONFIG.MODELS) {
    try {
      console.log(`🔄 Trying Gemini model: ${modelId}`);

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
        throw new Error(`Model ${modelId} failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      console.log(`✅ Successfully used model: ${modelId}`);
      return text;
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Model ${modelId} failed:`, error);
      // Continue to next model
      continue;
    }
  }

  // All models failed
  throw lastError || new Error("All Gemini models failed");
}

/**
 * Create a level-specific prompt for a topic
 */
function createPrompt(topic: string, level: ComplexityLevel): string {
  const prompts: Record<ComplexityLevel, string> = {
    beginner: `Explain "${topic}" as if talking to a 5-year-old. Use simple words, fun analogies, and short sentences. Make it exciting and easy to understand. Keep it under 200 words.`,

    intermediate: `Explain "${topic}" at a high school level. Introduce proper terminology but keep it accessible. Use 2-3 paragraphs. Keep it under 300 words.`,

    advanced: `Explain "${topic}" at an undergraduate college level. Include technical details, proper terminology, and some complexity. Assume prior knowledge of basic concepts. Keep it under 400 words.`,

    expert: `Explain "${topic}" at a graduate/PhD level. Include nuanced details, current research context, technical depth, and field-specific terminology. Keep it under 500 words.`,
  };

  return prompts[level];
}
