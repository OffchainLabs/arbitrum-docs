// @ts-nocheck
// Note: type annotations allow type checking and IDEs autocompletion

require('dotenv').config();

const markdownPreprocessor = require('./scripts/markdown-preprocessor');
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Inkeep analytics event handler - forwards events to PostHog
const handleInkeepEvent = (event) => {
  // Only run on client side where PostHog is available
  if (typeof window === 'undefined' || !window.posthog) {
    return;
  }

  const { eventName, properties } = event;

  // Events we want to track in PostHog
  const trackedEvents = [
    // Chat events
    'assistant_message_received',
    'user_message_submitted',
    'assistant_positive_feedback_submitted',
    'assistant_negative_feedback_submitted',
    'assistant_source_item_clicked',
    'chat_share_button_clicked',
    // Search events
    'search_query_submitted',
    'search_result_clicked',
    'search_query_response_received',
  ];

  if (trackedEvents.includes(eventName)) {
    // Extract relevant properties to avoid sending excessive data
    const eventProperties = {
      component_type: properties?.componentType,
      widget_version: properties?.widgetLibraryVersion,
    };

    // Add event-specific properties
    if (eventName.includes('search')) {
      eventProperties.search_query = properties?.searchQuery;
      if (properties?.totalResults !== undefined) {
        eventProperties.total_results = properties.totalResults;
      }
      if (properties?.title) {
        eventProperties.result_title = properties.title;
      }
    }

    if (eventName.includes('feedback')) {
      eventProperties.feedback_reasons = properties?.reasons;
    }

    if (eventName === 'assistant_source_item_clicked') {
      eventProperties.source_link = properties?.link;
    }

    window.posthog.capture(`inkeep_${eventName}`, eventProperties);
  }
};

// Shared Inkeep configuration
const inkeepBaseSettings = {
  apiKey: process.env.INKEEP_API_KEY,
  primaryBrandColor: '#213147',
  organizationDisplayName: 'Arbitrum',
  onEvent: handleInkeepEvent,
  theme: {
    syntaxHighlighter: {
      lightTheme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/palenight'),
    },
  },
};

const inkeepModalSettings = {
  placeholder: 'Search documentation...',
  defaultQuery: '',
  maxResults: 40,
  debounceTimeMs: 300,
  shouldOpenLinksInNewTab: true,
};

const inkeepExampleQuestions = [
  'How to estimate gas in Arbitrum?',
  'What is the difference between Arbitrum One and Nova?',
  'How to deploy a smart contract on Arbitrum?',
  'What are Arbitrum Orbit chains?',
  'How does Arbitrum handle L1 to L2 messaging?',
  'What is Arbitrum Stylus?',
];

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
            return 'https://github.com/OffchainLabs/arbitrum-docs/edit/master/' + s.docPath;
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
          href: '/get-started/overview',
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
        theme: require('prism-react-renderer/themes/github'),
        darkTheme: require('prism-react-renderer/themes/palenight'),
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
