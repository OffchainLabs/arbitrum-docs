/**
 * Single source of truth for SME region markers, imported by both the review
 * gate (detection) and the post-merge stripper (removal) so the two can never
 * drift on what counts as a marker.
 */

/** Opening of an `sme:start` marker; captures the team slug. */
export const START_RE = /\{\/\*\s*sme:start\s+team=([A-Za-z0-9._-]+)/;

/** An `sme:end` marker. */
export const END_RE = /\{\/\*\s*sme:end\b/;

/**
 * A COMPLETE single-line sme marker comment (`{/* sme:start … * /}` or
 * `{/* sme:end * /}`), for removal. Global so every marker on a line is replaced.
 */
export const MARKER_RE = /\{\/\*\s*sme:(?:start|end)\b.*?\*\/\}/g;
