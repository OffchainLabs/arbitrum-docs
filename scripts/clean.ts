/**
 * clean: delete the Next build cache and the fumadocs-mdx output, as `docusaurus clear` did for
 * master's `yarn start`. `pnpm dev` runs it after `pnpm install`; `next dev` regenerates
 * `.source/`.
 */
import { existsSync, rmSync } from 'node:fs';

for (const dir of ['.next', '.source']) {
  if (!existsSync(dir)) continue;
  rmSync(dir, { recursive: true, force: true });
  console.log(`clean: removed ${dir}`);
}
