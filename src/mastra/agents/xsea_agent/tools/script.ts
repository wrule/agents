import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { thttp } from '../api/http';
import dayjs from 'dayjs';
import { exactSearch, toolExecute } from '../utils';

export const 创建脚本工具 = createTool({
  id: 'create-script',
  description: '当需要创建一个新的脚本时，调用此工具',
  inputSchema: z.object({
    query: z.string().describe('所属产品的查询短语，自动生成'),
    name: z.string().min(1).max(20).describe('脚本名称，由用户提供'),
    type: z.enum(['JMeter', 'Gatling', 'Shell', 'SeaMeter']).describe('脚本类型，由用户提供'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    url: z.string().optional().describe('新脚本在平台上的url，确保输出遵循[scriptName](url)的makrdown格式，确保替换成为真实值'),
  }),
  execute: async ({ context, threadId }) => {
    return await toolExecute('创建脚本工具', context, async (context) => {
      let type = context.type.toLowerCase();
      if (type === 'SEAMETER') {
        type = 'XSEA';
      }
      const product = await exactSearch(context.query, 'PRODUCT', threadId);
      if (product.confusion) {
        return {
          success: false,
          prompt: product.confusion,
        };
      }
      const { data } = await thttp(threadId).post(`xsea/script/add`, {
        level: 1,
        parentId: '-1',
        type,
        createType: type,
        scriptTypeVO: type,
        name: context.name,
        workspaceId: product.first.productId,
      });
      return {
        success: true,
        url: `http://10.10.30.103:8081/${envId}/product/business/${product.first.productId}/script?scriptId=${data.object}`,
        prompt: `一定要提醒用户如果需要编写脚本代码，需要在平台页面上唤起对应专家实现`,
      };
    });
  },
});

const envId = '822313712173449216';

export const 快速压测工具 = createTool({
  id: 'quick-stress-testing-script',
  description: `
当需要 直接压测某个或者多个脚本的时候，调用此工具
  `.trim(),
  inputSchema: z.object({
    queryList: z.array(z.string().describe('脚本查询短语，自动生成')),
    seconds: z.number().describe(`压测持续秒数，由用户提供`),
    concurrency: z.number().describe(`需要达到的最大并发数，由用户提供`),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    execUrl: z.string().optional().describe('如果压测执行成功，此为压测执行页面的url，需要以markdown url的形式输出给用户，如[点我查看压测执行页面](execUrl)'),
    sceneUrl: z.string().optional().describe('当前压测场景的url，需要以markdown url的形式输出给用户，如[当前压测场景](sceneUrl)'),
  }),
  execute: async ({ context, threadId }) => {
    return await toolExecute('快速压测工具', context, async (context) => {
      let productId = '';
      const scriptIds: string[] = [];
      for (let i = 0; i < context.queryList.length; ++i) {
        const query = context.queryList[i];
        const target = await exactSearch(query, 'SCRIPT', threadId);
        if (target.confusion) {
          return {
            success: false,
            prompt: target.confusion,
          };
        }
        scriptIds.push(target.first.scriptId);
        productId = target.first.productId;
      }
      console.log(productId, scriptIds);
  
      const planName = '快速压测归档计划';
      let targetPlan: any = null;
      while (targetPlan?.name !== planName) {
        const planListRes = await thttp(threadId).post(`xsea/plan/v2/planList`, {
          workspaceId: productId,
          pageNum: 1,
          pageSize: 1,
          condition: { name: planName },
          name: planName,
        });
        targetPlan = planListRes.data.object?.list?.[0];
        if (targetPlan?.name !== planName) {
          await thttp(threadId).post(`xsea/plan/v2/addPlan`, {
            name: planName,
            planPurpose: planName,
            planRange: {
              start: dayjs().format('YYYY-MM-DD'),
              end: dayjs().add(100, 'years').format('YYYY-MM-DD'),
            },
            version: '1.0',
            workspaceId: productId,
          });
        }
      }
      const goalName = `快速压测 ${dayjs().format('MM_DD_HH_mm_ss_SSS')}`;
      await thttp(threadId).post(`xsea/plan/goal/save`, {
        type: 'BASELINE',
        name: goalName,
        planId: targetPlan.id,
        sceneScriptIds: scriptIds,
        syncLoops: false,
        syncModelConf: false,
        syncRps: false,
        syncScriptConf: true,
        syncThinkTime: false,
        syncTransactionPercent: false,
        envId,
      });
      const goalRes = await thttp(threadId).post(`xsea/plan/goal/list`, {
        planId: targetPlan.id,
        pageNum: 1,
        pageSize: 1,
        condition: { name: goalName },
      });
      const targetGoal = goalRes.data.object?.list?.[0];
  
      //#region 构造并发曲线
      const { data: strategyData } = await thttp(threadId).post(
        `xsea/scene/script/queryStrategy`,
        { id: targetGoal.sceneId },
      );
      const object = strategyData.object ?? { };
      object.sceneScriptConfModelList?.forEach((item: any) => {
        item.sceneStrategies = generateLoadCurve(context.seconds, context.concurrency);
        item.threadNum = context.concurrency;
      });
      await thttp(threadId).post(`xsea/scene/script/modifyStrategy`, object);
      //#endregion
  
      const { data: execData } = await thttp(threadId).post(`xsea/sceneExec/start`, {
        envId,
        flag: false,
        goalId: targetGoal.id,
        id: targetGoal.sceneId,
        planId: targetPlan.id,
        workspaceId: productId,
      });
      console.log('压测', execData);
      const success = execData.success && typeof execData.object === 'string';
      return {
        success: !!(success),
        sceneUrl: `http://10.10.30.103:8081/${envId}/product/business/${productId}/plan/target?id=${targetPlan.id}&goalId=${targetGoal.id}`,
        ...(success ? {
          execUrl: `http://10.10.30.103:8081/${envId}/product/business/${productId}/plan/targetExecute?sceneExecId=${execData.object}`,
        } : { }),
        ...(!success ? {
          errorInfo: execData,
        } : { }),
      };
    });
  },
});

export const 获取脚本详情工具 = createTool({
  id: 'get-script-detail',
  description: `
当需要 查询|解释|分析 某个脚本的时候调用此工具获取脚本详细信息
  `.trim(),
  inputSchema: z.object({
    query: z.string().describe('脚本的描述短语，自动生成'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
    scriptDetail: z.any().optional().describe('脚本详情信息'),
  }),
  execute: async ({ context, threadId }) => {
    return await toolExecute('获取脚本详情工具', context, async (context) => {
      const script = await exactSearch(context.query, 'SCRIPT', threadId);
      if (script.confusion) {
        return {
          success: false,
          prompt: script.confusion,
        };
      }
      const { data } = await thttp(threadId).post(`xsea/script/queryDetail`, {
        workspaceId: script.first.productId,
        scriptId: script.first.scriptId,
      });
      return {
        success: true,
        scriptDetail: {
          ...script.first,
          scriptCode: data.object.content,
        },
      };
    });
  },
});

function generateLoadCurve(durationSeconds: number, maxConcurrency: number) {
  const result: {
    index: number,
    period: number,
    userNum: number,
  }[] = [];
  const segments = 10;
  let time = 0, concurrency = 0, index = 0;
  for (let i = 1; i <= segments; ++i) {
    const newTime = Math.floor((durationSeconds / segments) * i);
    const newConcurrency = Math.floor((maxConcurrency / segments) * i);
    const diffTime = newTime - time;
    const riseTime = Math.floor(diffTime / 3);
    const diffConcurrency = newConcurrency - concurrency;
    result.push({
      index: ++index,
      period: riseTime,
      userNum: diffConcurrency,
    });
    result.push({
      index: ++index,
      period: diffTime - riseTime,
      userNum: 0,
    });
    time = newTime;
    concurrency = newConcurrency;
  }
  return result;
}
