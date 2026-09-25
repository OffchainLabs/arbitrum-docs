---
name: new-doc
description: Scaffold a new documentation page with correct frontmatter, terminology, and sidebar registration. Triggers on "new doc", "create page", "add doc", "scaffold doc".
disable-model-invocation: true
---

# New Doc

Scaffold a new MDX documentation page following all project conventions.

## Required input from user

Ask for these before creating the file:

| Field            | Example                     | Notes                                                                                        |
| ---------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| **Title**        | "Bridge tokens to Arbitrum" | Sentence case, appears as H1                                                                 |
| **Section**      | `build-decentralized-apps`  | Must match an existing `content/docs/` subdirectory                                          |
| **Content type** | `how-to`                    | One of: `how-to`, `concept`, `quickstart`, `tutorial`, `reference`, `troubleshooting`, `faq` |
| **Author**       | `github-username`           | GitHub username                                                                              |
| **SME**          | `github-username`           | Subject matter expert (can be same as author)                                                |

Optional (will generate defaults if not provided):

- `sidebar_label` — defaults to shortened title
- `description` — generate from title
- `user_story` — generate from content type and title

## File creation

### 1. Determine file path

```
content/docs/{section}/{slug}.mdx
```

Slug: lowercase title, spaces to hyphens, no special chars. File names carry no ordering — the
sidebar order comes from `meta.json` in the same directory (step 4).

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

### 4. Register in the sidebar

Sidebar order is controlled per directory by `meta.json`, not by file names. Open
`content/docs/{section}/meta.json` and add the slug (file name, no extension) to `pages`:

```json
{
  "title": "Get started",
  "pages": ["index", "arbitrum-introduction", "{slug}"]
}
```

Place it in logical order within the existing entries. A `"..."` entry means "everything else, in
file order", so a new page appears automatically wherever `"..."` sits — add it explicitly only when
it needs a specific position. Cross-directory links use the
`"[Label](/docs/path)"` form.

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

1. Verify the sidebar entry and the page render: `pnpm dev`, then browse
   `http://localhost:3000/docs/{section}/{slug}`. Use `localhost`, not `127.0.0.1` — on
   `127.0.0.1` React does not hydrate and every component looks broken.
2. Run `pnpm content:lint` and `pnpm types:check`. `types:check` is what enforces the frontmatter
   contract: a missing `title`, `description`, `content_type`, `author` or `sme` fails the build.
3. Confirm no broken links: `pnpm check-links`. It does not validate `#anchor` fragments — check
   those in the browser.
4. To reference a global variable, use `<Var name="variableName" />`; the value must exist in
   `content/vars.json`. Verify with `pnpm vars:check`.
5. Before writing a banner, note or config table, search `content/partials/CATALOG.md` and reuse the
   partial instead of duplicating prose.
