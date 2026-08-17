---
title: Choose Rollup for High-Value, AnyTrust for High-Throughput
impact: CRITICAL
impactDescription: fundamental architecture decision
tags: chain, anytrust, rollup, architecture
---

## Choose Rollup for High-Value, AnyTrust for High-Throughput

Rollup mode posts all data to L1—full Ethereum security. AnyTrust uses a Data Availability Committee (DAC)—lower cost, higher throughput, but requires trusting the committee. This choice is hard to change post-deployment.

**Incorrect (choosing based on cost alone):**

```typescript
// Bad: AnyTrust purely for lower fees
const config = { dataAvailabilityCommittee: true };
// Wrong if handling high-value DeFi with permissionless access
```

**Correct (security-first decision):**

```typescript
// Good: Match chain type to security requirements
// Rollup: >$10M TVL, permissionless, bridges, DeFi
// AnyTrust: Gaming, social, trusted operators, <$1M TVL
const config = {
  dataAvailabilityCommittee: requirements.canTrustDac && requirements.lowValue,
};
```

| Aspect            | Rollup             | AnyTrust               |
| ----------------- | ------------------ | ---------------------- |
| Data availability | L1 (full security) | DAC (trust assumption) |
| L1 costs          | Higher             | Lower                  |
| Use case          | DeFi, bridges      | Gaming, social         |

For detailed comparison, see [Orbit Chain Types](https://docs.arbitrum.io/launch-orbit-chain/orbit-chain-types).
