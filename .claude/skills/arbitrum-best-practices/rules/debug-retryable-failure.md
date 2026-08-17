---
title: Debug Retryables by Status
impact: MEDIUM
impactDescription: recover stuck deposits
tags: debug, retryable, troubleshooting
---

## Debug Retryables by Status

When a retryable ticket fails, the SDK status tells you exactly what went wrong. Check status before attempting recovery.

**Incorrect (guessing at the problem):**

```typescript
// Bad: Blindly retrying without diagnosis
await message.redeem({ gasLimit: 1000000n }); // Might not be the issue
```

**Correct (diagnose first via status):**

```typescript
// Good: Status-driven debugging
const status = await message.status();
switch (status) {
  case L1ToL2MessageStatus.NOT_YET_CREATED:
    // L1 tx pending or failed - check L1 transaction
    break;
  case L1ToL2MessageStatus.CREATION_FAILED:
    // Submission cost too low - funds at refund address
    break;
  case L1ToL2MessageStatus.FUNDS_DEPOSITED_ON_L2:
    // Auto-redeem failed - manually redeem with more gas
    await message.redeem({ gasLimit: 500000n });
    break;
  case L1ToL2MessageStatus.EXPIRED:
    // Missed 7-day window - recover via refund address
    break;
}
```

| Status                  | Cause               | Recovery                            |
| ----------------------- | ------------------- | ----------------------------------- |
| `CREATION_FAILED`       | Low submission cost | Retry with higher maxSubmissionCost |
| `FUNDS_DEPOSITED_ON_L2` | Insufficient L2 gas | Manual redeem with more gas         |
| `EXPIRED`               | Missed 7-day window | Funds at refund addresses           |

For detailed troubleshooting, see [L1 to L2 Messaging](https://docs.arbitrum.io/how-arbitrum-works/arbos/l1-l2-messaging).
