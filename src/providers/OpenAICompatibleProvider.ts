import path from 'path';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const OpenAICompatibleProvider = createOpenAICompatible({
  name: 'provider',
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: path.join(process.env.BASE_URL!, '/v1'),
  fetch: (...args) => {
    const url = args[0];
    const config = args[1];
    console.log(url, config);
    return fetch(...args);
  },
});

export default OpenAICompatibleProvider;
