import { MCPConfiguration } from '@mastra/mcp';

const composioMCP = new MCPConfiguration({
  servers: {
    github: {
      url: new URL('https://mcp.composio.dev/github/magnificent-wooden-plumber-62gpXx'),
    },
  },
});

export default composioMCP;
