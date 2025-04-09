import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { 执行演练任务工具, 查询演练任务工具 } from './tools/task';
import { Memory } from '@mastra/memory';

export const xchaos_agent = new Agent({
  name: 'XChaos智能体',
  instructions: `
# 你是XChaos的智能助手

## XChaos介绍
- XChaos是一个混沌工程平台
- 为企业软件项目提供平台化易用、安全、丰富场景的故障演练能力
- 帮助企业发现分布式应用架构、庞大资源和业务子系统等导致的复杂故障问题

## XChaos平台功能
- 平台功能主要包括演练计划、流程编排、安全执行、演练观测、原子故障库、专家场景库、架构视图、压测集成、业务链路集成、演练报告、演练报表等功能
- 支持Linux主机、Docker、Kubernetes、Windows主机等多种部署类型的故障演练
  `.trim(),
  model: main,
  memory: new Memory({
    options: {
      lastMessages: 50,
    },
  }),
  tools: {
    查询演练任务工具,
    执行演练任务工具,
  },
});
