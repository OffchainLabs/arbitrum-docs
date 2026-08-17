---
title: Register Tokens Before Bridging
impact: HIGH
impactDescription: enables token bridging
tags: sdk, gateway, token, bridge
---

## Register Tokens Before Bridging

Custom ERC20 tokens must be registered with a gateway before bridging. Attempting to bridge an unregistered token fails or sends tokens to the wrong address.

**Incorrect (bridge without checking registration):**

```typescript
// Bad: Bridging without verifying registration
await bridger.deposit({ erc20L1Address: token, amount, ... })
// Fails if token not registered with gateway
```

**Correct (check registration first):**

```typescript
// Good: Verify gateway registration before bridging
const gateway = await bridger.getL1GatewayAddress(token, l1Provider)
if (gateway === ZeroAddress) {
  throw new Error('Token not registered - cannot bridge')
}
await bridger.deposit({ erc20L1Address: token, amount, ... })
```

| Gateway        | Use Case                           |
| -------------- | ---------------------------------- |
| Standard ERC20 | Most tokens (auto-mint/burn on L2) |
| Custom Gateway | Rebasing, fee-on-transfer tokens   |
| WETH Gateway   | Wrapped ETH (pre-deployed)         |

Registration requires deploying an L2 token implementing `IArbToken` (bridgeMint/bridgeBurn).

For gateway setup, see [Token Bridging](https://docs.arbitrum.io/build-decentralized-apps/token-bridging/bridge-tokens-programmatically).
