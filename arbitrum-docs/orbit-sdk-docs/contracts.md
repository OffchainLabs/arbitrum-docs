---
layout: docs
sidebar: true
toc_max_heading_level: 5
---

# contracts

## Variables

### arbAggregator

> `const` **arbAggregator**: `object`

Aggregator configuration for retrieving data from a specified source.

#### Type declaration

##### abi

> `readonly` **abi**: readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`] = `arbAggregatorABI`

##### address

> `readonly` **address**: `"0x000000000000000000000000000000000000006D"`

#### Source

[src/contracts.ts:57](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/contracts.ts#L57)

***

### arbGasInfo

> `const` **arbGasInfo**: `object`

Gas information configuration for the Arbitrum network.

#### Type declaration

##### abi

> `readonly` **abi**: readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`] = `arbGasInfoABI`

##### address

> `readonly` **address**: `"0x000000000000000000000000000000000000006C"`

#### Source

[src/contracts.ts:37](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/contracts.ts#L37)

***

### arbOwner

> `const` **arbOwner**: `object`

Arbitrum owner configuration.

#### Type declaration

##### abi

> `readonly` **abi**: readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`] = `arbOwnerABI`

##### address

> `readonly` **address**: `"0x0000000000000000000000000000000000000070"`

#### Source

[src/contracts.ts:27](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/contracts.ts#L27)

***

### arbOwnerPublic

> `const` **arbOwnerPublic**: `object`

Public configuration for the Arbitrum owner's address.

#### Type declaration

##### abi

> `readonly` **abi**: readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`] = `arbOwnerPublicABI`

##### address

> `readonly` **address**: `"0x000000000000000000000000000000000000006b"`

#### Source

[src/contracts.ts:47](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/contracts.ts#L47)

***

### erc20

> `const` **erc20**: `object`

ERC-20 token contract configuration.

#### Type declaration

##### abi

> **abi**: readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`] = `erc20ABI`

#### Source

[src/contracts.ts:18](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/contracts.ts#L18)

***

### rollupAdminLogic

> `const` **rollupAdminLogic**: `object`

Rollup Admin Logic contract configuration.

#### Type declaration

##### abi

> **abi**: readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`] = `rollupAdminLogicABI`

#### Source

[src/contracts.ts:243](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/contracts.ts#L243)

***

### rollupCreator

> `const` **rollupCreator**: `object` = `rollupCreatorConfig`

Rollup creator configuration.

#### Type declaration

##### abi

> `readonly` **abi**: readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`] = `rollupCreatorABI`

##### address

> `readonly` **address**: `object` = `rollupCreatorAddress`

##### address.1

> `readonly` **1**: `"0x90D68B056c411015eaE3EC0b98AD94E2C91419F1"` = `'0x90D68B056c411015eaE3EC0b98AD94E2C91419F1'`

##### address.11155111

> `readonly` **11155111**: `"0xfBD0B034e6305788007f6e0123cc5EaE701a5751"` = `'0xfBD0B034e6305788007f6e0123cc5EaE701a5751'`

##### address.1337

> `readonly` **1337**: `"0x596eAbE0291D4cdAfAC7ef53D16C92Bf6922b5e0"` = `'0x596eAbE0291D4cdAfAC7ef53D16C92Bf6922b5e0'`

##### address.17000

> `readonly` **17000**: `"0xB512078282F462Ba104231ad856464Ceb0a7747e"` = `'0xB512078282F462Ba104231ad856464Ceb0a7747e'`

##### address.412346

> `readonly` **412346**: `"0x3BaF9f08bAD68869eEdEa90F2Cc546Bd80F1A651"` = `'0x3BaF9f08bAD68869eEdEa90F2Cc546Bd80F1A651'`

##### address.42161

> `readonly` **42161**: `"0x9CAd81628aB7D8e239F1A5B497313341578c5F71"` = `'0x9CAd81628aB7D8e239F1A5B497313341578c5F71'`

##### address.421614

> `readonly` **421614**: `"0x06E341073b2749e0Bb9912461351f716DeCDa9b0"` = `'0x06E341073b2749e0Bb9912461351f716DeCDa9b0'`

##### address.42170

> `readonly` **42170**: `"0x9CAd81628aB7D8e239F1A5B497313341578c5F71"` = `'0x9CAd81628aB7D8e239F1A5B497313341578c5F71'`

#### Source

[src/contracts.ts:66](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/contracts.ts#L66)

***

### sequencerInbox

> `const` **sequencerInbox**: `object`

Sequencer inbox contract configuration.

#### Type declaration

##### abi

> **abi**: readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`] = `sequencerInboxABI`

#### Source

[src/contracts.ts:235](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/contracts.ts#L235)

***

### tokenBridgeCreator

> `const` **tokenBridgeCreator**: `object`

Token bridge creator configuration and ABI.

#### Type declaration

##### abi

> `readonly` **abi**: readonly [`object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`, `object`] = `tokenBridgeCreatorABI`

##### address

> `readonly` **address**: `object` = `tokenBridgeCreatorAddress`

##### address.1

> `readonly` **1**: `"0x60D9A46F24D5a35b95A78Dd3E793e55D94EE0660"` = `'0x60D9A46F24D5a35b95A78Dd3E793e55D94EE0660'`

##### address.11155111

> `readonly` **11155111**: `"0x7edb2dfBeEf9417e0454A80c51EE0C034e45a570"` = `'0x7edb2dfBeEf9417e0454A80c51EE0C034e45a570'`

##### address.1337

> `readonly` **1337**: `"0x54B4D4e578E10178a6cA602bdb6df0F213296Af4"` = `'0x54B4D4e578E10178a6cA602bdb6df0F213296Af4'`

##### address.17000

> `readonly` **17000**: `"0xac890ED9bC2494C053cE701F138958df95966d94"` = `'0xac890ED9bC2494C053cE701F138958df95966d94'`

##### address.412346

> `readonly` **412346**: `"0x38F35Af53bF913c439eaB06A367e09D6eb253492"` = `'0x38F35Af53bF913c439eaB06A367e09D6eb253492'`

##### address.42161

> `readonly` **42161**: `"0x2f5624dc8800dfA0A82AC03509Ef8bb8E7Ac000e"` = `'0x2f5624dc8800dfA0A82AC03509Ef8bb8E7Ac000e'`

##### address.421614

> `readonly` **421614**: `"0x56C486D3786fA26cc61473C499A36Eb9CC1FbD8E"` = `'0x56C486D3786fA26cc61473C499A36Eb9CC1FbD8E'`

##### address.42170

> `readonly` **42170**: `"0x8B9D9490a68B1F16ac8A21DdAE5Fd7aB9d708c14"` = `'0x8B9D9490a68B1F16ac8A21DdAE5Fd7aB9d708c14'`

#### Source

[src/contracts.ts:226](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/contracts.ts#L226)

***

### upgradeExecutor

> `const` **upgradeExecutor**: `object`

Executor for upgrades, calls, and role management.

#### Type declaration

##### abi

> **abi**: `any`

#### Source

[src/contracts.ts:72](https://github.com/anegg0/arbitrum-orbit-sdk/blob/1aa2030374f41bb1bf01834ef0c05d2e6663f5e5/src/contracts.ts#L72)
