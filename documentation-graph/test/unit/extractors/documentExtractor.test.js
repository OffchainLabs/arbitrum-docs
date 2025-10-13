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
 * Unit tests for DocumentExtractor
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import path from 'path';
import DocumentExtractor from '../../../src/extractors/documentExtractor.js';

describe('DocumentExtractor', () => {
  const fixturesDir = path.join(process.cwd(), 'test', 'fixtures', 'documents');
  let extractor;

  beforeEach(() => {
    extractor = new DocumentExtractor(fixturesDir);
  });

  describe('extractDocument', () => {
    it('should extract frontmatter from valid MDX file', async () => {
      const testFile = path.join(fixturesDir, 'valid-document.mdx');
      const result = await extractor.extractDocument(testFile);

      expect(result).not.toBeNull();
      expect(result.frontmatter).toBeDefined();
      expect(result.frontmatter.title).toBe('Test Document');
      expect(result.frontmatter.description).toBe('A test document for unit testing');
      expect(result.frontmatter.author).toBe('test-author');
    });

    it('should handle missing frontmatter gracefully', async () => {
      const testFile = path.join(fixturesDir, 'no-frontmatter.md');
      const result = await extractor.extractDocument(testFile);

      expect(result).not.toBeNull();
      expect(result.frontmatter).toEqual({});
      expect(result.content).toContain('Document Without Frontmatter');
    });

    it('should extract headings correctly', async () => {
      const testFile = path.join(fixturesDir, 'valid-document.mdx');
      const result = await extractor.extractDocument(testFile);

      expect(result.headings).toBeDefined();
      expect(result.headings.length).toBeGreaterThan(0);

      const h1Headings = result.headings.filter(h => h.level === 1);
      expect(h1Headings.length).toBeGreaterThan(0);
      expect(h1Headings[0].text).toBe('Test Document');
    });

    it('should extract internal links', async () => {
      const testFile = path.join(fixturesDir, 'valid-document.mdx');
      const result = await extractor.extractDocument(testFile);

      expect(result.links).toBeDefined();
      expect(result.links.internal).toBeDefined();
      expect(result.links.internal.length).toBeGreaterThan(0);
      expect(result.links.internal).toContain('./other-doc.md');
    });

    it('should extract external links', async () => {
      const testFile = path.join(fixturesDir, 'valid-document.mdx');
      const result = await extractor.extractDocument(testFile);

      expect(result.links.external).toBeDefined();
      expect(result.links.external.length).toBeGreaterThan(0);
      expect(result.links.external[0]).toContain('https://example.com');
    });

    it('should identify code blocks', async () => {
      const testFile = path.join(fixturesDir, 'valid-document.mdx');
      const result = await extractor.extractDocument(testFile);

      expect(result.codeBlocks).toBeDefined();
      expect(result.codeBlocks.length).toBeGreaterThan(0);
      expect(result.codeBlocks[0]).toContain('const test');
    });

    it('should count words accurately', async () => {
      const testFile = path.join(fixturesDir, 'valid-document.mdx');
      const result = await extractor.extractDocument(testFile);

      expect(result.wordCount).toBeDefined();
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it('should return null for non-existent file', async () => {
      const testFile = path.join(fixturesDir, 'does-not-exist.md');
      const result = await extractor.extractDocument(testFile);

      expect(result).toBeNull();
    });
  });

  describe('extractHeadings', () => {
    it('should extract all heading levels', () => {
      const content = `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`;

      const headings = extractor.extractHeadings(content);

      expect(headings.length).toBe(6);
      expect(headings[0]).toEqual({ level: 1, text: 'Heading 1', id: 'heading-1' });
      expect(headings[1]).toEqual({ level: 2, text: 'Heading 2', id: 'heading-2' });
      expect(headings[5]).toEqual({ level: 6, text: 'Heading 6', id: 'heading-6' });
    });

    it('should generate valid heading IDs', () => {
      const content = `# Test Heading With Spaces
## Special-Characters!@#`;

      const headings = extractor.extractHeadings(content);

      expect(headings[0].id).toBe('test-heading-with-spaces');
      expect(headings[1].id).toMatch(/^special-characters/);
    });

    it('should handle duplicate headings', () => {
      const content = `# Same Heading
## Same Heading`;

      const headings = extractor.extractHeadings(content);

      expect(headings.length).toBe(2);
      expect(headings[0].text).toBe('Same Heading');
      expect(headings[1].text).toBe('Same Heading');
    });

    it('should handle empty content', () => {
      const headings = extractor.extractHeadings('');
      expect(headings).toEqual([]);
    });
  });

  describe('extractLinks', () => {
    it('should extract markdown links', () => {
      const content = `
[Internal Link](./page.md)
[External Link](https://example.com)
[Anchor Link](#section)
      `;

      const links = extractor.extractLinks(content);

      expect(links.internal).toContain('./page.md');
      expect(links.external[0]).toContain('https://example.com');
      expect(links.anchor).toContain('#section');
    });

    it('should handle links with special characters', () => {
      const content = `[Link](./path/to/file-name_123.md)`;
      const links = extractor.extractLinks(content);

      expect(links.internal).toContain('./path/to/file-name_123.md');
    });

    it('should return empty arrays for no links', () => {
      const links = extractor.extractLinks('No links here');

      expect(links.internal).toEqual([]);
      expect(links.external).toEqual([]);
      expect(links.anchor).toEqual([]);
    });
  });

  describe('extractCodeBlocks', () => {
    it('should extract fenced code blocks', () => {
      const content = '```javascript\nconst x = 1;\n```';
      const blocks = extractor.extractCodeBlocks(content);

      expect(blocks.length).toBe(1);
      expect(blocks[0]).toContain('const x = 1;');
    });

    it('should extract code blocks with language tags', () => {
      const content = '```typescript\nlet y: number = 2;\n```';
      const blocks = extractor.extractCodeBlocks(content);

      expect(blocks.length).toBe(1);
    });

    it('should extract multiple code blocks', () => {
      const content = `
\`\`\`javascript
code1
\`\`\`

Some text

\`\`\`python
code2
\`\`\`
      `;
      const blocks = extractor.extractCodeBlocks(content);

      expect(blocks.length).toBe(2);
    });

    it('should return empty array for no code blocks', () => {
      const blocks = extractor.extractCodeBlocks('No code here');
      expect(blocks).toEqual([]);
    });
  });

  describe('countWords', () => {
    it('should count words correctly', () => {
      const text = 'This is a test sentence with seven words.';
      const count = extractor.countWords(text);

      expect(count).toBe(8);
    });

    it('should handle multiple spaces', () => {
      const text = 'Multiple    spaces    between    words';
      const count = extractor.countWords(text);

      expect(count).toBe(4);
    });

    it('should handle empty string', () => {
      const count = extractor.countWords('');
      expect(count).toBe(0);
    });

    it('should handle newlines', () => {
      const text = 'Line one\nLine two\nLine three';
      const count = extractor.countWords(text);

      expect(count).toBe(6);
    });
  });

  describe('getStats', () => {
    it('should return extraction statistics', () => {
      const stats = extractor.getStats();

      expect(stats).toHaveProperty('processedFiles');
      expect(stats).toHaveProperty('withFrontmatter');
      expect(stats).toHaveProperty('withoutFrontmatter');
      expect(stats).toHaveProperty('totalWords');
      expect(stats).toHaveProperty('averageWordsPerDoc');
    });
  });
});
