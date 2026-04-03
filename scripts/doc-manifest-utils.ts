/**
 * Shared types and utilities for the doc manifest pipeline.
 * Used by both generate-doc-manifest.ts and audit-docs.ts.
 */

export interface CompactDoc {
  p: string; // path
  id: string;
  s: string; // section
  fm?: {
    t?: string; // title
    d?: string; // description
    ct?: string; // content_type
    a?: string; // author
    sme?: string;
  };
  h?: [number, string][]; // headings
  w: number; // words
  l?: string[]; // internal links
  el?: number; // external link count
  im?: string[]; // imports
  cl?: string[]; // code languages
  sb?: string[]; // sidebars
  f?: {
    par?: boolean; // isPartial
    gen?: boolean; // isGenerated
    num?: boolean; // hasNumericPrefix
  };
}

export interface ManifestData {
  generated: string;
  docsRoot: string;
  docs: CompactDoc[];
}

export function isPartial(doc: CompactDoc): boolean {
  return !!doc.f?.par;
}

export function isGenerated(doc: CompactDoc): boolean {
  return !!doc.f?.gen;
}

export function pct(n: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((n / total) * 100)}%`;
}
