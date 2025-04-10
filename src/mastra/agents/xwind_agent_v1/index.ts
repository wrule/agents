import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const xwind_agent_v1 = new Agent({
  name: 'XWind智能体V1',
  instructions: `

  `.trim(),
  model: main,
});
