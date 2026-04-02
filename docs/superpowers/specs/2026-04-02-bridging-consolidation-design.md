# Bridging Content Consolidation Design

**Date**: 2026-04-02
**Status**: Approved
**Scope**: Consolidate all bridging-related content in `/docs/build-decentralized-apps/` into a unified `bridging/` subdirectory.

## Problem

Bridging content is fragmented across 4 separate locations within `build-decentralized-apps/`:

- Root-level: `how-to-bridge-from-parent-chain.mdx`, `how-to-bridge-to-parent-chain.mdx` (ETH + message passing)
- Root-level: `04-cross-chain-messaging.mdx` (conceptual overview)
- Root-level: `custom-gas-token-sdk.mdx` (SDK for custom gas token chains)
- `token-bridging/` subdirectory (ERC-20 deposits, withdrawals, gateway configuration)

The sidebar also has bugs: a duplicate entry for `how-to-bridge-from-parent-chain` and a stray comma.

Developers must navigate 4 entry points to find the right bridging doc for their use case.

## Design Decisions

1. **Direction-based subdirectories** (`deposit/`, `withdraw/`) with a flat overview page for routing
2. **Move files, update internal references, AND add redirects** for old URLs
3. **`custom-gas-token-chains.mdx`** lives as a sibling at the `bridging/` level
4. **Fresh overview page** for routing; `cross-chain-messaging.mdx` preserved as a separate conceptual doc
5. **`token-bridging/get-started.mdx`** retired — its content absorbed into the new overview page

## New Directory Structure

```
build-decentralized-apps/
├── ...existing files (quickstart, gas, chains, etc.)...
├── bridging/
│   ├── overview.mdx                          # NEW — decision tree routing page
│   ├── cross-chain-messaging.mdx             # FROM: 04-cross-chain-messaging.mdx
│   ├── custom-gas-token-chains.mdx           # FROM: custom-gas-token-sdk.mdx
│   ├── partials/
│   │   └── _token-compatibility.mdx          # FROM: token-bridging/partials/_token-compatibility.mdx
│   ├── deposit/
│   │   ├── eth-and-messages.mdx              # FROM: how-to-bridge-from-parent-chain.mdx
│   │   └── tokens.mdx                        # FROM: token-bridging/deposit-tokens.mdx
│   ├── withdraw/
│   │   ├── eth-and-messages.mdx              # FROM: how-to-bridge-to-parent-chain.mdx
│   │   └── tokens.mdx                        # FROM: token-bridging/withdraw-tokens.mdx
│   └── configure-token-gateway/
│       ├── standard.mdx                      # FROM: token-bridging/configure-token-bridging/setup-standard-gateway.mdx
│       ├── generic-custom.mdx                # FROM: token-bridging/configure-token-bridging/setup-generic-custom-gateway.mdx
│       └── custom.mdx                        # FROM: token-bridging/configure-token-bridging/setup-custom-gateway.mdx
```

## File Move Mapping

| Source                                                                     | Destination                                           |
| -------------------------------------------------------------------------- | ----------------------------------------------------- |
| `04-cross-chain-messaging.mdx`                                             | `bridging/cross-chain-messaging.mdx`                  |
| `custom-gas-token-sdk.mdx`                                                 | `bridging/custom-gas-token-chains.mdx`                |
| `how-to-bridge-from-parent-chain.mdx`                                      | `bridging/deposit/eth-and-messages.mdx`               |
| `how-to-bridge-to-parent-chain.mdx`                                        | `bridging/withdraw/eth-and-messages.mdx`              |
| `token-bridging/deposit-tokens.mdx`                                        | `bridging/deposit/tokens.mdx`                         |
| `token-bridging/withdraw-tokens.mdx`                                       | `bridging/withdraw/tokens.mdx`                        |
| `token-bridging/configure-token-bridging/setup-standard-gateway.mdx`       | `bridging/configure-token-gateway/standard.mdx`       |
| `token-bridging/configure-token-bridging/setup-generic-custom-gateway.mdx` | `bridging/configure-token-gateway/generic-custom.mdx` |
| `token-bridging/configure-token-bridging/setup-custom-gateway.mdx`         | `bridging/configure-token-gateway/custom.mdx`         |
| `token-bridging/partials/_token-compatibility.mdx`                         | `bridging/partials/_token-compatibility.mdx`          |

## Retired Files

- `token-bridging/get-started.mdx` — content absorbed into `bridging/overview.mdx`

## New File: `bridging/overview.mdx`

A routing/decision-tree page with sections:

- **Move ETH between chains** — links to deposit/withdraw ETH docs with anchor links
- **Move ERC-20 tokens between chains** — links to deposit/withdraw token docs
- **Make my token bridgeable** — links to the 3 gateway setup guides (standard, generic-custom, custom) with brief descriptions of when to use each
- **Send arbitrary cross-chain messages** — links to retryable tickets and ArbSys sections
- **Build on a custom gas token chain** — link to custom-gas-token-chains.mdx
- **Learn more** — links to cross-chain-messaging.mdx, token bridge architecture deep dive, and SDK

## Sidebar Changes

### `buildAppsSidebar`

Remove these entries:

- Standalone "Cross-chain messaging" doc entry
- Standalone "Custom gas token SDK" doc entry
- Entire "Token bridging" category (which has bugs: duplicate entry, stray comma)

Replace with a single "Bridging" category:

```javascript
{
  type: 'category',
  label: 'Bridging',
  collapsed: true,
  items: [
    { type: 'doc', label: 'Overview', id: 'build-decentralized-apps/bridging/overview' },
    {
      type: 'category',
      label: 'Deposit (parent → child)',
      items: [
        { type: 'doc', label: 'ETH and messages', id: 'build-decentralized-apps/bridging/deposit/eth-and-messages' },
        { type: 'doc', label: 'Tokens', id: 'build-decentralized-apps/bridging/deposit/tokens' },
      ],
    },
    {
      type: 'category',
      label: 'Withdraw (child → parent)',
      items: [
        { type: 'doc', label: 'ETH and messages', id: 'build-decentralized-apps/bridging/withdraw/eth-and-messages' },
        { type: 'doc', label: 'Tokens', id: 'build-decentralized-apps/bridging/withdraw/tokens' },
      ],
    },
    { type: 'doc', label: 'Cross-chain messaging', id: 'build-decentralized-apps/bridging/cross-chain-messaging' },
    { type: 'doc', label: 'Custom gas token chains', id: 'build-decentralized-apps/bridging/custom-gas-token-chains' },
    {
      type: 'category',
      label: 'Configure token gateway',
      items: [
        { type: 'doc', label: 'Standard gateway', id: 'build-decentralized-apps/bridging/configure-token-gateway/standard' },
        { type: 'doc', label: 'Generic-custom gateway', id: 'build-decentralized-apps/bridging/configure-token-gateway/generic-custom' },
        { type: 'doc', label: 'Custom gateway', id: 'build-decentralized-apps/bridging/configure-token-gateway/custom' },
      ],
    },
  ],
}
```

### `buildSoliditySidebar`

`buildSoliditySidebar` references two moved doc IDs that must be updated:

- `build-decentralized-apps/cross-chain-messaging` → `build-decentralized-apps/bridging/cross-chain-messaging`
- `build-decentralized-apps/custom-gas-token-sdk` → `build-decentralized-apps/bridging/custom-gas-token-chains`

These are standalone doc entries (not part of a category) in `buildSoliditySidebar`. Update the IDs in place; no structural changes needed.

## Redirects

Add redirects for all old URLs → new URLs:

| Old path                                                                                         | New path                                                                    |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `/build-decentralized-apps/cross-chain-messaging`                                                | `/build-decentralized-apps/bridging/cross-chain-messaging`                  |
| `/build-decentralized-apps/custom-gas-token-sdk`                                                 | `/build-decentralized-apps/bridging/custom-gas-token-chains`                |
| `/build-decentralized-apps/how-to-bridge-from-parent-chain`                                      | `/build-decentralized-apps/bridging/deposit/eth-and-messages`               |
| `/build-decentralized-apps/how-to-bridge-to-parent-chain`                                        | `/build-decentralized-apps/bridging/withdraw/eth-and-messages`              |
| `/build-decentralized-apps/token-bridging/get-started`                                           | `/build-decentralized-apps/bridging/overview`                               |
| `/build-decentralized-apps/token-bridging/deposit-tokens`                                        | `/build-decentralized-apps/bridging/deposit/tokens`                         |
| `/build-decentralized-apps/token-bridging/withdraw-tokens`                                       | `/build-decentralized-apps/bridging/withdraw/tokens`                        |
| `/build-decentralized-apps/token-bridging/configure-token-bridging/setup-standard-gateway`       | `/build-decentralized-apps/bridging/configure-token-gateway/standard`       |
| `/build-decentralized-apps/token-bridging/configure-token-bridging/setup-generic-custom-gateway` | `/build-decentralized-apps/bridging/configure-token-gateway/generic-custom` |
| `/build-decentralized-apps/token-bridging/configure-token-bridging/setup-custom-gateway`         | `/build-decentralized-apps/bridging/configure-token-gateway/custom`         |

Implementation: use the project's existing redirect mechanism (check for `@docusaurus/plugin-client-redirects` or static redirects config).

## Internal Link Updates

~30 references across these files need updating:

- `docs/how-arbitrum-works/deep-dives/l1-to-l2-messaging.mdx` (6 markdown link refs)
- `docs/how-arbitrum-works/deep-dives/l2-to-l1-messaging.mdx` (4 markdown link refs)
- `docs/how-arbitrum-works/deep-dives/token-bridging.mdx` (4 markdown link refs + 1 import statement — see below)
- `docs/partials/_troubleshooting-arbitrum-chain-partial.mdx` (1 fully-qualified URL ref — convert to relative link)
- All files within the new `bridging/` directory (internal cross-links between moved files)

### Build-breaking import statements

These import statements use relative paths and will cause build failures if not updated:

1. **`docs/how-arbitrum-works/deep-dives/token-bridging.mdx`** (line 115):

   ```javascript
   // OLD
   import TokenCompatibilityPartial from '../../build-decentralized-apps/token-bridging/partials/_token-compatibility.mdx';
   // NEW
   import TokenCompatibilityPartial from '../../build-decentralized-apps/bridging/partials/_token-compatibility.mdx';
   ```

2. **`bridging/configure-token-gateway/generic-custom.mdx`** (line 36): imports `../partials/_token-compatibility.mdx` — this relative path still resolves correctly after the move, no change needed.

### Fully-qualified URL

`docs/partials/_troubleshooting-arbitrum-chain-partial.mdx` (line 60) uses `https://docs.arbitrum.io/build-decentralized-apps/04-cross-chain-messaging`. Convert this to a relative Docusaurus link so it benefits from broken-link detection and the redirect.

## Content Changes to Moved Files

Minimal changes:

- Update frontmatter `displayed_sidebar` if needed
- Update relative internal links to reflect new paths
- No content rewrites

## Deletions After Moves

Files to delete:

- `docs/build-decentralized-apps/04-cross-chain-messaging.mdx`
- `docs/build-decentralized-apps/custom-gas-token-sdk.mdx`
- `docs/build-decentralized-apps/how-to-bridge-from-parent-chain.mdx`
- `docs/build-decentralized-apps/how-to-bridge-to-parent-chain.mdx`
- `docs/build-decentralized-apps/token-bridging/get-started.mdx`
- `docs/build-decentralized-apps/token-bridging/deposit-tokens.mdx`
- `docs/build-decentralized-apps/token-bridging/withdraw-tokens.mdx`
- `docs/build-decentralized-apps/token-bridging/configure-token-bridging/setup-standard-gateway.mdx`
- `docs/build-decentralized-apps/token-bridging/configure-token-bridging/setup-generic-custom-gateway.mdx`
- `docs/build-decentralized-apps/token-bridging/configure-token-bridging/setup-custom-gateway.mdx`
- `docs/build-decentralized-apps/token-bridging/partials/_token-compatibility.mdx`

Directories to remove (once empty):

- `docs/build-decentralized-apps/token-bridging/configure-token-bridging/`
- `docs/build-decentralized-apps/token-bridging/partials/`
- `docs/build-decentralized-apps/token-bridging/`
