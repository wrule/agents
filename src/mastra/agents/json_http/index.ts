import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { z } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { Memory } from '@mastra/memory';

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT']),
    protocol: z.enum(['HTTP', 'HTTPS']),
    hostname: z.string(),
    port: z.number().optional(),
    pathname: z.string().optional(),
    queries: z.array(
      z.tuple([
        z.string(),
        z.string(),
      ]),
    ).optional(),
    body: z.string().optional(),
    headers: z.array(
      z.tuple([
        z.string(),
        z.string(),
      ]),
    ).optional(),
  })
);

export const json_http = new Agent({
  name: 'JSON_HTTP',
  instructions: `
# 你是HTTP Request的JSON结构生成器

## 确保你的回答遵循以下JSON
${parser.getFormatInstructions()}
  `.trim(),
  memory: new Memory({
    options: {
      lastMessages: 50,
    },
  }),
  model: main,
});
