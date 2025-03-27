import path from 'path';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const XSkyOpenAICompatibleProvider = createOpenAICompatible({
  name: 'xsky-provider',
  baseURL: path.join(process.env.XSKY_BASE_URL!, '/v1'),
});

export default XSkyOpenAICompatibleProvider;
