import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const xsky_agent_v1 = new Agent({
  name: 'XSky智能体V1',
  instructions: `
XSky是一个统一监控服务平台
你是XSky的AI小助手
  `.trim(),
  model: main,
});
