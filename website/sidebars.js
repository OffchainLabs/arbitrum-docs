// @ts-check

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
          id: 'for-devs/gentle-introduction-dapps',
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
      label: 'Run an Arbitrum node',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'node-running/gentle-introduction-run-node',
          label: 'Overview',
        },
        {
          type: 'doc',
          id: 'node-running/quickstart-running-a-node',
          label: 'Quickstart',
        },
        {
          type: 'doc',
          id: 'node-running/how-tos/running-a-daserver',
          label: 'Run a Data Availability Server (DAS)',
        },
        {
          type: 'doc',
          id: 'node-running/how-tos/running-a-full-node',
          label: 'Run a full node',
        },
        {
          type: 'doc',
          id: 'node-running/how-tos/running-a-classic-node',
          label: 'Run a Classic node',
        },
        {
          type: 'doc',
          id: 'node-running/how-tos/running-an-archive-node',
          label: 'Run an archive node',
        },
        {
          type: 'doc',
          id: 'node-running/how-tos/running-a-validator',
          label: 'Run a validator',
        },

        {
          type: 'doc',
          id: 'node-running/how-tos/local-dev-node',
          label: 'Run a local dev node',
        },
        {
          type: 'category',
          label: 'Sequencers',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'node-running/how-tos/running-a-feed-relay',
              label: 'Run a feed relay',
            },
            {
              type: 'doc',
              id: 'node-running/how-tos/read-sequencer-feed',
              label: 'Read the sequencer feed',
            },
            {
              type: 'doc',
              id: 'node-running/how-tos/running-a-sequencer-coordinator-manager',
              label: 'Run a sequencer coordination manager',
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
              id: 'node-running/how-tos/build-nitro-locally',
              label: 'Build Nitro locally',
            },
            {
              type: 'doc',
              id: 'node-running/how-tos/migrate-state-and-history-from-classic',
              label: 'Migrate to Nitro from Classic',
            },
          ],
        },
        {
          type: 'doc',
          id: 'node-running/troubleshooting-running-nodes',
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
          id: 'getting-started-users',
          label: 'Quickstart',
        },
        {
          type: 'doc',
          label: 'Troubleshooting',
          id: 'for-users/troubleshooting-users',
        },
        {
          type: 'doc',
          id: 'bridge-tokens/concepts/usdc-concept',
          label: 'USDC on Arbitrum One',
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
          id: 'for-devs/quickstart-solidity-hardhat',
          label: 'Quickstart (Solidity)',
        },
        {
          type: 'html',
          value:
            '<a class="menu__link" href="/node-running/how-tos/local-dev-node">Run a local dev node</a>',
          // q: why use an anchor html tag here?
          // a: we don't want multiple sections of the sidebar to be opened at once when the user visits this page
          //    because this page lives in both the "build dapps" and "run nodes" sections, we pick one to be the "canonical" location for the page in the sidebar
        },
        {
          type: 'category',
          label: 'Arbitrum vs Ethereum',
          items: [
            {
              type: 'doc',
              label: 'Comparison overview',
              id: 'for-devs/concepts/differences-between-arbitrum-ethereum/overview',
            },
            {
              type: 'doc',
              label: 'Block numbers and time',
              id: 'for-devs/concepts/differences-between-arbitrum-ethereum/block-numbers-and-time',
            },
            {
              type: 'doc',
              label: 'RPC methods',
              id: 'for-devs/concepts/differences-between-arbitrum-ethereum/rpc-methods',
            },
            {
              type: 'doc',
              label: 'Solidity support',
              id: 'for-devs/concepts/differences-between-arbitrum-ethereum/solidity-support',
            },
          ],
        },
        {
          type: 'category',
          label: 'Gas and fees',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Estimate gas',
              id: 'devs-how-tos/how-to-estimate-gas',
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
              id: 'for-devs/concepts/oracles',
            },
            {
              type: 'doc',
              label: 'Get started',
              id: 'devs-how-tos/how-to-use-oracles',
            },
            {
              type: 'doc',
              label: 'Reference',
              id: 'for-devs/dev-tools-and-resources/oracles',
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
              id: 'for-devs/concepts/precompiles',
            },
            {
              type: 'doc',
              label: 'Reference',
              id: 'for-devs/dev-tools-and-resources/precompiles',
            },
            {
              type: 'doc',
              label: 'NodeInterface',
              id: 'for-devs/concepts/nodeinterface',
            },
          ],
        },
        {
          type: 'category',
          label: 'Chains and testnets',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Overview',
              id: 'for-devs/concepts/public-chains',
            },
          ],
        },
        {
          type: 'category',
          label: 'Cross-chain messaging',
          collapsed: true,
          items: [
            {
              type: 'doc',
              label: 'Overview',
              id: 'for-devs/cross-chain-messsaging',
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
              id: 'for-devs/concepts/token-bridge/token-bridge-overview',
            },
            {
              type: 'doc',
              label: 'Get started',
              id: 'devs-how-tos/bridge-tokens/how-to-bridge-tokens-overview',
            },
            {
              type: 'doc',
              label: 'Use the standard gateway',
              id: 'devs-how-tos/bridge-tokens/how-to-bridge-tokens-standard',
            },
            {
              type: 'doc',
              label: 'Use the generic-custom gateway',
              id: 'devs-how-tos/bridge-tokens/how-to-bridge-tokens-generic-custom',
            },
            {
              type: 'doc',
              label: 'Use the custom gateway',
              id: 'devs-how-tos/bridge-tokens/how-to-bridge-tokens-custom-gateway',
            },
            {
              type: 'doc',
              label: 'Bridging Ether',
              id: 'for-devs/concepts/token-bridge/token-bridge-ether',
            },
            {
              type: 'doc',
              label: 'Bridging ERC-20 tokens',
              id: 'for-devs/concepts/token-bridge/token-bridge-erc20',
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
          label: 'Reference',
          items: [
            {
              type: 'doc',
              id: 'node-running/node-providers',
              label: 'RPC endpoints and providers',
            },
            {
              type: 'doc',
              label: 'Smart contract addresses',
              id: 'for-devs/useful-addresses',
            },
            {
              type: 'doc',
              label: 'Chain parameters',
              id: 'for-devs/chain-params',
            },
            {
              type: 'doc',
              label: 'NodeInterface',
              id: 'for-devs/dev-tools-and-resources/nodeinterface',
            },
            {
              type: 'doc',
              label: 'Development frameworks',
              id: 'for-devs/dev-tools-and-resources/development-frameworks',
            },
            {
              type: 'doc',
              label: 'Web3 libraries and tools',
              id: 'for-devs/dev-tools-and-resources/web3-libraries-tools',
            },
            {
              type: 'doc',
              label: 'Monitoring tools and block explorers',
              id: 'for-devs/dev-tools-and-resources/monitoring-tools-block-explorers',
            },
            {
              type: 'doc',
              label: 'Debugging tools',
              id: 'for-devs/dev-tools-and-resources/debugging-tools',
            },

            {
              type: 'doc',
              id: 'mainnet-risks',
              label: 'Mainnet risks',
            },
          ],
        },

        {
          type: 'link',
          label: 'Arbitrum SDK',
          href: '/sdk',
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
          label: 'Run a local dev node',
          id: 'stylus/how-tos/local-stylus-dev-node',
        },
        {
          type: 'doc',
          label: 'Testnets',
          id: 'stylus/reference/testnet-information',
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
          type: 'link',
          label: 'Rust crate docs',
          href: 'https://docs.rs/stylus-sdk/latest/stylus_sdk/index.html',
        },
        {
          type: 'link',
          label: 'Source code repository',
          href: 'https://github.com/OffchainLabs/stylus',
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
          type: 'doc',
          id: 'node-running/how-tos/running-an-orbit-node',
          label: 'Run a full Orbit node',
        },
        {
          type: 'doc',
          id: 'launch-orbit-chain/how-tos/customize-deployment-configuration',
          label: `Customize chain config`,
        },
        {
          type: 'doc',
          id: 'launch-orbit-chain/how-tos/customize-stf',
          label: `Customize chain behavior`,
        },
        {
          type: 'doc',
          id: 'launch-orbit-chain/how-tos/customize-precompile',
          label: `Customize chain precompiles`,
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
          id: 'launch-orbit-chain/troubleshooting-building-orbit',
          label: 'Troubleshooting',
        },
        {
          type: 'category',
          label: 'Reference',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'launch-orbit-chain/concepts/custom-gas-token-sdk',
              label: 'SDK support for chains with custom gas tokens',
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/reference/command-line-options',
              label: 'Command-line options',
            },
            {
              type: 'doc',
              id: 'launch-orbit-chain/concepts/public-preview-expectations',
              label: 'Orbit public preview',
            },
          ],
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
              id: 'why-nitro',
              label: 'Why Nitro?',
            },
            {
              type: 'doc',
              id: 'tx-lifecycle',
              label: 'Transaction lifecycle',
            },
            {
              type: 'doc',
              id: 'sequencer',
              label: 'Sequencer',
            },
            {
              type: 'doc',
              id: 'inside-anytrust',
              label: 'AnyTrust protocol',
            },
            {
              type: 'category',
              label: 'Gas / fees',
              items: [
                {
                  type: 'doc',
                  id: 'arbos/gas',
                  label: 'L2 gas',
                },
                {
                  type: 'doc',
                  id: 'arbos/l1-pricing',
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
              id: 'inside-arbitrum-nitro/inside-arbitrum-nitro',
              label: 'Deep dive: Inside Arbitrum',
            },
            {
              type: 'link',
              href: 'https://github.com/OffchainLabs/nitro/blob/master/docs/Nitro-whitepaper.pdf',
              label: 'Deeper dive: Whitepaper',
            },
            {
              type: 'doc',
              id: 'assertion-tree',
              label: 'Assertion tree',
            },
            {
              type: 'category',
              label: 'Cross-chain messaging',
              items: [
                {
                  type: 'doc',
                  id: 'arbos/l1-to-l2-messaging',
                  label: 'L1-to-L2 messaging',
                },
                {
                  type: 'doc',
                  id: 'arbos/l2-to-l1-messaging',
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
                  id: 'arbos/arbos',
                  label: 'ArbOS',
                },
                {
                  type: 'doc',
                  id: 'arbos/geth',
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
                  id: 'proving/challenge-manager',
                  label: 'Interactive challenges',
                },
                {
                  type: 'doc',
                  id: 'proving/osp-assumptions',
                  label: 'One step proof assumptions',
                },
                {
                  type: 'doc',
                  id: 'proving/wasm-to-wavm',
                  label: 'Wasm To WAVM',
                },
                {
                  type: 'doc',
                  id: 'proving/wavm-custom-opcodes',
                  label: 'Custom WAVM opcodes',
                },
                {
                  type: 'doc',
                  id: 'proving/wavm-floats',
                  label: 'WAVM floats',
                },
                {
                  type: 'doc',
                  id: 'proving/wavm-modules',
                  label: 'WAVM modules',
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
    /*
    {
      type: "doc",
      id: "node-running/node-providers",
      label: "Third-party node providers"
    },
    */
  ],
};

module.exports = sidebars;
