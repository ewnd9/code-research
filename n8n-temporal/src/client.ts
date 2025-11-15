import { Connection, Client } from "@temporalio/client";
import { contentGenerationWorkflow, contentPipelineWorkflow, listModelsWorkflow } from "./workflows/content-generation.workflow";
import { n8nBridgeWorkflow, hybridOrchestrationWorkflow, listN8nWorkflowsWorkflow } from "./workflows/n8n-temporal-bridge.workflow";

async function run() {
  // Connect to Temporal server
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
  });

  console.log("Connected to Temporal server");

  const client = new Client({
    connection,
    namespace: "default",
  });

  console.log("\n=== n8n to Temporal Interoperability Client ===\n");

  // Example 1: List available models
  console.log("Example 1: Listing available AI models");
  try {
    const modelsHandle = await client.workflow.start(listModelsWorkflow, {
      taskQueue: "n8n-temporal-interop",
      workflowId: `list-models-${Date.now()}`,
    });

    const modelsResult = await modelsHandle.result();
    console.log("\nAvailable fal.ai models:");
    modelsResult.falModels.forEach((model: any) => {
      console.log(`  - ${model.name} (${model.id}) [${model.category}]`);
    });
  } catch (error) {
    console.error("Error listing models:", error);
  }

  // Example 2: Generate text content
  console.log("\n\nExample 2: Generating text content");
  try {
    const textHandle = await client.workflow.start(contentGenerationWorkflow, {
      taskQueue: "n8n-temporal-interop",
      workflowId: `text-gen-${Date.now()}`,
      args: [
        {
          prompt: "Write a short poem about workflow automation",
          type: "text" as const,
          options: {
            model: "gpt-4o-mini",
          },
        },
      ],
    });

    const textResult = await textHandle.result();
    console.log("\nGenerated text:");
    console.log(textResult.content);
  } catch (error) {
    console.error("Error generating text:", error);
  }

  // Example 3: Generate image (if FAL_API_KEY is set)
  if (process.env.FAL_API_KEY) {
    console.log("\n\nExample 3: Generating image content");
    try {
      const imageHandle = await client.workflow.start(contentGenerationWorkflow, {
        taskQueue: "n8n-temporal-interop",
        workflowId: `image-gen-${Date.now()}`,
        args: [
          {
            prompt: "A futuristic workflow automation system with glowing nodes and connections",
            type: "image" as const,
            options: {
              model: "fal-ai/flux/schnell",
              numImages: 1,
            },
          },
        ],
      });

      const imageResult = await imageHandle.result();
      console.log("\nGenerated image URLs:");
      imageResult.content.forEach((img: any, i: number) => {
        console.log(`  ${i + 1}. ${img.url}`);
      });
    } catch (error) {
      console.error("Error generating image:", error);
    }
  } else {
    console.log("\n\nExample 3: Skipping image generation (FAL_API_KEY not set)");
  }

  // Example 4: Content pipeline (if both API keys are set)
  if (process.env.OPENAI_API_KEY && process.env.FAL_API_KEY) {
    console.log("\n\nExample 4: Running content generation pipeline");
    try {
      const pipelineHandle = await client.workflow.start(contentPipelineWorkflow, {
        taskQueue: "n8n-temporal-interop",
        workflowId: `pipeline-${Date.now()}`,
        args: [
          {
            initialPrompt: "A robot learning to paint",
          },
        ],
      });

      const pipelineResult = await pipelineHandle.result();
      console.log("\nPipeline results:");
      console.log("  Story:", pipelineResult.story);
      console.log("  Image URL:", pipelineResult.image.url);
      console.log("  Video URL:", pipelineResult.video.url);
    } catch (error) {
      console.error("Error running pipeline:", error);
    }
  } else {
    console.log("\n\nExample 4: Skipping pipeline (API keys not set)");
  }

  console.log("\n=== Examples completed ===\n");

  // Close connection
  await connection.close();
}

run().catch((err) => {
  console.error("Client error:", err);
  process.exit(1);
});
