module.exports = {
  ...require('@offchainlabs/prettier-config'),
  // The shared config sets importOrder* options but doesn't declare the plugin that
  // provides them; Prettier 3 no longer auto-loads plugins, so register it here.
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  // override here
  overrides: [
    {
      files: '*.{md,mdx}',
      options: {
        parser: 'mdx',
        printWidth: 9999,
        proseWrap: 'preserve',
        // Keep the import sorter out of fenced code blocks: doc examples mirror
        // upstream tutorials, where import order and inline comments are
        // deliberate. Embedded code is still formatted, just not reordered.
        plugins: [],
      },
    },
  ],
};
