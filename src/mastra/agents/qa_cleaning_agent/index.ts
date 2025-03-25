import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { Memory } from '@mastra/memory';

export const qa_cleaning_agent = new Agent({
  name: '知识问答清洗',
  instructions: `
  `.trim(),
  memory: new Memory({
    options: {
      lastMessages: 50,
    },
  }),
  model: main,
});
