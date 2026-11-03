/**
 * ESLint over the content. Every `.mdx` and `.md` file under `content/` gets the `docs` rules
 * (`eslint/plugin.ts`); a page under `content/docs/` must also satisfy the frontmatter schema.
 * `pnpm lint` runs it; the editor's ESLint integration reports the same findings as you type.
 */
import type { Linter } from 'eslint';

import docs, { CONTENT_RULES } from './eslint/plugin.ts';

const contentRules: Linter.RulesRecord = Object.fromEntries(
  CONTENT_RULES.map((id) => [`docs/${id}`, 'error']),
);

const config: Linter.Config[] = [
  { ignores: ['.next/', '.source/', 'node_modules/', 'out/', 'public/'] },
  {
    files: ['content/**/*.mdx'],
    plugins: { docs },
    language: 'docs/mdx',
    rules: contentRules,
  },
  {
    files: ['content/**/*.md'],
    plugins: { docs },
    language: 'docs/markdown',
    rules: contentRules,
  },
  {
    files: ['content/docs/**/*.{md,mdx}'],
    rules: { 'docs/frontmatter-schema': 'error' },
  },
];

export default config;
