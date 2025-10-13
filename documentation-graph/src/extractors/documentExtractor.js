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

import matter from 'gray-matter';
import path from 'path';
import FileUtils from '../utils/fileUtils.js';
import logger from '../utils/logger.js';
import { extractionConfig } from '../../config/extraction-config.js';
import SidebarExtractor from './sidebarExtractor.js';

export class DocumentExtractor {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.documents = new Map();
    this.sidebarExtractor = new SidebarExtractor(baseDir);
    this.sidebarData = null;
    this.stats = {
      totalFiles: 0,
      processedFiles: 0,
      errorFiles: 0,
      withFrontmatter: 0,
      withoutFrontmatter: 0,
      inNavigation: 0,
      orphanedFiles: 0
    };
  }

  async extractAll() {
    logger.section('Document Extraction Phase');
    
    // First extract sidebar information
    this.sidebarData = await this.sidebarExtractor.extractSidebars();
    
    // Find all documentation files
    const files = await FileUtils.findDocumentationFiles(
      this.baseDir,
      extractionConfig.filePatterns,
      extractionConfig.excludePatterns
    );

    this.stats.totalFiles = files.length;
    logger.info(`Found ${files.length} documentation files to process`);

    // Process files in chunks to avoid memory issues
    const chunkSize = 30;
    const progressBar = logger.createProgressBar('Extracting documents', files.length);

    for (let i = 0; i < files.length; i += chunkSize) {
      const chunk = files.slice(i, i + chunkSize);
      await this.processChunk(chunk, progressBar);
    }

    progressBar.terminate();
    
    // Analyze sidebar coverage
    this.analyzeSidebarCoverage();
    
    logger.success(`Processed ${this.stats.processedFiles} documents successfully`);
    logger.info(`Navigation coverage: ${this.stats.inNavigation}/${this.stats.processedFiles} documents in sidebars`);
    
    if (this.stats.errorFiles > 0) {
      logger.warn(`Failed to process ${this.stats.errorFiles} documents`);
    }
    
    if (this.stats.orphanedFiles > 0) {
      logger.warn(`Found ${this.stats.orphanedFiles} documents not referenced in navigation`);
    }

    return {
      documents: this.documents,
      sidebarData: this.enhanceSidebarDataWithAnalyzer(this.sidebarData)
    };
  }

  async processChunk(files, progressBar) {
    const promises = files.map(async (filePath) => {
      try {
        const document = await this.extractDocument(filePath);
        if (document) {
          this.documents.set(filePath, document);
          this.stats.processedFiles++;
          
          if (document.frontmatter && Object.keys(document.frontmatter).length > 0) {
            this.stats.withFrontmatter++;
          } else {
            this.stats.withoutFrontmatter++;
          }
        }
      } catch (error) {
        logger.error(`Error processing ${filePath}:`, error.message);
        this.stats.errorFiles++;
      }
      progressBar.tick();
    });

    await Promise.all(promises);
  }

  async extractDocument(filePath) {
    const content = await FileUtils.readFile(filePath);
    if (!content) {
      return null;
    }

    const relativePath = FileUtils.getRelativePath(filePath, this.baseDir);
    const stats = await FileUtils.getFileStats(filePath);
    
    // Parse frontmatter and content
    const { data: frontmatter, content: bodyContent } = matter(content);

    // Extract basic structure
    const headings = this.extractHeadings(bodyContent);
    const links = this.extractLinks(bodyContent, relativePath);
    const codeBlocks = this.extractCodeBlocks(bodyContent);
    const imports = this.extractImports(bodyContent);

    // Calculate basic metrics
    const wordCount = this.countWords(bodyContent);
    const lineCount = bodyContent.split('\n').length;

    // Get sidebar metadata
    const sidebarMetadata = this.extractSidebarMetadata(relativePath);

    return {
      filePath,
      relativePath,
      fileName: FileUtils.getFileName(filePath),
      directory: FileUtils.getDirectoryName(relativePath),
      extension: FileUtils.getFileExtension(filePath),
      frontmatter,
      content: bodyContent,
      headings,
      links,
      codeBlocks,
      imports,
      navigation: sidebarMetadata,
      stats: {
        size: stats?.size || 0,
        wordCount,
        lineCount,
        headingCount: headings.length,
        linkCount: links.internal.length + links.external.length + links.anchor.length,
        codeBlockCount: codeBlocks.length,
        lastModified: stats?.mtime || new Date()
      }
    };
  }

  extractHeadings(content) {
    const headings = [];
    
    for (const [level, pattern] of Object.entries(extractionConfig.headingPatterns)) {
      const matches = Array.from(content.matchAll(pattern));
      for (const match of matches) {
        headings.push({
          level: parseInt(level.substring(1)), // h1 -> 1
          text: match[1].trim(),
          id: this.generateHeadingId(match[1].trim())
        });
      }
    }

    return headings.sort((a, b) => {
      // Sort by position in content
      const aPos = content.indexOf(a.text);
      const bPos = content.indexOf(b.text);
      return aPos - bPos;
    });
  }

  extractLinks(content, currentPath) {
    const links = {
      internal: [],
      external: [],
      anchor: []
    };

    // Internal links (to other MD/MDX files)
    const internalMatches = Array.from(content.matchAll(extractionConfig.linkPatterns.internal));
    for (const match of internalMatches) {
      const [, text, href] = match;
      links.internal.push({
        text: text.trim(),
        href: href.trim(),
        resolvedPath: this.resolvePath(href.trim(), currentPath)
      });
    }

    // External links
    const externalMatches = Array.from(content.matchAll(extractionConfig.linkPatterns.external));
    for (const match of externalMatches) {
      const [, text, href] = match;
      links.external.push({
        text: text.trim(),
        href: href.trim()
      });
    }

    // Anchor links
    const anchorMatches = Array.from(content.matchAll(extractionConfig.linkPatterns.anchor));
    for (const match of anchorMatches) {
      const [, text, href] = match;
      links.anchor.push({
        text: text.trim(),
        href: href.trim()
      });
    }

    return links;
  }

  extractCodeBlocks(content) {
    const codeBlocks = [];
    
    const matches = Array.from(content.matchAll(extractionConfig.codeBlockPatterns.fenced));
    for (const match of matches) {
      const [, language, code] = match;
      codeBlocks.push({
        language: language || 'text',
        code: code.trim(),
        lineCount: code.split('\n').length
      });
    }

    return codeBlocks;
  }

  extractImports(content) {
    const imports = [];
    
    const mdxMatches = Array.from(content.matchAll(extractionConfig.importPatterns.mdx));
    for (const match of mdxMatches) {
      imports.push({
        type: 'mdx',
        path: match[1]
      });
    }

    const docusaurusMatches = Array.from(content.matchAll(extractionConfig.importPatterns.docusaurus));
    for (const match of docusaurusMatches) {
      imports.push({
        type: 'docusaurus',
        path: match[0]
      });
    }

    return imports;
  }

  generateHeadingId(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  resolvePath(href, currentPath) {
    if (href.startsWith('/')) {
      return href;
    }
    
    const currentDir = path.dirname(currentPath);
    return path.normalize(path.join(currentDir, href));
  }

  countWords(content) {
    // Remove code blocks and other non-text elements for more accurate word count
    const cleanContent = content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with just text
      .replace(/[#*_~`]/g, '') // Remove markdown formatting
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return cleanContent ? cleanContent.split(' ').length : 0;
  }

  extractSidebarMetadata(relativePath) {
    if (!this.sidebarData || !this.sidebarData.structure) {
      return {
        inNavigation: false,
        navigationPaths: [],
        depth: 0,
        siblings: [],
        categories: [],
        isEntryPoint: false,
        isOrphaned: true
      };
    }

    // Convert file path to document ID
    const documentId = this.convertPathToDocumentId(relativePath);
    
    // Get navigation paths from sidebar extractor
    const navigationPaths = this.sidebarExtractor.getNavigationPath(documentId);
    const depth = this.sidebarExtractor.getNavigationDepth(documentId);
    const siblings = this.sidebarExtractor.getDocumentSiblings(documentId);
    
    // Extract category information from paths
    const categories = [];
    const isEntryPoint = this.checkIfEntryPoint(navigationPaths);
    
    for (const path of navigationPaths) {
      if (path.length > 2) { // More than just sidebar name and document
        // Categories are all items except sidebar name and final document
        const pathCategories = path.slice(1, -1);
        categories.push(...pathCategories);
      }
    }

    return {
      inNavigation: navigationPaths.length > 0,
      navigationPaths,
      depth,
      siblings,
      categories: [...new Set(categories)], // Remove duplicates
      isEntryPoint,
      isOrphaned: navigationPaths.length === 0
    };
  }

  convertPathToDocumentId(relativePath) {
    // Convert 'docs/build-decentralized-apps/quickstart-solidity-remix.mdx' 
    // to 'build-decentralized-apps/quickstart-solidity-remix'
    
    if (relativePath.startsWith('docs/')) {
      let docId = relativePath.substring(5); // Remove 'docs/' prefix
      
      // Remove file extension
      const extMatch = docId.match(/\.(mdx?|md)$/);
      if (extMatch) {
        docId = docId.replace(extMatch[0], '');
      }
      
      // Handle numeric prefixes (Docusaurus pattern)
      // Convert 'path/01-get-started' to 'path/get-started'
      const pathParts = docId.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // Check if filename starts with numeric prefix pattern (01-, 02-, etc.)
      const numericPrefixMatch = fileName.match(/^(\d{2})-(.+)$/);
      if (numericPrefixMatch) {
        pathParts[pathParts.length - 1] = numericPrefixMatch[2]; // Remove numeric prefix
        docId = pathParts.join('/');
      }
      
      return docId;
    }
    
    return relativePath;
  }

  checkIfEntryPoint(navigationPaths) {
    // A document is an entry point if it appears at depth 1 or 2 in any sidebar
    for (const path of navigationPaths) {
      if (path.length <= 3) { // sidebar -> category? -> document
        return true;
      }
    }
    return false;
  }

  analyzeSidebarCoverage() {
    if (!this.sidebarData || !this.sidebarData.documentPaths) {
      return;
    }

    // Count documents in navigation vs. total documents
    for (const [filePath, document] of this.documents.entries()) {
      if (document.navigation && document.navigation.inNavigation) {
        this.stats.inNavigation++;
      } else {
        this.stats.orphanedFiles++;
      }
    }
  }

  getSidebarAnalysis() {
    if (!this.sidebarData) {
      return null;
    }

    const analysis = {
      totalSidebars: this.sidebarData.metrics.totalSidebars,
      totalSidebarEntries: this.sidebarData.metrics.totalEntries,
      documentsInSidebars: this.sidebarData.metrics.totalDocuments,
      totalCategories: this.sidebarData.metrics.totalCategories,
      externalLinks: this.sidebarData.metrics.totalLinks,
      maxNavigationDepth: this.sidebarData.metrics.maxDepth,
      orphanedSidebarEntries: this.sidebarData.metrics.orphanedEntries,
      navigationCoverage: this.stats.processedFiles > 0 ? 
        (this.stats.inNavigation / this.stats.processedFiles) : 0,
      categoryStructure: this.sidebarExtractor.getCategoryStructure()
    };

    // Find documents that exist but are not in navigation
    const orphanedDocuments = [];
    for (const [filePath, document] of this.documents.entries()) {
      if (document.navigation && document.navigation.isOrphaned) {
        orphanedDocuments.push({
          path: document.relativePath,
          title: document.frontmatter?.title || document.fileName,
          directory: document.directory,
          wordCount: document.stats.wordCount
        });
      }
    }
    
    analysis.orphanedDocuments = orphanedDocuments.slice(0, 20); // Limit for report

    // Find sidebar entries that point to non-existent documents
    const brokenSidebarEntries = [];
    if (this.sidebarData.documentPaths) {
      for (const docPath of this.sidebarData.documentPaths) {
        const fullPath = path.join(this.baseDir, 'docs', docPath + '.mdx');
        const altPath = path.join(this.baseDir, 'docs', docPath + '.md');
        
        if (!FileUtils.existsSync(fullPath) && !FileUtils.existsSync(altPath)) {
          brokenSidebarEntries.push(docPath);
        }
      }
    }
    
    analysis.brokenSidebarEntries = brokenSidebarEntries.slice(0, 20);

    return analysis;
  }

  getStats() {
    const baseStats = {
      ...this.stats,
      documentsExtracted: this.documents.size,
      averageWordsPerDoc: this.stats.processedFiles > 0 
        ? Math.round([...this.documents.values()].reduce((sum, doc) => sum + doc.stats.wordCount, 0) / this.stats.processedFiles)
        : 0
    };

    // Add sidebar-related statistics
    const sidebarAnalysis = this.getSidebarAnalysis();
    if (sidebarAnalysis) {
      baseStats.sidebarAnalysis = sidebarAnalysis;
    }

    return baseStats;
  }

  enhanceSidebarDataWithAnalyzer(sidebarData) {
    // Enhance sidebar data with the analyzer methods from SidebarExtractor
    if (!sidebarData) {
      return null;
    }

    // Add the analyzeSidebarAsRoot method to the sidebarData object
    return {
      ...sidebarData,
      analyzeSidebarAsRoot: () => this.sidebarExtractor.analyzeSidebarAsRoot(),
      // Also add other useful methods from SidebarExtractor
      getNavigationPath: (documentId) => this.sidebarExtractor.getNavigationPath(documentId),
      getNavigationDepth: (documentId) => this.sidebarExtractor.getNavigationDepth(documentId),
      getDocumentSiblings: (documentId) => this.sidebarExtractor.getDocumentSiblings(documentId),
      getCategoryStructure: () => this.sidebarExtractor.getCategoryStructure(),
      getStats: () => this.sidebarExtractor.getStats()
    };
  }
}

export default DocumentExtractor;