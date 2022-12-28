// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Arbitrum Documentation Center",
  tagline: "Arbitrum Dev Docs",
  url: "https://developer.arbitrum.io/",
  baseUrl: "/",
  onBrokenLinks: "ignore",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],
  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "OffchainLabs", // Usually your GitHub org/user name.
  projectName: "docusaurus", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "@docusaurus/preset-classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "../arbitrum-docs/",
          sidebarPath: require.resolve("./sidebars.js"),
          routeBasePath: "/",
          editUrl: function (s) {
            return (
              "https://github.com/OffchainLabs/arbitrum-docs/edit/master/arbitrum-docs/" +
              s.docPath
            );
          },
        },
      }),
    ],
  ],
  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "arbitrum-sdk",
        path: "../arbitrum-sdk/docs",
        routeBasePath: "sdk",
        // ... other options
      },
    ],
    require.resolve("docusaurus-plugin-fathom"),
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        appId: "IPZE4SH6AR",
        apiKey: "aa50e2f5121c9813ef09c7ab5031da67",
        indexName: "crawler_nitro_docs",
        contextualSearch: true,
        searchPagePath: "search",
      },
      fathomAnalytics: {
        siteId: 'DOHOZGJO',
        // Optional fields.
        customDomain: 'https://twentyone-unreal.arbitrum.io', // Use a custom domain, see https://usefathom.com/support/custom-domains
      },
      navbar: {
        title: "Arbitrum Dev Center",
        logo: {
          alt: "My Site Logo",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "doc",
            docId: "intro/intro",
            position: "left",
            label: "Intro",
          },
          {
            type: "doc",
            docId: "migration/dapp_migration",
            position: "left",
            label: "For Devs",
          },
          {
            type: "doc",
            docId: "tx-lifecycle",
            position: "left",
            label: "How It Works",
          },
          {
            href: "https://github.com/OffchainLabs/nitro/blob/master/docs/Nitro-whitepaper.pdf",
            label: "Whitepaper",
            position: "left",
          },
          {
            type: "dropdown",
            label: "Links",
            position: "right",
            items: [
              {
                href: "https://github.com/OffchainLabs/nitro",
                label: "GitHub",
              },
              {
                href: "https://research.arbitrum.io/",
                label: "Research",
              },
              {
                href: "https://github.com/OffchainLabs/arbitrum-tutorials",
                label: "Tutorials",
              },
              {
                href: "https://medium.com/offchainlabs",
                label: "Blog",
              },
            ],
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Info",
            items: [
              {
                label: "Offchain Labs",
                to: "https://offchainlabs.com/",
              },
              {
                label: "Arbitrum.io",
                to: "https://arbitrum.io/",
              },
              {
                label: "Nova.arbitrum.io",
                to: "https://nova.arbitrum.io/",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discord.gg/ZpZuw7p",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/ArbitrumDevs",
              },
              {
                label: "Research forum",
                href: "https://research.arbitrum.io/",
              },
              {
                label: "Medium Blog",
                href: "https://medium.com/offchainlabs",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Offchain Labs, Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ["solidity"],
      },
      announcementBar: {
        id: "support_us",
        content: `Note: Arbitrum is in mainnet beta, which includes trusted admin controls; use at your own risk! See <a rel="noopener noreferrer" href="/mainnet-beta">here</a> for details.`,
        backgroundColor: "rgb(121 241 3)",
        textColor: "#091E42",
        isCloseable: true,
      },
    }),
};

module.exports = config;
