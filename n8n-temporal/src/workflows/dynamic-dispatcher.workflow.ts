import {
  proxyActivities,
  startChild,
  ChildWorkflowHandle,
} from "@temporalio/workflow";
import type * as aiActivities from "../activities/ai.activities";

// Proxy activities
const { generateText, generateImage, generateVideo } =
  proxyActivities<typeof aiActivities>({
    startToCloseTimeout: "5 minutes",
  });

/**
 * Dynamic Content Generation Workflow
 * Dispatches child workflows based on content type parameter
 */
export async function dynamicContentGenerationWorkflow(input: {
  contentType: string;
  prompt: string;
  options?: any;
}): Promise<any> {
  console.log(
    `Dynamic dispatcher: ${input.contentType} generation for prompt: ${input.prompt.substring(0, 50)}`
  );

  // Dynamically dispatch to appropriate child workflow based on contentType
  let childWorkflow: ChildWorkflowHandle<any>;

  switch (input.contentType) {
    case "text":
      childWorkflow = await startChild("textGenerationWorkflow", {
        args: [{ prompt: input.prompt, options: input.options }],
        workflowId: `text-gen-child-${Date.now()}`,
      });
      break;

    case "image":
      childWorkflow = await startChild("imageGenerationWorkflow", {
        args: [{ prompt: input.prompt, options: input.options }],
        workflowId: `image-gen-child-${Date.now()}`,
      });
      break;

    case "video":
      childWorkflow = await startChild("videoGenerationWorkflow", {
        args: [{ prompt: input.prompt, options: input.options }],
        workflowId: `video-gen-child-${Date.now()}`,
      });
      break;

    default:
      throw new Error(`Unknown content type: ${input.contentType}`);
  }

  const result = await childWorkflow.result();

  return {
    contentType: input.contentType,
    prompt: input.prompt,
    childWorkflowId: childWorkflow.workflowId,
    ...result,
  };
}

/**
 * Child Workflow: Text Generation
 */
export async function textGenerationWorkflow(input: {
  prompt: string;
  options?: any;
}): Promise<{ type: string; content: string; model: string; usage: any }> {
  console.log("Text generation child workflow started");

  const result = await generateText({
    prompt: input.prompt,
    model: input.options?.model || "gpt-4o-mini",
    temperature: input.options?.temperature || 0.7,
    systemPrompt: input.options?.systemPrompt,
  });

  return {
    type: "text",
    content: result.text,
    model: result.model,
    usage: result.usage,
  };
}

/**
 * Child Workflow: Image Generation
 */
export async function imageGenerationWorkflow(input: {
  prompt: string;
  options?: any;
}): Promise<{ type: string; content: any }> {
  console.log("Image generation child workflow started");

  const result = await generateImage({
    prompt: input.prompt,
    model: input.options?.model || "fal-ai/flux/schnell",
    numImages: input.options?.numImages || 1,
    imageSize: input.options?.imageSize,
  });

  return {
    type: "image",
    content: result.images,
  };
}

/**
 * Child Workflow: Video Generation
 */
export async function videoGenerationWorkflow(input: {
  prompt: string;
  options?: any;
}): Promise<{ type: string; content: any }> {
  console.log("Video generation child workflow started");

  const result = await generateVideo({
    prompt: input.prompt,
    model:
      input.options?.model ||
      "fal-ai/kling-video/v1.5/standard/text-to-video",
    duration: input.options?.duration || 5,
    aspectRatio: input.options?.aspectRatio || "16:9",
  });

  return {
    type: "video",
    content: result.video,
  };
}

/**
 * Dynamic Content Pipeline Workflow
 * Orchestrates multiple child workflows in sequence
 */
export async function dynamicContentPipelineWorkflow(input: {
  initialPrompt: string;
  options?: any;
}): Promise<{ story: string; image: any; video: any }> {
  console.log("Dynamic content pipeline started");

  // Step 1: Generate story (spawn child workflow)
  const storyWorkflow = await startChild("textGenerationWorkflow", {
    args: [
      {
        prompt: input.initialPrompt,
        options: {
          model: input.options?.storyModel || "gpt-4o-mini",
          systemPrompt:
            "You are a creative storyteller. Create a short, vivid story (3-4 sentences) based on the user's prompt.",
        },
      },
    ],
    workflowId: `story-gen-child-${Date.now()}`,
  });

  const storyResult = await storyWorkflow.result();
  console.log("Story generated:", storyResult.content.substring(0, 50));

  // Step 2: Generate image (spawn child workflow)
  const imagePrompt = `A cinematic still from: ${storyResult.content}`;
  const imageWorkflow = await startChild("imageGenerationWorkflow", {
    args: [
      {
        prompt: imagePrompt,
        options: {
          model: input.options?.imageModel || "fal-ai/flux/schnell",
          numImages: 1,
        },
      },
    ],
    workflowId: `image-gen-child-${Date.now()}`,
  });

  const imageResult = await imageWorkflow.result();
  console.log("Image generated");

  // Step 3: Generate video (spawn child workflow)
  const videoPrompt = `A short video scene: ${storyResult.content}`;
  const videoWorkflow = await startChild("videoGenerationWorkflow", {
    args: [
      {
        prompt: videoPrompt,
        options: {
          model:
            input.options?.videoModel ||
            "fal-ai/kling-video/v1.5/standard/text-to-video",
          duration: input.options?.videoDuration || 5,
        },
      },
    ],
    workflowId: `video-gen-child-${Date.now()}`,
  });

  const videoResult = await videoWorkflow.result();
  console.log("Video generated");

  return {
    story: storyResult.content,
    image: imageResult.content[0],
    video: videoResult.content,
  };
}
