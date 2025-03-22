import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { Memory } from '@mastra/memory';

export const touch_fish_agent = new Agent({
  name: '摸摸鱼',
  instructions: `
与用户随便聊聊吧，你也可以与用户玩一些文字游戏，记得保持语言活泼生动
  `.trim(),
  model: main,
  memory: new Memory({
    options: {
      lastMessages: 50,
    },
  }),
});
