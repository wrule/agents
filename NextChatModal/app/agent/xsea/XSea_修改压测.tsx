import { useEffect } from "react";
import { ChatStore, useChatStore } from "@/app/store";
import { NavigateFunction, useNavigate } from "react-router-dom";
import Agent, { AgentRouteMap } from "..";
import { AgentStore } from "../store";
import { isConfirmMessage } from "@/app/components/bottomConfirm";
import XSeaSimplifier from "@/app/api/simplifier/xseaSimplifier";

function extractFields(text: string, fields: string[]) {
  const statements = text
    .split(/[*:：()（）\s]/)
    .map((item) => item.trim())
    .filter((item) => item);
  const result: any = {};
  fields.forEach((field) => {
    result[field] =
      statements[statements.findLastIndex((item) => item === field) + 1];
  });
  return result;
}

class _Agent extends Agent {
  public constructor(chatStore: ChatStore, navigate: NavigateFunction) {
    super(
      {
        avatar: "🔄",
        name: "XSea_修改压测",
        context: [
          {
            id: "",
            role: "system",
            content: `
XSea是一个性能测试平台
你是XSea创建产品小助手，你需要在与用户对话过程中搜集以下两个字段

1. 产品名称（一般代表被测应用名称，20个字符以内）
2. 产品描述（描述性能测试需求，或者产品信息，50个字符以内）

你的工作流程有以下两个步骤

步骤1. 搜集 产品名称 和 产品描述
- 你可以根据用户描述选择合适的 产品名称 和 产品描述
- 你可以主动根据 产品名称 选择合适的 产品描述
- 你可以向用户解释这两个字段的含义
- 你可以向用户解释你是XSea创建产品小助手，可以帮助用户创建产品
- 如果用户已经提供了 产品名称 和 产品描述，则不需要搜集，直接进入步骤2
- 避免在步骤1询问用户字段是否符合要求
- 避免在步骤1做确认

步骤2. 确认 产品名称 和 产品描述
- 确保回答以"请确认"开头
- 确保列出目前已经搜集到的 产品名称 和产品描述 字段
- 确保告知用户如果确认的话产品将会创建
- 避免单独列出 产品名称
- 避免单独列出 产品描述
- 避免在列出字段的时候解释字段
- 避免在列出字段的时候出现（）符号
- 避免向用户二次确认
- 避免回答和创建产品无关的问题
- 避免回答不以"请确认"开头
            `.trim(),
            date: "",
          },
        ],
        modelConfig: {
          model: "perfma-gpt",
          max_tokens: 16384,
          topK: 1,
          top_p: 0.5,
          temperature: 0.1,
        },
      },
      chatStore,
      navigate,
    );
  }

  public RouteMap(): AgentRouteMap {
    return {
      肯定: async () => {
        const messages = this.chatStore
          .currentSession()
          .messages.filter((message) => message.role === "assistant");
        const lastMessage = messages[messages.length - 1].content as string;
        if (isConfirmMessage(lastMessage)) {
          const params = extractFields(lastMessage, ["产品名称", "产品描述"]);
          const xsea = new XSeaSimplifier();
          const product = await xsea.ProductCreate(
            params["产品名称"],
            params["产品描述"],
          );
          return {
            bridgeMessages: [
              {
                role: "assistant",
                content: "已经成功创建产品" + JSON.stringify(product),
              },
            ],
          };
        }
      },
    };
  }
}

export default () => {
  const navigate = useNavigate();
  const chatStore = useChatStore();
  useEffect(() => {
    const agent = new _Agent(chatStore, navigate);
    AgentStore.register(agent.Name, agent);
  }, [chatStore, navigate]);
  return <></>;
};
