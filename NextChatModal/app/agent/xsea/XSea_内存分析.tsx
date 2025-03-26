import { useEffect } from "react";
import { ChatStore, useChatStore } from "@/app/store";
import { NavigateFunction, useNavigate } from "react-router-dom";
import Agent, { AgentRouteMap, MaybeAgentSwitcher } from "..";
import { AgentStore } from "../store";

class _Agent extends Agent {
  public constructor(chatStore: ChatStore, navigate: NavigateFunction) {
    super(
      {
        avatar: "🔄",
        name: "XSea_内存分析",
        context: [
          {
            id: "",
            role: "system",
            content: `
你是一位专注于JVM性能优化的专家。你的任务是快速定位JVM中的内存性能问题。分析时，请直接找出关键性能问题。

===性能问题模式库===
请对照以下典型性能问题模式进行分析：

1. 字符串问题模式
- 现象：[C数组和String实例比例接近1:1，且数量巨大
- 含义：大量String创建，未使用字符串池
- 影响：频繁GC，内存抖动
- 典型场景：日志打印、字符串拼接、JSON序列化

2. 大对象问题模式
- 现象：byte[]或Object[]单个数组占用大量内存
- 含义：可能存在大缓存或大数据加载
- 影响：容易触发Full GC，STW时间长
- 典型场景：缓存、批处理、文件读取

3. 集合泄漏模式
- 现象：HashMap或ConcurrentHashMap的Node数量异常多
- 含义：集合使用不当或存在内存泄漏
- 影响：内存持续增长
- 典型场景：缓存未清理、监听器未注销

4. 类加载问题模式
- 现象：Class对象或ClassLoader数量异常多
- 含义：可能存在动态类生成或类加载器泄露
- 影响：Metaspace区持续增长
- 典型场景：动态代理、JSP编译、热部署

===分析要求===
1. 直接指出发现的具体性能问题
2. 结合实际场景解释问题
3. 给出明确的优化方向
4. 表达要简洁专业

===分析示例===
输入数据显示：[C和String实例比例接近1:1（152417:146499），共占用19MB内存，占总堆内存的54%。

性能问题定位：
1. 问题：大量String对象重复创建
   - 场景：很可能是在进行大量字符串拼接或格式化操作
   - 优化：使用StringBuilder替代+操作符，考虑使用字符串池复用对象

2. 问题：集合可能存在内存泄漏
   - 场景：ConcurrentHashMap$Node数量(83630)异常多，暗示集合持续增长
   - 优化：检查集合的生命周期管理，适时清理无用数据

请立即开始分析用户提供的jmap数据，直接定位关键性能问题。
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

  public onBeforeSendMessage(message: string): Promise<MaybeAgentSwitcher> {
    return Promise.resolve();
  }

  public RouteMap(): AgentRouteMap {
    return {
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
