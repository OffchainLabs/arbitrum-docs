---
name: prd
description: Generate Product Requirements Document via multi-agent workflow. Use for significant features, new systems, or complex changes that warrant formal specification. NOT for bug fixes, small features, or quick iterations. Triggers on "create PRD", "write requirements", "spec this out", "define the project".
---

# PRD Generation

Orchestrate the multi-agent workflow for comprehensive PRD creation.

When working on Arbitrum projects, use `@arbitrum-best-practices` for domain-specific patterns.

## When to Use This Workflow

**USE /prd for:**

- New features with multiple components
- System redesigns or major refactors
- External-facing APIs or SDK features
- Cross-team initiatives requiring alignment
- Features with security/compliance implications
- Complex implementations with multiple integration points

**DON'T USE /prd for:**

- Bug fixes (just fix them)
- Simple features with clear, limited scope
- Internal tooling tweaks
- Quick iterations on existing features
- Exploratory spikes (use `/research` instead)

If unsure, ask: "Would I regret not having written requirements for this?" If no, skip the PRD.

## Core Flow

```text
research → requirements → specs → design
   (1)         (2)         (3)      (4)
```

This produces an **Implementation Design Document** that defines WHAT to build and HOW.

## Full Workflow

```text
/context-prep        → Project Orientation (run first!)
research             → Domain Research (researcher)
requirements         → Requirements Discovery (product-manager)
specs                → Technical Specifications (product-manager)
design               → Implementation Design (architect)
[skip execute]       → Implementation is separate
qa                   → PRD Validation (qa)
polish               → Terminology & Glossary (code-quality-engineer)
docs                 → Final Polish (docs)
```

**IMPORTANT**: Run `/context-prep` first to orient to the project.

## Phase Details

### Research

`subagent_type: researcher`

- Analyze 3-5 similar solutions
- Document anti-patterns and failure lessons
- Identify domain-specific considerations

### Requirements

`subagent_type: product-manager`

- Iterative questioning (2-4 questions per round)
- Extract functional requirements (FR-001, FR-002...)
- Extract non-functional requirements (NFR-001, NFR-002...)
- Define constraints, assumptions, out-of-scope

### Specs

`subagent_type: product-manager`

- Transform requirements into precise specifications
- Define data models with types and constraints
- Document API contracts (inputs, outputs, errors)
- Write testable acceptance criteria

### Design

`subagent_type: architect`

- System design and component breakdown
- Technology stack with justification
- File paths and integration points
- Security and scalability approach

### QA

`subagent_type: qa`

- Hostile falsification of complete PRD
- Edge case generation
- Traceability check (requirement → spec → design)
- Risk assessment

### Polish

`subagent_type: code-quality-engineer`

- Terminology consistency audit
- Glossary creation
- Clarity improvements throughout

### Docs

`subagent_type: docs`

- Document structure review
- Executive summary
- Final formatting

## Shared Document

All agents write to: `PRD-[project-name]-[YYYY-MM-DD].md`

## Output

Final PRD includes:

- Executive Summary
- Domain Research
- Requirements Specification
- Technical Specifications
- Implementation Design
- Validation Report
- Glossary
- **Unresolved Questions** (even if "None")
