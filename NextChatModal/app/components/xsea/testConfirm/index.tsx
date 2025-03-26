import React from "react";
import styles from "./index.module.scss";
import { SessionJSON } from "../localJSON";

const TestConfirm = () => {
  return (
    <div className={styles.com}>
      <div>
        <span>你好，当前你已经选择了产品</span>&nbsp;
        <a
          href={`${"http://192.168.8.139:8080"}${SessionJSON.selected_product
            ?.url}`}
          className={styles.a_product}
        >
          {SessionJSON.selected_product?.name}
        </a>
      </div>
      <div>以及如下脚本</div>
      <div>
        <ul className={styles.ul}>
          {(SessionJSON.selected_scripts ?? []).map((script: any) => (
            <li key={script.id}>
              <a href="javascript:;">{script.name}</a>
            </li>
          ))}
        </ul>
      </div>
      <div>是否确认开始压测？</div>
    </div>
  );
};

export default TestConfirm;
