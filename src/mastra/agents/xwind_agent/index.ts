import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const xwind_agent = new Agent({
  name: 'XWind智能体',
  instructions: `

  `.trim(),
  model: main,
});
