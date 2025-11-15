# n8n to Temporal Workflows Interoperability Research

A research project exploring the integration between n8n workflow automation and Temporal workflow orchestration, enhanced with AI capabilities from OpenAI and fal.ai.

## Research Overview

This project investigates how n8n (a visual workflow automation tool) and Temporal (a durable workflow orchestration engine) can work together, creating a powerful hybrid system that combines:

- **n8n's strengths**: Visual workflow builder, 400+ integrations, webhook triggers, easy prototyping
- **Temporal's strengths**: Durable execution, complex orchestration, failure recovery, scalability
- **AI capabilities**: Text generation (OpenAI), image generation (fal.ai), video generation (fal.ai)

## Architecture

### Component Diagram

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   n8n UI    │      │ Temporal UI  │      │  Services   │
│  (5678)     │      │   (8080)     │      │             │
└──────┬──────┘      └──────┬───────┘      │  - OpenAI   │
       │                    │              │  - fal.ai   │
       │                    │              └─────────────┘
┌──────▼──────┐      ┌──────▼───────┐
│   n8n       │◄────►│  Temporal    │
│   Server    │      │   Server     │
└──────┬──────┘      └──────┬───────┘
       │                    │
       │             ┌──────▼───────┐
       │             │  Temporal    │
       │             │   Worker     │
       │             │ (Activities) │
       │             └──────┬───────┘
       │                    │
       └────────────────────┘
```

### Integration Patterns

#### 1. Temporal Orchestrates n8n
Temporal workflows can trigger and orchestrate n8n workflows:
```typescript
// Temporal workflow calls n8n workflow
const execution = await executeN8nWorkflow({ workflowId: "..." });
const result = await waitForN8nExecution({ executionId: execution.id });
```

#### 2. Hybrid Orchestration
Temporal can mix direct API calls with n8n workflows:
```typescript
// Temporal directly calls OpenAI and fal.ai
const text = await generateText({ prompt: "..." });
const image = await generateImage({ prompt: text.content });

// Then sends results to n8n for further processing
await triggerN8nWebhook({ path: "/process", data: { text, image } });
```

#### 3. n8n Triggers Temporal
n8n webhooks can trigger Temporal workflows (via custom nodes or HTTP requests).

## Project Structure

```
.
├── docker-compose.yml          # All services (Temporal, n8n, PostgreSQL)
├── src/
│   ├── activities/            # Temporal activities
│   │   ├── ai.activities.ts   # OpenAI & fal.ai activities
│   │   └── n8n.activities.ts  # n8n integration activities
│   ├── workflows/             # Temporal workflows
│   │   ├── content-generation.workflow.ts
│   │   └── n8n-temporal-bridge.workflow.ts
│   ├── services/              # Service clients
│   │   ├── fal.service.ts     # fal.ai API client
│   │   ├── openai.service.ts  # OpenAI API client
│   │   └── n8n.service.ts     # n8n API client
│   ├── worker.ts              # Temporal worker
│   ├── client.ts              # Example client
│   └── index.ts               # Entry point
├── tests/                     # Integration tests (no mocking)
│   ├── services.test.ts
│   └── workflows.test.ts
└── package.json
```

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [Docker](https://www.docker.com/) and Docker Compose
- API Keys (optional, for full functionality):
  - OpenAI API key
  - fal.ai API key

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd code-research
bun install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your API keys
```

### 3. Start Services

```bash
docker-compose up -d
```

This starts:
- **Temporal Server** (localhost:7233)
- **Temporal UI** (http://localhost:8080)
- **n8n** (http://localhost:5678)
- **PostgreSQL** (for both services)

Wait for all services to be healthy:
```bash
docker-compose ps
```

### 4. Start Temporal Worker

```bash
bun run worker
```

### 5. Run Examples

```bash
bun run client
```

## Available fal.ai Models

The project includes support for 600+ fal.ai models. Key models:

### Image Generation
- `fal-ai/flux/dev` - FLUX.1 dev (fast, high quality)
- `fal-ai/flux/schnell` - FLUX.1 schnell (ultra-fast)
- `fal-ai/flux-pro` - FLUX.1 Pro (professional quality)
- `fal-ai/recraft-v3` - Vector typography and design
- `fal-ai/stable-diffusion-v35-large` - Latest Stable Diffusion

### Video Generation
- `fal-ai/kling-video/v1.5/standard/text-to-video` - Kling text-to-video
- `fal-ai/kling-video/v1.5/pro/text-to-video` - Kling Pro
- `fal-ai/wan-i2v` - WAN image-to-video
- `fal-ai/stable-video` - Stable Video Diffusion
- `fal-ai/hunyuan-video` - Hunyuan Video
- `fal-ai/minimax-video` - MiniMax Video

Fetch the complete list programmatically:
```typescript
const falService = new FalService(process.env.FAL_API_KEY);
const models = await falService.getAvailableModels();
```

## Example Workflows

### 1. Content Generation Workflow

Generate text, images, or videos:

```typescript
await client.workflow.start(contentGenerationWorkflow, {
  taskQueue: "n8n-temporal-interop",
  args: [{
    prompt: "A futuristic city",
    type: "image",
    options: {
      model: "fal-ai/flux/schnell",
      numImages: 1
    }
  }]
});
```

### 2. Content Pipeline Workflow

Multi-step AI content generation:

```typescript
await client.workflow.start(contentPipelineWorkflow, {
  taskQueue: "n8n-temporal-interop",
  args: [{
    initialPrompt: "A robot learning to paint"
  }]
});
```

This workflow:
1. Generates a story with OpenAI
2. Creates an image based on the story
3. Generates a video based on the story

### 3. n8n Bridge Workflow

Execute and monitor n8n workflows from Temporal:

```typescript
await client.workflow.start(n8nBridgeWorkflow, {
  taskQueue: "n8n-temporal-interop",
  args: [{
    workflowId: "your-n8n-workflow-id",
    data: { input: "data" }
  }]
});
```

### 4. Hybrid Orchestration Workflow

Combine Temporal activities and n8n webhooks:

```typescript
await client.workflow.start(hybridOrchestrationWorkflow, {
  taskQueue: "n8n-temporal-interop",
  args: [{
    prompt: "Generate a marketing campaign",
    n8nWebhookPath: "process-campaign"
  }]
});
```

## Testing

All tests are integration tests that run against actual services (no mocking):

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/services.test.ts

# Watch mode
bun test --watch
```

Tests automatically skip if required API keys or services are not available.

## Research Findings

### Key Insights

1. **Complementary Strengths**
   - n8n excels at quick integrations and visual workflow building
   - Temporal excels at complex, long-running, failure-resistant workflows
   - Together they provide both ease-of-use and reliability

2. **Integration Approaches**
   - **Temporal → n8n**: Temporal orchestrates n8n workflows via API
   - **n8n → Temporal**: n8n triggers Temporal workflows via webhooks/HTTP
   - **Hybrid**: Mix both for optimal flexibility

3. **AI Integration**
   - fal.ai provides 4x faster inference than traditional alternatives
   - OpenAI GPT-4o-mini offers excellent cost/performance for text
   - Both integrate seamlessly with Temporal activities

4. **Scalability**
   - n8n's queue mode handles concurrent executions
   - Temporal's worker model scales horizontally
   - Combined system can handle enterprise-scale workflows

### Use Cases

**Best for n8n**:
- Quick prototyping
- Simple integrations (email, Slack, webhooks)
- Non-technical user workflows
- Event-driven automations

**Best for Temporal**:
- Complex business logic
- Long-running processes (hours/days)
- Critical workflows requiring guarantees
- Workflows with many retry/compensation patterns

**Best for Hybrid**:
- Start with n8n for rapid development
- Move critical paths to Temporal for reliability
- Use n8n for integrations, Temporal for orchestration

## Service URLs

- **Temporal UI**: http://localhost:8080
- **n8n UI**: http://localhost:5678
- **Temporal gRPC**: localhost:7233
- **n8n API**: http://localhost:5678/api/v1

## Commands

```bash
# Development
bun run dev          # Show help
bun run worker       # Start Temporal worker
bun run client       # Run example workflows

# Testing
bun test             # Run all tests
bun test --watch     # Watch mode

# Docker
bun run docker:up    # Start all services
bun run docker:down  # Stop all services
bun run docker:logs  # View logs
```

## Troubleshooting

### Temporal Connection Failed

Ensure Temporal is running and healthy:
```bash
docker-compose ps temporal
docker-compose logs temporal
```

### n8n API Not Responding

Check n8n is running:
```bash
docker-compose ps n8n
docker-compose logs n8n
```

Visit http://localhost:5678 to verify n8n UI loads.

### Worker Can't Find Workflows

Ensure you're running the worker from the project root:
```bash
cd /path/to/code-research
bun run worker
```

### Tests Failing

1. Ensure all services are running: `docker-compose ps`
2. Check API keys are set in `.env`
3. Tests requiring API keys will automatically skip if not set

## Performance Notes

### fal.ai Inference Speed
- **FLUX.1 schnell**: ~2-3 seconds per image
- **FLUX.1 dev**: ~5-7 seconds per image
- **Video generation**: ~30-120 seconds depending on model and duration

### Temporal Workflow Execution
- Local workflows: <100ms overhead
- Network activities: Depends on external service
- Workflow history: Persisted to PostgreSQL

### n8n Execution
- Simple workflows: ~100-500ms
- Complex workflows: Varies by integrations
- Webhook triggers: <50ms response time

## Future Research Directions

1. **Enhanced Integration**
   - Build custom n8n node for Temporal
   - Create Temporal SDK helpers for n8n API
   - Bidirectional workflow triggering

2. **Advanced Patterns**
   - Saga pattern across n8n and Temporal
   - Event-driven architecture with both systems
   - Shared state management

3. **AI Workflows**
   - Multi-agent AI workflows
   - RAG (Retrieval Augmented Generation) pipelines
   - AI model chaining and fallbacks

4. **Production Readiness**
   - Authentication and authorization
   - Rate limiting and quotas
   - Monitoring and observability
   - Error handling and alerting

## License

MIT

## References

- [n8n Documentation](https://docs.n8n.io/)
- [Temporal Documentation](https://docs.temporal.io/)
- [fal.ai Documentation](https://docs.fal.ai/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Async Code Research Approach](https://simonwillison.net/2025/Nov/6/async-code-research/)
