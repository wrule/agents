import { ZodTypeAny } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';

const jsonOutputTool = (schema: ZodTypeAny) => {
  const parser = StructuredOutputParser.fromZodSchema(schema);
  const instructions = parser.getFormatInstructions();
  return {
    instructions, parser: (text: string) => parser.parse(text),
  };
};

export default jsonOutputTool;
