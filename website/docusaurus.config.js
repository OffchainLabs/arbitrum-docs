// @ts-nocheck
// Note: type annotations allow type checking and IDEs autocompletion

const variableInjector = require('./src/remark/variable-injector');
const sdkSidebarGenerator = require('./src/scripts/sdk-sidebar-generator');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Arbitrum Docs',
  tagline: 'Arbitrum Docs',
  url: 'https://developer.arbitrum.io/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/logo.svg',
  markdown: {
    mermaid: true,
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
    locales: ['en'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '../arbitrum-docs/',
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
          remarkPlugins: [
            [
              variableInjector,
              {
                replacements: require('./src/resources/globalVars.js'),
              },
            ],
          ],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  plugins: [
    // See below hack - this gets modified if you're running locally on windows
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'arbitrum-sdk',
        path: './sdk-docs',
        routeBasePath: 'sdk',
        sidebarItemsGenerator: sdkSidebarGenerator,
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
    require.resolve('docusaurus-lunr-search'),
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
        },
        items: [
          {
            type: 'doc',
            docId: 'for-devs/quickstart-solidity-hardhat',
            position: 'left',
            label: 'Developers',
          },
          {
            type: 'doc',
            docId: 'getting-started-users',
            position: 'left',
            label: 'Bridge users',
          },
          {
            type: 'doc',
            docId: 'node-running/quickstart-running-a-node',
            label: 'Node runners',
            position: 'left',
          },
          {
            type: 'doc',
            docId: 'intro/intro',
            position: 'left',
            label: 'How it works',
          },
          {
            type: 'dropdown',
            label: 'Links',
            position: 'right',
            items: [
              {
                href: '/sdk',
                label: 'SDK docs',
              },
              {
                href: 'https://github.com/OffchainLabs/nitro',
                label: 'GitHub',
              },
              {
                href: 'https://research.arbitrum.io/',
                label: 'Research',
              },
              {
                href: 'https://github.com/OffchainLabs/arbitrum-tutorials',
                label: 'Tutorials',
              },
              {
                href: 'https://medium.com/offchainlabs',
                label: 'Blog',
              },
            ],
          },
        ],
      },
      // todo: descriptive footer
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Info',
            items: [
              {
                label: 'Offchain Labs',
                to: 'https://offchainlabs.com/',
              },
              {
                label: 'Arbitrum.io',
                to: 'https://arbitrum.io/',
              },
              {
                label: 'Nova.arbitrum.io',
                to: 'https://nova.arbitrum.io/',
              },
              {
                label: 'Nitro whitepaper',
                to: 'https://github.com/OffchainLabs/nitro/blob/master/docs/Nitro-whitepaper.pdf',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/ZpZuw7p',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/ArbitrumDevs',
              },
              {
                label: 'Research forum',
                href: 'https://research.arbitrum.io/',
              },
              {
                label: 'Medium Blog',
                href: 'https://medium.com/offchainlabs',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Offchain Labs, Built with Docusaurus.`,
      },
      prism: {
        additionalLanguages: ['solidity'],
      },
      announcementBar: {
        id: 'support_us',
        content: `Arbitrum One and Arbitrum Nova are now under decentralized governance. Learn more about Arbitrum DAO <a href='https://docs.arbitrum.foundation/gentle-intro-dao-governance'>here</a>.`,
        isCloseable: false,
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
  config.themeConfig.prism.darkTheme = require('prism-react-renderer/themes/dracula');
}

module.exports = config;
