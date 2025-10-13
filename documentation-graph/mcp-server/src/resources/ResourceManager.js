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
 * ResourceManager - MCP Resources for accessing analysis data
 *
 * Exposes documentation analysis outputs as MCP resources
 */

import { logger } from '../utils/logger.js';

export class ResourceManager {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
  }

  listResources() {
    return [
      {
        uri: 'docs://graph',
        name: 'Knowledge Graph',
        description:
          'Complete knowledge graph with nodes (documents, concepts, sections) and edges (relationships)',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://documents',
        name: 'Extracted Documents',
        description: 'All documentation files with metadata, frontmatter, and content',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://concepts',
        name: 'Extracted Concepts',
        description: 'Top concepts with TF-IDF weights and document distribution',
        mimeType: 'application/json',
      },
      {
        uri: 'docs://analysis',
        name: 'Graph Analysis',
        description: 'Centrality metrics, hub documents, and structural analysis',
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

  async readResource(uri) {
    logger.debug(`Reading resource: ${uri}`);

    switch (uri) {
      case 'docs://graph':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.dataLoader.graph, null, 2),
            },
          ],
        };

      case 'docs://documents':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.dataLoader.documents, null, 2),
            },
          ],
        };

      case 'docs://concepts':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.dataLoader.concepts, null, 2),
            },
          ],
        };

      case 'docs://analysis':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.dataLoader.analysis, null, 2),
            },
          ],
        };

      case 'docs://summary':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.generateSummary(), null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown resource URI: ${uri}`);
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
      },
      topConcepts: this.dataLoader.concepts.topConcepts?.slice(0, 10).map((c) => ({
        concept: c.concept,
        frequency: c.frequency,
        fileCount: c.fileCount,
      })),
      orphanedDocuments: this.dataLoader.documents.filter((d) => d.navigation?.isOrphaned).length,
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
}
