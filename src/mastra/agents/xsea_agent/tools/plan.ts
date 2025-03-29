import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { exactSearch, toolExecute } from '../utils';
import { thttp } from '../api/http';

const envId = '822313712173449216';

export const 创建计划工具 = createTool({
  id: 'create-plan',
  description: `
当需要创建一个新的计划的时候，调用此工具
  `.trim(),
  inputSchema: z.object({
    query: z.string().describe('所属产品的查询短语，自动生成'),
    name: z.string().min(1).max(20).describe('计划名称，由用户提供'),
    purpose: z.string().min(1).max(100).describe('此计划希望实现的测试目标，由用户提供'),
    start: z.string().describe('计划的开始日期，YYYY-MM-DD格式'),
    end: z.string().describe('计划的结束日期，YYYY-MM-DD格式'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    url: z.string().optional().describe('新计划在平台上的Url，需要以makrdown的形式呈现链接，并且填入planName，如[planName](http://xxx)'),
  }),
  execute: async ({ context, resourceId: cookie }) => {
    return await toolExecute('创建计划工具', context, async (context) => {
      const product = await exactSearch(context.query, 'PRODUCT', cookie);
      if (product.confusion) {
        return {
          success: false,
          prompt: product.confusion,
        };
      }
      const { data } = await thttp(cookie).post(`xsea/plan/v2/addPlan`, {
        name: context.name,
        planPurpose: context.purpose,
        planRange: {
          start: context.start,
          end: context.end,
        },
        version: '1.0',
        workspaceId: product.first.productId,
      });
      return {
        success: true,
        url: `${process.env.XSEA}/${envId}/product/business/${product.first.productId}/plan/detail?id=${data.object}`,
      };
    });
  },
});

export const 获取计划详情工具 = createTool({
  id: 'get-plan-detail',
  description: `
当需要 查询|解释|分析 某个计划的时候调用此工具
  `.trim(),
  inputSchema: z.object({
    query: z.string().describe('计划的查询短语，自动生成'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    reportDetail: z.any().optional().describe('计划的详细信息'),
  }),
  execute: async ({ context, resourceId: cookie }) => {
    console.log('获取计划详情工具 ->', context);
    const report = await exactSearch(context.query, 'PLAN', cookie);
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
