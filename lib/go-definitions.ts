/**
 * Copies Go declarations out of gofmt-formatted source, for the "Go definition" panel of the
 * JSON-RPC reference. Throws when a declaration is missing, so a renamed method fails the run.
 */

/** The signature of method `name` on `receiver`, without its body. */
export function goMethodSignature(source: string, receiver: string, name: string): string {
  const pattern = new RegExp(`^func \\(\\w+ \\*?${receiver}\\) ${name}\\(.*\\{$`, 'm');
  const match = pattern.exec(source);
  if (!match) throw new Error(`no method ${receiver}.${name} in the Go source`);
  return match[0].replace(/ \{$/, '');
}

/** The full `type <name> struct { … }` declaration. */
export function goStructType(source: string, name: string): string {
  const start = new RegExp(`^type ${name} struct \\{$`, 'm').exec(source);
  if (!start) throw new Error(`no struct type ${name} in the Go source`);
  const end = source.indexOf('\n}', start.index);
  if (end === -1) throw new Error(`struct type ${name} has no closing brace`);
  return source.slice(start.index, end + 2);
}

/** The 1-based line of the first occurrence of `text` in `source`. */
export function lineOf(source: string, text: string): number {
  const index = source.indexOf(text);
  if (index === -1) throw new Error(`text not found in the Go source: ${text.slice(0, 60)}`);
  return source.slice(0, index).split('\n').length;
}
