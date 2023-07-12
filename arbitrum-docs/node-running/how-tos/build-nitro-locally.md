---
title: 'How to build Nitro locally (Docker, Debian)'
sidebar_label: Build Nitro locally (Docker, Debian)
description: This how-to will help you build Nitro locally using Docker on Debian.
author: amsanghi
content-type: how-to
---

import PublicPreviewBannerPartial from '../../partials/_public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

This how-to is based on [Debian 11.7 (arm64)](https://cdimage.debian.org/cdimage/archive/11.7.0/arm64/iso-cd/debian-11.7.0-arm64-netinst.iso) and [Ubuntu 22.04 (amd64)](https://releases.ubuntu.com/22.04.2/ubuntu-22.04.2-desktop-amd64.iso).

### 1. Configure prerequisites

```bash
apt install git curl build-essential cmake npm golang clang make gotestsum wabt lld-13
npm install --global yarn
ln -s /usr/bin/wasm-ld-13 /usr/local/bin/wasm-ld
```

### 2. Configure Nitro

```bash
git clone https://github.com/OffchainLabs/nitro.git
cd nitro
git submodule update --init --recursive --force
```

### 3. Configure Node [16.19](https://github.com/nvm-sh/nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source "$HOME/.bashrc"
nvm install 16.19
nvm use 16.19
```

### 4. Configure Rust [1.66.1](https://www.rust-lang.org/tools/install)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup install 1.66.1
rustup default 1.66.1
rustup target add wasm32-unknown-unknown --toolchain 1.66.1
rustup target add wasm32-wasi --toolchain 1.66.1
cargo install cbindgen
```

### 5. Configure [Docker](https://docs.docker.com/engine/install/debian/)

```bash
apt-get remove docker docker-engine docker.io containerd runc
apt-get update
apt-get install ca-certificates curl gnupg
mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
service docker start
```

### 6. Configure Go [1.19.5](https://github.com/moovweb/gvm)

```bash
bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
source "$HOME/.gvm/scripts/gvm"
apt-get install bison
gvm install go1.19.5
gvm use 1.19.5 --default
curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.52.2
```

### 7. Start build

```bash
make
```
