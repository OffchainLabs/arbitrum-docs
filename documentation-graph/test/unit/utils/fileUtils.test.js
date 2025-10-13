/**
 * MIT License
 *
 * Copyright (c) 2025 Offchain Labs
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Unit tests for FileUtils
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';
import FileUtils from '../../../src/utils/fileUtils.js';

describe('FileUtils', () => {
  const testDir = path.join(process.cwd(), 'test', 'fixtures', 'test-temp');

  beforeEach(async () => {
    // Create test directory
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.remove(testDir);
  });

  describe('ensureDirectory', () => {
    it('should create directory if it does not exist', async () => {
      const newDir = path.join(testDir, 'new-directory');
      await FileUtils.ensureDirectory(newDir);

      const exists = await fs.pathExists(newDir);
      expect(exists).toBe(true);
    });

    it('should not throw if directory already exists', async () => {
      await FileUtils.ensureDirectory(testDir);
      await expect(FileUtils.ensureDirectory(testDir)).resolves.not.toThrow();
    });
  });

  describe('writeJSON', () => {
    it('should write JSON data to file', async () => {
      const testFile = path.join(testDir, 'test.json');
      const testData = { key: 'value', number: 42 };

      await FileUtils.writeJSON(testFile, testData);

      const exists = await fs.pathExists(testFile);
      expect(exists).toBe(true);

      const content = await fs.readJSON(testFile);
      expect(content).toEqual(testData);
    });

    it('should handle nested objects', async () => {
      const testFile = path.join(testDir, 'nested.json');
      const testData = {
        level1: {
          level2: {
            level3: 'deep value'
          }
        }
      };

      await FileUtils.writeJSON(testFile, testData);
      const content = await fs.readJSON(testFile);
      expect(content).toEqual(testData);
    });
  });

  describe('readJSON', () => {
    it('should read JSON data from file', async () => {
      const testFile = path.join(testDir, 'read-test.json');
      const testData = { foo: 'bar' };

      await fs.writeJSON(testFile, testData);
      const result = await FileUtils.readJSON(testFile);

      expect(result).toEqual(testData);
    });

    it('should return null for non-existent file', async () => {
      const nonExistentFile = path.join(testDir, 'does-not-exist.json');
      const result = await FileUtils.readJSON(nonExistentFile);

      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', async () => {
      const testFile = path.join(testDir, 'invalid.json');
      await fs.writeFile(testFile, 'not valid json{]');

      const result = await FileUtils.readJSON(testFile);
      expect(result).toBeNull();
    });
  });

  describe('readFile', () => {
    it('should read text file content', async () => {
      const testFile = path.join(testDir, 'text.txt');
      const testContent = 'Hello, World!';

      await fs.writeFile(testFile, testContent, 'utf-8');
      const result = await FileUtils.readFile(testFile);

      expect(result).toBe(testContent);
    });

    it('should return null for non-existent file', async () => {
      const nonExistentFile = path.join(testDir, 'missing.txt');
      const result = await FileUtils.readFile(nonExistentFile);

      expect(result).toBeNull();
    });

    it('should handle UTF-8 encoding', async () => {
      const testFile = path.join(testDir, 'utf8.txt');
      const testContent = 'UTF-8: 你好世界 🌍';

      await fs.writeFile(testFile, testContent, 'utf-8');
      const result = await FileUtils.readFile(testFile);

      expect(result).toBe(testContent);
    });
  });

  describe('findDocumentationFiles', () => {
    beforeEach(async () => {
      // Create test file structure
      await fs.writeFile(path.join(testDir, 'doc1.md'), '# Document 1');
      await fs.writeFile(path.join(testDir, 'doc2.mdx'), '# Document 2');
      await fs.writeFile(path.join(testDir, 'readme.txt'), 'Not a doc');

      const subdir = path.join(testDir, 'subdir');
      await fs.ensureDir(subdir);
      await fs.writeFile(path.join(subdir, 'doc3.md'), '# Document 3');
    });

    it('should find markdown files', async () => {
      const files = await FileUtils.findDocumentationFiles(testDir, ['**/*.md', '**/*.mdx']);

      expect(files.length).toBeGreaterThanOrEqual(2);
      expect(files.some(f => f.endsWith('doc1.md'))).toBe(true);
      expect(files.some(f => f.endsWith('doc2.mdx'))).toBe(true);
    });

    it('should not include non-markdown files', async () => {
      const files = await FileUtils.findDocumentationFiles(testDir, ['**/*.md', '**/*.mdx']);

      expect(files.some(f => f.endsWith('readme.txt'))).toBe(false);
    });

    it('should find files in subdirectories', async () => {
      const files = await FileUtils.findDocumentationFiles(testDir, ['**/*.md']);

      expect(files.some(f => f.includes('subdir') && f.endsWith('doc3.md'))).toBe(true);
    });

    it('should return empty array for non-existent directory', async () => {
      const files = await FileUtils.findDocumentationFiles(
        path.join(testDir, 'does-not-exist'),
        ['**/*.md']
      );

      expect(files).toEqual([]);
    });
  });
});
