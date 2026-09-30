---
name: implement
description: Orchestrate the implementation workflow. Use after requirements are defined to design, build, validate, polish, and document. Triggers on "implement this", "build this", "start implementation", "execute the plan".
---

# Implementation Workflow

Orchestrate the implementation pipeline.

When working on Arbitrum projects, use `@arbitrum-best-practices` for domain-specific patterns.

## Workflow

```text
/context-prep                → Project Orientation (if needed)
design                       → Implementation Planning (architect)
execute                      → Implementation (engineer)
qa                           → Validation (qa)
polish                       → Naming Review & Cleanup (code-quality-engineer)
docs                         → Documentation (docs)
```

**Note**: Run `/context-prep` first if starting a new session or after context loss.

## Prerequisites

Before running this workflow, ensure:

- Requirements are defined
- Specifications exist OR provide them inline

## Instructions

Execute phases sequentially using the Task tool:

### Design

`subagent_type: architect`

- Design system architecture
- Define component boundaries
- Specify file paths and integration points
- Create implementation plan with dependencies

### Execute

`subagent_type: engineer`

- Implement according to design
- Write production-ready code
- Include error handling and edge cases
- Run initial tests

### QA

`subagent_type: qa`

- Hostile falsification testing
- Edge case verification
- Security and performance validation
- Ensure implementation matches specifications

### Polish

`subagent_type: code-quality-engineer`

- Audit naming conventions
- Remove debug artifacts
- Ensure code clarity and consistency

### Docs

`subagent_type: docs`

- Document new features
- Update API references
- Create usage examples

## Quick Start

For simple implementations, run design-execute-qa only:

```text
1. Design → 2. Build → 3. Validate
```

Add polish and docs for public APIs or significant features.

## Output

Implementation report includes:

- Changes made (file paths, key functions)
- Validation results
- **Unresolved Questions** (even if "None")
