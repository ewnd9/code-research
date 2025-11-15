import { IExecuteFunctions } from 'n8n-core';
import {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { Connection, Client } from '@temporalio/client';

export class TemporalContentPipeline implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Temporal Content Pipeline',
    name: 'temporalContentPipeline',
    icon: 'file:temporal.svg',
    group: ['transform'],
    version: 1,
    description: 'Multi-step AI content generation: Story → Image → Video',
    defaults: {
      name: 'Temporal Content Pipeline',
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
        displayName: 'Initial Prompt',
        name: 'initialPrompt',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        required: true,
        placeholder: 'A robot learning to paint',
        description: 'The initial prompt that will be used to generate a story, then an image and video',
      },
      {
        displayName: 'Timeout (seconds)',
        name: 'timeout',
        type: 'number',
        default: 600,
        description: 'Maximum time to wait for the entire pipeline to complete (recommended: 600s for video generation)',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Story Model',
            name: 'storyModel',
            type: 'options',
            options: [
              {
                name: 'GPT-4o Mini',
                value: 'gpt-4o-mini',
              },
              {
                name: 'GPT-4o',
                value: 'gpt-4o',
              },
            ],
            default: 'gpt-4o-mini',
            description: 'Model to use for story generation',
          },
          {
            displayName: 'Image Model',
            name: 'imageModel',
            type: 'options',
            options: [
              {
                name: 'FLUX.1 Schnell (Fast)',
                value: 'fal-ai/flux/schnell',
              },
              {
                name: 'FLUX.1 Dev',
                value: 'fal-ai/flux/dev',
              },
              {
                name: 'FLUX.1 Pro',
                value: 'fal-ai/flux-pro',
              },
            ],
            default: 'fal-ai/flux/schnell',
            description: 'Model to use for image generation',
          },
          {
            displayName: 'Video Model',
            name: 'videoModel',
            type: 'options',
            options: [
              {
                name: 'Kling v1.5 Standard',
                value: 'fal-ai/kling-video/v1.5/standard/text-to-video',
              },
              {
                name: 'Kling v1.5 Pro',
                value: 'fal-ai/kling-video/v1.5/pro/text-to-video',
              },
            ],
            default: 'fal-ai/kling-video/v1.5/standard/text-to-video',
            description: 'Model to use for video generation',
          },
          {
            displayName: 'Video Duration',
            name: 'videoDuration',
            type: 'number',
            typeOptions: {
              minValue: 5,
              maxValue: 10,
            },
            default: 5,
            description: 'Duration of generated video in seconds',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

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
          const initialPrompt = this.getNodeParameter('initialPrompt', itemIndex) as string;
          const timeout = this.getNodeParameter('timeout', itemIndex, 600) as number;
          const options = this.getNodeParameter('options', itemIndex, {}) as any;

          // Build workflow input
          const workflowInput: any = {
            initialPrompt,
          };

          // Add optional model configurations
          if (options.storyModel || options.imageModel || options.videoModel) {
            workflowInput.options = {
              storyModel: options.storyModel,
              imageModel: options.imageModel,
              videoModel: options.videoModel,
              videoDuration: options.videoDuration,
            };
          }

          // Generate workflow ID
          const workflowId = `content-pipeline-${Date.now()}-${Math.random().toString(36).substring(7)}`;

          // Start dynamic pipeline workflow
          // This workflow orchestrates multiple child workflows in sequence
          const handle = await client.workflow.start('dynamicContentPipelineWorkflow', {
            taskQueue,
            workflowId,
            args: [workflowInput],
          });

          // Wait for result with timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Content pipeline timeout - this may take several minutes for video generation')),
              timeout * 1000
            )
          );

          const resultPromise = handle.result();
          const result = await Promise.race([resultPromise, timeoutPromise]);

          returnData.push({
            json: {
              workflowId: handle.workflowId,
              initialPrompt,
              ...result,
            },
            pairedItem: { item: itemIndex },
          });
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
