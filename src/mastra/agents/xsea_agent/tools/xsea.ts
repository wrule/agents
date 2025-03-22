import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { fuzzySearch, toolExecute, XSeaName, XSeaNameType } from '../utils';

const ObjectTypes = [
  '产品',
  '脚本|JMeter|Gatling|Shell',
  '计划',
  '目标',
  '压测记录',
  '测试报告',
  '定时任务',
];

export const XSea对象查询工具 = createTool({
  id: 'query-xsea-objects',
  description: '用户主动询问或者请求列出XSea之中的对象时，调用此工具',
  inputSchema: z.object({
    type: z.number().min(1).max(ObjectTypes.length)
      .describe(`
要查询的对象的类型序号
${ObjectTypes.map((type, index) => `${index + 1}. ${type}`).join('\n')}
      `.trim()),
    query: z.string().describe('根据上下文总结的精准的查询短语，需要包含对象的上级信息'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('输出规范'),
    table: z.array(z.any()).optional().describe('表格数据'),
    columns: z.array(z.string().describe('列名')).optional().describe('列名列表'),
  }),
  execute: async ({ context }) => {
    return await toolExecute('XSea对象查询工具', context, async (context) => {
      const type = ObjectTypes[context.type - 1].split('|')[0];
      const result = await fuzzySearch(context.query || type, XSeaNameType[type as XSeaName]);
      return {
        success: true,
        prompt: `
table输出规则
- 确保始终使用markdown table输出table
- 确保最多输出10行
- 避免输出超过10行
- 如果需要输出脚本类型，确保值为 JMeter|Gatling|Shell|SeaMeter 其中之一
        `.trim(),
        table: result,
        columns: {
          产品: ["序号", "产品名称"],
          脚本: ["序号", "脚本名称", "脚本类型", "所属产品"],
          计划: ["序号", "计划名称", "所属产品"],
          目标: ["序号", "目标名称", "所属计划", "所属产品"],
          压测记录: ["序号", "记录名称", "所属计划", "所属产品"],
          测试报告: ["序号", "报告名称", "所属计划", "所属产品"],
          定时任务: ["序号", "任务名称", "所属计划", "所属产品"],
        }[type]!,
      };
    });
  },
});
