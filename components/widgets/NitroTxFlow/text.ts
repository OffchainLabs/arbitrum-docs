const VAR_TOKEN = /\{var:([^}]+)\}/g;

/** Replaces each `{var:name}` in flow text with `values[name]`. Throws on a name it lacks. */
export function fillVars(text: string, values: Record<string, unknown>): string {
  return text.replace(VAR_TOKEN, (_token, name: string) => {
    if (!(name in values)) throw new Error(`Unknown var "${name}" in flow text`);
    return String(values[name]);
  });
}
