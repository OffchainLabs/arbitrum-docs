/**
 * Turn an indexed Nitro source tree into the flag list behind the CLI flags reference page.
 *
 * Two halves:
 *  - `extractFlags` walks the registration tree from `NodeConfigAddOptions`, composing the
 *    dotted flag names the same way Nitro does at runtime (each `…ConfigAddOptions` is handed a
 *    prefix and appends to it).
 *  - the value resolver turns a default expression such as `DefaultBatchPosterConfig.MaxDelay`
 *    into the string pflag would print, by following the `var …Default = T{…}` literal it
 *    points at.
 *
 * Anything the resolver cannot evaluate is reported, never guessed: a reference page with a
 * quietly wrong default is worse than one that fails to build.
 */
import {
  type GoAssignment,
  type GoImports,
  type GoPackage,
  literalFields,
  matchDelim,
  splitArgs,
} from './go-source.ts';

/** One row of the reference page: what `nitro --help` would print for a flag. */
export interface CliFlag {
  flag: string;
  type: string;
  /** The formatted default, '' for a zero value. */
  default: string;
  description: string;
}

/** A flag registered with `f.Var`, whose pflag type and default are declared by hand. */
export interface CustomFlagType {
  type: string;
  default: string;
}

/** Where the walk over the flag registrations starts: a package directory and a function. */
export interface EntryPoint {
  dir: string;
  func: string;
}

/**
 * An evaluated Go expression. `zero` is a struct field the composite literal omits (Go's zero
 * value for its type); `nil` is a literal `nil` or an empty expression. A `number` may be a
 * BigInt for the constants and complements that do not survive a double.
 */
export type GoValue =
  | { kind: 'nil'; value: null }
  | { kind: 'zero'; value: null }
  | { kind: 'string'; value: string }
  | { kind: 'bool'; value: boolean }
  | { kind: 'number'; value: number | bigint }
  | { kind: 'duration'; value: number }
  | { kind: 'slice'; value: GoValue[] };

/**
 * An expression a parameter or local variable stands for, the directory it was written in, and
 * the scope it must itself be evaluated in.
 */
interface Binding {
  expr: string;
  dir: string;
  bindings: Scope;
}

type Scope = Map<string, Binding>;

/** A `qualifier.name(args…)` call found in a function body. */
interface GoCall {
  qualifier: string | undefined;
  name: string;
  args: string[];
}

/** What a struct field lookup found: its expression and package, or Go's zero value. */
type FieldResult = { expr: string; dir: string } | 'zero' | null;

/** Narrow an evaluated list to one in which every item evaluated. */
function allEvaluated(items: Array<GoValue | null>): GoValue[] | null {
  const values: GoValue[] = [];
  for (const item of items) {
    if (item === null) return null;
    values.push(item);
  }
  return values;
}

/**
 * pflag registration method to the type name `--help` prints.
 *
 * pflag shortens four of its own type names in `UnquoteUsage` (`int64`→`int`, `uint64`→`uint`,
 * `float64`→`float`, `stringSlice`→`strings`) and blanks `bool` entirely. This table reproduces
 * that mapping, keeping `bool` spelled out because a blank cell in the Type column reads as a
 * bug rather than as "boolean".
 */
export const FLAG_TYPES: Readonly<Record<string, string>> = {
  String: 'string',
  Bool: 'bool',
  Int: 'int',
  Int8: 'int8',
  Int16: 'int16',
  Int32: 'int32',
  Int64: 'int',
  Uint: 'uint',
  Uint8: 'uint8',
  Uint16: 'uint16',
  Uint32: 'uint32',
  Uint64: 'uint',
  Float32: 'float32',
  Float64: 'float',
  Duration: 'duration',
  StringSlice: 'strings',
  IntSlice: 'ints',
  UintSlice: 'uints',
  BoolSlice: 'bools',
  DurationSlice: 'durationSlice',
  StringArray: 'stringArray',
};

/**
 * Go standard-library constants that appear in Nitro's defaults and usage strings. They are not
 * in the indexed tree (the standard library is not vendored), and there are few enough to name.
 */
const STDLIB_CONSTANTS: Readonly<Record<string, number | bigint>> = {
  'math.MaxInt': 9223372036854775807n,
  'math.MaxInt8': 127,
  'math.MaxInt16': 32767,
  'math.MaxInt32': 2147483647,
  'math.MaxInt64': 9223372036854775807n,
  'math.MinInt32': -2147483648,
  'math.MinInt64': -9223372036854775808n,
  'math.MaxUint8': 255,
  'math.MaxUint16': 65535,
  'math.MaxUint32': 4294967295,
  'math.MaxUint64': 18446744073709551615n,
  'math.MaxFloat64': 1.7976931348623157e308,
};

const DURATION_UNITS: Readonly<Record<string, bigint>> = {
  Nanosecond: 1n,
  Microsecond: 1000n,
  Millisecond: 1000000n,
  Second: 1000000000n,
  Minute: 60000000000n,
  Hour: 3600000000000n,
};

/** Conversions that do not change the value for our purposes. */
const TRANSPARENT_CASTS = new Set([
  'string',
  'int',
  'int8',
  'int16',
  'int32',
  'int64',
  'uint',
  'uint8',
  'uint16',
  'uint32',
  'uint64',
  'float32',
  'float64',
  'time.Duration',
]);

export interface ExtractFlagsInput {
  /** Indexed packages from `indexGoTree`. */
  dirs: Map<string, GoPackage>;
  /** Per-file import maps from `indexGoTree`. */
  fileImports: Map<string, GoImports>;
  /** Where the walk starts. */
  entryPoint: EntryPoint;
  /** `f.Var` overrides, keyed by the full flag name. */
  customTypes?: Readonly<Record<string, CustomFlagType>>;
  /** Defaults that are not static values, keyed by the full flag name. */
  defaultOverrides?: Readonly<Record<string, string>>;
}

/** Walk the flag registration tree. */
export function extractFlags({
  dirs,
  fileImports,
  entryPoint,
  customTypes = {},
  defaultOverrides = {},
}: ExtractFlagsInput): { flags: CliFlag[]; problems: string[] } {
  const flags: CliFlag[] = [];
  const problems: string[] = [];
  const resolver = new ValueResolver(dirs, fileImports, problems);
  const visited = new Set<string>();

  function walk(dir: string, funcName: string, prefix: string, depth: number, bindings: Scope) {
    // Keyed on where the registration happens and what it is called, but not on `bindings`: a
    // registration function reached twice with the same prefix and *different* defaults would
    // yield only the first set. Nitro does not do that at the pinned tag (the one function that
    // serves two callers, the data poster, gets a different prefix each time), so this is a note
    // for whoever debugs a flag whose default looks like its sibling's, not a bug today.
    const key = `${dir}.${funcName} ${prefix}`;
    if (visited.has(key)) return;
    visited.add(key);
    if (depth > 40) {
      problems.push(`registration tree deeper than 40 at ${dir}.${funcName} ("${prefix}")`);
      return;
    }

    const fn = dirs.get(dir)?.funcs.get(funcName);
    if (!fn) {
      problems.push(`flag function ${dir}.${funcName} not found (prefix "${prefix}")`);
      return;
    }
    const imports: GoImports = fileImports.get(fn.file) ?? new Map();
    const body = fn.body;
    const scope = withLocals(body, dir, bindings);

    for (const call of calls(body)) {
      const { qualifier, name, args } = call;

      const flagType = FLAG_TYPES[name];
      if (qualifier === 'f' && flagType) {
        const flag = flagName(args[0], prefix);
        if (flag === null) {
          problems.push(`unreadable flag name ${args[0]} in ${dir}.${funcName}`);
          continue;
        }
        flags.push({
          flag,
          type: flagType,
          default:
            defaultOverrides[flag] ??
            resolver.format(args[1], dir, flagType, `${flag} default`, scope),
          description: resolver.describe(args[2], dir, prefix, scope, `${flag} description`),
        });
        continue;
      }

      // `f.Var(&value, name, usage)` registers a flag whose type and default live on a custom
      // pflag.Value implementation. Reading those would mean evaluating Go methods, so they are
      // declared in the data file instead and checked here.
      if (qualifier === 'f' && name === 'Var') {
        const flag = flagName(args[1], prefix);
        if (flag === null) {
          problems.push(`unreadable flag name ${args[1]} in ${dir}.${funcName}`);
          continue;
        }
        const override = customTypes[flag];
        if (!override) {
          problems.push(
            `f.Var flag "${flag}" has no entry in customFlagTypes ` +
              `(scripts/data/nitro-cli-reference.data.ts); add its pflag type and default`,
          );
          continue;
        }
        flags.push({
          flag,
          type: override.type,
          default: override.default,
          description: resolver.describe(args[2], dir, prefix, scope, `${flag} description`),
        });
        continue;
      }

      // A nested `…AddOptions(prefix+".sub", f, …)` call, or one that reuses the same prefix.
      //
      // Anything handed the FlagSet registers flags, so a call this walk cannot follow is a whole
      // namespace missing from the page. Both ways of failing to follow one are reported rather
      // than skipped: silently dropping them is what the hardcoded go-ethereum check in
      // generate-cli-reference.ts guards against for one known case, and there is no reason the
      // general case should be quieter. Measured against Nitro v3.11.3, neither fires.
      if (!args.includes('f')) continue;
      const targetDir = qualifier ? imports.get(qualifier) : dir;
      if (!targetDir || !dirs.get(targetDir)?.funcs.has(name)) {
        problems.push(
          `registration call ${qualifier ? `${qualifier}.` : ''}${name} in ${dir}.${funcName} ` +
            `("${prefix}") resolves to no indexed package; its flags would be dropped`,
        );
        continue;
      }
      const sub = args[0] === 'f' ? prefix : flagName(args[0], prefix);
      if (sub === null) {
        problems.push(`unreadable prefix ${args[0]} for ${name} in ${dir}.${funcName}`);
        continue;
      }
      walk(targetDir, name, sub, depth + 1, bindArgs(dirs, targetDir, name, args, dir, scope));
    }
  }

  walk(entryPoint.dir, entryPoint.func, '', 0, new Map());

  // Both curated tables are plain lookups, so an entry whose flag Nitro has *removed* stops
  // matching and costs nothing: no error, no output, just a line in the data file that no longer
  // describes Nitro under a docblock promising that could not happen. A *renamed* flag does fail
  // the run, but only as a side effect of the new name reaching the resolver, which blames the
  // resolver rather than the stale entry. So check the other direction too, the way the drift
  // allowlists are: a curated exemption that rots into a no-op has to fail loudly.
  //
  // This runs against the flags as collected, before the caller applies `exclusions`.
  // `defaultOverrides` declares `blocks-reexecutor.room`, which the blocks-reexecutor exclusion
  // rule keeps off the published page; checking against the published list would report that
  // live entry as unused on every run.
  const seen = new Set(flags.map((flag) => flag.flag));
  const curated: Array<[string, Readonly<Record<string, unknown>>]> = [
    ['customFlagTypes', customTypes],
    ['defaultOverrides', defaultOverrides],
  ];
  for (const [table, entries] of curated) {
    for (const flag of Object.keys(entries)) {
      if (seen.has(flag)) continue;
      problems.push(
        `${table} entry "${flag}" (scripts/data/nitro-cli-reference.data.ts) matched no flag; ` +
          `Nitro no longer registers it, so drop the entry or correct its name`,
      );
    }
  }

  flags.sort((a, b) => a.flag.localeCompare(b.flag));
  return { flags, problems };
}

/** Every `qualifier.name(args…)` call in a function body, in source order. */
function* calls(body: string): Generator<GoCall> {
  const re = /(?:(\w+)\.)?(\w+)\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const open = m.index + m[0].length - 1;
    const close = matchDelim(body, open);
    if (close === -1) continue;
    const name = m[2];
    if (name === undefined) continue;
    yield { qualifier: m[1], name, args: splitArgs(body.slice(open + 1, close)) };
  }
}

/**
 * Bind a callee's parameters to the expressions the caller passed.
 *
 * Nitro reuses one registration function for several namespaces and hands it the defaults to
 * use: `DataPosterConfigAddOptions(prefix+".data-poster", f, DefaultBatchPosterDataPosterConfig, …)`
 * registers `node.batch-poster.data-poster.*` from one struct and `node.staker.data-poster.*`
 * from another. Without this binding every one of those defaults reads as an unknown identifier.
 *
 * Each binding carries the directory its expression was written in, so a later lookup resolves in
 * the caller's package. An argument that is itself a bound parameter keeps the original binding
 * rather than becoming a name that means nothing one level down.
 */
function bindArgs(
  dirs: Map<string, GoPackage>,
  targetDir: string,
  targetFunc: string,
  args: string[],
  callerDir: string,
  callerScope: Scope,
): Scope {
  const bindings: Scope = new Map();
  const params = dirs.get(targetDir)?.funcs.get(targetFunc)?.params ?? [];
  for (let i = 0; i < params.length && i < args.length; i++) {
    const paramName = params[i].trim().split(/\s+/)[0];
    if (!/^\w+$/.test(paramName) || paramName === 'prefix' || paramName === 'f') continue;
    const arg = args[i].trim();
    bindings.set(
      paramName,
      callerScope.get(arg) ?? { expr: arg, dir: callerDir, bindings: callerScope },
    );
  }
  return bindings;
}

/**
 * Add a function's local variables to its scope.
 *
 * go-ethereum's RPC config does `arbDebug := DefaultConfig.ArbDebug` and then registers several
 * flags off `arbDebug`. Treating a local exactly like a bound parameter costs one pass over the
 * body and removes the whole class of "unknown identifier" failures those aliases cause.
 */
function withLocals(body: string, dir: string, bindings: Scope): Scope {
  const scope: Scope = new Map(bindings);
  for (const m of body.matchAll(/(?:^|\n)[ \t]*(\w+)[ \t]*:?=[ \t]*([^\n]+)/g)) {
    const [, name, value] = m;
    if (name === undefined || value === undefined) continue;
    if (name === 'prefix' || name === 'f' || scope.has(name)) continue;
    scope.set(name, { expr: value.trim(), dir, bindings });
  }
  return scope;
}

/** Resolve a flag-name expression (`prefix`, `prefix+".x"`, or a literal) against the prefix. */
function flagName(expr: string | undefined, prefix: string): string | null {
  if (expr === undefined) return null;
  const t = expr.trim();
  if (t === 'prefix') return prefix;
  const joined = text(t, prefix);
  return joined ?? null;
}

/**
 * Evaluate a `+`-concatenation of string literals and `prefix`, then collapse whitespace.
 *
 * Nitro splits long usage strings across source lines with `"…\n" + "…"`. Those newlines exist
 * to wrap terminal output; inside a markdown table cell they would break the row, so every run
 * of whitespace becomes a single space.
 */
function text(expr: string | undefined, prefix: string): string | null {
  if (expr === undefined) return null;
  let out = '';
  for (const part of splitPlus(expr)) {
    const t = part.trim();
    if (t === 'prefix') {
      out += prefix;
      continue;
    }
    const lit = stringLiteral(t);
    if (lit === null) return null;
    out += lit;
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** Split on `+` at nesting depth 0, quote-aware. */
function splitPlus(src: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === '`') {
      i = skipString(src, i);
      continue;
    }
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === '+' && depth === 0) {
      parts.push(src.slice(start, i));
      start = i + 1;
    }
    i++;
  }
  parts.push(src.slice(start));
  return parts;
}

function skipString(src: string, i: number): number {
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

/** A Go string literal's value, or null when the expression is not one. */
function stringLiteral(expr: string): string | null {
  const t = expr.trim();
  // The first quote must also be the last token. Otherwise a Go expression such as
  // `"accepted: " + strings.Join(kinds, " | ") + ""` looks like a quoted string to the
  // fallback decoder below and gets published verbatim in the generated reference.
  if (skipString(t, 0) !== t.length) return null;
  if (t.startsWith('`') && t.endsWith('`') && t.length >= 2) return t.slice(1, -1);
  if (!(t.startsWith('"') && t.endsWith('"') && t.length >= 2)) return null;
  try {
    // Any JSON text that opens and closes with `"` is a JSON string, so this is always a string
    // when the parse succeeds; the check only tells the type system so.
    const parsed: unknown = JSON.parse(t);
    return typeof parsed === 'string' ? parsed : null;
  } catch {
    return t.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"');
  }
}

/**
 * Evaluates default-value expressions against the indexed tree.
 *
 * Nearly every Nitro default is a selector into a package-level defaults struct
 * (`DefaultBatchPosterConfig.MaxDelay`), so the work is: follow the selector to a leaf
 * expression, evaluate it, and format it the way pflag would.
 */
class ValueResolver {
  private readonly dirs: Map<string, GoPackage>;
  private readonly fileImports: Map<string, GoImports>;
  private readonly problems: string[];
  private readonly importCache = new Map<string, GoImports>();

  constructor(
    dirs: Map<string, GoPackage>,
    fileImports: Map<string, GoImports>,
    problems: string[],
  ) {
    this.dirs = dirs;
    this.fileImports = fileImports;
    this.problems = problems;
  }

  /**
   * The string pflag prints for this default, or '' when the value is its type's zero.
   *
   * pflag omits `(default …)` from `--help` for zero values, and the page renders an empty
   * default as a dash, so collapsing zeros here keeps a wall of `false` and `0` out of the
   * table without losing information.
   */
  format(
    expr: string | undefined,
    dir: string,
    type: string,
    label: string,
    bindings: Scope = new Map(),
  ): string {
    if (expr === undefined) return '';
    const value = this.evaluate(expr, dir, new Set(), bindings);
    if (value === null) {
      this.problems.push(`cannot evaluate ${label}: ${oneLine(expr)}`);
      return '';
    }
    return formatValue(value, type);
  }

  /** Evaluate an expression, or null when it is a shape this reader cannot evaluate. */
  evaluate(
    expr: string,
    dir: string,
    seen: Set<string>,
    bindings: Scope = new Map(),
  ): GoValue | null {
    const t = expr.trim();
    if (t === '' || t === 'nil') return { kind: 'nil', value: null };

    // `&DefaultClientConfig` and `*cfg`: the address-of and dereference are noise here, and a
    // pointer to a defaults struct is how several registration functions receive theirs.
    if (t.startsWith('&') || t.startsWith('*'))
      return this.evaluate(t.slice(1), dir, seen, bindings);

    // `^uint64(0)`: Go's bitwise complement, used as an "unset" sentinel. BigInt because the
    // result does not survive a double.
    if (t.startsWith('^')) {
      const inner = this.evaluate(t.slice(1), dir, seen, bindings);
      if (inner === null) return null;
      const n = numeric(inner);
      if (n === null) return null;
      return { kind: 'number', value: (2n ** 64n - 1n) ^ BigInt(Math.trunc(n)) };
    }

    // `append(base, "a", "b")`: go-ethereum's default RPC module lists are built this way.
    if (/^append\s*\(/.test(t) && matchDelim(t, t.indexOf('(')) === t.length - 1) {
      const parts = splitArgs(t.slice(t.indexOf('(') + 1, -1));
      const base = this.evaluate(parts[0], dir, seen, bindings);
      if (base === null) return null;
      const head = base.kind === 'slice' ? base.value : [];
      const tail = allEvaluated(
        parts.slice(1).map((item) => this.evaluate(item, dir, seen, bindings)),
      );
      if (tail === null) return null;
      return { kind: 'slice', value: [...head, ...tail] };
    }

    const str = stringLiteral(t);
    if (str !== null) return { kind: 'string', value: str };

    // Nitro constructs some help text from an accepted-values slice. Evaluate the same small
    // string expression rather than exposing the Go source in the documentation.
    if (/^strings\.Join\s*\(/.test(t) && matchDelim(t, t.indexOf('(')) === t.length - 1) {
      const args = splitArgs(t.slice(t.indexOf('(') + 1, -1));
      if (args.length !== 2) return null;
      const items = this.evaluate(args[0] ?? '', dir, seen, bindings);
      const separator = this.evaluate(args[1] ?? '', dir, seen, bindings);
      if (
        items?.kind !== 'slice' ||
        !items.value.every((item) => item.kind === 'string') ||
        separator?.kind !== 'string'
      ) {
        return null;
      }
      return { kind: 'string', value: items.value.map((item) => item.value).join(separator.value) };
    }

    const stringParts = splitPlus(t);
    if (stringParts.length > 1) {
      const values = allEvaluated(
        stringParts.map((part) => this.evaluate(part, dir, new Set(seen), bindings)),
      );
      if (values?.every((value) => value.kind === 'string')) {
        return { kind: 'string', value: values.map((value) => value.value).join('') };
      }
    }

    if (t === 'true' || t === 'false') return { kind: 'bool', value: t === 'true' };

    // Slice and map literals: `[]string{"a", "b"}`, `[]time.Duration{…}`.
    const slice = /^\[\s*\]\s*[\w.]+\s*\{/.exec(t);
    if (slice) {
      const open = t.indexOf('{');
      const end = matchDelim(t, open);
      if (end === -1) return null;
      const items = allEvaluated(
        splitArgs(t.slice(open + 1, end)).map((item) => this.evaluate(item, dir, seen, bindings)),
      );
      if (items === null) return null;
      return { kind: 'slice', value: items };
    }

    // A conversion such as `uint64(x)` or `time.Duration(0)` is transparent here.
    const cast = /^([\w.]+)\s*\(/.exec(t);
    if (
      cast?.[1] &&
      TRANSPARENT_CASTS.has(cast[1]) &&
      matchDelim(t, t.indexOf('(')) === t.length - 1
    ) {
      return this.evaluate(t.slice(t.indexOf('(') + 1, -1), dir, seen, bindings);
    }

    // Parenthesised expression.
    if (t.startsWith('(') && matchDelim(t, 0) === t.length - 1) {
      return this.evaluate(t.slice(1, -1), dir, seen, bindings);
    }

    const arithmetic = this.arithmetic(t, dir, seen, bindings);
    if (arithmetic) return arithmetic;

    if (
      /^[-+]?(?:0[xXbBoO])?[\da-fA-F_]+$/.test(t) ||
      /^[-+]?[\d_]*\.?[\d_]*(?:[eE][-+]?\d+)?$/.test(t)
    ) {
      const n = Number(t.replace(/_/g, ''));
      if (Number.isFinite(n)) return { kind: 'number', value: n };
    }

    return this.selector(t, dir, seen, bindings);
  }

  /** `a * b`, `a + b`, `a - b`, `a / b` over numbers and durations. */
  arithmetic(expr: string, dir: string, seen: Set<string>, bindings: Scope): GoValue | null {
    // Lowest-precedence operators first, so `a + b * c` splits at the `+`. Byte-size defaults in
    // Nitro are written as shifts (`512 << 10`), which bind tighter than the arithmetic ones.
    for (const op of ['+', '-', '*', '/', '<<', '>>']) {
      const idx = splitOperator(expr, op);
      if (idx === -1) continue;
      const left = this.evaluate(expr.slice(0, idx), dir, seen, bindings);
      const right = this.evaluate(expr.slice(idx + op.length), dir, seen, bindings);
      if (!left || !right) return null;
      const a = numeric(left);
      const b = numeric(right);
      if (a === null || b === null) return null;
      const isDuration = left.kind === 'duration' || right.kind === 'duration';
      const value =
        op === '+'
          ? a + b
          : op === '-'
            ? a - b
            : op === '*'
              ? a * b
              : op === '/'
                ? b === 0
                  ? 0
                  : a / b
                : op === '<<'
                  ? a * 2 ** b
                  : Math.floor(a / 2 ** b);
      return isDuration
        ? { kind: 'duration', value: Math.round(value) }
        : { kind: 'number', value };
    }
    return null;
  }

  /** `Ident`, `Ident.Field.Field`, or `pkg.Ident.Field`. */
  selector(
    expr: string,
    dir: string,
    seen: Set<string>,
    bindings: Scope = new Map(),
  ): GoValue | null {
    const parts = expr.split('.').map((p) => p.trim());
    if (parts.some((p) => !/^\w+$/.test(p))) return null;
    // `split` always yields at least one element, so this never fires; it names the head for the
    // type system.
    const head = parts[0];
    if (head === undefined) return null;

    // A parameter the caller supplied: continue in the caller's package.
    const bound = bindings.get(head);
    if (bound) {
      const substituted = [bound.expr, ...parts.slice(1)].join('.');
      const guard = `bound:${bound.dir}.${substituted}`;
      if (seen.has(guard)) return null;
      seen.add(guard);
      return this.evaluate(substituted, bound.dir, seen, bound.bindings ?? new Map());
    }

    const unit = parts.length >= 2 && head === 'time' ? DURATION_UNITS[parts[1] ?? ''] : undefined;
    if (unit !== undefined) {
      return { kind: 'duration', value: Number(unit) };
    }

    const stdlib = STDLIB_CONSTANTS[expr.trim()];
    if (stdlib !== undefined) return { kind: 'number', value: stdlib };

    // A leading lowercase segment that names an import is a package qualifier.
    const imports = this.importsFor(dir);
    let searchDir = dir;
    let rest = parts;
    if (parts.length >= 2 && imports.has(head)) {
      const target = imports.get(head);
      if (!target) return null;
      searchDir = target;
      rest = parts.slice(1);
    }

    const found = this.lookup(searchDir, rest[0]);
    if (!found) return null;

    const guard = `${found.dir}.${rest.join('.')}`;
    if (seen.has(guard)) return null;
    seen.add(guard);

    let expression = found.entry.expr;
    let currentDir = found.dir;
    for (const field of rest.slice(1)) {
      const next = this.fieldOf(expression, currentDir, field, seen);
      if (next === null) return null;
      if (next === 'zero') return { kind: 'zero', value: null };
      expression = next.expr;
      currentDir = next.dir;
    }
    return this.evaluate(expression, currentDir, seen);
  }

  /**
   * The expression for `field` of a struct-valued expression, `'zero'` when the struct literal
   * simply omits it, or null when the shape is one this reader does not understand.
   *
   * Returning `'zero'` only for a real composite literal is the whole point. Nitro builds some
   * defaults with an immediately-invoked closure that copies a base struct and tweaks fields;
   * treating that closure's braces as a struct literal made every one of its fields look like a
   * deliberate zero, which is how a page of confidently wrong defaults gets published.
   */
  fieldOf(expression: string, dir: string, field: string, seen: Set<string>): FieldResult {
    const t = expression.trim();

    // func() T { cfg := Base; cfg.Field = v; return cfg }()
    const closure = /^func\s*\(\s*\)\s*[\w.[\]*]*\s*\{/.exec(t);
    if (closure) {
      const open = t.indexOf('{');
      const close = matchDelim(t, open);
      if (close === -1) return null;
      const body = t.slice(open + 1, close);
      const returned = /\breturn\s+(\w+)/.exec(body)?.[1];
      if (!returned) return null;

      const assigned = [
        ...body.matchAll(new RegExp(`(?:^|\\n)\\s*${returned}\\.(\\w+)\\s*=\\s*([^\\n]+)`, 'g')),
      ].filter((m) => m[1] === field);
      const last = assigned.at(-1);
      if (last?.[2] !== undefined) return { expr: last[2].trim(), dir };

      const base = new RegExp(`(?:^|\\n)\\s*${returned}\\s*:?=\\s*([^\\n]+)`).exec(body);
      if (base?.[1] === undefined) return null;
      return this.fieldOf(base[1].trim(), dir, field, seen);
    }

    // A composite literal: an absent field is Go's zero value.
    if (/^[\w.[\]*]*\{/.test(t)) {
      const value = literalFields(t).get(field);
      return value !== undefined ? { expr: value, dir } : 'zero';
    }

    // An identifier or selector: resolve it, then ask the same question of what it names.
    if (/^[&*]/.test(t)) return this.fieldOf(t.slice(1), dir, field, seen);
    const target = this.resolveIndirect(t, dir, seen);
    if (target) return this.fieldOf(target.expr, target.dir, field, seen);

    const nested = this.selector(t, dir, seen);
    if (nested && (nested.kind === 'zero' || nested.kind === 'nil')) return 'zero';
    return null;
  }

  /**
   * A flag's usage string. Reports rather than blanks when it cannot be read: an empty
   * Description cell is indistinguishable from a flag Nitro genuinely left undocumented.
   */
  describe(
    expr: string | undefined,
    dir: string,
    prefix: string,
    bindings: Scope,
    label: string,
  ): string {
    if (expr === undefined) return '';
    const parts: string[] = [];
    for (const part of splitPlus(expr)) {
      const t = part.trim();
      if (t === 'prefix') {
        parts.push(prefix);
        continue;
      }
      const lit = stringLiteral(t);
      if (lit !== null) {
        parts.push(lit);
        continue;
      }
      const formatted = this.sprintf(t, dir, prefix, bindings);
      if (formatted !== null) {
        parts.push(formatted);
        continue;
      }
      const value = this.evaluate(t, dir, new Set(), bindings);
      if (value && (value.kind === 'string' || value.kind === 'number')) {
        parts.push(String(value.value));
        continue;
      }
      this.problems.push(`cannot read ${label}: ${oneLine(expr)}`);
      return '';
    }
    return parts.join('').replace(/\s+/g, ' ').trim();
  }

  /** `fmt.Sprintf(format, …)`, supporting the verbs Nitro's usage strings actually use. */
  sprintf(expr: string, dir: string, prefix: string, bindings: Scope): string | null {
    const t = expr.trim();
    if (!/^fmt\.Sprintf\s*\(/.test(t)) return null;
    const open = t.indexOf('(');
    if (matchDelim(t, open) !== t.length - 1) return null;

    const args = splitArgs(t.slice(open + 1, -1));
    const format = stringLiteral(args[0] ?? '');
    if (format === null) return null;

    const values: Array<GoValue & { kind: 'string' | 'number' | 'bool' }> = [];
    for (const arg of args.slice(1)) {
      const v = this.evaluate(arg, dir, new Set(), bindings);
      if (v === null || (v.kind !== 'string' && v.kind !== 'number' && v.kind !== 'bool')) {
        return null;
      }
      values.push(v);
    }
    let i = 0;
    return format.replace(/%(%|[sdvqtf])/g, (match, verb: string) => {
      if (verb === '%') return '%';
      const value = values[i++];
      if (value === undefined) return match;
      return verb === 'q' ? JSON.stringify(String(value.value)) : String(value.value);
    });
  }

  /**
   * When a struct field's value is itself a bare identifier pointing at another defaults var
   * (`Dangerous: DefaultDangerousConfig`), follow it so later field lookups keep working.
   */
  resolveIndirect(
    expr: string,
    dir: string,
    seen: Set<string>,
  ): { expr: string; dir: string } | null {
    const t = expr.trim();
    if (!/^[\w.]+$/.test(t) || t.includes('(')) return null;
    const parts = t.split('.');
    const imports = this.importsFor(dir);
    let searchDir = dir;
    let rest = parts;
    const head = parts[0] ?? '';
    if (parts.length >= 2 && imports.has(head)) {
      const target = imports.get(head);
      if (!target) return null;
      searchDir = target;
      rest = parts.slice(1);
    }
    const name = rest[0];
    if (rest.length !== 1 || name === undefined) return null;
    const found = this.lookup(searchDir, name);
    if (!found || !found.entry.expr.includes('{')) return null;
    if (seen.has(`indirect:${found.dir}.${name}`)) return null;
    seen.add(`indirect:${found.dir}.${name}`);
    return { expr: found.entry.expr, dir: found.dir };
  }

  lookup(dir: string, name: string | undefined): { dir: string; entry: GoAssignment } | null {
    const pkg = this.dirs.get(dir);
    if (!pkg || name === undefined) return null;
    const entry = pkg.vars.get(name) ?? pkg.consts.get(name);
    return entry ? { dir, entry } : null;
  }

  /** Union of the import maps of every file in a directory; aliases are consistent in practice. */
  importsFor(dir: string): GoImports {
    const cached = this.importCache.get(dir);
    if (cached) return cached;
    const merged: GoImports = new Map();
    const entry = this.dirs.get(dir);
    const files = new Set(
      [...(entry?.vars.values() ?? []), ...(entry?.consts.values() ?? [])].map((v) => v.file),
    );
    for (const fn of entry?.funcs.values() ?? []) files.add(fn.file);
    for (const file of files) {
      for (const [alias, target] of this.fileImports.get(file) ?? []) {
        if (!merged.has(alias)) merged.set(alias, target);
      }
    }
    this.importCache.set(dir, merged);
    return merged;
  }
}

/** Index of the last occurrence of a binary operator at depth 0, so evaluation is left-assoc. */
function splitOperator(src: string, op: string): number {
  let depth = 0;
  let i = 0;
  let last = -1;
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === '`') {
      i = skipString(src, i);
      continue;
    }
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    // `i > 0` keeps a leading sign from reading as a binary operator.
    else if (depth === 0 && i > 0 && src.startsWith(op, i)) {
      last = i;
      i += op.length;
      continue;
    }
    i++;
  }
  return last;
}

function numeric(value: GoValue): number | null {
  if (value.kind === 'number' || value.kind === 'duration') {
    return typeof value.value === 'bigint' ? Number(value.value) : value.value;
  }
  if (value.kind === 'zero' || value.kind === 'nil') return 0;
  return null;
}

/** Format an evaluated value the way pflag's `Value.String()` would, '' for a zero value. */
export function formatValue(value: GoValue, type: string): string {
  if (value.kind === 'nil' || value.kind === 'zero') return '';

  if (type === 'duration') {
    const ns = numeric(value);
    return ns ? formatDuration(ns) : '';
  }
  if (type === 'bool') return value.value === true ? 'true' : '';
  if (value.kind === 'slice') {
    if (value.value.length === 0) return '';
    const items = value.value.map((item) =>
      item.kind === 'duration' ? formatDuration(item.value) : String(item.value ?? ''),
    );
    return `[${items.join(',')}]`;
  }
  if (value.kind === 'string') return value.value;
  if (value.kind === 'number') {
    if (value.value === 0 || value.value === 0n) return '';
    return formatNumber(value.value);
  }
  if (value.kind === 'bool') return value.value ? 'true' : '';
  return '';
}

/** Go prints floats with `strconv.FormatFloat(f, 'g', -1, 64)`; integers print plainly. */
function formatNumber(n: number | bigint): string {
  if (typeof n === 'bigint') return String(n);
  if (Number.isInteger(n) && Math.abs(n) < 1e21) return String(n);
  const exponent = Math.floor(Math.log10(Math.abs(n)));
  if (exponent < -4 || exponent >= 21) {
    return n.toExponential().replace(/e([+-])(\d)$/, 'e$10$2');
  }
  return String(n);
}

/**
 * Go's `time.Duration.String()`: sub-second durations use ns/µs/ms, anything longer is
 * `1h2m3s` with every larger unit present once one is (`30m0s`, not `30m`).
 */
export function formatDuration(ns: number): string {
  if (ns === 0) return '0s';
  const sign = ns < 0 ? '-' : '';
  let n = Math.abs(ns);

  if (n < 1000) return `${sign}${trim(n)}ns`;
  if (n < 1e6) return `${sign}${trim(n / 1000)}µs`;
  if (n < 1e9) return `${sign}${trim(n / 1e6)}ms`;

  const hours = Math.floor(n / 3.6e12);
  n -= hours * 3.6e12;
  const minutes = Math.floor(n / 6e10);
  n -= minutes * 6e10;
  const seconds = n / 1e9;

  let out = `${trim(seconds)}s`;
  if (hours || minutes) out = `${minutes}m${out}`;
  if (hours) out = `${hours}h${out}`;
  return sign + out;
}

/** Drop a trailing `.0…` the way Go's duration formatter does. */
function trim(value: number): string {
  return String(Number(value.toFixed(9)));
}

function oneLine(expr: string): string {
  return expr.replace(/\s+/g, ' ').trim().slice(0, 120);
}
