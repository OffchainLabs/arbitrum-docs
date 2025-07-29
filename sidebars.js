// @ts-check

// Use the generated SDK sidebar for API reference
const sdkApiSidebar = require('./sdk-sidebar.js');
// Use the generated stylus-by-example sidebars
const stylusByExampleBasicExamples = require('./docs/stylus-by-example/basic_examples/sidebar.js');
const stylusByExampleApplications = require('./docs/stylus-by-example/applications/sidebar.js');

// Create a custom SDK sidebar that combines manual intro pages with generated API docs
const sdkSidebar = {
  sdkSidebar: [
    {
      type: 'doc',
      id: 'sdk/index',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'sdk/migrate',
      label: 'Migrate from v3 to v4',
    },
    ...sdkApiSidebar.sdkSidebar,
  ],
};

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
        {
          type: 'doc',
          id: 'for-devs/dev-tools-and-resources/chain-info',
          label: 'Chain info',
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
          id: 'build-decentralized-apps/quickstart-solidity-remix',
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
          type: 'doc',
          id: 'build-decentralized-apps/custom-gas-token-sdk',
          label: 'Custom gas token SDK',
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
          type: 'doc',
          label: 'Oracles',
          id: 'build-decentralized-apps/oracles/overview-oracles',
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
              id: 'build-decentralized-apps/reference/contract-addresses',
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
          items: sdkSidebar.sdkSidebar,
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
      label: 'Run an Arbitrum (Orbit) chain',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'launch-arbitrum-chain/a-gentle-introduction',
          label: 'A gentle introduction',
        },
        {
          type: 'doc',
          id: 'launch-arbitrum-chain/aep-license',
          label: 'Arbitrum chain licensing',
        },
        {
          type: 'category',
          label: 'Configure your chain',
          collapsed: true,
          items: [
            {
              type: 'category',
              label: 'Common features',
              collapsed: true,
              items: [
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/configure-your-chain/common-configurations/use-a-custom-gas-token-anytrust',
                  label: `Configure a custom AnyTrust gas token`,
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/configure-your-chain/common-configurations/use-a-custom-gas-token-rollup',
                  label: `Configure a custom Rollup gas token`,
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/configure-your-chain/common-configurations/customizable-challenge-period',
                  label: 'Customize the challenge period',
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/configure-your-chain/common-configurations/fee-management',
                  label: `Manage the fee parameters`,
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/configure-your-chain/common-configurations/enable-post-4844-blobs',
                  label: `Enable blob transactions`,
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
                    {
                      type: 'doc',
                      id: 'run-arbitrum-node/data-availability-committees/configure-dac',
                      label: 'Configure a Data Availability Committee (DAC)',
                    },
                  ],
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/how-tos/customize-deployment-configuration',
                  label: `Customize your chain's deployment`,
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/reference/additional-configuration-parameters',
                  label: `Additional configuration parameters`,
                },
              ],
            },
            {
              type: 'category',
              label: 'Advanced features',
              collapsed: true,
              items: [
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/configure-your-chain/advanced-configurations/fast-withdrawals',
                  label: `Enable fast withdrawals`,
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/configure-your-chain/advanced-configurations/bold',
                  label: 'BoLD configuration parameters',
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/configure-your-chain/advanced-configurations/deploy-timeboost',
                  label: 'Deploy and configure Timeboost',
                },
                {
                  type: 'doc',
                  label: 'Use Layer Leap',
                  id: 'launch-arbitrum-chain/configure-your-chain/advanced-configurations/layer-leap',
                },
                {
                  type: 'category',
                  label: 'Configure AEP fee routing',
                  collapsed: true,
                  items: [
                    {
                      type: 'doc',
                      id: 'launch-arbitrum-chain/configure-your-chain/advanced-configurations/aep-fee-router/aep-fee-router-introduction',
                      label: `AEP fee router overview`,
                    },
                    {
                      type: 'doc',
                      id: 'launch-arbitrum-chain/configure-your-chain/advanced-configurations/aep-fee-router/set-up-aep-fee-router',
                      label: `Set up AEP fee router`,
                    },
                    {
                      type: 'doc',
                      id: 'launch-arbitrum-chain/configure-your-chain/advanced-configurations/aep-fee-router/calculate-aep-fees',
                      label: `Calculate AEP license fees`,
                    },
                    {
                      type: 'doc',
                      id: 'launch-arbitrum-chain/configure-your-chain/advanced-configurations/aep-fee-router/reporting-on-fees',
                      label: `Report your fees`,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Deploy an Arbitrum chain',
          collapsed: true,
          items: [
            {
              type: 'category',
              label: 'Deploy a production chain',
              collapsed: true,
              items: [
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/arbitrum-chain-sdk-introduction',
                  label: `Overview`,
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/deploy-an-arbitrum-chain/deploying-an-arbitrum-chain',
                  label: `Deploy an Arbitrum chain`,
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/how-tos/arbitrum-chain-sdk-preparing-node-config',
                  label: `Generate the node config file`,
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/deploy-an-arbitrum-chain/deploying-token-bridge',
                  label: `Deploy a token bridge`,
                },
              ],
            },
            {
              type: 'doc',
              id: 'launch-arbitrum-chain/deploy-an-arbitrum-chain/canonical-factory-contracts',
              label: 'Canonical factory contracts',
            },
          ],
        },
        {
          type: 'category',
          label: 'Maintain your chain',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'launch-arbitrum-chain/maintain-your-chain/ownership-structure-access-control',
              label: 'Ownership structure and access control',
            },
            {
              type: 'category',
              label: 'ArbOS',
              collapsed: true,
              items: [
                {
                  type: 'html',
                  value:
                    '<a class="menu__link menu__list-item" href="/run-arbitrum-node/arbos-releases/overview">ArbOS software releases <span class="other-section-icon">↓</span></a>',
                  // q: why use an anchor html tag here?
                  // a: see note at end of file
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/configure-your-chain/common-configurations/arbos-upgrade',
                  label: `Upgrade ArbOS`,
                },
              ],
            },
            {
              type: 'category',
              label: 'Guidance',
              collapsed: true,
              items: [
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/maintain-your-chain/guidance/state-growth',
                  label: `Manage gas state growth`,
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/maintain-your-chain/guidance/state-size-limit',
                  label: `Manage gas speed limit`,
                },
                {
                  type: 'doc',
                  id: 'launch-arbitrum-chain/maintain-your-chain/guidance/post-launch-contract-deployments',
                  label: `Post-launch deployments`,
                },
              ],
            },
            {
              type: 'doc',
              id: 'launch-arbitrum-chain/maintain-your-chain/upgrade-to-bold',
              label: 'Upgrade to BoLD',
            },
            {
              type: 'doc',
              id: 'launch-arbitrum-chain/maintain-your-chain/monitoring-tools-and-considerations',
              label: 'Monitoring tools and considerations',
            },
          ],
        },
        {
          type: 'category',
          label: 'Customize your chain',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'launch-arbitrum-chain/customize-your-chain/customize-precompile',
              label: `Customize your chain's precompiles`,
            },
            {
              type: 'doc',
              id: 'launch-arbitrum-chain/customize-your-chain/customize-stf',
              label: `Customize your chain's behavior`,
            },
            {
              type: 'doc',
              id: 'launch-arbitrum-chain/customize-your-chain/customize-arbos',
              label: `Customize ArbOS version`,
            },
            {
              type: 'doc',
              id: 'launch-arbitrum-chain/how-tos/arbitrum-chain-finality',
              label: `Configure delayed inbox finality`,
            },
          ],
        },
        {
          type: 'category',
          label: 'Third-party integrations and features',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'launch-arbitrum-chain/third-party-integrations/bridged-usdc-standard',
              label: `Implement Circle bridged USDC`,
            },
            {
              type: 'doc',
              id: 'launch-arbitrum-chain/third-party-integrations/third-party-providers',
              label: 'Third-party infrastructure providers',
            },
          ],
        },
        {
          type: 'category',
          label: 'Run a node for an Arbitrum chain',
          collapsed: true,
          items: [
            {
              type: 'html',
              value:
                '<a class="menu__link menu__list-item" href="/run-arbitrum-node/run-full-node">Run a full node <span class="other-section-icon">↓</span></a>',
              // q: why use an anchor html tag here?
              // a: see note at end of file
            },
            {
              type: 'html',
              value:
                '<a class="menu__link menu__list-item" href="/run-arbitrum-node/more-types/run-validator-node">Run a validator <span class="other-section-icon">↓</span></a>',
              // q: why use an anchor html tag here?
              // a: see note at end of file
            },
            {
              type: 'html',
              value:
                '<a class="menu__link menu__list-item" href="/run-arbitrum-node/sequencer/run-sequencer-node">Run a sequencer node <span class="other-section-icon">↓</span></a>',
              // q: why use an anchor html tag here?
              // a: see note at end of file
            },
            {
              type: 'html',
              value:
                '<a class="menu__link menu__list-item" href="/run-arbitrum-node/sequencer/high-availability-sequencer-docs">Run high-availability sequencer nodes <span class="other-section-icon">↓</span></a>',
              // q: why use an anchor html tag here?
              // a: see note at end of file
            },
          ],
        },
        {
          type: 'doc',
          id: 'launch-arbitrum-chain/ecosystem-support/add-arbitrum-chain-to-bridge-ui',
          label: `Add your chain to the bridge`,
        },
        {
          type: 'doc',
          id: 'launch-arbitrum-chain/bold-adoption-for-arbitrum-chains',
          label: 'BoLD for Arbitrum chains',
        },
        {
          type: 'doc',
          id: 'launch-arbitrum-chain/timeboost-for-arbitrum-chains',
          label: 'Timeboost for Arbitrum chains',
        },

        {
          type: 'doc',
          id: 'launch-arbitrum-chain/concepts/public-preview-expectations',
          label: 'Public preview',
        },
        {
          type: 'doc',
          id: 'launch-arbitrum-chain/faq-troubleshooting/troubleshooting-building-arbitrum-chain',
          label: 'FAQ',
        },
      ],
    },
    {
      type: 'category',
      label: 'Write Stylus Contracts',
      collapsed: true,
      link: {
        type: 'doc',
        id: 'stylus/stylus-content-map',
      },
      items: [
        {
          type: 'doc',
          id: 'stylus/gentle-introduction',
          label: 'A gentle introduction',
        },
        {
          type: 'doc',
          id: 'stylus/quickstart',
          label: 'Quickstart',
        },
        {
          type: 'category',
          label: 'Rust SDK',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'stylus/reference/overview',
              label: 'Overview',
            },
            {
              type: 'doc',
              id: 'stylus/reference/project-structure',
              label: 'Structure of a Contract',
            },
            ...stylusByExampleBasicExamples,
            {
              type: 'doc',
              id: 'stylus/how-tos/using-inheritance',
              label: 'Composition and trait-based routing model',
            },
            {
              type: 'doc',
              id: 'stylus/reference/rust-sdk-guide',
              label: 'Advanced features',
            },
            {
              type: 'doc',
              id: 'stylus/recommended-libraries',
              label: 'Recommended Rust Crates',
            },
          ],
        },
        {
          type: 'category',
          label: 'Rust CLI',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'stylus/using-cli',
              label: 'Overview',
            },
            {
              type: 'doc',
              id: 'stylus/how-tos/debugging-tx',
              label: 'Debug transactions',
            },
            {
              type: 'doc',
              id: 'stylus/how-tos/testing-contracts',
              label: 'Testing contracts',
            },
            {
              type: 'doc',
              id: 'stylus/how-tos/verifying-contracts',
              label: 'Verify contracts',
            },
            {
              type: 'doc',
              id: 'stylus/how-tos/caching-contracts',
              label: 'Cache contracts',
            },
            {
              type: 'doc',
              id: 'stylus/how-tos/verifying-contracts-arbiscan',
              label: 'Verify on Arbiscan',
            },
            {
              type: 'doc',
              id: 'stylus/how-tos/optimizing-binaries',
              label: 'Optimize WASM binaries',
            },
          ],
        },
        {
          type: 'html',
          value:
            '<a class="menu__link menu__list-item" href="/run-arbitrum-node/run-nitro-dev-node">Run a local dev node<span class="other-section-icon">↑</span></a>',
        },
        {
          type: 'category',
          label: 'Concepts',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'stylus/concepts/how-it-works',
              label: 'Architecture overview',
            },
            {
              type: 'doc',
              id: 'stylus/concepts/gas-metering',
              label: 'Gas metering',
            },
          ],
        },
        {
          type: 'category',
          label: 'Examples',
          collapsed: true,
          items: [
            ...stylusByExampleApplications,
            {
              type: 'link',
              label: 'Awesome Stylus',
              href: 'https://github.com/OffchainLabs/awesome-stylus',
            },
          ],
        },
        {
          type: 'category',
          label: 'Reference',
          collapsed: true,
          items: [
            {
              type: 'html',
              value:
                '<a class="menu__link menu__list-item" href="/for-devs/dev-tools-and-resources/chain-info">Chain Info<span class="other-section-icon">↑</span></a>',
            },
            {
              type: 'doc',
              id: 'stylus/reference/opcode-hostio-pricing',
              label: 'Gas & Ink Pricing',
            },
            {
              type: 'link',
              label: 'Stylus by Example',
              href: 'https://stylus-by-example.org/',
            },
            {
              type: 'link',
              label: 'Cargo Stylus CLI GitHub',
              href: 'https://github.com/OffchainLabs/cargo-stylus',
            },
            {
              type: 'link',
              label: 'Rust SDK Crate',
              href: 'https://docs.rs/stylus-sdk/latest/stylus_sdk/index.html',
            },
            {
              type: 'link',
              label: 'Source Code Repository',
              href: 'https://github.com/OffchainLabs/stylus',
            },
          ],
        },
        {
          type: 'doc',
          id: 'stylus/how-tos/adding-support-for-new-languages',
          label: 'Using other languages',
        },
        {
          type: 'doc',
          id: 'stylus/troubleshooting-building-stylus',
          label: 'Troubleshooting',
        },
      ],
    },
    {
      type: 'category',
      label: 'Run an Arbitrum node',
      collapsed: true,
      link: {
        type: 'doc',
        id: 'node-running/node-running-content-map',
      },
      items: [
        {
          type: 'doc',
          id: 'run-arbitrum-node/overview',
          label: 'Overview',
        },
        {
          type: 'doc',
          id: 'run-arbitrum-node/run-full-node',
          label: 'Run a full node',
        },
        {
          type: 'doc',
          id: 'run-arbitrum-node/run-local-full-chain-simulation',
          label: 'Run a local full chain simulation',
        },
        {
          type: 'doc',
          id: 'run-arbitrum-node/run-nitro-dev-node',
          label: 'Run a local dev node',
        },
        {
          type: 'doc',
          id: 'run-arbitrum-node/l1-ethereum-beacon-chain-rpc-providers',
          label: 'L1 Ethereum RPC providers',
        },
        {
          type: 'html',
          value:
            '<a class="menu__link menu__list-item" href="/run-arbitrum-node/data-availability-committees/get-started">Data Availability Committees <span class="other-section-icon">↑</span></a>',
          // q: why use an anchor html tag here?
          // a: see note at end of file
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
              id: 'run-arbitrum-node/arbos-releases/arbos40',
              label: 'Callisto (ArbOS 40)',
            },
            {
              type: 'doc',
              id: 'run-arbitrum-node/arbos-releases/arbos32',
              label: 'Bianca (ArbOS 32)',
            },
            {
              type: 'doc',
              id: 'run-arbitrum-node/arbos-releases/arbos20',
              label: 'Atlas (ArbOS 20)',
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
              id: 'run-arbitrum-node/more-types/run-split-validator-node',
              label: 'Run a split validator',
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
          label: 'Sequencer',
          collapsed: true,
          link: {
            type: 'doc',
            id: 'node-running/sequencer-content-map',
          },
          items: [
            {
              type: 'doc',
              id: 'run-arbitrum-node/sequencer/run-sequencer-node',
              label: 'Run a sequencer node',
            },
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
            {
              type: 'doc',
              id: 'run-arbitrum-node/sequencer/high-availability-sequencer-docs',
              label: 'Run high availability sequencer nodes',
            },
          ],
        },
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
        {
          type: 'doc',
          id: 'run-arbitrum-node/nitro/nitro-database-snapshots',
          label: 'Database snapshots',
        },
        {
          type: 'doc',
          id: 'run-arbitrum-node/nitro/how-to-convert-databases-from-leveldb-to-pebble',
          label: 'Convert databases from LevelDB to Pebble',
        },
        ,
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
          type: 'doc',
          id: 'how-arbitrum-works/a-gentle-introduction',
          label: 'A gentle introduction',
        },
        {
          type: 'doc',
          id: 'how-arbitrum-works/transaction-lifecycle',
          label: 'Sequencing, Followed by Deterministic Execution',
        },
        {
          type: 'doc',
          id: 'how-arbitrum-works/sequencer',
          label: 'The Sequencer and Censorship Resistance',
        },
        {
          type: 'doc',
          id: 'how-arbitrum-works/l1-to-l2-messaging',
          label: 'Parent to Child chain messaging',
        },
        {
          type: 'category',
          label: 'State Transition Function',
          items: [
            {
              type: 'doc',
              label: 'STF Overview',
              id: 'how-arbitrum-works/state-transition-function/stf-gentle-intro',
            },
            {
              type: 'doc',
              label: 'STF inputs',
              id: 'how-arbitrum-works/state-transition-function/stf-inputs',
            },
            {
              type: 'doc',
              label: 'Ethereum vs Arbitrum',
              id: 'how-arbitrum-works/state-transition-function/ethereum-vs-arbitrum',
            },
            {
              type: 'doc',
              label: 'Modified Geth on Arbitrum',
              id: 'how-arbitrum-works/state-transition-function/modified-geth-on-arbitrum',
            },
            {
              type: 'doc',
              label: 'ArbOS',
              id: 'how-arbitrum-works/state-transition-function/arbos',
            },
            {
              type: 'doc',
              label: 'Stylus execution path',
              id: 'how-arbitrum-works/state-transition-function/stylus-execution-path',
            },
          ],
        },
        {
          type: 'category',
          label: 'Validation and Proving',
          items: [
            {
              type: 'doc',
              label: 'Validation and proving overview',
              id: 'how-arbitrum-works/validation-and-proving/validation-and-proving',
            },
            {
              type: 'doc',
              label: 'Rollup protocol',
              id: 'how-arbitrum-works/validation-and-proving/rollup-protocol',
            },
            {
              type: 'doc',
              label: 'Proving and challenges',
              id: 'how-arbitrum-works/validation-and-proving/proving-and-challenges',
            },
          ],
        },
        {
          type: 'doc',
          id: 'how-arbitrum-works/anytrust-protocol',
          label: 'AnyTrust protocol',
        },
        {
          type: 'doc',
          id: 'how-arbitrum-works/l2-to-l1-messaging',
          label: 'Child to parent chain messaging',
        },
        {
          type: 'doc',
          id: 'how-arbitrum-works/gas-fees',
          label: 'Gas and fees',
        },
        {
          type: 'doc',
          id: 'how-arbitrum-works/data-availability',
          label: 'Data Availability',
        },
        {
          type: 'link',
          href: 'https://github.com/OffchainLabs/nitro/blob/master/docs/Nitro-whitepaper.pdf',
          label: 'Nitro whitepaper',
        },

        {
          type: 'category',
          label: 'The BoLD dispute protocol',
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
              label: 'BoLD Whitepaper',
            },
            {
              type: 'doc',
              id: 'how-arbitrum-works/bold/bold-technical-deep-dive',
              label: 'Technical deep dive',
            },
            {
              type: 'doc',
              id: 'how-arbitrum-works/bold/bold-economics-of-disputes',
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
          ],
        },
        {
          type: 'category',
          label: 'Timeboost',
          items: [
            {
              type: 'doc',
              id: 'how-arbitrum-works/timeboost/gentle-introduction',
              label: 'Public preview',
            },
            {
              type: 'doc',
              label: 'Use Timeboost',
              id: 'how-arbitrum-works/timeboost/how-to-use-timeboost',
            },
            {
              type: 'doc',
              label: 'Troubleshoot Timeboost',
              id: 'how-arbitrum-works/timeboost/troubleshoot-timeboost',
            },
            {
              type: 'doc',
              label: 'Timeboost FAQ',
              id: 'how-arbitrum-works/timeboost/timeboost-faq',
            },
            {
              type: 'link',
              href: 'https://github.com/OffchainLabs/timeboost-design/blob/main/research_spec.md',
              label: 'Specification: Timeboost',
            },
            {
              type: 'link',
              href: 'https://github.com/OffchainLabs/decentralized-timeboost-spec',
              label: 'Specification: Timeboost with decentralized sequencing',
            },
            {
              type: 'link',
              href: 'https://arxiv.org/abs/2306.02179',
              label: 'White paper: Timeboost',
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
          type: 'category',
          label: 'Oracles',
          collapsed: true,
          link: {
            type: 'doc',
            id: 'for-devs/oracles/oracles-content-map',
          },
          items: [
            {
              type: 'doc',
              id: 'for-devs/oracles/api3/api3',
            },
            {
              type: 'doc',
              id: 'for-devs/oracles/chainlink/chainlink',
            },
            {
              type: 'doc',
              id: 'for-devs/oracles/chronicle/chronicle',
            },
            {
              type: 'doc',
              id: 'for-devs/oracles/ora/ora',
            },
            {
              type: 'doc',
              id: 'for-devs/oracles/supra/supras-price-feed',
            },
            {
              type: 'doc',
              id: 'for-devs/oracles/supra/supras-vrf',
            },
            {
              type: 'doc',
              id: 'for-devs/oracles/trellor/trellor',
            },
          ],
        },
        {
          type: 'autogenerated',
          dirName: 'for-devs/third-party-docs',
        },
        {
          type: 'doc',
          id: 'for-devs/contribute',
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
      href: 'https://www.offchainlabs.com/prysm/docs',
    },
  ],
};

module.exports = sidebars;

// note RE html sidebar links:
//    because the linked page lives in multiple sidebar sections, we pick one to be the "canonical" location for the page in the sidebar
//    if we link to them both via id or standard href, multiple sections of the sidebar will be opened at once when the user visits this page; we don't want that
//    if we use a fully qualified link, the remote/published page will display when visiting from localhost or preview deployments
//    we also want to include a unicode arrow to indicate that we're routing the user to another section, in a way that's distinct from the icon that indicates "this href pulls you out of docs"
