---
title: Validate All Bridge Inputs
impact: HIGH
impactDescription: prevents loss of funds
tags: security, bridge, validation
---

## Validate All Bridge Inputs

Bridge operations handle user funds across chains. Validate addresses, amounts, and registration status before executing—failures can mean permanent fund loss.

**Incorrect (no validation):**

```typescript
// Bad: Direct bridge call without validation
await bridger.deposit({ erc20L1Address: token, amount, destinationAddress: to });
// Risk: Invalid address, unregistered token, insufficient balance
```

**Correct (validate before bridging):**

```typescript
// Good: Validate all inputs before bridge operation
if (!isAddress(to) || to === ZeroAddress) throw new Error('Invalid recipient');

const gateway = await bridger.getL1GatewayAddress(token, l1Provider);
if (gateway === ZeroAddress) throw new Error('Token not registered');

const balance = await tokenContract.balanceOf(sender);
if (balance < amount) throw new Error('Insufficient balance');

await bridger.deposit({ erc20L1Address: token, amount, destinationAddress: to });
```

| Validation         | Risk if Skipped       |
| ------------------ | --------------------- |
| Recipient address  | Permanent fund loss   |
| Token registration | Stuck in limbo        |
| Balance/allowance  | Failed tx, wasted gas |
| Refund addresses   | Funds to wrong party  |

For cross-chain security, see [Token Bridging](https://docs.arbitrum.io/build-decentralized-apps/token-bridging/token-bridge-erc20).
