import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const mcp_agent = new Agent({
  name: 'MCP智能体',
  instructions: ``.trim(),
  model: main,
});
