---
name: handoff
description: Generate context handoff for new Codex sessions. Use when ending a session or preserving work state. Triggers on "handoff", "save context", "new session", "continue later".
---

# Context Handoff

Generate a comprehensive handoff prompt for session continuity.

## Process

1. **Analyze conversation** - Review history for:
   - Main objectives and tasks
   - Key decisions made
   - Code changes implemented
   - Files created/modified
   - Unfinished tasks

2. **Generate handoff** - Include:
   - Central index (table of contents)
   - Summary of accomplishments
   - Current project state
   - Modified files with purposes
   - Pending tasks
   - Technical constraints

## Output Format

```markdown
# [Project] - Context Handoff

## Central Index
1. [Section 1]
2. [Section 2]
...

## Completed Work
- [Accomplishment 1]
- [Accomplishment 2]

## Current State
[Description]

## Pending Tasks
- [ ] Task 1
- [ ] Task 2

## Key Files
| File | Purpose |
|------|---------|

## Next Steps
[Guidance for continuation]
```

Present in a code block for easy copy/paste.
