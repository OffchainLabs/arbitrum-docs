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

/** The exported method names on `receiver`, in source order. go-ethereum's RPC server serves each. */
export function goExportedMethods(source: string, receiver: string): string[] {
  const pattern = new RegExp(`^func \\(\\w+ \\*?${receiver}\\) ([A-Z]\\w*)\\(`, 'gm');
  return [...source.matchAll(pattern)].map((match) => match[1] as string);
}

/**
 * Compares the JSON-RPC methods `found` in Nitro with the reference. One line per method that the
 * reference neither documents nor leaves out on purpose, and per entry that Nitro no longer has.
 */
export function methodInventoryProblems(
  found: Set<string>,
  documented: Set<string>,
  undocumented: Set<string>,
): string[] {
  const problems: string[] = [];
  for (const id of found) {
    if (!documented.has(id) && !undocumented.has(id)) {
      problems.push(`${id} is new: document it in the spec, or add it to UNDOCUMENTED`);
    }
  }
  for (const id of [...documented, ...undocumented]) {
    if (!found.has(id)) problems.push(`${id} is gone: remove it from METHODS or UNDOCUMENTED`);
  }
  return problems;
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
