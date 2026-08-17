---
name: create-rule
description: Create new Arbitrum development rules following best practices format. Use when capturing a reusable pattern, common mistake, or architectural decision. Triggers on "create rule", "add rule", "new rule", "document this pattern".
---

# Create Arbitrum Development Rule

Create focused, high-level best practice rules for Arbitrum development.

## Philosophy

Rules capture **principles**, not **tutorials**.

| Good Rule                      | Bad Rule                          |
| ------------------------------ | --------------------------------- |
| Single concept                 | Multiple concepts                 |
| Why it matters                 | How to implement everything       |
| 35-50 lines                    | 100+ lines                        |
| Focused examples (10-20 lines) | Production-ready code (50+ lines) |
| Links to docs for details      | Duplicates documentation          |

## When to Create a Rule

Create a rule when you identify:

1. **Repeated mistakes** — Same error seen across multiple codebases
2. **Non-obvious behavior** — Arbitrum-specific quirks that surprise developers
3. **Critical decisions** — Architectural choices with major consequences
4. **SDK anti-patterns** — Common misuse of Arbitrum SDK
5. **Security boundaries** — Patterns that prevent fund loss

**Don't create a rule for:**

- One-off edge cases
- Standard programming practices (not Arbitrum-specific)
- Implementation details covered in official docs
- Trivial patterns any developer would know

## Rule Structure

```markdown
---
title: Imperative Statement of the Principle
impact: CRITICAL | HIGH | MEDIUM | LOW
impactDescription: Brief consequence (e.g., "prevents stuck funds")
tags: category, subcategory, related-concepts
---

## Imperative Statement of the Principle

One paragraph explaining WHY this matters. Focus on consequences, not implementation details.

**Incorrect (what's wrong):**

\`\`\`typescript
// Bad: One-line explanation of the mistake
const bad = await wrongApproach()
\`\`\`

**Correct (what's right):**

\`\`\`typescript
// Good: One-line explanation of the fix
const good = await rightApproach()
\`\`\`

Optional: One sentence of additional context or a small table.

For detailed implementation, see [Reference](https://docs.arbitrum.io/relevant-page).
```

## Naming Convention

Rules are named: `{section}-{concept}.md`

| Section         | Prefix      | Examples                         |
| --------------- | ----------- | -------------------------------- |
| Token Bridging  | `bridge-`   | `bridge-l1-l2-messaging.md`      |
| Arbitrum Chains | `chain-`    | `chain-anytrust-vs-rollup.md`    |
| Arbitrum SDK    | `sdk-`      | `sdk-gateway-registration.md`    |
| Security        | `security-` | `security-bridge-validation.md`  |
| RPC/Debugging   | `rpc-`      | `rpc-cast-transaction.md`        |
| Gas             | `gas-`      | `gas-l1-data-costs.md`           |
| Debug           | `debug-`    | `debug-retryable-failure.md`     |
| Naming          | `naming-`   | `naming-arbitrum-terminology.md` |

## Impact Levels

| Level        | Criteria                                             | Examples                               |
| ------------ | ---------------------------------------------------- | -------------------------------------- |
| **CRITICAL** | Fund loss, protocol security, irreversible decisions | Bridge messaging, chain type selection |
| **HIGH**     | Functionality broken, significant debugging          | Gateway registration, input validation |
| **MEDIUM**   | Performance issues, failed transactions              | Gas estimation, debugging patterns     |
| **LOW**      | Code clarity, maintainability                        | Naming conventions                     |

## Title Guidelines

Titles should be **imperative statements** that capture the rule:

| Good Title                            | Bad Title                  |
| ------------------------------------- | -------------------------- |
| Use SDK for L1-to-L2 Messages         | L1 to L2 Message Passing   |
| Retryable Tickets Expire After 7 Days | Retryable Ticket Lifecycle |
| Validate All Bridge Inputs            | Bridge Input Validation    |
| Account for L1 Data Costs             | Gas Optimization           |

The title alone should tell a developer what to do.

## Code Example Guidelines

**Keep examples minimal** — just enough to show the pattern:

```typescript
// BAD: Too much code (production-ready but overwhelming)
import { L1ToL2MessageCreator, L1TransactionReceipt, L1ToL2MessageStatus } from '@arbitrum/sdk';
import { JsonRpcProvider, Wallet } from 'ethers';

async function sendMessage(l1Rpc: string, l2Rpc: string, pk: string) {
  const l1Provider = new JsonRpcProvider(l1Rpc);
  const l2Provider = new JsonRpcProvider(l2Rpc);
  const l1Signer = new Wallet(pk, l1Provider);
  const creator = new L1ToL2MessageCreator(l1Signer);
  // ... 30 more lines
}
```

```typescript
// GOOD: Focused on the principle
const creator = new L1ToL2MessageCreator(l1Signer);
const ticket = await creator.createRetryableTicket(
  {
    to: l2ContractAddress,
    l2CallValue: parseEther('0.1'),
    data: calldata,
  },
  l2Provider,
);
```

## Workflow

### Step 1: Identify the Principle

Ask yourself:

- What's the ONE thing a developer must understand?
- What goes wrong if they don't know this?
- Can I state it in one imperative sentence?

### Step 2: Research via ArbitrumDocs MCP

```text
mcp__arbitrumDocs__search-arbitrum-docs: Find official guidance
mcp__arbitrumDocs__ask-question-about-arbitrum: Verify understanding
```

Ensure your rule aligns with current Arbitrum documentation.

### Step 3: Write the Rule

1. Start with the title (imperative statement)
2. Write the WHY paragraph (consequences, not implementation)
3. Create minimal bad/good examples
4. Add reference link to official docs

### Step 4: Validate

Check your rule against these criteria:

- [ ] Title is an imperative statement
- [ ] Total length < 50 lines
- [ ] Code examples < 15 lines each
- [ ] Single concept (not multiple)
- [ ] Arbitrum-specific (not general programming)
- [ ] Impact level is justified
- [ ] Reference link is valid

### Step 5: Place the File

```text
.claude/skills/arbitrum-best-practices/rules/{section}-{concept}.md
```

Update `.claude/skills/arbitrum-best-practices/AGENTS.md` to include the new rule in the appropriate section.

## Examples

### Good Rule Example

```markdown
---
title: Retryable Tickets Expire After 7 Days
impact: CRITICAL
impactDescription: prevents stuck deposits
tags: bridge, retryable, l1-l2, lifecycle
---

## Retryable Tickets Expire After 7 Days

Retryable tickets that fail auto-redemption remain redeemable for 7 days. After expiration, funds go to the refund addresses—not back to the sender automatically. Always set refund addresses you control.

**Incorrect (fire and forget):**

\`\`\`typescript
// Bad: No status monitoring after creation
await creator.createRetryableTicket({ ...params })
\`\`\`

**Correct (monitor and redeem if needed):**

\`\`\`typescript
// Good: Check status and manually redeem if auto-redeem fails
const status = await message.status()
if (status === L1ToL2MessageStatus.FUNDS_DEPOSITED_ON_L2) {
await message.redeem({ gasLimit: 500000n })
}
\`\`\`

For detailed implementation, see [Retryable Tickets](https://docs.arbitrum.io/how-arbitrum-works/arbos/l1-l2-messaging#retryable-tickets).
```

### Bad Rule Example (what NOT to do)

```markdown
---
title: L1 to L2 Message Passing  <!-- Not imperative -->
impact: HIGH  <!-- Should be CRITICAL for bridging -->
tags: bridge
---

## L1 to L2 Message Passing <!-- Title doesn't tell you what to do -->

This document explains how L1 to L2 messaging works in Arbitrum. <!-- Tutorial intro, not principle -->

**Message Flow:** <!-- Implementation detail, not principle -->

1. L1 transaction creates retryable ticket
2. Sequencer includes ticket
3. Auto-redemption attempts
4. Manual redemption if needed

**Incorrect:**

\`\`\`typescript
// 50 lines of production code...
\`\`\`

**Correct:**

\`\`\`typescript
// Another 50 lines of production code...
\`\`\`

**Verification:** <!-- Don't include verification sections -->
\`\`\`bash
cast call ...
\`\`\`

**Edge Cases:** <!-- Don't include edge cases sections -->

- Case 1...
- Case 2...
```

## Quick Reference

| Element       | Guideline                         |
| ------------- | --------------------------------- |
| Title         | Imperative statement (verb first) |
| Length        | < 50 lines total                  |
| Code examples | < 15 lines each                   |
| Concepts      | ONE per rule                      |
| Impact        | Match to real consequences        |
| Tags          | 3-5 relevant terms                |
| Reference     | Link to official docs             |

## Template

Copy this template to start a new rule:

```markdown
---
title: [Imperative Statement]
impact: [CRITICAL|HIGH|MEDIUM|LOW]
impactDescription: [brief consequence]
tags: [section], [concept], [related]
---

## [Imperative Statement]

[One paragraph: WHY this matters, consequences of ignoring it]

**Incorrect ([what's wrong]):**

\`\`\`typescript
// Bad: [one-line explanation]
[minimal code showing the mistake]
\`\`\`

**Correct ([what's right]):**

\`\`\`typescript
// Good: [one-line explanation]
[minimal code showing the fix]
\`\`\`

For detailed implementation, see [Reference](https://docs.arbitrum.io/[page]).
```
