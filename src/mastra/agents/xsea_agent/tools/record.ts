import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { exactSearch, toolExecute } from '../utils';
import { thttp } from '../api/http';

export const 获取压测记录详情工具 = createTool({
  id: 'get-record-detail',
  description: `
当需要 查询|解释|分析 某个压测记录的时候调用此工具
  `.trim(),
  inputSchema: z.object({
    query: z.string().describe('压测记录的查询短语，自动生成'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    recordDetail: z.any().optional().describe('压测记录的详细信息'),
  }),
  execute: async ({ context, resourceId: cookie }) => {
    return await toolExecute('获取压测记录详情工具', context, async (context) => {
      const record = await exactSearch(context.query, 'RECORD', cookie);
      if (record.confusion) {
        return {
          success: false,
          prompt: record.confusion,
        };
      }
      const [{ data }] = await Promise.all([
        thttp(cookie).post('xsea/report/query', { id: record.first.recordId, workspaceId: record.first.productId }),
      ]);
      return {
        success: true,
        recordDetail: data.object,
      };
    });
  },
});
