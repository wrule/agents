import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { weatherWorkflow } from './workflows';
import OpenAICompatibleMiddleware from './middleware/OpenAICompatibleMiddleware';
import { xsea_agent } from './agents/xsea_agent';
import { touch_fish_agent } from './agents/touch_fish';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { xsea_agent, touch_fish_agent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
  serverMiddleware: [
    {
      handler: OpenAICompatibleMiddleware,
      path: '/v1/chat/completions',
    },
  ],
});
