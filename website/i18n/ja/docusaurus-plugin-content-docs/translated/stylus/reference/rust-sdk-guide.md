---
title: 'Stylus Rust SDKオーバービュー'
sidebar_label: 'Stylus Rust SDKオーバービュー'
description: 'An in-depth overview of the features provided by the Stylus Rust SDK'
author: rachel-bousfield
translator: Ying@Fracton, Naoki@Fracton, Hikaru@Fracton
sme: rachel-bousfield
sidebar_position: 1
target_audience: Developers using the Stylus Rust SDK to write and deploy smart contracts.
---

import TranslationBannerPartial from "./partials/_stylus-translation-banner-partial.md";

import PublicPreviewBannerPartial from './partials/_stylus-public-preview-banner-partial.md';

<TranslationBannerPartial />

<PublicPreviewBannerPartial />

この文書は、[Stylus Rust SDK](https://github.com/OffchainLabs/stylus-sdk-rs)が提供する機能を詳しく説明します。Rustでのスマートコントラクトのデプロイに関する情報は、`cargo stylus` [CLIツール](https://github.com/OffchainLabs/cargo-stylus)を参照してください。Stylusの概念的な紹介については、[Stylusイントロダクション](https://docs.arbitrum.io/stylus/stylus-gentle-introduction)で確認できます。た、Rustを使用して最初のStylusスマートコントラクトをデプロイする方法については、[クイックスタート](https://docs.arbitrum.io/stylus/stylus-quickstart)ガイドをご覧ください。

Stylus Rust SDKは、Rust Ethereumエコシステムを強化するクレートのコレクションである[Alloy](https://www.paradigm.xyz/2023/06/alloy)を基盤として構築されています。このSDKは、[Ethereumのタイプに対応するRustプリミティブ](https://docs.rs/alloy-primitives/latest/alloy_primitives/)を利用しており、そのためStylusは既存のRustライブラリと互換性を持っています。

:::info

この文書では、多くのアフォーダンスがマクロを利用していることについて詳細に説明しています。それぞれのマクロが具体的に何を行うのかが記述されています。Rustで高度な作業を行う際には、これらのマクロが展開される内容を理解するために[`cargo expand`](https://crates.io/crates/cargo-expand)を使用すると役立つかもしれません。

:::

Stylus SDKは、標準ライブラリを使用しないコントラクト向けに`#[no_std]`をサポートしています。実際、SDK全体は`#[no_std]`環境下でも使用可能であり、特別なフィーチャーフラグは必要ありません。この特徴はバイナリサイズを削減するのに役立ち、特に暗号化や純粋な計算用途での使用に適しています。

Stylus VMは`rustc`の`wasm32-unknown-unknown`ターゲットをサポートしており、これにより標準ライブラリの使用が可能になります。将来的には、`wasm32-wasi`ターゲットのサポートも検討されており、これにより浮動小数点数やSIMD（Single Instruction/Multiple Data）の機能も追加される可能性があります。

## ストレージ
Rustに基づくスマートコントラクトは、トランザクション間で維持される状態を使用することができます。ストレージを定義する主要な方法は2つあり、それはRustの定義を使用するか、Solidityの定義を使用するかによって異なります。どちらの方法も同等であり、開発者のニーズに応じて選択することができます。

### [`#[solidity_storage]`][solidity_storage]
[`#[solidity_storage]`][solidity_storage]マクロは、Rustが構造体を利用してストレージに使用することを可能にします。

```rust
#[solidity_storage]
pub struct Contract {
    owner: StorageAddress,
    active: StorageBool,
    sub_struct: SubStruct,
}

#[solidity_storage]
pub struct SubStruct {
    // StorageType トレイトを実装する型
}
```

`StorageType`トレイトを実装する任意の型は、他の構造体を含むフィールドとして使用することが可能です。[`[#solidity_storage]`][solidity_storage]が適用された構造体は、自動的にStorageTypeトレイトを実装します。また、開発者は[`StorageType`][StorageType]トレイトを自分で実装することにより、カスタムなストレージ型を定義することもできます。ただし、一般的なストレージ型はすでにSDKによって実装されているため、多くの場合、追加の実装は必要ありません。

| 型                                     | 情報                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| [`StorageBool`][StorageBool]             | boolを保存                                                                  |
| [`StorageAddress`][StorageAddress]       | Alloyの[`Address`][Address]を保存                                           |
| [`StorageUint`][StorageUint]             | Alloyの[`Uint`][Uint]を保存                                                 |
| [`StorageSigned`][StorageSigned]         | Alloyの[`Signed`][Signed]を保存                                             |
| [`StorageFixedBytes`][StorageFixedBytes] | Alloyの[`FixedBytes`][FixedBytes]を保存                                     |
| [`StorageBytes`][StorageBytes]           | Solidityのbytesを保存                                                        |
| [`StorageString`][StorageString]         | Solidityのstringを保存                                                       |
| [`StorageVec`][StorageVec]               | [`StorageType`][StorageType]のvectorを保存                                |
| [`StorageMap`][StorageMap]               | [`StorageKey`][StorageKey]から[`StorageType`][StorageType]へのマッピングを保存 |
| [`StorageArray`][StorageArray]           | 固定サイズの[`StorageType`][StorageType]の配列を保存                     |

すべての[Alloy primitive][alloy_primitives]には、`Storage`キーワードでそれに対応する[`StorageType`][StorageType]の実装があります。これには、[`StorageU256`][StorageUint256]や[`StorageB64`][StorageB64]などのエイリアスも含まれます。

### [`sol_storage!`][sol_storage]
[`#[solidity_storage]`] [StorageType]で定義されたタイプは、[Solidity](https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html)でのレイアウトと完全に一致してEVM状態内で配置されます。これは、Rustの構造体定義内のフィールドがEVMプログラミング言語で使用されるストレージスロットと同じ方法でマッピングされることを意味します。

Solidityの構文を用いて型を定義することで、この一致性をより明確にすることができます。例えば、上記のRustの構造体は以下のようなSolidityの構文で書き換えることが可能です：

```rust
sol_storage! {
    pub struct Contract {
        address owner;                      // StorageAddressとして扱われる
        bool active;                        // StorageBoolとして扱われる
        SubStruct sub_struct;
    }

    pub struct SubStruct {
        // 他のSolidityフィールド、例えば
        mapping(address => uint) balances;  // StorageMapとして扱われる
        Delegate delegates[];               // StorageVecとして扱われる
    }
}
```

上上記の内容はRustでの同等の定義に展開され、それぞれの構造体が[`StorageType`][StorageType]トレイトを実装します。多くのコントラクト、例えばこの[ERC20コントラクト][erc20]のように、まさにこのプロセスを採用しています。

レイアウトがSolidityと同一であるため、既存の[Solidityスマートコントラクト][sol_abi]をRustに移行する際に、ストレージスロットが一致しないことを心配する必要はありません。開発者は単に型定義をコピーしてRustに貼り付けることができます。

:::tip

既存のSolidityスマートコントラクトはプロキシパターンを使用している場合、Rustにアップグレードすることが可能です。

:::

したがって、フィールドの順序はエクスプローラーやツールが使用するJSON ABIに影響を与える可能性があります。しかし、ほとんどの開発者にとってこれは問題にならないと思います。Rustでコントラクトを一から構築する場合、型の順序を自由に設定することができます。

### ストレージへの読み書き
ストレージ型には、ゲッターとセッターを介してアクセスできます。たとえば、上記の例での`Contract`構造体は、以下のように`owner`のアドレスにアクセスできます:

```rust
impl Contract {
    /// ストレージから所有者を取得する
    pub fn owner(&self) -> Result<Address, Vec<u8>> {
        Ok(self.owner.get())
    }

    /// ストレージ内の所有者を更新する
    pub fn set_owner(&mut self, new_owner: Address) -> Result<(), Vec<u8>> {
        if msg::sender() == self.owner()? {  // msg::senderについては後で説明する
            self.owner.set(new_owner);
        }
        Ok(())
    }
}
```


Solidityでは、ストレージのアクセスパターンに注意を払う必要があります。同じ値を二度取得するか設定すると、コストが倍増し、そのため開発者はストレージアクセスを極力避ける傾向があります。しかし、Stylus SDKは最適化されたストレージキャッシングポリシーを採用しており、基本的な[`SLOAD`][SLOAD]または[`SSTORE`][SSTORE]操作を回避します。

:::tip

Stylusはストレージキャッシングを利用しているため、同じ変数への複数回のアクセスコストはほぼ無料です。

:::

ただし、ストレージは最終的にメモリよりも高コストであることに留意する必要があります。そのため、値を状態に保存する必要がない場合は、ストレージを利用しないことを推奨します。

### コレクション

[`StorageVec`][StorageVec]や[`StorageMap`][StorageMap]のような動的なコレクションが含まれており、これらは[`push`][StorageVec_push]、[`insert`][StorageMap_insert]、[`replace`][StorageMap_replace]などのメソッドを提供します。

```rust
impl SubStruct {
    pub fn add_delegate(&mut self, delegate: Delegate) -> Result<(), Vec<u8>> {
        self.delegates.push(delegate);
    }

    pub fn track_balance(&mut self, address: Address) -> Result<U256, Vec<u8>> {
        self.balances.insert(address, address.balance());
    }
}
```

一部のメソッドが[`StorageGuard`][StorageGuard]や[`StorageGuardMut`][StorageGuardMut]などの戻り型を持ちます。これにより、メモリの扱いと同様に、ストレージの誤用に対してRustの借用チェッカーを利用することが可能です。以下はコンパイルに失敗する例を示しています。

```rust
fn mistake(vec: &mut StorageVec<StorageU64>) -> U64 {
    let value = vec.setter(0);
    let alias = vec.setter(0);
    value.set(32.into());
    alias.set(48.into());
    value.get() // 問題発生。ここで返されるべき値は？
}
```

内部的には、[`vec.setter()`][StorageVec_setter] は[`&mut StorageU64`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageGuardMut.html)ではなく[`StorageGuardMut`][StorageGuardMut]を返します。ガードは[`&mut StorageVec`](https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html)のライフタイムにバウンドされているため、`value`と`alias`が同時に存在することは不可能です。これにより、Rustコンパイラは上記のコードを拒否し、ストレージのエイリアシングエラーの全クラスからの保護を実現します。

このように、Stylus SDKはストレージアクセスを保護し、Rustがメモリの安全性を確保する方法と同様に機能します。`unsafe` Rustを使用せずに、Storageをエイリアスすることは不可能です。

### [`SimpleStorageType`][SimpleStorageType]

コレクションの[`push`][StorageVec_push]や[`insert`][StorageMap_insert]などのメソッドが利用できない場合があります。これは、コレクションに追加できるのが特別なトレイトである[`SimpleStorageType`][SimpleStorageType]を実装したプリミティブのみだからです。ネストされたコレクションでは、代わりに[`grow`][StorageVec_grow]と[`setter`][StorageVec_setter]を使用します。

```rust
fn nested_vec(vec: &mut StorageVec<StorageVec<StorageU8>>) {
    let mut inner = vec.grow();  // inner経由でアクセス可能な新しい要素を追加
    inner.push(0.into());        // innerはStorageVec<StorageU8>へのガード
}

fn nested_map(map: &mut StorageMap<u32, StorageVec<U8>>) {
    let mut slot = map.setter(0);
    slot.push(0);
}
```

### [`Erase`] [Erase]と [`#[derive(Erase)]`][derive_erase]
一部の[`StorageType`][StorageType]値は[`Erase`][Erase]トレイトを実装しており、状態をクリアする[`erase()`][erase]メソッドを提供します。私たちはすべてのプリミティブとプリミティブのベクトルに[`Erase`][Erase]を実装していますが、マップには実装していません。これは、Solidityの[`mapping`][mapping]が反復処理をサポートせず、そのため通常はどのスロットをゼロに設定すべきかを知ることができないためです。

また、構造体のすべてのフィールドが[`Erase`][Erase]可能な場合、その構造体自体も構造体を[`Erase`][erase]可能になります。[`#[derive(Erase)]`][derive_erase]を使用するとで、これを自動的に行うことができます。

```rust
sol_storage! {
    #[derive(Erase)]
    pub struct Contract {
        address owner;              // プリミティブを消去できる
        uint256[] hashes;           // プリミティブのベクターを消去できる
    }

    pub struct NotErase {
        mapping(address => uint) balances; // マップを消去できない
        mapping(uint => uint)[] roots;     // マップのベクターを消去できない
    }
}
```

必要に応じて、[`Erase`][Erase]を手動で実装することもできます。[`Erase`][Erase]について気にかける理由は、状態をクリアするとストレージリファンドが発生し、コストが下がります。また、`unsafe` Rustを使用するパターンに対してもわずかな影響があります。

### ストレージキャッシュ
Stylus SDKは、状態を取得や設定する際に[`SLOAD`][SLOAD]または[`SSTORE`][SSTORE]操作を避けるための最適なストレージキャッシュポリシーを採用しています。ほとんどのユースケースでは、これはバックグラウンドで実行され、ユーザーからの入力は必要ありません。

ただし、`unsafe` Rustを使用して独自の[`StorageType`][StorageType]コレクションを実装する場合、[`StorageCache`][StorageCache]型はデータ構造に対する直接的な制御を可能にします。キャッシュを直接操作するための`unsafe`なメソッドや、それを完全にバイパスするためのメソッドも含まれています。

### 不変性と[`PhantomData`][PhantomData]

[`sol_interface!`][sol_interface]内でジェネリクスを可能にするため、[`core::marker::PhantomData`][PhantomData]は[`StorageType`][StorageType]を実装し、ゼロのスペースを占有することを保証します。これにより、ストレージスロットが変更されないことが確保されます。これはライブラリの記述時に役立つことがあります。

必要に応じて、[`Erase`][Erase]を手動で実装することも可能です。[`Erase`][Erase]に注目する理由は、状態をクリアすることでストレージのリファンドが発生し、コストが削減されることにあります。また、`unsafe` Rustを使用するパターンにもわずかながら影響を与えます。

```rust
pub trait Erc20Params {
    const NAME: &'static str;
    const SYMBOL: &'static str;
    const DECIMALS: u8;
}

sol_storage! {
    pub struct Erc20<T> {
        mapping(address => uint256) balances;
        PhantomData<T> phantom;
    }
}
```

上記の内容により、`Erc20`の利用者はスペシャライゼーションを介して不変の定数を選択できるようになります。この機能の完全な例については、[WETHサンプルコントラクト][Erc20]を参照してください。

### これからのストレージ改善作業
Stylus SDKは現在`alpha`版であり、今後のバージョンでさらなる改善が行われます。現時点では、ストレージアクセスパターンが多少冗長ですが、ほとんどの型に[DerefMut][DerefMut]を実装するとで、これは近い将来に変わるでしょう。

## メソッド
Stylus SDKのメソッドは、Solidity ABIと同等であり、異なるプログラミング言語で書かれたコントラクト間の完全な相互運用性が可能です。このセクションで詳述されているように、Rustで書かれたコントラクトを自動的にSolidityインターフェースとしてエクスポートし、他の開発者がそれをSolidityプロジェクトに統合できます。

:::tip

Stylusプログラムは、プログラミング言語を問わず組み合わせることが可能です。例えば、既存のSolidity DEXは、修正なしでRust ERC-20トークンをリストアップすることができます。

:::

### [`#[external]`][external]
このマクロは、他のコントラクトがこれらのメソッドを呼び出すために、[`Router`][Router]トレイトを実装することでメソッドを外部公開します。

```rust
#[external]
impl Contract {
    // ownerメソッドは他のコントラクトによって呼び出せるようになった
    pub fn owner(&self) -> Result<Address, Vec<u8>> {
        Ok(self.owner.get())
    }
}

impl Contract {
        // set_ownerメソッド呼び出せない
    pub fn set_owner(&mut self, new_owner: Address) -> Result<(), Vec<u8>> {
        ...
    }
}
```

現在、すべての外部メソッドはエラータイプが[`Vec<u8>`][Vec]の[`Result`][Result]を返す必要がありますが、これを非常に近い将来に変更される予定です。現在のモデルでは、[`Vec<u8>`][Vec]はプログラムのリバートデータを表しますが、将来的にはこれをオプションでよりリッチに型付けすることを検討しています。

### [`#[payable]`][payable]
Solidityと同じく、メソッドは呼び出し時にETHを受け入れることができます。

```rust
#[external]
impl Contract {
    #[payable]
    pub fn credit(&mut self) -> Result<(), Vec<u8> {
        self.erc20.add_balance(msg::sender(), msg::value())
    }
}
```

上記の例では、`msg::value`はwei単位でコントラクトに渡されたイーサの量を示し、コントラクトのビジネスロジックに応じて支払いに使用されます。[`#[payable]`][payable]アノテーションがないメソッドにイーサリアムを送ると、そのメソッドはリバートされます。これは、意図せずにイーサリアムを受け入れるつもりのないメソッドへの資金の紛失を防ぐための安全措置として重要です。

### [`#[pure]`][pure]、[`#[view]`][view]、および`#[write]`
美学的な観点から、これらの追加のpurity属性が存在し、メソッドが[`pure`][pure]、[`view`][view]、または`write`であることを明確にするためのものです。しかし、[`#[external]`][external]マクロは引数の型に基づいてpurityを自動的に判断できるため、これらは必須ではありません。

例えば、メソッドに`&self`が含まれている場合、少なくとも[view][view]と見なされます。もしそれを`write`にする場合は、`#[write]`を適用することで可能です。ただし、逆は許可されません。`&mut self`メソッドは[`#[view]`][view]にすることはできません。なぜなら、それは状態を変更する可能性があるからです。

### [`#[entrypoint]`][entrypoint]

このマクロは、Stylusの実行が開始するエントリーポイントを定義します。これがない場合、コントラクトは`cargo stylus check`を通過できません。通常、このマクロはトップレベルのストレージ構造体に注釈を付けるために使用されます。

```rust
sol_storage! {
    #[entrypoint]
    pub struct Contract {
        ...
    }

    // 一つのエントリポイントのみが許可される
    pub struct SubStruct {
        ...
    }
}
```

上記のコードは、`Contract`の外部メソッドが呼び出し時に最初に検討されるように設定します。後のセクションで継承について説明し、他のタイプの[`#[external]`][external]メソッドの呼び出しも可能になります。

### バイト入力、バイト出力プログラミング

[`#[entrypoint]`][entrypoint]のあまり一般的でない使用法の一つとして低レベルのバイト入力からバイト出力へのプログラミングがあります。独立した関数に適用されると、スマートコントラクトを書くための異なる方法が可能になり、Rust SDKのマクロやストレージタイプは完全にオプショナルとなります。

```rust
#[entrypoint]
fn entrypoint(calldata: Vec<u8>) -> ArbResult {
    // bytes-in, bytes-outプログラミング
}
```

### 再入可能性

コントラクトが他のコントラクトを呼び出し、それから呼び出されたコントラクトが再び最初のコントラクトを呼び出す場合、これを再入可能（reentrant）と呼びます。Stylusプログラムでは、このような再入可能性が発生した場合、デフォルトでリバートします。ただし、`reentrant`フラグを有効にすることで再入可能性の動作を有効にすることが出来ます。

```rust
stylus-sdk = { version = "0.3.0", features = ["reentrant"] }
```

この設定は非常に危険であり、慎重な検討の後にのみ使用すべきです。Web3における多くのハッキング事件は、開発者が再入パターンを誤用したり、完全に理解しなかったりすることが原因です。理想的には、第三者の監査者による監査を受けるべきです。

有効にした場合、Stylus SDKは再入呼び出しの間にストレージキャッシュをフラッシュし、内部の呼び出しで使用されるかもしれない状態に値を保存します。ただし、ストレージの無効化を防ぐことは悪用対策の一部に過ぎません。再入可能性を判別するには`msg::reentrant`を使用し、ビジネスロジックをそれに応じて設定してください。

### [TopLevelStorage][TopLevelStorage]
[`#[entrypoint]`][entrypoint]マクロは、注釈が付けられた`struct`に対して自動的に[`TopLevelStorage`][TopLevelStorage]トレイトを実装します。[`TopLevelStorage`][TopLevelStorage]を実装する単一の型は特別であり、それに対する可変アクセスはプログラム全体の状態に対する可変アクセスを意味します。この概念は、後のセクションで他のプログラムへの呼び出しを議論する際に重要になります。

### 継承、`#[inherit]`、`#[borrow]`

RustにおけるコンポジションはSolidityと同様です。[`#[external]`][external]が提供するトレイトである[Router][Router]を実装する型は、継承を介して接続することができます。

```rust
#[external]
#[inherit(Erc20)]
impl Token {
    pub fn mint(&mut self, amount: U256) -> Result<(), Vec<u8>> {
        ...
    }
}

#[external]
impl Erc20 {
    pub fn balance_of() -> Result<U256> {
        ...
    }
}
```

上記のように`Token`が`Erc20`を継承する場合、`Token`が[`#[entrypoint]`][entrypoint]があると、コントラクトへの呼び出しはまず`Token`内で要求されたメソッドの存在を確認します。一致する関数が見つからない場合、`Erc20`での検索が行われます。`Token`が継承しているもの全てを試した後、一致するものがなければ呼び出しはリバートします。

重要な点として、メソッドがこの順序でチェックされるため、同じメソッドが両方に実装されている場合、`Token`のメソッドが`Erc20`内のメソッドをオーバーライドし、`Erc20`のメソッドは呼び出せなくなります。これにより、開発者は標準の実装、例えばERC 20を実装したクレートを使用し、インポートされた`Erc20`型を変更せずに必要なメソッドを追加またはオーバーライドすることが可能です。

継承は連鎖的にも行えます。`#[inherit(Erc20, Erc721)]`は`Erc20`と`Erc721`の両方を継承し、その順序でメソッドをチェックします。`Erc20`と`Erc721`自体も他の型を継承することが可能です。メソッドの解決は[Depth First Search](https://en.wikipedia.org/wiki/Depth-first_search)によって最初に一致するメソッドを見つけます。

上記の動作を実現するため、`Token`は[`Borrow<Erc20>`][Borrow]を実装する必要があります。これは手動で実装できますが、簡素化のために、[`#[solidity_storage]`][solidity_storage]と[`sol_storage!`][sol_storage]は`#[borrow]`アノテーションを提供します。

```rust
sol_storage! {
    #[entrypoint]
    pub struct Token {
        #[borrow]
        Erc20 erc20;
        ...
    }

    pub struct Erc20 {
        ...
    }
}
```

将来的には、SDKを簡素化し、[`Borrow`][Borrow]が不要になり、[`Router`][Router]のコンポジションがより設定可能になる予定です。これに対する動機は、多段階の継承の複雑なケースでより明確にし、改善することです。

## Solidity インターフェースのエクスポート

Stylusのコントラクトは、Solidityを含むすべての言語間で完全に相互運用可能です。Stylus SDKは、他者が呼び出すためにSolidityインターフェースをエクスポートするためのツールを提供します。通常は`cargo stylus` [CLIツール][abi_export]を使用しますが、ここでは手動での方法を詳述します。

SDKは、`export-abi`というフィーチャーフラグを使用して、[`#[external]`][external]と[`#[entrypoint]`][entrypoint]のマクロがSolidity ABIをコンソールに出力する`main`関数を自動的に生成します。

```rust
cargo run --features export-abi --target <triple>
```

上記のコマンドは、通常の`wasm32-unknown-unknown`のようなターゲットを指定できない実行可能な`main`関数を生成します。
代わりに、ターゲットトリプルを指定する必要があります。これは`cargo stylus`が自動的に行います。この`main`関数が、Stylusコントラクトの`main.rs`ファイルに以下のように表示される理由です。

```rust
#![cfg_attr(not(feature = "export-abi"), no_main)]
```

以下はサンプルの出力例です。Rustの`snake_case`からSolidityの`camelCase`へのメソッド名の変更に注意してください。互換性のため、オンチェーンメソッドのセレクタは常に`camelCase`です。将来的にはセレクタをカスタマイズできる機能を提供する予定です。また、`address`などの引数名を心配せずに使用できます。必要に応じてSDKは`_`を前置します。

```solidity
interface Erc20 {
    function name() external pure returns (string memory);

    function balanceOf(address _address) external view returns (uint256);
}

interface Weth is Erc20 {
    function mint() external payable;

    function burn(uint256 amount) external;
}
```

## 呼び出し

ストレージやメソッドと同様に、Stylus SDKの呼び出し機能もSolidity ABIと等価です。これは、他のコントラクトの実装詳細を知る必要がないことを意味します。目的のコントラクトのSolidityインターフェースをインポートするだけで、呼び出しを行うことができます。このSolidityインターフェースは、`cargo stylus `[CLIツール][abi_export]を使用して自動生成することも可能です。

:::tip

Stylus SDKを使用すると、どのプログラミング言語で書かれたコントラクトでも呼び出すことが可能です。

:::

### [`sol_interface!`][sol_interface]

このマクロは、提供されるSolidityインターフェースごとに`struct`を定義するために使用されます。

```rust
sol_interface! {
    interface IService {
        function makePayment(address user) payable returns (string);
        function getConstant() pure returns (bytes32)
    }

    interface ITree {
        // その他のインターフェースメソッド
    }
}
```

上記の例では、`IService`と`ITree`が定義され、それぞれに属する2つのコントラクトのメソッドを呼び出すために使用できます。

例えば、`IService`には[`Address`][Address]を受け入れて[`B256`][B256]を返す`make_payment`メソッドが含まれます。

```rust
pub fn do_call(&mut self, account: IService, user: Address) -> Result<String, Error> {
    account.make_payment(self, user)  // スネークケースに注意
}
```

大文字小文字の変更に注意してください。[`sol_interface!`][sol_interface]は、渡された名前に基づいてセレクタを計算し、ほとんどの場合は`CamelCase`を使用します。しかし、美学的な理由から、Rustの関数では代わりに`snake_case`が使用されます。

### 呼び出しでガスと[`Call`][Call]を設定する

[`Call`][Call]を使用すると、オプションの設定メソッドを通じて呼び出しの設定を行うことができます。これは、Rustで[`File`][File]を開く際に設定を行う方法と似ています。

```rust
pub fn do_call(account: IService, user: Address) -> Result<String, Error> {
    let config = Call::new()
        .gas(evm::gas_left() / 2)       // 残りのガスの半分に制限する
        .value(msg::value());           // callvalueを設定する

    account.make_payment(config, user)
}
```

デフォルトでは、[`Call`][Call]は残りのすべてのガスとゼロの値を使用します。そのため、通常、[`Call::new()`][Call]はメソッドに直接渡すことが可能ます。再入可能性を扱う場合、追加の設定オプションも利用できます。

### 再入可能呼び出し

`reentrant`フィーチャーフラグをオプトインして再入可能性を有効にするコントラクトでは、追加の注意が必要です。
`storage-cache`フィーチャーが有効な場合、コントラクト間の呼び出しでは[`StorageCache`][StorageCache]を[`flush`][StorageCache_flush]や[`clear`][StorageCache_clear]して状態を保護する必要があります。これは型システムを通じて自動的に行われます。

```rust
sol_interface! {
    interface IMethods {
        function pureFoo() pure;
        function viewFoo() view;
        function writeFoo();
        function payableFoo() payable;
    }
}

#[external]
impl Contract {
    pub fn call_pure(&self, methods: IMethods) -> Result<(), Vec<u8>> {
        Ok(methods.pure_foo(self)?)    // `pure`メソッドは`view`でないと嘘をつく可能性がある
    }

    pub fn call_view(&self, methods: IMethods) -> Result<(), Vec<u8>> {
        Ok(methods.view_foo(self)?)
    }

    pub fn call_write(&mut self, methods: IMethods) -> Result<(), Vec<u8>> {
        methods.view_foo(self)?;       // `pure`および`view`メソッドも許可される
        Ok(methods.write_foo(self)?)
    }

    #[payable]
    pub fn call_payable(&mut self, methods: IMethods) -> Result<(), Vec<u8>> {
        methods.write_foo(Call::new_in(self))?;   // これらは同じ
        Ok(methods.payable_foo(self)?)            // ------------------
    }
}
```

上記の例では、`Contract`が[`TopLevelStorage`][TopLevelStorage]を実装しているため`&self`と`&mut self`を利用することで、それぞれがコントラクトの全体の状態へのアクセスを意味します。これにより、呼び出しを行うことができ、キャッシュされた値が適切なタイミングで無効化されたり、状態に永続化されたりすることが保証されます。

Stylusライブラリを作成する際、型が[`TopLevelStorage`][TopLevelStorage]でない場合、`&self`または`&mut self`は期待通りに機能しないことがあります。一般的な解決策は、[`new_in`][Call_new_in]を通じてジェネリックパラメータから[`Call`][Call]を構築することです。

```rust
pub fn do_call(
    storage: &mut impl TopLevelStorage,  // ジェネリックにすることができるが、多くの場合は単に &mut self
    account: IService,                   // Addressとしてシリアライズされる
    user: Address,
) -> Result<String, Error> {

    let config = Call::new_in(storage)   // コントラクトの全ストレージへの排他的アクセスを取得
        .gas(evm::gas_left() / 2)        // 残りのガスの半分に制限
        .value(msg::value());            // 呼び出し値を設定

    account.make_payment(config, user)   // スネークケースに注意
}
```

[`#[external]`][external]呼び出しの文脈では、`&mut impl`引数はメソッドが`write`か[`payable`][payable]であるかどうかを正しく区別します。これにより、再入可能性のフィーチャーフラグの有無にかかわらず、ライブラリコードを書くことができます。

[`Call::new_in`][Call_new_in]は[`Call::new`][Call_new]の代わりに使用すべきです。前者はストレージへのアクセスを提供するため、再入可能性が無効のコードでは型チェックに修正が必要になるかもしれません。これにより、呼び出し前にストレージの変更が永続化され、ストレージキャッシュが適切に管理されることが保証されます。

### [`call`][fn_call], [`static_call`][fn_static_call], 及び [`delegate_call`][fn_delegate_call]

[`sol_interface!`][sol_interface]と[`Call`][Call]は他のコントラクトを呼び出すための最も一般的な方法を形成しますが、それらの基礎となる[`call`][fn_call]と[`static_call`][fn_static_call]も直接使用することができます。

```rust
let return_data = call(Call::new(), contract, call_data)?;
```

この場合、calldataは[`Vec<u8>`][Vec]として提供され、成功時には生の返り値が返され、失敗時には[`Error`][CallError]が返されます。

[`delegate_call`][fn_delegate_call]も利用可能ですが、これは`unsafe`で、また、型がないため、他のコントラクトへの信頼が必要です。この関数はキャッシュされた値をクリアしますが、他のコントラクトは任意のストレージの変更を行う可能性があります。

### [`transfer_eth`][transfer_eth]
このメソッドは、イーサを転送するための便利なショートカットを提供します。

このメソッドは他のコントラクトを呼び出し、それがさらに他のコントラクトを呼び出す可能性があります。全てのガスが供給され、受信者がガスを消費することができます。これが望ましくない場合は、代わりに[`call`][fn_call]関数を使用できます。
このメソッドは他のコントラクトを呼び出し、それがさらに他のコントラクトを呼び出す可能性があります。全てのガスが供給され、受信者がガスを消費することができます。これが望ましくない場合は、[call][fn_call]関数を使用できます。

```rust
transfer_eth(recipient, value)?;                 // これら二つは同等

call(Call::new().value(value), recipient, &[])?; // これら二つは同等
```

### [`RawCall`][RawCall]と`unsafe` calls

別のコントラクトへの型指定されていない呼び出しが必要な場合、[`RawCall`][RawCall]を使用すると、オプションの設定メソッドを呼び出して`unsafe` callを設定できます。これは、Rustで[`File`][File]を開く方法を設定するのと似ています。

```rust
let data = RawCall::new_delegate()   // デリゲートコールを設定
    .gas(2100)                       // 2100ガスを供給
    .limit_return_data(0, 32)        // 最初の32バイトのみを読み戻す
    .flush_storage_cache()           // コール前にストレージキャッシュをフラッシュ
    .call(contract, calldata)?;      // コールを実行
```

注意：Reentryが有効な場合、[`call`][RawCall_call]メソッドは`unsafe`になります。詳細情報については[`flush_storage_cache`][RawCall_flush_storage_cache]および[`clear_storage_cache`][RawCall_clear_storage_cache]を参照してください。

### [`RawDeploy`][RawDeploy]と`unsafe`デプロイ

現時点でRust内部からコントラクトをデプロイする唯一の方法は[`RawDeploy`][RawDeploy]の使用です。[`RawCall`][RawCall]と同様に、この方法はReentrancyの懸念から安全ではなく、[`StorageCache`][StorageCache]の手動管理が必要です。

EVMはinitコードから他のコントラクトを呼び出すことを許可しており、これはReentryの手段を提供します。このテクニックはストレージのエイリアシングを可能にし、ストレージ参照のライフタイムの途中で使用されることがあり、Reentryが許可されている場合に発生します。

`salt`を設定した場合、[`RawDeploy`][RawDeploy]はデフォルトの[`CREATE`][CREATE]ではなく[`CREATE2`][CREATE2]を使用し、アドレスの決定性を高めます。

### イベント

SolidityスタイルのイベントをRust SDKを使用して簡単に発生させることができます。これらは、Alloyの[`sol!`][alloy_sol]マクロを使用してSolidity構文で定義し、それを[`evm::log`][evm_log]の入力引数として使用できます。この関数はAlloyの[`SolEvent`][SolEvent]トレイトを実装した任意の型を受け入れます。

```rust
sol! {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

fn foo() {
   ...
   evm::log(Transfer {
      from: Address::ZERO,
      to: address,
      value,
   });
}
```

SDKはまた、生のバイトとトピックを受け取る[`evm::raw_log`][raw_log]という低レベルの関数も提供しています。

```rust
/// Emits an evm log from combined topics and data. The topics come first.
fn emit_log(bytes: &[u8], topics: usize)
```

### EVMのAffordances

SDKには、EVMと対話するためのいくつかのモジュールが含まれており、次のようにインポートできます。

```rust
use stylus_sdk::{block, contract, crypto, evm, msg, tx};

let callvalue = msg::value();
```

| Rust SDK Module               | 説明                                           |
| ----------------------------- | ----------------------------------------------------- |
| [`block`][module_block]       | ブロックの番号、タイムスタンプなど            |
| [`contract`][module_contract] | コントラクトのアドレス、残高など          |
| [`crypto`][module_crypto]     | VMで高速化された暗号                           |
| [`evm`][module_evm]           | ink / メモリアクセス関数                        |
| [`msg`][module_msg]           | 送信者、値、再入検出               |
| [`tx`][module_tx]             | ガス代、ink代、オリジンなどのトランザクションレベルの情報 |

[abi_export]: https://github.com/OffchainLabs/cargo-stylus#exporting-solidity-abis
[StorageType]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageType.html
[StorageKey]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.StorageKey.html
[SimpleStorageType]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.SimpleStorageType.html
[TopLevelStorage]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.TopLevelStorage.html
[Erase]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.Erase.html
[erase]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/trait.Erase.html#tymethod.erase
[StorageCache]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageCache.html
[StorageCache_flush]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageCache.html#method.flush
[StorageCache_clear]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageCache.html#method.clear
[EagerStorage]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.EagerStorage.html
[StorageBool]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageBool.html
[StorageAddress]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageAddress.html
[StorageUint]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageUint.html
[StorageUint256]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/type.StorageU256.html
[StorageU64]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/type.StorageU64.html
[StorageB64]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/type.StorageB64.html
[StorageSigned]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageSigned.html
[StorageFixedBytes]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageFixedBytes.html
[StorageBytes]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageBytes.html
[StorageString]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageString.html
[StorageVec]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html
[StorageMap]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageMap.html
[StorageArray]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageArray.html
[StorageGuard]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageGuard.html
[StorageGuardMut]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageGuardMut.html
[Address]: https://docs.rs/alloy-primitives/latest/alloy_primitives/struct.Address.html
[B256]: https://docs.rs/alloy-primitives/latest/alloy_primitives/aliases/type.B256.html
[Uint]: https://docs.rs/ruint/1.10.1/ruint/struct.Uint.html
[Signed]: https://docs.rs/alloy-primitives/latest/alloy_primitives/struct.Signed.html
[FixedBytes]: https://docs.rs/alloy-primitives/latest/alloy_primitives/struct.FixedBytes.html
[alloy_sol]: https://docs.rs/alloy-sol-macro/latest/alloy_sol_macro/macro.sol.html
[evm_log]: https://docs.rs/stylus-sdk/latest/stylus_sdk/evm/fn.log.html
[raw_log]: https://docs.rs/stylus-sdk/latest/stylus_sdk/evm/fn.raw_log.html
[SolEvent]: https://docs.rs/alloy-sol-types/latest/alloy_sol_types/trait.SolEvent.html
[module_block]: https://docs.rs/stylus-sdk/latest/stylus_sdk/block/index.html
[module_contract]: https://docs.rs/stylus-sdk/latest/stylus_sdk/contract/index.html
[module_crypto]: https://docs.rs/stylus-sdk/latest/stylus_sdk/crypto/index.html
[module_evm]: https://docs.rs/stylus-sdk/latest/stylus_sdk/evm/index.html
[module_msg]: https://docs.rs/stylus-sdk/latest/stylus_sdk/msg/index.html
[module_tx]: https://docs.rs/stylus-sdk/latest/stylus_sdk/tx/index.html
[alloy_primitives]: https://docs.rs/alloy-primitives/latest/alloy_primitives/
[erc20]: https://github.com/OffchainLabs/stylus-sdk-rs/blob/stylus/examples/erc20/src/main.rs
[SLOAD]: https://www.evm.codes/#54
[SSTORE]: https://www.evm.codes/#55
[CREATE]: https://www.evm.codes/#f0
[CREATE2]: https://www.evm.codes/#f5
[StorageVec_push]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html#method.push
[StorageVec_grow]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html#method.grow
[StorageVec_setter]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageVec.html#method.setter
[StorageMap_insert]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageMap.html#method.insert
[StorageMap_replace]: https://docs.rs/stylus-sdk/latest/stylus_sdk/storage/struct.StorageMap.html#method.replace
[Router]: https://docs.rs/stylus-sdk/latest/stylus_sdk/abi/trait.Router.html
[transfer_eth]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.transfer_eth.html
[Call]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.Call.html
[Call_new]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.Call.html#method.new
[Call_new_in]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.Call.html#method.new_in
[CallError]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/enum.Error.html
[fn_call]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.call.html
[fn_static_call]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.static_call.html
[fn_delegate_call]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/fn.delegate_call.html
[RawCall]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html
[RawCall_call]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html#method.call
[RawCall_flush_storage_cache]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html#method.flush_storage_cache
[RawCall_clear_storage_cache]: https://docs.rs/stylus-sdk/latest/stylus_sdk/call/struct.RawCall.html#method.clear_storage_cache
[RawDeploy]: https://docs.rs/stylus-sdk/latest/stylus_sdk/deploy/struct.RawDeploy.html
[solidity_storage]: https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.solidity_storage.html
[sol_storage]: https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/macro.sol_storage.html
[sol_interface]: https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/macro.sol_interface.html
[derive_erase]: https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/derive.Erase.html
[external]: https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.external.html
[entrypoint]: https://docs.rs/stylus-sdk/latest/stylus_sdk/prelude/attr.entrypoint.html
[PhantomData]: https://doc.rust-lang.org/core/marker/struct.PhantomData.html
[DerefMut]: https://doc.rust-lang.org/core/ops/trait.DerefMut.html
[Result]: https://doc.rust-lang.org/core/result/
[Vec]: https://doc.rust-lang.org/alloc/vec/struct.Vec.html
[Borrow]: https://doc.rust-lang.org/core/borrow/trait.Borrow.html
[File]: https://doc.rust-lang.org/std/fs/struct.OpenOptions.html#examples
[sol_abi]: https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html
[pure]: https://docs.soliditylang.org/en/develop/contracts.html#pure-functions
[view]: https://docs.soliditylang.org/en/develop/contracts.html#view-functions
[payable]: https://docs.alchemy.com/docs/solidity-payable-functions
[mapping]: https://docs.soliditylang.org/en/latest/types.html#mapping-types

