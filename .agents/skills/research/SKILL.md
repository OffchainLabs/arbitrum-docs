---
name: research
description: Standalone domain research using researcher. Use for exploring similar solutions, patterns, constraints, and failure lessons without running the full PRD workflow. Triggers on "research this", "find similar solutions", "what patterns exist", "explore options".
agent: researcher
---

# Standalone Research

Delegates to `researcher` for focused domain research outside of PRD workflow.

When working on Arbitrum projects, use `@arbitrum-best-practices` for domain-specific patterns.

## When to Use

- Exploring a problem space before committing to a solution
- Finding similar implementations in the Arbitrum ecosystem
- Understanding technical constraints before requirements gathering
- Learning from failures in similar projects

## Process

### 1. ArbitrumDocs Research (Primary)

- Search official Arbitrum documentation first
- Query for existing patterns, constraints, and gotchas
- Find canonical implementations and examples

### 2. Similar Solutions Analysis

- Identify 3-5 comparable implementations
- Document strengths, weaknesses, architecture
- Extract key learnings

### 3. Pattern & Anti-Pattern Discovery

- Catalog proven patterns for the domain
- Document known anti-patterns to avoid
- Learn from project failures

### 4. Constraint Mapping

- Performance, compatibility, scalability limits
- Technology options with trade-offs
- Arbitrum-specific considerations

## Output Format

```markdown
# Research: [Topic]

## Similar Solutions
| Solution | Strengths | Weaknesses | Key Learning |
|----------|-----------|------------|--------------|

## Patterns
- [Pattern]: [When to use] - [Benefit]

## Anti-Patterns
- [Anti-pattern]: [What goes wrong] - [Alternative]

## Constraints
- [Constraint]: [Impact] - [Mitigation]

## Arbitrum-Specific Considerations
- [Finding from ArbitrumDocs]

## Recommendation
[1-2 paragraph summary with suggested approach]
```

## Example Usage

```text
/research token bridge architectures for custom ERC20s
/research Orbit chain gas token configurations
/research retryable ticket failure handling patterns
```
