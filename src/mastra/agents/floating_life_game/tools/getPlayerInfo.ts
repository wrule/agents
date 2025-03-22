import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import fakeVoid from '../../../utils/fakeVoid';
import { outputSchemaBase } from '../../../utils/outputSchema';
import toolExecute from '../../../utils/toolExecute';

const playInfo = {
  name: '',
  health: 100,
  money: 100,
  debt: 100000,
  days: 1,
};

export const getPlayerInfo = createTool({
  id: 'getPlayerInfo',
  description: `
当需要获取玩家信息时，调用此工具
  `.trim(),
  inputSchema: fakeVoid,
  outputSchema: z.object({
    ...outputSchemaBase,
    name: z.string().describe('玩家姓名').optional(),
    health: z.number().describe('健康值').optional(),
    money: z.number().describe('金钱值（元）').optional(),
    debt: z.number().describe('负债数量（元）').optional(),
    days: z.number().describe('漂泊天数').optional(),
  }),
  execute: async ({ context }) => {
    return await toolExecute(async (context) => {
      return {
        success: true,
        ...playInfo,
      };
    }, context, 'getPlayerInfo');
  },
});

export const sleep = createTool({
  id: 'sleep',
  description: `
在以下情况调用此工具
- 当游戏之中的一天结束时
- 玩家主动想睡觉时
- 玩家被击晕时
  `.trim(),
  inputSchema: fakeVoid,
  outputSchema: z.object({
    ...outputSchemaBase,
  }),
  execute: async ({ context }) => {
    return await toolExecute(async () => {
      playInfo.debt = Math.floor(playInfo.debt * 1.01);
      return {
        success: true,
        prompt: '结合上下文简短告诉玩家新的一天过去了',
      };
    }, context, 'sleep');
  },
});
