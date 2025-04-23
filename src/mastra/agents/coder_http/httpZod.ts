import { z } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';

const HttpZod = z.object({
  name: z.string().max(20).describe('行为，实体，修饰，等组成的准确中文名称').optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']).optional(),
  protocol: z.enum(['http://', 'https://']).optional(),
  hostname: z.string().optional(),
  port: z.number().optional(),
  pathname: z.string().optional(),
  queries: z.array(z.tuple([z.string(), z.string()])).optional(),
  body: z.any().optional(),
  headers: z.array(z.tuple([z.string(), z.string()])).optional(),

  responseStatus: z.number().optional(),
  responseRedirectURL: z.string().optional(),
  responseHeaders: z.array(z.tuple([z.string(), z.string()])).optional(),
  responseBody: z.any().optional(),
});

export
const HttpListZod = z.array(HttpZod);

export
const HttpParser = StructuredOutputParser.fromZodSchema(HttpZod);

export
const HttpListParser = StructuredOutputParser.fromZodSchema(HttpListZod);

export
const HttpInstructions = HttpParser.getFormatInstructions();

export
const HttpListInstructions = HttpListParser.getFormatInstructions();

export
type HttpType = z.infer<typeof HttpZod>;

export default HttpZod;
