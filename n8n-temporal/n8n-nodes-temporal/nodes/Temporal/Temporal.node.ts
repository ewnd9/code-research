import { IExecuteFunctions } from 'n8n-core';
import {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import { Connection, Client } from '@temporalio/client';

export class Temporal implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Temporal',
    name: 'temporal',
    icon: 'file:temporal.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Execute Temporal workflows',
    defaults: {
      name: 'Temporal',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'temporalApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Execute Workflow',
            value: 'executeWorkflow',
            description: 'Execute a Temporal workflow',
            action: 'Execute a workflow',
          },
          {
            name: 'Query Workflow',
            value: 'queryWorkflow',
            description: 'Query a running workflow',
            action: 'Query a workflow',
          },
          {
            name: 'Signal Workflow',
            value: 'signalWorkflow',
            description: 'Send a signal to a running workflow',
            action: 'Signal a workflow',
          },
        ],
        default: 'executeWorkflow',
      },

      // Execute Workflow fields
      {
        displayName: 'Workflow Type',
        name: 'workflowType',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['executeWorkflow'],
          },
        },
        default: '',
        required: true,
        placeholder: 'contentGenerationWorkflow',
        description: 'The name of the workflow function to execute',
      },
      {
        displayName: 'Workflow ID',
        name: 'workflowId',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['executeWorkflow'],
          },
        },
        default: '',
        placeholder: '={{$json["id"]}}',
        description: 'Unique ID for this workflow execution. Leave empty to auto-generate.',
      },
      {
        displayName: 'Workflow Arguments (JSON)',
        name: 'workflowArgs',
        type: 'json',
        displayOptions: {
          show: {
            operation: ['executeWorkflow'],
          },
        },
        default: '{}',
        description: 'Arguments to pass to the workflow (as JSON)',
      },
      {
        displayName: 'Wait for Completion',
        name: 'waitForCompletion',
        type: 'boolean',
        displayOptions: {
          show: {
            operation: ['executeWorkflow'],
          },
        },
        default: true,
        description: 'Whether to wait for the workflow to complete before continuing',
      },
      {
        displayName: 'Timeout (seconds)',
        name: 'timeout',
        type: 'number',
        displayOptions: {
          show: {
            operation: ['executeWorkflow'],
            waitForCompletion: [true],
          },
        },
        default: 300,
        description: 'Maximum time to wait for workflow completion (in seconds)',
      },

      // Query Workflow fields
      {
        displayName: 'Workflow ID',
        name: 'queryWorkflowId',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['queryWorkflow'],
          },
        },
        default: '',
        required: true,
        description: 'The ID of the workflow to query',
      },
      {
        displayName: 'Query Name',
        name: 'queryName',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['queryWorkflow'],
          },
        },
        default: '',
        required: true,
        description: 'The name of the query to execute',
      },
      {
        displayName: 'Query Arguments (JSON)',
        name: 'queryArgs',
        type: 'json',
        displayOptions: {
          show: {
            operation: ['queryWorkflow'],
          },
        },
        default: '{}',
        description: 'Arguments for the query (as JSON)',
      },

      // Signal Workflow fields
      {
        displayName: 'Workflow ID',
        name: 'signalWorkflowId',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['signalWorkflow'],
          },
        },
        default: '',
        required: true,
        description: 'The ID of the workflow to signal',
      },
      {
        displayName: 'Signal Name',
        name: 'signalName',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['signalWorkflow'],
          },
        },
        default: '',
        required: true,
        description: 'The name of the signal to send',
      },
      {
        displayName: 'Signal Arguments (JSON)',
        name: 'signalArgs',
        type: 'json',
        displayOptions: {
          show: {
            operation: ['signalWorkflow'],
          },
        },
        default: '{}',
        description: 'Arguments for the signal (as JSON)',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const operation = this.getNodeParameter('operation', 0) as string;

    // Get credentials
    const credentials = await this.getCredentials('temporalApi');
    const serverAddress = credentials.serverAddress as string;
    const namespace = credentials.namespace as string;
    const taskQueue = credentials.taskQueue as string;

    // Connect to Temporal
    const connection = await Connection.connect({
      address: serverAddress,
    });

    const client = new Client({
      connection,
      namespace,
    });

    try {
      for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
        try {
          if (operation === 'executeWorkflow') {
            const workflowType = this.getNodeParameter('workflowType', itemIndex) as string;
            let workflowId = this.getNodeParameter('workflowId', itemIndex, '') as string;
            const workflowArgsStr = this.getNodeParameter('workflowArgs', itemIndex) as string;
            const waitForCompletion = this.getNodeParameter('waitForCompletion', itemIndex) as boolean;
            const timeout = this.getNodeParameter('timeout', itemIndex, 300) as number;

            // Parse workflow arguments
            let workflowArgs: any;
            try {
              workflowArgs = JSON.parse(workflowArgsStr);
            } catch (error) {
              throw new NodeOperationError(
                this.getNode(),
                `Invalid JSON in workflow arguments: ${error.message}`,
                { itemIndex }
              );
            }

            // Generate workflow ID if not provided
            if (!workflowId) {
              workflowId = `${workflowType}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            }

            // Start workflow
            const handle = await client.workflow.start(workflowType, {
              taskQueue,
              workflowId,
              args: [workflowArgs],
            });

            let result: any = {
              workflowId: handle.workflowId,
              runId: handle.firstExecutionRunId,
              started: true,
            };

            // Wait for completion if requested
            if (waitForCompletion) {
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Workflow execution timeout')), timeout * 1000)
              );

              const resultPromise = handle.result();

              try {
                const workflowResult = await Promise.race([resultPromise, timeoutPromise]);
                result = {
                  ...result,
                  completed: true,
                  result: workflowResult,
                };
              } catch (error: any) {
                if (error.message === 'Workflow execution timeout') {
                  result = {
                    ...result,
                    completed: false,
                    timeout: true,
                  };
                } else {
                  throw error;
                }
              }
            }

            returnData.push({
              json: result,
              pairedItem: { item: itemIndex },
            });
          } else if (operation === 'queryWorkflow') {
            const workflowId = this.getNodeParameter('queryWorkflowId', itemIndex) as string;
            const queryName = this.getNodeParameter('queryName', itemIndex) as string;
            const queryArgsStr = this.getNodeParameter('queryArgs', itemIndex) as string;

            let queryArgs: any;
            try {
              queryArgs = JSON.parse(queryArgsStr);
            } catch (error) {
              throw new NodeOperationError(
                this.getNode(),
                `Invalid JSON in query arguments: ${error.message}`,
                { itemIndex }
              );
            }

            const handle = client.workflow.getHandle(workflowId);
            const result = await handle.query(queryName, queryArgs);

            returnData.push({
              json: {
                workflowId,
                queryName,
                result,
              },
              pairedItem: { item: itemIndex },
            });
          } else if (operation === 'signalWorkflow') {
            const workflowId = this.getNodeParameter('signalWorkflowId', itemIndex) as string;
            const signalName = this.getNodeParameter('signalName', itemIndex) as string;
            const signalArgsStr = this.getNodeParameter('signalArgs', itemIndex) as string;

            let signalArgs: any;
            try {
              signalArgs = JSON.parse(signalArgsStr);
            } catch (error) {
              throw new NodeOperationError(
                this.getNode(),
                `Invalid JSON in signal arguments: ${error.message}`,
                { itemIndex }
              );
            }

            const handle = client.workflow.getHandle(workflowId);
            await handle.signal(signalName, signalArgs);

            returnData.push({
              json: {
                workflowId,
                signalName,
                signaled: true,
              },
              pairedItem: { item: itemIndex },
            });
          }
        } catch (error) {
          if (this.continueOnFail()) {
            returnData.push({
              json: {
                error: error.message,
              },
              pairedItem: { item: itemIndex },
            });
            continue;
          }
          throw error;
        }
      }
    } finally {
      await connection.close();
    }

    return [returnData];
  }
}
