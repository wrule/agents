import path from 'path';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const TestMaOpenAICompatibleProvider = createOpenAICompatible({
  name: 'testma-provider',
  baseURL: path.join(process.env.TESTMA_BASE_URL!, '/v1'),
});

export default TestMaOpenAICompatibleProvider;
