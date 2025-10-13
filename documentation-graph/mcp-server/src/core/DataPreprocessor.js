/**
 * DataPreprocessor - Generates compressed metadata and chunks large files
 *
 * Implements three-tier data access strategy by preprocessing documentation graph
 * data into optimized formats for fast querying.
 */

export class DataPreprocessor {
  // Configuration constants
  static MAX_TOP_CONCEPTS = 100;
  static MAX_DOCS_PER_CONCEPT = 100;
  static MAX_CONCEPTS_PER_DOC = 50;
  static DEFAULT_CHUNK_SIZE = 500 * 1024; // 500KB

  constructor({ graph, documents, concepts }) {
    if (!graph) {
      throw new Error('Graph data is required');
    }

    this.graph = graph;
    this.documents = documents || [];
    this.concepts = concepts || { topConcepts: [] };
  }

  /**
   * Normalize document path (prefer relativePath over path)
   */
  _getDocumentPath(doc) {
    return doc.relativePath || doc.path;
  }

  /**
   * Calculate JSON size in bytes
   */
  _calculateJsonSize(data) {
    return JSON.stringify(data).length;
  }

  /**
   * Sort and limit array by property
   */
  _sortAndLimit(array, sortFn, limit) {
    return array.slice(0, limit).sort(sortFn);
  }

  /**
   * Generate compressed metadata summary (~100KB target)
   * Contains node/edge counts, top concepts, document index
   */
  async generateMetadataSummary() {
    const summary = {
      nodeTypes: {},
      edgeTypes: {},
      topConcepts: [],
      documentIndex: {},
      conceptIndex: {},
    };

    // Count node types
    const nodes = this.graph.nodes || [];
    for (const node of nodes) {
      const type = node.type || 'unknown';
      summary.nodeTypes[type] = (summary.nodeTypes[type] || 0) + 1;
    }

    // Count edge types
    const edges = this.graph.edges || [];
    for (const edge of edges) {
      const type = edge.type || 'unknown';
      summary.edgeTypes[type] = (summary.edgeTypes[type] || 0) + 1;
    }

    // Extract and sort top concepts (max 100)
    const conceptsList = this.concepts.topConcepts || [];
    const topConcepts = this._sortAndLimit(
      conceptsList,
      (a, b) => b.frequency - a.frequency,
      DataPreprocessor.MAX_TOP_CONCEPTS,
    );
    summary.topConcepts = topConcepts.map((c) => ({
      concept: c.term,
      frequency: c.frequency,
      fileCount: c.documents?.length || 0,
      weight: c.totalWeight || 0,
    }));

    // Build document index (path -> nodeId)
    for (const doc of this.documents) {
      const docPath = this._getDocumentPath(doc);
      if (docPath) {
        summary.documentIndex[docPath] = {
          id: doc.id,
          title: doc.frontmatter?.title || doc.fileName,
          directory: doc.directory,
          contentType: doc.frontmatter?.content_type,
        };
      }
    }

    // Build concept index (concept -> document count)
    for (const concept of conceptsList) {
      summary.conceptIndex[concept.term] = {
        frequency: concept.frequency,
        documentCount: concept.documents?.length || 0,
      };
    }

    return summary;
  }

  /**
   * Build inverted indexes for fast lookup
   * Returns Maps for concept->documents and document->concepts
   */
  async buildInvertedIndexes() {
    const indexes = {
      conceptToDocuments: new Map(),
      documentToConcepts: new Map(),
      documentToSimilar: new Map(),
    };

    // Build concept -> documents mapping
    const conceptsList = this.concepts.topConcepts || [];
    for (const concept of conceptsList) {
      const normalizedTerm = concept.term.toLowerCase();

      if (!indexes.conceptToDocuments.has(normalizedTerm)) {
        indexes.conceptToDocuments.set(normalizedTerm, []);
      }

      // Get documents for this concept
      const docIds = concept.documents || [];
      const docsWithWeights = [];

      for (const docId of docIds.slice(0, DataPreprocessor.MAX_DOCS_PER_CONCEPT)) {
        const doc = this.documents.find((d) => d.id === docId);
        if (doc) {
          docsWithWeights.push({
            id: doc.id,
            path: this._getDocumentPath(doc),
            weight: concept.averageWeight || 1,
          });
        }
      }

      // Sort by weight descending
      docsWithWeights.sort((a, b) => b.weight - a.weight);
      indexes.conceptToDocuments.set(normalizedTerm, docsWithWeights);
    }

    // Build document -> concepts mapping
    for (const doc of this.documents) {
      const docPath = this._getDocumentPath(doc);
      const docConcepts = this._buildDocumentConcepts(doc, conceptsList);

      // Sort by weight descending and limit
      const sortedConcepts = this._sortAndLimit(
        docConcepts,
        (a, b) => b.weight - a.weight,
        DataPreprocessor.MAX_CONCEPTS_PER_DOC,
      );
      indexes.documentToConcepts.set(docPath, sortedConcepts);
    }

    return indexes;
  }

  /**
   * Build concepts list for a document
   */
  _buildDocumentConcepts(doc, conceptsList) {
    const docConcepts = [];

    // Find concepts that mention this document
    for (const concept of conceptsList) {
      if (concept.documents?.includes(doc.id)) {
        docConcepts.push({
          concept: concept.term,
          weight: concept.averageWeight || 1,
          frequency: concept.frequency,
        });
      }
    }

    // Also include concepts from document's concept array
    if (doc.concepts && Array.isArray(doc.concepts)) {
      for (const conceptName of doc.concepts) {
        if (!docConcepts.find((c) => c.concept === conceptName)) {
          const conceptData = conceptsList.find((c) => c.term === conceptName);
          docConcepts.push({
            concept: conceptName,
            weight: conceptData?.averageWeight || 1,
            frequency: conceptData?.frequency || 1,
          });
        }
      }
    }

    return docConcepts;
  }

  /**
   * Build similarity matrix for top N documents
   * Sparse format: only pairs with similarity >= threshold
   */
  async buildSimilarityMatrix({ top = 100, minSimilarity = 0.6 } = {}) {
    const matrix = [];

    // Get top documents (by concept count or word count)
    const sortedDocs = [...this.documents]
      .sort((a, b) => {
        const aScore = (a.concepts?.length || 0) * (a.wordCount || 1);
        const bScore = (b.concepts?.length || 0) * (b.wordCount || 1);
        return bScore - aScore;
      })
      .slice(0, top);

    // Calculate similarity for pairs
    for (let i = 0; i < sortedDocs.length; i++) {
      for (let j = i + 1; j < sortedDocs.length; j++) {
        const doc1 = sortedDocs[i];
        const doc2 = sortedDocs[j];

        const similarity = this._calculateConceptSimilarity(doc1, doc2);

        if (similarity >= minSimilarity) {
          matrix.push({
            doc1: this._getDocumentPath(doc1),
            doc2: this._getDocumentPath(doc2),
            similarity: Math.round(similarity * 1000) / 1000, // 3 decimal places
          });
        }
      }
    }

    return matrix;
  }

  /**
   * Calculate concept-based similarity between two documents
   */
  _calculateConceptSimilarity(doc1, doc2) {
    const concepts1 = new Set(doc1.concepts || []);
    const concepts2 = new Set(doc2.concepts || []);

    if (concepts1.size === 0 || concepts2.size === 0) {
      return 0;
    }

    // Jaccard similarity
    const intersection = new Set([...concepts1].filter((c) => concepts2.has(c)));
    const union = new Set([...concepts1, ...concepts2]);

    return intersection.size / union.size;
  }

  /**
   * Chunk large data into smaller files
   * Returns chunks array and optional manifest
   */
  async chunkLargeFiles({
    data,
    maxChunkSize = DataPreprocessor.DEFAULT_CHUNK_SIZE,
    createManifest = false,
  }) {
    const chunks = [];
    const warnings = [];
    const itemToChunkMap = {};

    let currentChunk = [];
    let currentSize = 0;

    for (const item of data) {
      const itemSize = this._calculateJsonSize(item);

      // If single item exceeds max size, put in its own chunk with warning
      if (itemSize > maxChunkSize) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = [];
          currentSize = 0;
        }

        chunks.push([item]);
        itemToChunkMap[item.id] = chunks.length - 1;
        warnings.push({
          item: item.id,
          size: itemSize,
          message: `Item exceeds max chunk size (${itemSize} > ${maxChunkSize})`,
        });
        continue;
      }

      // If adding item would exceed max size, start new chunk
      if (currentSize + itemSize > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentSize = 0;
      }

      currentChunk.push(item);
      currentSize += itemSize;
      itemToChunkMap[item.id] = chunks.length;
    }

    // Add remaining items
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    // Always return an object with chunks property
    const result = {
      chunks,
      warnings,
    };

    if (createManifest) {
      result.manifest = {
        chunkCount: chunks.length,
        itemToChunkMap,
        chunkSizes: chunks.map((c) => JSON.stringify(c).length),
        totalItems: data.length,
      };
    }

    return result;
  }

  /**
   * Run complete preprocessing pipeline
   * Generates all optimized outputs
   */
  async runFullPipeline() {
    const startTime = Date.now();
    const result = {
      metadata: null,
      indexes: null,
      similarityMatrix: null,
      chunks: null,
      stats: {},
    };

    // Calculate original sizes
    const originalSizes = {
      graph: this._calculateJsonSize(this.graph),
      documents: this._calculateJsonSize(this.documents),
      concepts: this._calculateJsonSize(this.concepts),
    };

    // Generate metadata summary
    const metadataStart = Date.now();
    result.metadata = await this.generateMetadataSummary();
    const metadataTime = Date.now() - metadataStart;

    // Build inverted indexes
    const indexStart = Date.now();
    result.indexes = await this.buildInvertedIndexes();
    const indexTime = Date.now() - indexStart;

    // Build similarity matrix
    const simStart = Date.now();
    result.similarityMatrix = await this.buildSimilarityMatrix();
    const simTime = Date.now() - simStart;

    // Chunk documents
    const chunkStart = Date.now();
    result.chunks = await this.chunkLargeFiles({
      data: this.documents,
      maxChunkSize: DataPreprocessor.DEFAULT_CHUNK_SIZE,
      createManifest: true,
    });
    const chunkTime = Date.now() - chunkStart;

    // Calculate preprocessed sizes
    const preprocessedSizes = {
      metadata: this._calculateJsonSize(result.metadata),
      indexes: this._calculateMapIndexSize(result.indexes),
      similarityMatrix: this._calculateJsonSize(result.similarityMatrix),
      chunks: result.chunks.chunks.reduce((sum, c) => sum + this._calculateJsonSize(c), 0),
    };

    // Calculate stats
    const totalOriginalSize = Object.values(originalSizes).reduce((a, b) => a + b, 0);
    const totalPreprocessedSize = Object.values(preprocessedSizes).reduce((a, b) => a + b, 0);

    result.stats = {
      originalSizes,
      preprocessedSizes,
      compressionRatio: totalPreprocessedSize / totalOriginalSize,
      processingTime: {
        metadata: metadataTime,
        indexes: indexTime,
        similarityMatrix: simTime,
        chunks: chunkTime,
      },
      totalTime: Date.now() - startTime,
    };

    return result;
  }

  /**
   * Calculate size of Map-based indexes
   */
  _calculateMapIndexSize(indexes) {
    let size = 0;

    for (const [key, value] of indexes.conceptToDocuments || new Map()) {
      size += key.length + this._calculateJsonSize(value);
    }

    for (const [key, value] of indexes.documentToConcepts || new Map()) {
      size += key.length + this._calculateJsonSize(value);
    }

    return size;
  }
}
