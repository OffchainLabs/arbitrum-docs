import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { access } from 'fs/promises';

interface Redirect {
  source: string;
  destination: string;
  permanent: boolean;
}

interface VercelConfig {
  redirects: Redirect[];
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
  private gitDiffCmd: string;

  constructor(vercelJsonPath?: string, gitDiffCmd = 'git diff --cached --name-status -M100% --find-renames') {
    this.vercelJsonPath = vercelJsonPath || resolve(process.cwd(), '..', 'vercel.json');
    this.gitDiffCmd = gitDiffCmd;
  }

  private loadVercelConfig(): VercelConfig {
    if (!existsSync(this.vercelJsonPath)) {
      throw new Error(`vercel.json not found at ${this.vercelJsonPath}`);
    }

    const content = readFileSync(this.vercelJsonPath, 'utf8');
    const config = JSON.parse(content) as VercelConfig;
    if (!config.redirects) {
      config.redirects = [];
    }
    return config;
  }

  private getMovedFiles(): { oldPath: string; newPath: string }[] {
    let output: string;
    try {
      output = execSync(this.gitDiffCmd, { 
        encoding: 'utf8',
        cwd: dirname(this.vercelJsonPath)
      });
      console.log('Git diff output:', output);
    } catch (error) {
      // If the command fails (e.g., no previous commit), return empty array
      console.error('Git diff error:', error);
      return [];
    }

    if (!output.trim()) {
      return [];
    }

    const movedFiles: { oldPath: string; newPath: string }[] = [];
    const lines = output.trim().split('\n');

    for (const line of lines) {
      console.log('Processing line:', line);
      const match = line.match(/^R\d+\s+(.+?)\s+(.+?)$/);
      if (match) {
        const [, oldPath, newPath] = match;
        console.log('Found match:', { oldPath, newPath });
        // Check if the file is a markdown file
        if (oldPath.endsWith('.md') || oldPath.endsWith('.mdx')) {
          movedFiles.push({
            oldPath: oldPath.trim(),
            newPath: newPath.trim()
          });
        }
      }
    }

    console.log('Moved files:', movedFiles);
    return movedFiles;
  }

  private convertToUrl(filePath: string): string {
    // Remove the file extension and any directory prefix
    return '/' + filePath
      .replace(/^.*?\//, '') // Remove everything up to the first slash
      .replace(/\.(md|mdx)$/, '');
  }

  private hasRedirect(config: VercelConfig, oldUrl: string, newUrl: string): boolean {
    return config.redirects.some(
      redirect => redirect.source === oldUrl && redirect.destination === newUrl
    );
  }

  private updateVercelConfig(oldUrl: string, newUrl: string, config: VercelConfig): void {
    const newRedirect = {
      source: oldUrl,
      destination: newUrl,
      permanent: false
    };
    config.redirects.push(newRedirect);
    writeFileSync(this.vercelJsonPath, JSON.stringify(config, null, 2), 'utf8');
  }

  public async check(): Promise<boolean> {
    // Create vercel.json if it doesn't exist
    if (!existsSync(this.vercelJsonPath)) {
      writeFileSync(this.vercelJsonPath, JSON.stringify({ redirects: [] }, null, 2));
      throw new Error('vercel.json was created. Please review and stage the file before continuing.');
    }

    // Check for unstaged changes to vercel.json
    const cwd = dirname(this.vercelJsonPath);
    console.log('Current working directory:', cwd);
    const initialStatus = execSync('git status --porcelain', { cwd, encoding: 'utf8' });
    console.log('Git status output:', initialStatus);
    const vercelJsonStatus = initialStatus.split('\n').find(line => line.includes(basename(this.vercelJsonPath)));
    console.log('vercel.json status:', vercelJsonStatus);
    if (vercelJsonStatus && (vercelJsonStatus.startsWith(' M') || vercelJsonStatus.startsWith('??'))) {
      throw new Error('Unstaged changes to vercel.json. Please review and stage the changes before continuing.');
    }

    // Get moved files
    const movedFiles = await this.getMovedFiles();
    if (movedFiles.length === 0) {
      return true;
    }

    // Read vercel.json
    const vercelJson = JSON.parse(readFileSync(this.vercelJsonPath, 'utf8'));
    if (!vercelJson.redirects) {
      vercelJson.redirects = [];
    }

    // Add new redirects
    let redirectsAdded = false;
    for (const { oldPath, newPath } of movedFiles) {
      const oldUrl = this.getUrlFromPath(oldPath);
      const newUrl = this.getUrlFromPath(newPath);

      // Check if redirect already exists
      const existingRedirect = vercelJson.redirects.find(
        (r: any) => r.source === oldUrl && r.destination === newUrl
      );

      if (!existingRedirect) {
        vercelJson.redirects.push({
          source: oldUrl,
          destination: newUrl,
          permanent: false, // Default to non-permanent redirects
        });
        console.log(`Added redirect: ${oldUrl} -> ${newUrl}`);
        redirectsAdded = true;
      }
    }

    if (redirectsAdded) {
      // Write changes to vercel.json
      writeFileSync(this.vercelJsonPath, JSON.stringify(vercelJson, null, 2));
      throw new Error('New redirects added to vercel.json. Please review and stage the changes before continuing.');
    }

    return true;
  }

  private getUrlFromPath(filePath: string): string {
    // Remove the file extension and convert to URL path
    const urlPath = filePath
      .replace(/^(pages|arbitrum-docs)\//, '') // Remove leading directory
      .replace(/\.mdx?$/, ''); // Remove .md or .mdx extension
    return '/' + urlPath;
  }
}

if (require.main === module) {
  const checker = new RedirectChecker();
  checker.check().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
} 