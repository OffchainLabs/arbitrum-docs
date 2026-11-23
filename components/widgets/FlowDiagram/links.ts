import type { CodeRef, Project } from './model.ts';
import { fillVars } from './text.ts';

/** The code link for a ref: its repo's `code` base with vars filled, the path, and the line. */
export function codeUrl(
  ref: CodeRef,
  repos: Project['repos'],
  values: Record<string, unknown>,
): string {
  const repo = repos[ref.repo];
  if (!repo) throw new Error(`Unknown repo "${ref.repo}" in a code ref`);
  const anchor = ref.line === undefined ? '' : `#L${ref.line}`;
  return `${fillVars(repo.code, values)}/${ref.path}${anchor}`;
}
