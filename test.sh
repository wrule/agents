#!/bin/bash
curl -X POST "https://oneapi.newbelle.com.cn/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-D6Kt082QDbdGtV4nB0E940D7AbC646C19e3bAc325c9e74C9" \
  -d '{
    "model": "Qwen2.5-32B-Instruct",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello, how are you today?"
      }
    ],
    "stream": true
  }'
