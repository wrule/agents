import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { thttp } from '../api/http';
import { exactSearch, toolExecute } from '../utils';

export const 创建产品工具 = createTool({
  id: 'create-product',
  description: `
当需要创建产品时，调用此工具
  `.trim(),
  inputSchema: z.object({
    name: z.string().max(20).describe('产品名称，由用户提供'),
    desc: z.string().max(100).describe('产品描述，由用户提供'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    url: z.string().optional().describe('新产品在平台上的url，需要以makrdown url的形式填入productName和url，如[productName](url)'),
  }),
  execute: async ({ context, resourceId: cookie }) => {
    return await toolExecute('创建产品工具', context, async (context) => {
      const { data } = await thttp(cookie).post(`paas/products`, {
        productName: context.name,
        productDesc: context.desc,
      });
      const { object } = data;
      return {
        success: true,
        url: `${process.env.XSEA}/822313712173449216/product/business/${object.id}/overview?tab=0`,
      };
    });
  },
});

export const 获取产品详情工具 = createTool({
  id: 'get-product-detail',
  description: `
当需要 查询|解释|分析 某个产品的时候调用此工具
  `.trim(),
  inputSchema: z.object({
    query: z.string().describe('产品的查询短语，自动生成'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    reportDetail: z.any().optional().describe('产品的详细信息'),
  }),
  execute: async ({ context, resourceId: cookie }) => {
    console.log('获取产品详情工具 ->', context);
    const report = await exactSearch(context.query, 'PRODUCT', cookie);
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
