import React, { useMemo } from 'react';
import { Button, Space, Table, Tabs } from 'antd';
import { jsonrepair } from 'jsonrepair';
import { HttpType } from './httpZod';
import styles from './index.module.scss';
import { nanoid } from 'nanoid';

const { TabPane } = Tabs;

function generateJMeterCode(httpList: HttpType[]) {
  // 创建时间戳 - JMeter使用的唯一标识
  const timestamp = Date.now();
  
  // 创建HTTP请求节点
  const httpSamplers = httpList.map((http, index) => {
    // 构建URL
    const protocol = http.protocol || 'https://';
    const hostname = http.hostname || 'example.com';
    const port = http.port ? `:${http.port}` : '';
    const pathname = http.pathname || '/';
    const url = `${protocol}${hostname}${port}${pathname}`;
    
    // 构建HTTP方法
    const method = http.method || 'GET';
    
    // 请求名称
    const name = http.name || `Request ${index + 1}`;
    
    // 构建查询参数
    const queryArgs = http.queries && http.queries.length > 0 
      ? http.queries.map(([key, value]) => `
          <elementProp name="${escapeXml(key)}" elementType="HTTPArgument">
            <boolProp name="HTTPArgument.always_encode">false</boolProp>
            <stringProp name="Argument.name">${escapeXml(key)}</stringProp>
            <stringProp name="Argument.value">${escapeXml(value)}</stringProp>
            <stringProp name="Argument.metadata">=</stringProp>
            <boolProp name="HTTPArgument.use_equals">true</boolProp>
          </elementProp>`).join('')
      : '';
    
    // 构建请求体
    const bodyContent = http.body ? typeof http.body === 'string' 
      ? http.body 
      : JSON.stringify(http.body) 
      : '';
    
    // 构建请求头
    const headerManager = http.headers && http.headers.length > 0 
      ? `
        <HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP Header Manager" enabled="true">
          <collectionProp name="HeaderManager.headers">
            ${http.headers.map(([key, value]) => `
              <elementProp name="" elementType="Header">
                <stringProp name="Header.name">${escapeXml(key)}</stringProp>
                <stringProp name="Header.value">${escapeXml(value)}</stringProp>
              </elementProp>`).join('')}
          </collectionProp>
        </HeaderManager>` 
      : '';
    
    // 构造HTTP请求采样器
    return `
      <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="${escapeXml(name)}" enabled="true">
        <boolProp name="HTTPSampler.postBodyRaw">true</boolProp>
        <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
          <collectionProp name="Arguments.arguments">
            ${bodyContent ? `
            <elementProp name="" elementType="HTTPArgument">
              <boolProp name="HTTPArgument.always_encode">false</boolProp>
              <stringProp name="Argument.value">${escapeXml(bodyContent)}</stringProp>
              <stringProp name="Argument.metadata">=</stringProp>
            </elementProp>` : ''}
            ${queryArgs}
          </collectionProp>
        </elementProp>
        <stringProp name="HTTPSampler.domain">${escapeXml(hostname)}</stringProp>
        <stringProp name="HTTPSampler.port">${http.port || ''}</stringProp>
        <stringProp name="HTTPSampler.protocol">${protocol.replace('://', '')}</stringProp>
        <stringProp name="HTTPSampler.path">${escapeXml(pathname)}</stringProp>
        <stringProp name="HTTPSampler.method">${method}</stringProp>
        <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
        <boolProp name="HTTPSampler.auto_redirects">false</boolProp>
        <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
        <boolProp name="HTTPSampler.DO_MULTIPART_POST">false</boolProp>
        <boolProp name="HTTPSampler.BROWSER_COMPATIBLE_MULTIPART">false</boolProp>
        <boolProp name="HTTPSampler.image_parser">false</boolProp>
        <boolProp name="HTTPSampler.concurrentDwn">false</boolProp>
        <stringProp name="HTTPSampler.concurrentPool">6</stringProp>
        <boolProp name="HTTPSampler.md5">false</boolProp>
        <intProp name="HTTPSampler.ipSourceType">0</intProp>
        ${headerManager}
      </HTTPSamplerProxy>`;
  }).join('\n');
  
  // JMX完整模板
  const jmxTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.5">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="Generated Test Plan" enabled="true">
      <stringProp name="TestPlan.comments"></stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.tearDown_on_shutdown">true</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">
        <collectionProp name="Arguments.arguments"/>
      </elementProp>
      <stringProp name="TestPlan.user_define_classpath"></stringProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Thread Group" enabled="true">
        <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel" testclass="LoopController" testname="Loop Controller" enabled="true">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <stringProp name="LoopController.loops">1</stringProp>
        </elementProp>
        <stringProp name="ThreadGroup.num_threads">1</stringProp>
        <stringProp name="ThreadGroup.ramp_time">1</stringProp>
        <boolProp name="ThreadGroup.scheduler">false</boolProp>
        <stringProp name="ThreadGroup.duration"></stringProp>
        <stringProp name="ThreadGroup.delay"></stringProp>
        <boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp>
      </ThreadGroup>
      <hashTree>
        ${httpSamplers}
        <ResultCollector guiclass="ViewResultsFullVisualizer" testclass="ResultCollector" testname="View Results Tree" enabled="true">
          <boolProp name="ResultCollector.error_logging">false</boolProp>
          <objProp>
            <name>saveConfig</name>
            <value class="SampleSaveConfiguration">
              <time>true</time>
              <latency>true</latency>
              <timestamp>true</timestamp>
              <success>true</success>
              <label>true</label>
              <code>true</code>
              <message>true</message>
              <threadName>true</threadName>
              <dataType>true</dataType>
              <encoding>false</encoding>
              <assertions>true</assertions>
              <subresults>true</subresults>
              <responseData>false</responseData>
              <samplerData>false</samplerData>
              <xml>false</xml>
              <fieldNames>true</fieldNames>
              <responseHeaders>false</responseHeaders>
              <requestHeaders>false</requestHeaders>
              <responseDataOnError>false</responseDataOnError>
              <saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage>
              <assertionsResultsToSave>0</assertionsResultsToSave>
              <bytes>true</bytes>
              <sentBytes>true</sentBytes>
              <url>true</url>
              <threadCounts>true</threadCounts>
              <idleTime>true</idleTime>
              <connectTime>true</connectTime>
            </value>
          </objProp>
          <stringProp name="filename"></stringProp>
        </ResultCollector>
        <hashTree/>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
  `;
  
  return jmxTemplate;
}

// 辅助函数：转义XML特殊字符
function escapeXml(unsafe: string): string {
  if (unsafe === undefined || unsafe === null) return '';
  return unsafe.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

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
        return result.map((item) => ({
          ...item,
          id: nanoid(),
        }));
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

  return <div className={styles.table_wrapper}>
    <Table
      rowKey="id"
      bordered
      size="small"
      className={styles.table}
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
      pagination={{
        position: ['bottomLeft'],
      }}
    />
    <Space className={styles.controller}>
      <Button size="small" type="primary" onClick={() => {
        // 假设list是包含HttpType对象的数组
        const jmxContent = generateJMeterCode(list);

        // 创建Blob对象
        const blob = new Blob([jmxContent], { type: 'application/xml' });

        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `jmeter-test-plan-${new Date().toISOString().slice(0, 10)}.jmx`;

        // 模拟点击下载
        document.body.appendChild(link);
        link.click();

        // 清理
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 0);
      }}>导出JMX</Button>
    </Space>
  </div>;
}

export default CoderHTTPList;
