import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { weatherWorkflow } from './workflows';
import OpenAICompatibleMiddleware from './middleware/OpenAICompatibleMiddleware';
import { xsea_agent } from './agents/xsea_agent';
import { touch_fish_agent } from './agents/touch_fish';
import { jmeter_expert } from './agents/jmeter_expert';
import { gatling_expert } from './agents/gatling_expert';
import { shell_expert } from './agents/shell_expert';
import { user_agent } from './agents/user_agent';
import XSeaMiddleware from './middleware/XSea';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { xsea_agent, jmeter_expert, gatling_expert, shell_expert, touch_fish_agent, user_agent },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
  serverMiddleware: [
    {
      handler: OpenAICompatibleMiddleware,
      path: '/v1/chat/completions',
    },
    {
      handler: XSeaMiddleware,
      path: '/v1/chat/completions/xsea/*',
    },
  ],
});
