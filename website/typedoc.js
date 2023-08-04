// References:
//  - https://typedoc.org/guides/overview/
//  - https://github.com/tgreyuk/typedoc-plugin-markdown/blob/next/packages/typedoc-plugin-markdown/docs/usage/options.md
//  - https://github.com/tgreyuk/typedoc-plugin-frontmatter/#options

const sdkCodebasePath = '../arbitrum-sdk';

/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  // Configuration options
  tsconfig: `${sdkCodebasePath}/tsconfig.json`,

  // Input options
  entryPoints: [`${sdkCodebasePath}/src/lib`],
  entryPointStrategy: 'expand',
  exclude: [`${sdkCodebasePath}/src/lib/abi`],
  excludeNotDocumented: true,
  excludeInternal: true,
  readme: 'none',

  // Output options
  out: './sdk-docs',
  hideGenerator: true,

  // Validation options
  validation: {
    notExported: false,
    invalidLink: true,
    notDocumented: true,
  },

  // Other options
  logLevel: 'Verbose',

  // Plugins
  plugin: ['typedoc-plugin-markdown', 'typedoc-plugin-frontmatter'],

  // typedoc-plugin-markdown options
  // Reference: https://github.com/tgreyuk/typedoc-plugin-markdown/blob/next/packages/typedoc-plugin-markdown/docs/usage/options.md
  outputFileStrategy: 'modules',
  entryFileName: 'index.md',
  indexFileName: 'index',
  excludeGroups: true,
  hidePageHeader: true,
  // hideKindPrefix: true,
  hideBreadcrumbs: true,
  hideInPageTOC: true,
  identifiersAsCodeBlocks: true,
  propertiesFormat: 'table',
  enumMembersFormat: 'table',
  typeDeclarationFormat: 'table',

  // typedoc-plugin-frontmatter options
  // Reference: https://github.com/tgreyuk/typedoc-plugin-frontmatter/#options
  frontmatterGlobals: {
    toc_max_heading_level: 4,
  },
};
