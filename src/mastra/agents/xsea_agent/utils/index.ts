import http from '../api/http';

export type XSeaType = 'PRODUCT' | 'SCRIPT' | 'PLAN' | 'GOAL' | 'RECORD' | 'REPORT' | 'SCHEDULE';
export type XSeaName = '产品' | '脚本' | '计划' | '目标' | '压测记录' | '测试报告' | '定时任务';
export const XSeaTypeName: { [key in XSeaType]: XSeaName } = {
  'PRODUCT': '产品',
  'SCRIPT': '脚本',
  'PLAN': '计划',
  'GOAL': '目标',
  'RECORD': '压测记录',
  'REPORT': '测试报告',
  'SCHEDULE': '定时任务',
};
export const XSeaNameType: { [key in XSeaName]: XSeaType } = {
  '产品': 'PRODUCT',
  '脚本': 'SCRIPT',
  '计划': 'PLAN',
  '目标': 'GOAL',
  '压测记录': 'RECORD',
  '测试报告': 'REPORT',
  '定时任务': 'SCHEDULE',
};
export const XSeaNameField: { [key in XSeaType]: string } = {
  'PRODUCT': 'productName',
  'SCRIPT': 'scriptName',
  'PLAN': 'planName',
  'GOAL': 'goalName',
  'RECORD': 'recordName',
  'REPORT': 'reportName',
  'SCHEDULE': 'scheduleName',
};

export const exactSearch = async (query: string, type: XSeaType) => {
  const { data } = await http.post(`xsea/vector/query`, { type, text: query, topK: 2, filterScore: true, filterMap: { } });
  const list = data.object?.map((item: any) => ({
    ...item.data,
    score: item.score,
  })) ?? [];
  console.log('exactSearch', query, type, list);
  const first = list[0];
  const second = list[1];
  const typeName = XSeaTypeName[type];
  if (!first) {
    return { confusion: `根据查询短语[${query}]，未能找到任何${typeName}，请引导用户更清晰的描述${typeName}` };
  }
  if (!second) {
    return { first };
  }
  if (first.score - second.score >= 5) {
    return { first };
  }

  const firstName = first[XSeaNameField[type]]?.toLowerCase();
  const secondName = second[XSeaNameField[type]]?.toLowerCase();
  if (firstName && secondName) {
    if (
      query.toLocaleLowerCase().includes(firstName) &&
      !query.toLocaleLowerCase().includes(secondName)
    ) {
      return { first };
    }
    if (
      query.toLocaleLowerCase().includes(secondName) &&
      !query.toLocaleLowerCase().includes(firstName)
    ) {
      return { first: second };
    }
  }

  const confusion = `根据查询短语[${query}]，未能精准找到${typeName}，存在多个匹配项目，比如 ${JSON.stringify(first)} 和 ${JSON.stringify(second)}，请列出这两个匹配项目后引导用户更清晰的描述${typeName}`;
  return { first, confusion };
};

export const fuzzySearch = async (query: string, type: XSeaType) => {
  const { data } = await http.post(`xsea/vector/query`, { type, text: query, topK: 50, filterScore: false, filterMap: { } });
  const list: any[] = data.object?.map((item: any) => ({
    ...item.data,
    score: item.score,
  })) ?? [];
  console.log('fuzzySearch', query, type, list);
  return list;
};

export
interface ToolResult {
  success: boolean;
  prompt?: string;
  [key: string]: any;
}

export
async function toolExecute<T>(name: string, t: T, callback: (t: T) => Promise<ToolResult>): Promise<ToolResult> {
  let result: ToolResult;
  console.log(name, '->', t);
  try {
    result = await callback(t);
  } catch (error: any) {
    result = {
      success: false,
      prompt: `调用错误消息为：${error.message ?? '未知错误'}，请向用户解释，并引导用户正确操作`,
    };
  }
  console.log(name, '<-', result);
  return result;
}
