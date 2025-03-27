import { Agent } from '@mastra/core/agent';
import testma from '../../../models/testma';

export const testma_agent = new Agent({
  name: 'TestMa智能体',
  instructions: ``.trim(),
  model: testma,
});
