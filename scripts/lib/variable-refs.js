'use strict';

/**
 * Single source of truth for the embedded documentation variable syntax
 * `@@name=value@@`. Capture group 1 is the variable name, group 2 is the inline
 * value.
 *
 * Consumed by both scripts/markdown-preprocessor.js (build-time resolution) and
 * scripts/update-variable-references.ts (writing fresh values back into docs).
 * Kept as CommonJS because docusaurus.config.js `require`s the preprocessor at
 * config-load time, before any TypeScript transform is available.
 */
const VARIABLE_REF_SOURCE = '@@\\s*([a-zA-Z0-9_-]+)=([^@]+)@@';

/** Returns a fresh global RegExp so callers never share `lastIndex` state. */
const createVariableRefPattern = () => new RegExp(VARIABLE_REF_SOURCE, 'g');

module.exports = { VARIABLE_REF_SOURCE, createVariableRefPattern };
