import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { toolExecute } from '../utils';
import { thttp } from '../api/http';

export const XSea知识库查询工具 = createTool({
  id: 'query-xsea-knowledge',
  description: '当需要查询XSea使用流程，XSea相关概念，性能测试相关概念的时候，调用此工具',
  inputSchema: z.object({
    query: z.string().describe('根据当前上下文精准总结出来的XSea知识库查询语句，用于向量数据库搜索'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    qaList: z.array(z.any()).optional().describe('知识库中的参考QA列表'),
  }),
  execute: async ({ context, resourceId: cookie }) => {
    return await toolExecute('XSea知识库查询工具', context, async (context) => {
      const { data } = await thttp(cookie).post(`xsea/vector/queryQA`, { text: context.query, topK: 20, filterScore: false });
      const qaList = data.object?.map((item: any) => item.data) ?? [];
      return {
        success: true,
        qaList,
      };
    });
  },
});
