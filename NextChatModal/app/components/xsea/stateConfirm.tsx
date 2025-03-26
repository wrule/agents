import { Button, Space } from "antd";
import React from "react";
import { SessionJSON } from "./localJSON";
import { AgentStore } from "@/app/agent/store";

const StateConfirm = () => {
  return (
    <div className="text-rows" style={{ width: "300px" }}>
      <div>
        🦄 当前我们在{" "}
        <a
          target="_blank"
          href={`http://192.168.8.139:8080${SessionJSON.selected_product?.url}`}
        >
          {SessionJSON.selected_product?.name}
        </a>{" "}
        下面
      </div>
      <div>我们选择了以下脚本：</div>
      <div>
        <ul>
          {(SessionJSON.selected_scripts ?? []).map(
            (script: any, index: number) => (
              <li key={script.id}>
                <span>{`${index + 1}.`}</span>
                <a
                  target="_blank"
                  href={`http://192.168.8.139:8080${script?.url}`}
                >
                  {script.name}
                </a>
              </li>
            ),
          )}
        </ul>
      </div>
      <div>是否现在开始压测呢？🤔</div>
      <div className="buttons">
        <span></span>
        <Space>
          <Button
            size="small"
            type="link"
            onClick={() => {
              AgentStore.get("XSea_执行压测").SendMessage("列出全部脚本");
            }}
          >
            更换脚本
          </Button>
          <Button
            onClick={() => {
              AgentStore.get("XSea_执行压测").SwitchAgent({
                agentName: "XSea智能体",
                bridgeMessages: [
                  {
                    role: "assistant",
                    content: `
好的，已经为你取消压测，有什么 **顾虑** 吗 🧐，你可以问我任何问题？
                    `.trim(),
                    noLLM: true,
                  },
                ],
              });
            }}
          >
            取消
          </Button>
          <Button
            type="primary"
            onClick={() => {
              AgentStore.get("XSea_执行压测").SendMessage("确认压测");
            }}
          >
            压测
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default StateConfirm;
