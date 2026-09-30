/**
 * A very small Go reader: enough to find flag registrations and the `var …Default = T{…}`
 * literals their default values point at. Not a parser, and not trying to be one.
 *
 * Why this exists: the Nitro CLI reference has to come from the Nitro source at a pinned tag,
 * and the alternative ways of getting it are worse. Running `nitro --help` means building
 * Nitro, which means a Go toolchain plus the Rust arbitrator artifacts in CI. Hand-maintaining
 * a JSON dump of the flags (what arbitrum-docs does) means the file is only as fresh as the
 * last person who remembered to regenerate it. Reading the source is the only option that is
 * both cheap and pinned.
 *
 * The subset handled is the subset Nitro's config code actually uses: package-level `var` and
 * `const` declarations, composite literals, and functions taking a `*pflag.FlagSet`. Anything
 * outside that is left to the caller, which fails loudly rather than guessing.
 */
import fs from 'node:fs';
import path from 'node:path';

/** A captured `name = expression` declaration: the raw right-hand side and the file it is in. */
export interface GoAssignment {
  expr: string;
  file: string;
}

/** A function taking a `*pflag.FlagSet`: its raw parameter list, its body, and its file. */
export interface GoFlagFunc {
  params: string[];
  body: string;
  file: string;
}

/** Everything indexed for one directory (one Go package). */
export interface GoPackage {
  vars: Map<string, GoAssignment>;
  consts: Map<string, GoAssignment>;
  funcs: Map<string, GoFlagFunc>;
}

/**
 * Import alias to the directory key it resolves to, or null for a package outside the indexed
 * tree (the standard library, a third-party module).
 */
export type GoImports = Map<string, string | null>;

/**
 * One module to index. `dir` is the directory key its packages get (`''` for the root module),
 * `absDir` where it sits on disk.
 */
export interface GoRoot {
  modulePath: string;
  dir: string;
  absDir: string;
}

/** The result of {@link indexGoTree}. */
export interface GoTree {
  dirs: Map<string, GoPackage>;
  fileImports: Map<string, GoImports>;
}

type OpenDelim = '(' | '{' | '[';
const CLOSE_DELIM: Record<OpenDelim, string> = { '(': ')', '{': '}', '[': ']' };
const isOpenDelim = (c: string | undefined): c is OpenDelim => c === '(' || c === '{' || c === '[';

/** Directories with no Go we care about, or none at all once a submodule is unpopulated. */
const SKIP_DIRS = new Set([
  'arbitrator',
  'contracts',
  'nitro-testnode',
  'testdata',
  'target',
  'node_modules',
]);

/** Every non-test `.go` file under `dir`. */
export function goFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      goFiles(abs, out);
    } else if (entry.name.endsWith('.go') && !entry.name.endsWith('_test.go')) {
      out.push(abs);
    }
  }
  return out;
}

/**
 * Strip `//` and block comments, leaving string and rune literals intact.
 *
 * Comments must be recognised before quotes, not after: an apostrophe in a comment ("don't")
 * would otherwise open a rune literal that never closes, and every brace after it would be
 * counted inside a string. That bug silently drops most of a file.
 */
export function stripComments(src: string): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === '`' || c === "'") {
      const quote = c;
      out += c;
      i++;
      while (i < src.length) {
        if (quote !== '`' && src[i] === '\\') {
          out += src[i] + src[i + 1];
          i += 2;
          continue;
        }
        out += src[i];
        if (src[i] === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/** Skip over a quoted literal starting at `i`, returning the index just past its closing quote. */
function skipQuoted(src: string, i: number): number {
  const quote = src[i];
  i++;
  while (i < src.length) {
    if (quote !== '`' && src[i] === '\\') {
      i += 2;
      continue;
    }
    if (src[i] === quote) return i + 1;
    i++;
  }
  return i;
}

/** Index of the delimiter matching the one at `start`, or -1. Quote-aware. */
export function matchDelim(src: string, start: number): number {
  const open = src[start];
  // A start that is not an opening delimiter has no match. The untyped original looked the close
  // up anyway and got `undefined`, which never equals a character, so it also returned -1.
  if (!isOpenDelim(open)) return -1;
  const close = CLOSE_DELIM[open];
  let depth = 0;
  let i = start;
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === '`' || c === "'") {
      i = skipQuoted(src, i);
      continue;
    }
    if (c === open) depth++;
    else if (c === close && --depth === 0) return i;
    i++;
  }
  return -1;
}

/** Split a comma-separated list at nesting depth 0. Quote-aware. */
export function splitArgs(src: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === '`' || c === "'") {
      i = skipQuoted(src, i);
      continue;
    }
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === ',' && depth === 0) {
      parts.push(src.slice(start, i).trim());
      start = i + 1;
    }
    i++;
  }
  const last = src.slice(start).trim();
  if (last) parts.push(last);
  return parts.filter((p) => p !== '');
}

/**
 * Fields of a composite literal such as `T{A: 1, B: Sub{C: 2}}`, as raw expression strings
 * keyed by field name. Positional (unkeyed) literals return an empty map: Nitro's config
 * defaults are all keyed, and guessing at field order would be worse than failing later.
 */
export function literalFields(expr: string): Map<string, string> {
  const braceIdx = expr.indexOf('{');
  if (braceIdx === -1) return new Map();
  const end = matchDelim(expr, braceIdx);
  if (end === -1) return new Map();

  const fields = new Map<string, string>();
  for (const entry of splitArgs(expr.slice(braceIdx + 1, end))) {
    const colon = colonAtDepthZero(entry);
    if (colon === -1) continue;
    const key = entry.slice(0, colon).trim();
    if (!/^\w+$/.test(key)) continue;
    fields.set(key, entry.slice(colon + 1).trim());
  }
  return fields;
}

/** Index of the first `:` outside any nesting or quoting, or -1. */
function colonAtDepthZero(src: string): number {
  let depth = 0;
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === '`' || c === "'") {
      i = skipQuoted(src, i);
      continue;
    }
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === ':' && depth === 0) return i;
    i++;
  }
  return -1;
}

/**
 * Index a Go source tree.
 *
 * Packages are keyed by directory, not by package name: half a dozen directories under `cmd/`
 * declare `package main`, and merging them would let a flag function from `cmd/relay` answer a
 * lookup meant for `cmd/nitro`. Import qualifiers are resolved per file against that file's own
 * import block, so an alias only applies where it was written.
 *
 * `roots` maps a Go module path to the directory holding it, so the Nitro tree and its vendored
 * go-ethereum submodule can be indexed together. Nitro's `execution.rpc.*` flags are registered
 * inside go-ethereum's `arbitrum` package, so the submodule is not optional.
 */
export function indexGoTree(roots: readonly GoRoot[]): GoTree {
  const dirs = new Map<string, GoPackage>();
  const fileImports = new Map<string, GoImports>();

  const dirEntry = (dir: string): GoPackage => {
    let entry = dirs.get(dir);
    if (!entry) {
      entry = { vars: new Map(), consts: new Map(), funcs: new Map() };
      dirs.set(dir, entry);
    }
    return entry;
  };

  // Longest module path first, so a nested module wins over its parent.
  const ordered = [...roots].sort((a, b) => b.modulePath.length - a.modulePath.length);

  /** Go import path to a directory key, or null when the package is not in the tree. */
  const resolveImport = (importPath: string): string | null => {
    for (const root of ordered) {
      if (importPath === root.modulePath) return root.dir;
      if (importPath.startsWith(root.modulePath + '/')) {
        const rel = importPath.slice(root.modulePath.length + 1);
        return root.dir ? `${root.dir}/${rel}` : rel;
      }
    }
    return null;
  };

  for (const root of roots) {
    const absRoot = root.absDir;
    for (const file of goFiles(absRoot)) {
      const src = stripComments(fs.readFileSync(file, 'utf8'));
      const rel = path.relative(absRoot, path.dirname(file));
      const dir = root.dir ? path.join(root.dir, rel) : rel;
      const entry = dirEntry(dir);

      fileImports.set(file, readImports(src, resolveImport));
      readVars(src, file, entry.vars);
      readConsts(src, file, entry.consts);
      readFlagFuncs(src, file, entry.funcs);
    }
  }

  return { dirs, fileImports };
}

/** alias -> directory key (null for packages outside the indexed tree). */
function readImports(src: string, resolveImport: (importPath: string) => string | null): GoImports {
  const imports: GoImports = new Map();
  const add = (alias: string | undefined, importPath: string) => {
    imports.set(alias ?? path.basename(importPath), resolveImport(importPath));
  };

  const block = /\bimport\s*\(/.exec(src);
  if (block) {
    const open = src.indexOf('(', block.index);
    const end = matchDelim(src, open);
    for (const line of src.slice(open + 1, end).split('\n')) {
      const m = /^\s*(?:(\w+|\.)\s+)?"([^"]+)"/.exec(line);
      if (m?.[2] !== undefined) add(m[1], m[2]);
    }
  }
  for (const m of src.matchAll(/^import\s+(?:(\w+)\s+)?"([^"]+)"/gm)) {
    if (m[2] !== undefined) add(m[1], m[2]);
  }
  return imports;
}

/**
 * Capture `name = expression` assignments in a region of source.
 *
 * Handles the three shapes Nitro's config code uses interchangeably: `var X = T{…}`,
 * `var X T = expr` (a declared type between the name and the `=`), and grouped `var ( … )`
 * blocks. A composite literal may span many lines, so the end of an assignment is the matching
 * brace when one opens on the same line, and the end of the line otherwise.
 */
function captureAssignments(region: string, file: string, into: Map<string, GoAssignment>): void {
  const re = /(?:^|\n)[ \t]*(\w+)(?:[ \t]+[\w.[\]*{}]+)?[ \t]*=[ \t]*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(region))) {
    const name = m[1];
    const start = m.index + m[0].length;
    const brace = region.indexOf('{', start);
    const newline = region.indexOf('\n', start);
    let end: number;
    let expr: string;
    if (brace !== -1 && (newline === -1 || brace < newline)) {
      end = matchDelim(region, brace);
      if (end === -1) continue;
      expr = region.slice(start, end + 1).trim();
    } else {
      end = newline === -1 ? region.length : newline;
      expr = region.slice(start, end).trim();
    }
    if (expr && name !== undefined) into.set(name, { expr, file });
    // Resume after the value, so a `=` inside a multi-line literal is not read as a new entry.
    re.lastIndex = Math.max(end, re.lastIndex);
  }
}

/** Package-level `var` declarations, single and grouped. */
function readVars(src: string, file: string, into: Map<string, GoAssignment>): void {
  for (const m of src.matchAll(/^var\s*\(/gm)) {
    const open = src.indexOf('(', m.index);
    const end = matchDelim(src, open);
    if (end === -1) continue;
    captureAssignments(src.slice(open + 1, end), file, into);
  }
  for (const m of src.matchAll(/^var\s+(?=\w)/gm)) {
    const end = blockEnd(src, m.index);
    captureAssignments('\n' + src.slice(m.index + m[0].length, end), file, into);
  }
}

/** End of a single declaration starting at `start`: the matching brace, or the line end. */
function blockEnd(src: string, start: number): number {
  const brace = src.indexOf('{', start);
  const newline = src.indexOf('\n', start);
  if (brace !== -1 && (newline === -1 || brace < newline)) {
    const close = matchDelim(src, brace);
    if (close !== -1) return close + 1;
  }
  return newline === -1 ? src.length : newline;
}

/** Package-level `const` declarations, single and grouped. */
function readConsts(src: string, file: string, into: Map<string, GoAssignment>): void {
  for (const m of src.matchAll(/^const\s*\(/gm)) {
    const open = src.indexOf('(', m.index);
    const end = matchDelim(src, open);
    if (end === -1) continue;
    captureAssignments(src.slice(open + 1, end), file, into);
  }
  for (const m of src.matchAll(/^const\s+(?=\w)/gm)) {
    const end = blockEnd(src, m.index);
    captureAssignments('\n' + src.slice(m.index + m[0].length, end), file, into);
  }
}

/** Functions taking a `*pflag.FlagSet` (Nitro aliases the import as either `flag` or `pflag`). */
function readFlagFuncs(src: string, file: string, into: Map<string, GoFlagFunc>): void {
  for (const m of src.matchAll(/\bfunc\s+(\w+)\s*\(([^)]*)\)\s*\{/g)) {
    const [, name, params] = m;
    if (name === undefined || params === undefined) continue;
    if (!/\b(?:flag|pflag)\.FlagSet\b/.test(params)) continue;
    const brace = m.index + m[0].length - 1;
    const end = matchDelim(src, brace);
    if (end === -1) continue;
    into.set(name, { params: splitArgs(params), body: src.slice(brace + 1, end), file });
  }
}
