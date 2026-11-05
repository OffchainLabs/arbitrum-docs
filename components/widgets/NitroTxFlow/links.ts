import type { CodeRef } from './model.ts';

export interface Pins {
  nitroRepositorySlug: string;
  nitroVersionTag: string;
  nitroContractsCommit: string;
}

/** The GitHub URL for a code reference, pinned to the release tag or the contracts commit. */
export function codeUrl(ref: CodeRef, pins: Pins): string {
  const [repo, rev] =
    ref.repo === 'nitro'
      ? [pins.nitroRepositorySlug, pins.nitroVersionTag]
      : ['nitro-contracts', pins.nitroContractsCommit];
  const anchor = ref.line === undefined ? '' : `#L${ref.line}`;
  return `https://github.com/OffchainLabs/${repo}/blob/${rev}/${ref.path}${anchor}`;
}
