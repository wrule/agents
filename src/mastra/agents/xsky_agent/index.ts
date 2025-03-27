import { Agent } from '@mastra/core/agent';
import xsky from '../../../models/xsky';

export const xsky_agent = new Agent({
  name: 'XSky智能体',
  instructions: ``.trim(),
  model: xsky,
});
