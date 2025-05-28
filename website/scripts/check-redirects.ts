import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';

interface Redirect {
  source: string;
  destination: string;
  permanent: boolean;
}

interface VercelConfig {
  redirects: Redirect[];
}

interface MovedFile {
  oldPath: string;
  newPath: string;
}

export interface RedirectCheckResult {
  hasMissingRedirects: boolean;
  missingRedirects: Array<{
    from: string;
    to: string;
  }>;
  error?: string;
}

interface RedirectCheckerOptions {
  vercelJsonPath?: string;
  mode: 'commit-hook' | 'ci';
  gitCommand?: string;
}

/**
 * RedirectChecker manages URL redirects in vercel.json when markdown files are moved or renamed.
 * It ensures that existing links to documentation pages remain accessible after restructuring.
 *
 * Key features:
 * 1. Creates vercel.json if it doesn't exist and requires review
 * 2. Detects unstaged changes to vercel.json and prevents further processing
 * 3. Uses git to detect moved/renamed .md(x) files in staged changes
 * 4. Automatically adds non-permanent redirects for moved files
 * 5. Requires manual review and staging of any changes to vercel.json
 *
 * The workflow:
 * 1. Checks/creates vercel.json and validates its state
 * 2. Detects file moves using git diff on staged changes
 * 3. For each moved markdown file:
 *    - Converts file paths to URL paths (stripping extensions and prefixes)
 *    - Checks for existing matching redirects
 *    - Adds new redirects if needed (always non-permanent)
 * 4. If redirects are added:
 *    - Updates vercel.json
 *    - Requires manual review and staging before continuing
 *
 * This ensures a controlled process for maintaining URL backwards compatibility
 * while requiring human oversight of redirect changes.
 */
export class RedirectChecker {
  private vercelJsonPath: string;
  private mode: 'commit-hook' | 'ci';
  private gitCommand?: string;

  constructor(options: RedirectCheckerOptions) {
    this.vercelJsonPath = options.vercelJsonPath || resolve(process.cwd(), '..', 'vercel.json');
    this.mode = options.mode;
    this.gitCommand = options.gitCommand;
  }

  /**
   * Sorts the redirects array alphabetically by source, then by destination.
   */
  private sortRedirects(redirects: Redirect[]): void {
    redirects.sort((a, b) => {
      const sourceA = a.source.toLowerCase();
      const sourceB = b.source.toLowerCase();
      if (sourceA < sourceB) return -1;
      if (sourceA > sourceB) return 1;

      const destA = a.destination.toLowerCase();
      const destB = b.destination.toLowerCase();
      if (destA < destB) return -1;
      if (destA > destB) return 1;

      return 0;
    });
  }

  /**
   * Normalize a URL by removing parentheses, trailing slashes, and ensuring single leading slash
   */
  private normalizeUrl(url: string): string {
    return (
      '/' +
      url
        .replace(/[()]/g, '') // Remove parentheses
        .replace(/^\/+/, '') // Remove leading slashes before adding a single one
        .replace(/\/+/g, '/') // Replace multiple slashes with single slash
        .replace(/\/\?$/, '') // Remove optional trailing slash
        .replace(/\/$/, '')
    ); // Remove trailing slash
  }

  /**
   * Get moved files from git diff based on mode
   */
  private getMovedFiles(): MovedFile[] {
    const defaultCommands = {
      'commit-hook': 'git diff --cached --name-status -M100% --find-renames',
      'ci': 'git diff --name-status --diff-filter=R HEAD~1 HEAD',
    };

    const command = this.gitCommand || defaultCommands[this.mode];

    try {
      const output = execSync(command, {
        encoding: 'utf8',
        cwd: dirname(this.vercelJsonPath),
      });
      return !output.trim()
        ? []
        : output
            .trim()
            .split('\n')
            .map((line) => {
              const match = line.match(/^R\d+\s+(.+?)\s+(.+?)$/);
              if (match && (match[1].endsWith('.md') || match[1].endsWith('.mdx'))) {
                return {
                  oldPath: match[1].trim(),
                  newPath: match[2].trim(),
                };
              }
              return null;
            })
            .filter((file): file is MovedFile => file !== null);
    } catch (error) {
      return [];
    }
  }

  /**
   * Load and parse the vercel.json configuration file
   */
  private loadVercelConfig(): VercelConfig {
    if (!existsSync(this.vercelJsonPath)) {
      if (this.mode === 'commit-hook') {
        const newConfig: VercelConfig = { redirects: [] };
        this.sortRedirects(newConfig.redirects);
        writeFileSync(this.vercelJsonPath, JSON.stringify(newConfig, null, 2), 'utf8');
        throw new Error(
          'vercel.json was created. Please review and stage the file before continuing.',
        );
      } else {
        // ci mode
        throw new Error(`vercel.json not found at ${this.vercelJsonPath}`);
      }
    }

    const originalFileContent = readFileSync(this.vercelJsonPath, 'utf8');
    let config: VercelConfig;
    try {
      config = JSON.parse(originalFileContent) as VercelConfig;
    } catch (e) {
      throw new Error(
        `Error parsing ${this.vercelJsonPath}: ${
          (e as Error).message
        }. Please fix the JSON format and try again.`,
      );
    }

    if (!config.redirects || !Array.isArray(config.redirects)) {
      config.redirects = []; // Ensure redirects array exists and is an array for safety
    }

    // Sort the in-memory representation
    this.sortRedirects(config.redirects);

    const newFileContent = JSON.stringify(config, null, 2);

    // If in commit-hook mode and the content changed due to sorting or formatting
    if (this.mode === 'commit-hook' && originalFileContent !== newFileContent) {
      writeFileSync(this.vercelJsonPath, newFileContent, 'utf8');
      throw new Error(
        'vercel.json was re-sorted and/or re-formatted. Please review and stage the changes before continuing.',
      );
    }

    // In CI mode, if the file was not sorted/formatted correctly, it's an error.
    if (this.mode === 'ci' && originalFileContent !== newFileContent) {
      throw new Error(
        `vercel.json is not correctly sorted/formatted. Please run the pre-commit hook locally to fix and commit the changes.`,
      );
    }

    return config; // Return the (potentially modified in memory, and possibly written to disk) config
  }

  /**
   * Convert a file path to its corresponding URL path
   */
  private getUrlFromPath(filePath: string): string {
    // Remove the file extension and convert to URL path
    let urlPath = filePath
      .replace(/^(pages|arbitrum-docs)\//, '') // Remove leading directory
      .replace(/\d{2,3}-/g, '') // Remove leading numbers like '01-', '02-', etc.
      .replace(/\.mdx?$/, '') // Remove .md or .mdx extension
      .replace(/\/index$/, ''); // Convert /index to / for cleaner URLs

    // Handle empty path (root index)
    if (!urlPath || urlPath === 'index') {
      return '/';
    }

    // Format URL to match existing patterns
    return `/(${urlPath}/?)`; // Add parentheses and optional trailing slash
  }

  /**
   * Check if a redirect exists in the config
   */
  private hasRedirect(config: VercelConfig, oldUrl: string, newUrl: string): boolean {
    return config.redirects.some((redirect) => {
      const normalizedSource = this.normalizeUrl(redirect.source);
      const normalizedOldUrl = this.normalizeUrl(oldUrl);
      const normalizedNewUrl = this.normalizeUrl(redirect.destination);
      const normalizedDestination = this.normalizeUrl(newUrl);

      return normalizedSource === normalizedOldUrl && normalizedNewUrl === normalizedDestination;
    });
  }

  /**
   * Add a new redirect to the config
   */
  private addRedirect(oldUrl: string, newUrl: string, config: VercelConfig): void {
    const normalizedOldUrl = this.normalizeUrl(oldUrl);
    const normalizedNewUrl = this.normalizeUrl(newUrl);

    // Only add redirect if the source and destination are different after normalization
    if (normalizedOldUrl !== normalizedNewUrl) {
      config.redirects.push({
        source: oldUrl, // Store the original, pre-normalized URL as vercel expects it
        destination: newUrl, // Store the original, pre-normalized URL
        permanent: false,
      });
      this.sortRedirects(config.redirects); // Sort after adding a new redirect
      writeFileSync(this.vercelJsonPath, JSON.stringify(config, null, 2), 'utf8');
    }
  }

  /**
   * Check for missing redirects and optionally update vercel.json
   */
  public async check(): Promise<RedirectCheckResult> {
    try {
      // In commit-hook mode, check for unstaged changes
      if (this.mode === 'commit-hook') {
        const cwd = dirname(this.vercelJsonPath);
        const initialStatus = execSync('git status --porcelain', { cwd, encoding: 'utf8' });
        const vercelJsonStatus = initialStatus
          .split('\n')
          .find((line) => line.includes(basename(this.vercelJsonPath)));

        if (
          vercelJsonStatus &&
          (vercelJsonStatus.startsWith(' M') || vercelJsonStatus.startsWith('??'))
        ) {
          throw new Error(
            'Unstaged changes to vercel.json. Please review and stage the changes before continuing.',
          );
        }
      }

      const config = this.loadVercelConfig();
      const movedFiles = this.getMovedFiles();

      if (movedFiles.length === 0) {
        return {
          hasMissingRedirects: false,
          missingRedirects: [],
        };
      }

      const missingRedirects: Array<{ from: string; to: string }> = [];
      let redirectsAdded = false;

      for (const { oldPath, newPath } of movedFiles) {
        const oldUrl = this.getUrlFromPath(oldPath);
        const newUrl = this.getUrlFromPath(newPath);

        if (newUrl.includes('website/archive')) {
          // Skip archived files
          continue;
        }

        if (!this.hasRedirect(config, oldUrl, newUrl)) {
          missingRedirects.push({ from: oldUrl, to: newUrl });

          // Only add redirects in commit-hook mode
          if (this.mode === 'commit-hook') {
            const countBeforeAdd = config.redirects.length;
            this.addRedirect(oldUrl, newUrl, config); // addRedirect might not add if old/new are same
            if (config.redirects.length > countBeforeAdd) {
              redirectsAdded = true;
            }
          }
        }
      }

      if (this.mode === 'commit-hook' && redirectsAdded) {
        throw new Error(
          'New redirects added to vercel.json. Please review and stage the changes before continuing.',
        );
      }

      // Determine final hasMissingRedirects status
      let finalHasMissingRedirects = false;
      if (this.mode === 'ci') {
        finalHasMissingRedirects = missingRedirects.length > 0;
        // In CI, also filter out self-redirects from the reported missingRedirects array
        // as these aren't actionable and shouldn't fail CI if they are the only thing found.
        const actionableMissingRedirects = missingRedirects.filter((r) => {
          return this.normalizeUrl(r.from) !== this.normalizeUrl(r.to);
        });
        finalHasMissingRedirects = actionableMissingRedirects.length > 0;
        // Return the actionable list for CI to report
        return {
          hasMissingRedirects: finalHasMissingRedirects,
          missingRedirects: actionableMissingRedirects,
        };
      } else {
        // commit-hook
        finalHasMissingRedirects = redirectsAdded;
      }

      return {
        hasMissingRedirects: finalHasMissingRedirects,
        missingRedirects, // In commit-hook, this list might contain self-redirects, but hasMissingRedirects guides action
      };
    } catch (error) {
      return {
        hasMissingRedirects: false,
        missingRedirects: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// CLI entry point
if (require.main === module) {
  const mode = process.argv.includes('--ci') ? 'ci' : 'commit-hook';
  const checker = new RedirectChecker({ mode });

  checker.check().then((result) => {
    if (result.error) {
      console.error('Error:', result.error);
      process.exit(1);
    }

    if (result.hasMissingRedirects) {
      console.error('❌ Missing redirects found:');
      for (const redirect of result.missingRedirects) {
        console.error(`  From: ${redirect.from}`);
        console.error(`  To:   ${redirect.to}`);
      }
      process.exit(1);
    }

    if (mode === 'ci') {
      console.log('✅ All necessary redirects are in place');
    }
    process.exit(0);
  });
}
