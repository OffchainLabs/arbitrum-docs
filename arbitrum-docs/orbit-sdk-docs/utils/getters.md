[Documentation](../README.md) / utils/getters

## Functions

### getBlockExplorerUrl()

```ts
function getBlockExplorerUrl(chain: Chain): undefined | string;
```

Returns the block explorer URL for a given Chain.

#### Parameters

| Parameter | Type    |
| :-------- | :------ |
| `chain`   | `Chain` |

#### Returns

`undefined` \| `string`

#### Source

[src/utils/getters.ts:32](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/utils/getters.ts#L32)

---

### getRollupCreatorAddress()

```ts
function getRollupCreatorAddress(
  client: object,
):
  | '0x90D68B056c411015eaE3EC0b98AD94E2C91419F1'
  | '0x596eAbE0291D4cdAfAC7ef53D16C92Bf6922b5e0'
  | '0xB512078282F462Ba104231ad856464Ceb0a7747e'
  | '0x9CAd81628aB7D8e239F1A5B497313341578c5F71'
  | '0x3BaF9f08bAD68869eEdEa90F2Cc546Bd80F1A651'
  | '0x06E341073b2749e0Bb9912461351f716DeCDa9b0'
  | '0xfBD0B034e6305788007f6e0123cc5EaE701a5751';
```

Returns the address of the rollup creator for the specified chain, based on
the provided PublicClient instance.

#### Parameters

| Parameter | Type     |
| :-------- | :------- |
| `client`  | `object` |

#### Returns

\| `"0x90D68B056c411015eaE3EC0b98AD94E2C91419F1"`
\| `"0x596eAbE0291D4cdAfAC7ef53D16C92Bf6922b5e0"`
\| `"0xB512078282F462Ba104231ad856464Ceb0a7747e"`
\| `"0x9CAd81628aB7D8e239F1A5B497313341578c5F71"`
\| `"0x3BaF9f08bAD68869eEdEa90F2Cc546Bd80F1A651"`
\| `"0x06E341073b2749e0Bb9912461351f716DeCDa9b0"`
\| `"0xfBD0B034e6305788007f6e0123cc5EaE701a5751"`

#### Source

[src/utils/getters.ts:10](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/utils/getters.ts#L10)

---

### getTokenBridgeCreatorAddress()

```ts
function getTokenBridgeCreatorAddress(
  client: object,
):
  | '0x60D9A46F24D5a35b95A78Dd3E793e55D94EE0660'
  | '0x54B4D4e578E10178a6cA602bdb6df0F213296Af4'
  | '0xac890ED9bC2494C053cE701F138958df95966d94'
  | '0x2f5624dc8800dfA0A82AC03509Ef8bb8E7Ac000e'
  | '0x8B9D9490a68B1F16ac8A21DdAE5Fd7aB9d708c14'
  | '0x38F35Af53bF913c439eaB06A367e09D6eb253492'
  | '0x56C486D3786fA26cc61473C499A36Eb9CC1FbD8E'
  | '0x7edb2dfBeEf9417e0454A80c51EE0C034e45a570';
```

Returns the address of the token bridge creator for a specified parent chain.

#### Parameters

| Parameter | Type     |
| :-------- | :------- |
| `client`  | `object` |

#### Returns

\| `"0x60D9A46F24D5a35b95A78Dd3E793e55D94EE0660"`
\| `"0x54B4D4e578E10178a6cA602bdb6df0F213296Af4"`
\| `"0xac890ED9bC2494C053cE701F138958df95966d94"`
\| `"0x2f5624dc8800dfA0A82AC03509Ef8bb8E7Ac000e"`
\| `"0x8B9D9490a68B1F16ac8A21DdAE5Fd7aB9d708c14"`
\| `"0x38F35Af53bF913c439eaB06A367e09D6eb253492"`
\| `"0x56C486D3786fA26cc61473C499A36Eb9CC1FbD8E"`
\| `"0x7edb2dfBeEf9417e0454A80c51EE0C034e45a570"`

#### Source

[src/utils/getters.ts:21](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/utils/getters.ts#L21)
