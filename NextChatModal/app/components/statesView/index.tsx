import React, { useCallback, useEffect, useState } from "react";
import styles from "./index.module.scss";
import { SessionJSON } from "../xsea/localJSON";
import { AgentStore } from "@/app/agent/store";

const StatesView = () => {
  const [expand, setExpand] = useState<boolean>(false);
  const [tests, setTests] = useState<any[]>([]);

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
              <b>历史压测</b>
              <ul className={styles.test_list}>
                {tests.map((test, index) => (
                  <li key={test.executeRecord?.id}>
                    <div>
                      <a
                        href="javascript:;"
                        onClick={() => {
                          // window.top?.open(`http://192.168.8.139:8080${test.executeRecord.url}`);
                        }}
                      >
                        {test.goal?.name ?? "-"}
                      </a>
                    </div>
                    {(test.list ?? []).map((item: any) => (
                      <>
                        {item.stackDatas && (
                          <div
                            className={styles.problem}
                            onClick={() => {
                              AgentStore.get("XSea_调用栈分析").Create(
                                [
                                  {
                                    role: "system",
                                    content: `${JSON.stringify(
                                      item.stackDatas,
                                      null,
                                      2,
                                    )}\n性能瓶颈在哪？`,
                                  },
                                ],
                                true,
                              );
                            }}
                          >
                            🎛️ 发现CPU性能问题
                          </div>
                        )}
                        {item.heapHisto && (
                          <div
                            className={styles.problem}
                            onClick={() => {
                              AgentStore.get("XSea_内存分析").Create(
                                [
                                  {
                                    role: "system",
                                    content: `${JSON.stringify(
                                      item.heapHisto,
                                      null,
                                      2,
                                    )}\n性能瓶颈在哪？`,
                                  },
                                ],
                                true,
                              );
                            }}
                          >
                            📟 发现内存性能问题
                          </div>
                        )}
                      </>
                    ))}
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
