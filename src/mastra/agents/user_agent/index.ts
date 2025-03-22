import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

const createAgent = (...args: ConstructorParameters<typeof Agent>) => {
  return new Agent(...args);
}

export const user_agent = new Agent({
  name: '用户智能体',
  instructions: `
只对用户说你好即可，避免回答其他问题
  `.trim(),
  model: main,
});
