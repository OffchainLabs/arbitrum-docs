---
title: Retryable Tickets Expire After 7 Days
impact: CRITICAL
impactDescription: prevents stuck deposits
tags: bridge, retryable, l1-l2, lifecycle
---

## Retryable Tickets Expire After 7 Days

Retryable tickets that fail auto-redemption remain redeemable for 7 days. After expiration, funds go to the refund addresses—not back to the sender automatically. Always set refund addresses you control.

**Incorrect (relying on auto-redemption without monitoring):**

```typescript
// Bad: Fire and forget with no status check
await creator.createRetryableTicket({ ...params });
// If auto-redeem fails, ticket expires in 7 days
```

**Correct (check status and redeem if needed):**

```typescript
// Good: Monitor and manually redeem if auto-redeem fails
const status = await message.status();
if (status === L1ToL2MessageStatus.FUNDS_DEPOSITED_ON_L2) {
  // Auto-redeem failed, ticket waiting - manually redeem
  await message.redeem({ gasLimit: 500000n });
}
```

Lifecycle states: `SUBMITTED` → `FUNDS_DEPOSITED_ON_L2` (redeemable) → `REDEEMED` (terminal) or `EXPIRED` (after 7 days).

For detailed implementation, see [Retryable Tickets](https://docs.arbitrum.io/how-arbitrum-works/arbos/l1-l2-messaging#retryable-tickets).
