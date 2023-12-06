---
title: 'クイックスタート: Stylusを使用してRustでスマートコントラクトを開発'
sidebar_label: 'クイックスタート (Rust, Stylus)'
description: 'Leads a developer from 0 to 1 writing and deploying a smart contract in Rust using Stylus'
author: chrisco512
translator: Ying@Fracton, Akazawa@Fracton, Tokunaga Hikaru@Fracton
sme: chrisco512
sidebar_position: 2
target_audience: Developers writing Stylus contracts in Rust using Stylus
---
import TranslationBannerPartial from "./partials/_stylus-translation-banner-partial.md";

import PublicPreviewBannerPartial from './partials/_stylus-public-preview-banner-partial.md';

<TranslationBannerPartial />

<PublicPreviewBannerPartial />

## 前提条件

#### Rustツールチェイン
[Rustインストールページ](https://www.rust-lang.org/ja/tools/install)に記載された手順に従い、Rustツールチェインをインストールしてください。インストール後、お好きなCLIから `rustup`、`rustc`、および `cargo`などのプログラムにアクセスできることを確認してください（上記のプログラムはシステムのPATHに追加されるはずです。詳細な手順はRustのウェブサイトを参照してください）


#### VS Code
Stylusコントラクトの開発には、優れたRustサポートを提供するIDEとしてVSCodeをお勧めします。VSCodeをインストールするには、[code.visualstudio.com](https://code.visualstudio.com) を参照してください。他のテキストエディタやIDEがお好きであれば、それらを使用しても構いません。

Rust開発のための便利なVS Code拡張機能:
- [Rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)
- [Even Better TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml)
- [Crates](https://marketplace.visualstudio.com/items?itemName=serayuzgur.crates)

#### デプロイ時のテストネットETH
ライブテスト用にRustコントラクトをデプロイするには、いくらかのテストネットETHが必要です。以下で詳細に説明します。

#### 開発用ウォレット/アカウント
テストネットチェーンにデプロイ、または使用する時は、資産を持たない新しいウォレットを使用することが必要です。開発の中、コマンドライン引数として秘密鍵を含めてトランザクションを実行する事が多く発生するので、**_開発用に個人アカウントを使用しないようにしてください_**。

[Metamask](https://metamask.io/)を利用する場合、ウォレット画面の上部中央のドロップダウンボタンをクリックし、「Add Account」で新しいアカウントを作成できます。クイックスタートのために、アカウントに「開発ウォレット」、または「Stylus」などのラベルを付けると役立つことがあります。スマートコントラクトをデプロイするには、この新しく作成したアカウントの秘密鍵（およびいくつかのSepolia ETH）が必要です。秘密鍵の取得方法については、[MetaMaskのウェブサイト](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key)を参照してください。

![Stylus Wallet](./assets/stylus-wallet.png)

:::caution

**_「シークレットリカバリーフレーズ」を他の誰かと共有したり、どこに入力したりしないでください。_**
個々のアカウントに対してプライベートキーが有効ですが、秘密の回復フレーズはあなたの
ウォレット内のすべてのアカウントへのアクセスを取得するために使用できる可能性があり
ます。

:::

### テストネットETH
Stylusテストネットは、直接[Arbitrum Sepolia](/for-devs/concepts/public-chains#arbitrum-sepolia)テストネットに決済する仕組みです。以下の手順に従うことで、Stylusテストネット上でのテストETHを入手できます。

1. [https://bwarelabs.com/faucets/arbitrum-stylus-testnet](https://bwarelabs.com/faucets/arbitrum-stylus-testnet)に訪問する。
2. ウォレットアドレスを入力する。
3. `Claim`ボタンをクリックし、通常の量を受け取るか、追加のステップに応じてボーナスを受け取るかを選択します。
4. Stylusテストネット上でSepolia ETHが手に入ります。

他の方法でテストネットETHを取得したい場合、EthereumメインネットのFaucetをご利用ください：

[https://faucet.quicknode.com/arbitrum/sepolia](https://faucet.quicknode.com/arbitrum/sepolia)

[https://sepoliafaucet.com/](https://sepoliafaucet.com/)

[https://sepolia-faucet.pk910.de/](https://sepolia-faucet.pk910.de/)

## Stylusプロジェクトを作成する

![Cargo Stylus](./assets/cargo-stylus.png)

`cargo-stylus`はRustでArbitrum Stylusプログラムをビルド、検証、デプロイする為のツールです。これは、Rustプログラムの開発に使用される標準的な`Cargo`ツールのプラグインとして提供されており、一般的なRustワークフローに簡単に統合できます。[Rustがシステムにインストール](https://www.rust-lang.org/tools/install)されたら、次のコマンドを実行してStylus CLIツールをインストールしてください：

```bash
RUSTFLAGS="-C link-args=-rdynamic" cargo install --force cargo-stylus
```

続いて、RustコンパイラにWASM([WebAssembly](https://webassembly.org/))をビルドターゲットとして追加するには、次のコマンドを使用します：

```bash
rustup target add wasm32-unknown-unknown
```

Cargoコマンドとして使えるはずです：

```bash
cargo stylus --help

Cargo command for developing Arbitrum Stylus projects

Usage:
    cargo stylus new
    cargo stylus export-abi
    cargo stylus check
    cargo stylus deploy
```

### オーバービュー
cargo stylusコマンドは、`new`、`check`、`deploy`、`export-abi`など、Aribtrumチェーン開発とデプロイするために使われるツールが含まれています。以下は一般的なワークフローです：

新しいStylusプロジェクトを開始するには、以下のコマンドを使用します：


```bash
cargo stylus new <プロジェクト名>
```

上記のコマンドは、ローカルに[stylus-hello-world](https://github.com/OffchainLabs/stylus-hello-world)プロジェクト、つまりSolidity上の`Counter`スマートコントラクトのRust実装をクローンします。詳しくはstylus-hello-worldの[README](https://github.com/OffchainLabs/stylus-hello-world/blob/main/README.md)ファイルを参考にしてください。また、Solidityのプラムビングが不要なプロジェクトに適している、よりシンプルなStylusエントリーポイントを持つプロジェクトを作成するために、`cargo stylus new --minimal <プロジェクト名> `コマンドを使用することもできます。

その後、通常通りにRustプログラムを開発し、[stylus-sdk](https://github.com/OffchainLabs/stylus-sdk-rs)が提供するすべての機能を活用できます。

### Stylusプロジェクトを検証する
Stylusプロジェクトがオンチェーンで正しく**デプロイ、そしてアクティブ化**されていることを検証するには、`cargo stylus check`のサブコマンドを使います。

```
cargo stylus check
```

このコマンドは、JSON-RPCエンドポイントを指定して、トランザクションを必要とせずにプログラムをブロックチェーン上でデプロイおよびアクティブ化できるかどうかを検証しようとします。詳細なオプションについては、`cargo stylus check --help`を参照してください。

もし上記のコマンドが失敗した場合、WASMでエラーが起こる詳細な情報が表示されます：

```
Reading WASM file at bad-export.wat
Compressed WASM size: 55 B
Stylus checks failed: program predeployment check failed when checking against
ARB_WASM_ADDRESS 0x0000…0071: (code: -32000, message: program activation failed: failed to parse program)

Caused by:
    binary exports reserved symbol stylus_ink_left

Location:
    prover/src/binary.rs:493:9, data: None)

```

有効なユーザーWASMプログラムと無効なユーザーWASMプログラムについて詳しく理解するためには、[VALID_WASM](https://github.com/OffchainLabs/cargo-stylus/blob/main/VALID_WASM.md)を参照してください。もしプログラムが成功した場合、以下のメッセージが表示されます。

```
Finished release [optimized] target(s) in 1.88s
Reading WASM file at hello-stylus/target/wasm32-unknown-unknown/release/hello-stylus.wasm
Compressed WASM size: 3 KB
Program succeeded Stylus onchain activation checks with Stylus version: 1
```
プロジェクトをオンチェーンにデプロイする準備が整えた後、`cargo stylus deploy`サブコマンドを使います。まず、プロジェクトをデプロイするために使われるgas代を予測します：

```
cargo stylus deploy \
  --private-key-path=<PRIVKEY_FILE_PATH> \
  --estimate-gas-only
```

下記のようななログが表示されます：

```
Compressed WASM size: 3 KB
Deploying program to address 0x457b1ba688e9854bdbed2f473f7510c476a3da09
Estimated gas: 12756792
```

続いて、実際にオンチェーンでデプロイします。トランザクションは二つあるはずです。

```
cargo stylus deploy \
  --private-key-path=<PRIVKEY_FILE_PATH>
```

下記のログが表示されます：

```
Compressed WASM size: 3 KB
Deploying program to address 0x457b1ba688e9854bdbed2f473f7510c476a3da09
Estimated gas: 12756792
Submitting tx...
Confirmed tx 0x42db…7311, gas used 11657164
Activating program at address 0x457b1ba688e9854bdbed2f473f7510c476a3da09
Estimated gas: 14251759
Submitting tx...
Confirmed tx 0x0bdb…3307, gas used 14204908
```

トランザクションデータの送信と出力に関するさらなるオプションが存在します。詳細については、`cargo stylus deploy --help`を参照してください。

## Rust WASM以外のプロジェクトをデプロイする場合

Stylus CLIはRust以外のWASMプロジェクトをデプロイする事ができます。`--wasm-file-path`フラグでWASMファイルを特定し、cargo stylusコマンドでデプロイできます。

WebAssembly Text[(WAT)](https://www.webassemblyman.com/wat_webassembly_text_format.html)ファイルもサポートされます。これは、個々のWASMファイルであるプロジェクトを、Rustでコンパイルする必要なしにオンチェーンにデプロイできることを意味します。 C などの他の言語で作成されたWASMは、この方法でツールで使用できます。

例：
```wasm
(module
    (type $t0 (func (param i32) (result i32)))
    (func $add_one (export "add_one") (type $t0) (param $p0 i32) (result i32)
        get_local $p0
        i32.const 1
        i32.add))
```

上記のプログラムを`add.wat`にセーブし、`cargo stylus check --wasm-file-path=add.wat`、又は`cargo stylus deploy --priv-key-path=<秘密鍵ファイルPATH> --wasm-file-path=add.wat`でデプロイできます。

## Solidity ABIをエキスポート
[Stylus-sdk](https://github.com/OffchainLabs/stylus-sdk-rs)を利用するstylus RustプロジェクトにはSolidity ABIをエキスポートする選択肢があります。cargo stylusツールでexport-abiコマンドを利用します：

`cargo stylus export-abi`
