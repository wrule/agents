import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const user_agent = new Agent({
  name: '用户智能体',
  instructions: `
只对用户说你好即可，避免回答其他问题
  `.trim(),
  model: main,
});
