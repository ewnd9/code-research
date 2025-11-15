# Architecture Deep Dive

## Overview

This document provides a detailed technical analysis of the n8n-Temporal interoperability architecture.

## Core Components

### 1. Temporal Workflows

Temporal workflows are deterministic functions that orchestrate activities. They can:
- Execute for seconds, hours, or days
- Survive process failures and restarts
- Maintain exact-once execution semantics
- Provide full execution history

```typescript
// Example workflow structure
export async function exampleWorkflow(input: WorkflowInput) {
  // Workflows are deterministic - no direct I/O
  const result1 = await activity1(input);
  const result2 = await activity2(result1);
  return combineResults(result1, result2);
}
```

### 2. Temporal Activities

Activities are non-deterministic functions that interact with external systems:

```typescript
export async function exampleActivity(input: ActivityInput) {
  // Activities can:
  // - Call APIs
  // - Read/write databases
  // - Perform I/O operations
  // - Have side effects
  return await externalAPI.call(input);
}
```

Activities have:
- Automatic retries with exponential backoff
- Timeout management
- Heartbeat support for long-running tasks
- Cancellation support

### 3. n8n Workflows

n8n provides:
- Visual workflow builder
- 400+ pre-built integrations
- Webhook triggers
- Cron scheduling
- Conditional logic
- Data transformation

## Integration Patterns

### Pattern 1: Temporal as Orchestrator

```
┌─────────────────┐
│ Temporal        │
│ Workflow        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│ n8n  │  │ n8n  │
│ WF 1 │  │ WF 2 │
└──────┘  └──────┘
```

Use when:
- Complex orchestration logic
- Need durability and retries
- Long-running processes
- Critical business workflows

Implementation:
```typescript
export async function orchestratorWorkflow(input) {
  // Execute n8n workflows in sequence or parallel
  const result1 = await executeN8nWorkflow({
    workflowId: "wf1"
  });

  const result2 = await executeN8nWorkflow({
    workflowId: "wf2",
    data: result1
  });

  return { result1, result2 };
}
```

### Pattern 2: n8n as Trigger

```
┌─────────────┐
│   Event     │
│   Source    │
└──────┬──────┘
       │
┌──────▼──────┐
│ n8n Webhook │
└──────┬──────┘
       │
┌──────▼──────┐
│  Temporal   │
│  Workflow   │
└─────────────┘
```

Use when:
- Event-driven architecture
- External triggers (webhooks, cron)
- Quick integration setup
- Non-technical users create triggers

Implementation:
- n8n webhook receives event
- n8n HTTP node calls Temporal API
- Temporal workflow executes

### Pattern 3: Hybrid Approach

```
┌────────────────┐
│   Temporal     │
│   Workflow     │
└───┬────────┬───┘
    │        │
┌───▼──┐  ┌──▼────┐
│ AI   │  │ n8n   │
│ APIs │  │ Integ │
└──────┘  └───────┘
```

Use when:
- Need both custom logic and integrations
- Optimize for cost (use n8n for cheap operations)
- Gradual migration from n8n to Temporal
- Different teams manage different parts

## Data Flow

### Temporal → n8n

1. Temporal workflow decides to execute n8n workflow
2. Activity calls n8n API: `POST /api/v1/workflows/{id}/execute`
3. n8n returns execution ID
4. Activity polls for completion: `GET /api/v1/executions/{id}`
5. Workflow receives result

```typescript
// In Temporal workflow
const execution = await executeN8nWorkflow({
  workflowId: "abc123"
});

const result = await waitForN8nExecution({
  executionId: execution.id,
  timeoutMs: 300000 // 5 minutes
});
```

### n8n → Temporal

1. n8n receives webhook or trigger
2. n8n HTTP node posts to Temporal API endpoint
3. Custom endpoint starts Temporal workflow
4. n8n continues or waits for response

```json
{
  "url": "http://temporal-worker:3000/start-workflow",
  "method": "POST",
  "body": {
    "workflowType": "contentPipeline",
    "input": {
      "prompt": "{{ $json.prompt }}"
    }
  }
}
```

## AI Service Integration

### OpenAI Integration

```typescript
// Activity wraps OpenAI client
export async function generateText(input: OpenAICompletionInput) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: input.model || "gpt-4o-mini",
    messages: [
      { role: "system", content: input.systemPrompt },
      { role: "user", content: input.prompt }
    ]
  });

  return {
    text: response.choices[0].message.content,
    usage: response.usage
  };
}
```

Benefits:
- Automatic retries on API failures
- Timeout management
- Usage tracking through workflow history
- Easy A/B testing of models

### fal.ai Integration

```typescript
// Activity wraps fal.ai client
export async function generateImage(input: FalImageInput) {
  const result = await fal.subscribe(input.model, {
    input: {
      prompt: input.prompt,
      num_images: input.numImages
    }
  });

  return result.data;
}
```

Benefits:
- 4x faster inference
- 600+ models available
- Streaming support for long operations
- Automatic model versioning

## Error Handling

### Temporal Error Handling

```typescript
import { ApplicationFailure } from '@temporalio/workflow';

export async function robustWorkflow(input) {
  try {
    return await riskyActivity(input);
  } catch (error) {
    if (error.message.includes('rate limit')) {
      // Retry with backoff
      await sleep('1 minute');
      return await riskyActivity(input);
    }

    // Non-retryable error
    throw ApplicationFailure.nonRetryable(
      'Permanent failure',
      'BusinessError'
    );
  }
}
```

### n8n Error Handling

n8n provides:
- Error workflows (execute on failure)
- Retry settings per node
- Error outputs
- Conditional routing on errors

## State Management

### Temporal State

Workflows maintain state through:
- Local variables (ephemeral)
- Workflow signals (external updates)
- Queries (read current state)
- Search attributes (indexed metadata)

```typescript
export async function statefulWorkflow() {
  let state = { count: 0 };

  // Accept signals to update state
  setHandler(updateSignal, (value) => {
    state.count += value;
  });

  // Provide query to read state
  setHandler(getStateQuery, () => state);

  await condition(() => state.count >= 10);
  return state;
}
```

### n8n State

n8n maintains state through:
- Workflow variables
- Static data nodes
- External databases
- Redis/key-value stores

## Performance Characteristics

### Temporal

| Metric | Value |
|--------|-------|
| Workflow start latency | 10-50ms |
| Activity execution overhead | 5-20ms |
| Max workflow duration | Unlimited |
| Throughput (single worker) | 100-1000 workflows/sec |
| History size limit | 50MB (configurable) |

### n8n

| Metric | Value |
|--------|-------|
| Workflow start latency | 50-200ms |
| Simple workflow execution | 100-500ms |
| Webhook response time | <50ms |
| Concurrent executions | Configurable |
| Max execution time | Configurable |

### AI Services

| Service | Operation | Latency |
|---------|-----------|---------|
| OpenAI | gpt-4o-mini completion | 500ms-2s |
| fal.ai | FLUX schnell image | 2-3s |
| fal.ai | FLUX dev image | 5-7s |
| fal.ai | Video generation | 30-120s |

## Scalability

### Horizontal Scaling

```yaml
# docker-compose scale example
docker-compose up -d --scale temporal-worker=5
```

Each worker:
- Polls for tasks independently
- Processes activities in parallel
- No shared state (stateless)

### Queue Management

Temporal task queues enable:
- Worker specialization (GPU workers, CPU workers)
- Rate limiting per queue
- Priority queuing
- Geographic distribution

```typescript
// Specialized workers
const gpuWorker = await Worker.create({
  taskQueue: 'gpu-tasks',
  activities: { generateImage, generateVideo }
});

const cpuWorker = await Worker.create({
  taskQueue: 'cpu-tasks',
  activities: { generateText, processData }
});
```

## Monitoring

### Temporal Monitoring

- Web UI at http://localhost:8080
- Workflow execution history
- Activity retry attempts
- Task queue metrics
- Worker health

### n8n Monitoring

- Web UI at http://localhost:5678
- Execution logs
- Error tracking
- Performance metrics
- Active workflows

### Metrics to Track

1. **Workflow Metrics**
   - Start rate
   - Completion rate
   - Error rate
   - Duration percentiles (p50, p95, p99)

2. **Activity Metrics**
   - Retry rate
   - Timeout rate
   - External API latency
   - Cost per execution

3. **Resource Metrics**
   - Worker CPU/memory
   - Database connections
   - Queue depth
   - Network I/O

## Security Considerations

### API Keys

- Store in environment variables
- Never commit to version control
- Rotate regularly
- Use separate keys for dev/prod

### Network Security

```yaml
# Recommended production setup
services:
  temporal:
    networks:
      - internal  # Not exposed externally

  temporal-worker:
    networks:
      - internal
      - external  # Can call external APIs
```

### Authentication

For production:
- Enable n8n authentication
- Use Temporal mTLS
- Implement API gateway
- Add rate limiting

## Cost Optimization

### Optimize AI Costs

1. **Use cheaper models where possible**
   ```typescript
   // Use gpt-4o-mini for simple tasks
   const simple = await generateText({
     prompt: "Summarize this",
     model: "gpt-4o-mini"  // 100x cheaper than GPT-4
   });
   ```

2. **Cache results**
   ```typescript
   // Check cache before calling API
   const cached = await getCachedResult(input);
   if (cached) return cached;

   const result = await expensiveAICall(input);
   await cacheResult(input, result);
   return result;
   ```

3. **Batch requests**
   ```typescript
   // Process multiple items in one request
   const results = await Promise.all(
     items.map(item => generateText({ prompt: item }))
   );
   ```

### Optimize Temporal Costs

1. **Use activities efficiently**
   - Batch external calls
   - Set appropriate timeouts
   - Avoid unnecessary retries

2. **Manage workflow history**
   - Use continue-as-new for long-running workflows
   - Limit payload sizes
   - Archive old executions

## Testing Strategy

### Unit Tests

Test individual services:
```typescript
test("FalService generates images", async () => {
  const service = new FalService(apiKey);
  const result = await service.generateImage({
    prompt: "test",
    model: "fal-ai/flux/schnell"
  });

  expect(result.images).toHaveLength(1);
});
```

### Integration Tests

Test actual workflows:
```typescript
test("workflow generates content", async () => {
  const handle = await client.workflow.start(
    contentGenerationWorkflow,
    { args: [{ prompt: "test", type: "text" }] }
  );

  const result = await handle.result();
  expect(result.content).toBeDefined();
});
```

### End-to-End Tests

Test full system:
```typescript
test("n8n triggers temporal workflow", async () => {
  // Trigger n8n webhook
  await axios.post("http://n8n:5678/webhook/test", data);

  // Verify Temporal workflow executed
  const workflows = await client.workflow.list();
  expect(workflows).toContainWorkflow("triggered-workflow");
});
```

## Deployment Patterns

### Development

```bash
docker-compose up -d  # All services locally
bun run worker        # Local worker with hot reload
```

### Production

```yaml
# Kubernetes example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: temporal-worker
spec:
  replicas: 5
  template:
    spec:
      containers:
      - name: worker
        image: n8n-temporal-worker:latest
        env:
        - name: TEMPORAL_ADDRESS
          value: temporal.temporal.svc:7233
```

## Future Enhancements

1. **Custom n8n Node**
   - Create official n8n-temporal-node package
   - Visual workflow builder for Temporal workflows
   - Built-in retry/timeout configuration

2. **Bi-directional Signals**
   - n8n sends signals to running Temporal workflows
   - Temporal queries n8n workflow state
   - Real-time coordination

3. **Shared Observability**
   - Unified dashboard for both systems
   - Trace propagation across systems
   - Cost tracking per workflow

4. **Smart Routing**
   - Automatically choose n8n or Temporal based on requirements
   - Cost-based routing
   - SLA-based routing
