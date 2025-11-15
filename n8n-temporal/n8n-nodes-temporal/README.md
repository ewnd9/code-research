# n8n-nodes-temporal

Custom n8n nodes for Temporal workflow orchestration. Execute Temporal workflows directly from n8n using visual workflow builder.

## Installation

### Option 1: Local Development (Docker Compose)

The nodes are automatically installed when using the provided docker-compose setup:

```bash
cd /home/user/code-research
docker-compose up -d
```

### Option 2: Manual Installation in n8n

1. Navigate to your n8n custom nodes directory:
```bash
cd ~/.n8n/custom
```

2. Clone or copy this package:
```bash
cp -r /path/to/n8n-nodes-temporal .
cd n8n-nodes-temporal
```

3. Install dependencies and build:
```bash
npm install
npm run build
```

4. Restart n8n

### Option 3: npm Package (Coming Soon)

```bash
npm install n8n-nodes-temporal
```

## Nodes Included

### 1. Temporal

Generic node for executing any Temporal workflow.

**Operations:**
- **Execute Workflow**: Start and optionally wait for a Temporal workflow
- **Query Workflow**: Query the state of a running workflow
- **Signal Workflow**: Send a signal to a running workflow

**Use Cases:**
- Execute custom Temporal workflows
- Monitor workflow state
- Control running workflows via signals

### 2. Temporal Content Generation

Specialized node for AI content generation (text, images, videos).

**Content Types:**
- **Text**: Generate text using OpenAI (GPT-4o, GPT-4o-mini, GPT-4 Turbo)
- **Image**: Generate images using fal.ai (FLUX.1, Stable Diffusion, Recraft V3)
- **Video**: Generate videos using fal.ai (Kling, Hunyuan, MiniMax)

**Features:**
- Model selection per content type
- Configurable parameters (temperature, size, duration, etc.)
- Timeout handling
- Error management

### 3. Temporal Content Pipeline

Multi-step AI content generation pipeline.

**Pipeline Steps:**
1. Generate a story from initial prompt (OpenAI)
2. Generate an image based on the story (fal.ai)
3. Generate a video based on the story (fal.ai)

**Use Cases:**
- Complete content creation workflows
- Marketing material generation
- Automated storytelling with visuals

## Configuration

### Credentials

All nodes require Temporal API credentials:

1. In n8n, go to **Credentials** → **New** → **Temporal API**
2. Configure:
   - **Temporal Server Address**: `temporal:7233` (Docker) or `localhost:7233` (local)
   - **Namespace**: `default`
   - **Task Queue**: `n8n-temporal-interop`
   - **OpenAI API Key**: Your OpenAI API key (optional, for text generation)
   - **fal.ai API Key**: Your fal.ai API key (optional, for image/video generation)

## Usage Examples

### Example 1: Generate Text

1. Add **Temporal Content Generation** node
2. Set **Content Type** to "Text"
3. Enter your prompt
4. Select OpenAI model (e.g., GPT-4o Mini)
5. Execute

Output:
```json
{
  "workflowId": "content-gen-text-1234567890",
  "contentType": "text",
  "prompt": "Write a short poem",
  "type": "text",
  "content": "Roses are red...",
  "model": "gpt-4o-mini",
  "usage": { ... }
}
```

### Example 2: Generate Image

1. Add **Temporal Content Generation** node
2. Set **Content Type** to "Image"
3. Enter your prompt: "A futuristic city with flying cars"
4. Select Image Model: "FLUX.1 Schnell"
5. Execute

Output:
```json
{
  "workflowId": "content-gen-image-1234567890",
  "contentType": "image",
  "prompt": "A futuristic city with flying cars",
  "type": "image",
  "content": [
    {
      "url": "https://fal.media/files/...",
      "content_type": "image/png"
    }
  ]
}
```

### Example 3: Content Pipeline

1. Add **Temporal Content Pipeline** node
2. Enter initial prompt: "A robot learning to paint"
3. Configure timeout: 600 seconds (video generation takes time)
4. Execute

Output:
```json
{
  "workflowId": "content-pipeline-1234567890",
  "initialPrompt": "A robot learning to paint",
  "story": "Once upon a time...",
  "image": {
    "url": "https://fal.media/files/...",
    "content_type": "image/png"
  },
  "video": {
    "url": "https://fal.media/files/..."
  }
}
```

### Example 4: Custom Workflow

1. Add **Temporal** node
2. Select **Execute Workflow**
3. Set **Workflow Type**: `myCustomWorkflow`
4. Set **Workflow Arguments**:
```json
{
  "param1": "value1",
  "param2": "value2"
}
```
5. Enable **Wait for Completion**
6. Execute

## n8n Workflow Examples

### Example: Automated Social Media Content

```
[Schedule Trigger] → [Temporal Content Pipeline] → [Edit Image] → [Post to Twitter]
```

1. Schedule trigger runs daily
2. Content pipeline generates story + image + video
3. Optional image editing
4. Post to social media

### Example: AI-Powered Support Tickets

```
[Webhook] → [Temporal Content Generation (Text)] → [If] → [Send Email/Slack]
```

1. Webhook receives support ticket
2. AI generates response using context
3. If confidence > 80%, auto-respond
4. Otherwise, notify human support

### Example: Video Generation Pipeline

```
[Manual Trigger] → [Temporal Content Generation (Text)] → [Temporal Content Generation (Video)] → [Upload to YouTube]
```

1. Manual trigger with topic
2. Generate script with AI
3. Generate video from script
4. Upload to YouTube with generated description

## Architecture

```
┌─────────────┐
│  n8n Node   │
└──────┬──────┘
       │
       │ Temporal Client API
       │
┌──────▼──────┐
│  Temporal   │
│   Server    │
└──────┬──────┘
       │
┌──────▼──────┐
│  Temporal   │
│   Worker    │
└──────┬──────┘
       │
    ┌──┴──┐
    │     │
┌───▼─┐ ┌─▼────┐
│ AI  │ │ n8n  │
│ APIs│ │ APIs │
└─────┘ └──────┘
```

The n8n nodes act as Temporal clients, starting workflows that are executed by Temporal workers. This provides:

- **Durable Execution**: Workflows survive crashes and restarts
- **Scalability**: Workers can scale horizontally
- **Reliability**: Automatic retries and error handling
- **Observability**: Full execution history in Temporal UI

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Lint

```bash
npm run lint
npm run lintfix  # Auto-fix
```

## Troubleshooting

### Node Not Appearing in n8n

1. Check n8n logs: `docker-compose logs n8n`
2. Verify package is in `/home/node/.n8n/custom/`
3. Ensure package is built: `npm run build`
4. Restart n8n: `docker-compose restart n8n`

### "Cannot connect to Temporal"

1. Check Temporal is running: `docker-compose ps temporal`
2. Verify server address in credentials: `temporal:7233` (Docker) or `localhost:7233`
3. Check Temporal UI: http://localhost:8080

### "Workflow timeout"

1. Increase timeout value in node settings
2. Check Temporal worker is running: `bun run worker`
3. Verify task queue matches in credentials and worker
4. Check Temporal UI for workflow status

### "API Key Error"

1. Ensure API keys are set in Temporal API credentials
2. For text generation: Add OpenAI API key
3. For image/video: Add fal.ai API key
4. Check keys are valid and have quota remaining

## API Keys Required

- **OpenAI API Key**: For text generation workflows
  - Get at: https://platform.openai.com/api-keys
  - Required for: Text generation, Content pipeline

- **fal.ai API Key**: For image and video generation
  - Get at: https://fal.ai/dashboard
  - Required for: Image generation, Video generation, Content pipeline

## Performance

| Operation | Typical Duration |
|-----------|-----------------|
| Text generation | 1-5 seconds |
| Image generation (FLUX schnell) | 2-3 seconds |
| Image generation (FLUX dev) | 5-7 seconds |
| Video generation | 30-120 seconds |
| Content pipeline | 60-180 seconds |

## License

MIT

## Support

- GitHub Issues: https://github.com/ewnd9/code-research/issues
- Temporal Docs: https://docs.temporal.io
- n8n Docs: https://docs.n8n.io
- fal.ai Docs: https://docs.fal.ai
