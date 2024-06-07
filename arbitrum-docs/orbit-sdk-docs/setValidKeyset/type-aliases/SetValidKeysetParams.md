[Documentation](../../README.md) / [setValidKeyset](../README.md) / SetValidKeysetParams

```ts
type SetValidKeysetParams<TChain>: object;
```

## Type parameters

| Type parameter                            |
| :---------------------------------------- |
| `TChain` _extends_ `Chain` \| `undefined` |

## Type declaration

| Member          | Type                                                                                                                            |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `coreContracts` | `Pick`\<[`CoreContracts`](../../types/CoreContracts/type-aliases/CoreContracts.md), `"upgradeExecutor"` \| `"sequencerInbox"`\> |
| `keyset`        | \`0x$\{string\}\`                                                                                                               |
| `publicClient`  | `PublicClient`\<`Transport`, `TChain`\>                                                                                         |
| `walletClient`  | `WalletClient`                                                                                                                  |

## Source

[src/setValidKeyset.ts:8](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/setValidKeyset.ts#L8)
