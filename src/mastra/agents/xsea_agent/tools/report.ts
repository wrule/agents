import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { exactSearch } from '../utils';

export const 获取测试报告详情工具 = createTool({
  id: 'get-report-detail',
  description: `
当需要 查询|解释|分析 某个测试报告的时候调用此工具
  `.trim(),
  inputSchema: z.object({
    query: z.string().describe('测试报告的查询短语，自动生成'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    reportDetail: z.any().optional().describe('测试报告的详细信息'),
  }),
  execute: async ({ context, resourceId: cookie }) => {
    console.log('获取测试报告详情工具 ->', context);
    const report = await exactSearch(context.query, 'REPORT', cookie);
    if (report.confusion) {
      return {
        success: false,
        prompt: report.confusion,
      };
    }
    return {
      success: true,
      prompt: '向用户解释此功能暂未开发',
    };
  },
});
