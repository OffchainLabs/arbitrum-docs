/**
 * The report.json contract. A static viewer reads these files, so a breaking change to any type
 * here bumps SCHEMA_VERSION.
 */

export const SCHEMA_VERSION = 1;

export type BlockKind =
  | 'heading'
  | 'paragraph'
  | 'list-item'
  | 'table-row'
  | 'blockquote'
  | 'callout-title'
  | 'caption'
  | 'summary'
  | 'code'
  | 'image'
  | 'link';

/** One ordered unit of an article, after normalization. */
export interface Block {
  kind: BlockKind;
  /** Normalized text; for a link the canonical target path or URL, for an image its file name. */
  text: string;
  /** Heading level, 1 to 6. */
  level?: number;
  /** Code block title. */
  title?: string;
  /** Link text or image alt, shown in reports but never compared. */
  label?: string;
  /** Recovered from the page's markdown export because the server HTML left the panel empty. */
  hidden?: boolean;
}

export type ResolutionCategory =
  'direct' | 'same-slug' | 'changed-slug' | 'unrelated' | 'not-found' | 'loop';

export interface Hop {
  url: string;
  status: number;
  location?: string;
}

export interface WordOp {
  op: 'equal' | 'delete' | 'insert';
  text: string;
}

export type DiffType = 'removed' | 'added' | 'changed' | 'moved' | 'whitespace';

export interface BlockDiff {
  type: DiffType;
  kind: BlockKind;
  /** Index in the production block list. */
  oldIndex?: number;
  /** Index in the target block list. */
  newIndex?: number;
  oldText?: string;
  newText?: string;
  /** Fuzzy similarity of a changed pair, 0 to 1. Pairing only, never a verdict. */
  similarity?: number;
  ops?: WordOp[];
  hidden?: boolean;
}

export interface BrokenLink {
  /** The link as the target page renders it. */
  href: string;
  /** The target path after following redirects. */
  resolvedPath: string;
  status: number | null;
  /** The production link that points at the same page, when there is one. */
  prodHref?: string;
  prodStatus?: number | null;
}

export interface BlockCounts {
  prod: number;
  target: number;
  exact: number;
  changed: number;
  removed: number;
  added: number;
  moved: number;
  whitespace: number;
  hidden: number;
}

/** Each parameter is 0 to 1. `overall` is the weighted mean of the content parameters (see WEIGHTS), 0 when the page does not resolve. */
export interface PageScores {
  /** 1 when the old URL ends at 200 on a related page; 0 for a 404, a loop or an unrelated redirect. */
  resolves: number;
  /** Token similarity of the normalized article text. */
  text: number;
  /** Share of production headings present exactly on the target. */
  headings: number;
  /** Share of production code blocks present exactly on the target. */
  code: number;
  /** Share of production images present on the target, by file name. */
  images: number;
  /** Share of production internal links present on the target and landing on a 200 page. */
  links: number;
  overall: number;
}

export type ScoreName = Exclude<keyof PageScores, 'overall'>;

/** What a human needs to triage a page. */
export interface TriageItems {
  headings: string[];
  code: string[];
  images: string[];
  links: Array<{ href: string; reason: 'missing' | 'broken' }>;
  /** Dropped or changed prose, old text next to new; `new` is null when the block was dropped. */
  text: Array<{ kind: BlockKind; old: string; new: string | null; ops?: WordOp[] }>;
}

export interface PageReport {
  oldPath: string;
  finalPath: string | null;
  section: string;
  category: ResolutionCategory;
  redirectChain: Hop[];
  scores: PageScores;
  /** True when any parameter is below the run threshold. */
  triage: boolean;
  items: TriageItems;
  blocks: BlockCounts;
  brokenLinks: { targetOnly: BrokenLink[]; alsoBrokenOnProd: BrokenLink[] };
  /** Every block difference, in production order. */
  diffs: BlockDiff[];
  notes: string[];
}

export interface SectionHealth {
  /** Mean page score, 0 to 100. */
  score: number;
  pages: number;
  triage: number;
}

export interface RunSummary {
  checked: number;
  /** Mean of page overall scores, 0 to 100; a page that does not resolve counts as 0. */
  health: number;
  triage: number;
  threshold: number;
  categories: Record<ResolutionCategory, number>;
  sections: Record<string, SectionHealth>;
  newOnly: number;
  brokenLinksTargetOnly: number;
  brokenLinksAlsoProd: number;
}

export interface ParityRun {
  schemaVersion: typeof SCHEMA_VERSION;
  label: string;
  commit: string | null;
  prs: number[];
  generatedAt: string;
  prodUrl: string;
  targetUrl: string;
  only: string[] | null;
  summary: RunSummary;
  pages: PageReport[];
  newOnlyPages: string[];
}

export interface RunManifestEntry {
  label: string;
  commit: string | null;
  prs: number[];
  generatedAt: string;
  health: number;
  triage: number;
  summary: RunSummary;
  file: string;
}

export interface RunManifest {
  schemaVersion: typeof SCHEMA_VERSION;
  runs: RunManifestEntry[];
}
