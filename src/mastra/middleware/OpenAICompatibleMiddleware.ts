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
    // 不主动发送 DONE 消息
    // if (opcode === 'd') {
    //   return 'data: [DONE]';
    // }
  }
  return null;
};

export
const vercelStreamToOpenAIResponse = (stream: StreamTextResult<any, unknown>, id: string) => {
  const reader = stream.toDataStream().getReader();
  const encoder = new TextEncoder();
  const openAiStream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
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
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    },
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
  try {
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
    if (stream) {
      const mastraStream = await agent.stream(messages, body);
      return vercelStreamToOpenAIResponse(mastraStream, crypto.randomUUID());
    } else {
      if (json) {
        const zodSchema = dezerialize(body.output);
        delete body.output;
        const { instructions, parser } = jsonOutputTool(zodSchema);
        const result = await agent.generate(messages, {
          ...body,
          instructions: `
## Make sure to answer only JSON text
## Avoid answering non-JSON content
## Avoid explanations
## Make sure to follow the following rules
${instructions}
          `.trim(),
        });
        return ctx.json(await parser(result.text), 200);
      } else {
        const result = await agent.generate(messages, body);
        return ctx.json(result, 200);
      }
    }
  } catch (error: any) {
    const code = 500;
    return ctx.json({ code, message: error.message ?? '未知错误' }, code);
  }
}

export default OpenAICompatibleMiddleware;
