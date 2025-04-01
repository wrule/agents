import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    i: z.string().max(200).describe('introduction，本轮代码修改的介绍'),
    a: z.array(
      z.object({
        t: z.number().min(1).max(3).describe(`
操作类型的序号
1. 在第n行之前插入一个新行，内容为c
2. 把第n行的内容修改为c
3. 删第n行
        `.trim()),
        n: z.number().min(1).describe('行号，代表操作第n行'),
        c: z.string().optional().describe(`
行内容
- 如果操作类型为删除（t为3），则此字段不存在
        `.trim()),
      }),
    ).describe('actions，本轮代码修改的操作序列'),
    s: z.string().max(200).describe('summary，本轮代码修改的总结'),
  }).describe('用于定义一轮代码修改的对象'),
);

export const coder_v2 = new Agent({
  name: '编码器V2',
  instructions: `
## 确保输出一下格式JSON

${parser.getFormatInstructions()}
  `.trim(),
  model: main,
});
