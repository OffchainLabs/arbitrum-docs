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
 * DataLoader - Loads and indexes analysis outputs from the documentation-graph tool
 *
 * Loads all JSON files from dist/ and creates efficient indexes for fast querying
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { logger } from '../utils/logger.js';

export class DataLoader {
  constructor(distPath) {
    this.distPath = distPath;
    this.graph = null;
    this.documents = null;
    this.concepts = null;
    this.analysis = null;
    this.indexes = {
      documentsByPath: new Map(),
      documentsByDirectory: new Map(),
      documentsByContentType: new Map(),
      conceptsByName: new Map(),
      documentsByConcept: new Map(),
    };
  }

  async load() {
    const startTime = Date.now();
    logger.info('Loading analysis data...');

    try {
      // Load all JSON files
      const [graphData, documentsData, conceptsData, analysisData, fulltextIndex] =
        await Promise.all([
          this.loadJSON('knowledge-graph.json'),
          this.loadJSON('extracted-documents.json'),
          this.loadJSON('extracted-concepts.json'),
          this.loadJSON('graph-analysis.json'),
          this.loadJSON('fulltext-index.json').catch(() => null), // Optional, fallback to null
        ]);

      this.graph = graphData;
      this.documents = documentsData;
      this.concepts = conceptsData;
      this.analysis = analysisData;

      // Initialize full-text search engine
      if (fulltextIndex) {
        const { FullTextSearchEngine } = await import('../search/FullTextSearch.js');
        this.fullTextSearch = new FullTextSearchEngine(this.documents, fulltextIndex);
        logger.info(
          `Full-text search initialized with ${
            fulltextIndex.documents?.length || 0
          } indexed documents`,
        );
      }

      // Build indexes
      this.buildIndexes();

      const loadTime = Date.now() - startTime;
      logger.info(
        `Data loaded successfully in ${loadTime}ms (${this.documents.length} documents, ${
          this.concepts.topConcepts?.length || 0
        } concepts)`,
      );
    } catch (error) {
      logger.error('Failed to load data:', error);
      throw error;
    }
  }

  async loadJSON(filename) {
    const filePath = join(this.distPath, filename);
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  buildIndexes() {
    logger.debug('Building indexes...');

    // Index documents by path
    for (const doc of this.documents) {
      this.indexes.documentsByPath.set(doc.path, doc);
      this.indexes.documentsByPath.set(doc.relativePath, doc);

      // Index by directory
      if (!this.indexes.documentsByDirectory.has(doc.directory)) {
        this.indexes.documentsByDirectory.set(doc.directory, []);
      }
      this.indexes.documentsByDirectory.get(doc.directory).push(doc);

      // Index by content type
      const contentType = doc.frontmatter?.content_type || 'unknown';
      if (!this.indexes.documentsByContentType.has(contentType)) {
        this.indexes.documentsByContentType.set(contentType, []);
      }
      this.indexes.documentsByContentType.get(contentType).push(doc);
    }

    // Index concepts
    if (this.concepts.topConcepts) {
      for (const conceptEntry of this.concepts.topConcepts) {
        const conceptName = conceptEntry.concept.toLowerCase();
        this.indexes.conceptsByName.set(conceptName, conceptEntry);

        // Build reverse index: concept -> documents
        const files = conceptEntry.data?.files || {};
        const docPaths = Object.keys(files);

        if (!this.indexes.documentsByConcept.has(conceptName)) {
          this.indexes.documentsByConcept.set(conceptName, []);
        }

        for (const docPath of docPaths) {
          this.indexes.documentsByConcept.get(conceptName).push({
            path: docPath,
            weight: files[docPath] || 0,
          });
        }
      }
    }

    logger.debug(
      `Indexes built: ${this.indexes.documentsByPath.size} documents, ${this.indexes.conceptsByName.size} concepts`,
    );

    // Initialize QueryParser with fullTextSearch
    this.initializeQueryParser();
  }

  async initializeQueryParser() {
    const { QueryParser } = await import('./QueryParser.js');
    this.queryParser = new QueryParser(this.documents, this.concepts, this.fullTextSearch);
    logger.debug('QueryParser initialized with layered search support');
  }

  getDocument(pathOrRelativePath) {
    return this.indexes.documentsByPath.get(pathOrRelativePath);
  }

  getDocumentsByDirectory(directory) {
    return this.indexes.documentsByDirectory.get(directory) || [];
  }

  getDocumentsByContentType(contentType) {
    return this.indexes.documentsByContentType.get(contentType) || [];
  }

  getConcept(conceptName) {
    return this.indexes.conceptsByName.get(conceptName.toLowerCase());
  }

  getDocumentsForConcept(conceptName) {
    const entries = this.indexes.documentsByConcept.get(conceptName.toLowerCase());
    if (!entries) return [];

    // Resolve paths to full document objects
    return entries
      .map((entry) => ({
        document: this.getDocument(entry.path),
        weight: entry.weight,
      }))
      .filter((item) => item.document !== undefined);
  }

  getAllDocuments() {
    return this.documents;
  }

  getAllConcepts() {
    return this.concepts.topConcepts || [];
  }

  getGraphNode(nodeId) {
    return this.graph.nodes.find((n) => n.id === nodeId);
  }

  getGraphEdges(nodeId) {
    return this.graph.edges.filter((e) => e.source === nodeId || e.target === nodeId);
  }
}
