import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RedirectChecker, type RedirectCheckResult } from './check-redirects.js';

describe('RedirectChecker', () => {
  const TEST_DIR = resolve(__dirname, 'test-redirect-checker');
  const VERCEL_JSON_PATH = resolve(TEST_DIR, 'vercel.json');
  const DOCS_DIR = resolve(TEST_DIR, 'docs');
  const PAGES_DIR = resolve(TEST_DIR, 'pages');

  beforeEach(() => {
    // Create test directories
    mkdirSync(TEST_DIR, { recursive: true });
    mkdirSync(DOCS_DIR, { recursive: true });
    mkdirSync(PAGES_DIR, { recursive: true });
    mkdirSync(resolve(PAGES_DIR, 'docs'), { recursive: true });

    // Initialize git repo
    execSync('git init', { cwd: TEST_DIR });
    execSync('git config user.email "test@example.com"', { cwd: TEST_DIR });
    execSync('git config user.name "Test User"', { cwd: TEST_DIR });
    execSync('git commit --allow-empty -m "Initial commit"', { cwd: TEST_DIR });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('URL Path Handling', () => {
    it('should handle index files correctly', () => {
      const checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'commit-hook',
      });

      // Create and stage files
      writeFileSync(resolve(PAGES_DIR, 'index.md'), 'content');
      writeFileSync(resolve(PAGES_DIR, 'docs/index.mdx'), 'content');
      execSync('git add .', { cwd: TEST_DIR });

      // Test index file paths
      const rootResult = (checker as any).getUrlFromPath('pages/index.md');
      const nestedResult = (checker as any).getUrlFromPath('pages/docs/index.mdx');

      expect(rootResult).toBe('/');
      expect(nestedResult).toBe('/(docs/?)');
    });

    it('should handle numbered prefixes in file paths', () => {
      const checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'commit-hook',
      });

      const result = (checker as any).getUrlFromPath('pages/01-intro/02-getting-started.md');
      expect(result).toBe('/(intro/getting-started/?)');
    });

    it('should normalize URLs consistently', () => {
      const checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'commit-hook',
      });

      const testCases = [
        { input: '/path/to/doc/', expected: '/path/to/doc' },
        { input: '(path/to/doc)', expected: '/path/to/doc' },
        { input: '//path//to//doc//', expected: '/path/to/doc' },
        { input: '/(path/to/doc/?)', expected: '/path/to/doc' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = (checker as any).normalizeUrl(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Mode-specific Behavior', () => {
    it('should create vercel.json in commit-hook mode if missing', async () => {
      const checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'commit-hook',
      });

      try {
        await checker.check();
      } catch (error) {
        expect(error.message).toBe(
          'vercel.json was created. Please review and stage the file before continuing.',
        );
      }

      expect(existsSync(VERCEL_JSON_PATH)).toBe(true);
      const content = JSON.parse(readFileSync(VERCEL_JSON_PATH, 'utf8'));
      expect(content).toEqual({ redirects: [] });
    });

    it('should throw error in CI mode if vercel.json is missing', async () => {
      const checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'ci',
      });

      const result = await checker.check();
      expect(result.error).toBe(`vercel.json not found at ${VERCEL_JSON_PATH}`);
    });

    it('should detect moved files differently in CI mode', async () => {
      // Setup initial commit
      writeFileSync(resolve(PAGES_DIR, 'old.md'), 'content');
      execSync('git add .', { cwd: TEST_DIR });
      execSync('git commit -m "initial"', { cwd: TEST_DIR });

      // Move file
      renameSync(resolve(PAGES_DIR, 'old.md'), resolve(PAGES_DIR, 'new.md'));
      execSync('git add .', { cwd: TEST_DIR });
      execSync('git commit -m "move file"', { cwd: TEST_DIR });

      const checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'ci',
      });

      // Create properly formatted vercel.json using prettier
      const prettier = require('prettier');
      const options = await prettier.resolveConfig(process.cwd()) || {};
      const formattedContent = prettier.format(JSON.stringify({ redirects: [] }), {
        ...options,
        parser: 'json',
        filepath: VERCEL_JSON_PATH,
      });
      writeFileSync(VERCEL_JSON_PATH, formattedContent);
      
      const result = await checker.check();

      expect(result.hasMissingRedirects).toBe(true);
      expect(result.missingRedirects).toHaveLength(1);
      expect(result.missingRedirects[0]).toEqual({
        from: '/(old/?)',
        to: '/(new/?)',
      });
    });
  });

  describe('Redirect Management', () => {
    it('should detect missing redirects for moved files', async () => {
      const checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'commit-hook',
      });

      // Setup vercel.json
      writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }, null, 2));

      // Create and move a file
      writeFileSync(resolve(PAGES_DIR, 'old.md'), 'content');
      execSync('git add .', { cwd: TEST_DIR });
      execSync('git commit -m "add file"', { cwd: TEST_DIR });

      renameSync(resolve(PAGES_DIR, 'old.md'), resolve(PAGES_DIR, 'new.md'));
      execSync('git add .', { cwd: TEST_DIR });

      try {
        await checker.check();
      } catch (error) {
        expect(error.message).toBe(
          'New redirects added to vercel.json. Please review and stage the changes before continuing.',
        );
      }

      const config = JSON.parse(readFileSync(VERCEL_JSON_PATH, 'utf8'));
      expect(config.redirects).toHaveLength(1);
      expect(config.redirects[0]).toEqual({
        source: '/(old/?)',
        destination: '/(new/?)',
        permanent: false,
      });
    });

    it('should not add duplicate redirects', async () => {
      const checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'commit-hook',
      });

      // Setup vercel.json with existing redirect
      writeFileSync(
        VERCEL_JSON_PATH,
        JSON.stringify({
          redirects: [
            {
              source: '/(old/?)',
              destination: '/(new/?)',
              permanent: false,
            },
          ],
        }),
      );

      // Create and move a file
      writeFileSync(resolve(PAGES_DIR, 'old.md'), 'content');
      execSync('git add .', { cwd: TEST_DIR });
      execSync('git commit -m "add file"', { cwd: TEST_DIR });

      renameSync(resolve(PAGES_DIR, 'old.md'), resolve(PAGES_DIR, 'new.md'));
      execSync('git add .', { cwd: TEST_DIR });

      const result = await checker.check();
      expect(result.hasMissingRedirects).toBe(false);

      const config = JSON.parse(readFileSync(VERCEL_JSON_PATH, 'utf8'));
      expect(config.redirects).toHaveLength(1);
    });

    it('should handle multiple file moves in one commit', async () => {
      const checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'commit-hook',
      });

      // Setup vercel.json
      writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }, null, 2));

      // Create and move multiple files
      writeFileSync(resolve(PAGES_DIR, 'old1.md'), 'content');
      writeFileSync(resolve(PAGES_DIR, 'old2.md'), 'content');
      execSync('git add .', { cwd: TEST_DIR });
      execSync('git commit -m "add files"', { cwd: TEST_DIR });

      renameSync(resolve(PAGES_DIR, 'old1.md'), resolve(PAGES_DIR, 'new1.md'));
      renameSync(resolve(PAGES_DIR, 'old2.md'), resolve(PAGES_DIR, 'new2.md'));
      execSync('git add .', { cwd: TEST_DIR });

      try {
        await checker.check();
      } catch (error) {
        expect(error.message).toBe(
          'New redirects added to vercel.json. Please review and stage the changes before continuing.',
        );
      }

      const config = JSON.parse(readFileSync(VERCEL_JSON_PATH, 'utf8'));
      expect(config.redirects).toHaveLength(2);
      expect(config.redirects).toEqual([
        {
          source: '/(old1/?)',
          destination: '/(new1/?)',
          permanent: false,
        },
        {
          source: '/(old2/?)',
          destination: '/(new2/?)',
          permanent: false,
        },
      ]);
    });

    it('should not create redirects for newly added files', async () => {
      // Setup vercel.json and commit it
      writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }, null, 2));
      execSync('git add vercel.json', { cwd: TEST_DIR });
      execSync('git commit -m "Add empty vercel.json for new file test"', { cwd: TEST_DIR });

      const checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'commit-hook',
      });

      // Create and stage a new file
      const newFilePath = resolve(PAGES_DIR, 'brand-new-file.md');
      writeFileSync(newFilePath, 'content');
      // Ensure the path used in git add is relative to TEST_DIR
      execSync('git add pages/brand-new-file.md', { cwd: TEST_DIR });

      let result: RedirectCheckResult | undefined;
      try {
        result = await checker.check();
      } catch (e: any) {
        // Fail if it's the specific error we want to avoid
        if (
          e.message ===
          'New redirects added to vercel.json. Please review and stage the changes before continuing.'
        ) {
          throw new Error('Test failed: Redirects were unexpectedly added for a new file.');
        }
        // Re-throw other unexpected errors
        throw e;
      }

      // If checker.check() did not throw the specific "New redirects added..." error,
      // result should be defined.
      expect(result).toBeDefined();
      // No other errors (like vercel.json not found/malformed, though unlikely here) should occur.
      expect(result!.error).toBeUndefined();
      // No missing redirects should be flagged for a new file.
      expect(result!.hasMissingRedirects).toBe(false);

      // Verify that vercel.json was not modified
      const finalConfig = JSON.parse(readFileSync(VERCEL_JSON_PATH, 'utf8'));
      expect(finalConfig.redirects).toHaveLength(0); // Assuming it started empty
    });

    it('should not create a redirect if source and destination are the same after normalization', async () => {
      // Setup vercel.json and commit it
      writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }, null, 2));
      execSync('git add vercel.json', { cwd: TEST_DIR });
      execSync('git commit -m "Add empty vercel.json for self-redirect test"', { cwd: TEST_DIR });

      const checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'commit-hook',
      });

      // Simulate a move that results in the same normalized URL
      // e.g. pages/old-path/index.md -> pages/old-path.md
      // Both getUrlFromPath might resolve to something like /(old-path/?)
      const oldFileDir = resolve(PAGES_DIR, 'self-redirect-test');
      mkdirSync(oldFileDir, { recursive: true });
      const oldFilePath = resolve(oldFileDir, 'index.md');
      const newFilePath = resolve(PAGES_DIR, 'self-redirect-test.md');

      writeFileSync(oldFilePath, 'content');
      execSync('git add pages/self-redirect-test/index.md', { cwd: TEST_DIR });
      execSync('git commit -m "Add file for self-redirect test"', { cwd: TEST_DIR });

      renameSync(oldFilePath, newFilePath);
      // Add both old (now deleted) and new paths to staging for git to detect as a rename
      execSync('git add pages/self-redirect-test/index.md pages/self-redirect-test.md', {
        cwd: TEST_DIR,
      });

      let result: RedirectCheckResult | undefined;
      try {
        result = await checker.check();
      } catch (e: any) {
        if (
          e.message ===
          'New redirects added to vercel.json. Please review and stage the changes before continuing.'
        ) {
          throw new Error(
            'Test failed: Redirects were unexpectedly added when source and destination were the same.',
          );
        }
        throw e;
      }

      expect(result).toBeDefined();
      expect(result!.error).toBeUndefined();
      expect(result!.hasMissingRedirects).toBe(false);

      const finalConfig = JSON.parse(readFileSync(VERCEL_JSON_PATH, 'utf8'));
      expect(finalConfig.redirects).toHaveLength(0);
    });

    it('should handle sorting and adding redirects in commit-hook mode', async () => {
      const unsortedRedirects = [
        {
          source: '/(zebra/?)',
          destination: '/(zoo/?)',
          permanent: false,
        },
        {
          source: '/(apple/?)',
          destination: '/(fruit-basket/?)',
          permanent: false,
        },
      ];
      // Create an initially unsorted vercel.json
      writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: unsortedRedirects }, null, 2));
      execSync('git add vercel.json', { cwd: TEST_DIR }); // Stage it initially
      execSync('git commit -m "add unsorted vercel.json"', { cwd: TEST_DIR });

      let checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'commit-hook',
      });

      // --- Step 1: Test re-sorting of an existing unsorted file ---
      try {
        await checker.check(); // This call should trigger loadVercelConfig
      } catch (error: any) {
        expect(error.message).toBe(
          'vercel.json was re-sorted and/or re-formatted. Please review and stage the changes before continuing.',
        );
      }
      // Verify the file is now sorted on disk
      let currentConfig = JSON.parse(readFileSync(VERCEL_JSON_PATH, 'utf8'));
      expect(currentConfig.redirects).toEqual([
        {
          source: '/(apple/?)',
          destination: '/(fruit-basket/?)',
          permanent: false,
        },
        {
          source: '/(zebra/?)',
          destination: '/(zoo/?)',
          permanent: false,
        },
      ]);

      // --- Step 2: Simulate staging the re-sorted file and adding a new redirect ---
      execSync('git add vercel.json', { cwd: TEST_DIR }); // Stage the sorted vercel.json
      // No commit needed here, just need it staged for the next check()

      // Create and move a file to add a new redirect
      writeFileSync(resolve(PAGES_DIR, 'old-banana.md'), 'content');
      execSync('git add pages/old-banana.md', { cwd: TEST_DIR });
      execSync('git commit -m "add banana file"', { cwd: TEST_DIR });

      renameSync(resolve(PAGES_DIR, 'old-banana.md'), resolve(PAGES_DIR, 'new-yellow-fruit.md'));
      execSync('git add pages/old-banana.md pages/new-yellow-fruit.md', { cwd: TEST_DIR });

      // Re-initialize checker or ensure its internal state is fresh if necessary,
      // though for this test, a new instance works fine.
      checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'commit-hook',
      });

      try {
        await checker.check();
      } catch (error: any) {
        expect(error.message).toBe(
          'New redirects added to vercel.json. Please review and stage the changes before continuing.',
        );
      }

      // Verify the file on disk has the new redirect and is still sorted
      currentConfig = JSON.parse(readFileSync(VERCEL_JSON_PATH, 'utf8'));
      expect(currentConfig.redirects).toEqual([
        {
          source: '/(apple/?)',
          destination: '/(fruit-basket/?)',
          permanent: false,
        },
        {
          source: '/(old-banana/?)',
          destination: '/(new-yellow-fruit/?)',
          permanent: false,
        },
        {
          source: '/(zebra/?)',
          destination: '/(zoo/?)',
          permanent: false,
        },
      ]);
    });

    it('should error in CI mode if vercel.json is unsorted', async () => {
      const unsortedRedirects = [
        { source: '/(b/?)', destination: '/(c/?)', permanent: false },
        { source: '/(a/?)', destination: '/(d/?)', permanent: false },
      ];
      writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: unsortedRedirects }, null, 2));
      // In CI, we assume vercel.json is part of the committed state.

      const checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'ci',
      });

      const result = await checker.check();
      expect(result.error).toBe(
        'vercel.json is not correctly sorted/formatted. Please run the pre-commit hook locally to fix and commit the changes.',
      );
      // Ensure the file was not modified in CI mode
      const fileContent = JSON.parse(readFileSync(VERCEL_JSON_PATH, 'utf8'));
      expect(fileContent.redirects).toEqual(unsortedRedirects);
    });

    it('should error if vercel.json is malformed', async () => {
      writeFileSync(VERCEL_JSON_PATH, 'this is not json');
      execSync('git add vercel.json', { cwd: TEST_DIR }); // Stage the malformed file
      const checker = new RedirectChecker({
        vercelJsonPath: VERCEL_JSON_PATH,
        mode: 'commit-hook',
      });
      const result = await checker.check();
      expect(result.error).toContain('Error parsing');
      expect(result.error).toContain('Please fix the JSON format and try again.');
    });

    it('should handle cross-platform line endings and trailing whitespace', async () => {
      const redirects = [
        {
          source: '/(zebra/?)',
          destination: '/(zoo/?)',
          permanent: false,
        },
        {
          source: '/(apple/?)',
          destination: '/(fruit/?)',
          permanent: false,
        },
      ];

      // Create vercel.json files with different line ending styles but in wrong order (to trigger formatting)
      const testCases = [
        {
          name: 'CRLF line endings with trailing spaces',
          content: JSON.stringify({ redirects }, null, 2).replace(/\n/g, '\r\n') + '   \r\n',
        },
        {
          name: 'LF line endings with trailing spaces',
          content: JSON.stringify({ redirects }, null, 2) + '   \n',
        },
        {
          name: 'CR line endings with trailing spaces',
          content: JSON.stringify({ redirects }, null, 2).replace(/\n/g, '\r') + '   \r',
        },
        {
          name: 'mixed line endings with various trailing whitespace',
          content: JSON.stringify({ redirects }, null, 2).replace(/\n/g, '\r\n') + '\t  \n   ',
        },
      ];

      for (const testCase of testCases) {
        // Write file with problematic formatting (unsorted to trigger reformatting)
        writeFileSync(VERCEL_JSON_PATH, testCase.content);
        execSync('git add vercel.json', { cwd: TEST_DIR });
        execSync(`git commit -m "Add vercel.json with ${testCase.name}"`, { cwd: TEST_DIR });

        const checker = new RedirectChecker({
          vercelJsonPath: VERCEL_JSON_PATH,
          mode: 'commit-hook',
        });

        const result = await checker.check();
        expect(result.hasMissingRedirects).toBe(false);
        expect(result.error).toBeUndefined();

        // Verify the file content was normalized properly after auto-formatting 
        const normalizedContent = readFileSync(VERCEL_JSON_PATH, 'utf8');
        // Prettier formats the JSON, so we just need to verify it's properly formatted and sorted
        const parsedContent = JSON.parse(normalizedContent);
        expect(parsedContent.redirects).toEqual([redirects[1], redirects[0]]); // Should be sorted
        expect(normalizedContent.endsWith('\n')).toBe(true);
        expect(normalizedContent.includes('\r')).toBe(false);
        expect(/\s+$/.test(normalizedContent.replace(/\n$/, ''))).toBe(false); // No trailing spaces except final newline
      }
    });
  });

  // Original tests
  it('should pass when no files are moved', async () => {
    // Setup: Create empty vercel.json and commit it
    writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }, null, 2));
    execSync('git add vercel.json', { cwd: TEST_DIR });
    execSync('git commit -m "Add empty vercel.json"', { cwd: TEST_DIR });

    const checker = new RedirectChecker({
      vercelJsonPath: VERCEL_JSON_PATH,
      mode: 'commit-hook',
    });
    const result = await checker.check();
    expect(result.hasMissingRedirects).toBe(false);
  });

  it('should pass when moved file has matching redirect', async () => {
    // Setup: Add a redirect that matches what we'll test
    const vercelJson = {
      redirects: [
        {
          source: '/(old-page/?)',
          destination: '/(new-page/?)',
          permanent: false,
        },
      ],
    };
    writeFileSync(VERCEL_JSON_PATH, JSON.stringify(vercelJson, null, 2));
    execSync('git add vercel.json', { cwd: TEST_DIR });
    execSync('git commit -m "Add test vercel.json"', { cwd: TEST_DIR });

    // Create and move a test file
    const oldPath = resolve(TEST_DIR, 'pages/old-page.mdx');
    const newPath = resolve(TEST_DIR, 'pages/new-page.mdx');
    mkdirSync(resolve(TEST_DIR, 'pages'), { recursive: true });
    writeFileSync(oldPath, 'test content');
    execSync('git add pages/old-page.mdx', { cwd: TEST_DIR });
    execSync('git commit -m "Add test file"', { cwd: TEST_DIR });

    // Move the file and stage it
    mkdirSync(dirname(newPath), { recursive: true });
    renameSync(oldPath, newPath);
    execSync('git add pages/old-page.mdx pages/new-page.mdx', { cwd: TEST_DIR });

    const checker = new RedirectChecker({
      vercelJsonPath: VERCEL_JSON_PATH,
      mode: 'commit-hook',
    });
    const result = await checker.check();
    expect(result.hasMissingRedirects).toBe(false);
  });

  it('should fail when vercel.json changes are not staged', async () => {
    // Setup: Create empty vercel.json and commit it
    writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }, null, 2));
    execSync('git add vercel.json', { cwd: TEST_DIR });
    execSync('git commit -m "Add empty vercel.json"', { cwd: TEST_DIR });

    // Create unstaged changes
    writeFileSync(
      VERCEL_JSON_PATH,
      JSON.stringify(
        {
          redirects: [
            {
              source: '/test',
              destination: '/test2',
              permanent: false,
            },
          ],
        },
        null,
        2,
      ),
    );

    // Verify that vercel.json is modified but not staged
    const status = execSync('git status --porcelain', { cwd: TEST_DIR, encoding: 'utf8' });
    expect(status).toContain(' M vercel.json');

    const checker = new RedirectChecker({
      vercelJsonPath: VERCEL_JSON_PATH,
      mode: 'commit-hook',
    });
    const result = await checker.check();
    expect(result.error).toBe(
      'Unstaged changes to vercel.json. Please review and stage the changes before continuing.',
    );
  });
});
