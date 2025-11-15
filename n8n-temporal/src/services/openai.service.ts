import OpenAI from "openai";
import { z } from "zod";

export const OpenAICompletionInputSchema = z.object({
  prompt: z.string(),
  model: z.string().default("gpt-4o-mini"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().optional(),
  systemPrompt: z.string().optional(),
});

export type OpenAICompletionInput = z.infer<typeof OpenAICompletionInputSchema>;

/**
 * Service for interacting with OpenAI API
 */
export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate text completion using OpenAI
   */
  async generateCompletion(
    input: OpenAICompletionInput
  ): Promise<{ text: string; model: string; usage: any }> {
    const validatedInput = OpenAICompletionInputSchema.parse(input);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (validatedInput.systemPrompt) {
      messages.push({
        role: "system",
        content: validatedInput.systemPrompt,
      });
    }

    messages.push({
      role: "user",
      content: validatedInput.prompt,
    });

    const response = await this.client.chat.completions.create({
      model: validatedInput.model,
      messages,
      temperature: validatedInput.temperature,
      max_tokens: validatedInput.maxTokens,
    });

    return {
      text: response.choices[0].message.content || "",
      model: response.model,
      usage: response.usage,
    };
  }

  /**
   * Get available OpenAI models
   */
  async getAvailableModels(): Promise<string[]> {
    const models = await this.client.models.list();
    return models.data
      .filter((model) => model.id.startsWith("gpt-"))
      .map((model) => model.id)
      .sort();
  }
}
