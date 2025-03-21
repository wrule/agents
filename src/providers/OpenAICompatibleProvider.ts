import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const OpenAICompatibleProvider = createOpenAICompatible({
  name: 'provider',
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.BASE_URL + '/v1',
});

export default OpenAICompatibleProvider;
