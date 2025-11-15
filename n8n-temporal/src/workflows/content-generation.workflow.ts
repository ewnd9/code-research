import { proxyActivities } from "@temporalio/workflow";
import type * as aiActivities from "../activities/ai.activities";

// Proxy activities
const {
  generateText,
  generateImage,
  generateVideo,
  getFalModels,
} = proxyActivities<typeof aiActivities>({
  startToCloseTimeout: "5 minutes",
});

/**
 * Workflow: Generate content (text, image, or video) based on a prompt
 */
export async function contentGenerationWorkflow(input: {
  prompt: string;
  type: "text" | "image" | "video";
  options?: any;
}): Promise<any> {
  console.log(`Starting ${input.type} generation workflow`);

  if (input.type === "text") {
    const result = await generateText({
      prompt: input.prompt,
      ...input.options,
    });
    return {
      type: "text",
      content: result.text,
      model: result.model,
      usage: result.usage,
    };
  }

  if (input.type === "image") {
    const result = await generateImage({
      prompt: input.prompt,
      ...input.options,
    });
    return {
      type: "image",
      content: result.images,
      prompt: result.prompt,
    };
  }

  if (input.type === "video") {
    const result = await generateVideo({
      prompt: input.prompt,
      ...input.options,
    });
    return {
      type: "video",
      content: result.video,
      prompt: result.prompt,
    };
  }

  throw new Error(`Unknown content type: ${input.type}`);
}

/**
 * Workflow: Multi-step content generation pipeline
 * 1. Generate a story with OpenAI
 * 2. Generate an image based on the story
 * 3. Generate a video based on the story
 */
export async function contentPipelineWorkflow(input: {
  initialPrompt: string;
}): Promise<{
  story: string;
  image: any;
  video: any;
}> {
  console.log("Starting content pipeline workflow");

  // Step 1: Generate story
  const storyResult = await generateText({
    prompt: input.initialPrompt,
    systemPrompt:
      "You are a creative storyteller. Create a short, vivid story (3-4 sentences) based on the user's prompt.",
  });

  console.log("Story generated:", storyResult.text.substring(0, 50));

  // Step 2: Generate image from story
  const imagePrompt = `A cinematic still from: ${storyResult.text}`;
  const imageResult = await generateImage({
    prompt: imagePrompt,
    model: "fal-ai/flux/schnell",
    numImages: 1,
  });

  console.log("Image generated:", imageResult.images.length, "images");

  // Step 3: Generate video from story
  const videoPrompt = `A short video scene: ${storyResult.text}`;
  const videoResult = await generateVideo({
    prompt: videoPrompt,
    model: "fal-ai/kling-video/v1.5/standard/text-to-video",
    duration: 5,
  });

  console.log("Video generated:", videoResult.video.url);

  return {
    story: storyResult.text,
    image: imageResult.images[0],
    video: videoResult.video,
  };
}

/**
 * Workflow: Get all available AI models
 */
export async function listModelsWorkflow(): Promise<{
  falModels: any[];
}> {
  console.log("Fetching available AI models");

  const falModels = await getFalModels();

  return {
    falModels,
  };
}
