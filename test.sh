#!/bin/bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
  "model": "qwen/qwen2.5-32b-instruct",
  "messages": [
    {
      "role": "user",
      "content": "你好"
    }
  ]
}'
