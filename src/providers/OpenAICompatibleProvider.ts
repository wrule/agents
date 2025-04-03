import path from 'path';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const betterObject = (object1: any, object2: any) => {
  let result = null;
  if (object1 && object2) {
    result = JSON.stringify(object1).length > JSON.stringify(object2).length ?
      object1 : object2;
  } else {
    result = object1 || object2;
  }
  return result;
}

const OpenAICompatibleProvider = createOpenAICompatible({
  name: 'provider',
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: path.join(process.env.BASE_URL!, '/v1'),
  fetch: async (...args) => {
    const url = args[0];
    const res = await fetch(...args);

    const clonedRes = res.clone();
    if (clonedRes.body) {
      try {
        const reader = clonedRes.body.getReader();
        let fullArgsText = '';
        let fullArgsTextObject: any = null;
        let argsTextObject: any = null;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = new TextDecoder().decode(value).split('\n').map((line) => line.trim()).filter((line) => line);
          const newLines: string[] = [];
          lines.forEach((line) => {
            if (line.startsWith('data:') && !line.endsWith('[DONE]')) {
              try {
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
                  return;
                }
                const toolCallStop = jsonObject.choices?.[0]?.finish_reason === 'tool_calls';
                if (toolCallStop) {
                  const result = betterObject(fullArgsTextObject, argsTextObject);
                  if (result) {
                    jsonObject.choices[0].delta = {
                      tool_calls: [{
                        index: 0,
                        function: {
                          arguments: JSON.stringify(result),
                        },
                      }],
                    };
                    jsonObject.choices[0].finish_reason = null;
                    delete jsonObject.choices[0].stop_reason;
                    newLines.push(`data: ${JSON.stringify(jsonObject)}`);
                  }
                  fullArgsText = '';
                  fullArgsTextObject = null;
                  argsTextObject = null;
                }
              } catch (error) {
                console.error(error);
              }
            }
            newLines.push(line);
          });
          console.log(newLines.join('\n\n'));
        }
      } catch (error) {
        console.error(error);
      }
    }

    return res;
  },
});

export default OpenAICompatibleProvider;
