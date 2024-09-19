---
title: 'How to build Nitro locally (Debian, Ubuntu, MacOS)'
description: This how-to provides step-by-step instructions for building Nitro locally using Docker on Debian, Ubuntu, or MacOS.
author: amsanghi
sidebar_position: 7
content_type: how-to
---

import PublicPreviewBannerPartial from '../../partials/_public-preview-banner-partial.mdx';

<PublicPreviewBannerPartial />

Arbitrum Nitro is the software that powers all Arbitrum chains. This how-to shows how you can build a Docker image, or binaries, directly from Nitro's source code. If you want to run a node for one of the Arbitrum chains, however, it is recommended that you use the docker image available on DockerHub, as explained in [How to run a full node](/run-arbitrum-node/03-run-full-node.md).

This how-to assumes that you're running one of the following operating systems:

- [Debian 11.7 (arm64)](https://cdimage.debian.org/cdimage/archive/11.7.0/arm64/iso-cd/debian-11.7.0-arm64-netinst.iso)
- [Ubuntu 22.04 (amd64)](https://releases.ubuntu.com/22.04.2/ubuntu-22.04.2-desktop-amd64.iso)
- [MacOS Ventura 13.4](https://developer.apple.com/documentation/macos-release-notes/macos-13_4-release-notes).

## Build a Docker image

### Step 1. Configure [Docker](https://docs.docker.com/engine/install)

#### For [Debian](https://docs.docker.com/engine/install/debian)/[Ubuntu](https://docs.docker.com/engine/install/ubuntu)

```shell
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

Depending on whether your Mac has an Intel processor or Apple silicon, download the corresponding disk image from [Docker](https://docs.docker.com/desktop/install/mac-install/), and move it into your Applications folder.

#### [Optional] Run docker from a different user

After installing docker, you might want to be able to run it with your current user instead of root. You can run the following commands to do so.

```shell
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

For troubleshooting, check Docker's section in [their documentation](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user)

### Step 2. Download the Nitro source code

```shell
git clone --branch @nitroVersionTag@ https://github.com/OffchainLabs/nitro.git
cd nitro
git submodule update --init --recursive --force
```

### Step 3. Build the Nitro node Docker image

```shell
docker build . --tag nitro-node
```

That command will build a Docker image called `nitro-node` from the local source.

## Build Nitro's binaries natively

If you want to build the node binaries natively, execute steps 1-3 of the [Build a Docker image](#build-a-docker-image) section and continue with the steps described here. Notice that even though we are building the binaries outside of Docker, it is still used to help build some WebAssembly components.

### Step 4. Configure prerequisites

#### For Debian/Ubuntu

```shell
apt install git curl build-essential cmake npm golang clang make gotestsum wabt lld-13 python3
npm install --global yarn
ln -s /usr/bin/wasm-ld-13 /usr/local/bin/wasm-ld
```

#### For MacOS

Install [Homebrew](https://brew.sh/) package manager and add it to your `PATH` environment variable:

```shell
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo "export PATH=/opt/homebrew/bin:$PATH" >> ~/.zprofile && source ~/.zprofile
```

(replace `~/.zprofile` with `~/.bash_profile` if you use bash instead of zsh).

Install essentials:

```shell
brew install git curl make cmake npm go gvm golangci-lint wabt llvm gotestsum
npm install --global yarn
sudo mkdir -p /usr/local/bin
sudo ln -s  /opt/homebrew/opt/llvm/bin/wasm-ld /usr/local/bin/wasm-ld
```

### Step 5. Configure node [18](https://github.com/nvm-sh/nvm)

#### For Debian/Ubuntu

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source "$HOME/.bashrc"
nvm install 18
nvm use 18
```

#### For MacOS

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18
nvm use 18
```

### Step 6. Configure Rust [1.73](https://www.rust-lang.org/tools/install)

```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup install 1.73
rustup default 1.73
rustup target add wasm32-unknown-unknown --toolchain 1.73
rustup target add wasm32-wasi --toolchain 1.73
cargo install cbindgen
```

### Step 7. Configure Go [1.21](https://github.com/moovweb/gvm)

#### Install Bison

##### For Debian/Ubuntu

```shell
sudo apt-get install bison
```

##### For MacOS

```shell
brew install bison
```

#### Install and configure Go

```shell
bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
source "$HOME/.gvm/scripts/gvm"
gvm install go1.21
gvm use go1.21 --default
curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.54.2
```

If you use zsh, replace `bash` with `zsh`.

#### Install foundry

```shell
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Step 8. Start build

```shell
make
```

### Step 9. Produce binaries

```shell
make build
```

#### Warnings on MacOS

In MacOS with Apple Silicon, warnings like the following might appear but they will not hinder the compilation process.

```
ld: warning: object file was built for newer 'macOS' version (14.4) than being linked (14.0)
```

To solve these warnings, export the following environment variables before building Nitro.

```
export MACOSX_DEPLOYMENT_TARGET=$(sw_vers -productVersion)
export CGO_LDFLAGS=-Wl,-no_warn_duplicate_libraries
```

### Step 10. Run your node

To run your node using the generated binaries, use the following command from the `nitro` folder, with your desired parameters

```shell
./target/bin/nitro <node parameters>
```

#### WASM module root error (v2.3.4 or later)

Since v2.3.4, the State Transition Function (STF) contains code that is not yet activated on the current mainnet and testnet chains. Because of that, you might receive the following error when connecting your built node to those chains:

```
ERROR[05-21|21:59:17.415] unable to find validator machine directory for the on-chain WASM module root err="stat {WASM_MODULE_ROOT}: no such file or directory"
```

Try add flag:

```shell
--validation.wasm.allowed-wasm-module-roots={WASM_MODULE_ROOT}
```
