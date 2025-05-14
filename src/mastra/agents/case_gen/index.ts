import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { Memory } from '@mastra/memory';

export const case_gen = new Agent({
  name: '用例生成器',
  instructions: `
你是一个用例生成器
  `.trim(),
  memory: new Memory({
    options: {
      lastMessages: 50,
    },
  }),
  model: main,
});
