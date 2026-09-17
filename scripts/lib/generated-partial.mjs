/**
 * Shared helpers for the generated-content scripts (precompile tables, version pins).
 *
 * Centralizes the three things every generator needs: deterministic Prettier-formatted
 * output, a `--check` mode for drift detection, and uniform success/failure handling.
 *
 * Ported from arbitrum-docs `scripts/lib/generated-partial.ts`.
 */
import fs from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';

/** Thrown by {@link writeOrCheck} in check mode when the on-disk file is stale. */
export class StaleFileError extends Error {
  constructor(filePath) {
    super(
      `${path.relative(process.cwd(), filePath)} is out of date. ` +
        `Run the generator without --check and commit the result.`,
    );
    this.name = 'StaleFileError';
  }
}

/** True when the script was invoked with a `--check` flag. */
export const isCheckMode = () => process.argv.includes('--check');

/**
 * Format `content` with Prettier, then either write it (default) or, in check mode,
 * compare against the file on disk and throw {@link StaleFileError} if they differ.
 * Prettier is what makes check mode reliable — it turns the generator's loose template
 * whitespace into one canonical form.
 *
 * `overrides` is merged over the resolved repo config. Callers writing `.mdx` MUST pass
 * the generated-MDX options (see MDX_FORMAT in generate-precompile-tables.mjs): repo-wide
 * Prettier deliberately skips `**\/*.mdx` via .prettierignore, which the programmatic API
 * does not honour, so a generator that inherited the default config would reformat MDX in
 * a way `pnpm format:check` never asked for.
 *
 * @returns {Promise<boolean>} true when the file was written and its content changed.
 */
export async function writeOrCheck(filePath, content, { check, overrides = {} }) {
  const config = await prettier.resolveConfig(filePath);
  const formatted = await prettier.format(content, { ...config, filepath: filePath, ...overrides });
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

  if (check) {
    if (current !== formatted) throw new StaleFileError(filePath);
    return false;
  }

  if (current === formatted) return false;

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, formatted);
  console.log(`wrote ${path.relative(process.cwd(), filePath)}`);
  return true;
}

/**
 * Append a `name=value` pair to the GitHub Actions step-output file. No-op outside
 * Actions, where GITHUB_OUTPUT is unset — so local runs behave identically minus the
 * output plumbing.
 */
export function setOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (!outputFile) return;
  fs.appendFileSync(outputFile, `${name}=${value}\n`);
}

/**
 * Run a generator's `main` with uniform exit handling: a {@link StaleFileError} prints a
 * concise message, any other error prints in full, exit 0 on success and 1 on failure.
 */
export function runScript(main) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err instanceof StaleFileError ? err.message : err);
      process.exit(1);
    });
}
