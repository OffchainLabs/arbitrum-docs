---
title: L2-to-L1 Messages Require Challenge Period
impact: CRITICAL
impactDescription: withdrawal timing
tags: bridge, l2-l1, messaging, withdrawals
---

## L2-to-L1 Messages Require Challenge Period

L2-to-L1 withdrawals cannot execute immediately. The ~7 day challenge period is fundamental to optimistic rollup security—it allows fraud proofs to be submitted if the state is invalid.

**Incorrect (expecting immediate execution):**

```typescript
// Bad: Attempting to execute immediately after sending
const tx = await arbSys.sendTxToL1(l1Target, calldata)
await tx.wait()
await outbox.executeTransaction(...) // Will fail!
```

**Correct (wait for confirmation status):**

```typescript
// Good: Check status before attempting execution
const message = messages[0];
const status = await message.status(l1Provider);

if (status === L2ToL1MessageStatus.CONFIRMED) {
  await message.execute(l1Provider); // Ready after ~7 days
} else {
  console.log('Still in challenge period');
}
```

The challenge period is ~7 days on mainnet, ~1 hour on Sepolia testnet. This delay is non-negotiable—it's the security mechanism that makes optimistic rollups work.

For detailed implementation, see [L2 to L1 Messaging](https://docs.arbitrum.io/how-arbitrum-works/arbos/l2-l1-messaging).
