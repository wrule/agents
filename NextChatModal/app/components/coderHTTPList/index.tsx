import { Table } from 'antd';
import React, { useMemo } from 'react';
import { jsonrepair } from 'jsonrepair';

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

  return <Table
    bordered
    size="small"
    columns={[
      {
        title: 'Name',
        dataIndex: 'name',
      },
      {
        title: 'Method',
        dataIndex: 'method',
      },
      {
        title: 'URL',
        render: (row) => {
          return 1;
        },
      }
    ]}
    dataSource={list}
  />;
}

export default CoderHTTPList;
