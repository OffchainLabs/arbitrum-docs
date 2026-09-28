/**
 * File-walking helpers shared by the scripts that read `content/`.
 */
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

/** Convert an OS path to posix separators. */
export function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

/** True when a file is a partial (underscore-prefixed `.md`/`.mdx`). */
export function isPartial(p: string): boolean {
  const base = path.basename(p);
  return base.startsWith('_') && /\.mdx?$/i.test(base);
}

/** Recursively list files under `dir` matching `filter(absPath)`. Returns [] if `dir` is absent. */
export function walk(dir: string, filter: (absPath: string) => boolean): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs, filter));
    else if (filter(abs)) out.push(abs);
  }
  return out;
}
