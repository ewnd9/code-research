import { IExecuteFunctions } from 'n8n-core';
import {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import { Connection, Client } from '@temporalio/client';

export class TemporalContentGeneration implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Temporal Content Generation',
    name: 'temporalContentGeneration',
    icon: 'file:temporal.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["contentType"]}}',
    description: 'Generate AI content (text, image, video) using Temporal workflows',
    defaults: {
      name: 'Temporal Content Generation',
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
        displayName: 'Content Type',
        name: 'contentType',
        type: 'options',
        options: [
          {
            name: 'Text',
            value: 'text',
            description: 'Generate text using OpenAI',
          },
          {
            name: 'Image',
            value: 'image',
            description: 'Generate images using fal.ai',
          },
          {
            name: 'Video',
            value: 'video',
            description: 'Generate videos using fal.ai',
          },
        ],
        default: 'text',
        description: 'The type of content to generate',
      },
      {
        displayName: 'Prompt',
        name: 'prompt',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        required: true,
        placeholder: 'A futuristic city with flying cars',
        description: 'The prompt for content generation',
      },

      // Text options
      {
        displayName: 'Model',
        name: 'textModel',
        type: 'options',
        displayOptions: {
          show: {
            contentType: ['text'],
          },
        },
        options: [
          {
            name: 'GPT-4o Mini',
            value: 'gpt-4o-mini',
          },
          {
            name: 'GPT-4o',
            value: 'gpt-4o',
          },
          {
            name: 'GPT-4 Turbo',
            value: 'gpt-4-turbo',
          },
        ],
        default: 'gpt-4o-mini',
        description: 'OpenAI model to use for text generation',
      },
      {
        displayName: 'System Prompt',
        name: 'systemPrompt',
        type: 'string',
        typeOptions: {
          rows: 2,
        },
        displayOptions: {
          show: {
            contentType: ['text'],
          },
        },
        default: '',
        placeholder: 'You are a helpful assistant...',
        description: 'Optional system prompt for the AI',
      },
      {
        displayName: 'Temperature',
        name: 'temperature',
        type: 'number',
        displayOptions: {
          show: {
            contentType: ['text'],
          },
        },
        typeOptions: {
          minValue: 0,
          maxValue: 2,
          numberStepSize: 0.1,
        },
        default: 0.7,
        description: 'Controls randomness in the output (0 = deterministic, 2 = very random)',
      },

      // Image options
      {
        displayName: 'Image Model',
        name: 'imageModel',
        type: 'options',
        displayOptions: {
          show: {
            contentType: ['image'],
          },
        },
        options: [
          {
            name: 'FLUX.1 Schnell (Ultra Fast)',
            value: 'fal-ai/flux/schnell',
          },
          {
            name: 'FLUX.1 Dev (Fast)',
            value: 'fal-ai/flux/dev',
          },
          {
            name: 'FLUX.1 Pro (Best Quality)',
            value: 'fal-ai/flux-pro',
          },
          {
            name: 'Stable Diffusion 3.5 Large',
            value: 'fal-ai/stable-diffusion-v35-large',
          },
          {
            name: 'Recraft V3 (Design)',
            value: 'fal-ai/recraft-v3',
          },
        ],
        default: 'fal-ai/flux/schnell',
        description: 'fal.ai model to use for image generation',
      },
      {
        displayName: 'Number of Images',
        name: 'numImages',
        type: 'number',
        displayOptions: {
          show: {
            contentType: ['image'],
          },
        },
        typeOptions: {
          minValue: 1,
          maxValue: 4,
        },
        default: 1,
        description: 'How many images to generate',
      },
      {
        displayName: 'Image Width',
        name: 'imageWidth',
        type: 'number',
        displayOptions: {
          show: {
            contentType: ['image'],
          },
        },
        default: 1024,
        description: 'Width of generated image in pixels',
      },
      {
        displayName: 'Image Height',
        name: 'imageHeight',
        type: 'number',
        displayOptions: {
          show: {
            contentType: ['image'],
          },
        },
        default: 1024,
        description: 'Height of generated image in pixels',
      },

      // Video options
      {
        displayName: 'Video Model',
        name: 'videoModel',
        type: 'options',
        displayOptions: {
          show: {
            contentType: ['video'],
          },
        },
        options: [
          {
            name: 'Kling v1.5 Standard',
            value: 'fal-ai/kling-video/v1.5/standard/text-to-video',
          },
          {
            name: 'Kling v1.5 Pro',
            value: 'fal-ai/kling-video/v1.5/pro/text-to-video',
          },
          {
            name: 'Hunyuan Video',
            value: 'fal-ai/hunyuan-video',
          },
          {
            name: 'MiniMax Video',
            value: 'fal-ai/minimax-video',
          },
        ],
        default: 'fal-ai/kling-video/v1.5/standard/text-to-video',
        description: 'fal.ai model to use for video generation',
      },
      {
        displayName: 'Duration (seconds)',
        name: 'duration',
        type: 'number',
        displayOptions: {
          show: {
            contentType: ['video'],
          },
        },
        typeOptions: {
          minValue: 5,
          maxValue: 10,
        },
        default: 5,
        description: 'Duration of the generated video in seconds',
      },
      {
        displayName: 'Aspect Ratio',
        name: 'aspectRatio',
        type: 'options',
        displayOptions: {
          show: {
            contentType: ['video'],
          },
        },
        options: [
          {
            name: '16:9 (Landscape)',
            value: '16:9',
          },
          {
            name: '9:16 (Portrait)',
            value: '9:16',
          },
          {
            name: '1:1 (Square)',
            value: '1:1',
          },
        ],
        default: '16:9',
        description: 'Aspect ratio of the generated video',
      },

      // Common options
      {
        displayName: 'Timeout (seconds)',
        name: 'timeout',
        type: 'number',
        default: 300,
        description: 'Maximum time to wait for generation to complete',
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
          const contentType = this.getNodeParameter('contentType', itemIndex) as string;
          const prompt = this.getNodeParameter('prompt', itemIndex) as string;
          const timeout = this.getNodeParameter('timeout', itemIndex, 300) as number;

          // Build workflow input based on content type
          let workflowInput: any = {
            prompt,
            type: contentType,
            options: {},
          };

          if (contentType === 'text') {
            workflowInput.options.model = this.getNodeParameter('textModel', itemIndex);
            workflowInput.options.temperature = this.getNodeParameter('temperature', itemIndex);
            const systemPrompt = this.getNodeParameter('systemPrompt', itemIndex, '') as string;
            if (systemPrompt) {
              workflowInput.options.systemPrompt = systemPrompt;
            }
          } else if (contentType === 'image') {
            workflowInput.options.model = this.getNodeParameter('imageModel', itemIndex);
            workflowInput.options.numImages = this.getNodeParameter('numImages', itemIndex);
            const width = this.getNodeParameter('imageWidth', itemIndex);
            const height = this.getNodeParameter('imageHeight', itemIndex);
            workflowInput.options.imageSize = { width, height };
          } else if (contentType === 'video') {
            workflowInput.options.model = this.getNodeParameter('videoModel', itemIndex);
            workflowInput.options.duration = this.getNodeParameter('duration', itemIndex);
            workflowInput.options.aspectRatio = this.getNodeParameter('aspectRatio', itemIndex);
          }

          // Generate workflow ID
          const workflowId = `content-gen-${contentType}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

          // Start dynamic dispatcher workflow
          // This workflow will spawn child workflows based on contentType parameter
          const handle = await client.workflow.start('dynamicContentGenerationWorkflow', {
            taskQueue,
            workflowId,
            args: [{
              contentType: workflowInput.type,
              prompt: workflowInput.prompt,
              options: workflowInput.options,
            }],
          });

          // Wait for result with timeout
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Content generation timeout')), timeout * 1000)
          );

          const resultPromise = handle.result();
          const result = await Promise.race([resultPromise, timeoutPromise]);

          returnData.push({
            json: {
              workflowId: handle.workflowId,
              contentType,
              prompt,
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
