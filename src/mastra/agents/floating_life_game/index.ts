import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { getPlayerInfo, sleep } from './tools/getPlayerInfo';

export const floating_life_game = new Agent({
  name: '浮生记',
  instructions: `
# 浮生记是一个模拟经营类文字游戏
# 你是浮生记游戏的服务器，需要模拟游戏的文字用户界面与用户互动
  `.trim(),
  model: main,
  tools: {
    getPlayerInfo,
    sleep,
  },
});
