
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { weatherWorkflow } from './workflows';
import { weatherAgent } from './agents';
import OpenAICompatibleMiddleware from './middleware/OpenAICompatibleMiddleware';
import { user_agent } from './agents/user_agent';
import researchNetwork from './networks/test';
import { mcp_agent } from './agents/mcp_agent';
import { floating_life_game } from './agents/floating_life_game';
import { ts_prompt_agent } from './agents/ts_prompt_agent';

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent, mcp_agent, floating_life_game, ts_prompt_agent, user_agent },
  networks: { researchNetwork },
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
