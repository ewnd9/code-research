import * as fal from "@fal-ai/serverless-client";
import { z } from "zod";

// Zod schemas for type safety
export const FalModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export const FalImageGenerationInputSchema = z.object({
  prompt: z.string(),
  model: z.string().default("fal-ai/flux/dev"),
  imageSize: z
    .object({
      width: z.number().default(1024),
      height: z.number().default(1024),
    })
    .optional(),
  numImages: z.number().min(1).max(4).default(1),
});

export const FalVideoGenerationInputSchema = z.object({
  prompt: z.string(),
  model: z.string().default("fal-ai/kling-video/v1.5/standard/text-to-video"),
  duration: z.number().min(5).max(10).default(5),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
});

export type FalModel = z.infer<typeof FalModelSchema>;
export type FalImageGenerationInput = z.infer<
  typeof FalImageGenerationInputSchema
>;
export type FalVideoGenerationInput = z.infer<
  typeof FalVideoGenerationInputSchema
>;

/**
 * Service for interacting with fal.ai API
 */
export class FalService {
  constructor(apiKey?: string) {
    if (apiKey) {
      fal.config({
        credentials: apiKey,
      });
    }
  }

  /**
   * Get list of available models from fal.ai
   * Note: fal.ai doesn't have a direct models list API endpoint,
   * so we're documenting known popular models from their documentation
   */
  async getAvailableModels(): Promise<FalModel[]> {
    // Based on fal.ai documentation and explore page
    const knownModels: FalModel[] = [
      // Image Generation Models
      {
        id: "fal-ai/flux/dev",
        name: "FLUX.1 [dev]",
        category: "image",
        description: "Fast image generation with FLUX.1 dev model",
      },
      {
        id: "fal-ai/flux/schnell",
        name: "FLUX.1 [schnell]",
        category: "image",
        description: "Ultra-fast image generation with FLUX.1 schnell",
      },
      {
        id: "fal-ai/flux-pro",
        name: "FLUX.1 Pro",
        category: "image",
        description: "Professional quality image generation",
      },
      {
        id: "fal-ai/recraft-v3",
        name: "Recraft V3",
        category: "image",
        description: "Vector typography and design generation",
      },
      {
        id: "fal-ai/stable-diffusion-v3-medium",
        name: "Stable Diffusion 3 Medium",
        category: "image",
        description: "High-quality image generation with SD3",
      },
      {
        id: "fal-ai/stable-diffusion-v35-large",
        name: "Stable Diffusion 3.5 Large",
        category: "image",
        description: "Latest Stable Diffusion model",
      },
      // Video Generation Models
      {
        id: "fal-ai/kling-video/v1.5/standard/text-to-video",
        name: "Kling v1.5 Text-to-Video",
        category: "video",
        description: "Text to video generation with Kling",
      },
      {
        id: "fal-ai/kling-video/v1.5/pro/text-to-video",
        name: "Kling v1.5 Pro Text-to-Video",
        category: "video",
        description: "Professional text to video generation",
      },
      {
        id: "fal-ai/wan-i2v",
        name: "WAN Image-to-Video",
        category: "video",
        description: "Convert images to videos",
      },
      {
        id: "fal-ai/stable-video",
        name: "Stable Video Diffusion",
        category: "video",
        description: "Image to video with Stable Diffusion",
      },
      {
        id: "fal-ai/hunyuan-video",
        name: "Hunyuan Video",
        category: "video",
        description: "High-quality video generation",
      },
      {
        id: "fal-ai/minimax-video",
        name: "MiniMax Video",
        category: "video",
        description: "Text to video with MiniMax",
      },
    ];

    return knownModels;
  }

  /**
   * Get models by category
   */
  async getModelsByCategory(category: "image" | "video"): Promise<FalModel[]> {
    const models = await this.getAvailableModels();
    return models.filter((model) => model.category === category);
  }

  /**
   * Generate image using fal.ai
   */
  async generateImage(input: FalImageGenerationInput): Promise<{
    images: Array<{ url: string; content_type: string }>;
    prompt: string;
  }> {
    const validatedInput = FalImageGenerationInputSchema.parse(input);

    const result = await fal.subscribe(validatedInput.model, {
      input: {
        prompt: validatedInput.prompt,
        image_size: validatedInput.imageSize,
        num_images: validatedInput.numImages,
      },
      logs: true,
    });

    return result.data as any;
  }

  /**
   * Generate video using fal.ai
   */
  async generateVideo(input: FalVideoGenerationInput): Promise<{
    video: { url: string };
    prompt: string;
  }> {
    const validatedInput = FalVideoGenerationInputSchema.parse(input);

    const result = await fal.subscribe(validatedInput.model, {
      input: {
        prompt: validatedInput.prompt,
        duration: validatedInput.duration,
        aspect_ratio: validatedInput.aspectRatio,
      },
      logs: true,
    });

    return result.data as any;
  }
}
