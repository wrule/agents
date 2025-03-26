import { ChatOllama } from "@langchain/ollama";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { CoreMessage, generateText } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENAI_API_KEY,
});

const openrouterModel = openrouter("perfma-gpt");

export const openrouterGenerate = async (messages: CoreMessage[]) => {
  return await generateText({
    model: openrouterModel,
    messages: messages,
  });
};

const model = new ChatOllama({
  baseUrl: "http://111.9.7.102:31131",
  model: "perfma-gpt-json-14b:latest",
  numCtx: 16384,
  keepAlive: "10000h",
  streaming: true,
  stop: ["<|im_start|>", "<|im_end|>", "<|im_sep|>"],
  topK: 1,
  topP: 0.5,
  temperature: 0.1,
  penalizeNewline: true,
  seed: 2025,
});

export default model;
