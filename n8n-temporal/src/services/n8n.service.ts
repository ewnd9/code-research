import axios, { AxiosInstance } from "axios";
import { z } from "zod";

export const N8nWorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  nodes: z.array(z.any()),
  connections: z.any(),
  settings: z.any().optional(),
});

export const N8nExecutionSchema = z.object({
  id: z.string(),
  finished: z.boolean(),
  mode: z.string(),
  startedAt: z.string(),
  stoppedAt: z.string().optional(),
  workflowId: z.string(),
  data: z.any(),
});

export type N8nWorkflow = z.infer<typeof N8nWorkflowSchema>;
export type N8nExecution = z.infer<typeof N8nExecutionSchema>;

/**
 * Service for interacting with n8n API
 */
export class N8nService {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.N8N_URL || "http://localhost:5678";

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Get all workflows from n8n
   */
  async getWorkflows(): Promise<N8nWorkflow[]> {
    const response = await this.client.get("/api/v1/workflows");
    return response.data.data;
  }

  /**
   * Get a specific workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    const response = await this.client.get(`/api/v1/workflows/${workflowId}`);
    return N8nWorkflowSchema.parse(response.data);
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    data?: any
  ): Promise<N8nExecution> {
    const response = await this.client.post(
      `/api/v1/workflows/${workflowId}/execute`,
      { data }
    );
    return N8nExecutionSchema.parse(response.data);
  }

  /**
   * Trigger a webhook
   */
  async triggerWebhook(webhookPath: string, data: any): Promise<any> {
    const response = await this.client.post(`/webhook/${webhookPath}`, data);
    return response.data;
  }

  /**
   * Get execution details
   */
  async getExecution(executionId: string): Promise<N8nExecution> {
    const response = await this.client.get(`/api/v1/executions/${executionId}`);
    return N8nExecutionSchema.parse(response.data);
  }

  /**
   * Wait for execution to complete
   */
  async waitForExecution(
    executionId: string,
    timeoutMs: number = 60000
  ): Promise<N8nExecution> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const execution = await this.getExecution(executionId);

      if (execution.finished) {
        return execution;
      }

      // Wait 500ms before checking again
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error(
      `Execution ${executionId} did not complete within ${timeoutMs}ms`
    );
  }

  /**
   * Create a workflow
   */
  async createWorkflow(workflow: {
    name: string;
    nodes: any[];
    connections: any;
    settings?: any;
  }): Promise<N8nWorkflow> {
    const response = await this.client.post("/api/v1/workflows", workflow);
    return N8nWorkflowSchema.parse(response.data);
  }

  /**
   * Activate a workflow
   */
  async activateWorkflow(workflowId: string): Promise<N8nWorkflow> {
    const response = await this.client.patch(
      `/api/v1/workflows/${workflowId}`,
      {
        active: true,
      }
    );
    return N8nWorkflowSchema.parse(response.data);
  }
}
