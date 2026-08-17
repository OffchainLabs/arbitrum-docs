---
title: Account for L1 Data Costs in Gas Estimates
impact: MEDIUM
impactDescription: prevents failed transactions
tags: gas, l1, estimation, nitro
---

## Account for L1 Data Costs in Gas Estimates

Arbitrum transactions pay two gas components: L2 execution and L1 data posting. Standard `estimateGas` only returns L2 costs—ignoring L1 data costs causes transaction failures.

**Incorrect (L2-only estimation):**

```typescript
// Bad: Only estimates L2 execution gas
const gasLimit = await provider.estimateGas({ to, data });
// Missing L1 data posting costs - tx may fail
```

**Correct (include L1 component):**

```typescript
// Good: Use NodeInterface for complete estimate
const nodeInterface = NodeInterface__factory.connect('0x00000000000000000000000000000000000000C8', provider);
const { gasEstimateForL1 } = await nodeInterface.gasEstimateL1Component(to, false, data);
const totalGas = l2Gas + gasEstimateForL1;
```

L1 costs scale with calldata size and L1 gas prices. During L1 congestion, add a 50% buffer to L1 estimates (they're more volatile than L2).

For gas mechanics, see [Gas and Fees](https://docs.arbitrum.io/how-arbitrum-works/gas-fees).
