import path from 'path';
import { createQwen } from 'qwen-ai-provider';

const QwenProvider = createQwen({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: path.join(process.env.BASE_URL!, '/v1'),
  fetch: (...args) => {
    const url = args[0];
    // const config = args[1];
    // console.log(url, config);
    console.log(url);
    return fetch(...args);
  },
});

export default QwenProvider;
