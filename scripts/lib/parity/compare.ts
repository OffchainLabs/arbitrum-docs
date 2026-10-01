/**
 * Block comparison. Strict mode decides pass or fail on exact equality of the ordered block keys;
 * fuzzy similarity is used only to pair a changed block with its new version for display.
 */
import { createHash } from 'node:crypto';

import { commonSubsequence } from '../line-diff.ts';
import { sameIgnoringWhitespace, tokens } from './normalize.ts';
import type { Block, BlockCounts, BlockDiff, BlockKind, WordOp } from './schema.ts';

/** Blocks of these kinds are interchangeable: a list item that became a paragraph is not a change. */
const TEXT_KINDS: ReadonlySet<BlockKind> = new Set([
  'paragraph',
  'list-item',
  'table-row',
  'blockquote',
  'callout-title',
  'caption',
  'summary',
]);

const kindClass = (kind: BlockKind): string => (TEXT_KINDS.has(kind) ? 'text' : kind);

/** The identity a block is compared by. Labels (link text, image alt) are not part of it. */
export function blockKey(block: Block): string {
  return [kindClass(block.kind), block.level ?? '', block.title ?? '', block.text].join('\u0000');
}

export function blockHash(block: Block): string {
  return createHash('sha1').update(blockKey(block)).digest('hex').slice(0, 16);
}

/** Dice coefficient over token multisets, 0 to 1. */
export function similarity(a: string, b: string): number {
  const left = tokens(a);
  const right = tokens(b);
  if (left.length === 0 && right.length === 0) return 1;
  const counts = new Map<string, number>();
  for (const token of left) counts.set(token, (counts.get(token) ?? 0) + 1);
  let shared = 0;
  for (const token of right) {
    const count = counts.get(token) ?? 0;
    if (count > 0) {
      shared++;
      counts.set(token, count - 1);
    }
  }
  return (2 * shared) / (left.length + right.length);
}

const MAX_DIFF_CELLS = 4_000_000;

/** Word-level diff of two texts, as runs of equal, deleted and inserted text. */
export function wordDiff(a: string, b: string): WordOp[] {
  const left = a.split(/(\s+)/).filter((part) => part !== '');
  const right = b.split(/(\s+)/).filter((part) => part !== '');
  const ops: WordOp[] = [];
  const add = (op: WordOp['op'], text: string): void => {
    const last = ops.at(-1);
    if (last?.op === op) last.text += text;
    else ops.push({ op, text });
  };

  if (left.length * right.length > MAX_DIFF_CELLS) {
    let start = 0;
    while (start < left.length && start < right.length && left[start] === right[start]) start++;
    let end = 0;
    while (
      end < left.length - start &&
      end < right.length - start &&
      left[left.length - 1 - end] === right[right.length - 1 - end]
    ) {
      end++;
    }
    add('equal', left.slice(0, start).join(''));
    add('delete', left.slice(start, left.length - end).join(''));
    add('insert', right.slice(start, right.length - end).join(''));
    add('equal', left.slice(left.length - end).join(''));
    return ops.filter((op) => op.text !== '');
  }

  let i = 0;
  let j = 0;
  for (const [matchedA, matchedB] of commonSubsequence(left, right)) {
    for (; i < matchedA; i++) add('delete', left[i]);
    for (; j < matchedB; j++) add('insert', right[j]);
    add('equal', left[i]);
    i++;
    j++;
  }
  for (; i < left.length; i++) add('delete', left[i]);
  for (; j < right.length; j++) add('insert', right[j]);
  return groupEdits(ops);
}

/**
 * Merge edits separated only by whitespace into one deletion and one insertion, so a rewritten
 * sentence reads as old text then new text rather than alternating single words.
 */
function groupEdits(ops: WordOp[]): WordOp[] {
  const grouped: WordOp[] = [];
  let deleted = '';
  let inserted = '';
  let gap = '';
  const flushEdits = (): void => {
    if (deleted) grouped.push({ op: 'delete', text: deleted });
    if (inserted) grouped.push({ op: 'insert', text: inserted });
    deleted = '';
    inserted = '';
  };
  for (const op of ops) {
    if (op.op === 'equal') {
      if (/^\s+$/.test(op.text) && (deleted || inserted)) {
        gap += op.text;
        continue;
      }
      flushEdits();
      const last = grouped.at(-1);
      const text = gap + op.text;
      gap = '';
      if (last?.op === 'equal') last.text += text;
      else grouped.push({ op: 'equal', text });
      continue;
    }
    if (gap) {
      deleted += deleted ? gap : '';
      inserted += inserted ? gap : '';
      gap = '';
    }
    if (op.op === 'delete') deleted += op.text;
    else inserted += op.text;
  }
  flushEdits();
  if (gap) grouped.push({ op: 'equal', text: gap });
  return grouped;
}

/** Changed blocks pair only above this similarity; below it they are a removal plus an addition. */
export const PAIRING_THRESHOLD = 0.5;

export interface Comparison {
  diffs: BlockDiff[];
  counts: BlockCounts;
  status: 'identical' | 'whitespace-only' | 'changed';
  similarity: number;
}

const textOf = (blocks: Block[]): string => blocks.map((block) => block.text).join(' ');

/** Compare two ordered block lists. The verdict is exact; pairing for display is fuzzy. */
export function compareBlocks(prod: Block[], target: Block[]): Comparison {
  const oldKeys = prod.map(blockKey);
  const newKeys = target.map(blockKey);
  const anchors = commonSubsequence(oldKeys, newKeys);
  const diffs: BlockDiff[] = [];

  const unmatchedOld: number[] = [];
  const unmatchedNew: number[] = [];
  const gaps: Array<{ old: number[]; new: number[] }> = [];
  let i = 0;
  let j = 0;
  const closeGap = (untilA: number, untilB: number): void => {
    const gap = { old: [] as number[], new: [] as number[] };
    for (; i < untilA; i++) gap.old.push(i);
    for (; j < untilB; j++) gap.new.push(j);
    if (gap.old.length > 0 || gap.new.length > 0) gaps.push(gap);
  };
  for (const [a, b] of anchors) {
    closeGap(a, b);
    i = a + 1;
    j = b + 1;
  }
  closeGap(prod.length, target.length);

  for (const gap of gaps) {
    unmatchedOld.push(...gap.old);
    unmatchedNew.push(...gap.new);
  }

  const usedOld = new Set<number>();
  const usedNew = new Set<number>();

  // Moved: the same block, out of order.
  const newByKey = new Map<string, number[]>();
  for (const index of unmatchedNew) {
    const list = newByKey.get(newKeys[index]) ?? [];
    list.push(index);
    newByKey.set(newKeys[index], list);
  }
  for (const index of unmatchedOld) {
    const match = newByKey.get(oldKeys[index])?.shift();
    if (match === undefined) continue;
    usedOld.add(index);
    usedNew.add(match);
    diffs.push({
      type: 'moved',
      kind: prod[index].kind,
      oldIndex: index,
      newIndex: match,
      oldText: prod[index].text,
      newText: target[match].text,
      ...(target[match].hidden ? { hidden: true } : {}),
    });
  }

  // Changed: pair within each gap, in order, by best similarity among compatible blocks.
  for (const gap of gaps) {
    let cursor = 0;
    for (const oldIndex of gap.old) {
      if (usedOld.has(oldIndex)) continue;
      let best = -1;
      let bestScore = PAIRING_THRESHOLD;
      for (let k = cursor; k < gap.new.length; k++) {
        const newIndex = gap.new[k];
        if (usedNew.has(newIndex)) continue;
        if (kindClass(prod[oldIndex].kind) !== kindClass(target[newIndex].kind)) continue;
        const score = sameIgnoringWhitespace(prod[oldIndex].text, target[newIndex].text)
          ? 1
          : similarity(prod[oldIndex].text, target[newIndex].text);
        if (score > bestScore) {
          best = k;
          bestScore = score;
        }
      }
      if (best === -1) continue;
      const newIndex = gap.new[best];
      cursor = best + 1;
      usedOld.add(oldIndex);
      usedNew.add(newIndex);
      const oldBlock = prod[oldIndex];
      const newBlock = target[newIndex];
      const whitespace =
        oldBlock.kind === 'code' &&
        sameIgnoringWhitespace(oldBlock.text, newBlock.text) &&
        (oldBlock.title ?? '') === (newBlock.title ?? '') &&
        (oldBlock.level ?? 0) === (newBlock.level ?? 0);
      diffs.push({
        type: whitespace ? 'whitespace' : 'changed',
        kind: oldBlock.kind,
        oldIndex,
        newIndex,
        oldText: describe(oldBlock),
        newText: describe(newBlock),
        similarity: Math.round(bestScore * 1000) / 1000,
        ops: wordDiff(describe(oldBlock), describe(newBlock)),
        ...(newBlock.hidden ? { hidden: true } : {}),
      });
    }
  }

  for (const index of unmatchedOld) {
    if (!usedOld.has(index)) {
      diffs.push({
        type: 'removed',
        kind: prod[index].kind,
        oldIndex: index,
        oldText: describe(prod[index]),
      });
    }
  }
  for (const index of unmatchedNew) {
    if (!usedNew.has(index)) {
      diffs.push({
        type: 'added',
        kind: target[index].kind,
        newIndex: index,
        newText: describe(target[index]),
        ...(target[index].hidden ? { hidden: true } : {}),
      });
    }
  }

  diffs.sort((a, b) => (a.oldIndex ?? a.newIndex ?? 0) - (b.oldIndex ?? b.newIndex ?? 0));

  const count = (type: BlockDiff['type']): number =>
    diffs.filter((diff) => diff.type === type).length;
  const counts: BlockCounts = {
    prod: prod.length,
    target: target.length,
    exact: anchors.length,
    changed: count('changed'),
    removed: count('removed'),
    added: count('added'),
    moved: count('moved'),
    whitespace: count('whitespace'),
    hidden: target.filter((block) => block.hidden).length,
  };
  const status =
    diffs.length === 0
      ? 'identical'
      : diffs.every((diff) => diff.type === 'whitespace')
        ? 'whitespace-only'
        : 'changed';
  return {
    diffs,
    counts,
    status,
    similarity: Math.round(similarity(textOf(prod), textOf(target)) * 1000) / 1000,
  };
}

/** A block as one line of report text, with the parts that take part in its identity. */
function describe(block: Block): string {
  if (block.kind === 'heading') return `${'#'.repeat(block.level ?? 1)} ${block.text}`;
  if (block.kind === 'code' && block.title) return `[${block.title}]\n${block.text}`;
  return block.text;
}
