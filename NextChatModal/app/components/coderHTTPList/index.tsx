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
  />;
}

export default CoderHTTPList;
