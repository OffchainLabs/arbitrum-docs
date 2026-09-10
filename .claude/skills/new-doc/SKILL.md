---
name: new-doc
description: Scaffold a new documentation page with correct frontmatter, terminology, and sidebar registration. Triggers on "new doc", "create page", "add doc", "scaffold doc".
disable-model-invocation: true
---

# New Doc

Scaffold a new MDX documentation page following all project conventions.

## Required input from user

Ask for these before creating the file:

| Field            | Example                     | Notes                                                                                 |
| ---------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| **Title**        | "Bridge tokens to Arbitrum" | Sentence case, appears as H1                                                          |
| **Section**      | `build-decentralized-apps`  | Must match an existing `docs/` subdirectory                                           |
| **Content type** | `how-to`                    | One of: `how-to`, `concept`, `quickstart`, `tutorial`, `reference`, `troubleshooting` |
| **Author**       | `github-username`           | GitHub username                                                                       |
| **SME**          | `github-username`           | Subject matter expert (can be same as author)                                         |

Optional (will generate defaults if not provided):

- `sidebar_label` — defaults to shortened title
- `description` — generate from title
- `user_story` — generate from content type and title

## File creation

### 1. Determine file path

```
docs/{section}/{slug}.mdx
```

Slug: lowercase title, spaces to hyphens, no special chars. For ordered sections, check existing files for numeric prefixes (e.g., `01-`, `02-`) and use the next number.

### 2. Write frontmatter + skeleton

```mdx
---
title: '{title}'
sidebar_label: '{sidebar_label}'
description: '{description}'
user_story: 'As a {role}, I want to {goal}'
content_type: '{content_type}'
author: '{author}'
sme: '{sme}'
---

{skeleton based on content_type}
```

### 3. Content type skeletons

**how-to:**

```mdx
This how-to guide will help you {goal}.

## Prerequisites

- Item 1

## Steps

### Step 1: {first step}

{instructions}

### Step 2: {second step}

{instructions}

## Next steps

- [Related doc](link)
```

**concept:**

```mdx
{One-paragraph summary of the concept.}

## Overview

{Detailed explanation}

## How it works

{Technical details}

## Key takeaways

- Point 1
```

**quickstart:**

```mdx
This quickstart will get you {outcome} in under {time}.

## Prerequisites

- Item 1

## 1. {First step}

## 2. {Second step}

## What's next?
```

**reference:**

```mdx
## Overview

{Brief description of what this reference covers.}

## Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
|           |      |             |
```

**troubleshooting:**

```mdx
## Symptoms

{What the user observes}

## Common causes

### Cause 1: {description}

**Solution:** {fix}
```

### 4. Register in sidebar

Open `sidebars.js` and find the correct sidebar array for the section. Add the new doc ID (path relative to `docs/` without extension):

```js
'{section}/{slug}',
```

Place it in logical order within the existing items.

## Terminology enforcement

Before writing any content, apply these substitutions:

| Write this                 | Not this               |
| -------------------------- | ---------------------- |
| Parent chain / Child chain | L1/L2, Layer 1/Layer 2 |
| app                        | dapp, dApp             |
| onchain                    | on-chain               |
| cross-chain                | crosschain             |
| Rollup                     | rollup                 |
| AnyTrust                   | anytrust               |
| `ERC-20`, `ERC-721`        | ERC20                  |
| allowlist/denylist         | whitelist/blacklist    |
| bond                       | stake (for proposing)  |
| Your Arbitrum chain        | L3 Orbit chain         |

## Post-creation checklist

After creating the file:

1. Verify sidebar entry renders: `yarn start --no-open` and check navigation
2. Run `yarn lint:markdown` on the new file
3. Confirm no broken links: all `[text](link)` targets exist
4. If referencing globalVars, use `@@variableName=value@@` syntax
