---
layout: docs
sidebar: false
toc_max_heading_level: 5
---

```ts
const defaults: object;
```

The defaults object contains default values for various blockchain
parameters, such as block numbers and configuration settings. It includes
values for Ethereum mainnet hard forks like Homestead, Constantinople, and
Istanbul, as well as specific settings for the Arbitrum layer 2 solution. The
prepareChainConfig function utilizes these defaults to create a complete
ChainConfig object with the specified parameters.

## Type declaration

| Member | Type | Value |
| :------ | :------ | :------ |
| `arbitrum` | `object` | ... |
| `arbitrum.AllowDebugPrecompiles` | `boolean` | false |
| `arbitrum.DataAvailabilityCommittee` | `boolean` | false |
| `arbitrum.EnableArbOS` | `boolean` | true |
| `arbitrum.GenesisBlockNum` | `number` | 0 |
| `arbitrum.InitialArbOSVersion` | `number` | 20 |
| `arbitrum.MaxCodeSize` | `number` | 24\_576 |
| `arbitrum.MaxInitCodeSize` | `number` | 49\_152 |
| `berlinBlock` | `number` | 0 |
| `byzantiumBlock` | `number` | 0 |
| `clique` | `object` | ... |
| `clique.epoch` | `number` | 0 |
| `clique.period` | `number` | 0 |
| `constantinopleBlock` | `number` | 0 |
| `daoForkBlock` | `null` | null |
| `daoForkSupport` | `boolean` | true |
| `eip150Block` | `number` | 0 |
| `eip150Hash` | `string` | '0x0000000000000000000000000000000000000000000000000000000000000000' |
| `eip155Block` | `number` | 0 |
| `eip158Block` | `number` | 0 |
| `homesteadBlock` | `number` | 0 |
| `istanbulBlock` | `number` | 0 |
| `londonBlock` | `number` | 0 |
| `muirGlacierBlock` | `number` | 0 |
| `petersburgBlock` | `number` | 0 |

## Source

[src/prepareChainConfig.ts:11](https://github.com/OffchainLabs/arbitrum-orbit-sdk/blob/9d5595a042e42f7d6b9af10a84816c98ea30f330/src/prepareChainConfig.ts#L11)
