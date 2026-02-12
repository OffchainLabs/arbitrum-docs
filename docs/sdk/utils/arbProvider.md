## Classes

### ArbitrumProvider

Defined in: utils/arbProvider.ts:69

Arbitrum specific formats

#### Extends

- `Web3Provider`

#### Constructors

##### Constructor

```ts
new ArbitrumProvider(provider: JsonRpcProvider, network?: Networkish): ArbitrumProvider;
```

Defined in: utils/arbProvider.ts:77

Arbitrum specific formats

###### Parameters

| Parameter  | Type              | Description                              |
| ---------- | ----------------- | ---------------------------------------- |
| `provider` | `JsonRpcProvider` | Must be connected to an Arbitrum network |
| `network?` | `Networkish`      | Must be an Arbitrum network              |

###### Returns

[`ArbitrumProvider`](#arbitrumprovider)

###### Overrides

```ts
Web3Provider.constructor;
```
