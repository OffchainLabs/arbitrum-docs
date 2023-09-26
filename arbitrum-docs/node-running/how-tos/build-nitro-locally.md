---
title: 'How to build Nitro locally (Docker, Debian)'
sidebar_label: Build Nitro locally (Docker, Debian)
description: This how-to will help you build Nitro locally using Docker on Debian.
author: amsanghi
content-type: how-to
---

import PublicPreviewBannerPartial from '../../partials/_public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

This how-to is based on [Debian 11.7 (arm64)](https://cdimage.debian.org/cdimage/archive/11.7.0/arm64/iso-cd/debian-11.7.0-arm64-netinst.iso) / [Ubuntu 22.04 (amd64)](https://releases.ubuntu.com/22.04.2/ubuntu-22.04.2-desktop-amd64.iso), and [MacOS Ventura 13.4](https://developer.apple.com/documentation/macos-release-notes/macos-13_4-release-notes).

### 1. Configure prerequisites

#### For Debian/Ubuntu

```bash
apt install git curl build-essential cmake npm golang clang make gotestsum wabt lld-13
npm install --global yarn
ln -s /usr/bin/wasm-ld-13 /usr/local/bin/wasm-ld
```

#### For MacOS

Install [Homebrew](https://brew.sh/) package manager and add it to your path environment variable.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo "export PATH=/opt/homebrew/bin:$PATH" >> ~/.zprofile && source ~/.zprofile
```

(replace `~/.zprofile` with `~/.bash_profile` if you use bash instead of zsh).

Install essentials:

```bash
brew install git curl make cmake npm go gvm golangci-lint wabt llvm gotestsum
npm install --global yarn
sudo mkdir -p /usr/local/bin
sudo ln -s  /opt/homebrew/opt/llvm/bin/wasm-ld /usr/local/bin/wasm-ld
```

### 2. Configure Nitro

```bash
git clone https://github.com/OffchainLabs/nitro.git
cd nitro
git submodule update --init --recursive --force
```

### 3. Configure Node [16.19](https://github.com/nvm-sh/nvm)

#### For Debian/Ubuntu

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source "$HOME/.bashrc"
nvm install 16.19
nvm use 16.19
```

#### For MacOS

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 16.19
nvm use 16.19
```

### 4. Configure Rust [1.72.1](https://www.rust-lang.org/tools/install)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup install 1.72.1
rustup default 1.72.1
rustup target add wasm32-unknown-unknown --toolchain 1.72.1
rustup target add wasm32-wasi --toolchain 1.72.1
cargo install cbindgen
```

### 5. Configure [Docker](https://docs.docker.com/engine/install)

#### For [Debian](https://docs.docker.com/engine/install/debian)/[Ubuntu](https://docs.docker.com/engine/install/ubuntu)

```bash
for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo service docker start
```

#### For [MacOS](https://docs.docker.com/desktop/install/mac-install/)

Depending on whether your Mac has Intel Chip or Apple silicon, download corresponding
disk image from [docker](https://docs.docker.com/desktop/install/mac-install/), and move it to applications folder.

### 6. Configure Go [1.20](https://github.com/moovweb/gvm)

#### Install Bison

##### For Debian/Ubuntu

```bash
sudo apt-get install bison
```

##### For MacOS

```bash
brew install bison
```

#### Install and configure Go

```bash
bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
source "$HOME/.gvm/scripts/gvm"
gvm install go1.20
gvm use go1.20 --default
curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.54.2
```

If you use zsh, replace `bash` with `zsh`.

### 7. Start build

```bash
make
```
