import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const xsky_agent_v1 = new Agent({
  name: 'XSky智能体V1',
  instructions: `

  `.trim(),
  model: main,
});
