/** Type declarations for the CommonJS module scripts/lib/variable-refs.js. */

/** Regex source for the `@@name=value@@` variable syntax (group 1: name, group 2: value). */
export const VARIABLE_REF_SOURCE: string;

/** Returns a fresh global RegExp matching `@@name=value@@`. */
export function createVariableRefPattern(): RegExp;
