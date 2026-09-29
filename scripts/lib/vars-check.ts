/**
 * The variable-reference scan behind `scripts/vars-check.ts`, on whole-file text so a `<Var>` tag
 * wrapped across lines is still read. Every `<Var name="…">` and `{var:name}` must name a key in
 * `content/vars.json`; a missing key renders the literal string `undefined`.
 */
import { VAR_PLACEHOLDER } from '../../lib/var-links.ts';

/** One variable reference. `name` is `undefined` for a `<Var>` with no static `name`. */
export interface VarReference {
  line: number;
  name: string | undefined;
}

const lineAt = (source: string, index: number): number => source.slice(0, index).split('\n').length;

/** Every `<Var>` tag and `{var:name}` placeholder in a source, with the line it starts on. */
export function varReferences(source: string): VarReference[] {
  const refs: VarReference[] = [];
  for (const m of source.matchAll(/<Var\b([^>]*)>/g)) {
    refs.push({
      line: lineAt(source, m.index),
      name: /\bname\s*=\s*["']([^"']+)["']/.exec(m[1])?.[1],
    });
  }
  for (const m of source.matchAll(VAR_PLACEHOLDER)) {
    refs.push({ line: lineAt(source, m.index), name: m[1] });
  }
  return refs.sort((a, b) => a.line - b.line);
}

/** `rel:line  problem` for each reference in `source` that does not resolve against `vars`. */
export function checkVarReferences(
  rel: string,
  source: string,
  vars: Readonly<Record<string, unknown>>,
): string[] {
  const errors: string[] = [];
  for (const { line, name } of varReferences(source)) {
    if (name === undefined) errors.push(`${rel}:${line}  <Var> without a static name`);
    else if (!Object.hasOwn(vars, name)) {
      errors.push(`${rel}:${line}  "${name}" is not a key in content/vars.json`);
    }
  }
  return errors;
}
