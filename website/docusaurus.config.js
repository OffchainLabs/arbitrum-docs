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
  favicon: "img/logo.svg",
  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid", "@docusaurus/theme-live-codeblock"],
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
          breadcrumbs: false,
          editUrl: function (s) {
            // troubleshooting docs content has external source-of-truth; node-providers uses form-submission
            if (s.docPath.includes("troubleshooting") || s.docPath.includes("node-providers")) return undefined;
            return (
              "https://github.com/OffchainLabs/arbitrum-docs/edit/master/arbitrum-docs/" +
              s.docPath
            );
          },
          showLastUpdateTime: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
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
    require.resolve("docusaurus-lunr-search"),
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      fathomAnalytics: {
        siteId: "DOHOZGJO",
        // Optional fields.
        customDomain: "https://twentyone-unreal.arbitrum.io", // Use a custom domain, see https://usefathom.com/support/custom-domains
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
            label: "Overview",
          },
          {
            type: "doc",
            docId: "chain-launching/launch-a-chain",
            position: "left",
            label: "Launch an L3 (new!)",
            value: '<button>Give feedback</button>',
          },
          {
            type: "doc",
            docId: "node-running/running-a-node",
            label: "Run a Node",
            position: "left",
          },
          {
            type: "doc",
            docId: "getting-started-devs",
            position: "left",
            label: "Build DApps",
          },
          {
            type: "doc",
            docId: "tx-lifecycle",
            position: "left",
            label: "Learn",
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
        content: `✨ Arbitrum One and Arbitrum Nova are now under decentralized governance. Learn more about Arbitrum DAO <a rel="noopener noreferrer" href="https://docs.arbitrum.foundation/" target="_blank">here</a>. ✨`,
        backgroundColor: "rgb(8 53 117)",
        textColor: "white",
        isCloseable: false,
      },
      liveCodeBlock: {
        /**
         * The position of the live playground, above or under the editor
         * Possible values: "top" | "bottom"
         */
        playgroundPosition: 'top',
      },
    }),
};

module.exports = config;
