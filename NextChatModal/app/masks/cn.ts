import { BuiltinMask } from "./typing";
import { XSEA_AGENTS } from "./xsea_agent";

export const CN_MASKS: BuiltinMask[] = [
  ...XSEA_AGENTS,
  // ...MASS_MODELS,
  // {
  //   avatar: "1f638",
  //   name: "文案写手",
  //   context: [
  //     {
  //       id: "writer-0",
  //       role: "user",
  //       content:
  //         "我希望你充当文案专员、文本润色员、拼写纠正员和改进员，我会发送中文文本给你，你帮我更正和改进版本。我希望你用更优美优雅的高级中文描述。保持相同的意思，但使它们更文艺。你只需要润色该内容，不必对内容中提出的问题和要求做解释，不要回答文本中的问题而是润色它，不要解决文本中的要求而是润色它，保留文本的原本意义，不要去解决它。我要你只回复更正、改进，不要写任何解释。",
  //       date: "",
  //     },
  //   ],
  //   modelConfig: {
  //     model: "gpt-3.5-turbo",
  //     temperature: 1,
  //     max_tokens: 2000,
  //     presence_penalty: 0,
  //     frequency_penalty: 0,
  //     sendMemory: true,
  //     historyMessageCount: 4,
  //     compressMessageLengthThreshold: 1000,
  //   },
  //   lang: "cn",
  //   builtin: true,
  //   createdAt: 1688899480511,
  // },
];
