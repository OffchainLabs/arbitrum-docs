// Every redirect on this site. Consumed by next.config.ts, which also derives a `.md` twin for
// each entry that lands under /docs (lib/markdown-redirects.ts), so list the HTML URL only.
//
// Two blocks:
//   - Between the AUTO-GENERATED markers: one entry per moved page, appended by `pnpm move-doc`.
//   - After them: legacy docs.arbitrum.io URLs pointing at this site's /docs paths, maintained by
//     hand. See INTERNALS.md#redirects for how to pick a destination.
//
// Permanence. An entry is `permanent: true` (308) when its source was a canonical page route on
// docs.arbitrum.io (one of the 293 page routes master published), a file master published at that
// URL, or a /docs URL this site used to serve (every move-doc entry). `/welcome/get-started` keeps
// the 308 master gave it. Every other legacy entry is `permanent: false` (307): those URLs were
// already redirects on master, and a temporary answer keeps the mapping free to change.
//
// `pnpm test` (scripts/lib/redirects-config.test.ts) asserts that every internal destination is a
// page under content/docs or a file under public/, that no source is a live page, that nothing
// chains, and that no source is listed twice, over this list and the derived `.md` twins. After a
// move, fix any entry it reports by hand.

/** The shape `next.config.ts` hands to Next. */
export type Redirect = { source: string; destination: string; permanent: boolean };

export const redirects: Redirect[] = [
  // AUTO-GENERATED REDIRECTS START
  {
    source: '/docs/launch-arbitrum-chain/run-a-node/run-batch-poster',
    destination: '/docs/launch-arbitrum-chain/run-a-node/batch-poster',
    permanent: true,
  },
  {
    source: '/docs/launch-arbitrum-chain/run-a-node/run-split-validator-node',
    destination: '/docs/launch-arbitrum-chain/run-a-node/split-validator-node',
    permanent: true,
  },
  {
    source: '/docs/launch-arbitrum-chain/run-a-node/high-availability-sequencer-docs',
    destination: '/docs/launch-arbitrum-chain/run-a-node/high-availability-sequencer',
    permanent: true,
  },
  // AUTO-GENERATED REDIRECTS END

  // Master page URLs that lost their entry during the migration; both pages exist under /docs.
  {
    source: '/how-arbitrum-works/deep-dives/stf',
    destination: '/docs/how-arbitrum-works/deep-dives/stf',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/deploy/custom-genesis-state',
    destination: '/docs/launch-arbitrum-chain/deploy/custom-genesis-state',
    permanent: true,
  },

  // Docusaurus served the audit-report PDFs at content-hashed paths
  // (`/assets/files/<name>-<32 hex>.pdf`). The same files are in public/audit-reports/.
  {
    source: '/assets/files/:name([^/]+)-:hash([0-9a-f]{32}).pdf',
    destination: '/audit-reports/:name.pdf',
    permanent: true,
  },

  // Master's generated category pages and its empty blog listing. Fumadocs builds no category
  // index, so each goes to the category's first page. Temporary, as there is no one-to-one page.
  {
    source: '/category/best-practices',
    destination: '/docs/stylus/best-practices/security',
    permanent: false,
  },
  {
    source: '/category/troubleshooting',
    destination: '/docs/stylus/troubleshooting/common-issues',
    permanent: false,
  },
  {
    source: '/blog',
    destination: '/docs',
    permanent: false,
  },

  // A diagram master served as PNG; the site now ships it as SVG.
  {
    source: '/img/haw-transaction-lifecycle.png',
    destination: '/img/haw-transaction-lifecycle.svg',
    permanent: true,
  },

  // The pattern guide now lives in CONTRIBUTE.md and STYLE-GUIDE.md; the public contribution page links to both.
  {
    source: '/docs/Offchain-pattern-guide',
    destination: '/docs/contribute',
    permanent: true,
  },
  {
    source: '/Offchain-pattern-guide',
    destination: '/docs/contribute',
    permanent: true,
  },

  // Legacy docs.arbitrum.io URLs
  {
    source: '/anytrust',
    destination: '/docs/how-arbitrum-works/deep-dives/anytrust-protocol',
    permanent: false,
  },
  {
    source: '/anytrust/inside-anytrust',
    destination: '/docs/how-arbitrum-works/deep-dives/anytrust-protocol',
    permanent: false,
  },
  {
    source: '/arb-specific-things',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/comparison-overview',
    permanent: false,
  },
  {
    source: '/arbgas',
    destination: '/docs/how-arbitrum-works/deep-dives/gas-and-fees',
    permanent: false,
  },
  {
    source: '/arbitrum-bridge/bridge-transaction-traceability',
    destination: '/docs/arbitrum-bridge/bridge-transaction-traceability',
    permanent: true,
  },
  {
    source: '/arbitrum-bridge/embedded-bridge-widget',
    destination: '/docs/arbitrum-bridge/embedded-bridge-widget',
    permanent: true,
  },
  {
    source: '/arbitrum-bridge/quickstart',
    destination: '/docs/arbitrum-bridge/quickstart',
    permanent: true,
  },
  {
    source: '/arbitrum-bridge/troubleshooting',
    destination: '/docs/arbitrum-bridge/troubleshooting',
    permanent: true,
  },
  {
    source: '/arbitrum-bridge/usdc-arbitrum-one',
    destination: '/docs/arbitrum-bridge/usdc-arbitrum-one',
    permanent: true,
  },
  {
    source: '/arbitrum-bridge/withdrawal-monitoring',
    destination: '/docs/arbitrum-bridge/withdrawal-monitoring',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials',
    destination: '/docs/arbitrum-essentials',
    permanent: false,
  },
  {
    source: '/arbitrum-essentials/arbitrum-vs-ethereum/block-numbers-and-time',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/block-numbers-and-time',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/arbitrum-vs-ethereum/comparison-overview',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/comparison-overview',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/arbitrum-vs-ethereum/nonce-management',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/nonce-management',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/arbitrum-vs-ethereum/rpc-methods',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/rpc-methods',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/arbitrum-vs-ethereum/solidity-support',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/solidity-support',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/bridging/configure-token-gateway/custom',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/custom',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/bridging/configure-token-gateway/generic-custom',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/generic-custom',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/bridging/configure-token-gateway/standard',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/standard',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/bridging/cross-chain-messaging',
    destination: '/docs/arbitrum-essentials/bridging/cross-chain-messaging',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/bridging/custom-gas-token-chains',
    destination: '/docs/arbitrum-essentials/bridging/custom-gas-token-chains',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/bridging/deposit/eth-and-messages',
    destination: '/docs/arbitrum-essentials/bridging/deposit/eth-and-messages',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/bridging/deposit/tokens',
    destination: '/docs/arbitrum-essentials/bridging/deposit/tokens',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/bridging/l1-l3-teleportation',
    destination: '/docs/arbitrum-essentials/bridging/l1-l3-teleportation',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/bridging/overview',
    destination: '/docs/arbitrum-essentials/bridging/overview',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/bridging/withdraw/eth-and-messages',
    destination: '/docs/arbitrum-essentials/bridging/withdraw/eth-and-messages',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/bridging/withdraw/tokens',
    destination: '/docs/arbitrum-essentials/bridging/withdraw/tokens',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/how-to-estimate-gas',
    destination: '/docs/arbitrum-essentials/how-to-estimate-gas',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/how-to-get-l2block-on-l1',
    destination: '/docs/arbitrum-essentials/how-to-get-l2block-on-l1',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/nodeinterface/overview',
    destination: '/docs/arbitrum-essentials/nodeinterface/overview',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/nodeinterface/reference',
    destination: '/docs/arbitrum-essentials/nodeinterface/reference',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/oracles/overview-oracles',
    destination: '/docs/oracles/overview-oracles',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/precompiles/overview',
    destination: '/docs/arbitrum-essentials/precompiles/overview',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/precompiles/reference',
    destination: '/docs/arbitrum-essentials/precompiles/reference',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/public-chains',
    destination: '/docs/arbitrum-essentials/public-chains',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/reference/chain-params',
    destination: '/docs/arbitrum-essentials/reference/chain-params',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/reference/contract-addresses',
    destination: '/docs/arbitrum-essentials/reference/contract-addresses',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/reference/debugging-tools',
    destination: '/docs/arbitrum-essentials/reference/debugging-tools',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/reference/development-frameworks',
    destination: '/docs/arbitrum-essentials/reference/development-frameworks',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/reference/mainnet-risks',
    destination: '/docs/arbitrum-essentials/reference/mainnet-risks',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/reference/monitoring-tools-block-explorers',
    destination: '/docs/arbitrum-essentials/reference/monitoring-tools-block-explorers',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/reference/node-providers',
    destination: '/docs/arbitrum-essentials/reference/node-providers',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/reference/solidity-references',
    destination: '/docs/arbitrum-essentials/reference/solidity-references',
    permanent: true,
  },
  {
    source: '/arbitrum-essentials/reference/web3-libraries-tools',
    destination: '/docs/arbitrum-essentials/reference/web3-libraries-tools',
    permanent: true,
  },
  {
    source: '/arbitrum-ethereum-differences',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/comparison-overview',
    permanent: false,
  },
  {
    source: '/arbos',
    destination: '/docs/how-arbitrum-works/reference/geth',
    permanent: false,
  },
  {
    source: '/arbos_formats',
    destination: '/docs/how-arbitrum-works/reference/geth',
    permanent: false,
  },
  {
    source: '/arbos/common-precompiles',
    destination: '/docs/arbitrum-essentials/precompiles/reference',
    permanent: false,
  },
  {
    source: '/arbos/gas',
    destination: '/docs/how-arbitrum-works/deep-dives/gas-and-fees',
    permanent: false,
  },
  {
    source: '/arbos/gateways',
    destination: '/docs/how-arbitrum-works/inside-arbitrum-nitro',
    permanent: false,
  },
  {
    source: '/arbos/geth',
    destination: '/docs/how-arbitrum-works/reference/geth',
    permanent: false,
  },
  {
    source: '/arbos/introduction',
    destination: '/docs/how-arbitrum-works/reference/geth',
    permanent: false,
  },
  {
    source: '/arbos/l1-gas-pricing',
    destination: '/docs/how-arbitrum-works/deep-dives/gas-and-fees',
    permanent: false,
  },
  {
    source: '/arbos/l1-l2-messaging',
    destination: '/docs/how-arbitrum-works/deep-dives/l1-to-l2-messaging',
    permanent: false,
  },
  {
    source: '/arbos/l1-pricing',
    destination: '/docs/how-arbitrum-works/deep-dives/gas-and-fees',
    permanent: false,
  },
  {
    source: '/arbos/l1-to-l2-messaging',
    destination: '/docs/how-arbitrum-works/deep-dives/l1-to-l2-messaging',
    permanent: false,
  },
  {
    source: '/arbos/l2-l1-messaging',
    destination: '/docs/how-arbitrum-works/deep-dives/l2-to-l1-messaging',
    permanent: false,
  },
  {
    source: '/arbos/precompiles',
    destination: '/docs/arbitrum-essentials/precompiles/reference',
    permanent: false,
  },
  {
    source: '/arbsys',
    destination: '/docs/arbitrum-essentials/precompiles/reference#arbsys',
    permanent: false,
  },
  {
    source: '/assertion-tree',
    destination: '/docs/how-arbitrum-works/deep-dives/assertions',
    permanent: false,
  },
  {
    source: '/asset-bridging',
    destination: '/docs/how-arbitrum-works/deep-dives/token-bridging',
    permanent: false,
  },
  {
    source: '/audit-reports',
    destination: '/docs/audit-reports',
    permanent: true,
  },
  {
    source: '/avm_design',
    destination: '/docs/how-arbitrum-works/inside-arbitrum-nitro',
    permanent: false,
  },
  {
    source: '/avm_specification',
    destination: '/docs/how-arbitrum-works/inside-arbitrum-nitro',
    permanent: false,
  },
  {
    source: '/bold/bold-gentle-introduction',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/bold/concepts/bold-technical-deep-dive',
    destination: '/docs/how-arbitrum-works/bold/bold-technical-deep-dive',
    permanent: false,
  },
  {
    source: '/bold/concepts/public-preview-expectations',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/bridge-tokens/concepts/usdc-concept',
    destination: '/docs/arbitrum-bridge/usdc-arbitrum-one',
    permanent: false,
  },
  {
    source: '/bridging_assets',
    destination: '/docs/how-arbitrum-works/deep-dives/token-bridging',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/arbitrum-vs-ethereum/block-numbers-and-time',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/block-numbers-and-time',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/arbitrum-vs-ethereum/comparison-overview',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/comparison-overview',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/arbitrum-vs-ethereum/nonce-management',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/nonce-management',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/arbitrum-vs-ethereum/rpc-methods',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/rpc-methods',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/arbitrum-vs-ethereum/solidity-support',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/solidity-support',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/bridging/configure-token-gateway/custom',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/custom',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/bridging/configure-token-gateway/generic-custom',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/generic-custom',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/bridging/configure-token-gateway/standard',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/standard',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/bridging/cross-chain-messaging',
    destination: '/docs/arbitrum-essentials/bridging/cross-chain-messaging',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/bridging/custom-gas-token-chains',
    destination: '/docs/arbitrum-essentials/bridging/custom-gas-token-chains',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/bridging/deposit/eth-and-messages',
    destination: '/docs/arbitrum-essentials/bridging/deposit/eth-and-messages',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/bridging/deposit/tokens',
    destination: '/docs/arbitrum-essentials/bridging/deposit/tokens',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/bridging/l1-l3-teleportation',
    destination: '/docs/arbitrum-essentials/bridging/l1-l3-teleportation',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/bridging/overview',
    destination: '/docs/arbitrum-essentials/bridging/overview',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/bridging/withdraw/eth-and-messages',
    destination: '/docs/arbitrum-essentials/bridging/withdraw/eth-and-messages',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/bridging/withdraw/tokens',
    destination: '/docs/arbitrum-essentials/bridging/withdraw/tokens',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/cross-chain-messaging',
    destination: '/docs/arbitrum-essentials/bridging/cross-chain-messaging',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/custom-gas-token-sdk',
    destination: '/docs/arbitrum-essentials/bridging/custom-gas-token-chains',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/how-to-bridge-from-parent-chain',
    destination: '/docs/arbitrum-essentials/bridging/deposit/eth-and-messages',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/how-to-bridge-to-parent-chain',
    destination: '/docs/arbitrum-essentials/bridging/withdraw/eth-and-messages',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/how-to-estimate-gas',
    destination: '/docs/arbitrum-essentials/how-to-estimate-gas',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/how-to-get-l2block-on-l1',
    destination: '/docs/arbitrum-essentials/how-to-get-l2block-on-l1',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/machine-payments-protocol',
    destination: '/docs/build-decentralized-apps/machine-payments-protocol',
    permanent: true,
  },
  {
    source: '/build-decentralized-apps/nodeinterface/overview',
    destination: '/docs/arbitrum-essentials/nodeinterface/overview',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/nodeinterface/reference',
    destination: '/docs/arbitrum-essentials/nodeinterface/reference',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/oracles/how-to-use-oracles',
    destination: '/docs/oracles/overview-oracles',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/oracles/overview',
    destination: '/docs/oracles/overview-oracles',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/oracles/overview-oracles',
    destination: '/docs/oracles/overview-oracles',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/oracles/reference',
    destination: '/docs/oracles/overview-oracles',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/precompiles/overview',
    destination: '/docs/arbitrum-essentials/precompiles/overview',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/precompiles/reference',
    destination: '/docs/arbitrum-essentials/precompiles/reference',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/public-chains',
    destination: '/docs/arbitrum-essentials/public-chains',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/quickstart-create-a-token',
    destination: '/docs/build-decentralized-apps/quickstart-create-a-token',
    permanent: true,
  },
  {
    source: '/build-decentralized-apps/quickstart-solidity-hardhat',
    destination: '/docs/build-decentralized-apps/quickstart-solidity-remix',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/quickstart-solidity-remix',
    destination: '/docs/build-decentralized-apps/quickstart-solidity-remix',
    permanent: true,
  },
  {
    source: '/build-decentralized-apps/reference/chain-params',
    destination: '/docs/arbitrum-essentials/reference/chain-params',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/reference/contract-addresses',
    destination: '/docs/arbitrum-essentials/reference/contract-addresses',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/reference/debugging-tools',
    destination: '/docs/arbitrum-essentials/reference/debugging-tools',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/reference/development-frameworks',
    destination: '/docs/arbitrum-essentials/reference/development-frameworks',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/reference/mainnet-risks',
    destination: '/docs/arbitrum-essentials/reference/mainnet-risks',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/reference/monitoring-tools-block-explorers',
    destination: '/docs/arbitrum-essentials/reference/monitoring-tools-block-explorers',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/reference/node-providers',
    destination: '/docs/arbitrum-essentials/reference/node-providers',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/reference/useful-addresses',
    destination: '/docs/arbitrum-essentials/reference/contract-addresses',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/reference/web3-libraries-tools',
    destination: '/docs/arbitrum-essentials/reference/web3-libraries-tools',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/01-get-started',
    destination: '/docs/arbitrum-essentials/bridging/overview',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/02-how-to-bridge-tokens-standard',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/standard',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/02-token-bridge-ether',
    destination: '/docs/arbitrum-essentials/bridging/deposit/eth-and-messages',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/03-how-to-bridge-tokens-generic-custom',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/generic-custom',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/04-how-to-bridge-tokens-custom-gateway',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/custom',
    permanent: false,
  },
  {
    source:
      '/build-decentralized-apps/token-bridging/bridge-tokens-programmatically/01-get-started',
    destination: '/docs/arbitrum-essentials/bridging/overview',
    permanent: false,
  },
  {
    source:
      '/build-decentralized-apps/token-bridging/bridge-tokens-programmatically/02-how-to-bridge-tokens-standard',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/standard',
    permanent: false,
  },
  {
    source:
      '/build-decentralized-apps/token-bridging/bridge-tokens-programmatically/03-how-to-bridge-tokens-generic-custom',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/generic-custom',
    permanent: false,
  },
  {
    source:
      '/build-decentralized-apps/token-bridging/bridge-tokens-programmatically/04-how-to-bridge-tokens-custom-gateway',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/custom',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/bridge-tokens-programmatically/get-started',
    destination: '/docs/arbitrum-essentials/bridging/overview',
    permanent: false,
  },
  {
    source:
      '/build-decentralized-apps/token-bridging/bridge-tokens-programmatically/how-to-bridge-tokens-custom-gateway',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/custom',
    permanent: false,
  },
  {
    source:
      '/build-decentralized-apps/token-bridging/bridge-tokens-programmatically/how-to-bridge-tokens-generic-custom',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/generic-custom',
    permanent: false,
  },
  {
    source:
      '/build-decentralized-apps/token-bridging/bridge-tokens-programmatically/how-to-bridge-tokens-standard',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/standard',
    permanent: false,
  },
  {
    source:
      '/build-decentralized-apps/token-bridging/configure-token-bridging/setup-custom-gateway',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/custom',
    permanent: false,
  },
  {
    source:
      '/build-decentralized-apps/token-bridging/configure-token-bridging/setup-generic-custom-gateway',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/generic-custom',
    permanent: false,
  },
  {
    source:
      '/build-decentralized-apps/token-bridging/configure-token-bridging/setup-standard-gateway',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/standard',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/deposit-tokens',
    destination: '/docs/arbitrum-essentials/bridging/deposit/tokens',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/get-started',
    destination: '/docs/arbitrum-essentials/bridging/overview',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/how-to-bridge-tokens-custom-gateway',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/custom',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/how-to-bridge-tokens-generic-custom',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/generic-custom',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/how-to-bridge-tokens-standard',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/standard',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/token-bridge-erc20',
    destination: '/docs/how-arbitrum-works/deep-dives/token-bridging',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/token-bridge-ether',
    destination: '/docs/arbitrum-essentials/bridging/deposit/eth-and-messages',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/token-bridging/withdraw-tokens',
    destination: '/docs/arbitrum-essentials/bridging/withdraw/tokens',
    permanent: false,
  },
  {
    source: '/build-decentralized-apps/troubleshooting',
    destination: '/docs/build-decentralized-apps/troubleshooting-building',
    permanent: false,
  },
  {
    source: '/censorship_resistance',
    destination: '/docs/how-arbitrum-works/deep-dives/sequencer',
    permanent: false,
  },
  {
    source: '/contract_deployment',
    destination: '/docs/build-decentralized-apps/quickstart-solidity-remix',
    permanent: false,
  },
  {
    source: '/das/daserver-instructions',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/dac-get-started',
    permanent: false,
  },
  {
    source: '/developer_quickstart',
    destination: '/docs/get-started',
    permanent: false,
  },
  {
    source: '/devs-how-tos/bridge-tokens/gentle-introduction-bridge',
    destination: '/docs/arbitrum-essentials/bridging/overview',
    permanent: false,
  },
  {
    source: '/devs-how-tos/bridge-tokens/how-to-bridge-tokens-custom-gateway',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/custom',
    permanent: false,
  },
  {
    source: '/devs-how-tos/bridge-tokens/how-to-bridge-tokens-custom-generic',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/generic-custom',
    permanent: false,
  },
  {
    source: '/devs-how-tos/bridge-tokens/how-to-bridge-tokens-generic-custom',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/generic-custom',
    permanent: false,
  },
  {
    source: '/devs-how-tos/bridge-tokens/how-to-bridge-tokens-overview',
    destination: '/docs/arbitrum-essentials/bridging/overview',
    permanent: false,
  },
  {
    source: '/devs-how-tos/bridge-tokens/how-to-bridge-tokens-standard',
    destination: '/docs/arbitrum-essentials/bridging/configure-token-gateway/standard',
    permanent: false,
  },
  {
    source: '/devs-how-tos/how-to-estimate-gas',
    destination: '/docs/arbitrum-essentials/how-to-estimate-gas',
    permanent: false,
  },
  {
    source: '/devs-how-tos/how-to-use-oracles',
    destination: '/docs/oracles/overview-oracles',
    permanent: false,
  },
  {
    source: '/differences_overview',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/comparison-overview',
    permanent: false,
  },
  {
    source: '/dispute_resolution',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/faqs/anytrust-vs-rollup',
    destination: '/docs/how-arbitrum-works/deep-dives/anytrust-protocol',
    permanent: false,
  },
  {
    source: '/faqs/beta-status',
    destination: '/docs/arbitrum-essentials/reference/mainnet-risks',
    permanent: false,
  },
  {
    source: '/faqs/faqs-index',
    destination: '/docs/get-started/faq',
    permanent: false,
  },
  {
    source: '/faqs/gas-faqs',
    destination: '/docs/get-started/faq',
    permanent: false,
  },
  {
    source: '/faqs/how-fees',
    destination: '/docs/get-started/faq',
    permanent: false,
  },
  {
    source: '/faqs/misc-faqs',
    destination: '/docs/get-started/faq',
    permanent: false,
  },
  {
    source: '/faqs/nodes-faqs',
    destination: '/docs/run-a-node/faq',
    permanent: false,
  },
  {
    source: '/faqs/protocol-faqs',
    destination: '/docs/get-started/faq',
    permanent: false,
  },
  {
    source: '/faqs/seq-or-val',
    destination: '/docs/how-arbitrum-works/deep-dives/sequencer',
    permanent: false,
  },
  {
    source: '/faqs/the-merge',
    destination: '/docs/get-started',
    permanent: false,
  },
  {
    source: '/faqs/tooling-faqs',
    destination: '/docs/build-decentralized-apps/troubleshooting-building',
    permanent: false,
  },
  {
    source: '/faqs/what-if-dispute',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/faqs/x-chain-faqs',
    destination: '/docs/get-started/faq',
    permanent: false,
  },
  {
    source: '/finality',
    destination: '/docs/how-arbitrum-works/deep-dives/transaction-lifecycle',
    permanent: false,
  },
  {
    source: '/for-devs/chain-params',
    destination: '/docs/arbitrum-essentials/reference/chain-params',
    permanent: false,
  },
  {
    source: '/for-devs/concepts/differences-between-arbitrum-ethereum/block-numbers-and-time',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/block-numbers-and-time',
    permanent: false,
  },
  {
    source: '/for-devs/concepts/differences-between-arbitrum-ethereum/overview',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/comparison-overview',
    permanent: false,
  },
  {
    source: '/for-devs/concepts/differences-between-arbitrum-ethereum/rpc-methods',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/rpc-methods',
    permanent: false,
  },
  {
    source: '/for-devs/concepts/differences-between-arbitrum-ethereum/solidity-support',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/solidity-support',
    permanent: false,
  },
  {
    source: '/for-devs/concepts/fees',
    destination: '/docs/arbitrum-essentials/how-to-estimate-gas',
    permanent: false,
  },
  {
    source: '/for-devs/concepts/nodeinterface',
    destination: '/docs/arbitrum-essentials/nodeinterface/overview',
    permanent: false,
  },
  {
    source: '/for-devs/concepts/oracles',
    destination: '/docs/oracles/overview-oracles',
    permanent: false,
  },
  {
    source: '/for-devs/concepts/precompiles',
    destination: '/docs/arbitrum-essentials/precompiles/overview',
    permanent: false,
  },
  {
    source: '/for-devs/concepts/public-chains',
    destination: '/docs/arbitrum-essentials/public-chains',
    permanent: false,
  },
  {
    source: '/for-devs/concepts/token-bridge/token-bridge-erc20',
    destination: '/docs/how-arbitrum-works/deep-dives/token-bridging',
    permanent: false,
  },
  {
    source: '/for-devs/concepts/token-bridge/token-bridge-ether',
    destination: '/docs/arbitrum-essentials/bridging/deposit/eth-and-messages',
    permanent: false,
  },
  {
    source: '/for-devs/concepts/token-bridge/token-bridge-overview',
    destination: '/docs/arbitrum-essentials/bridging/overview',
    permanent: false,
  },
  {
    source: '/for-devs/contribute',
    destination: '/docs/contribute',
    permanent: true,
  },
  {
    source: '/for-devs/cross-chain-messsaging',
    destination: '/docs/arbitrum-essentials/bridging/cross-chain-messaging',
    permanent: false,
  },
  {
    source: '/for-devs/dev-tools-and-resources/chain-info',
    destination: '/docs/chain-info',
    permanent: true,
  },
  {
    source: '/for-devs/dev-tools-and-resources/debugging-tools',
    destination: '/docs/arbitrum-essentials/reference/debugging-tools',
    permanent: false,
  },
  {
    source: '/for-devs/dev-tools-and-resources/development-frameworks',
    destination: '/docs/arbitrum-essentials/reference/development-frameworks',
    permanent: false,
  },
  {
    source: '/for-devs/dev-tools-and-resources/monitoring-tools-block-explorers',
    destination: '/docs/arbitrum-essentials/reference/monitoring-tools-block-explorers',
    permanent: false,
  },
  {
    source: '/for-devs/dev-tools-and-resources/nodeinterface',
    destination: '/docs/arbitrum-essentials/nodeinterface/reference',
    permanent: false,
  },
  {
    source: '/for-devs/dev-tools-and-resources/oracles',
    destination: '/docs/oracles/overview-oracles',
    permanent: false,
  },
  {
    source: '/for-devs/dev-tools-and-resources/overview',
    destination: '/docs/arbitrum-essentials/reference/node-providers',
    permanent: false,
  },
  {
    source: '/for-devs/dev-tools-and-resources/precompiles',
    destination: '/docs/arbitrum-essentials/precompiles/reference',
    permanent: false,
  },
  {
    source: '/for-devs/dev-tools-and-resources/web3-libraries-tools',
    destination: '/docs/arbitrum-essentials/reference/web3-libraries-tools',
    permanent: false,
  },
  {
    source: '/for-devs/gentle-introduction-dapps',
    destination: '/docs/get-started/arbitrum-introduction',
    permanent: false,
  },
  {
    source: '/for-devs/oracles/api3',
    destination: '/docs/oracles/api3/api3',
    permanent: true,
  },
  {
    source: '/for-devs/oracles/chainlink',
    destination: '/docs/oracles/chainlink/chainlink',
    permanent: true,
  },
  {
    source: '/for-devs/oracles/chronicle',
    destination: '/docs/oracles/chronicle/chronicle',
    permanent: true,
  },
  {
    source: '/for-devs/oracles/DIA',
    destination: '/docs/oracles/DIA/dia',
    permanent: true,
  },
  {
    source: '/for-devs/oracles/ora',
    destination: '/docs/oracles/ora/ora',
    permanent: true,
  },
  {
    source: '/for-devs/oracles/oracles-content-map',
    destination: '/docs/oracles',
    permanent: true,
  },
  {
    source: '/for-devs/oracles/supra/supras-price-feed',
    destination: '/docs/oracles/supra/use-supras-price-feed-oracle',
    permanent: true,
  },
  {
    source: '/for-devs/oracles/supra/supras-vrf',
    destination: '/docs/oracles/supra/use-supras-vrf',
    permanent: true,
  },
  {
    source: '/for-devs/oracles/trellor',
    destination: '/docs/oracles/trellor/trellor',
    permanent: true,
  },
  {
    source: '/for-devs/quickstart-solidity-hardhat',
    destination: '/docs/build-decentralized-apps/quickstart-solidity-remix',
    permanent: false,
  },
  {
    source: '/for-devs/quickstart-solidity-remix',
    destination: '/docs/build-decentralized-apps/quickstart-solidity-remix',
    permanent: false,
  },
  {
    source: '/for-devs/third-party-docs/Circle/usdc-paymaster-quickstart',
    destination: '/docs/third-party-docs/Circle/usdc-paymaster-quickstart',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Circle/usdc-quickstart-guide',
    destination: '/docs/third-party-docs/Circle/usdc-quickstart-guide',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Codex',
    destination: '/docs/third-party-docs/Codex/codex',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/contribute',
    destination: '/docs/third-party-docs/contribute',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Covalent',
    destination: '/docs/third-party-docs/Covalent/covalent',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Crossmint',
    destination: '/docs/third-party-docs/Crossmint/crossmint',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Envio',
    destination: '/docs/third-party-docs/Envio/envio',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Flair',
    destination: '/docs/third-party-docs/Flair/flair',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Gelato/gelato-vrf',
    destination: '/docs/third-party-docs/Gelato/gelato-vrf',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/LayerZero',
    destination: '/docs/third-party-docs/LayerZero/layerzero',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/MetaMask',
    destination: '/docs/third-party-docs/MetaMask/metamask',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Moralis',
    destination: '/docs/third-party-docs/Moralis/moralis',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/OKX',
    destination: '/docs/third-party-docs/OKX/okx',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Openfort',
    destination: '/docs/third-party-docs/Openfort/openfort',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Particle',
    destination: '/docs/third-party-docs/Particle/particle',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/QuickNode/backfill-templates',
    destination: '/docs/third-party-docs/QuickNode/backfill-templates',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Reactive',
    destination: '/docs/third-party-docs/Reactive/reactive',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Reown',
    destination: '/docs/third-party-docs/Reown/reown',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/TheGraph',
    destination: '/docs/third-party-docs/TheGraph/thegraph',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Venly',
    destination: '/docs/third-party-docs/Venly/venly',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Webacy',
    destination: '/docs/third-party-docs/Webacy/webacy',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/Zerion',
    destination: '/docs/third-party-docs/Zerion/zerion',
    permanent: true,
  },
  {
    source: '/for-devs/third-party-docs/ZeroDev/zero-dev',
    destination: '/docs/third-party-docs/ZeroDev/zero-dev',
    permanent: true,
  },
  {
    source: '/for-devs/troubleshooting-building',
    destination: '/docs/build-decentralized-apps/troubleshooting-building',
    permanent: true,
  },
  {
    source: '/for-devs/useful-addresses',
    destination: '/docs/arbitrum-essentials/reference/contract-addresses',
    permanent: false,
  },
  {
    source: '/for-users/troubleshooting-users',
    destination: '/docs/arbitrum-bridge/troubleshooting',
    permanent: false,
  },
  {
    source: '/fraud-proofs/challenge-manager',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/fraud-proofs/osp-assumptions',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/fraud-proofs/wasm-wavm',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/fraud-proofs/wavm-custom-opcodes',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/fraud-proofs/wavm-floats',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/fraud-proofs/wavm-modules',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/frontend_integration',
    destination: '/docs/build-decentralized-apps/quickstart-solidity-remix',
    permanent: false,
  },
  {
    source: '/get-started/arbitrum-introduction',
    destination: '/docs/get-started/arbitrum-introduction',
    permanent: true,
  },
  {
    source: '/get-started/get-started',
    destination: '/docs/get-started',
    permanent: false,
  },
  {
    source: '/getting-started-devs',
    destination: '/docs/build-decentralized-apps/quickstart-solidity-remix',
    permanent: false,
  },
  {
    source: '/getting-started-users',
    destination: '/docs/arbitrum-bridge/quickstart',
    permanent: false,
  },
  {
    source: '/glossary',
    destination: '/docs/glossary',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works',
    destination: '/docs/how-arbitrum-works',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/a-gentle-introduction',
    destination: '/docs/how-arbitrum-works/inside-arbitrum-nitro',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/anytrust-protocol',
    destination: '/docs/how-arbitrum-works/deep-dives/anytrust-protocol',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/arbos/geth',
    destination: '/docs/how-arbitrum-works/reference/geth',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/arbos/introduction',
    destination: '/docs/how-arbitrum-works/deep-dives/arbos',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/arbos/l1-l2-messaging',
    destination: '/docs/how-arbitrum-works/deep-dives/l1-to-l2-messaging',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/arbos/l2-l1-messaging',
    destination: '/docs/how-arbitrum-works/deep-dives/l2-to-l1-messaging',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/assertion-tree',
    destination: '/docs/how-arbitrum-works/deep-dives/assertions',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/bold/bold-economics-of-disputes',
    destination: '/docs/how-arbitrum-works/bold/bold-economics-of-disputes',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/bold/bold-faq',
    destination: '/docs/how-arbitrum-works/bold/bold-faq',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/bold/bold-technical-deep-dive',
    destination: '/docs/how-arbitrum-works/bold/bold-technical-deep-dive',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/bold/gentle-introduction',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/bold/how-bold-bisection-works',
    destination: '/docs/how-arbitrum-works/bold/how-bold-bisection-works',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/bold/public-preview-expectations',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/data-availability',
    destination: '/docs/run-a-node/data-availability',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/deep-dives/anytrust-protocol',
    destination: '/docs/how-arbitrum-works/deep-dives/anytrust-protocol',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/deep-dives/arbos',
    destination: '/docs/how-arbitrum-works/deep-dives/arbos',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/deep-dives/assertions',
    destination: '/docs/how-arbitrum-works/deep-dives/assertions',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/deep-dives/batchposter',
    destination: '/docs/how-arbitrum-works/deep-dives/batchposter',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/deep-dives/finality',
    destination: '/docs/how-arbitrum-works/deep-dives/finality',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/deep-dives/gas-and-fees',
    destination: '/docs/how-arbitrum-works/deep-dives/gas-and-fees',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/deep-dives/l1-to-l2-messaging',
    destination: '/docs/how-arbitrum-works/deep-dives/l1-to-l2-messaging',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/deep-dives/l2-to-l1-messaging',
    destination: '/docs/how-arbitrum-works/deep-dives/l2-to-l1-messaging',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/deep-dives/parent-chain-pricing',
    destination: '/docs/how-arbitrum-works/deep-dives/gas-and-fees#parent-chain-gas-pricing',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/deep-dives/sequencer',
    destination: '/docs/how-arbitrum-works/deep-dives/sequencer',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/deep-dives/sequencer-transaction-flow',
    destination: '/docs/how-arbitrum-works/deep-dives/sequencer-transaction-flow',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/deep-dives/stf',
    destination: '/docs/how-arbitrum-works/deep-dives/stf',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/deep-dives/stf-gentle-intro',
    destination: '/docs/how-arbitrum-works/deep-dives/stf',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/deep-dives/token-bridging',
    destination: '/docs/how-arbitrum-works/deep-dives/token-bridging',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/deep-dives/transaction-lifecycle',
    destination: '/docs/how-arbitrum-works/deep-dives/transaction-lifecycle',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/fees',
    destination: '/docs/how-arbitrum-works/deep-dives/gas-and-fees',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/fraud-proofs/challenge-manager',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/fraud-proofs/osp-assumptions',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/fraud-proofs/wasm-to-wavm',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/fraud-proofs/wavm-custom-opcodes',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/gas-fees',
    destination: '/docs/how-arbitrum-works/deep-dives/gas-and-fees',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/geth-at-the-core',
    destination: '/docs/how-arbitrum-works/deep-dives/stf',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/inside-anytrust',
    destination: '/docs/how-arbitrum-works/deep-dives/anytrust-protocol',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/inside-arbitrum-nitro',
    destination: '/docs/how-arbitrum-works/inside-arbitrum-nitro',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/interactive-fraud-proofs',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/l1-gas-pricing',
    destination: '/docs/how-arbitrum-works/deep-dives/gas-and-fees',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/l1-pricing',
    destination: '/docs/how-arbitrum-works/deep-dives/gas-and-fees',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/l1-to-l2-messaging',
    destination: '/docs/how-arbitrum-works/deep-dives/l1-to-l2-messaging',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/l2-to-l1-messaging',
    destination: '/docs/how-arbitrum-works/deep-dives/l2-to-l1-messaging',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/nitro-vs-classic',
    destination: '/docs/how-arbitrum-works/inside-arbitrum-nitro',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/optimistic-rollup',
    destination: '/docs/how-arbitrum-works/inside-arbitrum-nitro',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/priority-gas-auction/fast-feed',
    destination: '/docs/how-arbitrum-works/priority-gas-auction/fast-feed',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/priority-gas-auction/use-fast-feed',
    destination: '/docs/how-arbitrum-works/priority-gas-auction/use-fast-feed',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/priority-gas-auction/pga',
    destination: '/docs/how-arbitrum-works/priority-gas-auction/pga',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/priority-gas-auction/use-fast-feed',
    destination: '/docs/how-arbitrum-works/priority-gas-auction/use-fast-feed',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/reference/arbos-reference',
    destination: '/docs/how-arbitrum-works/reference/arbos-reference',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/reference/finality-and-reorgs',
    destination: '/docs/how-arbitrum-works/reference/finality-and-reorgs',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/reference/geth',
    destination: '/docs/how-arbitrum-works/reference/geth',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/reference/parent-chain-pricing',
    destination: '/docs/how-arbitrum-works/deep-dives/gas-and-fees#parent-chain-gas-pricing',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/reference/stf-inputs',
    destination: '/docs/how-arbitrum-works/reference/stf-inputs',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/separating-execution-from-proving',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/sequencer',
    destination: '/docs/how-arbitrum-works/deep-dives/sequencer',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/state-transition-function/arbos',
    destination: '/docs/how-arbitrum-works/deep-dives/arbos',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/state-transition-function/ethereum-vs-arbitrum',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/comparison-overview',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/state-transition-function/modified-geth-on-arbitrum',
    destination: '/docs/how-arbitrum-works/reference/geth',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/state-transition-function/stf-gentle-intro',
    destination: '/docs/how-arbitrum-works/deep-dives/stf',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/state-transition-function/stf-inputs',
    destination: '/docs/how-arbitrum-works/reference/stf-inputs',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/state-transition-function/stylus-execution-path',
    destination: '/docs/how-arbitrum-works/deep-dives/arbos#stylus-specific-differences',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/timeboost',
    destination: '/docs/how-arbitrum-works/timeboost',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/timeboost/gentle-introduction',
    destination: '/docs/how-arbitrum-works/timeboost/gentle-introduction',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/timeboost/how-to-use-timeboost',
    destination: '/docs/how-arbitrum-works/timeboost/how-to-use-timeboost',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/timeboost/timeboost-faq',
    destination: '/docs/how-arbitrum-works/timeboost/timeboost-faq',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/timeboost/troubleshoot-timeboost',
    destination: '/docs/how-arbitrum-works/timeboost/troubleshoot-timeboost',
    permanent: true,
  },
  {
    source: '/how-arbitrum-works/token-bridging/eth-bridging',
    destination: '/docs/arbitrum-essentials/bridging/deposit/eth-and-messages',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/transaction-lifecycle',
    destination: '/docs/how-arbitrum-works/deep-dives/transaction-lifecycle',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/tx-lifecycle',
    destination: '/docs/how-arbitrum-works/deep-dives/transaction-lifecycle',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/validation-and-proving/proving-and-challenges',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/validation-and-proving/rollup-protocol',
    destination: '/docs/how-arbitrum-works/inside-arbitrum-nitro',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/validation-and-proving/validation-and-proving',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/how-arbitrum-works/why-nitro',
    destination: '/docs/how-arbitrum-works/inside-arbitrum-nitro',
    permanent: false,
  },
  {
    source: '/inside_arbitrum',
    destination: '/docs/how-arbitrum-works/inside-arbitrum-nitro',
    permanent: false,
  },
  {
    source: '/inside-anytrust',
    destination: '/docs/how-arbitrum-works/deep-dives/anytrust-protocol',
    permanent: false,
  },
  {
    source: '/inside-arbitrum-nitro',
    destination: '/docs/how-arbitrum-works/inside-arbitrum-nitro',
    permanent: false,
  },
  {
    source: '/installation',
    destination: '/docs/run-a-node/run-full-node',
    permanent: false,
  },
  {
    source: '/intro',
    destination: '/docs/get-started/arbitrum-introduction',
    permanent: false,
  },
  {
    source: '/intro/glossary',
    destination: '/docs/glossary',
    permanent: true,
  },
  {
    source: '/l1_l2_messages',
    destination: '/docs/how-arbitrum-works/deep-dives/l1-to-l2-messaging',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/a-gentle-introduction',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/aep-license',
    destination: '/docs/launch-arbitrum-chain/overview/license',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/arbitrum-chain-quickstart',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/arbitrum-chain-sdk-introduction',
    destination: '/docs/launch-arbitrum-chain/quickstart/sdk-introduction',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/arbitrum-node-runners/enale-post-4blobs',
    destination: '/docs/launch-arbitrum-chain/chain-config/batch-poster/enable-4844-blobs',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/arbitrum-node-runners/high-availability-sequencer-docs',
    destination: '/docs/launch-arbitrum-chain/run-a-node/high-availability-sequencer',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/arbitrum-node-runners/run-batch-poster',
    destination: '/docs/launch-arbitrum-chain/run-a-node/batch-poster',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/arbitrum-node-runners/run-split-validator-node',
    destination: '/docs/launch-arbitrum-chain/run-a-node/split-validator-node',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/bold-adoption-for-arbitrum-chains',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/validation/bold',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/additional-configuration-parameters',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/additional-configuration-parameters',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/batch-poster/config-batch-poster',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/validation/assertion-control',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/batch-poster/enable-4844-blobs',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/batch-poster/enable-4844-blobs',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/batch-poster/fee-tuning',
    destination: '/docs/launch-arbitrum-chain/chain-config/batch-poster/fee-tuning',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/chainConfig-reference',
    destination: '/docs/launch-arbitrum-chain/configuration/chain-config-reference',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/core/arbos',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/arbos',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/core/da-api-guide',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/da-api-guide',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/core/precompiles',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/precompiles',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/core/stf',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/stf',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/aep-overview',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/aep-overview',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/aep-router-contracts',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/aep-router-contracts',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/calculate-aep-fees',
    destination: 'https://docs.arbitrum.foundation/calculate-aep-fees',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/configure-native-mint-burn',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/costs/configure-native-mint-burn',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/custom-gas-token-anytrust',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-anytrust',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/dynamic-pricing',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/costs/dynamic-pricing',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/fee-management',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/fee-management',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/gas-optimization',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/gas-optimization',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/gas-target',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/gas-target',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/parent-chain-data-fee-pricing',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/parent-chain-data-fee-pricing',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/priority-fees',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/priority-fees',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/reporting-on-fees',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/reporting-on-fees',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/costs/revenue-routing',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/revenue-routing',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/data-availability/config-data-availability',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/config-data-availability',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/data-availability/configure-dac',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/configure-dac',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/data-availability/dac-configuration-defaults',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/dac-configuration-defaults',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/data-availability/dac-das-operations',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/dac-das-operations',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/data-availability/dac-get-started',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/dac-get-started',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/data-availability/das-docker-deployment',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/das-docker-deployment',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/data-availability/das-rpc-method-reference',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/das-rpc-method-reference',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/data-availability/deploy-das',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/deploy-das',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/data-availability/deploy-mirror-das',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/deploy-mirror-das',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/execution/smart-contract-size-limit',
    destination: '/docs/launch-arbitrum-chain/chain-config/execution/smart-contract-size-limit',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/sequencer/chain-finality',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/chain-finality',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/sequencer/compliance-filtering',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/compliance-filtering',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/sequencer/pga',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/pga',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/sequencer/sequencer-config-reference',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/sequencer-config-reference',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/sequencer/sequencer-timing-adjustments',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/sequencer/sequencer-timing-adjustments',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/sequencer/timeboost',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/sequencer/timeboost',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/validation/assertion-control',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/validation/assertion-control',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/validation/bold',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/validation/bold',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/validation/bond-and-validator',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/validation/bond-and-validator',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/validation/chain-finality',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/chain-finality',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/validation/challenge-period',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/validation/challenge-period',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/validation/compliance-filtering',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/compliance-filtering',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/validation/fast-withdrawals',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/fast-withdrawals',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-config/validation/test-chain-configuration',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/test-chain-configuration',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/chain-configuration/sequencer/sequencer-timing-adjustments',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/sequencer-timing-adjustments',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/concepts/custom-gas-token-sdk',
    destination: '/docs/arbitrum-essentials/bridging/custom-gas-token-chains',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/concepts/public-preview-expectations',
    destination: '/docs/launch-arbitrum-chain/overview/public-preview',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/advanced-configurations/aep-fee-router/aep-fee-router-introduction',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/aep-overview',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/advanced-configurations/aep-fee-router/calculate-aep-fees',
    destination: 'https://docs.arbitrum.foundation/calculate-aep-fees',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/advanced-configurations/aep-fee-router/reporting-on-fees',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/reporting-on-fees',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/advanced-configurations/aep-fee-router/set-up-aep-fee-router',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/aep-router-contracts',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/advanced-configurations/bold',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/bold',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/advanced-configurations/bold-adoption-for-arbitrum-chains',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/fast-withdrawals',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/advanced-configurations/configure-aep-fee-routing/aep-fee-router-introduction',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/aep-overview',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/advanced-configurations/configure-aep-fee-routing/calculate-aep-fees',
    destination: 'https://docs.arbitrum.foundation/calculate-aep-fees',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/advanced-configurations/configure-aep-fee-routing/reporting-on-fees',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/reporting-on-fees',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/advanced-configurations/configure-aep-fee-routing/set-up-aep-fee-router',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/aep-router-contracts',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/advanced-configurations/da-api-integration-guide',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/da-api-guide',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/advanced-configurations/fast-withdrawals',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/fast-withdrawals',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/advanced-configurations/layer-leap',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/advanced/compliance-filtering',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/compliance-filtering',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/advanced/config-sequencer-timing-adjustments',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/sequencer-timing-adjustments',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/advanced/da-api-integration-guide',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/da-api-guide',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common-configurations/arbitrum-chain-finality',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/chain-finality',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/common-configurations/arbos-upgrade',
    destination: '/docs/launch-arbitrum-chain/operate/arbos-upgrade',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common-configurations/batch-posting-assertion-control',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/assertion-control',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common-configurations/bold-adoption-for-arbitrum-chains',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/bold',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common-configurations/customizable-challenge-period',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/challenge-period',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common-configurations/enable-post-4844-blobs',
    destination: '/docs/launch-arbitrum-chain/chain-config/batch-poster/enable-4844-blobs',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/common-configurations/fee-management',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/fee-management',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common-configurations/gas-optimization-tools',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/gas-optimization',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common-configurations/stake-and-validator-configurations',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/bond-and-validator',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common-configurations/timeboost-for-arbitrum-chains',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/timeboost',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common-configurations/use-a-custom-gas-token-anytrust',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-anytrust',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common-configurations/use-a-custom-gas-token-rollup',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/additional-configuration-parameters',
    destination: '/docs/launch-arbitrum-chain/chain-config/additional-configuration-parameters',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/aep-fees/aep-fee-router-introduction',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/aep-overview',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/common/aep-fees/calculate-aep-fees',
    destination: 'https://docs.arbitrum.foundation/calculate-aep-fees',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/common/aep-fees/reporting-on-fees',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/reporting-on-fees',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/common/aep-fees/set-up-aep-fee-router',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/aep-router-contracts',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/data-availability/config-data-availability',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/config-data-availability',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/configure-dac',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/configure-dac',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/dac-configuration-defaults',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/dac-configuration-defaults',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/dac-das-operations',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/dac-das-operations',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/das-rpc-method-reference',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/das-rpc-method-reference',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/deploy-das',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/deploy-das',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/deploy-mirror-das',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/deploy-mirror-das',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/data-availability/data-availability-committees/get-started',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/dac-get-started',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/common/fees/fee-management',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/fee-management',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/gas/configure-native-mint-burn-gas-token',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/configure-native-mint-burn',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/gas/dynamic-pricing-for-arbitrum-chains',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/dynamic-pricing',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/common/gas/gas-optimization-tools',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/gas-optimization',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/gas/use-a-custom-gas-token-anytrust',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-anytrust',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/common/gas/use-a-custom-gas-token-rollup',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/common/mev/timeboost-for-arbitrum-chains',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/timeboost',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/configure-your-chain/common/ux/fast-withdrawals',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/fast-withdrawals',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/validation-and-security/arbitrum-chain-finality',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/chain-finality',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/validation-and-security/arbos-upgrade',
    destination: '/docs/launch-arbitrum-chain/operate/arbos-upgrade',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/validation-and-security/batch-poster-fee-tuning',
    destination: '/docs/launch-arbitrum-chain/chain-config/batch-poster/fee-tuning',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/validation-and-security/batch-posting-assertion-control',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/assertion-control',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/validation-and-security/bold-adoption-for-arbitrum-chains',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/bold',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/validation-and-security/config-smart-contract-size-limit',
    destination: '/docs/launch-arbitrum-chain/chain-config/execution/smart-contract-size-limit',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/validation-and-security/customizable-challenge-period',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/challenge-period',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/validation-and-security/enable-post-4844-blobs',
    destination: '/docs/launch-arbitrum-chain/chain-config/batch-poster/enable-4844-blobs',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/configure-your-chain/common/validation-and-security/stake-and-validator-configurations',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/bond-and-validator',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/customize-your-chain/customize-arbos',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/arbos',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/customize-your-chain/customize-precompile',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/precompiles',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/customize-your-chain/customize-stf',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/stf',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/canonical-factory-contracts',
    destination: '/docs/launch-arbitrum-chain/deploy/canonical-factory-contracts',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/customize-deployment-configuration',
    destination: '/docs/launch-arbitrum-chain/deploy/deploy-chain',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/deploy-your-first-rollup',
    destination: '/docs/launch-arbitrum-chain/quickstart/l3-rollup-from-scratch',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/deploying-an-arbitrum-chain',
    destination: '/docs/launch-arbitrum-chain/deploy/deploy-chain',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/deploying-rollup-chain',
    destination: '/docs/launch-arbitrum-chain/deploy/deploy-chain',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/deploying-token-bridge',
    destination: '/docs/launch-arbitrum-chain/deploy/token-bridge',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/monitoring-tools-and-considerations',
    destination: '/docs/launch-arbitrum-chain/operate/monitoring',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/run-l3-rollup-from-scratch',
    destination: '/docs/launch-arbitrum-chain/quickstart/l3-rollup-from-scratch',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/deploy-an-arbitrum-chain/run-l3-rollup-testnet-infrastructure',
    destination: '/docs/launch-arbitrum-chain/quickstart/l3-rollup-testnet',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/deploy-an-arbitrum-chain/run-testnet-infrastructure-first-rollup',
    destination: '/docs/launch-arbitrum-chain/quickstart/l3-rollup-testnet',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/deploy/canonical-factory-contracts',
    destination: '/docs/launch-arbitrum-chain/deploy/canonical-factory-contracts',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/deploy/configure-node',
    destination: '/docs/launch-arbitrum-chain/deploy/configure-node',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/deploy/custom-genesis-state',
    destination: '/docs/launch-arbitrum-chain/deploy/custom-genesis-state',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/deploy/deploy-chain',
    destination: '/docs/launch-arbitrum-chain/deploy/deploy-chain',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/deploy/token-bridge',
    destination: '/docs/launch-arbitrum-chain/deploy/token-bridge',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/deploy/token-bridge-troubleshooting',
    destination: '/docs/launch-arbitrum-chain/deploy/token-bridge-troubleshooting',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/ecosystem-support/add-arbitrum-chain-to-bridge-ui',
    destination: '/docs/launch-arbitrum-chain/integrations/bridge-ui',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/extend-the-protocol/arbos',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/arbos',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/extend-the-protocol/da-api-guide',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/da-api-guide',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/extend-the-protocol/precompiles',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/precompiles',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/extend-the-protocol/stf',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/stf',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/faq-troubleshooting/troubleshooting-building-arbitrum-chain',
    destination: '/docs/launch-arbitrum-chain/overview/faq',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/advanced/choose-arbos-version',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/arbos',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/advanced/choose-custom-behavior',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/stf',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/advanced/choose-custom-delay-inbox-finality',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/chain-finality',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/advanced/precompiles',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/precompiles',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/advanced/sequencer-timing-adjustments',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/sequencer/sequencer-timing-adjustments',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/common/configure-aep/configure-aep-fees',
    destination: 'https://docs.arbitrum.foundation/calculate-aep-fees',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/common/configure-aep/configure-aep/fees',
    destination: 'https://docs.arbitrum.foundation/calculate-aep-fees',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/common/data-availability/choose-alt-da',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/config-data-availability',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/common/data-availability/choose-anytrust',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/config-data-availability',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/common/data-availability/choose-rollup',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/data-availability/config-data-availability',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/common/gas-and-fees/choose-custom-gas-token',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/common/gas-and-fees/choose-fee-rebates',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/fee-management',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/common/gas-and-fees/choose-native-eth',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/common/gas-and-fees/choose-native-mint-burn',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/costs/configure-native-mint-burn',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/common/mev/choose-timeboostburn',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/timeboost',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/common/ux/choose-fast-withdrawals',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/fast-withdrawals',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/features/common/validation-and-security/choose-bold',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/validation/bold',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/features/common/validation-and-security/choose-challenge-period',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/validation/challenge-period',
    permanent: false,
  },
  {
    source:
      '/launch-arbitrum-chain/features/common/validation-and-security/choose-permissioned-validators',
    destination:
      '/docs/launch-arbitrum-chain/chain-config/validation/bond-and-validator',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/how-tos/arbitrum-chain-finality',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/chain-finality',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/how-tos/arbitrum-chain-sdk-preparing-node-config',
    destination: '/docs/launch-arbitrum-chain/deploy/configure-node',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/how-tos/customize-deployment-configuration',
    destination: '/docs/launch-arbitrum-chain/deploy/deploy-chain',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/integrations/bp-kms-signing-services',
    destination: '/docs/launch-arbitrum-chain/integrations/bp-kms-signing-services',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/integrations/bridge-ui',
    destination: '/docs/launch-arbitrum-chain/integrations/bridge-ui',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/integrations/bridged-usdc',
    destination: '/docs/launch-arbitrum-chain/integrations/bridged-usdc',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/integrations/exchange-integration-checklist',
    destination: '/docs/launch-arbitrum-chain/integrations/exchange-integration-checklist',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/integrations/infrastructure-providers',
    destination: '/docs/launch-arbitrum-chain/integrations/infrastructure-providers',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/maintain-your-chain/guidance/batch-poster-troubleshooting',
    destination: '/docs/launch-arbitrum-chain/operate/batch-poster-troubleshooting',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/maintain-your-chain/guidance/key-rotation',
    destination: '/docs/launch-arbitrum-chain/operate/key-rotation',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/maintain-your-chain/guidance/post-launch-contract-deployments',
    destination: '/docs/launch-arbitrum-chain/operate/post-launch-deployments',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/maintain-your-chain/guidance/state-growth',
    destination: '/docs/launch-arbitrum-chain/operate/state-growth',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/maintain-your-chain/guidance/state-size-limit',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/gas-target',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/maintain-your-chain/monitoring-tools-and-considerations',
    destination: '/docs/launch-arbitrum-chain/operate/monitoring',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/maintain-your-chain/ownership-structure-access-control',
    destination: '/docs/launch-arbitrum-chain/operate/ownership-and-access',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/maintain-your-chain/upgrade-to-bold',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/bold',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/migrate-between-raases',
    destination: '/docs/launch-arbitrum-chain/migrate/between-raases',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/migrate-from-another-stack',
    destination: '/docs/launch-arbitrum-chain/migrate/from-another-stack',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/migrate/between-raases',
    destination: '/docs/launch-arbitrum-chain/migrate/between-raases',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/migrate/from-another-stack',
    destination: '/docs/launch-arbitrum-chain/migrate/from-another-stack',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/operate/arbos-upgrade',
    destination: '/docs/launch-arbitrum-chain/operate/arbos-upgrade',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/operate/batch-poster-troubleshooting',
    destination: '/docs/launch-arbitrum-chain/operate/batch-poster-troubleshooting',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/operate/bold-upgrade-playbook',
    destination: '/docs/launch-arbitrum-chain/operate/bold-upgrade-playbook',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/operate/bp-recovery',
    destination: '/docs/launch-arbitrum-chain/operate/bp-recovery',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/operate/error-index',
    destination: '/docs/launch-arbitrum-chain/operate/error-index',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/operate/gas-target',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/gas-target',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/operate/key-rotation',
    destination: '/docs/launch-arbitrum-chain/operate/key-rotation',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/operate/monitoring',
    destination: '/docs/launch-arbitrum-chain/operate/monitoring',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/operate/ownership-and-access',
    destination: '/docs/launch-arbitrum-chain/operate/ownership-and-access',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/operate/post-launch-deployments',
    destination: '/docs/launch-arbitrum-chain/operate/post-launch-deployments',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/operate/sequencer-troubleshooting',
    destination: '/docs/launch-arbitrum-chain/operate/sequencer-troubleshooting',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/operate/state-growth',
    destination: '/docs/launch-arbitrum-chain/operate/state-growth',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/operate/upgrade-runbook',
    destination: '/docs/launch-arbitrum-chain/operate/upgrade-runbook',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/operate/validator-troubleshooting',
    destination: '/docs/launch-arbitrum-chain/operate/validator-troubleshooting',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/overview/faq',
    destination: '/docs/launch-arbitrum-chain/overview/faq',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/overview/introduction',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/overview/license',
    destination: '/docs/launch-arbitrum-chain/overview/license',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/overview/public-preview',
    destination: '/docs/launch-arbitrum-chain/overview/public-preview',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/protocol-hacks/arbos',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/arbos',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/protocol-hacks/da-api-guide',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/da-api-guide',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/protocol-hacks/precompiles',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/precompiles',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/protocol-hacks/stf',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/stf',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/quickstart/l3-rollup-from-scratch',
    destination: '/docs/launch-arbitrum-chain/quickstart/l3-rollup-from-scratch',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/quickstart/l3-rollup-testnet',
    destination: '/docs/launch-arbitrum-chain/quickstart/l3-rollup-testnet',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/quickstart/sdk-introduction',
    destination: '/docs/launch-arbitrum-chain/quickstart/sdk-introduction',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/reference/additional-configuration-parameters',
    destination: '/docs/launch-arbitrum-chain/chain-config/additional-configuration-parameters',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/reference/arbitrum-chain-configuration-parameters',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/run-a-node/batch-poster',
    destination: '/docs/launch-arbitrum-chain/run-a-node/batch-poster',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/run-a-node/high-availability-sequencer',
    destination: '/docs/launch-arbitrum-chain/run-a-node/high-availability-sequencer',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/run-a-node/run-full-node-with-helm',
    destination: '/docs/launch-arbitrum-chain/run-a-node/run-full-node-with-helm',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/run-a-node/split-validator-node',
    destination: '/docs/launch-arbitrum-chain/run-a-node/split-validator-node',
    permanent: true,
  },
  {
    source: '/launch-arbitrum-chain/third-party-integrations/bridged-usdc-standard',
    destination: '/docs/launch-arbitrum-chain/integrations/bridged-usdc',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/third-party-integrations/third-party-providers',
    destination: '/docs/launch-arbitrum-chain/integrations/infrastructure-providers',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/timeboost-for-arbitrum-chains',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/timeboost',
    permanent: false,
  },
  {
    source: '/launch-arbitrum-chain/what-is-arbitrum-orbit',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/a-gentle-introduction',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/aep-fee-router-introduction',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/aep-overview',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/aep-license',
    destination: '/docs/launch-arbitrum-chain/overview/license',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/aeplicense',
    destination: '/docs/launch-arbitrum-chain/overview/license',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/bold-adoption-for-orbit-chains',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/bold',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/concepts/chain-ownership',
    destination: '/docs/launch-arbitrum-chain/operate/ownership-and-access',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/concepts/custom-gas-token-sdk',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/concepts/public-preview-expectations',
    destination: '/docs/launch-arbitrum-chain/overview/public-preview',
    permanent: false,
  },
  {
    source:
      '/launch-orbit-chain/configure-your-chain/advanced-configurations/aep-fee-router/aep-fee-router-introduction',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/aep-overview',
    permanent: false,
  },
  {
    source:
      '/launch-orbit-chain/configure-your-chain/advanced-configurations/aep-fee-router/calculate-aep-fees',
    destination: 'https://docs.arbitrum.foundation/calculate-aep-fees',
    permanent: false,
  },
  {
    source:
      '/launch-orbit-chain/configure-your-chain/advanced-configurations/aep-fee-router/set-up-aep-fee-router',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/aep-router-contracts',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/configure-your-chain/advanced-configurations/bold',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/bold',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/configure-your-chain/advanced-configurations/fast-withdrawals',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/fast-withdrawals',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/configure-your-chain/advanced-configurations/layer-leap',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/configure-your-chain/common-configurations/arbos-configuration',
    destination: '/docs/launch-arbitrum-chain/operate/arbos-upgrade',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/configure-your-chain/common-configurations/arbos-upgrade',
    destination: '/docs/launch-arbitrum-chain/operate/arbos-upgrade',
    permanent: false,
  },
  {
    source:
      '/launch-orbit-chain/configure-your-chain/common-configurations/batch-posting-assertion-control',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/assertion-control',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/configure-your-chain/common-configurations/calculate-aep-fees',
    destination: 'https://docs.arbitrum.foundation/calculate-aep-fees',
    permanent: false,
  },
  {
    source:
      '/launch-orbit-chain/configure-your-chain/common-configurations/customizable-challenge-period',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/challenge-period',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/configure-your-chain/common-configurations/customizing-anytrust',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-anytrust',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/configure-your-chain/common-configurations/fee-management',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/fee-management',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/configure-your-chain/common-configurations/gas-optimization-tools',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/gas-optimization',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/configure-your-chain/common-configurations/per-batch-gas-cost',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/fee-management',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/configure-your-chain/common-configurations/set-up-aep-fee-router',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/aep-router-contracts',
    permanent: false,
  },
  {
    source:
      '/launch-orbit-chain/configure-your-chain/common-configurations/stake-and-validator-configurations',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/bond-and-validator',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/configure-your-chain/common-configurations/use-a-custom-gas-token',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
    permanent: false,
  },
  {
    source:
      '/launch-orbit-chain/configure-your-chain/common-configurations/use-a-custom-gas-token-anytrust',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-anytrust',
    permanent: false,
  },
  {
    source:
      '/launch-orbit-chain/configure-your-chain/common-configurations/use-a-custom-gas-token-rollup',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/customize-your-chain/customize-arbos',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/arbos',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/customize-your-chain/customize-precompile',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/precompiles',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/customize-your-chain/customize-stf',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/stf',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/deploy-an-orbit-chain/canonical-factory-contracts',
    destination: '/docs/launch-arbitrum-chain/deploy/canonical-factory-contracts',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/deploy-an-orbit-chain/configuring-orbit-chain',
    destination: '/docs/launch-arbitrum-chain/deploy/deploy-chain',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/deploy-an-orbit-chain/deploying-anytrust-chain',
    destination: '/docs/launch-arbitrum-chain/deploy/deploy-chain',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/deploy-an-orbit-chain/deploying-custom-gas-token-chain',
    destination: '/docs/launch-arbitrum-chain/deploy/deploy-chain',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/deploy-an-orbit-chain/deploying-rollup-chain',
    destination: '/docs/launch-arbitrum-chain/deploy/deploy-chain',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/deploy-an-orbit-chain/deploying-token-bridge',
    destination: '/docs/launch-arbitrum-chain/deploy/token-bridge',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/deploy-an-orbit-chain/monitoring-tools-and-considerations',
    destination: '/docs/launch-arbitrum-chain/operate/monitoring',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/ecosystem-support/add-orbit-chain-to-bridge-ui',
    destination: '/docs/launch-arbitrum-chain/integrations/bridge-ui',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/ecosystem-support/get-listed-orbit-platforms',
    destination: '/docs/chain-info',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/ecosystem-support/orbit-portal',
    destination: '/docs/chain-info',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/faq-troubleshooting/troubleshooting-building-orbit',
    destination: '/docs/launch-arbitrum-chain/overview/faq',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/add-orbit-chain-to-bridge-ui',
    destination: '/docs/launch-arbitrum-chain/integrations/bridge-ui',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/arbos-upgrade',
    destination: '/docs/launch-arbitrum-chain/operate/arbos-upgrade',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/calculate-aep-fees',
    destination: 'https://docs.arbitrum.foundation/calculate-aep-fees',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/customize-arbos',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/arbos',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/customize-deployment-configuration',
    destination: '/docs/launch-arbitrum-chain/deploy/deploy-chain',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/customize-precompile',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/precompiles',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/customize-stf',
    destination: '/docs/launch-arbitrum-chain/extend-the-protocol/stf',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/fast-withdrawals',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/fast-withdrawals',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/how-to-configure-your-chain',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/manage-fee-collectors',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/fee-management',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/orbit-chain-finality',
    destination: '/docs/launch-arbitrum-chain/chain-config/sequencer/chain-finality',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/orbit-managing-gas-speed-limit',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/gas-target',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/orbit-managing-state-growth',
    destination: '/docs/launch-arbitrum-chain/operate/state-growth',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/orbit-sdk-configuring-orbit-chain',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/orbit-sdk-deploying-anytrust-chain',
    destination: '/docs/launch-arbitrum-chain/deploy/deploy-chain',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/orbit-sdk-deploying-custom-gas-token-chain',
    destination: '/docs/launch-arbitrum-chain/deploy/deploy-chain',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/orbit-sdk-deploying-rollup-chain',
    destination: '/docs/launch-arbitrum-chain/deploy/deploy-chain',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/orbit-sdk-deploying-token-bridge',
    destination: '/docs/launch-arbitrum-chain/deploy/token-bridge',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/orbit-sdk-preparing-node-config',
    destination: '/docs/launch-arbitrum-chain/deploy/configure-node',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/set-up-aep-fee-router',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/aep-router-contracts',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/usdc-standard-bridge',
    destination: '/docs/launch-arbitrum-chain/integrations/bridged-usdc',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/how-tos/use-a-custom-gas-token',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/custom-gas-token-rollup',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/infra-options-orbit-chains',
    destination: '/docs/launch-arbitrum-chain/integrations/infrastructure-providers',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/maintain-your-chain/bridging',
    destination: '/docs/launch-arbitrum-chain/integrations/bridge-ui',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/maintain-your-chain/guidance/post-launch-contract-deployments',
    destination: '/docs/launch-arbitrum-chain/operate/post-launch-deployments',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/maintain-your-chain/guidance/state-growth',
    destination: '/docs/launch-arbitrum-chain/operate/state-growth',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/maintain-your-chain/guidance/state-size-limit',
    destination: '/docs/launch-arbitrum-chain/chain-config/costs/gas-target',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/maintain-your-chain/monitoring',
    destination: '/docs/launch-arbitrum-chain/operate/monitoring',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/maintain-your-chain/ownership-structure-access-control',
    destination: '/docs/launch-arbitrum-chain/operate/ownership-and-access',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/maintain-your-chain/upgrade-to-bold',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/bold',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/orbit-gentle-introduction',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/orbit-license',
    destination: '/docs/launch-arbitrum-chain/overview/license',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/orbit-node-runners/orbit-node-providers',
    destination: '/docs/chain-info',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/orbit-quickstart',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/orbit-sdk-introduction',
    destination: '/docs/launch-arbitrum-chain/quickstart/sdk-introduction',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/orbit-supported-parent-chains',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/reference/additional-configuration-parameters',
    destination: '/docs/launch-arbitrum-chain/chain-config/additional-configuration-parameters',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/reference/command-line-options',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/reference/how-tos/orbit-managing-state-growth',
    destination: '/docs/launch-arbitrum-chain/operate/state-growth',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/reference/monitoring-tools-and-considerations',
    destination: '/docs/launch-arbitrum-chain/operate/monitoring',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/reference/orbit-batch-poster-configuration',
    destination: '/docs/launch-arbitrum-chain/chain-config/validation/assertion-control',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/reference/orbit-configuration-parameters',
    destination: '/docs/launch-arbitrum-chain/chain-config/additional-configuration-parameters',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/start-your-journey',
    destination: '/docs/launch-arbitrum-chain/overview/introduction',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/third-party-integrations/bridged-usdc-standard',
    destination: '/docs/launch-arbitrum-chain/integrations/bridged-usdc',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/third-party-integrations/integrations',
    destination: '/docs/launch-arbitrum-chain/integrations/infrastructure-providers',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/third-party-integrations/third-party-providers',
    destination: '/docs/launch-arbitrum-chain/integrations/infrastructure-providers',
    permanent: false,
  },
  {
    source: '/launch-orbit-chain/troubleshooting-building-orbit',
    destination: '/docs/launch-arbitrum-chain/overview/faq',
    permanent: false,
  },
  {
    source: '/learn-more',
    destination: '/docs/get-started/faq',
    permanent: false,
  },
  {
    source: '/learn-more/contribute',
    destination: '/docs/contribute',
    permanent: false,
  },
  {
    source: '/learn-more/faq',
    destination: '/docs/get-started/faq',
    permanent: true,
  },
  {
    source: '/learnmore/faq',
    destination: '/docs/get-started/faq',
    permanent: false,
  },
  {
    source: '/mainnet',
    destination: '/docs/arbitrum-essentials/reference/mainnet-risks',
    permanent: false,
  },
  {
    source: '/mainnet-beta',
    destination: '/docs/arbitrum-essentials/reference/mainnet-risks',
    permanent: false,
  },
  {
    source: '/mainnet-risks',
    destination: '/docs/arbitrum-essentials/reference/mainnet-risks',
    permanent: false,
  },
  {
    source: '/migration/dapp-migration',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/comparison-overview',
    permanent: false,
  },
  {
    source: '/migration/state-migration',
    destination: '/docs/run-a-node/nitro/migrate-state-and-history-from-classic',
    permanent: false,
  },
  {
    source: '/node_providers',
    destination: '/docs/arbitrum-essentials/reference/node-providers',
    permanent: false,
  },
  {
    source: '/node-running/build-nitro-locally',
    destination: '/docs/run-a-node/nitro/build-nitro-locally',
    permanent: false,
  },
  {
    source: '/node-running/command-line-options',
    destination: '/docs/run-a-node/run-full-node',
    permanent: false,
  },
  {
    source: '/node-running/faq',
    destination: '/docs/run-a-node/faq',
    permanent: true,
  },
  {
    source: '/node-running/gentle-introduction-run-node',
    destination: '/docs/run-a-node/overview',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/build-nitro-locally',
    destination: '/docs/run-a-node/nitro/build-nitro-locally',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/data-availability-committee/configure-the-dac-in-your-chain',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/configure-dac',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/data-availability-committee/deploy-a-das',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/deploy-das',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/data-availability-committee/deploy-a-mirror-das',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/deploy-mirror-das',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/data-availability-committee/get-started',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/dac-get-started',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/data-availability-committee/introduction',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/dac-get-started',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/local-dev-node',
    destination: '/docs/run-a-node/run-local-full-chain-simulation',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/migrate-state-and-history-from-classic',
    destination: '/docs/run-a-node/nitro/migrate-state-and-history-from-classic',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/read-sequencer-feed',
    destination: '/docs/run-a-node/sequencer/read-sequencer-feed',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/running-a-classic-node',
    destination: '/docs/run-a-node/more-types/run-classic-node',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/running-a-daserver',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/dac-get-started',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/running-a-feed-relay',
    destination: '/docs/run-a-node/run-feed-relay',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/running-a-full-node',
    destination: '/docs/run-a-node/run-full-node',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/running-a-node',
    destination: '/docs/run-a-node/run-full-node',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/running-a-sequencer-coordinator-manager',
    destination: '/docs/run-a-node/sequencer/run-sequencer-coordination-manager',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/running-a-validator',
    destination: '/docs/run-a-node/more-types/run-validator-node',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/running-an-archive-node',
    destination: '/docs/run-a-node/more-types/run-archive-node',
    permanent: false,
  },
  {
    source: '/node-running/how-tos/running-an-orbit-node',
    destination: '/docs/run-a-node/run-full-node',
    permanent: false,
  },
  {
    source: '/node-running/local-dev-node',
    destination: '/docs/run-a-node/run-local-full-chain-simulation',
    permanent: false,
  },
  {
    source: '/node-running/node-providers',
    destination: '/docs/arbitrum-essentials/reference/node-providers',
    permanent: false,
  },
  {
    source: '/node-running/quickstart-running-a-node',
    destination: '/docs/run-a-node/overview',
    permanent: false,
  },
  {
    source: '/node-running/read-sequencer-feed',
    destination: '/docs/run-a-node/sequencer/read-sequencer-feed',
    permanent: false,
  },
  {
    source: '/node-running/reference/arbos-software-releases/arbos11',
    destination: '/docs/run-a-node/arbos-releases/arbos11',
    permanent: false,
  },
  {
    source: '/node-running/reference/arbos-software-releases/arbos20',
    destination: '/docs/run-a-node/arbos-releases/arbos20',
    permanent: false,
  },
  {
    source: '/node-running/reference/arbos-software-releases/overview',
    destination: '/docs/run-a-node/arbos-releases/overview',
    permanent: false,
  },
  {
    source: '/node-running/reference/ethereum-beacon-rpc-providers',
    destination: '/docs/run-a-node/l1-ethereum-beacon-chain-rpc-providers',
    permanent: false,
  },
  {
    source: '/node-running/reference/software-releases',
    destination: '/docs/run-a-node/arbos-releases/overview',
    permanent: false,
  },
  {
    source: '/node-running/running-a-classic-node',
    destination: '/docs/run-a-node/more-types/run-classic-node',
    permanent: false,
  },
  {
    source: '/node-running/running-a-feed-relay',
    destination: '/docs/run-a-node/run-feed-relay',
    permanent: false,
  },
  {
    source: '/node-running/running-a-node',
    destination: '/docs/run-a-node/run-full-node',
    permanent: false,
  },
  {
    source: '/node-running/running-a-validator',
    destination: '/docs/run-a-node/more-types/run-validator-node',
    permanent: false,
  },
  {
    source: '/node-running/running-an-archive-node',
    destination: '/docs/run-a-node/more-types/run-archive-node',
    permanent: false,
  },
  // Section landing: upstream's "Sequencer" navigation page was never ported. Retarget when it is.
  {
    source: '/node-running/sequencer-content-map',
    destination: '/docs/run-a-node',
    permanent: true,
  },
  {
    source: '/node-running/troubleshooting-running-nodes',
    destination: '/docs/run-a-node/troubleshooting',
    permanent: false,
  },
  {
    source: '/notices/arbos-50',
    destination: '/docs/notices/arbos51-upgrade-notice',
    permanent: false,
  },
  {
    source: '/notices/arbos-fusaka',
    destination: '/docs/notices/fusaka-upgrade-notice',
    permanent: false,
  },
  {
    source: '/notices/arbos51-arbsepolia-upgrade-notice',
    destination: '/docs/notices/arbos51-upgrade-notice',
    permanent: false,
  },
  {
    source: '/notices/arbos51-upgrade-notice',
    destination: '/docs/notices/arbos51-upgrade-notice',
    permanent: true,
  },
  {
    source: '/notices/arbos61-upgrade-notice',
    destination: '/docs/notices/arbos61-upgrade-notice',
    permanent: true,
  },
  {
    source: '/notices/fusaka-upgrade-notice',
    destination: '/docs/notices/fusaka-upgrade-notice',
    permanent: true,
  },
  {
    source: '/precompiles',
    destination: '/docs/arbitrum-essentials/precompiles/reference',
    permanent: false,
  },
  {
    source: '/proving/challenge-manager',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/proving/osp-assumptions',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/proving/wasm-to-wavm',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/proving/wavm-custom-opcodes',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/proving/wavm-floats',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/proving/wavm-modules',
    destination: '/docs/how-arbitrum-works/bold/gentle-introduction',
    permanent: false,
  },
  {
    source: '/public_chains',
    destination: '/docs/arbitrum-essentials/public-chains',
    permanent: false,
  },
  {
    source: '/public_nitro_devnet',
    destination: '/docs/arbitrum-essentials/public-chains',
    permanent: false,
  },
  {
    source: '/public_nitro_testnet',
    destination: '/docs/arbitrum-essentials/public-chains',
    permanent: false,
  },
  {
    source: '/public_testnet',
    destination: '/docs/arbitrum-essentials/public-chains',
    permanent: false,
  },
  {
    source: '/public-chains',
    destination: '/docs/arbitrum-essentials/public-chains',
    permanent: false,
  },
  {
    source: '/quickstart',
    destination: '/docs/build-decentralized-apps/quickstart-solidity-remix',
    permanent: false,
  },
  {
    source: '/rollup_basics',
    destination: '/docs/get-started/arbitrum-introduction',
    permanent: false,
  },
  {
    source: '/rollup_protocol',
    destination: '/docs/how-arbitrum-works/inside-arbitrum-nitro',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/arbos-releases/arbos11',
    destination: '/docs/run-a-node/arbos-releases/arbos11',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/arbos-releases/arbos20',
    destination: '/docs/run-a-node/arbos-releases/arbos20',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/arbos-releases/arbos30',
    destination: '/docs/run-a-node/arbos-releases/arbos32',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/arbos-releases/arbos31',
    destination: '/docs/run-a-node/arbos-releases/arbos32',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/arbos-releases/arbos32',
    destination: '/docs/run-a-node/arbos-releases/arbos32',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/arbos-releases/arbos40',
    destination: '/docs/run-a-node/arbos-releases/arbos40',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/arbos-releases/arbos50',
    destination: '/docs/run-a-node/arbos-releases/arbos51',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/arbos-releases/arbos51',
    destination: '/docs/run-a-node/arbos-releases/arbos51',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/arbos-releases/arbos61',
    destination: '/docs/run-a-node/arbos-releases/arbos61',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/arbos-releases/overview',
    destination: '/docs/run-a-node/arbos-releases/overview',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/assign-node-roles',
    destination: '/docs/run-a-node/assign-node-roles',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/beacon-nodes-historical-blobs',
    destination: '/docs/run-a-node/beacon-nodes-historical-blobs',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/data-availability',
    destination: '/docs/run-a-node/data-availability',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/data-availability-committees/configure-dac',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/configure-dac',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/data-availability-committees/deploy-das',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/deploy-das',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/data-availability-committees/deploy-mirror-das',
    destination: '/docs/launch-arbitrum-chain/chain-config/data-availability/deploy-mirror-das',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/how-to-use-timeboost',
    destination: '/docs/how-arbitrum-works/timeboost/how-to-use-timeboost',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/l1-ethereum-beacon-chain-rpc-providers',
    destination: '/docs/run-a-node/l1-ethereum-beacon-chain-rpc-providers',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/more-types/run-archive-node',
    destination: '/docs/run-a-node/more-types/run-archive-node',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/more-types/run-classic-node',
    destination: '/docs/run-a-node/more-types/run-classic-node',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/more-types/run-split-validator-node',
    destination: '/docs/launch-arbitrum-chain/run-a-node/split-validator-node',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/more-types/run-validator-node',
    destination: '/docs/run-a-node/more-types/run-validator-node',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/more-types/split-validator-node',
    destination: '/docs/launch-arbitrum-chain/run-a-node/split-validator-node',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/nitro-support-policy',
    destination: '/docs/run-a-node/nitro-support-policy',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/nitro/build-nitro-locally',
    destination: '/docs/run-a-node/nitro/build-nitro-locally',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/nitro/cli-flags-reference',
    destination: '/docs/run-a-node/nitro/cli-flags-reference',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/nitro/configuration-system',
    destination: '/docs/run-a-node/nitro/configuration-system',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/nitro/da-tools-reference',
    destination: '/docs/run-a-node/nitro/da-tools-reference',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/nitro/docker-and-cli-binaries',
    destination: '/docs/run-a-node/nitro/docker-and-cli-binaries',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/nitro/how-to-convert-databases-from-leveldb-to-pebble',
    destination: '/docs/run-a-node/nitro/how-to-convert-databases-from-leveldb-to-pebble',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/nitro/migrate-state-and-history-from-classic',
    destination: '/docs/run-a-node/nitro/migrate-state-and-history-from-classic',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/nitro/nitro-database-snapshots',
    destination: '/docs/run-a-node/nitro/nitro-database-snapshots',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/nitro/node-tuning-and-monitoring',
    destination: '/docs/run-a-node/nitro/node-tuning-and-monitoring',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/node-types',
    destination: '/docs/run-a-node/overview',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/overview',
    destination: '/docs/run-a-node/overview',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/quickstart',
    destination: '/docs/run-a-node/overview',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/run-feed-relay',
    destination: '/docs/run-a-node/run-feed-relay',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/run-full-node',
    destination: '/docs/run-a-node/run-full-node',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/run-local-dev-node',
    destination: '/docs/run-a-node/run-local-full-chain-simulation',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/run-local-full-chain-simulation',
    destination: '/docs/run-a-node/run-local-full-chain-simulation',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/run-nitro-dev-node',
    destination: '/docs/run-a-node/run-nitro-dev-node',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/sequencer/high-availability-sequencer-docs',
    destination: '/docs/launch-arbitrum-chain/run-a-node/high-availability-sequencer',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/sequencer/read-sequencer-feed',
    destination: '/docs/run-a-node/sequencer/read-sequencer-feed',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/sequencer/run-feed-relay',
    destination: '/docs/run-a-node/run-feed-relay',
    permanent: false,
  },
  {
    source: '/run-arbitrum-node/sequencer/run-sequencer-coordination-manager',
    destination: '/docs/run-a-node/sequencer/run-sequencer-coordination-manager',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/sequencer/run-sequencer-node',
    destination: '/docs/run-a-node/sequencer/run-sequencer-node',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/start-here',
    destination: '/docs/run-a-node/start-here',
    permanent: true,
  },
  {
    source: '/run-arbitrum-node/troubleshooting',
    destination: '/docs/run-a-node/troubleshooting',
    permanent: true,
  },
  {
    source: '/running_goerli_nitro_node',
    destination: '/docs/run-a-node/run-full-node',
    permanent: false,
  },
  {
    source: '/running_nitro_node',
    destination: '/docs/run-a-node/run-full-node',
    permanent: false,
  },
  {
    source: '/running_node',
    destination: '/docs/run-a-node/run-full-node',
    permanent: false,
  },
  {
    source: '/running_rinkeby_nitro_node',
    destination: '/docs/run-a-node/run-full-node',
    permanent: false,
  },
  {
    source: '/security_considerations',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/comparison-overview',
    permanent: false,
  },
  {
    source: '/sequencer',
    destination: '/docs/how-arbitrum-works/deep-dives/sequencer',
    permanent: false,
  },
  {
    source: '/solidity_support',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/solidity-support',
    permanent: false,
  },
  {
    source: '/solidity-support',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/solidity-support',
    permanent: false,
  },
  {
    source: '/special_features',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/comparison-overview',
    permanent: false,
  },
  {
    source: '/stylus',
    destination: '/docs/stylus',
    permanent: false,
  },
  {
    source: '/stylus-by-example/abi_decode',
    destination:
      'https://github.com/OffchainLabs/stylus-by-example/tree/master/example_code/basic_examples/abi_decode',
    permanent: false,
  },
  {
    source: '/stylus-by-example/abi_encode',
    destination:
      'https://github.com/OffchainLabs/stylus-by-example/tree/master/example_code/basic_examples/abi_encode',
    permanent: false,
  },
  {
    source: '/stylus-by-example/applications/erc20',
    destination: '/docs/stylus/stylus-by-example/applications/erc20',
    permanent: true,
  },
  {
    source: '/stylus-by-example/applications/erc721',
    destination: '/docs/stylus/stylus-by-example/applications/erc721',
    permanent: true,
  },
  {
    source: '/stylus-by-example/applications/multi_call',
    destination: '/docs/stylus/stylus-by-example/applications/multi_call',
    permanent: true,
  },
  {
    source: '/stylus-by-example/applications/vending_machine',
    destination: '/docs/stylus/stylus-by-example/applications/vending_machine',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/abi_decode',
    destination: '/docs/stylus/stylus-by-example/basic_examples/abi_decode',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/abi_encode',
    destination: '/docs/stylus/stylus-by-example/basic_examples/abi_encode',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/bytes_in_bytes_out',
    destination: '/docs/stylus/stylus-by-example/basic_examples/bytes_in_bytes_out',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/constants',
    destination: '/docs/stylus/stylus-by-example/basic_examples/constants',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/errors',
    destination: '/docs/stylus/stylus-by-example/basic_examples/errors',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/events',
    destination: '/docs/stylus/stylus-by-example/basic_examples/events',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/function',
    destination: '/docs/stylus/stylus-by-example/basic_examples/function',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/function_selector',
    destination: '/docs/stylus/stylus-by-example/basic_examples/function_selector',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/hashing',
    destination: '/docs/stylus/stylus-by-example/basic_examples/hashing',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/hello_world',
    destination: '/docs/stylus/stylus-by-example/basic_examples/hello_world',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/inheritance',
    destination: '/docs/stylus/stylus-by-example/basic_examples/inheritance',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/primitive_data_types',
    destination: '/docs/stylus/stylus-by-example/basic_examples/primitive_data_types',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/sending_ether',
    destination: '/docs/stylus/stylus-by-example/basic_examples/sending_ether',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/variables',
    destination: '/docs/stylus/stylus-by-example/basic_examples/variables',
    permanent: true,
  },
  {
    source: '/stylus-by-example/basic_examples/vm_affordances',
    destination: '/docs/stylus/stylus-by-example/basic_examples/vm_affordances',
    permanent: true,
  },
  {
    source: '/stylus-by-example/bytes_in_bytes_out',
    destination:
      'https://github.com/OffchainLabs/stylus-by-example/tree/master/example_code/applications',
    permanent: false,
  },
  {
    source: '/stylus-by-example/errors',
    destination:
      'https://github.com/OffchainLabs/stylus-by-example/tree/master/example_code/basic_examples/errors',
    permanent: false,
  },
  {
    source: '/stylus-by-example/events',
    destination:
      'https://github.com/OffchainLabs/stylus-by-example/tree/master/example_code/basic_examples/events',
    permanent: false,
  },
  {
    source: '/stylus-by-example/function',
    destination:
      'https://github.com/OffchainLabs/stylus-by-example/tree/master/example_code/basic_examples/function',
    permanent: false,
  },
  {
    source: '/stylus-by-example/function_selector',
    destination:
      'https://github.com/OffchainLabs/stylus-by-example/tree/master/example_code/applications',
    permanent: false,
  },
  {
    source: '/stylus-by-example/hashing',
    destination:
      'https://github.com/OffchainLabs/stylus-by-example/tree/master/example_code/applications',
    permanent: false,
  },
  {
    source: '/stylus-by-example/hello_world',
    destination:
      'https://github.com/OffchainLabs/stylus-by-example/tree/master/example_code/basic_examples/hello_world',
    permanent: false,
  },
  {
    source: '/stylus-by-example/inheritance',
    destination:
      'https://github.com/OffchainLabs/stylus-by-example/tree/master/example_code/applications',
    permanent: false,
  },
  {
    source: '/stylus-by-example/primitive_data_types',
    destination:
      'https://github.com/OffchainLabs/stylus-by-example/tree/master/example_code/basic_examples/primitive_data_types',
    permanent: false,
  },
  {
    source: '/stylus-by-example/sending_ether',
    destination:
      'https://github.com/OffchainLabs/stylus-by-example/tree/master/example_code/basic_examples/sending_ether',
    permanent: false,
  },
  {
    source: '/stylus-by-example/variables',
    destination:
      'https://github.com/OffchainLabs/stylus-by-example/tree/master/example_code/basic_examples/variables',
    permanent: false,
  },
  {
    source: '/stylus/advanced/hostio-exports',
    destination: '/docs/stylus/advanced/hostio-exports',
    permanent: true,
  },
  {
    source: '/stylus/advanced/minimal-entrypoint-contracts',
    destination: '/docs/stylus/advanced/minimal-entrypoint-contracts',
    permanent: true,
  },
  {
    source: '/stylus/advanced/recommended-libraries',
    destination: '/docs/stylus/advanced/recommended-libraries',
    permanent: true,
  },
  {
    source: '/stylus/advanced/rust-to-solidity-differences',
    destination: '/docs/stylus/advanced/rust-to-solidity-differences',
    permanent: true,
  },
  {
    source: '/stylus/best-practices/gas-optimization',
    destination: '/docs/stylus/best-practices/gas-optimization',
    permanent: true,
  },
  {
    source: '/stylus/best-practices/security',
    destination: '/docs/stylus/best-practices/security',
    permanent: true,
  },
  {
    source: '/stylus/cli-tools/check-and-deploy',
    destination: '/docs/stylus/cli-tools/check-and-deploy',
    permanent: true,
  },
  {
    source: '/stylus/cli-tools/commands-reference',
    destination: '/docs/stylus/cli-tools/commands-reference',
    permanent: true,
  },
  {
    source: '/stylus/cli-tools/debugging-tx',
    destination: '/docs/stylus/cli-tools/debugging-tx',
    permanent: true,
  },
  {
    source: '/stylus/cli-tools/overview',
    destination: '/docs/stylus/cli-tools/overview',
    permanent: true,
  },
  {
    source: '/stylus/cli-tools/verify-contracts',
    destination: '/docs/stylus/cli-tools/verify-contracts',
    permanent: true,
  },
  {
    source: '/stylus/concepts/activation',
    destination: '/docs/stylus/concepts/activation',
    permanent: true,
  },
  {
    source: '/stylus/concepts/gas-metering',
    destination: '/docs/stylus/concepts/gas-metering',
    permanent: true,
  },
  {
    source: '/stylus/concepts/public-preview-expectations',
    destination: '/docs/stylus/gentle-introduction',
    permanent: false,
  },
  {
    source: '/stylus/concepts/stylus-cache-manager',
    destination: '/docs/stylus/how-tos/caching-contracts',
    permanent: false,
  },
  {
    source: '/stylus/concepts/stylus-gas',
    destination: '/docs/stylus/concepts/gas-metering',
    permanent: false,
  },
  {
    source: '/stylus/concepts/vm-differences',
    destination: '/docs/stylus/concepts/vm-differences',
    permanent: true,
  },
  {
    source: '/stylus/concepts/webassembly',
    destination: '/docs/stylus/concepts/webassembly',
    permanent: true,
  },
  {
    source: '/stylus/fundamentals/choose-your-path',
    destination: '/docs/stylus/fundamentals/choose-your-path',
    permanent: true,
  },
  {
    source: '/stylus/fundamentals/contracts',
    destination: '/docs/stylus/fundamentals/contracts',
    permanent: true,
  },
  {
    source: '/stylus/fundamentals/data-types/compound-types',
    destination: '/docs/stylus/fundamentals/data-types/compound-types',
    permanent: true,
  },
  {
    source: '/stylus/fundamentals/data-types/conversions-between-types',
    destination: '/docs/stylus/fundamentals/data-types/conversions-between-types',
    permanent: true,
  },
  {
    source: '/stylus/fundamentals/data-types/primitives',
    destination: '/docs/stylus/fundamentals/data-types/primitives',
    permanent: true,
  },
  {
    source: '/stylus/fundamentals/data-types/storage',
    destination: '/docs/stylus/fundamentals/data-types/storage',
    permanent: true,
  },
  {
    source: '/stylus/fundamentals/global-variables-and-functions',
    destination: '/docs/stylus/fundamentals/global-variables-and-functions',
    permanent: true,
  },
  {
    source: '/stylus/fundamentals/prerequisites',
    destination: '/docs/stylus/fundamentals/prerequisites',
    permanent: true,
  },
  {
    source: '/stylus/fundamentals/project-structure',
    destination: '/docs/stylus/fundamentals/project-structure',
    permanent: true,
  },
  {
    source: '/stylus/fundamentals/testing-contracts',
    destination: '/docs/stylus/fundamentals/testing-contracts',
    permanent: true,
  },
  {
    source: '/stylus/gentle-introduction',
    destination: '/docs/stylus/gentle-introduction',
    permanent: true,
  },
  {
    source: '/stylus/how-tos/adding-support-for-new-languages',
    destination: '/docs/stylus/how-tos/deploying-non-rust-wasm-contracts',
    permanent: false,
  },
  {
    source: '/stylus/how-tos/cache-contracts',
    destination: '/docs/stylus/how-tos/caching-contracts',
    permanent: false,
  },
  {
    source: '/stylus/how-tos/caching-contracts',
    destination: '/docs/stylus/how-tos/caching-contracts',
    permanent: true,
  },
  {
    source: '/stylus/how-tos/debug-stylus-transactions',
    destination: '/docs/stylus/cli-tools/debugging-tx',
    permanent: false,
  },
  {
    source: '/stylus/how-tos/debugging-stylus-tx',
    destination: '/docs/stylus/cli-tools/debugging-tx',
    permanent: false,
  },
  {
    source: '/stylus/how-tos/deploying-non-rust-wasm-contracts',
    destination: '/docs/stylus/how-tos/deploying-non-rust-wasm-contracts',
    permanent: true,
  },
  {
    source: '/stylus/how-tos/exporting-abi',
    destination: '/docs/stylus/how-tos/exporting-abi',
    permanent: true,
  },
  {
    source: '/stylus/how-tos/importing-interfaces',
    destination: '/docs/stylus/how-tos/importing-interfaces',
    permanent: true,
  },
  {
    source: '/stylus/how-tos/local-stylus-dev-node',
    destination: '/docs/run-a-node/run-nitro-dev-node',
    permanent: false,
  },
  {
    source: '/stylus/how-tos/optimizing-binaries',
    destination: '/docs/stylus/how-tos/optimizing-binaries',
    permanent: true,
  },
  {
    source: '/stylus/how-tos/trait-based-composition',
    destination: '/docs/stylus/how-tos/trait-based-composition',
    permanent: true,
  },
  {
    source: '/stylus/how-tos/using-constructors',
    destination: '/docs/stylus/how-tos/using-constructors',
    permanent: true,
  },
  {
    source: '/stylus/how-tos/using-stylus-cli',
    destination: '/docs/stylus/cli-tools/overview',
    permanent: false,
  },
  {
    source: '/stylus/how-tos/verify-contracts',
    destination: '/docs/stylus/cli-tools/verify-contracts',
    permanent: false,
  },
  {
    source: '/stylus/how-tos/verifying-contracts-arbiscan',
    destination: '/docs/stylus/how-tos/verifying-contracts-arbiscan',
    permanent: true,
  },
  {
    source: '/stylus/quickstart',
    destination: '/docs/stylus/quickstart',
    permanent: true,
  },
  {
    source: '/stylus/reference/cargo-stylus',
    destination: '/docs/stylus/gentle-introduction',
    permanent: false,
  },
  {
    source: '/stylus/reference/opcode-hostio-pricing',
    destination: '/docs/stylus/reference/opcode-hostio-pricing',
    permanent: true,
  },
  {
    source: '/stylus/reference/overview',
    destination: '/docs/stylus/reference/overview',
    permanent: true,
  },
  {
    source: '/stylus/reference/rust-sdk-guide',
    destination: '/docs/stylus/reference/rust-sdk-guide',
    permanent: true,
  },
  {
    source: '/stylus/reference/stylus-toml-reference',
    destination: '/docs/stylus/reference/stylus-toml-reference',
    permanent: true,
  },
  {
    source: '/stylus/reference/testnet-information',
    destination: '/docs/stylus',
    permanent: false,
  },
  {
    source: '/stylus/rust-sdk-guide',
    destination: '/docs/stylus/reference/rust-sdk-guide',
    permanent: false,
  },
  {
    source: '/stylus/stylus-gentle-introduction',
    destination: '/docs/stylus/gentle-introduction',
    permanent: false,
  },
  {
    source: '/stylus/stylus-quickstart',
    destination: '/docs/stylus/quickstart',
    permanent: false,
  },
  {
    source: '/stylus/tools/stylus-cli',
    destination: '/docs/stylus/cli-tools/overview',
    permanent: false,
  },
  {
    source: '/stylus/tools/using-stylus-cli',
    destination: '/docs/stylus/cli-tools/overview',
    permanent: false,
  },
  {
    source: '/stylus/troubleshooting-building-stylus',
    destination: '/docs/stylus/troubleshooting-building-stylus',
    permanent: true,
  },
  {
    source: '/stylus/troubleshooting/common-issues',
    destination: '/docs/stylus/troubleshooting/common-issues',
    permanent: true,
  },
  {
    source: '/stylus/using-cli',
    destination: '/docs/stylus/cli-tools/overview',
    permanent: false,
  },
  {
    source: '/time',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/block-numbers-and-time',
    permanent: false,
  },
  {
    source: '/time_in_arbitrum',
    destination: '/docs/arbitrum-essentials/arbitrum-vs-ethereum/block-numbers-and-time',
    permanent: false,
  },
  {
    source: '/tutorials',
    destination: '/docs/build-decentralized-apps/quickstart-solidity-remix',
    permanent: false,
  },
  {
    source: '/tx_lifecycle',
    destination: '/docs/how-arbitrum-works/deep-dives/transaction-lifecycle',
    permanent: false,
  },
  {
    source: '/tx-lifecycle',
    destination: '/docs/how-arbitrum-works/deep-dives/transaction-lifecycle',
    permanent: false,
  },
  {
    source: '/txlifecycle',
    destination: '/docs/how-arbitrum-works/deep-dives/transaction-lifecycle',
    permanent: false,
  },
  {
    source: '/useful_addresses',
    destination: '/docs/arbitrum-essentials/reference/contract-addresses',
    permanent: false,
  },
  {
    source: '/useful-addresses',
    destination: '/docs/arbitrum-essentials/reference/contract-addresses',
    permanent: false,
  },
  {
    source: '/welcome',
    destination: '/docs/get-started',
    permanent: false,
  },
  {
    source: '/welcome/arbitrum-gentle-introduction',
    destination: '/docs/get-started/arbitrum-introduction',
    permanent: false,
  },
  {
    source: '/welcome/get-started',
    destination: '/docs/get-started',
    permanent: true,
  },
  {
    source: '/why-nitro',
    destination: '/docs/how-arbitrum-works/inside-arbitrum-nitro',
    permanent: false,
  },
  {
    source: '/withdrawals',
    destination: '/docs/how-arbitrum-works/deep-dives/transaction-lifecycle',
    permanent: false,
  },
];
