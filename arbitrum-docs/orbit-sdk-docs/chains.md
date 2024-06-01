[Documentation](README.md) / chains

## Variables

### chains

```ts
const chains: readonly [Assign<object, ChainConfig<undefined>>, Assign<object, ChainConfig<undefined>>, Assign<object, ChainConfig<undefined>>, Assign<object, ChainConfig<undefined>>, Assign<object, ChainConfig<undefined>>, Assign<object, ChainConfig<undefined>>, Assign<object, ChainConfig<undefined>>, Assign<object, ChainConfig<undefined>>, Assign<object, ChainConfig<undefined>>];
```

Available chains in the application including mainnet, arbitrum, sepolia,
holesky, and nitro-testnode L1, L2, and L3. Each chain is defined with
specific network details such as id, network name, native currency, and RPC
URLs. The chains variable contains an array of these chain objects.

#### Source

[src/chains.ts:66](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/chains.ts#L66)
