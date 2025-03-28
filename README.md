# perfma-gpt 部署说明

## 镜像
- 会交付一个docker镜像文件，`perfma-gpt.tar.gz`
- 镜像导入方法
  ```shell
  docker load -i perfma-gpt.tar.gz
  ```
- 导入之后`docker images -a`可以看到镜像

## docker-compose.yml
- 新建任意一个空白文件夹放入此`docker-compose.yml`文件
  ```yml
  services:
    perfma-gpt:
      image: perfma-gpt
      container_name: perfma-gpt
      environment:
        - PORT=9091
        - BASE_URL=https://dashscope.aliyuncs.com/compatible-mode
        - OPENAI_API_KEY=sk-98452617897648f5972d453da4dca0c7
        - MODEL_NAME=qwen2.5-72b-instruct
        - TESTMA_BASE_URL=http://10.10.30.103:18088
        - XSKY_BASE_URL=http://10.10.220.55:8000
      ports:
        - "8091:8091"
      command: /bin/zsh -c "source ~/.zshrc && npm run start:all"
      restart: unless-stopped
  ```

## 启动方法
  ```shell
  docker compose up -d
  ```
  - 启动成功之后可以看到`8091`端口已经暴露在外部`8091`

## 验证方法
1. 访问`http://xxxx:8091/`
2. 点击左上角`专家`
3. 点击`XSea智能体`
4. 询问`现在有哪些产品？`
5. 如看到**正确回答现有XSea平台上产品**列表，则代表功能正常
