import React from "react";
import { SessionJSON } from "../localJSON";

const ScriptSelectorBye = () => {
  return (
    <div className="text-rows">
      <div>
        请确认是否开始压测{" "}
        <a
          target="_blank"
          href={`http://192.168.8.139:8080${SessionJSON.selected_product?.url}`}
        >
          {SessionJSON.selected_product?.name}
        </a>{" "}
        产品下的
      </div>
      <div>
        <ul>
          {(SessionJSON.selected_scripts ?? []).map(
            (script: any, index: number) => (
              <li key={script.id}>
                <span>{`${index + 1}.`}</span>{" "}
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
      {/* <div>接下来你需要快速压测吗？或者任意其他事情 😊</div> */}
      {/* <div>
        <Space>
          <FastTest />
          <Button
            onClick={() => {
              AgentStore.get("XSea_查询脚本").SendMessage("列出脚本");
            }}
          >
            更换脚本
          </Button>
          <Button
            onClick={() => {
              AgentStore.get("XSea_查询脚本").SendMessage("列出产品");
            }}
          >
            更换产品
          </Button>
        </Space>
      </div> */}
    </div>
  );
};

export default ScriptSelectorBye;
