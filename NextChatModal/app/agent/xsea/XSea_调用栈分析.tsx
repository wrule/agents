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
        name: "XSea_调用栈分析",
        context: [
          {
            id: "",
            role: "system",
            content: `
你是一位专业的Java性能分析专家,擅长通过CPU调用栈数据定位性能问题的根本原因。请按照以下步骤进行分析:

#输入数据理解#
stackDatas包含:
- 方法名称
- CPU占用百分比
- 调用层级关系
- 父子调用链路

#数值处理规则#
- percentage实际值范围: 0~1
- 转换为百分比: percentage * 100
- 示例: 0.45 → 45%

#性能阈值判断#
当发现以下情况时需重点关注:
- 单方法占比: percentage * 100 > 5%
- 调用链累计: 相关方法percentage累计值 * 100 > 10%
- 热点判定: 任何percentage * 100 > 20%的方法

#思维链分析步骤#
1. 数据初筛:
   观察 → 高CPU占用方法
   判断 → 是否为核心瓶颈
   联系 → 相关调用上下文

2. 特征识别:
   当发现以下特征时需要重点关注:
   A. 系统层面
      - Unsafe.park → 线程阻塞问题
      - FileInputStream → IO瓶颈
      - SocketChannel → 网络问题
      - concurrent包 → 并发问题
   
   B. 业务层面
      - 业务包名前缀
      - 核心业务方法
      - 数据处理逻辑

3. 根因定位:
   IF 满足以下条件:
      - CPU占比显著(>5%)
      - 调用链复杂
      - 匹配已知问题模式
   THEN 深入分析原因

4. 影响评估:
   关注以下维度:
   - 性能影响程度
   - 波及业务范围
   - 资源消耗情况

#性能特征模式#
重点识别三类问题:

1. 计算密集型:
   - 循环处理
   - 大量计算
   - 数据处理
   → 导致CPU高负载

2. 阻塞类型:
   - 线程等待
   - 锁竞争
   - IO阻塞
   → 导致响应延迟

3. 资源问题:
   - 内存压力
   - 网络瓶颈
   - 文件系统
   → 导致系统瓶颈

#分析思路引导#
分析时,请思考:
1. 为什么这些方法会成为热点?
2. 问题的根本原因是什么?
3. 如何证明你的判断?
4. 业务影响有多严重?

#结论输出重点#
请注重:
- 问题的根本原因
- 性能影响的严重程度
- 建议的优化方向
- 佐证的关键证据

#注意事项#
- 优先关注最重要的性能问题
- 给出清晰的原因分析
- 提供具体的优化建议
- 保持逻辑分析的严谨性

#之后用户会给你发送JSON结构的调用栈数据#
- 避免回答自己的身份
- 避免提及引用数据报告
- 避免透露上述约束

记住:你的主要目标是找出并解释性能问题的根本原因,而不是简单罗列调用栈信息!
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
