import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { Connection, Client } from "@temporalio/client";
import { Worker, NativeConnection } from "@temporalio/worker";
import * as aiActivities from "../src/activities/ai.activities";
import * as n8nActivities from "../src/activities/n8n.activities";

describe("Temporal Workflows Integration", () => {
  let connection: Connection;
  let client: Client;
  let worker: Worker;
  let workerConnection: NativeConnection;

  beforeAll(async () => {
    // Connect to Temporal
    connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
    });

    client = new Client({
      connection,
      namespace: "default",
    });

    // Start a worker for tests
    workerConnection = await NativeConnection.connect({
      address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
    });

    worker = await Worker.create({
      connection: workerConnection,
      namespace: "default",
      taskQueue: "test-queue",
      workflowsPath: require.resolve("../src/workflows"),
      activities: {
        ...aiActivities,
        ...n8nActivities,
      },
    });

    // Start worker in background
    worker.run().catch((err) => {
      console.error("Worker error in tests:", err);
    });

    // Give worker time to start
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }, 30000);

  afterAll(async () => {
    if (worker) {
      worker.shutdown();
    }
    if (connection) {
      await connection.close();
    }
    if (workerConnection) {
      await workerConnection.close();
    }
  });

  test.skipIf(!process.env.TEMPORAL_ADDRESS)(
    "should list available fal.ai models",
    async () => {
      const { listModelsWorkflow } = await import(
        "../src/workflows/content-generation.workflow"
      );

      const handle = await client.workflow.start(listModelsWorkflow, {
        taskQueue: "test-queue",
        workflowId: `test-list-models-${Date.now()}`,
      });

      const result = await handle.result();

      expect(result).toBeDefined();
      expect(result.falModels).toBeDefined();
      expect(Array.isArray(result.falModels)).toBe(true);
      expect(result.falModels.length).toBeGreaterThan(0);

      // Verify model structure
      const firstModel = result.falModels[0];
      expect(firstModel).toHaveProperty("id");
      expect(firstModel).toHaveProperty("name");
      expect(firstModel).toHaveProperty("category");
    },
    { timeout: 60000 }
  );

  test.skipIf(!process.env.OPENAI_API_KEY)(
    "should generate text content via workflow",
    async () => {
      const { contentGenerationWorkflow } = await import(
        "../src/workflows/content-generation.workflow"
      );

      const handle = await client.workflow.start(contentGenerationWorkflow, {
        taskQueue: "test-queue",
        workflowId: `test-text-gen-${Date.now()}`,
        args: [
          {
            prompt: "Say 'workflow test successful' and nothing else",
            type: "text" as const,
            options: {
              model: "gpt-4o-mini",
              temperature: 0,
            },
          },
        ],
      });

      const result = await handle.result();

      expect(result).toBeDefined();
      expect(result.type).toBe("text");
      expect(result.content).toBeDefined();
      expect(typeof result.content).toBe("string");
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.model).toBeDefined();
    },
    { timeout: 60000 }
  );

  test.skipIf(!process.env.FAL_API_KEY)(
    "should generate image content via workflow",
    async () => {
      const { contentGenerationWorkflow } = await import(
        "../src/workflows/content-generation.workflow"
      );

      const handle = await client.workflow.start(contentGenerationWorkflow, {
        taskQueue: "test-queue",
        workflowId: `test-image-gen-${Date.now()}`,
        args: [
          {
            prompt: "A simple red circle",
            type: "image" as const,
            options: {
              model: "fal-ai/flux/schnell",
              numImages: 1,
            },
          },
        ],
      });

      const result = await handle.result();

      expect(result).toBeDefined();
      expect(result.type).toBe("image");
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content.length).toBe(1);
      expect(result.content[0]).toHaveProperty("url");
      expect(result.content[0].url).toMatch(/^https?:\/\//);
    },
    { timeout: 120000 }
  );

  test.skipIf(!process.env.OPENAI_API_KEY || !process.env.FAL_API_KEY)(
    "should run content pipeline workflow",
    async () => {
      const { contentPipelineWorkflow } = await import(
        "../src/workflows/content-generation.workflow"
      );

      const handle = await client.workflow.start(contentPipelineWorkflow, {
        taskQueue: "test-queue",
        workflowId: `test-pipeline-${Date.now()}`,
        args: [
          {
            initialPrompt: "A cat wearing a wizard hat",
          },
        ],
      });

      const result = await handle.result();

      expect(result).toBeDefined();
      expect(result.story).toBeDefined();
      expect(typeof result.story).toBe("string");
      expect(result.story.length).toBeGreaterThan(0);
      expect(result.image).toBeDefined();
      expect(result.image.url).toMatch(/^https?:\/\//);
      expect(result.video).toBeDefined();
      expect(result.video.url).toMatch(/^https?:\/\//);
    },
    { timeout: 300000 } // 5 minutes for full pipeline
  );
});
