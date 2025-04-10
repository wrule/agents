import { Agent } from '@mastra/core/agent';
import main from '../../../models/main';
import { z } from 'zod';

const httpRequest = z.object({
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
  headers: z.array(
    z.tuple([
      z.string(),
      z.string(),
    ]),
  ).optional(),
});

export const json_http = new Agent({
  name: 'JSON_HTTP',
  instructions: `
你是HTTP
  `.trim(),
  model: main,
});
