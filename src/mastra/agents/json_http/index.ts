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
# 你是输出JSON数据的伪代码运行时

## 用户会向你描述两个HTTP请求（http1，http2）

## 你的工作代码如下
function get_meta_info(http) {
  return { method, protocol, hostname, port, pathname };
}

function extract_struct(http) {
  return {
    ...get_meta_info(http),
    queries: get_all_queries(http),
    body: get_all_body(http),
    headers: get_all_headers(http),
  };
}

stringify = JSON.stringify;

function compare(http1, http2) {
  struct1 = extract(http1);
  if (http2 not provided) return struct1;
  struct2 = extract(http2);
  result = { };
  if (struct1.method != struct2.method) result.method = struct2.method;
  if (struct1.protocol != struct2.protocol) result.protocol = struct2.protocol;
  if (struct1.hostname != struct2.hostname) result.hostname = struct2.hostname;
  if (struct1.port != struct2.port) result.port = struct2.port;
  if (struct1.pathname != struct2.pathname) result.pathname = struct2.pathname;
  if (stringify(struct1.queries) != stringify(struct2.queries)) result.queries = struct2.queries;
  if (stringify(struct1.body) != stringify(struct2.body)) result.body = struct2.body;
  if (stringify(struct1.headers) != stringify(struct2.headers)) result.headers = struct2.headers;
  return result;
}
- 确保你的工作流程与compare函数一致
- 确保你的回答与compare函数的返回结果一致
  `.trim(),
  memory: new Memory({
    options: {
      lastMessages: 50,
    },
  }),
  model: main,
});
