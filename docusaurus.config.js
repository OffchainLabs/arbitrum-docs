// @ts-nocheck
// Note: type annotations allow type checking and IDEs autocompletion

require('dotenv').config();

const markdownPreprocessor = require('./src/scripts/markdown-preprocessor');
const sdkSidebarGenerator = require('./src/scripts/sdk-sidebar-generator');
const sdkCodebasePath = './arbitrum-sdk';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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
          // path: './docs',
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
          baseSettings: {
            apiKey: process.env.INKEEP_API_KEY,
            primaryBrandColor: '#213147', // Arbitrum's primary brand color
            organizationDisplayName: 'Arbitrum',
            theme: {
              syntaxHighlighter: {
                lightTheme: require('prism-react-renderer/themes/github'),
                darkTheme: require('prism-react-renderer/themes/palenight'),
              },
            },
          },
          modalSettings: {
            placeholder: 'Search documentation...',
            defaultQuery: '',
            maxResults: 40,
            debounceTimeMs: 300,
            shouldOpenLinksInNewTab: true,
          },
          searchSettings: {
            // optional settings
          },
          aiChatSettings: {
            aiAssistantAvatar: '/img/logo.svg', // Using Arbitrum logo as AI assistant avatar
            exampleQuestions: [
              'How to estimate gas in Arbitrum?',
              'What is the difference between Arbitrum One and Nova?',
              'How to deploy a smart contract on Arbitrum?',
              'What are Arbitrum Orbit chains?',
              'How does Arbitrum handle L1 to L2 messaging?',
              'What is Arbitrum Stylus?',
            ],
            botName: 'Arbitrum Assistant',
            getStartedMessage:
              "Hi! I'm here to help you navigate Arbitrum documentation. Ask me anything about building on Arbitrum, deploying contracts, or understanding our technology.",
          },
        },
        ChatButton: {
          baseSettings: {
            // see https://docusaurus.io/docs/deployment#using-environment-variables to use docusaurus environment variables
            apiKey: process.env.INKEEP_API_KEY,
            primaryBrandColor: '#213147', // Arbitrum's primary brand color
            organizationDisplayName: 'Arbitrum',
            // ...optional settings
            theme: {
              syntaxHighlighter: {
                lightTheme: require('prism-react-renderer/themes/github'),
                darkTheme: require('prism-react-renderer/themes/palenight'),
              },
            },
          },
          modalSettings: {
            placeholder: 'Search documentation...',
            defaultQuery: '',
            maxResults: 40,
            debounceTimeMs: 300,
            shouldOpenLinksInNewTab: true,
          },
          searchSettings: {
            // optional settings
          },
          aiChatSettings: {
            // optional settings
            aiAssistantAvatar: '/img/logo.svg', // optional -- use your own AI assistant avatar
            exampleQuestions: [
              'How to estimate gas in Arbitrum?',
              'What is the difference between Arbitrum One and Nova?',
              'How to deploy a smart contract on Arbitrum?',
              'What are Arbitrum Orbit chains?',
              'How does Arbitrum handle L1 to L2 messaging?',
              'What is Arbitrum Stylus?',
            ],
          },
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
        out: './docs/sdk',
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
          //   position: 'right',
          // }
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {},
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
                label: 'Arbitrum Orbit',
                to: 'https://arbitrum.io/orbit',
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
                label: 'Nitro whitepaper',
                to: 'https://github.com/OffchainLabs/nitro/blob/master/docs/Nitro-whitepaper.pdf',
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

// HACK
// this was originally included above
// it broke local builds on Windows, not sure why yet. Works fine on Mac
// `generate_sdk_docs` runs fine, no difference in outputs between environments, so it's not easy to debug - low pri
const isRunningLocally = process.env.NODE_ENV === 'development';
const isRunningOnWindows = process.platform === 'win32';
if (isRunningLocally && isRunningOnWindows) {
  config.plugins = config.plugins.filter((plugin) => {
    if (Array.isArray(plugin) && plugin[0] === '@docusaurus/plugin-content-docs') {
      return false; // remove the offending plugin config
    }
    return true; // keep everything else
  });
} else {
  // another hack for another strange windows-specific issue, reproduceable through clean clone of repo
  config.themeConfig.prism.theme = require('prism-react-renderer/themes/github');
  config.themeConfig.prism.darkTheme = require('prism-react-renderer/themes/palenight');
}

module.exports = config;
