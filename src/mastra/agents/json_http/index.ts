import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { z } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { Memory } from '@mastra/memory';

const anyUndefined = undefined as any;

const ZodHTTPRequest = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE', 'CONNECT']).optional().default(anyUndefined),
  protocol: z.enum(['HTTP', 'HTTPS']).optional().default(anyUndefined),
  hostname: z.string().optional().default(anyUndefined),
  port: z.number().optional().default(anyUndefined),
  pathname: z.string().optional().default(anyUndefined),
  queries: z.record(z.string(), z.string()).optional().default(anyUndefined),
  body: z.record(z.string(), z.any()).optional().default(anyUndefined),
  headers: z.record(z.string(), z.string()).optional().default(anyUndefined),
});
const ZodHTTPRequestList = z.array(ZodHTTPRequest);

type HTTPRequest = z.infer<typeof ZodHTTPRequest>;

const parser = StructuredOutputParser.fromZodSchema(ZodHTTPRequestList);

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
