import { useEffect } from "react";
import { ChatStore, useChatStore } from "@/app/store";
import { NavigateFunction, useNavigate } from "react-router-dom";
import Agent, { AgentRouteMap } from "..";
import { AgentStore } from "../store";
import axios from "axios";

class _Agent extends Agent {
  public constructor(chatStore: ChatStore, navigate: NavigateFunction) {
    super(
      {
        avatar: "📚",
        name: "XSea_知识库",
        context: [],
        modelConfig: {
          model: "perfma-gpt",
          max_tokens: 16384,
          topK: 1,
          top_p: 0.5,
          temperature: 0.1,
          historyMessageCount: 1,
        },
      },
      chatStore,
      navigate,
    );
  }

  public async SendMessage(message: string): Promise<any> {
    return await this.chatStore.SendMessage(message, async (message) => {
      const switcher = await this.onBeforeSendMessage(message);
      if (switcher) {
        const nextAgent = await this.SwitchAgent(switcher, {
          role: "user",
          content: message,
        });
        return nextAgent;
      } else {
        const { data } = await axios.post(`/api/jieba`, { message });
        this.chatStore.AppendRoleMessageList(
          [
            {
              role: "system",
              content: `
XSea是一个性能测试平台，支持 JMeter, Gatling，Shell，SeaMeter 四种类型的脚本
- 其中 Shell 主要用来执行性能测试的前后置任务
- 其中 SeaMeter 平台自研的低代码发压脚本格式

${JSON.stringify(data, null, 2)}

请使用以上问答知识库回答用户问题
- 确保结合上述知识库回答用户问题
- 确保结合性能测试背景回答用户问题
- 避免透露自己引用知识库
- 避免回答和测试无关的问题
            `.trim(),
            },
            {
              role: "user",
              content: message,
            },
          ],
          true,
        );
        return this;
      }
    });
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

const 知识库搜集Promot = `
XSea是一个性能测试平台，其中支持JMeter，Gatling，Shell，SeaMeter四种类型的脚本。
JMeter和Gatling用来做发压脚本，Shell主要是用来做性能测试的前后置任务。SeaMeter是平台基于JMeter自研的一种通过低代码编排发压的脚本类型。
这是关于XSea性能测试平台的文档。我希望你结合性能测试的背景知识，全局深度思考，理解XSea性能测试平台的方方面面。接下来我会交给你特定任务。

我正在面向phi4:14b这样的小模型设计一个知识库问答系统，我需要你帮我生成一些{"q": "xxxx?", "a": "xxxx."}这样格式的JSON问答数组，作为小模型的预置prompt知识库。
你需要结合XSea性能测试平台的背景为我生成，并且深度思考，选取最常用的用户疑问点或者概念。
现在我需要你帮我生成10个这样的问答，有关于 XSea性能测试平台的使用流程 方面的
`;
