import { N8nService, type N8nWorkflow, type N8nExecution } from "../services/n8n.service";

/**
 * Activity: Execute n8n workflow
 */
export async function executeN8nWorkflow(input: {
  workflowId: string;
  data?: any;
}): Promise<N8nExecution> {
  console.log("Executing n8n workflow:", input.workflowId);

  const n8nService = new N8nService(process.env.N8N_URL);
  const execution = await n8nService.executeWorkflow(input.workflowId, input.data);

  console.log("n8n workflow execution started:", execution.id);
  return execution;
}

/**
 * Activity: Wait for n8n execution to complete
 */
export async function waitForN8nExecution(input: {
  executionId: string;
  timeoutMs?: number;
}): Promise<N8nExecution> {
  console.log("Waiting for n8n execution:", input.executionId);

  const n8nService = new N8nService(process.env.N8N_URL);
  const execution = await n8nService.waitForExecution(
    input.executionId,
    input.timeoutMs
  );

  console.log("n8n execution completed:", execution.id);
  return execution;
}

/**
 * Activity: Trigger n8n webhook
 */
export async function triggerN8nWebhook(input: {
  webhookPath: string;
  data: any;
}): Promise<any> {
  console.log("Triggering n8n webhook:", input.webhookPath);

  const n8nService = new N8nService(process.env.N8N_URL);
  const result = await n8nService.triggerWebhook(input.webhookPath, input.data);

  console.log("n8n webhook triggered successfully");
  return result;
}

/**
 * Activity: Get n8n workflows
 */
export async function getN8nWorkflows(): Promise<N8nWorkflow[]> {
  console.log("Fetching n8n workflows");

  const n8nService = new N8nService(process.env.N8N_URL);
  const workflows = await n8nService.getWorkflows();

  console.log("Fetched", workflows.length, "n8n workflows");
  return workflows;
}

/**
 * Activity: Create n8n workflow
 */
export async function createN8nWorkflow(input: {
  name: string;
  nodes: any[];
  connections: any;
  settings?: any;
}): Promise<N8nWorkflow> {
  console.log("Creating n8n workflow:", input.name);

  const n8nService = new N8nService(process.env.N8N_URL);
  const workflow = await n8nService.createWorkflow(input);

  console.log("n8n workflow created:", workflow.id);
  return workflow;
}
