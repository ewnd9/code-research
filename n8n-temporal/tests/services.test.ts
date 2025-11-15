import { describe, test, expect, beforeAll } from "bun:test";
import { FalService } from "../src/services/fal.service";
import { OpenAIService } from "../src/services/openai.service";
import { N8nService } from "../src/services/n8n.service";

describe("FalService", () => {
  let falService: FalService;

  beforeAll(() => {
    falService = new FalService(process.env.FAL_API_KEY);
  });

  test("should fetch available models", async () => {
    const models = await falService.getAvailableModels();

    expect(models).toBeDefined();
    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBeGreaterThan(0);

    // Verify structure of first model
    const firstModel = models[0];
    expect(firstModel).toHaveProperty("id");
    expect(firstModel).toHaveProperty("name");
    expect(firstModel).toHaveProperty("category");
  });

  test("should get image models", async () => {
    const imageModels = await falService.getModelsByCategory("image");

    expect(imageModels).toBeDefined();
    expect(Array.isArray(imageModels)).toBe(true);
    expect(imageModels.length).toBeGreaterThan(0);

    // All models should be image models
    imageModels.forEach((model) => {
      expect(model.category).toBe("image");
    });
  });

  test("should get video models", async () => {
    const videoModels = await falService.getModelsByCategory("video");

    expect(videoModels).toBeDefined();
    expect(Array.isArray(videoModels)).toBe(true);
    expect(videoModels.length).toBeGreaterThan(0);

    // All models should be video models
    videoModels.forEach((model) => {
      expect(model.category).toBe("video");
    });
  });

  test.skipIf(!process.env.FAL_API_KEY)(
    "should generate an image",
    async () => {
      const result = await falService.generateImage({
        prompt: "A simple red circle on white background",
        model: "fal-ai/flux/schnell",
        numImages: 1,
      });

      expect(result).toBeDefined();
      expect(result.images).toBeDefined();
      expect(Array.isArray(result.images)).toBe(true);
      expect(result.images.length).toBe(1);
      expect(result.images[0]).toHaveProperty("url");
      expect(result.images[0].url).toMatch(/^https?:\/\//);
    },
    { timeout: 60000 } // 60 seconds for image generation
  );
});

describe("OpenAIService", () => {
  let openaiService: OpenAIService;

  beforeAll(() => {
    openaiService = new OpenAIService(process.env.OPENAI_API_KEY);
  });

  test.skipIf(!process.env.OPENAI_API_KEY)(
    "should generate text completion",
    async () => {
      const result = await openaiService.generateCompletion({
        prompt: "Say 'test successful' and nothing else",
        model: "gpt-4o-mini",
        temperature: 0,
      });

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      expect(typeof result.text).toBe("string");
      expect(result.text.length).toBeGreaterThan(0);
      expect(result.model).toBeDefined();
      expect(result.usage).toBeDefined();
    },
    { timeout: 30000 }
  );

  test.skipIf(!process.env.OPENAI_API_KEY)(
    "should use system prompt",
    async () => {
      const result = await openaiService.generateCompletion({
        prompt: "What are you?",
        model: "gpt-4o-mini",
        systemPrompt: "You are a helpful assistant that only responds in JSON format.",
        temperature: 0,
      });

      expect(result).toBeDefined();
      expect(result.text).toBeDefined();
      // Response should attempt JSON format due to system prompt
      expect(result.text).toMatch(/[{}\[\]]/);
    },
    { timeout: 30000 }
  );

  test.skipIf(!process.env.OPENAI_API_KEY)(
    "should fetch available models",
    async () => {
      const models = await openaiService.getAvailableModels();

      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);

      // Should include GPT models
      const hasGPT4 = models.some((model) => model.includes("gpt-4"));
      expect(hasGPT4).toBe(true);
    },
    { timeout: 30000 }
  );
});

describe("N8nService", () => {
  let n8nService: N8nService;

  beforeAll(() => {
    n8nService = new N8nService(process.env.N8N_URL);
  });

  test.skipIf(!process.env.N8N_URL)(
    "should connect to n8n API",
    async () => {
      // Try to fetch workflows - this will fail if n8n is not running
      try {
        const workflows = await n8nService.getWorkflows();
        expect(Array.isArray(workflows)).toBe(true);
      } catch (error: any) {
        // If we get a connection error, n8n is not running
        if (error.code === "ECONNREFUSED") {
          console.warn("n8n is not running, skipping test");
        } else {
          throw error;
        }
      }
    },
    { timeout: 10000 }
  );
});
