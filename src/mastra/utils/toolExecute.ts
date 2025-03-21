
export
interface ToolExecuteResult {
  success: boolean;
  prompt?: string;
  [key: string]: unknown;
}

export default
async function toolExecute<T>(name: string, t: T, callback: (t: T) => Promise<ToolExecuteResult>): Promise<ToolExecuteResult> {
  let result: ToolExecuteResult;
  console.log(name, '->', t);
  try {
    result = await callback(t);
  } catch (error: any) {
    result = {
      success: false,
      prompt: `调用错误消息为：${error?.message ?? '未知错误'}\n请向用户解释，并引导用户正确操作`,
    };
  }
  console.log(name, '<-', result);
  return result;
}
