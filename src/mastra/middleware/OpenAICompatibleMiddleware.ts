import { Context, Next } from 'hono';
import { StreamTextResult } from 'ai';
import { mastra } from '../';
import { dezerialize } from 'zodex';
import jsonOutputTool from '../utils/jsonOutputTool';

export
type AgentName = Parameters<typeof mastra.getAgent>[0];

export
type HonoMiddleware = (ctx: Context, next: Next) => any;

export
const vercelChunkToOpenAI = (chunk: string, id: string) => {
  chunk = chunk.trim();
  if (/^\w:/.test(chunk)) {
    try {
      const opcode = chunk.slice(0, 1);
      const chunkData = JSON.parse(chunk.slice(2));
      if (opcode === '0') {
        return 'data: ' + JSON.stringify({
          id,
          provider: 'perfma',
          model: 'perfma-agents',
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          choices: [
            {
              index: 0,
              delta: {
                role: 'assistant',
                content: chunkData,
              },
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error parsing chunk:', error);
      return null;
    }
  }
  return null;
};

export
const vercelStreamToOpenAIResponse = (stream: StreamTextResult<any, unknown>, id: string) => {
  const reader = stream.toDataStream().getReader();
  const encoder = new TextEncoder();
  
  // 添加超时控制
  const TIMEOUT_MS = 60000 * 2; // 2分钟秒超时
  
  const openAiStream = new ReadableStream({
    async start(controller) {
      let timeoutId;
      
      try {
        while (true) {
          // 设置超时
          const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error('Stream processing timed out'));
            }, TIMEOUT_MS);
          });
          
          // 读取数据，与超时竞争
          const readPromise = reader.read();
          const result = await Promise.race([readPromise, timeoutPromise]);
          
          clearTimeout(timeoutId);
          
          const { done, value } = result as any;
          
          if (done) {
            break;
          }
          
          const chunkText = new TextDecoder().decode(value);
          
          chunkText.split('\n').forEach((line) => {
            const transformedChunk = vercelChunkToOpenAI(line, id);
            if (transformedChunk) {
              controller.enqueue(encoder.encode(transformedChunk + '\n\n'));
            }
          });
        }
      } catch (error) {
        console.error('Error in stream processing:', error);
        controller.error(error);
      } finally {
        clearTimeout(timeoutId);
        reader.releaseLock(); // 确保释放资源
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    },
    
    cancel() {
      // 确保在流被取消时也释放资源
      reader.releaseLock();
    }
  });
  
  return new Response(openAiStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
};

const OpenAICompatibleMiddleware: HonoMiddleware = async (ctx: Context, next: Next) => {
  const requestStartTime = Date.now();
  const REQUEST_TIMEOUT = 60000 * 2; // 2分钟总请求超时
  
  // 创建一个超时控制函数
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request processing timed out'));
    }, REQUEST_TIMEOUT);
  });
  
  try {
    const processRequest = async () => {
      const body = await ctx.req.json();
      const agentName = body.agentName as AgentName;
      if (!agentName) {
        throw new Error('agentName为空');
      }
      const agent = mastra.getAgent(agentName);
      const stream = body.stream !== false;
      const messages = body.messages ?? [];
      const json = !!body.output;
      delete body.agentName;
      delete body.stream;
      delete body.messages;
      if (json) {
        const zodSchema = dezerialize(body.output);
        delete body.output;
        const { instructions, parser } = jsonOutputTool(zodSchema);
        body.instructions = `
## Make sure to answer only JSON text
## Avoid answering non-JSON content
## Avoid explanations
## Make sure to follow the following rules
${instructions}
        `.trim();
        body.parser = parser;
      }
      if (stream) {
        const mastraStream = await agent.stream(messages, body);
        return vercelStreamToOpenAIResponse(mastraStream, crypto.randomUUID());
      } else {
        if (json) {
          const parser = body.parser;
          delete body.parser;
          const result = await agent.generate(messages, body);
          return ctx.json(await parser(result.text), 200);
        } else {
          const result = await agent.generate(messages, body);
          return ctx.json(result, 200);
        }
      }
    };
    
    // 竞争处理请求和超时
    return await Promise.race([processRequest(), timeoutPromise]);
    
  } catch (error: any) {
    console.error('Request handling error:', error);
    const code = error.message === 'Request processing timed out' ? 504 : 500;
    return ctx.json({ code, message: error.message ?? '未知错误' }, code);
  } finally {
    const requestDuration = Date.now() - requestStartTime;
    console.log(`Request processed in ${requestDuration}ms`);
  }
}

export default OpenAICompatibleMiddleware;
