import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const shell_expert = new Agent({
  name: 'Shell专家',
  instructions: `

  `.trim(),
  model: main,
});
