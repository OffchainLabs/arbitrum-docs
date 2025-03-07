/// <reference types="jest" />

import { RedirectChecker } from './check-redirects';
import { writeFileSync, readFileSync, rmSync, existsSync, mkdirSync, renameSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { execSync } from 'child_process';
import { writeFile, rename, mkdir } from 'fs/promises';
import { unlinkSync } from 'fs';

describe('RedirectChecker', () => {
  const TEST_DIR = resolve(__dirname, 'test-redirect-checker');
  const VERCEL_JSON_PATH = resolve(TEST_DIR, 'vercel.json');

  beforeEach(async () => {
    // Create test directory and initialize git
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    
    // Initialize git repo
    execSync('git init', { cwd: TEST_DIR });
    // Configure git for test environment
    execSync('git config user.email "test@example.com"', { cwd: TEST_DIR });
    execSync('git config user.name "Test User"', { cwd: TEST_DIR });
    // Create initial commit to allow for git diff
    execSync('git commit --allow-empty -m "Initial commit"', { cwd: TEST_DIR });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('should pass when no files are moved', async () => {
    // Setup: Create empty vercel.json and commit it
    writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }, null, 2));
    execSync('git add vercel.json', { cwd: TEST_DIR });
    execSync('git commit -m "Add empty vercel.json"', { cwd: TEST_DIR });

    const checker = new RedirectChecker(VERCEL_JSON_PATH, 'git diff --cached --name-status -M100% --find-renames');
    await expect(checker.check()).resolves.toBe(true);
  });

  it('should pass when moved file has matching redirect', async () => {
    // Setup: Add a redirect that matches what we'll test
    const vercelJson = {
      redirects: [{
        source: '/old-page',
        destination: '/new-page',
        permanent: false
      }]
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

    const checker = new RedirectChecker(VERCEL_JSON_PATH, 'git diff --cached --name-status -M100% --find-renames');
    await expect(checker.check()).resolves.toBe(true);
  });

  it('should require review when adding redirect for moved file', async () => {
    // Setup: Create empty vercel.json and commit it
    writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }, null, 2));
    execSync('git add vercel.json', { cwd: TEST_DIR });
    execSync('git commit -m "Add empty vercel.json"', { cwd: TEST_DIR });

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

    const checker = new RedirectChecker(VERCEL_JSON_PATH, 'git diff --cached --name-status -M100% --find-renames');
    await expect(checker.check()).rejects.toThrow('New redirects added to vercel.json. Please review and stage the changes before continuing.');

    // Verify the changes were made correctly
    const vercelJson = JSON.parse(readFileSync(VERCEL_JSON_PATH, 'utf8'));
    expect(vercelJson.redirects).toHaveLength(1);
    expect(vercelJson.redirects[0]).toEqual({
      source: '/old-page',
      destination: '/new-page',
      permanent: false
    });
  });

  it('should require review when handling files in different directories', async () => {
    // Setup: Create empty vercel.json and commit it
    writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }, null, 2));
    execSync('git add vercel.json', { cwd: TEST_DIR });
    execSync('git commit -m "Add empty vercel.json"', { cwd: TEST_DIR });

    // Create and move a test file
    const oldPath = resolve(TEST_DIR, 'arbitrum-docs/for-users/contribute.mdx');
    const newPath = resolve(TEST_DIR, 'arbitrum-docs/contribute.mdx');
    mkdirSync(resolve(TEST_DIR, 'arbitrum-docs/for-users'), { recursive: true });
    writeFileSync(oldPath, 'test content');
    execSync('git add arbitrum-docs/for-users/contribute.mdx', { cwd: TEST_DIR });
    execSync('git commit -m "Add test file"', { cwd: TEST_DIR });
    
    // Move the file and stage it
    mkdirSync(dirname(newPath), { recursive: true });
    renameSync(oldPath, newPath);
    execSync('git add arbitrum-docs/for-users/contribute.mdx arbitrum-docs/contribute.mdx', { cwd: TEST_DIR });

    const checker = new RedirectChecker(VERCEL_JSON_PATH, 'git diff --cached --name-status -M100% --find-renames');
    await expect(checker.check()).rejects.toThrow('New redirects added to vercel.json. Please review and stage the changes before continuing.');

    // Verify the changes were made correctly
    const vercelJson = JSON.parse(readFileSync(VERCEL_JSON_PATH, 'utf8'));
    expect(vercelJson.redirects).toHaveLength(1);
    expect(vercelJson.redirects[0]).toEqual({
      source: '/for-users/contribute',
      destination: '/contribute',
      permanent: false
    });
  });

  it('should require review when handling multiple file moves', async () => {
    // Setup: Create empty vercel.json and commit it
    writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }, null, 2));
    execSync('git add vercel.json', { cwd: TEST_DIR });
    execSync('git commit -m "Add empty vercel.json"', { cwd: TEST_DIR });

    // Create and move test files
    const oldPath1 = resolve(TEST_DIR, 'pages/old1.mdx');
    const newPath1 = resolve(TEST_DIR, 'pages/new1.mdx');
    const oldPath2 = resolve(TEST_DIR, 'pages/old2.mdx');
    const newPath2 = resolve(TEST_DIR, 'pages/new2.mdx');
    
    mkdirSync(resolve(TEST_DIR, 'pages'), { recursive: true });
    writeFileSync(oldPath1, 'test content 1');
    writeFileSync(oldPath2, 'test content 2');
    execSync('git add pages/old1.mdx pages/old2.mdx', { cwd: TEST_DIR });
    execSync('git commit -m "Add test files"', { cwd: TEST_DIR });
    
    // Move the files and stage them
    mkdirSync(dirname(newPath1), { recursive: true });
    mkdirSync(dirname(newPath2), { recursive: true });
    renameSync(oldPath1, newPath1);
    renameSync(oldPath2, newPath2);
    execSync('git add pages/old1.mdx pages/new1.mdx pages/old2.mdx pages/new2.mdx', { cwd: TEST_DIR });

    const checker = new RedirectChecker(VERCEL_JSON_PATH, 'git diff --cached --name-status -M100% --find-renames');
    await expect(checker.check()).rejects.toThrow('New redirects added to vercel.json. Please review and stage the changes before continuing.');

    // Verify the changes were made correctly
    const vercelJson = JSON.parse(readFileSync(VERCEL_JSON_PATH, 'utf8'));
    expect(vercelJson.redirects).toHaveLength(2);
    expect(vercelJson.redirects).toEqual([
      {
        source: '/old1',
        destination: '/new1',
        permanent: false
      },
      {
        source: '/old2',
        destination: '/new2',
        permanent: false
      }
    ]);
  });

  it('should fail when vercel.json changes are not staged', async () => {
    // Setup: Create empty vercel.json and commit it
    writeFileSync(VERCEL_JSON_PATH, JSON.stringify({ redirects: [] }, null, 2));
    execSync('git add vercel.json', { cwd: TEST_DIR });
    execSync('git commit -m "Add empty vercel.json"', { cwd: TEST_DIR });

    // Create unstaged changes
    writeFileSync(VERCEL_JSON_PATH, JSON.stringify({
      redirects: [{
        source: '/test',
        destination: '/test2',
        permanent: false
      }]
    }, null, 2));

    // Verify that vercel.json is modified but not staged
    const status = execSync('git status --porcelain', { cwd: TEST_DIR, encoding: 'utf8' });
    expect(status).toContain(' M vercel.json');

    const checker = new RedirectChecker(VERCEL_JSON_PATH, 'git diff --cached --name-status -M100% --find-renames');
    await expect(checker.check()).rejects.toThrow('Unstaged changes to vercel.json. Please review and stage the changes before continuing.');
  });
}); 