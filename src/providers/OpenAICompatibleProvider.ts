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
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = new TextDecoder().decode(value).split('\n').map((line) => line.trim()).filter((line) => line);
          const newLines = lines.map((line) => {
            if (line.startsWith('data: ') && !line.endsWith('[DONE]')) {
              const jsonText = line.slice(6);
              const jsonObject = JSON.parse(jsonText);
              const argsText = jsonObject.choices?.[0]?.delta?.tool_calls?.[0]?.function?.arguments;
              if (argsText) {
                fullArgsText += argsText;
                let fullArgsTextObject = null;
                try {
                  fullArgsTextObject = JSON.parse(fullArgsText);
                } catch (error) { }
                let argsTextObject = null;
                try {
                  argsTextObject = JSON.parse(argsText);
                } catch (error) { }
                if (fullArgsTextObject || argsTextObject) {
                  if (fullArgsTextObject && argsTextObject) {

                  } else if (fullArgsTextObject) {

                  } else {

                  }
                }
              }
            }
            return line;
          });
          // console.log(1, newLines);
        }
      } catch (error) {
        console.error('Error reading stream:', error);
      }
    }

    return res;
  },
});

export default OpenAICompatibleProvider;
