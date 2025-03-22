import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const gatling_expert = new Agent({
  name: 'Gatling专家',
  instructions: `

  `.trim(),
  model: main,
});
