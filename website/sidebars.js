// @ts-check

const sdkDocsSidebar = require('../arbitrum-docs/sdk/sidebar.js');

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  buildDecentralizedAppsSidebar: [
    {
      type: 'category',
      label: 'Welcome',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'welcome/arbitrum-gentle-introduction',
          label: 'A gentle introduction',
        },
        {
          type: 'doc',
          id: 'welcome/get-started',
          label: 'Get started',
        },
      ],
    },
    {
      type: 'category',
      label: 'Build decentralized apps',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'build-decentralized-apps/quickstart-solidity-hardhat',
          label: 'Quickstart (Solidity)',
        },
        {
          type: 'doc',
          label: 'Estimate gas',
          id: 'build-decentralized-apps/how-to-estimate-gas',
        },
        {
          type: 'doc',
          label: 'Chains and testnets',
          id: 'build-decentralized-apps/public-chains',
        },
        {
          type: 'doc',
          label: 'Cross-chain messaging',
          id: 'build-decentralized-apps/cross-chain-messaging',
        },
        {
          type: 'category',
          label: 'Arbitrum vs Ethereum',
          items: [
            {
              type: 'doc',
              label: 'Comparison overview',
              id: 'build-decentralized-apps/arbitrum-vs-ethereum/comparison-overview',
            },
            {
              type: 'doc',
              label: 'Block gas limit, numbers and time',
              id: 'build-decentralized-apps/arbitrum-vs-ethereum/block-numbers-and-time',
            },
            {
              type: 'doc',
              label: 'RPC methods',
              id: 'build-decentralized-apps/arbitrum-vs-ethereum/rpc-methods',
            },
            {
              type: 'doc',
              label: 'Solidity support',
              id: 'build-decentralized-apps/arbitrum-vs-ethereum/solidity-support',
            },
          ],
        },
        {
          type: 'category',
          label: 'Oracles',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Overview',
              id: 'build-decentralized-apps/oracles/overview',
            },
            {
              type: 'doc',
              label: 'Use oracles in your app',
              id: 'build-decentralized-apps/oracles/how-to-use-oracles',
            },
            {
              type: 'doc',
              label: 'Reference',
              id: 'build-decentralized-apps/oracles/reference',
            },
          ],
        },
        {
          type: 'category',
          label: 'Precompiles',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Overview',
              id: 'build-decentralized-apps/precompiles/overview',
            },
            {
              type: 'doc',
              label: 'Reference',
              id: 'build-decentralized-apps/precompiles/reference',
            },
          ],
        },
        {
          type: 'category',
          label: 'NodeInterface',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Overview',
              id: 'build-decentralized-apps/nodeinterface/overview',
            },
            {
              type: 'doc',
              label: 'Reference',
              id: 'build-decentralized-apps/nodeinterface/reference',
            },
          ],
        },
        {
          type: 'category',
          label: 'Token bridging',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Overview',
              id: 'build-decentralized-apps/token-bridging/overview',
            },
            {
              type: 'doc',
              label: 'ETH bridging',
              id: 'build-decentralized-apps/token-bridging/token-bridge-ether',
            },
            {
              type: 'doc',
              label: 'ERC-20 token bridging',
              id: 'build-decentralized-apps/token-bridging/token-bridge-erc20',
            },
            {
              type: 'category',
              label: 'Bridge tokens programmatically',
              items: [
                {
                  type: 'doc',
                  label: 'Get started',
                  id: 'build-decentralized-apps/token-bridging/bridge-tokens-programmatically/get-started',
                },
                {
                  type: 'doc',
                  label: 'Use the standard gateway',
                  id: 'build-decentralized-apps/token-bridging/bridge-tokens-programmatically/how-to-bridge-tokens-standard',
                },
                {
                  type: 'doc',
                  label: 'Use the generic-custom gateway',
                  id: 'build-decentralized-apps/token-bridging/bridge-tokens-programmatically/how-to-bridge-tokens-generic-custom',
                },
                {
                  type: 'doc',
                  label: 'Use the custom gateway',
                  id: 'build-decentralized-apps/token-bridging/bridge-tokens-programmatically/how-to-bridge-tokens-custom-gateway',
                },
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Reference',
          items: [
            {
              type: 'doc',
              id: 'build-decentralized-apps/reference/node-providers',
              label: 'RPC endpoints and providers',
            },
            {
              type: 'doc',
              label: 'Smart contract addresses',
              id: 'build-decentralized-apps/reference/useful-addresses',
            },
            {
              type: 'doc',
              label: 'Chain parameters',
              id: 'build-decentralized-apps/reference/chain-params',
            },
            {
              type: 'doc',
              label: 'Development frameworks',
              id: 'build-decentralized-apps/reference/development-frameworks',
            },
            {
              type: 'doc',
              label: 'Web3 libraries and tools',
              id: 'build-decentralized-apps/reference/web3-libraries-tools',
            },
            {
              type: 'doc',
              label: 'Monitoring tools and block explorers',
              id: 'build-decentralized-apps/reference/monitoring-tools-block-explorers',
            },
            {
              type: 'doc',
              label: 'Debugging tools',
              id: 'build-decentralized-apps/reference/debugging-tools',
            },

            {
              type: 'doc',
              id: 'build-decentralized-apps/reference/mainnet-risks',
              label: 'Mainnet risks',
            },
          ],
        },
        {
          type: 'doc',
          label: 'Troubleshooting',
          id: 'for-devs/troubleshooting-building',
        },
        {
          type: 'category',
          label: 'Arbitrum SDK',
          items: sdkDocsSidebar,
        },
        {
          type: 'link',
          label: 'Tutorials',
          href: 'https://github.com/OffchainLabs/arbitrum-tutorials',
        },
      ],
    },
    {
      type: 'category',
      label: 'Run an Orbit chain',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'launch-orbit-chain/orbit-gentle-introduction',
          label: 'A gentle introduction',
        },
        {
          type: 'doc',
          id: 'launch-orbit-chain/orbit-quickstart',
          label: 'Quickstart',
        },
        {
          type: 'category',
          label: 'Customize your chain',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'launch-orbit-chain/how-tos/customize-deployment-configuration',
              label: `Customize your chain's deployment`,
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/reference/additional-configuration-parameters',
              label: `Additional configuration parameters`,
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/how-tos/use-a-custom-gas-token',
              label: `Use a custom gas token`,
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/how-tos/customize-precompile',
              label: `Customize your chain's precompiles`,
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/how-tos/customize-stf',
              label: `Customize your chain's behavior`,
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/how-tos/orbit-chain-finality',
              label: `Configure delayed inbox finality`,
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/how-tos/manage-fee-collectors',
              label: `Manage the fee collectors`,
            },
          ],
        },
        {
          type: 'category',
          label: 'ArbOS',
          collapsed: true,
          items: [
            {
              type: 'html',
              value:
                '<a class="menu__link menu__list-item" href="/run-arbitrum-node/arbos-releases/overview">ArbOS software releases</a>',
              // q: why use an anchor html tag here?
              // a: see note at end of file
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/how-tos/arbos-upgrade',
              label: `Upgrade ArbOS`,
            },
          ],
        },
        {
          type: 'html',
          value:
            '<a class="menu__link menu__list-item" href="/run-arbitrum-node/data-availability-committees/get-started">Data Availability Committees <span class="other-section-icon">↓</span></a>',
          // q: why use an anchor html tag here?
          // a: see note at end of file
        },
        {
          type: 'html',
          value:
            '<a class="menu__link menu__list-item" href="/run-arbitrum-node/more-types/run-validator-node">Add new validators to Orbit chain <span class="other-section-icon">↓</span></a>',
          // q: why use an anchor html tag here?
          // a: see note at end of file
        },
        {
          type: 'doc',
          id: 'launch-orbit-chain/concepts/anytrust-orbit-chain-keyset-generation',
          label: 'Keyset generation (AnyTrust chains)',
        },
        {
          type: 'doc',
          id: 'launch-orbit-chain/reference/monitoring-tools-and-considerations',
          label: 'Monitoring tools and considerations',
        },
        {
          type: 'doc',
          id: 'node-running/how-tos/running-an-orbit-node',
          label: 'Run a full Orbit node',
        },
        {
          type: 'doc',
          id: 'launch-orbit-chain/how-tos/add-orbit-chain-to-bridge-ui',
          label: `Add your chain to the bridge`,
        },
        {
          type: 'doc',
          id: 'launch-orbit-chain/concepts/chain-ownership',
          label: 'Orbit chain ownership',
        },
        {
          type: 'doc',
          id: 'launch-orbit-chain/concepts/custom-gas-token-sdk',
          label: 'Custom gas token SDK',
        },
        {
          type: 'doc',
          id: 'launch-orbit-chain/concepts/public-preview-expectations',
          label: 'Public preview',
        },
        {
          type: 'doc',
          id: 'launch-orbit-chain/infra-options-orbit-chains',
          label: 'Third-party infrastructure providers',
        },
        {
          type: 'doc',
          id: 'launch-orbit-chain/troubleshooting-building-orbit',
          label: 'FAQ',
        },
        {
          type: 'category',
          label: 'Orbit SDK',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'launch-orbit-chain/orbit-sdk-introduction',
              label: `Introduction`,
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/how-tos/orbit-sdk-deploying-rollup-chain',
              label: `Rollup Orbit Deployment`,
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/how-tos/orbit-sdk-deploying-anytrust-chain',
              label: `AnyTrust Orbit Deployment`,
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/how-tos/orbit-sdk-deploying-custom-gas-token-chain',
              label: `Custom Gas Token Orbit Deployment`,
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/how-tos/orbit-sdk-preparing-node-config',
              label: `Node Config Generation`,
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/how-tos/orbit-sdk-deploying-token-bridge',
              label: `Token bridge deployment`,
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/how-tos/orbit-sdk-configuring-orbit-chain',
              label: `Orbit Chain Configuration`,
            },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Write Stylus contracts',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'stylus/stylus-gentle-introduction',
          label: 'A gentle introduction',
        },
        {
          type: 'doc',
          id: 'stylus/stylus-quickstart',
          label: 'Quickstart (Rust)',
        },
        {
          type: 'doc',
          id: 'stylus/concepts/stylus-cache-manager',
          label: 'Stylus caching strategy',
        },
        {
          type: 'html',
          value:
            '<a class="menu__link menu__list-item" href="/run-arbitrum-node/run-local-dev-node">Run a Stylus dev node<span class="other-section-icon">↑</span></a>',
          // q: why use an anchor html tag here?/node-running/how-tos/running-an-stylus-node
          // a: see note at end of file
        },
        {
          type: 'doc',
          label: 'Testnets',
          id: 'stylus/reference/testnet-information',
        },
        {
          type: 'link',
          label: 'Stylus by example',
          href: 'https://stylus-by-example.org/',
        },

        {
          type: 'category',
          label: 'Gas and ink',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Overview',
              id: 'stylus/concepts/stylus-gas',
            },
            {
              type: 'doc',
              id: 'stylus/reference/opcode-hostio-pricing',
              label: 'Gas and ink costs',
            },
          ],
        },
        {
          type: 'category',
          label: 'Stylus SDK',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'stylus/reference/rust-sdk-guide',
              label: 'Rust SDK overview',
            },
            {
              type: 'doc',
              id: 'stylus/reference/stylus-sdk',
              label: 'SDK repositories',
            },
          ],
        },
        {
          type: 'doc',
          label: 'Troubleshooting',
          id: 'stylus/troubleshooting-building-stylus',
        },

        {
          type: 'doc',
          label: 'Add a new smart contract language',
          id: 'stylus/how-tos/adding-support-for-new-languages',
        },
        {
          type: 'doc',
          label: 'Reduce the size of WASM binaries',
          id: 'stylus/how-tos/optimizing-binaries',
        },
        {
          type: 'doc',
          label: 'Debug Stylus transactions',
          id: 'stylus/how-tos/debugging-stylus-tx',
        },
        {
          type: 'doc',
          label: 'Verifying Stylus contracts',
          id: 'stylus/how-tos/verifying-contracts',
        },
        {
          type: 'link',
          label: 'Rust crate docs',
          href: 'https://docs.rs/stylus-sdk/latest/stylus_sdk/index.html',
        },
        {
          type: 'link',
          label: 'Source code repository',
          href: 'https://github.com/OffchainLabs/stylus',
        },
        {
          type: 'doc',
          label: 'Public preview',
          id: 'stylus/concepts/public-preview-expectations',
        },
      ],
    },
    {
      type: 'category',
      label: 'Run an Arbitrum node',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'run-arbitrum-node/overview',
          label: 'Overview',
        },
        {
          type: 'doc',
          id: 'run-arbitrum-node/quickstart',
          label: 'Quickstart',
        },
        {
          type: 'doc',
          id: 'run-arbitrum-node/run-full-node',
          label: 'Run a full node',
        },
        {
          type: 'doc',
          id: 'run-arbitrum-node/run-local-dev-node',
          label: 'Run a local dev node',
        },
        {
          type: 'html',
          value:
            '<a class="menu__link menu__list-item" href="/node-running/how-tos/running-an-orbit-node">Run a full Orbit node <span class="other-section-icon">↑</span></a>',
          // q: why use an anchor html tag here?
          // a: see note at end of file
        },
        {
          type: 'doc',
          id: 'run-arbitrum-node/l1-ethereum-beacon-chain-rpc-providers',
          label: 'L1 Ethereum RPC providers',
        },
        {
          type: 'category',
          label: 'ArbOS software releases',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'run-arbitrum-node/arbos-releases/overview',
              label: 'Overview',
            },
            {
              type: 'doc',
              id: 'run-arbitrum-node/arbos-releases/arbos30',
              label: 'ArbOS 30 Bianca',
            },
            {
              type: 'doc',
              id: 'run-arbitrum-node/arbos-releases/arbos20',
              label: 'ArbOS 20 Atlas',
            },
            {
              type: 'doc',
              id: 'run-arbitrum-node/arbos-releases/arbos11',
              label: 'ArbOS 11',
            },
          ],
        },
        {
          type: 'category',
          label: 'More node types',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'run-arbitrum-node/more-types/run-archive-node',
              label: 'Run an archive node',
            },
            {
              type: 'doc',
              id: 'run-arbitrum-node/more-types/run-validator-node',
              label: 'Run a validator',
            },
            {
              type: 'doc',
              id: 'run-arbitrum-node/more-types/run-classic-node',
              label: 'Run a Classic node',
            },
          ],
        },
        {
          type: 'category',
          label: 'Data Availability Committees',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'run-arbitrum-node/data-availability-committees/get-started',
              label: 'Get started',
            },
            {
              type: 'doc',
              id: 'run-arbitrum-node/data-availability-committees/deploy-das',
              label: 'Deploy a Data Availability Server (DAS)',
            },
            {
              type: 'doc',
              id: 'run-arbitrum-node/data-availability-committees/deploy-mirror-das',
              label: 'Deploy a mirror Data Availability Server',
            },
          ],
        },
        {
          type: 'category',
          label: 'Sequencer',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'run-arbitrum-node/sequencer/run-feed-relay',
              label: 'Run a feed relay',
            },
            {
              type: 'doc',
              id: 'run-arbitrum-node/sequencer/read-sequencer-feed',
              label: 'Read the sequencer feed',
            },
            {
              type: 'doc',
              id: 'run-arbitrum-node/sequencer/run-sequencer-coordination-manager',
              label: 'Run a Sequencer Coordination Manager (SQM)',
            },
          ],
        },
        {
          type: 'category',
          label: 'Nitro',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'run-arbitrum-node/nitro/build-nitro-locally',
              label: 'Build Nitro locally',
            },
            {
              type: 'doc',
              id: 'run-arbitrum-node/nitro/migrate-state-and-history-from-classic',
              label: 'Migrate to Nitro from Classic',
            },
          ],
        },
        {
          type: 'doc',
          id: 'run-arbitrum-node/troubleshooting',
          label: 'Troubleshooting',
        },
        {
          type: 'doc',
          label: 'FAQ',
          id: 'node-running/faq',
        },
      ],
    },
    {
      type: 'category',
      label: 'Arbitrum bridge',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'arbitrum-bridge/quickstart',
          label: 'Quickstart',
        },
        {
          type: 'doc',
          id: 'arbitrum-bridge/usdc-arbitrum-one',
          label: 'USDC on Arbitrum One',
        },
        {
          type: 'doc',
          id: 'arbitrum-bridge/troubleshooting',
          label: 'Troubleshooting',
        },
      ],
    },
    {
      type: 'category',
      label: 'How Arbitrum works',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Introductory concepts',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'how-arbitrum-works/why-nitro',
              label: 'Why Nitro?',
            },
            {
              type: 'doc',
              id: 'how-arbitrum-works/tx-lifecycle',
              label: 'Transaction lifecycle',
            },
            {
              type: 'doc',
              id: 'how-arbitrum-works/sequencer',
              label: 'Sequencer',
            },
            {
              type: 'doc',
              id: 'how-arbitrum-works/inside-anytrust',
              label: 'AnyTrust protocol',
            },
            {
              type: 'category',
              label: 'Gas / fees',
              items: [
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/gas-fees',
                  label: 'L2 gas and fees',
                },
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/l1-gas-pricing',
                  label: 'L1 pricing',
                },
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Advanced concepts',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'how-arbitrum-works/inside-arbitrum-nitro',
              label: 'Deep dive: Inside Arbitrum',
            },
            {
              type: 'link',
              href: 'https://github.com/OffchainLabs/nitro/blob/master/docs/Nitro-whitepaper.pdf',
              label: 'Deeper dive: Whitepaper',
            },
            {
              type: 'doc',
              id: 'how-arbitrum-works/assertion-tree',
              label: 'Assertion tree',
            },
            {
              type: 'category',
              label: 'Cross-chain messaging',
              items: [
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/arbos/l1-l2-messaging',
                  label: 'L1-to-L2 messaging',
                },
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/arbos/l2-l1-messaging',
                  label: 'L2-to-L1 messaging',
                },
              ],
            },
            {
              type: 'category',
              label: 'ArbOS',
              items: [
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/arbos/introduction',
                  label: 'ArbOS',
                },
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/arbos/geth',
                  label: 'Geth',
                },
              ],
            },
            {
              type: 'category',
              label: 'Fraud proofs',
              items: [
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/fraud-proofs/challenge-manager',
                  label: 'Interactive challenges',
                },
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/fraud-proofs/osp-assumptions',
                  label: 'One step proof assumptions',
                },
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/fraud-proofs/wasm-wavm',
                  label: 'Wasm To WAVM',
                },
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/fraud-proofs/wavm-custom-opcodes',
                  label: 'Custom WAVM opcodes',
                },
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/fraud-proofs/wavm-floats',
                  label: 'WAVM floats',
                },
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/fraud-proofs/wavm-modules',
                  label: 'WAVM modules',
                },
              ],
            },
            {
              type: 'category',
              label: 'The BOLD dispute protocol',
              items: [
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/bold/gentle-introduction',
                  label: 'A gentle introduction',
                },
                {
                  type: 'link',
                  href: 'https://github.com/offchainlabs/bold-validator-starter-kit',
                  label: 'Deploy a validator on testnet',
                },
                {
                  type: 'link',
                  href: 'https://arxiv.org/abs/2404.10491',
                  label: 'BOLD Whitepaper',
                },
                {
                  type: 'link',
                  href: 'https://github.com/OffchainLabs/bold/blob/main/docs/research-specs/TechnicalDeepDive.pdf',
                  label: 'Technical deep dive',
                },
                {
                  type: 'link',
                  href: 'https://github.com/OffchainLabs/bold/blob/main/docs/research-specs/Economics.pdf',
                  label: 'Economics of disputes',
                },
                {
                  type: 'link',
                  href: 'https://github.com/OffchainLabs/bold',
                  label: 'Specification on Github',
                },
                {
                  type: 'link',
                  href: 'https://github.com/trailofbits/publications/blob/master/reviews/2024-04-offchainbold-securityreview.pdf',
                  label: 'Audit Report by Trail of Bits',
                },
                {
                  type: 'link',
                  href: 'https://code4rena.com/reports/2024-05-arbitrum-foundation',
                  label: 'Audit Report by Code4rena',
                },
                {
                  type: 'doc',
                  id: 'how-arbitrum-works/bold/public-preview-expectations',
                  label: 'Public preview',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'doc',
      id: 'learn-more/faq',
      label: 'FAQ',
    },
    {
      type: 'doc',
      id: 'intro/glossary',
      label: 'Glossary',
    },
    {
      type: 'doc',
      id: 'for-devs/contribute',
    },
    {
      type: 'category',
      label: 'Third-party docs',
      collapsed: true,
      items: [
        {
          type: 'autogenerated',
          dirName: 'for-devs/third-party-docs',
        },
      ],
    },
    {
      type: 'doc',
      label: 'Audit reports',
      id: 'audit-reports',
    },
    {
      type: 'link',
      label: 'DAO docs',
      href: 'https://docs.arbitrum.foundation/gentle-intro-dao-governance',
    },
    {
      type: 'link',
      label: 'Prysm docs',
      href: 'https://docs.prylabs.network/docs/install/install-with-script',
    },
  ],
};

module.exports = sidebars;

// note RE html sidebar links:
//    because the linked page lives in multiple sidebar sections, we pick one to be the "canonical" location for the page in the sidebar
//    if we link to them both via id or standard href, multiple sections of the sidebar will be opened at once when the user visits this page; we don't want that
//    if we use a fully qualified link, the remote/published page will display when visiting from localhost or preview deployments
//    we also want to include a unicode arrow to indicate that we're routing the user to another section, in a way that's distinct from the icon that indicates "this href pulls you out of docs"
