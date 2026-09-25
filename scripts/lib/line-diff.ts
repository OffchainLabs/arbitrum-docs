/**
 * A minimal line-level diff, for the `--check` output of the generated-partial scripts.
 *
 * Comparing the two texts by line index is not good enough here. The point of the printed
 * summary is to let a reviewer of the weekly upstream-refresh PR tell an address change from a
 * formatting one, and a positional comparison reports every line after an insertion as changed:
 * on the 112-line contract-address partial, adding two lines reports 53. So this aligns the two
 * sides properly and reports only the lines that actually moved in or out.
 *
 * The inputs are one generated file, so an O(n*m) longest-common-subsequence table is the right
 * trade: ~12k cells for that partial, no dependency, and the output is the real diff rather
 * than an approximation of one.
 */

/**
 * Longest common subsequence of two line arrays, as a list of index pairs.
 *
 * @returns matched `[indexInA, indexInB]` pairs, in order
 */
function commonSubsequence(a: string[], b: string[]): Array<[number, number]> {
  // lengths[i][j] is the LCS length of a.slice(i) and b.slice(j); the extra row and column of
  // zeroes let the recurrence run without bounds checks.
  const lengths = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));

  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lengths[i][j] =
        a[i] === b[j] ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const pairs: Array<[number, number]> = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pairs.push([i, j]);
      i++;
      j++;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return pairs;
}

/** The result of {@link lineDiff}. */
export interface LineDiff {
  changed: number;
  lines: string[];
}

/**
 * Diff two texts by line.
 *
 * @param current the text on disk
 * @param expected the text the generator would write
 * @returns `changed` counts removed plus added lines; `lines` holds them as `- removed` /
 *   `+ added`, each run of removals printed before its corresponding additions so a substitution
 *   reads as a pair.
 */
export function lineDiff(current: string, expected: string): LineDiff {
  const a = current.split('\n');
  const b = expected.split('\n');
  const pairs = commonSubsequence(a, b);

  const lines: string[] = [];
  let i = 0;
  let j = 0;

  /** Emit everything before the next anchor: removals from `a`, then additions from `b`. */
  const flush = (untilA: number, untilB: number): void => {
    for (; i < untilA; i++) lines.push(`  - ${a[i]}`);
    for (; j < untilB; j++) lines.push(`  + ${b[j]}`);
  };

  for (const [matchedA, matchedB] of pairs) {
    flush(matchedA, matchedB);
    i = matchedA + 1;
    j = matchedB + 1;
  }
  flush(a.length, b.length);

  return { changed: lines.length, lines };
}

/**
 * Render {@link lineDiff} as the block the generators print to stderr in check mode.
 */
export function diffSummary(current: string, expected: string): string {
  const { changed, lines } = lineDiff(current, expected);
  return [`${changed} line(s) differ (- committed, + generated):`, ...lines].join('\n');
}
