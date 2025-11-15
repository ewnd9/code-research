import { FalService, type FalImageGenerationInput, type FalVideoGenerationInput } from "../services/fal.service";
import { OpenAIService, type OpenAICompletionInput } from "../services/openai.service";

/**
 * Activity: Generate text using OpenAI
 */
export async function generateText(input: OpenAICompletionInput): Promise<{
  text: string;
  model: string;
  usage: any;
}> {
  console.log("Generating text with OpenAI:", input.prompt.substring(0, 50));

  const openaiService = new OpenAIService(process.env.OPENAI_API_KEY);
  const result = await openaiService.generateCompletion(input);

  console.log("Text generated successfully");
  return result;
}

/**
 * Activity: Generate image using fal.ai
 */
export async function generateImage(input: FalImageGenerationInput): Promise<{
  images: Array<{ url: string; content_type: string }>;
  prompt: string;
}> {
  console.log("Generating image with fal.ai:", input.prompt.substring(0, 50));

  const falService = new FalService(process.env.FAL_API_KEY);
  const result = await falService.generateImage(input);

  console.log("Image generated successfully:", result.images.length, "images");
  return result;
}

/**
 * Activity: Generate video using fal.ai
 */
export async function generateVideo(input: FalVideoGenerationInput): Promise<{
  video: { url: string };
  prompt: string;
}> {
  console.log("Generating video with fal.ai:", input.prompt.substring(0, 50));

  const falService = new FalService(process.env.FAL_API_KEY);
  const result = await falService.generateVideo(input);

  console.log("Video generated successfully:", result.video.url);
  return result;
}

/**
 * Activity: Get available fal.ai models
 */
export async function getFalModels(): Promise<Array<{
  id: string;
  name: string;
  category?: string;
  description?: string;
}>> {
  console.log("Fetching fal.ai models");

  const falService = new FalService(process.env.FAL_API_KEY);
  const models = await falService.getAvailableModels();

  console.log("Fetched", models.length, "fal.ai models");
  return models;
}

/**
 * Activity: Get available OpenAI models
 */
export async function getOpenAIModels(): Promise<string[]> {
  console.log("Fetching OpenAI models");

  const openaiService = new OpenAIService(process.env.OPENAI_API_KEY);
  const models = await openaiService.getAvailableModels();

  console.log("Fetched", models.length, "OpenAI models");
  return models;
}
