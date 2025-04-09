import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { toolExecute } from '../../xsea_agent/utils';
import { thttp } from '../api/http';

export const 查询演练任务工具 = createTool({
  id: 'query-task',
  description: `
当需要查询演练任务的时候，调用此工具
  `.trim(),
  inputSchema: z.object({
    keyword: z.string().default('').describe(`
模糊搜索关键字
- 不传查所有
    `).optional(),
    pageNum: z.number().min(1).default(1).describe(`
页码
- 自动生成
- 避免询问用户页码
- 默认情况下一页十行
    `).optional(),
    findOne: z.boolean().default(false).describe(`
是否为精准查询某一个演练任务
- 自动生成
- 避免询问用户是否精准查询某一个演练任务
    `),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    columns: z.array(z.string().describe('列名')).optional().describe('表头信息'),
    dataSource: z.array(z.object({
      id: z.string().describe('taskId，演练任务Id'),
      name: z.string().describe('演练名称'),
      metricDesc: z.string().describe('演练指标'),
      deployTypeName: z.string().describe('部署类型'),
    })).describe('表格内容数据').optional(),
    total: z.number().describe('当前查询条件下的结果总数').optional(),
  }),
  execute: async ({ context, resourceId: cookie }) => {
    return await toolExecute('查询演练任务工具', context, async (context) => {
      const { data } = await thttp('sys_token=4664a648c5fa4313872f95c3d39f6006; sys_env_id=694456073411100672; sys_env_code=Init').post(`xchaos/task/getTaskList`, {
        name: context.keyword,
        pageNumber: (context.pageNum ?? 1) - 1,
        pageSize: 10,
        professionalId: null,
        taskType: 'CUSTOM',
      });
      const list: any[] = (data.object?.content ?? []).map((item: any) => ({
        id: item.id,
        name: item.name,
        metricDesc: item.metricDesc,
        deployTypeName: item.deployTypeName,
      }));
      return {
        success: true,
        prompt: context.findOne ? (
          () => {
            if (list.length === 0) {
              return `没有搜索到任何信息，请引导用户补充更多搜索关键字`;
            } else if (list.length === 1) {
              return `已经精准匹配到目标，请留意id以供之后需要的时候使用`;
            } else {
              return `存在多个匹配项目，请以markdown table输出表格，引导用户选择`;
            }
          }
        )() : '以markdown table输出表格，简单指引用户分页操作',
        columns: ['演练名称', '部署类型', '演练指标'],
        dataSource: list,
        total: Number(data.object?.totalElements),
      };
    });
  },
});

export const 执行演练任务工具 = createTool({
  id: 'execute-task',
  description: `
当需要执行某个演练任务的时候，调用此工具
- 避免询问用户演练任务Id
- 引导用户描述演练任务名称
- 调用 查询演练任务工具 并且 findOne 设为 true，进行查询
- 根据查询结果获取taskId
  `.trim(),
  inputSchema: z.object({
    taskId: z.string().describe(`taskId，演练任务Id`)
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
  }),
  execute: async ({ context, resourceId: cookie }) => {
    return await toolExecute('执行演练任务工具', context, async (context) => {
      const { data } = await thttp('sys_token=4664a648c5fa4313872f95c3d39f6006; sys_env_id=694456073411100672; sys_env_code=Init').post(`xchaos/taskinstance/executeTask`, {
        taskId: context.taskId,
        ignore: false,
      });
      return {
        success: true,
      };
    });
  },
});

export const 创建任务工具 = createTool({
  id: 'create-task',
  description: `
当需要创建一个[演练任务|故障演练]的时候，调用此工具
  `.trim(),
  inputSchema: z.object({
    name: z.string().describe('演练任务名称'),
    description: z.string().describe('演练任务描述').optional(),
    validIgnore: z.boolean().describe('失效自动忽略').optional(),
    applicationInstanceUrls: z.array(z.string()).describe('需要演练的集群'),
    containerInstanceUrls: z.array(z.string()).describe('需要演练的主机列表'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
  }),
  execute: async ({ context, resourceId: cookie }) => {
    return await toolExecute('创建目标工具', context, async (context) => {
      return {
        success: true,
      };
    });
  },
});
