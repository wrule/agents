import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { useChatStore } from "@/app/store";
import { Spin } from "antd";
import axios from "axios";

const Welcome = () => {
  const chatStore = useChatStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [script, setScript] = useState<any>({ });
  const [record, setRecord] = useState<any>({ });

  const updateObjects = async () => {
    setLoading(true);
    try {
      const topK = 5;
      const searchParams = { resourceId: localStorage.getItem('currentCookie') || 'sys_env_id=822313712173449216; sys_env_code=Init; sys_token=3f475923ad424d429cc746e4892e8130' };
      const [{ data: scriptData }, { data: recordData }] = await Promise.all([
        axios.post(`/xsea/api/xsea/vector/query`, { type: 'SCRIPT', text: Math.random().toString(), topK }, {
          params: searchParams,
        }),
        axios.post(`/xsea/api/xsea/vector/query`, { type: 'RECORD', text: Math.random().toString(), topK }, {
          params: searchParams,
        }),
      ]);
      // 这里有Bug
      const index = Math.floor((Math.random() * topK));
      const script = scriptData.object?.[index]?.data ?? { };
      const record = recordData.object?.[index]?.data ?? { };
      setScript(script);
      setRecord(record);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateObjects();
  }, []);

  return (
    <div className={styles.com}>
      <div>
        🦄 嗨，很高兴见到你，我是 <b>XSea智能体</b>，我可以帮助你解决各种问题
      </div>
      <Spin spinning={loading}>
        <div className={styles.buttons}>
          <div className={styles.summary}>
            <b>试着说</b> 😊
            <ul className={styles.try_to_say}>
              <li
                onClick={() => {
                  chatStore.onUserInput(`帮我压测 ${script.productName} 下的 ${script.scriptName} 脚本`);
                }}
              >
                <span>帮我压测 <b>{script.productName}</b> 下的 <b>{script.scriptName}</b> 脚本</span>
              </li>
              <li onClick={() => {
                  chatStore.onUserInput(`我想分析一下 ${record.recordName} 压测记录`);
                }}>
                <span>我想分析一下 <b>{record.recordName}</b> 压测记录</span>
              </li>
              <li
                onClick={() => {
                  chatStore.onUserInput("有哪些产品？");
                }}
              >
                <span>有哪些产品可以压测？</span>
              </li>
              <li
                onClick={() => {
                  chatStore.onUserInput("帮我创建一个JMeter脚本吧");
                }}
              >
                <span>帮我创建一个JMeter脚本吧</span>
              </li>
              <li onClick={() => {
                  chatStore.onUserInput(`解释一下 ${script.scriptName} 脚本是做什么的`);
                }}>
                <span>解释一下 <b>{script.scriptName}</b> 脚本是做什么的</span>
              </li>
              <li
                onClick={() => {
                  chatStore.onUserInput("XSea之中怎么样安装探针");
                }}
              >
                <span>XSea之中怎么样安装探针</span>
              </li>
            </ul>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default Welcome;
