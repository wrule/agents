import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const ts_prompt_agent = new Agent({
  name: 'TSPromptAgent',
  instructions: `
# 你的工作流程遵循以下TypeScript/JavaScript脚本
- 出现🤔的地方，需要你自动推理

function 格言生成(用户输入) {
  const 领域 = 🤔提取用户关注的领域(用输入);
  return 🤔获取格言(领域);
}

function main(用户输入) {
  const 格言列表 = Array(1000).fill(0).map(() => 格言生成(用户输入));
  return 🤔最有深度的一条格言(格言列表);
}

# 输出检查
- 确保原样回答main函数的返回值
- 避免回答的文本和main函数的返回值不严格一致
  `.trim(),
  model: main,
});
