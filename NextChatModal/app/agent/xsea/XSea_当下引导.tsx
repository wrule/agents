import { useEffect } from "react";
import { ChatStore, useChatStore } from "@/app/store";
import { NavigateFunction, useNavigate } from "react-router-dom";
import Agent from "..";
import { AgentStore } from "../store";

class _Agent extends Agent {
  public constructor(chatStore: ChatStore, navigate: NavigateFunction) {
    super(
      {
        avatar: "🔄",
        name: "XSea_当下引导",
        context: [
          {
            id: "",
            role: "system",
            content: `
之后用户会发送给你XSea性能测试平台上页面的文本，你需要深入思考后理解当前用户页面上的信息和可选的操作，精准总结当前页面上的信息内容。
如果有一些交互的话，可以引导用户如何交互。
如果是压测记录相关信息的话，请结合性能测试背景知识。精准分析压测记录的结果和压测的问题。
避免简单罗列信息，你是一个助手，你需要像人类一样的语气帮用户解答和分析。
避免长篇大论。
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
