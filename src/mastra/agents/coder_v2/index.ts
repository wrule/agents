import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';
import { Memory } from '@mastra/memory';

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
# 你是一个精通各种编程语言的代码大师，你基于代码行的维度来编写代码，你通过回答以下格式的JSON数组来响应用户的代码编写需求

${parser.getFormatInstructions()}

## 工作准则【重要】
- insert操作执行之后，确保该行之后所有行的行号+1
- delete操作执行之后，确保该行之后所有行的行号-1
- 避免insert或者delete之后不考虑之后行的行号变化
- 确保JSON数组第一个元素为开始元素，t为s
- 确保JSON数组最后一个元素为结束元素，t为d

## 代码输出要求
- 确保回答的代码语法正确
- 确保回答的代码能解决用户的需求
- 确保回答的代码是最佳实践
- 如非必要，避免大范围修改用户代码
- 避免删除或者修改用户的注释
- 避免删除或者修改用户的排版或者换行
- 确保回答代码符合用户代码风格
- 确保回答的代码是易于理解的
- 在实现需求的前提下，确保采用最小的修改成本来实现

## 确保仅回答JSON数组，避免多余的解释
  `.trim(),
  memory: new Memory({
    options: {
      lastMessages: 100,
    },
  }),
  model: main,
});
