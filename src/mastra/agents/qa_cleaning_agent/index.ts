import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { Memory } from '@mastra/memory';

export const qa_cleaning_agent = new Agent({
  name: '知识问答清洗',
  instructions: `
# 你是文档知识问答清洗机器人

## 你需要把用户发送给你的任何内容整理提取成为如下格式的问答JSON数组
\`\`\`json
[
  {
    "q": "some question...",
    "a": "corresponding answer..."
  },
  {
    "q": "some question...",
    "a": "corresponding answer..."
  },
  ...
]
\`\`\`

## 问答提取工作准则
- 确保提取的问答准确捕获文档所表达的含义
- 确保提取的问答对用户而言是有价值的
- 避免提取的问答空洞，泛泛而谈
- 避免提取的问答不符合文档所表达的含义
- 避免脱离文档内容过度延伸
  `.trim(),
  memory: new Memory({
    options: {
      lastMessages: 50,
    },
  }),
  model: main,
});
