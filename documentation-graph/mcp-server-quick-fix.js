/**
 * Quick Fix Implementation for MCP Server Context Overflow
 *
 * This file demonstrates the minimal changes needed to ResourceManager.js
 * to implement Phase 1 quick wins that will immediately reduce context usage.
 */

// Enhanced ResourceManager with pagination and summary views
export class OptimizedResourceManager {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
  }

  listResources() {
    return [
      // Original resources (kept for compatibility)
      {
        uri: 'docs://graph',
        name: 'Knowledge Graph',
        description: 'Complete knowledge graph with nodes and edges',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://documents',
        name: 'Extracted Documents',
        description: 'All documentation files with metadata and content (use ?limit=N for pagination)',
        mimeType: 'application/json',
      },

      // New optimized resources
      {
        uri: 'docs://documents/summary',
        name: 'Documents Summary',
        description: 'Lightweight document listing without content (metadata only)',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://documents/list',
        name: 'Document Paths',
        description: 'Simple list of document paths and titles',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://graph/summary',
        name: 'Graph Summary',
        description: 'Graph statistics without full node/edge data',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://concepts',
        name: 'Extracted Concepts',
        description: 'Top concepts with weights and distribution',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://concepts/top',
        name: 'Top Concepts',
        description: 'Top 20 concepts only',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://analysis',
        name: 'Graph Analysis',
        description: 'Centrality metrics and structural analysis',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://summary',
        name: 'Analysis Summary',
        description: 'High-level summary of documentation structure',
        mimeType: 'application/json',
      },
    ];
  }

  parseResourceURI(uri) {
    // Parse URI to extract resource path and query parameters
    const match = uri.match(/^docs:\/\/([^?]+)(\?(.+))?$/);
    if (!match) {
      throw new Error(`Invalid resource URI: ${uri}`);
    }

    const resourcePath = match[1];
    const queryString = match[3] || '';

    // Parse query parameters
    const params = {};
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      for (const [key, value] of searchParams) {
        // Convert numeric parameters
        if (key === 'limit' || key === 'offset') {
          params[key] = parseInt(value, 10);
        } else {
          params[key] = value;
        }
      }
    }

    return { resourcePath, params };
  }

  async readResource(uri) {
    const { resourcePath, params } = this.parseResourceURI(uri);

    switch (resourcePath) {
      case 'graph':
        return this.getGraph(params);

      case 'graph/summary':
        return this.getGraphSummary();

      case 'documents':
        return this.getDocuments(params);

      case 'documents/summary':
        return this.getDocumentsSummary(params);

      case 'documents/list':
        return this.getDocumentsList(params);

      case 'concepts':
        return this.getConcepts(params);

      case 'concepts/top':
        return this.getTopConcepts(params);

      case 'analysis':
        return this.getAnalysis();

      case 'summary':
        return this.getSummary();

      default:
        // Check if it's a specific document request
        if (resourcePath.startsWith('documents/')) {
          const docId = resourcePath.substring('documents/'.length);
          return this.getDocument(docId);
        }
        throw new Error(`Unknown resource URI: ${uri}`);
    }
  }

  // Original methods with pagination support
  getDocuments({ limit = 50, offset = 0 } = {}) {
    const allDocs = this.dataLoader.documents;
    const totalCount = allDocs.length;

    // Apply pagination
    const paginatedDocs = allDocs.slice(offset, offset + limit);

    const response = {
      total: totalCount,
      offset,
      limit,
      hasMore: offset + limit < totalCount,
      documents: paginatedDocs,
    };

    return {
      contents: [{
        uri: `docs://documents?limit=${limit}&offset=${offset}`,
        mimeType: 'application/json',
        text: JSON.stringify(response), // Compact JSON (no pretty printing)
      }],
    };
  }

  // New lightweight summary view (no content field)
  getDocumentsSummary({ limit = 100, offset = 0, directory, content_type } = {}) {
    let docs = this.dataLoader.documents;

    // Apply filters
    if (directory) {
      docs = docs.filter(d => d.directory === directory);
    }
    if (content_type) {
      docs = docs.filter(d => d.frontmatter?.content_type === content_type);
    }

    const totalCount = docs.length;

    // Create summary objects without content
    const summaries = docs.slice(offset, offset + limit).map(doc => ({
      path: doc.relativePath,
      title: doc.frontmatter?.title || doc.fileName,
      directory: doc.directory,
      content_type: doc.frontmatter?.content_type,
      wordCount: doc.stats?.words || 0,
      linkCount: doc.links?.internal?.length || 0,
      isOrphaned: doc.navigation?.isOrphaned || false,
      lastModified: doc.stats?.modified,
    }));

    const response = {
      total: totalCount,
      offset,
      limit,
      hasMore: offset + limit < totalCount,
      filters: { directory, content_type },
      documents: summaries,
    };

    return {
      contents: [{
        uri: 'docs://documents/summary',
        mimeType: 'application/json',
        text: JSON.stringify(response),
      }],
    };
  }

  // Ultra-lightweight list view
  getDocumentsList({ directory } = {}) {
    let docs = this.dataLoader.documents;

    if (directory) {
      docs = docs.filter(d => d.directory === directory);
    }

    const list = docs.map(doc => ({
      path: doc.relativePath,
      title: doc.frontmatter?.title || doc.fileName,
    }));

    return {
      contents: [{
        uri: 'docs://documents/list',
        mimeType: 'application/json',
        text: JSON.stringify(list),
      }],
    };
  }

  // Get single document by path
  getDocument(docPath) {
    const doc = this.dataLoader.getDocument(docPath);

    if (!doc) {
      throw new Error(`Document not found: ${docPath}`);
    }

    return {
      contents: [{
        uri: `docs://documents/${docPath}`,
        mimeType: 'application/json',
        text: JSON.stringify(doc),
      }],
    };
  }

  // Graph summary without full node/edge data
  getGraphSummary() {
    const graph = this.dataLoader.graph;

    const summary = {
      statistics: {
        totalNodes: graph.nodes.length,
        totalEdges: graph.edges.length,
        nodeTypes: this.getNodeTypeDistribution(),
        edgeTypes: this.getEdgeTypeDistribution(),
      },
      topNodes: graph.nodes
        .filter(n => n.type === 'document')
        .sort((a, b) => (b.attributes?.centrality || 0) - (a.attributes?.centrality || 0))
        .slice(0, 10)
        .map(n => ({
          id: n.id,
          label: n.label,
          type: n.type,
          centrality: n.attributes?.centrality,
        })),
    };

    return {
      contents: [{
        uri: 'docs://graph/summary',
        mimeType: 'application/json',
        text: JSON.stringify(summary),
      }],
    };
  }

  // Original graph method (kept for compatibility)
  getGraph({ limit } = {}) {
    let graphData = this.dataLoader.graph;

    // If limit specified, return subset
    if (limit) {
      graphData = {
        nodes: graphData.nodes.slice(0, limit),
        edges: graphData.edges.filter(e =>
          graphData.nodes.slice(0, limit).some(n => n.id === e.source) &&
          graphData.nodes.slice(0, limit).some(n => n.id === e.target)
        ),
      };
    }

    return {
      contents: [{
        uri: 'docs://graph',
        mimeType: 'application/json',
        text: JSON.stringify(graphData),
      }],
    };
  }

  // Top concepts only
  getTopConcepts({ limit = 20 } = {}) {
    const concepts = this.dataLoader.concepts.topConcepts || [];

    const topConcepts = concepts.slice(0, limit).map(c => ({
      concept: c.concept,
      frequency: c.frequency,
      fileCount: c.fileCount,
      weight: c.weight,
    }));

    return {
      contents: [{
        uri: 'docs://concepts/top',
        mimeType: 'application/json',
        text: JSON.stringify(topConcepts),
      }],
    };
  }

  // Original concepts method with pagination
  getConcepts({ limit = 50, offset = 0 } = {}) {
    const allConcepts = this.dataLoader.concepts.topConcepts || [];
    const totalCount = allConcepts.length;

    const paginatedConcepts = allConcepts.slice(offset, offset + limit);

    const response = {
      total: totalCount,
      offset,
      limit,
      hasMore: offset + limit < totalCount,
      concepts: paginatedConcepts,
    };

    return {
      contents: [{
        uri: `docs://concepts?limit=${limit}&offset=${offset}`,
        mimeType: 'application/json',
        text: JSON.stringify(response),
      }],
    };
  }

  // Original analysis method
  getAnalysis() {
    return {
      contents: [{
        uri: 'docs://analysis',
        mimeType: 'application/json',
        text: JSON.stringify(this.dataLoader.analysis),
      }],
    };
  }

  // Enhanced summary with better structure
  getSummary() {
    const summary = {
      overview: {
        lastUpdated: new Date().toISOString(),
        documentCount: this.dataLoader.documents.length,
        conceptCount: this.dataLoader.concepts.topConcepts?.length || 0,
        graphNodes: this.dataLoader.graph.nodes.length,
        graphEdges: this.dataLoader.graph.edges.length,
      },
      directories: this.getDirectorySummary(),
      contentTypes: this.getContentTypeDistribution(),
      topConcepts: (this.dataLoader.concepts.topConcepts || [])
        .slice(0, 10)
        .map(c => ({
          concept: c.concept,
          frequency: c.frequency,
        })),
      orphanedContent: {
        count: this.dataLoader.documents.filter(d => d.navigation?.isOrphaned).length,
        percentage: (
          (this.dataLoader.documents.filter(d => d.navigation?.isOrphaned).length /
            this.dataLoader.documents.length) * 100
        ).toFixed(1),
      },
      recommendations: [
        'Use docs://documents/summary for lightweight document listing',
        'Use docs://documents?limit=20 for paginated full documents',
        'Use docs://graph/summary for graph statistics without full data',
        'Use docs://concepts/top for quick concept overview',
      ],
    };

    return {
      contents: [{
        uri: 'docs://summary',
        mimeType: 'application/json',
        text: JSON.stringify(summary),
      }],
    };
  }

  // Helper methods
  getNodeTypeDistribution() {
    const distribution = new Map();
    for (const node of this.dataLoader.graph.nodes) {
      distribution.set(node.type, (distribution.get(node.type) || 0) + 1);
    }
    return Object.fromEntries(distribution);
  }

  getEdgeTypeDistribution() {
    const distribution = new Map();
    for (const edge of this.dataLoader.graph.edges) {
      distribution.set(edge.type, (distribution.get(edge.type) || 0) + 1);
    }
    return Object.fromEntries(distribution);
  }

  getContentTypeDistribution() {
    const distribution = new Map();
    for (const doc of this.dataLoader.documents) {
      const type = doc.frontmatter?.content_type || 'unknown';
      distribution.set(type, (distribution.get(type) || 0) + 1);
    }
    return Object.fromEntries(distribution);
  }

  getDirectorySummary() {
    const dirMap = new Map();

    for (const doc of this.dataLoader.documents) {
      if (!dirMap.has(doc.directory)) {
        dirMap.set(doc.directory, {
          name: doc.directory,
          documentCount: 0,
          orphanedCount: 0,
        });
      }

      const dir = dirMap.get(doc.directory);
      dir.documentCount++;
      if (doc.navigation?.isOrphaned) {
        dir.orphanedCount++;
      }
    }

    return Array.from(dirMap.values())
      .sort((a, b) => b.documentCount - a.documentCount)
      .slice(0, 10);
  }
}

// Usage example:
// Replace the existing ResourceManager import in index.js with:
// import { OptimizedResourceManager as ResourceManager } from './resources/OptimizedResourceManager.js';