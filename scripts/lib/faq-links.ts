/**
 * faq-links: find site-relative links in a rendered FAQ answer that resolve to no page.
 *
 * `check-links` only runs over `content/docs`, and a broken link in a snapshot would otherwise
 * surface one PR later. This reuses the same extraction and resolution so the two agree.
 */
import {
  type RefResolutionIndex,
  extractRefs,
  resolveRefToFile,
  resolvesToPublicAsset,
  splitSuffix,
} from './doc-links.ts';

export function findUnresolvedLinks(
  answer: string,
  index: RefResolutionIndex,
  repoRoot: string,
): string[] {
  const unresolved: string[] = [];
  for (const ref of extractRefs(answer)) {
    const { pathPart } = splitSuffix(ref.rawUrl);
    if (!pathPart.startsWith('/')) continue;
    if (resolveRefToFile(ref.rawUrl, null, index)) continue;
    if (resolvesToPublicAsset(pathPart, repoRoot)) continue;
    unresolved.push(ref.rawUrl);
  }
  return unresolved;
}
