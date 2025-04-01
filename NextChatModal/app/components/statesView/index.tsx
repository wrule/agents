import React, { useCallback, useEffect, useState } from "react";
import styles from "./index.module.scss";
import { SessionJSON } from "../xsea/localJSON";
import { CN_MASKS } from "@/app/agent/store";
import { useChatStore } from "@/app/store";
import { Mask } from "@/app/store/mask";
import { Path } from "@/app/constant";
import { useNavigate } from "react-router-dom";

const StatesView = () => {
  const [expand, setExpand] = useState<boolean>(false);
  const [tests, setTests] = useState<any[]>([]);
  const chatStore = useChatStore();
  const navigate = useNavigate();

  const syncStates = useCallback(() => {
    const newShow = SessionJSON.tests?.length >= 1;
    setTests(SessionJSON.tests ?? []);
    if (newShow) {
      document.documentElement.style.setProperty("--tools-width", "240px");
      setTimeout(() => {
        setExpand(newShow);
      }, 200);
    }
    if (!newShow) {
      document.documentElement.style.setProperty("--tools-width", "0px");
      setExpand(newShow);
    }
  }, [tests]);

  useEffect(() => {
    const timer = setInterval(() => {
      syncStates();
    }, 500);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={styles.com} style={{ padding: expand ? "1rem" : "0px" }}>
      {expand && (
        <>
          {tests.length > 0 && (
            <div className={styles.his_test}>
              <b>当前压测</b>
              <ul className={styles.test_list}>
                {tests.map((test, index) => (
                  <li key={test.name}>
                    <div>
                      <a
                        href="javascript:;"
                        onClick={() => {
                          // window.top?.open(`http://192.168.8.139:8080${test.executeRecord.url}`);
                        }}
                      >
                        {test.name ?? "-"}
                      </a>
                    </div>
                    {(test.problem?.list ?? []).map((item: any) => {
                      const mask = CN_MASKS.find((mask) => mask.name === 'XWind智能体') as Mask;
                      return <>
                        {item.stackDatas && (
                          <div
                            className={styles.problem}
                            onClick={async () => {
                              await chatStore.newSession(mask);
                              navigate(Path.Chat);
                              chatStore.AppendRoleMessage({
                                role: "system",
                                content: `${JSON.stringify(
                                  item.stackDatas,
                                  null,
                                  2,
                                )}\n性能瓶颈在哪？`,
                              }, true);
                              // AgentStore.get("XSea_调用栈分析").Create(
                              //   [
                              //     {
                              //       role: "system",
                              //       content: `${JSON.stringify(
                              //         item.stackDatas,
                              //         null,
                              //         2,
                              //       )}\n性能瓶颈在哪？`,
                              //     },
                              //   ],
                              //   true,
                              // );
                            }}
                          >
                            🎛️ 发现CPU性能问题
                          </div>
                        )}
                        {item.heapHisto && (
                          <div
                            className={styles.problem}
                            onClick={async () => {
                              await chatStore.newSession(mask);
                              navigate(Path.Chat);
                              chatStore.AppendRoleMessage({
                                role: "system",
                                content: `${JSON.stringify(
                                  item.heapHisto,
                                  null,
                                  2,
                                )}\n性能瓶颈在哪？`,
                              }, true);
                              // AgentStore.get("XSea_内存分析").Create(
                              //   [
                              //     {
                              //       role: "system",
                              //       content: `${JSON.stringify(
                              //         item.heapHisto,
                              //         null,
                              //         2,
                              //       )}\n性能瓶颈在哪？`,
                              //     },
                              //   ],
                              //   true,
                              // );
                            }}
                          >
                            📟 发现内存性能问题
                          </div>
                        )}
                      </>
                    })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatesView;
