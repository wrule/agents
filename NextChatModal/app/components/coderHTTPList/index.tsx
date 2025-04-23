import React, { useMemo } from 'react';
import { Table, Tabs } from 'antd';
import { jsonrepair } from 'jsonrepair';
import { HttpType } from './httpZod';
import styles from './index.module.scss';

const { TabPane } = Tabs;

const NameValueTable = (props: { data: [string, string][] }) => {
  return <Table
    columns={[
      {
        title: 'Name',
        dataIndex: 0,
        ellipsis: true,
      },
      {
        title: 'Value',
        dataIndex: 1,
        ellipsis: true,
      }
    ]}
    dataSource={props.data}
  />;
}

const CoderHTTPList = (props: { json: string }) => {
  const list = useMemo(() => {
    try {
      const json = props.json.trim().replace(/^.*?```json|```.*?$/g, '');
      const repaired = jsonrepair(json);
      const result = JSON.parse(repaired);
      if (Array.isArray(result)) {
        return result;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }, [props.json]);

  if (list.length < 1) {
    return null;
  }

  return <Table
    bordered
    size="small"
    columns={[
      {
        title: 'Name',
        dataIndex: 'name',
        width: 150,
        ellipsis: true,
      },
      {
        title: 'Method',
        dataIndex: 'method',
        width: 90,
        ellipsis: true,
      },
      {
        title: 'URL',
        render: (row: HttpType) => {
          const url = `${
            row.protocol || ''
          }${
            row.hostname || ''
          }${
            row.port != null ? `:${row.port}` : ''
          }${
            (row.pathname || '')
          }`;
          return <a href={url}>{url}</a>;
        },
      },
    ]}
    dataSource={list}
    rowSelection={{
      type: 'checkbox',
    }}
    expandable={{
      expandedRowRender: (row: HttpType) => {
        return <Tabs>
          <TabPane key="Base" tab="Base">
          </TabPane>
          <TabPane key="Params" tab="Params">
            <NameValueTable data={row.queries ?? []} />
          </TabPane>
          <TabPane key="Headers" tab="Headers">
            <NameValueTable data={row.headers ?? []} />
          </TabPane>
          <TabPane key="Body" tab="Body"></TabPane>
          <TabPane key="ResponseHeaders" tab="ResponseHeaders">
            <NameValueTable data={row.responseHeaders ?? []} />
          </TabPane>
          <TabPane key="ResponseBody" tab="ResponseBody"></TabPane>
        </Tabs>;
      },
      expandedRowClassName: styles.expandedRowClassName,
    }}
  />;
}

export default CoderHTTPList;
