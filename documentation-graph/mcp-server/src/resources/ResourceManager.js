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
 * ResourceManager - Optimized MCP Resources with pagination and compact output
 *
 * Exposes documentation analysis outputs as MCP resources with:
 * - Pagination support for large datasets
 * - Summary views without content fields
 * - Compact JSON (no pretty printing)
 * - Granular endpoints for specific data
 */

import { logger } from '../utils/logger.js';

export class ResourceManager {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
  }

  listResources() {
    return [
      // Full data with pagination
      {
        uri: 'docs://graph',
        name: 'Knowledge Graph',
        description:
          'Complete knowledge graph with nodes and edges. Supports ?limit and ?offset for pagination',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://documents',
        name: 'Extracted Documents (Summary)',
        description:
          'Document metadata without content field (lightweight). Supports ?limit=10&offset=0 for pagination. Use docs://documents/full for complete content.',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://documents/full',
        name: 'Extracted Documents (Full)',
        description:
          'All documentation files with full content. WARNING: Large response. Supports ?limit=10&offset=0 for pagination.',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://concepts',
        name: 'Extracted Concepts',
        description:
          'Top concepts with TF-IDF weights. Supports ?limit and ?offset for pagination',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://analysis/summary',
        name: 'Analysis Summary',
        description: 'High-level analysis metrics without full centrality data',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://analysis/hubs',
        name: 'Hub Documents',
        description: 'Top hub documents by centrality metrics',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://analysis/communities',
        name: 'Community Structure',
        description: 'Community detection and clustering results',
        mimeType: 'application/json',
      },

      // Summary views (lightweight, no content)
      {
        uri: 'docs://documents/list',
        name: 'Documents List',
        description: 'Simple list of document paths and titles',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://graph/summary',
        name: 'Graph Summary',
        description: 'Graph statistics without full node/edge data',
        mimeType: 'application/json',
      },

      // Granular endpoints
      {
        uri: 'docs://concepts/top',
        name: 'Top Concepts',
        description: 'Top 20 concepts by frequency',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://summary',
        name: 'Analysis Summary',
        description: 'High-level summary of documentation structure and metrics',
        mimeType: 'application/json',
      },
    ];
  }

  /**
   * Parse query parameters from URI
   * @param {string} uri - URI with optional query parameters
   * @returns {Object} { path: string, params: Object }
   */
  parseUri(uri) {
    const [path, queryString] = uri.split('?');
    const params = {};

    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      for (const [key, value] of searchParams) {
        params[key] = value;
      }
    }

    return { path, params };
  }

  /**
   * Apply pagination to an array
   * @param {Array} data - Data to paginate
   * @param {Object} params - Query parameters (limit, offset)
   * @returns {Object} { data: Array, metadata: Object }
   */
  paginate(data, params) {
    const limit = parseInt(params.limit) || 10;
    const offset = parseInt(params.offset) || 0;

    const paginatedData = data.slice(offset, offset + limit);

    return {
      data: paginatedData,
      metadata: {
        total: data.length,
        limit,
        offset,
        hasMore: offset + limit < data.length,
        nextOffset: offset + limit < data.length ? offset + limit : null
      }
    };
  }

  /**
   * Create a summary view of documents (no content field)
   * @param {Array} documents - Documents to summarize
   * @returns {Array} Documents without content field
   */
  createDocumentSummary(documents) {
    return documents.map(doc => ({
      path: doc.path,
      title: doc.title,
      directory: doc.directory,
      frontmatter: doc.frontmatter,
      wordCount: doc.wordCount,
      navigation: doc.navigation,
      links: {
        internal: doc.links?.internal?.length || 0,
        external: doc.links?.external?.length || 0
      }
    }));
  }

  async readResource(uri) {
    const { path, params } = this.parseUri(uri);
    logger.debug(`Reading resource: ${path} with params:`, params);

    switch (path) {
      case 'docs://graph': {
        const graphData = {
          nodes: this.dataLoader.graph.nodes,
          edges: this.dataLoader.graph.edges
        };

        // Apply pagination if requested
        if (params.limit) {
          const nodesPaginated = this.paginate(graphData.nodes, params);
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                nodes: nodesPaginated.data,
                edges: graphData.edges.filter(edge =>
                  nodesPaginated.data.some(n => n.id === edge.source) ||
                  nodesPaginated.data.some(n => n.id === edge.target)
                ),
                metadata: nodesPaginated.metadata
              })
            }]
          };
        }

        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(graphData)
          }]
        };
      }

      case 'docs://documents': {
        // Default to summary view (no content field) to prevent context overflow
        const paginated = this.paginate(this.dataLoader.documents, params);
        const summaryData = this.createDocumentSummary(paginated.data);
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              documents: summaryData,
              metadata: paginated.metadata
            })
          }]
        };
      }

      case 'docs://documents/full': {
        // Full documents with content field - use with caution (large responses)
        const paginated = this.paginate(this.dataLoader.documents, params);
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              documents: paginated.data,
              metadata: paginated.metadata
            })
          }]
        };
      }

      case 'docs://documents/summary': {
        // Backwards compatibility alias - redirects to docs://documents
        const paginated = this.paginate(this.dataLoader.documents, params);
        const summaryData = this.createDocumentSummary(paginated.data);
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              documents: summaryData,
              metadata: paginated.metadata
            })
          }]
        };
      }

      case 'docs://documents/list': {
        const documentList = this.dataLoader.documents.map(doc => ({
          path: doc.path,
          title: doc.title || doc.path.split('/').pop()
        }));
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(documentList)
          }]
        };
      }

      case 'docs://concepts': {
        const concepts = this.dataLoader.concepts.topConcepts || [];
        const paginated = this.paginate(concepts, params);
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              concepts: paginated.data,
              metadata: paginated.metadata
            })
          }]
        };
      }

      case 'docs://concepts/top': {
        const topConcepts = (this.dataLoader.concepts.topConcepts || [])
          .slice(0, 20)
          .map(c => ({
            concept: c.concept,
            frequency: c.frequency,
            fileCount: c.fileCount,
            weight: c.weight
          }));

        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(topConcepts)
          }]
        };
      }

      case 'docs://analysis/summary': {
        const summary = {
          basic: this.dataLoader.analysis.basic,
          topHubs: {
            byDegree: this.getTopNodesByCentrality('degree', 10),
            byBetweenness: this.getTopNodesByCentrality('betweenness', 10),
            byCloseness: this.getTopNodesByCentrality('closeness', 10)
          },
          communities: {
            count: this.dataLoader.analysis.communities?.count || 0,
            modularity: this.dataLoader.analysis.communities?.modularity || 0
          }
        };

        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(summary)
          }]
        };
      }

      case 'docs://analysis/hubs': {
        const limit = parseInt(params.limit) || 50;
        const metric = params.metric || 'degree';

        const hubs = this.getTopNodesByCentrality(metric, limit);

        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              metric,
              hubs,
              metadata: {
                total: hubs.length,
                metric
              }
            })
          }]
        };
      }

      case 'docs://analysis/communities': {
        const communities = this.dataLoader.analysis.communities || {};

        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(communities)
          }]
        };
      }

      case 'docs://graph/summary': {
        const summary = {
          statistics: {
            totalNodes: this.dataLoader.graph.nodes.length,
            totalEdges: this.dataLoader.graph.edges.length,
            nodeTypes: this.getNodeTypeDistribution(),
            edgeTypes: this.getEdgeTypeDistribution()
          },
          metrics: {
            avgDegree: this.calculateAvgDegree(),
            density: this.calculateGraphDensity(),
            components: this.dataLoader.analysis?.components || 1
          }
        };

        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(summary)
          }]
        };
      }

      case 'docs://summary': {
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(this.generateSummary())
          }]
        };
      }

      default:
        throw new Error(`Unknown resource URI: ${path}`);
    }
  }

  generateSummary() {
    return {
      documentation: {
        totalDocuments: this.dataLoader.documents.length,
        totalConcepts: this.dataLoader.concepts.topConcepts?.length || 0,
        directories: [...new Set(this.dataLoader.documents.map((d) => d.directory))].length,
        contentTypes: this.getContentTypeDistribution(),
      },
      graph: {
        totalNodes: this.dataLoader.graph.nodes.length,
        totalEdges: this.dataLoader.graph.edges.length,
        nodeTypes: this.getNodeTypeDistribution(),
        edgeTypes: this.getEdgeTypeDistribution(),
        density: this.calculateGraphDensity(),
      },
      topConcepts: this.dataLoader.concepts.topConcepts?.slice(0, 10).map((c) => ({
        concept: c.concept,
        frequency: c.frequency,
        fileCount: c.fileCount,
      })),
      orphanedDocuments: this.dataLoader.documents.filter((d) => d.navigation?.isOrphaned).length,
      queryHints: {
        pagination: 'Default limit is 10. Use ?limit=20&offset=0 to customize pagination',
        documents: 'docs://documents returns summary (no content). Use docs://documents/full for complete content',
        summaryViews: 'Use /summary endpoints for lightweight overviews',
        granularEndpoints: 'Use /top or /list endpoints for specific data subsets',
        analysisEndpoints: 'Use docs://analysis/summary for overview, docs://analysis/hubs?limit=50 for hub documents'
      }
    };
  }

  getContentTypeDistribution() {
    const distribution = new Map();
    for (const doc of this.dataLoader.documents) {
      const type = doc.frontmatter?.content_type || 'unknown';
      distribution.set(type, (distribution.get(type) || 0) + 1);
    }
    return Object.fromEntries(distribution);
  }

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

  calculateAvgDegree() {
    if (this.dataLoader.graph.nodes.length === 0) return 0;
    return (this.dataLoader.graph.edges.length * 2) / this.dataLoader.graph.nodes.length;
  }

  calculateGraphDensity() {
    const n = this.dataLoader.graph.nodes.length;
    if (n <= 1) return 0;
    const maxEdges = (n * (n - 1)) / 2;
    return this.dataLoader.graph.edges.length / maxEdges;
  }

  /**
   * Get top N nodes by centrality metric
   * @param {string} metric - Centrality metric (degree, betweenness, closeness)
   * @param {number} limit - Number of top nodes to return
   * @returns {Array} Top nodes with their centrality scores
   */
  getTopNodesByCentrality(metric, limit = 10) {
    const centralityData = this.dataLoader.analysis.centrality?.[metric];
    if (!centralityData || !centralityData.values) {
      return [];
    }

    // Convert centrality values object to sorted array
    const entries = Object.entries(centralityData.values)
      .map(([nodeId, score]) => {
        const node = this.dataLoader.graph.nodes.find(n => n.id === nodeId);
        return {
          nodeId,
          score,
          type: node?.type || 'unknown',
          label: node?.label || nodeId,
          path: node?.path || null
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return entries;
  }
}