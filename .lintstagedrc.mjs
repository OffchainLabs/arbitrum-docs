export default {
  '*': 'prettier --write --ignore-unknown',
  'content/**/*.mdx': 'node scripts/content-lint.ts',
  '*.{ts,tsx}': () => 'pnpm types:check',
};
