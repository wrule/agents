"use client";

import { Button, Space, Table, Tabs } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import axios from "axios";
import { SessionJSON } from "../localJSON";
import { AgentStore } from "@/app/agent/store";
import { useChatStore } from "@/app/store";

const { TabPane } = Tabs;

export type ScriptType = "JMETER" | "GATLING" | "SHELL";

const ScriptSelector = (props: { search: string }) => {
  const [tab, setTab] = useState<ScriptType>("JMETER");
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState({
    search: props.search,
    pageNum: 1,
    pageSize: 5,
  });
  const [page, setPage] = useState({
    pageNum: 1,
    pageSize: 5,
    list: [],
    total: 0,
  });

  const autoPageList = useMemo(() => {
    return (page.list ?? []).filter((item: any) => item.type === tab);
  }, [page.list, tab]);

  const updatePage = async (params: any = {}) => {
    const newFilter = { ...filter, ...params };
    setFilter(newFilter);
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/object/xsea/product/${SessionJSON.selected_product?.id}/script`,
        {
          params: { ...newFilter },
        },
      );
      setPage(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    updatePage();
  }, [props.search]);

  const [selectedScripts, setSelectedScripts] = useState<any[]>(
    SessionJSON.selected_scripts,
  );

  const SetSelectedScripts = (scripts: any[]) => {
    setSelectedScripts(scripts);
    SessionJSON.selected_scripts = scripts;
  };

  const chatStore = useChatStore();

  return (
    <div className={styles.com}>
      {loading ? (
        <div>🚚 加载中...</div>
      ) : autoPageList.length > 0 ? (
        <div>
          <span>📝</span>&nbsp;
          <span>
            <a
              href={`${"http://192.168.8.139:8080"}${SessionJSON
                .selected_product?.url}`}
              className={styles.a_product}
            >
              {SessionJSON.selected_product?.name}
            </a>
            &nbsp;产品下有如下脚本可供选择。
          </span>
          <span>
            <span>或者，你也可以</span>
            <Button
              size="small"
              type="link"
              onClick={() => {
                AgentStore.get(
                  chatStore.currentSession().mask.name,
                ).SendMessage("请帮我创建一个脚本");
              }}
            >
              新建一个脚本
            </Button>
          </span>
        </div>
      ) : (
        <div>
          <span>😌 暂时没有相关脚本呢</span>
          <span>你可以尝试</span>
          <Button
            size="small"
            type="link"
            onClick={() => {
              AgentStore.get("XSea_查询脚本").SendMessage("我想创建一个脚本");
            }}
          >
            创建脚本
          </Button>
        </div>
      )}
      <div>
        <Tabs
          size="small"
          activeKey={tab}
          onChange={(activeKey) => {
            setTab(activeKey as ScriptType);
          }}
        >
          <TabPane tab="JMeter" key="JMETER" />
          <TabPane tab="Gatling" key="GATLING" />
          <TabPane tab="Shell" key="SHELL" />
        </Tabs>
      </div>
      <div>
        <Table
          rowKey="id"
          size="small"
          bordered
          showHeader={false}
          columns={[
            {
              dataIndex: "name",
              render: (_, row: any) => {
                return (
                  <a
                    href={`${"http://192.168.8.139:8080"}${row.url}`}
                    target="_blank"
                    className={styles.a_name}
                  >
                    {row.type === "JMETER" && (
                      <span className={styles.J}>J</span>
                    )}
                    {row.type === "GATLING" && (
                      <span className={styles.G}>G</span>
                    )}
                    {row.type === "SHELL" && (
                      <span className={styles.S}>S</span>
                    )}
                    <span className={styles.name}>{row.name}</span>
                  </a>
                );
              },
            },
          ]}
          dataSource={autoPageList}
          loading={loading}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: selectedScripts.map((script) => script.id),
            onChange: (_, selectedRows) => {
              setSelectedScripts(selectedRows);
            },
          }}
          pagination={{
            position: ["bottomLeft"],
          }}
        />
      </div>
      {autoPageList.length > 0 && (
        <div className={styles.bottom}>
          <Space className={styles.confirm_buttons}>
            <Button
              disabled={selectedScripts.length === 0}
              size="small"
              onClick={() => SetSelectedScripts([])}
            >
              清空
            </Button>
            <Button
              disabled={selectedScripts.length === 0}
              size="small"
              type="primary"
              onClick={() => {
                SetSelectedScripts(selectedScripts);
                AgentStore.get("XSea_查询脚本").SwitchAgent({
                  bridgeMessages: [
                    {
                      role: "assistant",
                      content: "",
                      component: "@ui-ScriptSelectorBye",
                      noLLM: true,
                    },
                  ],
                });
              }}
            >
              选定
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
};

export default ScriptSelector;
