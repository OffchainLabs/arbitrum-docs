// @ts-nocheck
// Note: type annotations allow type checking and IDEs autocompletion

const variableInjector = require('./src/remark/variable-injector');
const sdkSidebarGenerator = require('./src/scripts/sdk-sidebar-generator');

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
          customCss: require.resolve('./src/css/custom.scss'),
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
        items: [],
      },
      // todo: descriptive footer
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
        additionalLanguages: ['solidity', 'rust'],
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
