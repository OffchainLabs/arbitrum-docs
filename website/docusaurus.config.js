// @ts-nocheck
// Note: type annotations allow type checking and IDEs autocompletion

const markdownPreprocessor = require('./src/scripts/markdown-preprocessor');
const sdkSidebarGenerator = require('./src/scripts/sdk-sidebar-generator');
const sdkCodebasePath = '../arbitrum-sdk';
const path = require('path');
const remarkMath = require('remark-math');
const rehypeKatex = require('rehype-katex');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Arbitrum Docs',
  tagline: 'Arbitrum Docs',
  url: 'https://docs.arbitrum.io/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/logo.svg',
  markdown: {
    mermaid: true,
    preprocessor: markdownPreprocessor,
  },
  themes: ['@docusaurus/theme-mermaid', '@docusaurus/theme-live-codeblock'],
  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'OffchainLabs', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.
  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    // locales: ['en', 'ja', 'zh'],
    locales: ['en'],
  },
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '../arbitrum-docs',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          breadcrumbs: false,
          editUrl: function (s) {
            // troubleshooting docs content has external source-of-truth; node-providers uses form-submission
            if (s.docPath.includes('troubleshooting') || s.docPath.includes('node-providers'))
              return undefined;
            return (
              'https://github.com/OffchainLabs/arbitrum-docs/edit/master/arbitrum-docs/' + s.docPath
            );
          },
          showLastUpdateTime: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.scss'),
        },
      }),
    ],
  ],
  plugins: [
    // Modals-as-pages plugin
    [
      require.resolve('./src/components/InteractiveDiagrams/modals-as-pages-plugin'),
      {
        contentDir: [
          // Primary content directory for interactive diagrams
          'src/components/InteractiveDiagrams/content',

          // Keep the old path for backward compatibility during transition
          '../arbitrum-docs/how-arbitrum-works/timeboost/diagrams-modals',
        ],
        filePattern: '**/*.mdx',
        debug: true,
        // Custom content ID generator to support both new and legacy file naming
        contentIdGenerator: (filePath) => {
          // Legacy pattern: _partial-{diagramId}-step-{stepNumber}.mdx
          const legacyMatch = path.basename(filePath).match(/^_partial-([^-]+)-step-(\d+)\.mdx$/);
          if (legacyMatch) {
            return {
              contextId: 'diagrams',
              groupId: legacyMatch[1],
              contentId: `step-${legacyMatch[2]}`,
            };
          }

          // New pattern: diagrams/{groupId}/step-{stepNumber}.mdx
          const parts = filePath.split('/');

          if (parts.length < 3) {
            return {
              contextId: 'default',
              groupId: path.dirname(filePath).replace(/\//g, '-'),
              contentId: path.basename(filePath, '.mdx'),
            };
          }

          return {
            contextId: parts[0],
            groupId: parts[1],
            contentId: path.basename(parts[2], '.mdx'),
          };
        },
      },
    ],

    [
      'docusaurus-plugin-typedoc',
      {
        id: 'arbitrum-sdk',
        tsconfig: `${sdkCodebasePath}/tsconfig.json`,
        entryPoints: [`${sdkCodebasePath}/src/lib`],
        entryPointStrategy: 'expand',
        exclude: [`abi`, `node_modules`, `tests`, `scripts`],
        excludeNotDocumented: true,
        excludeInternal: true,
        excludeExternals: true,
        readme: 'none',

        // Output options
        out: '../arbitrum-docs/sdk/reference',
        hideGenerator: true,
        validation: {
          notExported: false,
          invalidLink: true,
          notDocumented: true,
        },
        logLevel: 'Verbose',
        sidebar: {
          autoConfiguration: false,
        },

        plugin: [
          'typedoc-plugin-markdown',
          `typedoc-plugin-frontmatter`,
          './src/scripts/sdkDocsHandler.ts',
          './src/scripts/stylusByExampleDocsHandler.ts',
        ],

        // typedoc-plugin-markdown options
        // Reference: https://github.com/tgreyuk/typedoc-plugin-markdown/blob/next/packages/typedoc-plugin-markdown/docs/usage/options.md
        outputFileStrategy: 'modules',
        excludeGroups: false,
        hidePageHeader: true,
        hidePageTitle: true,
        hideBreadcrumbs: true,
        useCodeBlocks: true,
        expandParameters: true,
        parametersFormat: 'table',
        propertiesFormat: 'table',
        enumMembersFormat: 'table',
        typeDeclarationFormat: 'table',
        sanitizeComments: true,
        frontmatterGlobals: {
          layout: 'docs',
          sidebar: true,
          toc_max_heading_level: 5,
        },
      },
    ],
    [
      'posthog-docusaurus',
      {
        apiKey: 'phc_AscFTQ876SsPAVMgxMmLn0EIpxdcRRq0XmJWnpG1SHL',
        appUrl: 'https://app.posthog.com',
        enableInDevelopment: false,
        persistence: 'memory',
        disable_session_recording: true,
      },
    ],
    require.resolve('docusaurus-plugin-fathom'),
    [
      'docusaurus-lunr-search',
      {
        excludeRoutes: [
          'launch-arbitrum-chain/02-configure-your-chain/advanced-configurations/01-layer-leap',
          'launch-arbitrum-chain/02-configure-your-chain/common-configurations/04-stake-and-validator-configurations',
          'launch-arbitrum-chain/02-configure-your-chain/common-configurations/05-arbos-configuration',
          'launch-arbitrum-chain/02-configure-your-chain/common-configurations/06-gas-optimization-tools',
          'launch-arbitrum-chain/02-configure-your-chain/common-configurations/08-batch-posting-assertion-control',
          'launch-arbitrum-chain/02-configure-your-chain/common-configurations/09-sequencer-timing-adjustments',
          'launch-arbitrum-chain/02-configure-your-chain/common-configurations/10-per-batch-gas-cost',
          'launch-arbitrum-chain/02-configure-your-chain/common-configurations/11-smart-contract-size-limit',
          'launch-arbitrum-chain/02-configure-your-chain/common-configurations/12-customizing-anytrust',
          'launch-arbitrum-chain/02-start-your-journey',
          'launch-arbitrum-chain/03-arbitrum-license',
          'launch-arbitrum-chain/04-maintain-your-chain/01-bridging',
          'launch-arbitrum-chain/04-maintain-your-chain/02-monitoring',
          'launch-arbitrum-chain/04-maintain-your-chain/04-guidance/01-decentralization-security',
          'launch-arbitrum-chain/04-maintain-your-chain/04-guidance/02-guidance-on-altda',
          'launch-arbitrum-chain/06-third-party-integrations/03-integrations',
          'launch-arbitrum-chain/07-arbitrum-node-runners/arbitrum-chain-node-providers',
          'launch-arbitrum-chain/08-ecosystem-support/01-arbitrum-chain-portal',
          'launch-arbitrum-chain/08-ecosystem-support/03-get-listed-arbitrum-chain-platforms',
          'launch-arbitrum-chain/how-tos/how-to-configure-your-chain',
          'launch-arbitrum-chain/reference/arbitrum-chain-batch-poster-configuration',
          'launch-arbitrum-chain/reference/arbitrum-chain-configuration-parameters',
          'launch-arbitrum-chain/reference/arbitrum-chain-fast-block-times',
          'launch-arbitrum-chain/reference/arbitrum-chain-sequencer-configuration',
          'launch-arbitrum-chain/reference/arbitrum-chain-smart-contract-size-limit',
        ],
        maxHits: 10,
      },
    ],
    require.resolve('docusaurus-plugin-sass'),
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      fathomAnalytics: {
        siteId: 'DOHOZGJO',
      },
      navbar: {
        title: 'Arbitrum Docs',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
          href: '/welcome/arbitrum-gentle-introduction',
        },
        items: [
          // note:  we can uncomment this when we want to display the locale dropdown in the top navbar
          //        if we enable this now, the dropdown will appear above every document; if `ja` is selected for a document that isn't yet translated, it will 404
          //        there may be a way to show the dropdown only on pages that have been translated, but that's out of scope for the initial version
          // {
          //   type: 'localeDropdown',
          // },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Ecosystem',
            items: [
              {
                label: 'Arbitrum One',
                href: 'https://arbitrum.io',
              },
              {
                label: 'Arbitrum Nova',
                href: 'https://nova.arbitrum.io/',
              },
              {
                label: 'Arbitrum Portal',
                href: 'https://portal.arbitrum.io',
              },
              {
                label: 'Arbitrum Bridge',
                href: 'https://bridge.arbitrum.io',
              },
              {
                label: 'Arbitrum Governance',
                href: 'https://arbitrum.foundation',
              },
              {
                label: 'Arbitrum Token Lists',
                href: 'https://tokenlists.org/token-list?url=https://tokenlist.arbitrum.io/ArbTokenLists/arbed_arb_whitelist_era.json',
              },
              {
                label: 'Stylus Live',
                href: 'https://live.stylus-sdk.xyz/playground',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'Arbitrum One Explorer',
                href: 'https://arbiscan.io',
              },
              {
                label: 'Arbitrum Nova Explorer',
                href: 'https://nova.arbiscan.io',
              },
              {
                label: 'Arbitrum Sepolia Explorer',
                href: 'https://sepolia.arbiscan.io/',
              },
              {
                label: 'Stylus By Example',
                href: 'https://example.arbitrum.io/',
              },
              {
                label: 'Analytics',
                href: 'https://dune.com/arbitrum/arbitrum-protocol-metrics',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/arbitrum',
              },
              {
                label: 'Offchain Labs Twitter',
                href: 'https://twitter.com/OffchainLabs',
              },
              {
                label: 'Arbitrum Twitter',
                href: 'https://twitter.com/arbitrum',
              },
              {
                label: 'Forum',
                href: 'https://forum.arbitrum.foundation/',
              },
              {
                label: 'Research Papers',
                href: 'https://github.com/OffchainLabs/arbitrum/blob/master/docs/Arbitrum_and_Fraud_Proofs.pdf',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Offchain Labs, Inc.`,
      },
      sidebar: {
        hideable: true,
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),
};

module.exports = config;
