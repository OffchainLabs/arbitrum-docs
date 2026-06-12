#!/usr/bin/env tsx
/**
 * Strip transient SME markers from markdown files. SME tags are per-PR signals
 * removed after merge — see the transient-SME-markers design spec.
 *
 * Usage:
 *   tsx scripts/strip-sme-markers.ts <file> [<file> ...]   # strip given files
 *   tsx scripts/strip-sme-markers.ts --all                 # sweep docs markdown
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'glob';

import { MARKER_RE } from './sme-markers';

/**
 * Remove every sme marker from `content`. A line that held only marker(s) is
 * dropped; a line with other content keeps that content (trailing whitespace
 * trimmed). Content between markers is left untouched.
 */
export function stripMarkers(content: string): string {
  const out: string[] = [];
  for (const line of content.split('\n')) {
    const stripped = line.replace(MARKER_RE, '');
    if (stripped === line) {
      out.push(line); // no marker on this line
    } else if (stripped.trim() === '') {
      // marker-only line — drop it
    } else {
      out.push(stripped.replace(/[ \t]+$/, '')); // keep content, trim trailing ws
    }
  }
  return out.join('\n');
}
