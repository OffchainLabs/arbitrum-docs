---
name: arbitrum-best-practices
description: Arbitrum L2 development best practices. Use when implementing bridges, Orbit chains, SDK integrations, or debugging cross-chain transactions. Triggers on Arbitrum, L2, rollup, bridge, retryable, Orbit, Nitro, or cross-chain contexts.
---

# Arbitrum Best Practices

High-level principles for Arbitrum L2 development. Each rule captures a single concept with focused code examples.

## When to Apply

Reference these rules when:

- Implementing token bridging (deposits/withdrawals)
- Deploying or configuring Orbit chains
- Using Arbitrum SDK for L1-L2 messaging
- Debugging cross-chain transactions
- Optimizing gas for L2 execution

## Rules by Priority

### CRITICAL

| Rule                         | Concept                                               |
| ---------------------------- | ----------------------------------------------------- |
| `bridge-l1-l2-messaging`     | Use SDK for L1-to-L2 messages                         |
| `bridge-l2-l1-messaging`     | L2-to-L1 messages require challenge period            |
| `bridge-retryable-lifecycle` | Retryable tickets expire after 7 days                 |
| `chain-anytrust-vs-rollup`   | Choose rollup for high-value, AnyTrust for throughput |

### HIGH

| Rule                         | Concept                            |
| ---------------------------- | ---------------------------------- |
| `sdk-gateway-registration`   | Register tokens before bridging    |
| `security-bridge-validation` | Validate all bridge inputs         |
| `rpc-cast-transaction`       | Use cast for transaction debugging |

### MEDIUM

| Rule                      | Concept                                    |
| ------------------------- | ------------------------------------------ |
| `gas-l1-data-costs`       | Account for L1 data costs in gas estimates |
| `debug-retryable-failure` | Debug retryables by status                 |

### LOW

| Rule                          | Concept                            |
| ----------------------------- | ---------------------------------- |
| `naming-arbitrum-terminology` | Use canonical Arbitrum terminology |

## Rule Structure

Each rule follows a minimal format:

- Brief explanation of the concept
- Incorrect code example
- Correct code example
- Reference link for deep dives

## ArbitrumDocs MCP Integration

Verify rules against current documentation:

```text
mcp__arbitrumDocs__search-arbitrum-docs: Search for topic updates
mcp__arbitrumDocs__ask-question-about-arbitrum: Ask specific questions
```

## Full Rule Reference

See `AGENTS.md` for the complete compiled rule set with all details.
