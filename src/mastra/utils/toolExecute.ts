
export
interface ToolResult {
  success: boolean;
  prompt?: string;
  [key: string]: any;
}

export default
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
