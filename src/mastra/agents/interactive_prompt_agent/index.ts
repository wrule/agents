import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { Memory } from '@mastra/memory';

export const interactive_prompt_agent = new Agent({
  name: '交互式Prompt生成',
  instructions: `
# 你是一个完美的Prompt生成器

## 你的主要任务是监视用户与另一个AI助手的对话，并且在这个过程中总结出适合用户需求的Prompt
  `.trim(),
  memory: new Memory({
    options: {
      lastMessages: 50,
    },
  }),
  model: main,
});
