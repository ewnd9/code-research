import { proxyActivities } from "@temporalio/workflow";
import type * as n8nActivities from "../activities/n8n.activities";
import type * as aiActivities from "../activities/ai.activities";

// Proxy activities
const {
  executeN8nWorkflow,
  waitForN8nExecution,
  triggerN8nWebhook,
  getN8nWorkflows,
} = proxyActivities<typeof n8nActivities>({
  startToCloseTimeout: "5 minutes",
});

const {
  generateText,
  generateImage,
} = proxyActivities<typeof aiActivities>({
  startToCloseTimeout: "5 minutes",
});

/**
 * Workflow: Bridge n8n workflow with Temporal
 * This workflow executes an n8n workflow and waits for completion
 */
export async function n8nBridgeWorkflow(input: {
  workflowId: string;
  data?: any;
}): Promise<any> {
  console.log("Starting n8n bridge workflow");

  // Execute n8n workflow
  const execution = await executeN8nWorkflow({
    workflowId: input.workflowId,
    data: input.data,
  });

  console.log("n8n workflow execution started:", execution.id);

  // Wait for execution to complete
  const completedExecution = await waitForN8nExecution({
    executionId: execution.id,
    timeoutMs: 300000, // 5 minutes
  });

  console.log("n8n workflow execution completed");

  return {
    executionId: completedExecution.id,
    finished: completedExecution.finished,
    data: completedExecution.data,
  };
}

/**
 * Workflow: Temporal orchestrates n8n + AI processing
 *
 * This demonstrates how Temporal can orchestrate both n8n workflows
 * and direct AI processing in a single workflow
 */
export async function hybridOrchestrationWorkflow(input: {
  prompt: string;
  n8nWebhookPath?: string;
}): Promise<{
  aiResult: any;
  n8nResult?: any;
}> {
  console.log("Starting hybrid orchestration workflow");

  // Step 1: Use Temporal activity to generate text with AI
  const textResult = await generateText({
    prompt: input.prompt,
    model: "gpt-4o-mini",
  });

  console.log("AI text generated:", textResult.text.substring(0, 50));

  // Step 2: Use Temporal activity to generate an image
  const imageResult = await generateImage({
    prompt: textResult.text,
    model: "fal-ai/flux/schnell",
    numImages: 1,
  });

  console.log("AI image generated");

  // Step 3: If n8n webhook provided, send results to n8n
  let n8nResult;
  if (input.n8nWebhookPath) {
    n8nResult = await triggerN8nWebhook({
      webhookPath: input.n8nWebhookPath,
      data: {
        text: textResult.text,
        image: imageResult.images[0],
      },
    });

    console.log("Results sent to n8n webhook");
  }

  return {
    aiResult: {
      text: textResult.text,
      image: imageResult.images[0],
    },
    n8nResult,
  };
}

/**
 * Workflow: List all n8n workflows
 */
export async function listN8nWorkflowsWorkflow(): Promise<any[]> {
  console.log("Fetching n8n workflows");

  const workflows = await getN8nWorkflows();

  return workflows;
}

/**
 * Workflow: Execute multiple n8n workflows in parallel
 */
export async function parallelN8nWorkflowsWorkflow(input: {
  workflowIds: string[];
  data?: any;
}): Promise<any[]> {
  console.log("Starting parallel n8n workflows");

  // Execute all workflows in parallel
  const executionPromises = input.workflowIds.map((workflowId) =>
    executeN8nWorkflow({
      workflowId,
      data: input.data,
    })
  );

  const executions = await Promise.all(executionPromises);

  console.log("All n8n workflows started:", executions.length);

  // Wait for all executions to complete
  const completedPromises = executions.map((execution) =>
    waitForN8nExecution({
      executionId: execution.id,
      timeoutMs: 300000,
    })
  );

  const completedExecutions = await Promise.all(completedPromises);

  console.log("All n8n workflows completed");

  return completedExecutions.map((exec) => ({
    executionId: exec.id,
    finished: exec.finished,
    data: exec.data,
  }));
}
