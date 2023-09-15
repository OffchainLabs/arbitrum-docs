module.exports = {
  ...require('@offchainlabs/prettier-config'),
  // override here
  overrides: [
    {
      files: '*.{md,mdx}',
      options: {
        parser: 'mdx',
      },
    },
  ],
};
