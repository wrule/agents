import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { HttpListInstructions } from './httpZod';
import main from '../../../models/main';

export const coder_http = new Agent({
  name: 'http编码器',
  instructions: `
# 你是一个JSON输出程序

## 你的工作是输出HTTP请求的JSON数据

${HttpListInstructions}
  `.trim(),
  memory: new Memory({
    options: {
      lastMessages: 100,
    },
  }),
  model: main,
});
