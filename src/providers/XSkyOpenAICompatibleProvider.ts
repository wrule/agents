import path from 'path';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const XSkyOpenAICompatibleProvider = createOpenAICompatible({
  name: 'xsky-provider',
  baseURL: path.join(process.env.XSKY_BASE_URL!, '/v1'),
  headers: {
    cookie: 'sys_env_id=822313712173449216; sys_env_code=Init; sys_token=d2845265b7894be1b03056ba8a460914',
  },
  fetch: (...args) => {
    const data = args[1];
    const body = data?.body as string;
    try {
      const json = JSON.parse(body);
      if (!json.threadId && data) {
        json.threadId = 'uAWFKwhwoJcjf0Br75K9t';
        data.body = JSON.stringify(json);
      }
    } catch (error) {
      console.error(error);
    }
    return fetch(...args);
  },
});

export default XSkyOpenAICompatibleProvider;
