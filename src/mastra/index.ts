import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { weatherWorkflow } from './workflows';
import OpenAICompatibleMiddleware from './middleware/OpenAICompatibleMiddleware';
import XSeaMiddleware from './middleware/XSeaMiddleware';
import { xsea_agent } from './agents/xsea_agent';
import { touch_fish_agent } from './agents/touch_fish';
import { jmeter_expert } from './agents/jmeter_expert';
import { gatling_expert } from './agents/gatling_expert';
import { shell_expert } from './agents/shell_expert';
import { user_agent } from './agents/user_agent';
import { qa_cleaning_agent } from './agents/qa_cleaning_agent';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: {
    xsea_agent,
    jmeter_expert,
    gatling_expert,
    shell_expert,
    touch_fish_agent,
    qa_cleaning_agent,
    user_agent,
  },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
  serverMiddleware: [
    {
      handler: XSeaMiddleware,
      path: '/xsea/api/*',
    },
    {
      handler: OpenAICompatibleMiddleware,
      path: '/v1/chat/completions',
    },
  ],
});
