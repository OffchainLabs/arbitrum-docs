---
name: context-prep
description: "LLM Utility: Generate minimal project context map before starting any workflow. ALWAYS run this first at session start, before /prd, before /implement, or after context loss. Triggers on 'context prep', 'orient me', 'start', 'new session'."
---

## Purpose

Prepare LLM context before starting work. This is a utility that runs before any workflow phase.

When working on Arbitrum projects, use `@arbitrum-best-practices` for domain-specific patterns.

# Project Context Overview

Generate a minimal, navigable context map using progressive revelation principles.

## Philosophy

1. **Start shallow, drill deep only when necessary**
2. **Provide pointers (file paths, line numbers), not full content**
3. **Links over duplication** - reference docs, don't copy them
4. **Minimize context window usage** - treat it as expensive real estate

## Instructions

Launch **4 parallel agents** using the Task tool, then synthesize findings.

### Agent 1: Documentation Survey

`subagent_type: Explore` (thoroughness: "quick")

```text
PROGRESSIVE REVELATION: Build a documentation map with links, not content.

1. List the root documents (README.md, INTERNALS.md, CONTRIBUTE.md, STYLE-GUIDE.md) - document topics, don't read yet
2. Scan README.md first 50 lines - extract project purpose (1-2 sentences)
3. Check for todo.md, CHANGELOG.md, AGENTS.md - current status
4. List package.json locations - map monorepo structure

Deliver navigable map:
- Project purpose (1-2 sentences) → Link: README.md
- Current status → Link: todo.md or AGENTS.md
- Package structure → Links: packages/*/package.json
- Reference materials → Links: the root *.md files (filenames only)
```

### Agent 2: Technology Stack

`subagent_type: researcher`

```text
PROGRESSIVE REVELATION: Scout technology stack, link to deep dives.

Research via docs and MCP:
- What frameworks/libraries are used?
- What target platforms?
- Key integrations?

Deliver scout report:
- 1-sentence description of tech stack
- Top 3 constraints from architecture
- Critical dependencies (list, don't explain)
- Links to docs for deep dives
```

### Agent 3: Git History & Progress

`subagent_type: Explore` (thoroughness: "quick")

```text
PROGRESSIVE REVELATION: Surface recent activity, link to history.

1. Run: git log --oneline -10
2. Group commits by theme (1-2 words per group)
3. Check git status for uncommitted changes
4. Identify current branch

Deliver minimal summary:
- Last 5 commits (grouped by theme)
- Current branch and status (clean/dirty)
- Active work (from uncommitted files)
- Link: run `git log --oneline -50` if needed
```

### Agent 4: Architecture Deep Dive

`subagent_type: Explore` (thoroughness: "quick")

```text
PROGRESSIVE REVELATION: Map architecture with pointers, not full code.

Scan structure (file listings only):
- src/*.ts or src/**/*.ts - list main files
- contracts/*.sol - list contract files
- packages/*/src/ - list entry points

Deliver navigable map:
- Key packages (name + one-liner purpose)
- Data flow (5-step maximum)
- Entry points → Links to main files
- Critical contracts → Links to .sol files
```

## Synthesis Format

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PROJECT CONTEXT (Progressive Revelation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## What We're Building
[1-2 sentences]
→ Deep dive: README.md

## Current Status
- Branch: [branch]
- Progress: [summary]
- Active: [current work]
→ Full plan: todo.md

## Tech Stack
- Frameworks: [list]
- Targets: [list]
- Key integrations: [list]
→ Use MCP for details

## Architecture

**Key Packages:**
- [package]: [purpose] → path/to/main.ts

**Data Flow:**
[5-step flow]

## Reference Materials (Read IF Needed)

**Docs:**
- [list doc files]

**Code:**
- [list key source files]

## Recent Activity
[Last 5 commits grouped]
→ Full history: `git log --oneline -50`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Context loaded. Traverse links for deeper detail.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Context Economy

- This command: ~500 tokens (navigation map)
- Reading one doc: ~2000 tokens (targeted detail)
- Reading full codebase: ~50,000 tokens (avoid unless critical)

**Progressive revelation saves 95%+ of context for actual work.**
