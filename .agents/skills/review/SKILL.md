---
name: review
description: Critical code review using hostile falsification. Delegates to qa. Triggers on "review this", "check my code", "critique", "is this good".
agent: qa
---

# Critical Review

Delegates to `qa` for hostile falsification review.

## Usage

Invoke with content to review:

- Code files or snippets
- Plans or specifications
- Architecture designs

## What Gets Reviewed

1. **Bugs & Security** - Logic errors, vulnerabilities
2. **Performance** - Bottlenecks, missing optimizations
3. **Edge Cases** - Unhandled scenarios
4. **Naming & Clarity** - Unclear identifiers
5. **Arbitrum-Specific** - SDK patterns, protocol compliance

## Output

```text
## Summary
[1-2 sentences]

## Issues
| Severity | Location | Issue | Fix |

## Rating: X/10

## Top 3 Actions
```
