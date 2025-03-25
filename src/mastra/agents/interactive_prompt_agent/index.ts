import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { Memory } from '@mastra/memory';

export const interactive_prompt_agent = new Agent({
  name: '交互式Prompt生成',
  instructions: `
  `.trim(),
  memory: new Memory({
    options: {
      lastMessages: 50,
    },
  }),
  model: main,
});
