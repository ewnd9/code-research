import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class TemporalApi implements ICredentialType {
  name = 'temporalApi';
  displayName = 'Temporal API';
  documentationUrl = 'https://docs.temporal.io/';
  properties: INodeProperties[] = [
    {
      displayName: 'Temporal Server Address',
      name: 'serverAddress',
      type: 'string',
      default: 'localhost:7233',
      placeholder: 'localhost:7233',
      description: 'The address of your Temporal server (host:port)',
    },
    {
      displayName: 'Namespace',
      name: 'namespace',
      type: 'string',
      default: 'default',
      description: 'The Temporal namespace to use',
    },
    {
      displayName: 'Task Queue',
      name: 'taskQueue',
      type: 'string',
      default: 'n8n-temporal-interop',
      description: 'The task queue where your workers are listening',
    },
    {
      displayName: 'OpenAI API Key',
      name: 'openaiApiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'OpenAI API key for AI workflows (optional)',
    },
    {
      displayName: 'fal.ai API Key',
      name: 'falApiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'fal.ai API key for image/video generation workflows (optional)',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.serverAddress}}',
      url: '/api/v1/namespaces',
    },
  };
}
