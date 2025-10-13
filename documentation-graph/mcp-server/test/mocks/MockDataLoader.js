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
 * Mock DataLoader for unit tests
 * Provides controllable test data without file I/O
 */
export class MockDataLoader {
  constructor(fixtures = {}) {
    this.graph = fixtures.graph || { nodes: [], edges: [] };
    this.documents = fixtures.documents || [];
    this.concepts = fixtures.concepts || { topConcepts: [] };
    this.analysis = fixtures.analysis || {};

    this.indexes = {
      documentsByPath: new Map(),
      documentsByDirectory: new Map(),
      documentsByContentType: new Map(),
      conceptsByName: new Map(),
      documentsByConcept: new Map(),
    };

    this._buildIndexes();
  }

  async load() {
    // No-op for mocks
    return Promise.resolve();
  }

  _buildIndexes() {
    // Build document indexes
    for (const doc of this.documents) {
      this.indexes.documentsByPath.set(doc.path, doc);
      this.indexes.documentsByPath.set(doc.relativePath, doc);

      if (!this.indexes.documentsByDirectory.has(doc.directory)) {
        this.indexes.documentsByDirectory.set(doc.directory, []);
      }
      this.indexes.documentsByDirectory.get(doc.directory).push(doc);

      if (doc.frontmatter?.content_type) {
        const contentType = doc.frontmatter.content_type;
        if (!this.indexes.documentsByContentType.has(contentType)) {
          this.indexes.documentsByContentType.set(contentType, []);
        }
        this.indexes.documentsByContentType.get(contentType).push(doc);
      }
    }

    // Build concept indexes
    const topConcepts = this.concepts.topConcepts || [];
    for (const concept of topConcepts) {
      this.indexes.conceptsByName.set(concept.term.toLowerCase(), concept);

      for (const docId of concept.documents || []) {
        if (!this.indexes.documentsByConcept.has(concept.term)) {
          this.indexes.documentsByConcept.set(concept.term, []);
        }
        const doc = this.documents.find((d) => d.id === docId);
        if (doc) {
          this.indexes.documentsByConcept.get(concept.term).push(doc);
        }
      }
    }
  }

  getDocumentByPath(path) {
    return this.indexes.documentsByPath.get(path);
  }

  getDocumentsByDirectory(directory) {
    return this.indexes.documentsByDirectory.get(directory) || [];
  }

  getDocumentsByContentType(contentType) {
    return this.indexes.documentsByContentType.get(contentType) || [];
  }

  getConceptByName(name) {
    return this.indexes.conceptsByName.get(name.toLowerCase());
  }

  getDocumentsByConcept(concept) {
    return this.indexes.documentsByConcept.get(concept) || [];
  }
}
