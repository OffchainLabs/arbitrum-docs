/**
 * Shared helpers for the doc reference generators (precompile tables, contract
 * addresses, glossary). Centralizes the three things every generator needs:
 * deterministic Prettier-formatted output, a `--check` mode for CI, and uniform
 * success/failure handling.
 */

import fs from 'fs';
import path from 'path';
import prettier from 'prettier';

/** Thrown by {@link writeOrCheck} in check mode when the on-disk file is stale. */
export class StaleFileError extends Error {
  constructor(filePath: string) {
    super(
      `${path.relative(process.cwd(), filePath)} is out of date. ` +
        `Run the generator without --check and commit the result.`,
    );
    this.name = 'StaleFileError';
  }
}

/** True when the script was invoked with a `--check` flag. */
export const isCheckMode = (): boolean => process.argv.includes('--check');

/**
 * Formats `content` with the repo's Prettier config for `filePath`, then either
 * writes it (default) or, in check mode, compares it against the file on disk
 * and throws {@link StaleFileError} if they differ. Prettier makes the output
 * deterministic and byte-identical to what the pre-commit hook would produce,
 * which is what makes check mode reliable.
 */
export async function writeOrCheck(
  filePath: string,
  content: string,
  { check }: { check: boolean },
): Promise<void> {
  const config = await prettier.resolveConfig(filePath);
  // prettier v2's format() is synchronous; resolveConfig() is not.
  const formatted = prettier.format(content, { ...config, filepath: filePath });

  if (check) {
    const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
    if (current !== formatted) throw new StaleFileError(filePath);
    return;
  }

  fs.writeFileSync(filePath, formatted);
  console.log(`Wrote ${path.relative(process.cwd(), filePath)}`);
}

/**
 * Runs a generator's `main` with uniform exit handling: a {@link StaleFileError}
 * prints a concise message, any other error prints in full, and the process
 * exits 0 on success or 1 on failure.
 */
export function runScript(main: () => Promise<void>): void {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err instanceof StaleFileError ? err.message : err);
      process.exit(1);
    });
}
