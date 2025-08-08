module.exports = {
  // Base settings from @offchainlabs/prettier-config
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  bracketSpacing: true,
  arrowParens: 'always',
  trailingComma: 'all',
  printWidth: 100,
  quoteProps: 'consistent',

  // MDX-specific overrides to prevent breaking quicklook tags
  overrides: [
    {
      files: '*.{md,mdx}',
      options: {
        parser: 'mdx',
        printWidth: 160, // Increase to prevent breaking inline HTML tags
        proseWrap: 'always', // Still wrap regular prose at sensible lengths
      },
    },
  ],
};
