import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const ts_prompt_agent = new Agent({
  name: 'TSPromptAgent',
  instructions: `

  `.trim(),
  model: main,
});
