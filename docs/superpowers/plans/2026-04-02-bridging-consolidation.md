# Bridging Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate all bridging content in `docs/build-decentralized-apps/` into a unified `bridging/` subdirectory with direction-based organization.

**Architecture:** Move 10 existing files into a new `bridging/` directory tree organized by direction (`deposit/`, `withdraw/`), write one new overview page, update the sidebar config, add Vercel redirects, and fix all internal links/imports.

**Tech Stack:** Docusaurus MDX, Vercel redirects (vercel.json), sidebars.js

**Spec:** `docs/superpowers/specs/2026-04-02-bridging-consolidation-design.md`

---

### Task 1: Create bridging directory structure and move files

**Files:**

- Create directories: `docs/build-decentralized-apps/bridging/`, `bridging/deposit/`, `bridging/withdraw/`, `bridging/configure-token-gateway/`, `bridging/partials/`
- Move 10 files (see steps below)

- [ ] **Step 1: Create the directory structure**

```bash
mkdir -p docs/build-decentralized-apps/bridging/{deposit,withdraw,configure-token-gateway,partials}
```

- [ ] **Step 2: Move root-level bridging files**

```bash
git mv docs/build-decentralized-apps/04-cross-chain-messaging.mdx docs/build-decentralized-apps/bridging/cross-chain-messaging.mdx
git mv docs/build-decentralized-apps/custom-gas-token-sdk.mdx docs/build-decentralized-apps/bridging/custom-gas-token-chains.mdx
git mv docs/build-decentralized-apps/how-to-bridge-from-parent-chain.mdx docs/build-decentralized-apps/bridging/deposit/eth-and-messages.mdx
git mv docs/build-decentralized-apps/how-to-bridge-to-parent-chain.mdx docs/build-decentralized-apps/bridging/withdraw/eth-and-messages.mdx
```

- [ ] **Step 3: Move token-bridging files**

```bash
git mv docs/build-decentralized-apps/token-bridging/deposit-tokens.mdx docs/build-decentralized-apps/bridging/deposit/tokens.mdx
git mv docs/build-decentralized-apps/token-bridging/withdraw-tokens.mdx docs/build-decentralized-apps/bridging/withdraw/tokens.mdx
git mv docs/build-decentralized-apps/token-bridging/partials/_token-compatibility.mdx docs/build-decentralized-apps/bridging/partials/_token-compatibility.mdx
```

- [ ] **Step 4: Move configure-token-bridging files**

```bash
git mv docs/build-decentralized-apps/token-bridging/configure-token-bridging/setup-standard-gateway.mdx docs/build-decentralized-apps/bridging/configure-token-gateway/standard.mdx
git mv docs/build-decentralized-apps/token-bridging/configure-token-bridging/setup-generic-custom-gateway.mdx docs/build-decentralized-apps/bridging/configure-token-gateway/generic-custom.mdx
git mv docs/build-decentralized-apps/token-bridging/configure-token-bridging/setup-custom-gateway.mdx docs/build-decentralized-apps/bridging/configure-token-gateway/custom.mdx
```

- [ ] **Step 5: Remove retired file and empty directories**

```bash
git rm docs/build-decentralized-apps/token-bridging/get-started.mdx
rmdir docs/build-decentralized-apps/token-bridging/configure-token-bridging
rmdir docs/build-decentralized-apps/token-bridging/partials
rmdir docs/build-decentralized-apps/token-bridging
```

Note: If `.DS_Store` files prevent `rmdir`, use `rm` on them first:

```bash
find docs/build-decentralized-apps/token-bridging -name '.DS_Store' -delete
```

- [ ] **Step 6: Commit**

```bash
git add -A docs/build-decentralized-apps/bridging/ docs/build-decentralized-apps/token-bridging/ docs/build-decentralized-apps/04-cross-chain-messaging.mdx docs/build-decentralized-apps/custom-gas-token-sdk.mdx docs/build-decentralized-apps/how-to-bridge-from-parent-chain.mdx docs/build-decentralized-apps/how-to-bridge-to-parent-chain.mdx
git commit -m "Move bridging files into unified bridging/ directory structure"
```

---

### Task 2: Create the new overview page

**Files:**

- Create: `docs/build-decentralized-apps/bridging/overview.mdx`

- [ ] **Step 1: Write the overview page**

Create `docs/build-decentralized-apps/bridging/overview.mdx` with this content:

```mdx
---
title: 'Bridging overview'
description: 'Choose the right approach for bridging assets and messages between Ethereum and Arbitrum.'
user_story: 'As a developer, I want to quickly find the right bridging guide for my use case so I can move assets or messages between chains.'
content_type: overview
displayed_sidebar: buildAppsSidebar
---

Token bridging and cross-chain messaging are fundamental aspects of building on Arbitrum. This page helps you find the right guide for your use case.

## Move ETH between chains

- **[Deposit ETH to Arbitrum](/build-decentralized-apps/bridging/deposit/eth-and-messages.mdx#bridging-eth-to-a-child-chain)**: Bridge ETH from the parent chain to a child chain using the Inbox contract
- **[Withdraw ETH to Ethereum](/build-decentralized-apps/bridging/withdraw/eth-and-messages.mdx#withdrawing-eth)**: Withdraw ETH from a child chain back to the parent chain via ArbSys

## Move ERC-20 tokens between chains

- **[Deposit tokens to Arbitrum](/build-decentralized-apps/bridging/deposit/tokens.mdx)**: Move ERC-20 tokens from the parent chain to the child chain
- **[Withdraw tokens to Ethereum](/build-decentralized-apps/bridging/withdraw/tokens.mdx)**: Move ERC-20 tokens from the child chain back to the parent chain

## Make my token bridgeable

Choose a gateway based on your token's requirements:

- **[Standard gateway](/build-decentralized-apps/bridging/configure-token-gateway/standard.mdx)** (recommended): Automatic deployment of a standard ERC-20 on Arbitrum, no configuration required
- **[Generic-custom gateway](/build-decentralized-apps/bridging/configure-token-gateway/generic-custom.mdx)**: Custom functionality in your child chain token while using Arbitrum's built-in gateway
- **[Custom gateway](/build-decentralized-apps/bridging/configure-token-gateway/custom.mdx)**: Specialized gateway logic for advanced use cases

## Send arbitrary cross-chain messages

- **[Parent → child messaging](/build-decentralized-apps/bridging/deposit/eth-and-messages.mdx#creating-retryable-tickets)**: Send messages from Ethereum to Arbitrum using retryable tickets
- **[Child → parent messaging](/build-decentralized-apps/bridging/withdraw/eth-and-messages.mdx#sending-a-message-from-the-child-to-the-parent-chain)**: Send messages from Arbitrum to Ethereum via ArbSys and the Outbox

## Build on a custom gas token chain

If you're working with an Arbitrum chain that uses a non-ETH gas token, see [Custom gas token chain bridging](/build-decentralized-apps/bridging/custom-gas-token-chains.mdx) for SDK APIs and workflows.

## Example code

- [Token deposits (parent → child)](https://github.com/OffchainLabs/arbitrum-tutorials/tree/master/packages/token-deposit)
- [Token withdrawals (child → parent)](https://github.com/OffchainLabs/arbitrum-tutorials/tree/master/packages/token-withdraw)
- [Custom token bridging setup](https://github.com/OffchainLabs/arbitrum-tutorials/tree/master/packages/custom-token-bridging)

## Learn more

- [Cross-chain messaging concepts](/build-decentralized-apps/bridging/cross-chain-messaging.mdx)
- [Token bridge architecture](/how-arbitrum-works/deep-dives/token-bridging.mdx)
- [Arbitrum SDK documentation](/sdk)
```

- [ ] **Step 2: Commit**

```bash
git add docs/build-decentralized-apps/bridging/overview.mdx
git commit -m "Add bridging overview routing page"
```

---

### Task 3: Update sidebar configuration

**Files:**

- Modify: `sidebars.js:1228-1356` (buildAppsSidebar) and `sidebars.js:1460-1468` (buildSoliditySidebar)

- [ ] **Step 1: Replace bridging entries in buildAppsSidebar**

In `sidebars.js`, remove these three items from `buildAppsSidebar` (inside the `Build apps with Solidity` category items array):

1. The "Cross-chain messaging" doc entry (lines 1228-1232):

```javascript
        {
          type: 'doc',
          label: 'Cross-chain messaging',
          id: 'build-decentralized-apps/cross-chain-messaging',
        },
```

2. The "Custom gas token SDK" doc entry (lines 1233-1236):

```javascript
        {
          type: 'doc',
          id: 'build-decentralized-apps/custom-gas-token-sdk',
          label: 'Custom gas token SDK',
        },
```

3. The entire "Token bridging" category (lines 1303-1356, which includes the buggy duplicate entry and stray comma):

```javascript
        {
          type: 'category',
          label: 'Token bridging',
          // ... all items through the closing },
        },
```

Replace all three with a single "Bridging" category, inserted after "Chains and testnets" (where "Cross-chain messaging" was):

```javascript
        {
          type: 'category',
          label: 'Bridging',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Overview',
              id: 'build-decentralized-apps/bridging/overview',
            },
            {
              type: 'category',
              label: 'Deposit (parent → child)',
              items: [
                {
                  type: 'doc',
                  label: 'ETH and messages',
                  id: 'build-decentralized-apps/bridging/deposit/eth-and-messages',
                },
                {
                  type: 'doc',
                  label: 'Tokens',
                  id: 'build-decentralized-apps/bridging/deposit/tokens',
                },
              ],
            },
            {
              type: 'category',
              label: 'Withdraw (child → parent)',
              items: [
                {
                  type: 'doc',
                  label: 'ETH and messages',
                  id: 'build-decentralized-apps/bridging/withdraw/eth-and-messages',
                },
                {
                  type: 'doc',
                  label: 'Tokens',
                  id: 'build-decentralized-apps/bridging/withdraw/tokens',
                },
              ],
            },
            {
              type: 'doc',
              label: 'Cross-chain messaging',
              id: 'build-decentralized-apps/bridging/cross-chain-messaging',
            },
            {
              type: 'doc',
              label: 'Custom gas token chains',
              id: 'build-decentralized-apps/bridging/custom-gas-token-chains',
            },
            {
              type: 'category',
              label: 'Configure token gateway',
              items: [
                {
                  type: 'doc',
                  label: 'Standard gateway',
                  id: 'build-decentralized-apps/bridging/configure-token-gateway/standard',
                },
                {
                  type: 'doc',
                  label: 'Generic-custom gateway',
                  id: 'build-decentralized-apps/bridging/configure-token-gateway/generic-custom',
                },
                {
                  type: 'doc',
                  label: 'Custom gateway',
                  id: 'build-decentralized-apps/bridging/configure-token-gateway/custom',
                },
              ],
            },
          ],
        },
```

- [ ] **Step 2: Update buildSoliditySidebar doc IDs**

In `sidebars.js`, find and update these two entries in `buildSoliditySidebar`:

Line 1463: `id: 'build-decentralized-apps/cross-chain-messaging'` → `id: 'build-decentralized-apps/bridging/cross-chain-messaging'`

Line 1467: `id: 'build-decentralized-apps/custom-gas-token-sdk'` → `id: 'build-decentralized-apps/bridging/custom-gas-token-chains'`

Also update the label on 1468: `label: 'Custom gas token SDK'` → `label: 'Custom gas token chains'`

- [ ] **Step 3: Commit**

```bash
git add sidebars.js
git commit -m "Update sidebar config for bridging consolidation"
```

---

### Task 4: Add Vercel redirects

**Files:**

- Modify: `vercel.json` (append to the `redirects` array, before the closing `]`)

- [ ] **Step 1: Update existing redirect destinations**

Several existing redirects in `vercel.json` have destinations pointing to paths that are moving. Update these destinations:

- `"/build-decentralized-apps/token-bridging/get-started"` → `"/build-decentralized-apps/bridging/overview"` (lines ~220, 230, 235, 270)
- `"/build-decentralized-apps/how-to-bridge-from-parent-chain"` → `"/build-decentralized-apps/bridging/deposit/eth-and-messages"` (lines ~275, 280, 285)
- `"/build-decentralized-apps/cross-chain-messaging"` → `"/build-decentralized-apps/bridging/cross-chain-messaging"` (line ~475)
- `"/build-decentralized-apps/custom-gas-token-sdk"` → `"/build-decentralized-apps/bridging/custom-gas-token-chains"` (line ~850)

Search for all destination values containing the old paths and update them.

- [ ] **Step 2: Add new redirect entries**

Add the following 10 redirect entries to the `redirects` array in `vercel.json`, before the closing `]` on line 2398. Insert them after the last existing entry (the `withdrawals` redirect ending at line 2397):

```json
    ,
    {
      "source": "/(build-decentralized-apps/cross-chain-messaging/?)",
      "destination": "/build-decentralized-apps/bridging/cross-chain-messaging",
      "permanent": false
    },
    {
      "source": "/(build-decentralized-apps/custom-gas-token-sdk/?)",
      "destination": "/build-decentralized-apps/bridging/custom-gas-token-chains",
      "permanent": false
    },
    {
      "source": "/(build-decentralized-apps/how-to-bridge-from-parent-chain/?)",
      "destination": "/build-decentralized-apps/bridging/deposit/eth-and-messages",
      "permanent": false
    },
    {
      "source": "/(build-decentralized-apps/how-to-bridge-to-parent-chain/?)",
      "destination": "/build-decentralized-apps/bridging/withdraw/eth-and-messages",
      "permanent": false
    },
    {
      "source": "/(build-decentralized-apps/token-bridging/get-started/?)",
      "destination": "/build-decentralized-apps/bridging/overview",
      "permanent": false
    },
    {
      "source": "/(build-decentralized-apps/token-bridging/deposit-tokens/?)",
      "destination": "/build-decentralized-apps/bridging/deposit/tokens",
      "permanent": false
    },
    {
      "source": "/(build-decentralized-apps/token-bridging/withdraw-tokens/?)",
      "destination": "/build-decentralized-apps/bridging/withdraw/tokens",
      "permanent": false
    },
    {
      "source": "/(build-decentralized-apps/token-bridging/configure-token-bridging/setup-standard-gateway/?)",
      "destination": "/build-decentralized-apps/bridging/configure-token-gateway/standard",
      "permanent": false
    },
    {
      "source": "/(build-decentralized-apps/token-bridging/configure-token-bridging/setup-generic-custom-gateway/?)",
      "destination": "/build-decentralized-apps/bridging/configure-token-gateway/generic-custom",
      "permanent": false
    },
    {
      "source": "/(build-decentralized-apps/token-bridging/configure-token-bridging/setup-custom-gateway/?)",
      "destination": "/build-decentralized-apps/bridging/configure-token-gateway/custom",
      "permanent": false
    }
```

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "Update and add Vercel redirects for bridging consolidation"
```

---

### Task 5: Update internal links in external docs

**Files:**

- Modify: `docs/how-arbitrum-works/deep-dives/l1-to-l2-messaging.mdx` (6 link refs + note about custom-gas-token-sdk)
- Modify: `docs/how-arbitrum-works/deep-dives/l2-to-l1-messaging.mdx` (4 link refs)
- Modify: `docs/how-arbitrum-works/deep-dives/token-bridging.mdx` (4 link refs + 1 import)
- Modify: `docs/partials/_troubleshooting-arbitrum-chain-partial.mdx` (1 fully-qualified URL)

- [ ] **Step 1: Update l1-to-l2-messaging.mdx**

Apply these replacements (use `replace_all` for each pattern):

- `/build-decentralized-apps/how-to-bridge-from-parent-chain` → `/build-decentralized-apps/bridging/deposit/eth-and-messages`
- `/build-decentralized-apps/custom-gas-token-sdk` → `/build-decentralized-apps/bridging/custom-gas-token-chains`

- [ ] **Step 2: Update l2-to-l1-messaging.mdx**

Apply this replacement (`replace_all`):

- `/build-decentralized-apps/how-to-bridge-to-parent-chain` → `/build-decentralized-apps/bridging/withdraw/eth-and-messages`

- [ ] **Step 3: Update token-bridging.mdx — import statement**

On line 115, change:

```javascript
import TokenCompatibilityPartial from '../../build-decentralized-apps/token-bridging/partials/_token-compatibility.mdx';
```

to:

```javascript
import TokenCompatibilityPartial from '../../build-decentralized-apps/bridging/partials/_token-compatibility.mdx';
```

- [ ] **Step 4: Update token-bridging.mdx — markdown links**

Apply these replacements:

- `/build-decentralized-apps/04-cross-chain-messaging` → `/build-decentralized-apps/bridging/cross-chain-messaging` (line 12)
- `/build-decentralized-apps/how-to-bridge-from-parent-chain` → `/build-decentralized-apps/bridging/deposit/eth-and-messages`
- `/build-decentralized-apps/token-bridging/get-started` → `/build-decentralized-apps/bridging/overview`

- [ ] **Step 5: Update \_troubleshooting-arbitrum-chain-partial.mdx**

On line 60, change the fully-qualified URL to a relative link:

```markdown
<!-- OLD -->

Learn more: [Cross-chain messaging](https://docs.arbitrum.io/build-decentralized-apps/04-cross-chain-messaging).

<!-- NEW -->

Learn more: [Cross-chain messaging](/build-decentralized-apps/bridging/cross-chain-messaging).
```

- [ ] **Step 6: Commit**

```bash
git add docs/how-arbitrum-works/deep-dives/l1-to-l2-messaging.mdx docs/how-arbitrum-works/deep-dives/l2-to-l1-messaging.mdx docs/how-arbitrum-works/deep-dives/token-bridging.mdx docs/partials/_troubleshooting-arbitrum-chain-partial.mdx
git commit -m "Update internal links to new bridging paths"
```

---

### Task 6: Update internal links within moved bridging files

**Files:**

- Modify: `docs/build-decentralized-apps/bridging/cross-chain-messaging.mdx`
- Modify: `docs/build-decentralized-apps/bridging/deposit/eth-and-messages.mdx`
- Modify: `docs/build-decentralized-apps/bridging/withdraw/eth-and-messages.mdx`
- Modify: `docs/build-decentralized-apps/bridging/withdraw/tokens.mdx`
- Modify: `docs/build-decentralized-apps/bridging/deposit/tokens.mdx`
- Modify: `docs/build-decentralized-apps/bridging/configure-token-gateway/standard.mdx`
- Modify: `docs/build-decentralized-apps/bridging/configure-token-gateway/generic-custom.mdx`
- Modify: `docs/build-decentralized-apps/bridging/configure-token-gateway/custom.mdx`

- [ ] **Step 1: Update cross-chain-messaging.mdx**

Replace internal links:

- `/build-decentralized-apps/how-to-bridge-from-parent-chain` → `/build-decentralized-apps/bridging/deposit/eth-and-messages`
- `/build-decentralized-apps/how-to-bridge-to-parent-chain` → `/build-decentralized-apps/bridging/withdraw/eth-and-messages`

- [ ] **Step 2: Update deposit/eth-and-messages.mdx**

Replace:

- `/build-decentralized-apps/token-bridging/get-started` → `/build-decentralized-apps/bridging/overview`

- [ ] **Step 3: Update withdraw/eth-and-messages.mdx**

Replace:

- `/build-decentralized-apps/token-bridging/withdraw-tokens` → `/build-decentralized-apps/bridging/withdraw/tokens`
- `/build-decentralized-apps/how-to-bridge-to-parent-chain` → `/build-decentralized-apps/bridging/withdraw/eth-and-messages` (if self-referencing)

- [ ] **Step 4: Update withdraw/tokens.mdx**

Replace:

- `/build-decentralized-apps/token-bridging/deposit-tokens` → `/build-decentralized-apps/bridging/deposit/tokens`
- `/build-decentralized-apps/how-to-bridge-to-parent-chain` → `/build-decentralized-apps/bridging/withdraw/eth-and-messages`
- `/build-decentralized-apps/token-bridging/configure-token-bridging/setup-standard-gateway` → `/build-decentralized-apps/bridging/configure-token-gateway/standard`

- [ ] **Step 5: Update deposit/tokens.mdx**

Replace:

- `/build-decentralized-apps/token-bridging/withdraw-tokens` → `/build-decentralized-apps/bridging/withdraw/tokens`
- `/build-decentralized-apps/token-bridging/configure-token-bridging/setup-standard-gateway` → `/build-decentralized-apps/bridging/configure-token-gateway/standard`

- [ ] **Step 6: Update configure-token-gateway files**

In all three files (`standard.mdx`, `generic-custom.mdx`, `custom.mdx`), replace as applicable:

- `/build-decentralized-apps/token-bridging/get-started` → `/build-decentralized-apps/bridging/overview`
- `/build-decentralized-apps/token-bridging/deposit-tokens` → `/build-decentralized-apps/bridging/deposit/tokens`
- `/build-decentralized-apps/token-bridging/withdraw-tokens` → `/build-decentralized-apps/bridging/withdraw/tokens`
- `/build-decentralized-apps/token-bridging/configure-token-bridging/setup-generic-custom-gateway` → `/build-decentralized-apps/bridging/configure-token-gateway/generic-custom`
- `/build-decentralized-apps/token-bridging/configure-token-bridging/setup-custom-gateway` → `/build-decentralized-apps/bridging/configure-token-gateway/custom`
- `/build-decentralized-apps/token-bridging/configure-token-bridging/setup-standard-gateway` → `/build-decentralized-apps/bridging/configure-token-gateway/standard`

- [ ] **Step 7: Commit**

```bash
git add docs/build-decentralized-apps/bridging/
git commit -m "Update internal cross-links within bridging files"
```

---

### Task 7: Verify build

**Files:** None (verification only)

- [ ] **Step 1: Run the Docusaurus build**

```bash
yarn build
```

Expected: Build succeeds with no broken link errors referencing old paths.

- [ ] **Step 2: Spot-check key pages**

```bash
yarn serve
```

Manually verify in browser:

1. `/build-decentralized-apps/bridging/overview` — renders with all links working
2. Old URL `/build-decentralized-apps/how-to-bridge-from-parent-chain` — redirects to deposit/eth-and-messages
3. Sidebar shows "Bridging" category with correct sub-items
4. `/how-arbitrum-works/deep-dives/token-bridging` — no broken imports, partial renders

- [ ] **Step 3: If build fails, fix broken links and re-run**

Check error output for specific broken references. Common issues:

- Missed link updates (search for old paths with `grep -r "token-bridging/" docs/` and `grep -r "how-to-bridge-" docs/`)
- Import path issues (search with `grep -r "import.*token-bridging" docs/`)
