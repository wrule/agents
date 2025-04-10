import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const json_http = new Agent({
  name: 'JSON_HTTP',
  instructions: `
你是HTTP
  `.trim(),
  model: main,
});
