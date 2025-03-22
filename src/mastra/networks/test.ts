import { Agent } from '@mastra/core';
import { AgentNetwork } from '@mastra/core/network';
import main from '../../models/main';

// Create specialized agents
const webSearchAgent = new Agent({
  name: 'Web Search Agent',
  instructions: 'You search the web for information.',
  model: main,
  tools: { /* web search tools */ },
});

const dataAnalysisAgent = new Agent({
  name: 'Data Analysis Agent',
  instructions: 'You analyze data and provide insights.',
  model: main,
  tools: { /* data analysis tools */ },
});

// Create the network
const researchNetwork = new AgentNetwork({
  name: 'Research Network',
  instructions: 'Coordinate specialized agents to research topics thoroughly.',
  model: main,
  agents: [webSearchAgent, dataAnalysisAgent],
});

export default researchNetwork;
