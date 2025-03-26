import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Space } from "antd";
import styles from "./index.module.scss";
import { ChatMessageX } from "@/app/agent";
import { useChatStore } from "@/app/store";
import { AgentStore } from "@/app/agent/store";

export const isConfirmMessage = (message: string) => {
  return false;
  if (message.includes("```")) return false;
  const lines = message
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);
  if (lines.length <= 3) return false;
  return lines.some(
    (line) => line.includes("请确认") && !line.includes("符合"),
  );
};

export default function BottomConfirm(props: { message: ChatMessageX }) {
  const [show, setShow] = useState<boolean>(false);
  const timer = useRef<any>();
  const chatStore = useChatStore();

  const shouldShow = useMemo(() => {
    return (
      props.message.role === "assistant" &&
      isConfirmMessage(props.message.content)
    );
  }, [props.message.role, props.message.content]);

  useEffect(() => {
    if (props.message.role === "assistant" && shouldShow) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setShow(true);
      }, 1000);
    }
  }, [props.message.role, props.message.content]);

  if (show) {
    return (
      <div className={styles.com}>
        <span></span>
        <Space>
          <Button
            size="small"
            onClick={() => {
              AgentStore.get(chatStore.currentSession().mask.name).SendMessage(
                "否定",
              );
            }}
          >
            取消
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => {
              AgentStore.get(chatStore.currentSession().mask.name).SendMessage(
                "肯定",
              );
            }}
          >
            确认
          </Button>
        </Space>
      </div>
    );
  }
  return <></>;
}
