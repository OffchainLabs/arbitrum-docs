---
title: 'Stylusイントロダクション'
sidebar_label: 'Stylusイントロダクション'
description: 'An educational introduction that provides a high-level understanding of Stylus, a new way to write EVM-compatible smart contracts using your favorite programming languages.'
author: amarrazza
translator: Ying@Fracton, Naoki@Fracton, Yu@Fracton
sme: amarrazza
target_audience: 'Developers who want to build on Arbitrum using popular programming languages, like Rust'
sidebar_position: 1
---

# Stylusイントロダクション

import TranslationBannerPartial from "./partials/_stylus-translation-banner-partial.md";

import PublicPreviewBannerPartial from './partials/_stylus-public-preview-banner-partial.md';

<TranslationBannerPartial />

<PublicPreviewBannerPartial />

この紹介は、Rust等一般的なプログラミング言語を使ってArbitrumを構築したい開発者の方に向けたものです。Stylusは、お気に入りのプログラミング言語を使ってEVM互換のスマートコントラクトを開発する新しい方法です。

### 要約すると：

- Stylusを使用すると、**Rust、C、C++など**のWASMにコンパイルできるプログラミング言語でスマートコントラクトを書くことができます。
- Rustには既に豊富な言語サポートがあり、Stylus SDKとCLIツールを使用して**今すぐ開発を開始できます**。
- Stylusスマートコントラクトは、第二の等価なWASM仮想マシンを通じて**ArbitrumのEVM互換性**のメリットを享受できます。
- SolidityコントラクトとStylusコントラクトは完全に相互運用可能です。SolidityでRustプログラムを呼び出すことができ、RustでSolidityプログラムを呼び出すこともできます。
- WASMプログラムの優れた効率性により、Stylusコントラクトは**ガス料金が大幅に低く、桁違いのスピードで実行できます**。
- Stylusを使用すると、**メモリコストが100〜500倍低減**され、ブロックチェーン上でのRAM消費が現実的になります。これにより、新しいユースケースが可能になります。

### Stylusとは？

Stylusは、Arbitrum One、Arbitrum Nova、およびArbitrum Orbitチェーンを支えるテックスタックであるArbitrum Nitroのアップグレードです。このアップグレードにより、EVMに第二の等価な仮想マシンが追加され、EVMコントラクトは引き続きEthereum上での動作とまったく同じように振る舞います。**すべてが完全にEVMを拡張するよう**に設計されているため、私たちはこれを**EVM+**と呼んでいます。
Stylusは、Arbitrum One、Arbitrum Nova、およびArbitrum Orbitチェーンの基盤となる技術スタックであるArbitrum Nitroへの重要なアップグレードです。このアップグレードにより、EVM（Ethereum Virtual Machine）に第二の等価な仮想マシンが追加され、EVMコントラクトはEthereum上での動作と同様に機能します。この全体的な設計は**EVMを拡張すること**を目的としており、私たちはこの新しいシステムを**EVM+**と呼んでいます。

![Stylus gives you EVM+](./assets/stylus-gives-you-evm-plus.png)

この二つ目のVMはEVM Bytecodeではなく、WebAssembly（WASM）を実行します。WWASMは現代のバイナリ形式であり、その計算速度の向上、高速性、移植性、および人間にとっての読みやすさから、主要なWeb標準やブラウザ、企業レベルで広く採用されています。加えて、セキュリティとシンプルさを目的としたサンドボックス実行環境も備えています。ArbitrumチェーンにとってWASMは新しいことではありません。[**Nitroアップグレード**](https://medium.com/offchainlabs/arbitrum-nitro-one-small-step-for-l2-one-giant-leap-for-ethereum-bc9108047450)以降、WASMはArbitrumの完全な機能を持つ不正証明の基本要素として機能しています。

WASMVMを利用することで、WASMにコンパイル可能なあらゆるプログラミング言語がStylusで使用できるようになります。Rust、C、C++などの言語は、特にスマートコントラクト開発に適していると言われていますが、Go、Sway、Move、Cairoなどの他の言語もサポートが可能です。一方で、PythonやJavaScriptのように独自ランタイムを持つ言語のサポートは、より複雑ですが、不可能ではありません。新しい言語のサポートや既存言語用のライブラリ開発への第三者からの貢献も大いに歓迎されています。

WASMプログラムは、Solidityを使用する場合と比べて、はるかに効率的です。この効率性は、数十年にわたるRustとCのコンパイラ開発などの多くの要因に起因しています。さらに、WASMはEVMに比べて高速なランタイムを提供し、実行速度を向上させます。一般的に、WASMを使用するコントラクトは、Solidityを使用するコントラクトに比べて、**10倍の性能向上**が見られます。


### なぜそれは可能なのか？

Stylusは、Arbitrum Nitroの独自の不正証明技術を利用しています。Arbitrumネットワークで紛争が発生した場合、Nitroは**WASM**を用いてチェーンの実行を再現します。誠実なArbitrumバリデータは、紛争の対象となる特定の部分を二分探索法を使用して特定し、単一の無効なステップを特定します。このステップは、チェーン上で[**「ワンステッププルーフ」**](https://docs.arbitrum.io/proving/challenge-manager#general-bisection-protocol)を通じて確認されます。

これは、Nitroが**任意のWASMプログラム**を確定的に証明できることを意味します。

WASMが証明可能であることにより、WASMにコンパイルされる**任意のプログラム**の正確性も証明可能です。これがStylusの実現における技術的な飛躍です。

Nitroの技術的アーキテクチャの詳細については、[**Nitroドキュメンテーション**](https://docs.arbitrum.io/inside-arbitrum-nitro/)または[**Nitroホワイトペーパー**](https://github.com/OffchainLabs/nitro/blob/master/docs/Nitro-whitepaper.pdf)で詳しく学ぶことができます。

### これはなぜ重要なのか

Stylusは複数のレベルで革新的であり、その要点は以下の通りです：

#### 一つのチェーン、多くの言語

約20,000人のSolidity開発者に対して、RustやCの開発者は数百万人に上ります。[[1](https://www.slashdata.co/blog/state-of-the-developer-nation-23rd-edition-the-fall-of-web-frameworks-coding-languages-blockchain-and-more)]。Stylusにより、これらの開発者は好きなプログラミング言語を使い、Arbitrumチェーン上で相互運用が可能になります。これにより、次の数百万人の開発者を取り込み、次の数十億人のユーザーへの拡張が見込めます。

#### EVM+

Stylusを搭載したArbitrumチェーンでは、開発者はEVMのすべての利点を享受しつつ、Rust、C、C++の既存ライブラリへアクセス出来ます。これにより、EVMの等価性はもはや制約ではなく、基準となります。

#### 高度な暗号化を低コストで実現可能

Stylusにより、計算性能は10倍以上、メモリ効率は100倍以上に改善されます。これにより、暗号ライブラリのカスタムプリコンパイルの展開が容易になり、ブロックチェーンイノベーションの新たな可能性が開かれます。

#### 再入可能性の任意化

Stylusはコスト削減とスピード向上だけでなく、WASMのおかげで安全性も向上します。再入可能性はSolidity開発者が避けることに苦労する普遍的な脆弱性です。Stylusは低コストで再入可能性を検出できます。RustSDKを使用することで、再入可能性はデフォルトで無効になり、意図的に有効化しない限り無効のままです。

#### 完全な相互運用性

SolidityプログラムとWASMプログラムは完全に互換性があります。Solidityで作業している場合、開発者はRustプログラムを呼び出すか、異なる言語で別の依存関係を利用できます。Rustで作業している場合、Solidityの全機能を直接利用できます。

### 動作原理

Stylusの動作原理は、主に4つのステップから構成されます：コーディング、コンパイル、実行、証明。

#### コーディング

基本的に、開発者はWASMにコンパイル可能な任意のプログラミング言語でスマートコントラクトを書くことができます。実際には、一部の高水準言語が他の言語よりも効率的なWASMを生成します。

初期段階では、Rust、C、C++がサポートされます。Rustは最初から豊富な言語サポートを提供し、Rustでスマートコントラクトを作成するためのオープンソースSDKも用意されています。CとC++も初めからサポートされ、これらの言語で既存のコントラクトを最小限の修正でチェーン上に展開できます。

Rust向けStylus SDKには、多くの開発者がStylusを利用する際に必要なスマートコントラクト開発フレームワークと言語機能が含まれています。このSDKは、EVM固有の機能を全て実行することも可能です。[**Rust SDKガイド**](https://docs.arbitrum.io/stylus/reference/rust-sdk-guide)と[**Crateドキュメンテーション**](https://docs.rs/stylus-sdk/latest/stylus_sdk/index.html)を参照してください。

#### コンパイル

Stylusプログラムは2段階でコンパイルされます。最初の段階は高水準言語（Rust、C、またはC++など）からWASMへのコンパイルで、次の段階は「アクティベーション」と呼ばれるプロセスで、WASMからノードのネイティブマシンコード（例：ARMやx86）へのコンパイルです。

最初のコンパイル段階では、Rust用のStylus SDKに含まれるCLIツールか、CやC++の場合はClangなどの他のコンパイラを使用します。コンパイル完了後、WASMはチェーン上に投稿され、この時点でコントラクトの挙動は定義された状態になりますが、アクティベーションされるまでコール出来ません。

Stylusプログラムのアクティベーションには、`ArbWasm`という新しいプリコンパイルが必要です。このプリコンパイルは、ノードのネイティブアセンブリに最適化されたバイナリコードを生成します。この段階で、一連のミドルウェアがプログラムの安全な実行と決定的な不正証明を保証します。この計装にはガスメータリング、スタック深度チェック、メモリチャージングなどが含まれ、WASMプログラムがチェーン上で安全に実行できることを確保します。

#### 実行

Stylusプログラムは、主流なWebAssemblyランタイムである[**Wasmer**](https://wasmer.io/)を、ブロックチェーン固有のユースケースに最適化するために最小限の変更行い、実行されます。Wasmerは、GethがEVMバイトコードを実行するよりも高速にネイティブコードを実行し、Stylusのガス節約に貢献します。

EVMコントラクトは、Stylus導入前と同じ方法で実行され続けます。コントラクトが呼び出される際、EVMコントラクトとWASMプログラムの違いは[**EOF**](https://notes.ethereum.org/@ipsilon/evm-object-format-overview)に基づくコントラクトヘッダを介して識別されます。その後、対応するランタイムでコントラクトが実行されます。SolidityとWASMで記述されたコントラクトは相互に呼び出しが可能で、開発者は使用言語を考慮する必要がありません。全てが相互運用可能です。

#### 証明

Nitroには「ハッピーケース」と「サッドケース」があります。通常は「ハッピーケース」として、実行履歴はネイティブコードにコンパイルされます。バリデータ間の紛争が発生する「サッドケース」では、Nitroは実行履歴をWASMにコンパイルし、Ethereumメインネットで対話型の不正証明を行います。StylusはNitroの不正証明技術の自然な拡張であり、それを利用して実行履歴のみならず、開発者によってデプロイされたWASMプログラムに対する二分探索も行うことができます。

### 続き

Stylusのテストネットは誰でも利用可能です。最高のプログラミング体験を提供するため、多くの工夫が施されています。しかし、これで作業が終わるわけではありません。開発者からのフィードバックは、Stylusをさらに進化させ、ツールやドキュメンテーション、言語機能の向上に役立ちます。Stylusの早期採用者になることで、提供される新しい機会に慣れることができます。

Stylusにより、多くの新しい可能性が開かれています。その中には以下のようなものがあります：

- secp256r1などの署名スキームのカスタムプリコンパイル
- 大量のRAMを消費するジェネラティブアートライブラリ
- C++で記述された既存のゲーム
- 計算量が多いAIモデル

Stylusの最も興味深い部分は、EVMでは考えられなかった革新的なユースケースを可能にすることです。これは、これまで不可能だったことです。

多くの開発者は新しいユースケースに惹かれますが、既存のアプリケーションをStylusで再構築することも、イノベーションの扉を開くことにつながります。dAppsはこれまで以上に高速で、低コストで、安全になりました。

Stylusに興味のある開発者の皆さんは、[**クイックスタート**](https://docs.arbitrum.io/stylus/stylus-quickstart)を訪れ、[**Discordチャンネル**](https://discord.com/invite/arbitrum)に参加し、開発を始めてみることをお勧めします！
