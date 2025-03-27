import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store";
import { z } from "zod";
import axios from "axios";
import styles from "./next.module.scss";
import { nanoid } from "nanoid";
import { StructuredOutputParser } from "langchain/output_parsers";
import { zerialize } from 'zodex';

const Next = () => {
  const first = useRef<boolean>(true);
  const [list, setList] = useState<string[]>([]);
  const chatStore = useChatStore();

  const updateNext = async () => {
    try {
      const session = chatStore.currentSession();
      const mask = session.mask;
      const messages = session.messages.slice(-1);
      const context = messages[0].content as string;
      const prompt = `
## 请你结合最后一条历史消息，预测用户接下来可能会发送的四个消息

## 最后一条历史消息是
【${context}】

## 你的工作步骤如下
1. 选取类型T（T为上下文最新讨论的对象类型，必须为以下之一）
- 产品
- 脚本
- 计划
- 目标
- 压测记录
- 测试报告
- 定时任务
- 其他（当前上下文不存在某个明确的对象，或正在等待新建，或只是表达概念）

2. 如果T为其他的话，直接预测四个消息，不需要执行3，4，5步骤
- 确保消息与上下文相关
- 确保消息对于用户有价值
- 确保消息言之有物
- 避免泛泛而谈或使用空洞的表达

3. 选取A，B，C三个对象
- 确保A，B，C的类型都为T
- 确保A，B，C为上下文中关注度最高的3个对象

4. 根据选取的T类型和A，B，C对象，推荐以下问题
- 如果T为产品
  - A产品下有哪些脚本？
  - 我想看下B产品下面的计划
  - 属于C产品的压测记录有哪些？
  - 我想重新创建一个产品
- 如果T为脚本
  - 快速压测A脚本
  - 解释一下B脚本吧
  - 帮我编写一个Shell脚本吧
  - 新建一个JMeter脚本
- 如果T为计划
  - A计划下有哪些目标？
  - B计划下有哪些压测记录？
  - 我想看下C计划下有什么定时任务
  - 查看一下A计划下所有的测试报告
- 如果T为目标
  - 压测A目标
  - 解释一下B目标是干什么的
  - 我想创建一个新的目标
  - 这个计划下面还有什么其他目标吗？
- 如果T为压测记录
  - 解读一下A的压测结果
  - 根据压测记录B的信息，我应该如何优化改善？
  - 目标C是属于哪个产品的？
  - 这个计划下面还有更多压测记录吗？
- 如果T为测试报告
  - 帮我解读一下A报告，有哪些值得关注的点？
  - B报告总体上是好是坏？
  - C报告属于什么产品？
  - 当前计划下还有更多其他的报告吗？
- 如果T为定时任务
  - 解释下A定时任务下一次的运行时间是什么时候？
  - B定时任务做了什么？
  - 我想新建一个定时任务
  - C定时任务的执行配置合适吗？

5. 把T，A，B，C替换成你选取的值，并且润色文本
      `.trim();
      const { data } = await axios.post(`/api/openai/v1/chat/completions`, {
        messages: prompt,
        agentName: mask.agentName,
        runId: mask.agentName,
        resourceId: localStorage.getItem('currentCookie'),
        threadId: session.id + nanoid(),
        stream: false,
        output: zerialize(z.tuple([
          z.string(),
          z.string(),
          z.string(),
          z.string(),
        ]).describe('用户接下来可能会发送的四个消息')),
      });
      setList(() => Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (first.current) {
      first.current = false;
      updateNext();
    }
  }, []);

  if (list.length === 0) return null;
  return <ul className={styles.com}>
    {list.map((q, index) => <li onClick={() => {
      chatStore.onUserInput(q);
    }}>
      <span className={styles.cup_span}>
        {index === 0 && <img src="/cup1.svg" />}
        {index === 1 && <img src="/cup2.svg" />}
        {index === 2 && <img src="/cup3.svg" />}
        {index === 3 && <img className={styles.hidden} src="/cup3.svg" />}
      </span>
      <span>{q.replace('A', '某').replace('B', '某').replace('C', '某')}</span>
    </li>)}
  </ul>;
}

export default Next;
