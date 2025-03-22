import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const user_agent = new Agent({
  name: '用户智能体',
  instructions: `

  `.trim(),
  model: main,
});
