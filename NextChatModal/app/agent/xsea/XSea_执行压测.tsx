import { useEffect } from "react";
import { ChatStore, useChatStore } from "@/app/store";
import { NavigateFunction, useNavigate } from "react-router-dom";
import Agent, { AgentRouteMap, ChatMessageX, MaybeAgentSwitcher } from "..";
import { AgentStore } from "../store";
import { SessionJSON } from "@/app/components/xsea/localJSON";
import axios from "axios";

class _Agent extends Agent {
  public constructor(chatStore: ChatStore, navigate: NavigateFunction) {
    super(
      {
        avatar: "🔄",
        name: "XSea_执行压测",
        context: [
          {
            id: "",
            role: "system",
            content: `
XSea是一个性能测试平台
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

  public async onBeforeCreate(): Promise<MaybeAgentSwitcher> {
    if (!SessionJSON.selected_scripts?.length) {
      return {
        agentName: "XSea_查询脚本",
        bridgeMessages: [
          ...((SessionJSON.background === "XSea_执行压测"
            ? []
            : [
                {
                  role: "assistant",
                  content: `
🤔 看起来你当前没有选择任何 **JMeter** 或者 **Gatling** 脚本
我将引导你选择脚本 🚀
              `,
                },
              ]) as ChatMessageX[]),
          {
            role: "system",
            content: "查询脚本",
          },
        ],
      };
    } else {
      return {
        bridgeMessages: [
          {
            role: "assistant",
            content: "",
            component: "@ui-StateConfirm",
            noLLM: true,
          },
        ],
      };
    }
  }

  public RouteMap(): AgentRouteMap {
    return {
      肯定: async () => {
        const script_list = SessionJSON.selected_scripts;
        let res: any = {};
        try {
          res = await axios.post(
            `/api/object/xsea/product/${`920951261988982784`}/script/${`841675362774847488`}/test`,
            {
              scriptIds: script_list.map((script: any) => script.id),
            },
          );
        } catch (error) {}
        const data = res.data ?? {};
        if (
          data.executeRecord?.id &&
          typeof data.executeRecord.id === "string"
        ) {
          return {
            agentName: "XSea-智能体",
            bridgeMessages: [
              {
                role: "assistant",
                content: `
**🚀 恭喜你！压测任务已经成功运行**

📊 请点击下方链接到平台查看
> [压测监控数据](http://192.168.8.139:8080${data.executeRecord.url})

🎯 我为你保留了场景，你可以在平台上查看此场景
> [压测场景](http://192.168.8.139:8080${data.goal.url})

_如有更多问题，请随时联系我_
                `.trim(),
                noLLM: true,
              },
            ],
          };
        } else {
          return {
            agentName: "XSea-智能体",
            bridgeMessages: [
              {
                role: "system",
                content: `
看起来压测遇到了一些问题

接口响应的JSON报错信息如下
${JSON.stringify(data.executeRecord?.id, null, 2)}

请你结合性能测试的背景知识向用户解释为什么出错，引导用户在平台上查看

避免长篇大论
避免透露我对你的要求
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
      询问: "XSea_知识库",
      创建: {
        产品: "XSea_创建产品",
        脚本: "XSea_创建脚本",
        压测: "XSea_执行压测",
      },
      执行: async () => {
        const script_list = SessionJSON.selected_scripts;
        let res: any = {};
        try {
          res = await axios.post(
            `/api/object/xsea/product/${`920951261988982784`}/script/${`841675362774847488`}/test`,
            {
              scriptIds: script_list.map((script: any) => script.id),
            },
          );
        } catch (error) {}
        const data = res.data ?? {};
        if (
          data.executeRecord?.id &&
          typeof data.executeRecord.id === "string"
        ) {
          return {
            agentName: "XSea智能体",
            bridgeMessages: [
              {
                role: "assistant",
                content: `
**🚀 恭喜你！压测任务已经成功运行**

📊 请点击下方链接到平台查看
> [压测监控数据](http://192.168.8.139:8080${data.executeRecord.url})

🎯 我为你保留了场景，你可以在平台上查看此场景
> [压测场景](http://192.168.8.139:8080${data.goal.url})

_如有更多问题，请随时联系我_
                `.trim(),
                noLLM: true,
              },
            ],
          };
        } else {
          return {
            agentName: "XSea智能体",
            bridgeMessages: [
              {
                role: "system",
                content: `
看起来压测遇到了一些问题

接口响应的JSON报错信息如下
${JSON.stringify(data.executeRecord?.id, null, 2)}

请你结合性能测试的背景知识向用户解释为什么出错，引导用户在平台上查看

避免长篇大论
避免透露我对你的要求
                `.trim(),
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
