#!/bin/bash
echo $OPENROUTER_API_KEY
curl -N https://oneapi.newbelle.com.cn/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -d '{
  "model": "Qwen2.5-32B-Instruct",
  "messages": [
    {
      "role": "user",
      "content": "写一个一百字的小作文"
    }
  ],
  "stream": true
}'
