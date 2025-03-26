import { NextRequest } from "next/server";
import model from "../../../model";

export async function POST(request: NextRequest, { params }: { params: any }) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // 生成唯一的会话ID
  const chatId = "chatcmpl-" + Math.random().toString(36).substring(2, 8);
  const created = Math.floor(Date.now() / 1000);

  (async () => {
    try {
      const modelStream = await model.stream([
        { role: "user", content: "你好" },
      ]);

      for await (const chunk of modelStream) {
        const content = chunk.content || "";

        // 构造 OpenAI 格式的响应
        const responseChunk = {
          id: chatId,
          object: "chat.completion.chunk",
          created: created,
          model: "perfma-gpt",
          system_fingerprint: "fp_ollama",
          choices: [
            {
              index: 0,
              delta: {
                role: "assistant",
                content: content,
              },
              finish_reason: null,
            },
          ],
        };

        // 按 SSE 格式发送
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(responseChunk)}\n\n`),
        );
      }

      // 发送完成消息
      const finalChunk = {
        id: chatId,
        object: "chat.completion.chunk",
        created: created,
        model: "perfma-gpt",
        system_fingerprint: "fp_ollama",
        choices: [
          {
            index: 0,
            delta: {
              role: "assistant",
              content: "",
            },
            finish_reason: "stop",
          },
        ],
      };

      await writer.write(
        encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`),
      );
      await writer.write(encoder.encode("data: [DONE]\n\n"));
    } catch (error: any) {
      console.error("Stream Error:", error);
      // 可以选择发送错误信息
      const errorChunk = {
        error: {
          message: error.message,
          type: "stream_error",
        },
      };
      await writer.write(
        encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`),
      );
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
