import { useEffect } from "react";
import { ChatStore, useChatStore } from "@/app/store";
import { NavigateFunction, useNavigate } from "react-router-dom";
import Agent, { AgentRouteMap, ChatMessageX } from "..";
import { AgentStore } from "../store";

class _Agent extends Agent {
  public constructor(chatStore: ChatStore, navigate: NavigateFunction) {
    super(
      {
        avatar: "🤖",
        name: "XSea智能体",
        agentName: "xsea_agent",
        context: [
          {
            id: "",
            role: "system",
            content: "",
            date: "",
          },
        ],
        modelConfig: { },
      },
      chatStore,
      navigate,
    );
  }

  public welcome(): ChatMessageX[] {
    return [{ role: "assistant", content: "", component: "@ui-welcome" }];
  }

  public RouteMap(): AgentRouteMap {
    return {
      查询: {
        产品: "XSea_查询产品",
        脚本: "XSea_查询脚本",
      },
      陈述: {
        产品: "XSea_创建产品",
        脚本: "XSea_创建脚本",
      },
      询问: "XSea_知识库",
      创建: {
        产品: "XSea_创建产品",
        脚本: "XSea_创建脚本",
        压测: "XSea_执行压测",
      },
      执行: {
        压测: "XSea_执行压测",
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
