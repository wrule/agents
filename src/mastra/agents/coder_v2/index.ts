import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    introduction: z.string().max(200).describe('本次代码修改的介绍'),
    actions: z.array(
      z.object({
        action: z.number().min(1).max(3).describe(`
操作类型序号
1. 在第n行之前插入一个内容为c的新行
2. 把第n行的内容修改为c
3. 删第n行
        `.trim()),
        line: z.number().min(1).describe('行号，代表操作第n行'),
        content: z.string().optional().describe(`
行内容
- 如果操作类型为删除（t为3），则此字段不存在
        `.trim()),
      }),
    ),
    summary: z.string().max(200).describe('本次代码修改的总结'),
  }),
);

export const coder_v2 = new Agent({
  name: '编码器V2',
  instructions: `
## 确保输出一下格式JSON

${parser.getFormatInstructions()}
  `.trim(),
  model: main,
});
