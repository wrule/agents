import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";
import XSeaA, { XSeaObject } from "../xseaa";
import { SessionJSON } from "../localJSON";
import { Table } from "antd";

export function pickRandom<T>(list: T[]) {
  if (list.length === 0) {
    throw new Error("随机选择列表为空");
  }
  return list[Math.floor(Math.random() * list.length)];
}

const Targets = () => {
  const [list, setList] = useState<XSeaObject[]>([]);
  const [nextList, setNextList] = useState<string[]>([]);

  useEffect(() => {
    const targets: XSeaObject[] = SessionJSON.targets;
    setList(targets);
    setNextList(() => {
      const result: string[] = [];
      while (result.length < 4) {
        let question = "";
        const item = pickRandom(targets.slice(0, 5));
        if (item.type === "SCRIPT") {
          question = pickRandom([
            `请解释 ${item.scriptName} 脚本是干什么的？`,
            `帮我执行 ${item.scriptName} 脚本看看调试结果`,
            `开始压测 ${item.scriptName} 脚本`,
            `请帮我解决 ${item.scriptName} 脚本的Bug`,
            `我想新建一个 JMeter 脚本`,
          ]);
        } else if (item.type === "GOAL") {
          question = pickRandom([
            `请解释 ${item.goalName} 这个目标的意义？`,
            `压测 ${item.goalName} 目标`,
            `${item.goalName} 这个目标有哪些压测记录？`,
            `请帮我新增一个目标`,
          ]);
        } else {
          question = pickRandom([`1`, `2`, `3`, `4`]);
        }
        if (question && result.every((item) => item !== question)) {
          result.push(question);
        }
      }
      return result;
    });
  }, []);

  return (
    <div className={styles.com}>
      <div>
        {list.length === 0 && (
          <div>好像没找到相关内容呢，尝试描述清楚一些？😊</div>
        )}
        {list.length > 0 && (
          <>
            <div className={styles.tips}>😊 好的，为你找到以下脚本</div>
            <div className={styles.table}>
              <Table
                rowKey={(row) => {
                  if (row.type === "PRODUCT") return row.productId;
                  if (row.type === "SCRIPT") return row.scriptId ?? "";
                  if (row.type === "PLAN") return row.planId ?? "";
                  if (row.type === "GOAL") return row.goalId ?? "";
                  return "";
                }}
                size="small"
                showHeader={false}
                columns={[
                  {
                    render: (row) => {
                      return <XSeaA data={row} emoji />;
                    },
                  },
                ]}
                dataSource={list}
                pagination={
                  list.length <= 5
                    ? false
                    : {
                        pageSize: 5,
                        showSizeChanger: false,
                      }
                }
              />
            </div>
          </>
        )}
      </div>
      <div className={styles.recommend}>
        <ul className={styles.next_list}>
          {nextList.map((next) => (
            <li key={next}>{next}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Targets;
