import { useEffect } from "react";
import { ChatStore, useChatStore } from "@/app/store";
import { NavigateFunction, useNavigate } from "react-router-dom";
import Agent, { AgentRouteMap } from "..";
import { AgentStore } from "../store";
import { isConfirmMessage } from "@/app/components/bottomConfirm";
import axios from "axios";
import { SessionJSON } from "@/app/components/xsea/localJSON";

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
        name: "XSea_创建产品",
        context: [
          {
            id: "",
            role: "system",
            content: `
XSea是一个性能测试平台
你需要在与用户对话过程中搜集以下两个字段

1. 产品名称（一般代表被测应用名称，20个字符以内）
2. 产品描述（描述性能测试需求，或者产品信息，50个字符以内）

你的工作流程有以下两个步骤

步骤1. 搜集 产品名称 和 产品描述
- 你可以根据用户描述选择合适的 产品名称 和 产品描述
- 你可以主动根据 产品名称 选择合适的 产品描述
- 你可以向用户解释这两个字段的含义
- 你可以向用户解释你可以帮助用户创建产品
- 如果用户已经提供了 产品名称 和 产品描述，则不需要搜集，直接进入步骤2
- 避免在步骤1询问用户字段是否符合要求
- 避免在步骤1做确认

步骤2. 确认 产品名称 和 产品描述
- 确保回答以"请确认"开头
- 确保以markdown形式列出目前已经搜集到的 产品名称 和产品描述 字段
- 确保告知用户如果确认的话产品将会创建
- 避免单独列出 产品名称
- 避免单独列出 产品描述
- 避免在列出字段的时候解释字段
- 避免在列出字段的时候出现（）符号
- 避免向用户二次确认
- 避免回答和创建产品无关的问题
- 避免回答不以"请确认"开头

如果已经成功创建某个产品，清空 产品名称，清空 产品描述，清空搜集到的需求，回到步骤1
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
          const res = await axios.post(`/api/object/xsea/product`, {
            name: params["产品名称"],
            desc: params["产品描述"],
          });
          const { name, url } = res.data;
          SessionJSON.selected_product = res.data;
          SessionJSON.selected_scripts = [];
          return {
            bridgeMessages: [
              {
                role: "assistant",
                content:
                  "我将会清空 产品名称，清空 产品描述，清空搜集到的需求，回到步骤1",
                component: `
✨ 已为你成功创建产品 **[${name}](http://192.168.8.139:8080${url})** 产品
当前我们已经为你自动选中 **${name}** 产品，接下来你可以尝试说“一起编写脚本吧”，我们会一起丰富这个产品下的脚本哦 😊
当然你也可以让我帮你执行其他任务，或者随意聊聊天
                `.trim(),
              },
            ],
          };
        }
      },
      查询: {
        产品: "XSea_查询产品",
        脚本: "XSea_查询脚本",
      },
      询问: {
        压测: "XSea_知识库",
        概念: "XSea_知识库",
        其他: "XSea_知识库",
      },
      创建: {
        脚本: "XSea_创建脚本",
        压测: "XSea_执行压测",
      },
      修改: {
        脚本: "XSea_创建脚本",
      },
      执行: {
        压测: "XSea_执行压测",
        脚本: "XSea_创建脚本",
      },
      陈述: {
        脚本: "XSea_创建脚本",
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
