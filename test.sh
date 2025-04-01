#!/bin/bash
echo $OPENROUTER_API_KEY
curl https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
  "model": "qwen2.5-72b-instruct",
  "messages": [
    {
      "role": "user",
      "content": "你好"
    }
  ]
}'
