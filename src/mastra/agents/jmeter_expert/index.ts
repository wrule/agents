import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';

export const jmeter_expert = new Agent({
  name: 'JMeter专家',
  instructions: `

  `.trim(),
  model: main,
});
