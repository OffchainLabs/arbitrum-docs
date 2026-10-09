---
name: new-doc
description: Scaffold a new documentation page with correct frontmatter, terminology, and sidebar registration. Triggers on "new doc", "create page", "add doc", "scaffold doc".
disable-model-invocation: true
---

# New Doc

Scaffold a new MDX documentation page following all project conventions.

## Required input from user

Only `title` and `description` are required by the frontmatter schema
(`arbitrumPageSchema` in `source.config.ts`); everything else below is
optional and the page is valid without it. Still ask for a **Section** up
front, since it decides the file's path (it is not a frontmatter field).

| Field           | Example                     | Notes                                                                         |
| --------------- | --------------------------- | ----------------------------------------------------------------------------- |
| **Title**       | "Bridge tokens to Arbitrum" | Sentence case, appears as H1. Required.                                       |
| **Description** | one-sentence summary        | Required.                                                                     |
| **Section**     | `build-decentralized-apps`  | Must match an existing `content/docs/` subdirectory. Not a frontmatter field. |

Optional (omit the key entirely if not provided, rather than leaving it blank):

- `sidebar_label`: the page's name in the sidebar; defaults to `title` if omitted
- `content_type`: one of `how-to`, `concept`, `quickstart`, `tutorial`,
  `reference`, `troubleshooting`, `faq`; an editorial label, nothing renders it
- `author`: GitHub username
- `sme`: subject matter expert GitHub username (can be same as author)
- `target_audience`: intended readers and their assumed knowledge
- `user_story`: the reader's goal, for example "As a chain operator, I want to rotate node keys so I can keep my chain secure"

Preserve existing `target_audience` and `user_story` values when editing a page. Neither renders
on the site. There is no `draft` field in this schema; never add it when scaffolding a page.

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
description: '{description}'
sidebar_label: '{sidebar_label}'
content_type: '{content_type}'
author: '{author}'
sme: '{sme}'
---

{skeleton based on content_type}
```

Drop any of `sidebar_label`, `content_type`, `author`, `sme` the user did not give you rather than
writing an empty string: they are optional fields, not required-but-blank ones.

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
it needs a specific position. To list a page that lives in another directory, use a relative path
entry such as `"../other-dir/page"`. Never write a `"[Label](/docs/path)"` entry for a page in this
repo: it puts the page on two sidebar nodes and `pnpm test` fails.

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
   `http://localhost:3000/{section}/{slug}`. Use `localhost`, not `127.0.0.1` — on
   `127.0.0.1` React does not hydrate and every component looks broken.
2. Run `pnpm content:lint`, `pnpm frontmatter:check`, and `pnpm types:check`.
   `frontmatter:check` validates every page against `lib/page-schema.ts`: a missing `title` or
   `description` fails this gate (the other fields are optional). `types:check` regenerates the
   collection and checks TypeScript; it does not validate every page's frontmatter.
3. Confirm no broken links: `pnpm check-links`. It also validates `#anchor` fragments against the
   compiled heading ids; only anchors that exist at runtime alone are outside its reach.
4. To reference a global variable, use `<Var name="variableName" />`; the value must exist in
   `content/vars.json`. Verify with `pnpm vars:check`.
5. Before writing a banner, note or config table, browse `content/partials/` (there is no catalog;
   the partials themselves are the index) and reuse an existing one instead of duplicating prose.
