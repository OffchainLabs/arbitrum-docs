/**
 * content-lint — structural defects in MDX that no existing gate can see.
 *
 * Every rule ignores fenced and inline code. That is not optional: `partials-check` R3 currently emits
 * 208 warnings that are all component-looking text inside code fences, and a rule that cannot tell
 * documentation-about-syntax from syntax is noise, not a gate.
 *
 * Rules:
 *   A1  VanillaAdmonition with an empty body — the `:::type`→component codemod moved body prose into
 *       `title=`, leaving the box blank and the prose styled as a heading.
 *   A2  VanillaAdmonition `type` outside the component's union (note|tip|info|warning|danger); anything
 *       else indexes `styles[type]` as undefined and renders unstyled.
 *   A3  Unconverted Docusaurus `:::` directive — renders as literal `:::caution` text to readers.
 *   A4  Markdown syntax inside a `title=` attribute — `title` is a plain string prop, so
 *       `[text](/docs/x)` renders literally and the link is unclickable. HTML entities are not
 *       flagged: JSX decodes those in attribute values, so they render as intended.
 *   A5  Internal link target keeping a `.md`/`.mdx` suffix — 404s at runtime.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { toPosix, walk } from './partials.mjs';

export const ADMONITION_TYPES = new Set(['note', 'tip', 'info', 'warning', 'danger']);
const isMdx = (p) => /\.mdx?$/i.test(p);

/** Blank out fenced blocks and inline code, preserving line count and offsets. */
export function stripCode(source) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return source
    .replace(/^([ \t]*)(`{3,}|~{3,})[\s\S]*?^\1?\2[^\n]*$/gm, blank)
    .replace(/`[^`\n]*`/g, blank);
}

const lineOf = (source, index) => source.slice(0, index).split('\n').length;

export function lintSource(source) {
  const findings = [];
  const text = stripCode(source);
  const add = (rule, index, message) => findings.push({ rule, line: lineOf(text, index), message });

  // A1 + A2 + A4 — walk every admonition opening tag.
  //
  // Match against the code-stripped text so admonitions *documented inside* a fence are ignored, but
  // read attribute values from the original source at the same offsets: `stripCode` blanks characters
  // 1:1, so offsets are identical, and an inline-code span inside `title=` would otherwise be erased
  // before A4 could see it.
  for (const m of text.matchAll(/<VanillaAdmonition\b([^>]*?)(\/?)>/g)) {
    const [full, , selfClose] = m;
    const attrs = source.slice(m.index, m.index + full.length);
    const type = attrs.match(/\btype\s*=\s*["']([^"']*)["']/)?.[1];

    if (type !== undefined && !ADMONITION_TYPES.has(type)) {
      add('A2', m.index, `type="${type}" is not one of ${[...ADMONITION_TYPES].join('|')}`);
    }

    let body = null;
    if (selfClose === '/') body = '';
    else {
      // Locate the closer in the code-stripped text (so a closer inside a fence is ignored) but
      // read the body from `source`: a body consisting only of a fenced code block is all spaces
      // in `text`, which used to report a populated admonition as empty.
      const close = text.indexOf('</VanillaAdmonition>', m.index + full.length);
      if (close !== -1) body = source.slice(m.index + full.length, close);
    }
    if (body !== null && body.trim() === '') {
      add('A1', m.index, 'admonition body is empty — body prose likely moved into title=');
    }

    // A4 — `title` is a plain string prop, so markdown in it is printed verbatim.
    //
    // Match the closing quote to the opening one: `["']([^"']*)["']` stops at the first apostrophe
    // inside a double-quoted value ("…doesn't…"), truncating the title and hiding any markup after
    // it — that under-reported A4 by 4 findings.
    //
    // HTML entities are deliberately NOT flagged: JSX decodes them in attribute values, so
    // `title="L1 fee &quot;baked in&quot;"` renders as `L1 fee "baked in"` (verified in a browser).
    const title = attrs.match(/\btitle\s*=\s*(["'])((?:(?!\1).)*)\1/)?.[2];
    if (title) {
      const problems = [];
      if (/\]\(/.test(title)) problems.push('markdown link');
      if (/`/.test(title)) problems.push('inline code');
      if (problems.length) {
        add('A4', m.index, `title= contains ${problems.join(' + ')} which renders literally`);
      }
    }
  }

  // A3 — a line beginning with ::: outside code.
  for (const m of text.matchAll(/^[ \t]*:::+[^\n]*/gm)) {
    add('A3', m.index, `unconverted Docusaurus directive: ${m[0].trim().slice(0, 60)}`);
  }

  // A5 — internal link targets that keep a .md/.mdx suffix.
  const internal = (t) => t && !/^(?:[a-z]+:|\/\/|#)/i.test(t);
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (internal(m[1]) && /\.mdx?(?:#[^)]*)?$/i.test(m[1])) {
      add('A5', m.index, `link target keeps a .md/.mdx suffix: ${m[1]}`);
    }
  }
  for (const m of text.matchAll(/\b(?:href|to)\s*=\s*["']([^"']+)["']/g)) {
    if (internal(m[1]) && /\.mdx?(?:#[^"']*)?$/i.test(m[1])) {
      add('A5', m.index, `link target keeps a .md/.mdx suffix: ${m[1]}`);
    }
  }

  return findings.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
}

/** Lint every MDX file under `content/`, newest-defect-first by rule then path. */
export function lintContent(repoRoot, { dir = 'content' } = {}) {
  const out = [];
  for (const abs of walk(path.join(repoRoot, dir), isMdx)) {
    const rel = toPosix(path.relative(repoRoot, abs));
    for (const f of lintSource(readFileSync(abs, 'utf8'))) out.push({ rel, ...f });
  }
  return out;
}
