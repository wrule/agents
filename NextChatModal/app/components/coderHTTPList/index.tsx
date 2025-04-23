import { Table } from 'antd';
import React, { useMemo } from 'react';
import { jsonrepair } from 'jsonrepair';
import { HttpType } from './httpZod';

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
          return `${row.protocol || ''}${row.hostname || ''}${row.port ? `:${row.port}` : ''}${row.pathname || ''}`;
        },
      },
    ]}
    dataSource={list}
  />;
}

export default CoderHTTPList;
