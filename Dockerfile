# 请在稳定的科学网络环境上构建此镜像，最好是aws，4c16g以上的环境
FROM ubuntu:24.04

RUN apt update && apt install -y \
  curl \
  wget \
  vim \
  screen \
  zsh \
  git \
  net-tools \
  telnet \
  iputils-ping \
  unzip \
  zip \
  tar \
  grep \
  sed \
  python3 \
  python3-pip \
  && apt clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /root/agents

COPY --chown=root:root [".", "."]

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash \
  && export NVM_DIR="$HOME/.nvm" \
  && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
  && nvm install 20 \
  && nvm alias default 20 \
  && nvm use default \
  && npm install -g pm2 yarn serve \
  && npm install \
  && npm run build \
  && cd NextChatModal \
  && yarn install
  # && yarn build

RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

RUN echo '\n# nvm configuration' >> /root/.zshrc \
  && echo 'export NVM_DIR="$HOME/.nvm"' >> /root/.zshrc \
  && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> /root/.zshrc \
  && echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> /root/.zshrc
