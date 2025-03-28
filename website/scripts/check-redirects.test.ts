import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RedirectChecker } from './check-redirects.js';

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

      writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }));
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
      writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }));

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
      writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }));

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
