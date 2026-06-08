// @ts-nocheck
// Note: type annotations allow type checking and IDEs autocompletion
require('dotenv').config();

const markdownPreprocessor = require('./scripts/markdown-preprocessor');
const { themes: prismThemes } = require('prism-react-renderer');
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { inkeepBaseSettings, inkeepModalSettings, inkeepExampleQuestions } from './inkeep.js';
import { redirects } from './redirects.config.js';

// Routes that exist in the Docusaurus build but aren't standalone, indexable pages.
// Shared between the sitemap and llms.txt so both indexes stay in sync.
const nonCanonicalRoutePatterns = [
  '/sdk/assetBridger/**',
  '/sdk/dataEntities/**',
  '/sdk/inbox/**',
  '/sdk/message/**',
  '/sdk/utils/**',
  '/hosted-pdfs/**',
  // Partials are imported into other pages, not standalone content.
  // Docusaurus generates routes for them anyway.
  '**/_*', // Docusaurus partial convention
  '**/partials/**', // non-underscored partials in this repo's partials/ dirs
  '/category/**', // auto-generated category index pages
];

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Arbitrum Docs',
  tagline: 'Arbitrum Docs',
  url: 'https://docs.arbitrum.io/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn', // Allow build to succeed despite false positive anchor warnings from TypeDoc
  favicon: 'img/logo.svg',
  markdown: {
    mermaid: true,
    preprocessor: markdownPreprocessor,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
    parseFrontMatter: async (params) => {
      // Use the default parser
      const result = await params.defaultParseFrontMatter(params);

      // Check if this is a partial file (starts with underscore)
      const fileName = params.filePath.split('/').pop();
      const isPartialFile = fileName && fileName.startsWith('_');

      // For partial files, clear frontmatter to prevent Docusaurus warnings
      // The documentation-graph tool reads raw files directly, so this doesn't affect analysis
      if (isPartialFile) {
        result.frontMatter = {};
      }

      return result;
    },
  },
  customFields: {
    inkeepApiKey: process.env.INKEEP_API_KEY,
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
          exclude: ['**/api/**', '**/*.pdf'],
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          breadcrumbs: false,
          editUrl: function (s) {
            // troubleshooting docs content has external source-of-truth; node-providers uses form-submission
            if (s.docPath.includes('troubleshooting') || s.docPath.includes('node-providers'))
              return undefined;
            return 'https://github.com/OffchainLabs/arbitrum-docs/edit/master/docs/' + s.docPath;
          },
          showLastUpdateTime: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.scss'),
        },
        sitemap: {
          ignorePatterns: nonCanonicalRoutePatterns,
        },
      }),
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        // Source of truth: redirects.config.ts (also mirrored to vercel.json via `yarn sync-redirects`).
        redirects,
      },
    ],
    [
      '@inkeep/cxkit-docusaurus',
      {
        SearchBar: {
          baseSettings: inkeepBaseSettings,
          modalSettings: inkeepModalSettings,
          aiChatSettings: {
            aiAssistantAvatar: '/img/logo.svg',
            exampleQuestions: inkeepExampleQuestions,
            botName: 'Arbitrum Assistant',
            getStartedMessage:
              "Hi! I'm here to help you navigate Arbitrum documentation. Ask me anything about building on Arbitrum, deploying contracts, or understanding our technology.",
          },
        },
        ChatButton: {
          baseSettings: inkeepBaseSettings,
          modalSettings: inkeepModalSettings,
          aiChatSettings: {
            aiAssistantAvatar: '/img/logo.svg',
            exampleQuestions: inkeepExampleQuestions,
          },
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
    require.resolve('docusaurus-plugin-sass'),
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        siteTitle: 'Arbitrum Documentation',
        siteDescription:
          'Official documentation for the Arbitrum ecosystem: building apps, bridging tokens, running nodes, launching Arbitrum chains, and developing with Stylus.',
        content: {
          enableMarkdownFiles: true,
          enableLlmsFullTxt: true,
          includeDocs: true,
          includeBlog: false,
          includePages: false,
          excludeRoutes: nonCanonicalRoutePatterns,
          beforeDefaultRehypePlugins: [require('./src/plugins/rehype-llms-cleanup')],
          beforeDefaultRemarkPlugins: [
            require('./src/plugins/remark-llms-cleanup'),
            require('./src/plugins/remark-llms-page-header'),
          ],
        },
      },
    ],
    'docusaurus-plugin-copy-page-button',
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      fathomAnalytics: {
        siteId: 'DOHOZGJO',
      },
      announcementBar: {
        backgroundColor: '#e3246e',
        textColor: 'white',
        content:
          'Reactivate your Stylus contracts to ensure they remain callable - <a href="https://docs.arbitrum.io/stylus/gentle-introduction#activation" target="_blank">here’s how to do it.</a>',
        isCloseable: false,
      },
      navbar: {
        title: 'Arbitrum Docs',
        logo: {
          alt: 'Arbitrum Logo',
          src: 'img/logo.svg',
          href: '/',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'getStartedSidebar',
            position: 'right',
            label: 'Get started',
          },
          {
            type: 'dropdown',
            label: 'Build apps',
            position: 'right',
            items: [
              {
                label: 'Build with Solidity',
                to: '/build-decentralized-apps/quickstart-solidity-remix',
              },
              {
                label: 'Build with Stylus',
                to: '/stylus/quickstart',
              },
            ],
          },
          {
            type: 'docSidebar',
            sidebarId: 'runArbitrumChainSidebar',
            position: 'right',
            label: 'Launch a chain',
          },
          {
            type: 'docSidebar',
            sidebarId: 'runNodeSidebar',
            position: 'right',
            label: 'Run a node',
          },
          {
            type: 'docSidebar',
            sidebarId: 'bridgeSidebar',
            position: 'right',
            label: 'Use the bridge',
          },
          {
            type: 'docSidebar',
            sidebarId: 'howItWorksSidebar',
            position: 'right',
            label: 'How it works',
          },
          {
            type: 'docSidebar',
            sidebarId: 'noticeSidebar',
            position: 'right',
            label: 'Notices',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            items: [
              {
                label: 'Arbitrum.io',
                to: 'https://arbitrum.io/',
              },
              {
                label: 'Arbitrum Rollup',
                to: 'https://arbitrum.io/rollup',
              },
              {
                label: 'Arbitrum AnyTrust',
                to: 'https://arbitrum.io/anytrust',
              },
              {
                label: 'Arbitrum chains',
                to: 'https://arbitrum.io/launch-chain',
              },
              {
                label: 'Arbitrum Stylus',
                to: 'https://arbitrum.io/stylus',
              },
              {
                label: 'Arbitrum Foundation',
                to: 'https://arbitrum.foundation/',
              },
              {
                html: '<a href="/nitro-whitepaper.pdf">Arbitrum whitepaper</a>',
              },
            ],
          },
          {
            items: [
              {
                label: 'Network status',
                to: 'https://status.arbitrum.io/',
              },
              {
                label: 'Portal',
                to: 'https://portal.arbitrum.io/',
              },
              {
                label: 'Bridge',
                to: 'https://bridge.arbitrum.io/',
              },
              {
                label: 'Governance docs',
                to: 'https://docs.arbitrum.foundation/',
              },
              {
                label: 'Careers',
                to: 'https://offchainlabs.com/careers/',
              },
              {
                label: 'Support',
                to: 'https://support.arbitrum.io/',
              },
              {
                label: 'Bug Bounties',
                to: 'https://immunefi.com/bounty/arbitrum/',
              },
            ],
          },
          {
            items: [
              {
                label: 'Discord',
                to: 'https://discord.gg/ZpZuw7p',
              },
              {
                label: 'Twitter',
                to: 'https://twitter.com/OffchainLabs',
              },
              {
                label: 'Youtube',
                to: 'https://www.youtube.com/@Arbitrum',
              },
              {
                label: 'Medium Blog',
                to: 'https://medium.com/offchainlabs',
              },
              {
                label: 'Research forum',
                to: 'https://research.arbitrum.io/',
              },
              {
                label: 'Privacy Policy',
                to: 'https://arbitrum.io/privacy',
              },
              {
                label: 'Terms of Service',
                to: 'https://arbitrum.io/tos',
              },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} Offchain Labs`,
      },
      prism: {
        additionalLanguages: ['solidity', 'rust', 'bash', 'toml'],
        theme: prismThemes.github,
        darkTheme: prismThemes.palenight,
      },
      liveCodeBlock: {
        /**
         * The position of the live playground, above or under the editor
         * Possible values: "top" | "bottom"
         */
        playgroundPosition: 'top',
      },
      mermaid: {
        options: {
          securityLevel: 'loose',
          flowchart: {
            curve: 'basis',
          },
        },
      },
      docs: {
        sidebar: {
          autoCollapseCategories: true,
        },
      },
    }),
};

module.exports = config;
