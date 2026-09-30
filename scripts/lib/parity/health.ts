/**
 * Page scores and run health.
 *
 * Each production page gets six parameters, each 0 to 1 (see PageScores). Its overall score is
 * the WEIGHTS-weighted mean of the content parameters, and 0 when the page does not resolve. A
 * page goes to triage when any single parameter is below the threshold, so one missing code block
 * still flags the page even when the mean stays high. Run health is the mean overall page score
 * times 100.
 */
import { type Comparison, blockKey } from './compare.ts';
import { sectionOf } from './resolve.ts';
import type {
  Block,
  BlockKind,
  PageReport,
  PageScores,
  ResolutionCategory,
  ScoreName,
  SectionHealth,
  TriageItems,
} from './schema.ts';

export const DEFAULT_THRESHOLD = 0.97;

export const SCORE_NAMES: ScoreName[] = ['resolves', 'text', 'headings', 'code', 'images', 'links'];

/** Weights of the content parameters in a page's overall score; they sum to 1. */
export const WEIGHTS: Record<Exclude<ScoreName, 'resolves'>, number> = {
  text: 0.4,
  headings: 0.15,
  code: 0.15,
  images: 0.1,
  links: 0.2,
};

const round = (value: number): number => Math.round(value * 1000) / 1000;

const RESOLVED: ReadonlySet<ResolutionCategory> = new Set(['direct', 'same-slug', 'changed-slug']);

/** Production blocks of `kind` with no exact counterpart on the target, matched as multisets. */
function missing(prod: Block[], target: Block[], keep: (block: Block) => boolean): Block[] {
  const available = new Map<string, number>();
  for (const block of target) {
    if (!keep(block)) continue;
    const key = blockKey(block);
    available.set(key, (available.get(key) ?? 0) + 1);
  }
  const result: Block[] = [];
  for (const block of prod) {
    if (!keep(block)) continue;
    const key = blockKey(block);
    const count = available.get(key) ?? 0;
    if (count > 0) available.set(key, count - 1);
    else result.push(block);
  }
  return result;
}

const share = (total: number, lost: number): number =>
  total === 0 ? 1 : round((total - lost) / total);

const ofKind = (kind: BlockKind) => (block: Block) => block.kind === kind;

const STRUCTURAL_KINDS: ReadonlySet<BlockKind> = new Set(['heading', 'code', 'image', 'link']);

/**
 * Score one page. `isInternal` says whether a canonical link is on this site; `works` whether it
 * lands on a 200 page on the target.
 */
export function scorePage(input: {
  category: ResolutionCategory;
  prod: Block[];
  target: Block[];
  comparison: Comparison;
  isInternal: (link: string) => boolean;
  works: (link: string) => boolean;
}): { scores: PageScores; items: TriageItems } {
  const { prod, comparison } = input;
  const resolved = RESOLVED.has(input.category);
  const target = resolved ? input.target : [];

  const headings = missing(prod, target, ofKind('heading'));
  const code = missing(prod, target, ofKind('code'));
  const images = missing(prod, target, ofKind('image'));
  const internal = (block: Block) => block.kind === 'link' && input.isInternal(block.text);
  const absentLinks = missing(prod, target, internal);
  const absent = new Set(absentLinks);
  const broken = prod.filter(
    (block) => internal(block) && !absent.has(block) && !input.works(block.text),
  );
  const prodLinks = prod.filter(internal).length;

  const scores: PageScores = {
    resolves: resolved ? 1 : 0,
    text: resolved ? comparison.similarity : 0,
    headings: resolved ? share(prod.filter(ofKind('heading')).length, headings.length) : 0,
    code: resolved ? share(prod.filter(ofKind('code')).length, code.length) : 0,
    images: resolved ? share(prod.filter(ofKind('image')).length, images.length) : 0,
    links: resolved ? share(prodLinks, absentLinks.length + broken.length) : 0,
    overall: 0,
  };
  scores.overall = resolved
    ? round(
        (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).reduce(
          (sum, name) => sum + WEIGHTS[name] * scores[name],
          0,
        ),
      )
    : 0;

  const items: TriageItems = {
    headings: headings.map((block) => block.text),
    code: code.map((block) => (block.title ? `[${block.title}] ${block.text}` : block.text)),
    images: images.map((block) => block.text),
    links: [
      ...absentLinks.map((block) => ({ href: block.text, reason: 'missing' as const })),
      ...broken.map((block) => ({ href: block.text, reason: 'broken' as const })),
    ],
    text: resolved
      ? comparison.diffs
          .filter(
            (diff) =>
              !STRUCTURAL_KINDS.has(diff.kind) &&
              (diff.type === 'changed' || diff.type === 'removed'),
          )
          .map((diff) => ({
            kind: diff.kind,
            old: diff.oldText ?? '',
            new: diff.type === 'changed' ? (diff.newText ?? '') : null,
            ...(diff.ops ? { ops: diff.ops } : {}),
          }))
      : [],
  };
  return { scores, items };
}

export const needsTriage = (scores: PageScores, threshold: number): boolean =>
  SCORE_NAMES.some((name) => scores[name] < threshold);

const mean = (pages: PageReport[]): number =>
  pages.length === 0
    ? 100
    : Math.round(
        (1000 * pages.reduce((sum, page) => sum + page.scores.overall, 0)) / pages.length,
      ) / 10;

/** Run health, 0 to 100: the mean page score. */
export const runHealth = (pages: PageReport[]): number => mean(pages);

/** Health per top-level section of the production URL. */
export function sectionHealth(pages: PageReport[]): Record<string, SectionHealth> {
  const bySection = new Map<string, PageReport[]>();
  for (const page of pages) {
    const section = page.section || sectionOf(page.oldPath);
    bySection.set(section, [...(bySection.get(section) ?? []), page]);
  }
  const result: Record<string, SectionHealth> = {};
  for (const section of [...bySection.keys()].sort()) {
    const list = bySection.get(section) ?? [];
    result[section] = {
      score: mean(list),
      pages: list.length,
      triage: list.filter((page) => page.triage).length,
    };
  }
  return result;
}
