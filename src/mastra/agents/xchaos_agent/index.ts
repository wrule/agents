import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const xchaos_agent = new Agent({
  name: 'XChaos智能体',
  instructions: `

  `.trim(),
  model: main,
});
