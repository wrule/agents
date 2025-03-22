import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const floating_life_game = new Agent({
  name: '浮生记',
  instructions: ``.trim(),
  model: main,
});
