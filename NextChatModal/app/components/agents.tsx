import React, { useEffect, useRef } from "react";
import XSea_智能体 from "../agent/xsea/XSea_智能体";
import XSea_摸摸鱼 from "../agent/xsea/XSea_摸摸鱼";
import XSea_创建产品 from "../agent/xsea/XSea_创建产品";
import XSea_创建脚本 from "../agent/xsea/XSea_创建脚本";
import XSea_查询产品 from "../agent/xsea/XSea_查询产品";
import XSea_查询脚本 from "../agent/xsea/XSea_查询脚本";
import XSea_执行压测 from "../agent/xsea/XSea_执行压测";
import XSea_调用栈分析 from "../agent/xsea/XSea_调用栈分析";
import { AgentStore, CN_MASKS } from "../agent/store";
import XSea_知识库 from "../agent/xsea/XSea_知识库";
import XSea_当下引导 from "../agent/xsea/XSea_当下引导";
import XSea_JMeter专家 from "../agent/xsea/XSea_JMeter专家";
import XSea_Gatling专家 from "../agent/xsea/XSea_Gatling专家";
import XSea_Shell专家 from "../agent/xsea/XSea_Shell专家";
import { SessionJSON } from "./xsea/localJSON";
import XSea_内存分析 from "../agent/xsea/XSea_内存分析";
import { useChatStore } from "../store";
import { Mask } from "../store/mask";
import { Path } from "../constant";
import { useNavigate } from "react-router-dom";

const Agents = () => {
  const navigate = useNavigate();
  const chatShore = useChatStore();
  const receiveMessage = async (data: any) => {
    const message = data.data ?? {};
    // console.log(message);

    if (message.from === "ai_parent" && message.cookie) {
      localStorage.setItem('currentCookie', message.cookie);
      return;
    }

    const nameProcess = (name: string) => {
      return name.toLowerCase().replaceAll('_', '').replaceAll('-', '');
    };

    if (message.from === "ai_parent" && message.expertName) {
      const expertName = ((message.expertName ?? '') as string).replace('_', '');
      if (message.problem) {
        const mask = CN_MASKS.find((mask) => nameProcess(mask.name) === nameProcess(expertName)) as Mask;
        await chatShore.newSession(mask);
        navigate(Path.Chat);
        chatShore.AppendRoleMessage({
          role: "system",
          content: message.problem,
        }, true);
        // AgentStore.get(message.expertName).Create(
        //   [
        //     {
        //       role: "system",
        //       content: `${message.problem}`,
        //     },
        //   ],
        //   true,
        // );
      } else {
        const mask = CN_MASKS.find((mask) => nameProcess(mask.name) === nameProcess(expertName)) as Mask;
        await chatShore.newSession(mask);
        navigate(Path.Chat);
      }
    } else {
      if (message.type === "发送异常") {
        const execId = message.problem.execId;
        const list = message.problem.list;
        const tests: any[] = SessionJSON.tests ?? [];
        const index = tests.findIndex(
          (test) => test.executeRecord.id === execId,
        );
        if (index >= 0) {
          tests[index] = { ...tests[index], list };
        }
        SessionJSON.tests = tests;
      }
    }
  };

  const markdownText = useRef<string>("");
  const markdownFlag = useRef<boolean>(false);

  const postMessage = (msg: any) => {
    // console.log("postMessage", msg);
    window.top?.postMessage(msg, "*");
  };

  const postMarkdown = (text: string) => {
    localStorage.ai_code = text;
    postMessage({ type: "code", text });
  };

  const check = () => {
    const markdown = document.querySelector(
      "div[class^=chat_chat-body__] > div[class^=chat_chat-message__]:last-child .markdown-body .main-code-area code",
    );
    if (markdown) {
      const currentText = markdown.textContent!.trim();
      if (currentText && currentText !== markdownText.current) {
        markdownText.current = currentText;
        if (markdownFlag.current) {
          postMarkdown(currentText);
        }
        markdownFlag.current = true;
      }
    }
  };

  useEffect(() => {
    window.addEventListener("message", receiveMessage);
    check();
    const timer = setInterval(() => {
      window.top?.postMessage(
        {
          from: "ai_iframe",
          type: "heartbeat",
        },
        "*",
      );
      check();
    }, 250);
    return () => {
      window.removeEventListener("message", receiveMessage);
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      {/* <XSea_智能体 /> */}
      {/* <XSea_摸摸鱼 /> */}
      {/* <XSea_智能体2 /> */}
      {/* <XSea_JMeter专家 />
      <XSea_Gatling专家 />
      <XSea_Shell专家 />
      <XSea_创建产品 />
      <XSea_创建脚本 />
      <XSea_查询产品 />
      <XSea_查询脚本 />
      <XSea_执行压测 />
      <XSea_调用栈分析 />
      <XSea_内存分析 />
      <XSea_当下引导 />
      <XSea_知识库 />
      <XSea_摸摸鱼 /> */}
    </>
  );
};

export default Agents;
