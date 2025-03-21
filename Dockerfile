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

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash \
  && export NVM_DIR="$HOME/.nvm" \
  && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
  && nvm install 20 \
  && nvm alias default 20 \
  && nvm use default \
  && npm install -g pm2 yarn serve
