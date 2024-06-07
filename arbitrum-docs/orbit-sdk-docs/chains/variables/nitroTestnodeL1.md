[Documentation](../../README.md) / [chains](../README.md) / nitroTestnodeL1

```ts
const nitroTestnodeL1: Assign<object, ChainConfig<undefined>>;
```

## Type declaration

| Member                    | Type                                 | Value               |
| :------------------------ | :----------------------------------- | :------------------ |
| `id`                      | `1337`                               | 1_337               |
| `name`                    | `"nitro-testnode-l1"`                | 'nitro-testnode-l1' |
| `nativeCurrency`          | `object`                             | ...                 |
| `nativeCurrency.decimals` | `18`                                 | 18                  |
| `nativeCurrency.name`     | `"Ether"`                            | 'Ether'             |
| `nativeCurrency.symbol`   | `"ETH"`                              | 'ETH'               |
| `network`                 | `"Nitro Testnode L1"`                | 'Nitro Testnode L1' |
| `rpcUrls`                 | `object`                             | ...                 |
| `rpcUrls.default`         | `object`                             | ...                 |
| `rpcUrls.default.http`    | readonly [`"http://127.0.0.1:8545"`] | ...                 |
| `rpcUrls.public`          | `object`                             | ...                 |
| `rpcUrls.public.http`     | readonly [`"http://127.0.0.1:8545"`] | ...                 |
| `testnet`                 | `true`                               | true                |

## Source

[src/chains.ts:13](https://github.com/anegg0/arbitrum-orbit-sdk/blob/8d986d322aefb470a79fa3dc36918f72097df8c1/src/chains.ts#L13)
