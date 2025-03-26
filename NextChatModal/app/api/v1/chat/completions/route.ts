import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body1 = await request.json();
    const lastMessage = body1.messages[body1.messages.length - 1];
    const body = {
      messages: [lastMessage],
      resourceId: 'XSea智能体',
      runId: 'XSea智能体',
      threadId: body1.threadId || 'common',
      stream: true,
    };

    console.log('SSE代理请求', body);

    // 从您的接口获取数据
    const response = await fetch('http://localhost:4111/api/agents/XSea智能体/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // 检查响应是否成功
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.statusText}`);
    }
    
    // 建立一个用于SSE的流响应
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // 创建文本解码器和处理未完成的行
    const decoder = new TextDecoder();
    let buffer = '';
    let messageId = `chatcmpl-${Date.now()}`;
    
    // 处理原始响应流
    const reader = response.body!.getReader();
    
    // 开始处理流
    processStream();
    
    async function processStream() {
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // 处理可能遗留在buffer中的最后一行
            if (buffer.trim()) {
              await processLine(buffer);
            }
            
            // 确保发送完成标记
            const doneMessage = `data: [DONE]\n\n`;
            await writer.write(new TextEncoder().encode(doneMessage));
            
            // 关闭流
            await writer.close();
            break;
          }
          
          // 解码当前块和处理行
          const text = decoder.decode(value, { stream: true });
          buffer += text;
          
          // 按行处理
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 最后一行可能不完整，保留到下一次
          
          for (const line of lines) {
            await processLine(line);
          }
        }
      } catch (error) {
        console.error('处理流时出错:', error);
        await writer.abort(error);
      }
    }

    async function processLine(line: string) { // 明确类型为 string
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // 处理首行 messageId
      if (trimmedLine.startsWith('f:')) {
        try {
          const match = trimmedLine.match(/f:(.+)/);
          if (match && match[1]) {
            const data = JSON.parse(match[1]);
            messageId = data.messageId || `chatcmpl-${Date.now()}`;
          }
        } catch (e) {
          console.error('解析messageId出错:', e);
        }
        return;
      }
      
      // 处理内容行
      if (trimmedLine.startsWith('0:')) {
        try {
          // 提取内容部分 - 格式为 0:"内容"
          const match = trimmedLine.match(/0:"(.*)"/);
          if (match && match[1] !== undefined) {
            let content = match[1];
            // 处理转义的换行符，将 \\n 替换为 \n
            content = content.replace(/\\n/g, '\n');
            // 如果内容包含 Markdown 语法，可以选择保留原始格式
            // 或者在此处对 Markdown 进行预处理（视需求而定）

            const message = {
              id: messageId,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: 'gpt-3.5-turbo',
              choices: [
                {
                  index: 0,
                  delta: {
                    content: content
                  },
                  finish_reason: null
                }
              ]
            };
            
            // 发送SSE消息
            const sseMessage = `data: ${JSON.stringify(message)}\n\n`;
            await writer.write(new TextEncoder().encode(sseMessage));
          }
        } catch (e) {
          console.error('处理内容行出错:', e);
        }
        return;
      }
      
      // 处理结束信号
      if (trimmedLine.startsWith('e:')) {
        try {
          // 提取完成原因
          const match = trimmedLine.match(/e:(.+)/);
          if (match && match[1]) {
            const data = JSON.parse(match[1]);
            const finishReason = data.finishReason || 'stop';
            
            // 发送最后一个delta，空对象带finish_reason
            const finalMessage = {
              id: messageId,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: 'gpt-3.5-turbo',
              choices: [
                {
                  index: 0,
                  delta: {}, // 空对象表示内容结束
                  finish_reason: finishReason
                }
              ]
            };
            
            // 发送最终消息
            const sseMessage = `data: ${JSON.stringify(finalMessage)}\n\n`;
            await writer.write(new TextEncoder().encode(sseMessage));
          }
        } catch (e) {
          console.error('处理结束信号出错:', e);
        }
      }
    }
    
    // 返回流式响应
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error: any) {
    return NextResponse.json(
      {
        code: 500,
        message: error.message || "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
