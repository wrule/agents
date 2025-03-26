import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { exactSearch, toolExecute } from '../utils';
import http, { thttp } from '../api/http';

const envId = '822313712173449216';

export const 创建目标工具 = createTool({
  id: 'create-goal',
  description: `
当需要创建一个目标，调用此工具
  `.trim(),
  inputSchema: z.object({
    planQuery: z.string().describe('所属计划的查询短语，自动生成'),
    scriptQueryList: z.array(z.string().describe('目标绑定的脚本的查询短语，自动生成')),
    name: z.string().min(1).max(20).describe('目标名称，由用户提供'),
    type: z.number().min(1).max(4).describe(`
目标类型的序号，可以是以下类型，由用户提供
1. 基准场景
2. 单场景
3. 混合场景
4. 稳定性场景
    `.trim()),
    curve: z.array(z.object({
      incConc: z.number().describe('递增并发，正数（并发上升），负数（并发下降）'),
      incTime: z.number().min(0).describe('递增用时（秒）'),
      duration: z.number().min(0).describe('处在当前并发水平下的维持时长（秒）'),
    })).min(1).describe(`
压测流量趋势，为多个并发段构成的曲线，根据用户描述自动生成
- 确保根据用户描述的场景生成准确的曲线
- 避免询问用户递增并发值
- 避免询问用户递增用时
- 避免询问用户处在当前并发水平下的维持时长
    `),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    url: z.string().optional().describe('新目标在平台上的Url，需要以makrdown的形式呈现链接，并且填入goalName，如[goalName](http://xxx)'),
  }),
  execute: async ({ context, threadId }) => {
    return await toolExecute('创建目标工具', context, async (context) => {
      const type = ['BASELINE', 'SINGLE_USER_TREND', 'MIX_USER_TREND', 'STABLE_TIME_TREND'][context.type - 1];
      const plan = await exactSearch(context.planQuery, 'PLAN', threadId);
      if (plan.confusion) {
        return {
          success: false,
          prompt: plan.confusion,
        };
      }
      const sceneScriptIds: string[] = [];
      for (let i = 0; i < context.scriptQueryList.length; ++i) {
        const query = context.scriptQueryList[i];
        const script = await exactSearch(query, 'SCRIPT', threadId);
        if (script.confusion) {
          return {
            success: false,
            prompt: script.confusion,
          };
        }
        sceneScriptIds.push(script.first.scriptId);
      }
      const { data } = await thttp(threadId).post(`xsea/plan/goal/save`, {
        envId,
        name: context.name,
        type: type,
        planId: plan.first.planId,
        sceneScriptIds: sceneScriptIds,
        syncLoops: false,
        syncModelConf: false,
        syncRps: false,
        syncScriptConf: true,
        syncThinkTime: false,
        syncTransactionPercent: false,
      });

      //#region 构造并发曲线
      const sceneStrategies: any[] = [];
      let conc = 0, maxConc = 0;
      context.curve.forEach((item, index) => {
        sceneStrategies.push({
          index: (index * 2) + 1,
          period: item.incTime,
          userNum: item.incConc,
        });
        sceneStrategies.push({
          index: (index * 2) + 2,
          period: item.duration,
          userNum: 0,
        });
        conc += item.incConc;
        if (conc > maxConc) {
          maxConc = conc;
        }
      });

      const goalRes = await thttp(threadId).post(`xsea/plan/goal/list`, {
        planId: plan.first.planId,
        pageNum: 1,
        pageSize: 1,
        condition: { name: context.name },
      });
      const targetGoal = goalRes.data.object?.list?.[0] ?? { };
      const { data: strategyData } = await thttp(threadId).post(
        `xsea/scene/script/queryStrategy`,
        { id: targetGoal.sceneId },
      );
      const object = strategyData.object ?? { };
      object.sceneScriptConfModelList?.forEach((item: any) => {
        item.sceneStrategies = sceneStrategies;
        item.threadNum = maxConc;
      });
      await thttp(threadId).post(`xsea/scene/script/modifyStrategy`, object);
      //#endregion

      return {
        success: true,
        url: `http://10.10.30.103:8081/${envId}/product/business/${plan.first.productId}/plan/target?id=${plan.first.planId}&goalId=${data.object}`,
      };
    });
  },
});

export const 获取目标详情工具 = createTool({
  id: 'get-goal-detail',
  description: `
当需要 查询|解释|分析 某个目标的时候调用此工具
  `.trim(),
  inputSchema: z.object({
    query: z.string().describe('目标的查询短语，自动生成'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    goalDetail: z.any().optional().describe('目标的详细信息'),
    strategyDetail: z.any().optional().describe('目标绑定的脚本的发压策略信息'),
  }),
  execute: async ({ context, threadId }) => {
    console.log('获取目标详情工具 ->', context);
    const goal = await exactSearch(context.query, 'GOAL', threadId);
    if (goal.confusion) {
      return {
        success: false,
        prompt: goal.confusion,
      };
    }
    const [{ data: goalDetailData }, { data: strategyDetailData }] = await Promise.all([
      thttp(threadId).post(`xsea/scene/querySceneDetail`, {
        envId,
        sceneId: goal.first.sceneId,
        workspaceId: goal.first.workspaceId,
      }),
      thttp(threadId).post(`xsea/scene/script/queryStrategy`, {
        id: goal.first.goalId,
      }),
    ]);
    return {
      success: true,
      goalDetail: goalDetailData.object,
      strategyDetail: strategyDetailData.object,
    };
  },
});

export const 压测目标工具 = createTool({
  id: 'stress-testing-goal',
  description: `
当需要压测某个目标的时候调用此工具
  `.trim(),
  inputSchema: z.object({
    query: z.string().describe('目标的查询短语，自动生成'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    url: z.string().optional().describe('压测执行页的url，需要以markdown url的形式输出给用户，如[点我查看压测执行页面](url)'),
  }),
  execute: async ({ context, threadId }) => {
    return await toolExecute('压测目标工具', context, async (context) => {
      const goal = await exactSearch(context.query, 'GOAL', threadId);
      if (goal.confusion) {
        return {
          success: false,
          prompt: goal.confusion,
        };
      }

      const goalRes = await thttp(threadId).post(`xsea/plan/goal/list`, {
        planId: goal.first.planId,
        pageNum: 1,
        pageSize: 1,
        condition: { name: goal.first.goalName },
      });
      const targetGoal = goalRes.data.object?.list?.[0] ?? { };
      goal.first.sceneId = targetGoal.sceneId;

      console.log(goal.first);
      const { data: execData } = await thttp(threadId).post(`xsea/sceneExec/start`, {
        envId,
        flag: false,
        goalId: goal.first.goalId,
        id: goal.first.sceneId,
        planId: goal.first.planId,
        workspaceId: goal.first.productId,
      });
      const success = execData.success && typeof execData.object === 'string';
      if (!success) {
        throw new Error(JSON.stringify(execData.object));
      }
      return {
        success: true,
        url: `http://10.10.30.103:8081/${envId}/product/business/${goal.first.productId}/plan/targetExecute?sceneExecId=${execData.object}`,
      };
    });
  },
});
