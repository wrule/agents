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

const parser = StructuredOutputParser.fromZodSchema(ZodHTTPRequest);

export const json_http = new Agent({
  name: 'JSON_HTTP',
  instructions: `
# 你是HTTP请求的差异对比器

## 用户会向你描述两个HTTP请求（http1，http2）

## 你的工作流程遵循以下代码

## 差异字段输出遵循以下格式
${parser.getFormatInstructions()}
  `.trim(),
  memory: new Memory({
    options: {
      lastMessages: 50,
    },
  }),
  model: main,
});
