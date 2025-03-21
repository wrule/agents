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
