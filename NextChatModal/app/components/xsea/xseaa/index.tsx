import React, { useMemo } from "react";
import styles from "./index.module.scss";

export interface XSeaObject {
  type:
    | "PRODUCT"
    | "SCRIPT"
    | "PLAN"
    | "GOAL"
    | "RECORD"
    | "REPORT"
    | "SCHEDULE";
  productId: string;
  productName: string;
  scriptId?: string;
  scriptName?: string;
  planId?: string;
  planName?: string;
  goalId?: string;
  goalName?: string;
}

export type XSeaObjectTypeMap<T> = {
  [key in XSeaObject["type"]]: T;
};

export const EmojiMap: XSeaObjectTypeMap<string> = {
  PRODUCT: "🧰",
  SCRIPT: "📝",
  PLAN: "📅",
  GOAL: "🎯",
  RECORD: "📋",
  REPORT: "📊",
  SCHEDULE: "⏰",
};

export const NameMap: XSeaObjectTypeMap<string> = {
  PRODUCT: "产品",
  SCRIPT: "脚本",
  PLAN: "计划",
  GOAL: "目标",
  RECORD: "记录",
  REPORT: "报告",
  SCHEDULE: "定时任务",
};

const XSeaA = (props: { data: XSeaObject; emoji?: boolean }) => {
  const { data, emoji } = props;

  const envId = "822313712173449216";

  const name = useMemo(() => {
    const nameMap: XSeaObjectTypeMap<string | undefined> = {
      PRODUCT: data.productName,
      SCRIPT: data.scriptName,
      PLAN: data.planName,
      GOAL: data.goalName,
      RECORD: undefined,
      REPORT: undefined,
      SCHEDULE: undefined,
    };
    return nameMap[data.type];
  }, [data]);

  const href = useMemo(() => {
    const hrefMap: XSeaObjectTypeMap<string> = {
      PRODUCT: `/${envId}/product/business/${data.productId}/overview?tab=0`,
      SCRIPT: `/${envId}/product/business/${data.productId}/script?scriptId=${data.scriptId}`,
      PLAN: `/${envId}/product/business/${data.productId}/plan/detail?id=${data.planId}`,
      GOAL: `/${envId}/product/business/${data.productId}/plan/target?id=${data.planId}&goalId=${data.goalId}`,
      RECORD: `/${envId}/product/business/${data.productId}/plan/targetExecuteDetail?id=${data.goalId}`,
      REPORT: "",
      SCHEDULE: "",
    };
    return hrefMap[data.type];
  }, [data]);
  return (
    <a className={styles.com} target="_blank" href={href}>
      {emoji && <span className={styles.emoji}>{EmojiMap[data.type]}</span>}
      <span className={styles.name}>
        {name ?? `未知${NameMap[data.type] ?? ""}`}
      </span>
    </a>
  );
};

export default XSeaA;
