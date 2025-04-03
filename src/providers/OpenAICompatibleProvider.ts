import path from 'path';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const OpenAICompatibleProvider = createOpenAICompatible({
  name: 'provider',
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: path.join(process.env.BASE_URL!, '/v1'),
  fetch: async (...args) => {
    const url = args[0];
    const res = await fetch(...args);

    const clonedRes = res.clone();
    if (clonedRes.body) {
      const reader = clonedRes.body.getReader();
      try {
        let fullArgsText = '';
        let fullArgsTextObject: any = null;
        let argsTextObject: any = null;
        let count = 1;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const lines = new TextDecoder().decode(value).split('\n').map((line) => line.trim()).filter((line) => line);
          lines.forEach((line) => {
            if (line.startsWith('data:') && !line.endsWith('[DONE]')) {
              const jsonText = line.slice(5);
              const jsonObject = JSON.parse(jsonText);
              const argsText = jsonObject.choices?.[0]?.delta?.tool_calls?.[0]?.function?.arguments;
              if (typeof argsText === 'string') {
                fullArgsText += argsText;
                try {
                  fullArgsTextObject = JSON.parse(fullArgsText);
                } catch (error) { }
                try {
                  argsTextObject = JSON.parse(argsText);
                } catch (error) { }
                if (fullArgsTextObject || argsTextObject) {
                  if (fullArgsTextObject && argsTextObject) {

                  } else if (fullArgsTextObject) {

                  } else {

                  }
                }
                return;
              }
            }
            console.log(count++, line);
          });
        }
      } catch (error) {
        console.error('Error reading stream:', error);
      }
    }

    return res;
  },
});

export default OpenAICompatibleProvider;
