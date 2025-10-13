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
 * Test Data Builder
 *
 * Fluent API for building test data structures
 */

/**
 * Graph Data Builder
 */
export class GraphDataBuilder {
  constructor() {
    this.data = {
      metadata: {
        version: '1.0.0',
        generated: new Date().toISOString(),
        source: {
          inputPath: '/test/docs',
          fileCount: 0,
          totalNodes: 0,
          totalEdges: 0,
        },
      },
      nodes: [],
      edges: [],
    };
  }

  withMetadata(metadata) {
    this.data.metadata = { ...this.data.metadata, ...metadata };
    return this;
  }

  withNodes(nodes) {
    this.data.nodes = nodes;
    this.data.metadata.source.totalNodes = nodes.length;
    return this;
  }

  addNode(node) {
    this.data.nodes.push(node);
    this.data.metadata.source.totalNodes = this.data.nodes.length;
    return this;
  }

  withEdges(edges) {
    this.data.edges = edges;
    this.data.metadata.source.totalEdges = edges.length;
    return this;
  }

  addEdge(edge) {
    this.data.edges.push(edge);
    this.data.metadata.source.totalEdges = this.data.edges.length;
    return this;
  }

  withRandomNodes(count, type = 'document') {
    const nodes = Array.from({ length: count }, (_, i) => ({
      id: `node-${i}`,
      type,
      label: `Test ${type} ${i}`,
      data: {},
    }));
    return this.withNodes(nodes);
  }

  withRandomEdges(count, nodeIds = null) {
    const ids = nodeIds || this.data.nodes.map((n) => n.id);
    if (ids.length < 2) {
      throw new Error('Need at least 2 nodes to create edges');
    }

    const edges = Array.from({ length: count }, (_, i) => ({
      id: `edge-${i}`,
      source: ids[i % ids.length],
      target: ids[(i + 1) % ids.length],
      type: 'links_to',
    }));
    return this.withEdges(edges);
  }

  build() {
    return this.data;
  }
}

/**
 * Document Data Builder
 */
export class DocumentDataBuilder {
  constructor() {
    this.documents = [];
  }

  addDocument(doc) {
    this.documents.push(doc);
    return this;
  }

  addDocuments(docs) {
    this.documents.push(...docs);
    return this;
  }

  withRandomDocuments(count) {
    const docs = Array.from({ length: count }, (_, i) => ({
      path: `/docs/doc-${i}.md`,
      extension: '.md',
      content: `# Document ${i}\n\nTest content`,
      frontmatter: {
        title: `Document ${i}`,
        content_type: 'concept',
      },
      headings: [{ level: 1, text: `Document ${i}` }],
      links: {
        internal: [],
        external: [],
      },
    }));
    return this.addDocuments(docs);
  }

  build() {
    return this.documents;
  }
}

/**
 * Concept Data Builder
 */
export class ConceptDataBuilder {
  constructor() {
    this.data = {
      metadata: {
        totalConcepts: 0,
        extractionDate: new Date().toISOString(),
      },
      topConcepts: [],
    };
  }

  addConcept(concept) {
    this.data.topConcepts.push(concept);
    this.data.metadata.totalConcepts = this.data.topConcepts.length;
    return this;
  }

  withRandomConcepts(count) {
    const concepts = Array.from({ length: count }, (_, i) => ({
      concept: `concept-${i}`,
      frequency: Math.floor(Math.random() * 100) + 1,
      fileCount: Math.floor(Math.random() * 20) + 1,
      type: i % 3 === 0 ? 'domain' : i % 3 === 1 ? 'technical' : 'general',
      category:
        i % 4 === 0
          ? 'blockchain'
          : i % 4 === 1
          ? 'arbitrum'
          : i % 4 === 2
          ? 'technical'
          : 'development',
    }));

    // Sort by frequency
    concepts.sort((a, b) => b.frequency - a.frequency);

    this.data.topConcepts = concepts;
    this.data.metadata.totalConcepts = concepts.length;
    return this;
  }

  build() {
    return this.data;
  }
}

/**
 * Analysis Data Builder
 */
export class AnalysisDataBuilder {
  constructor() {
    this.data = {
      metadata: {
        version: '1.0.0',
        generated: new Date().toISOString(),
      },
      basic: {
        totalNodes: 0,
        totalEdges: 0,
        density: 0,
        avgDegree: 0,
        isConnected: false,
        nodesByType: {},
        edgesByType: {},
      },
      centrality: {
        degree: { values: {} },
        betweenness: { values: {} },
        closeness: { values: {} },
      },
    };
  }

  withBasicStats(stats) {
    this.data.basic = { ...this.data.basic, ...stats };
    return this;
  }

  withCentrality(centrality) {
    this.data.centrality = { ...this.data.centrality, ...centrality };
    return this;
  }

  forGraph(graph) {
    this.data.basic.totalNodes = graph.nodes.length;
    this.data.basic.totalEdges = graph.edges.length;

    // Calculate node types
    const nodesByType = {};
    graph.nodes.forEach((node) => {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    });
    this.data.basic.nodesByType = nodesByType;

    // Calculate edge types
    const edgesByType = {};
    graph.edges.forEach((edge) => {
      edgesByType[edge.type] = (edgesByType[edge.type] || 0) + 1;
    });
    this.data.basic.edgesByType = edgesByType;

    // Simple density calculation
    if (graph.nodes.length > 1) {
      const maxEdges = (graph.nodes.length * (graph.nodes.length - 1)) / 2;
      this.data.basic.density = graph.edges.length / maxEdges;
    }

    // Average degree
    if (graph.nodes.length > 0) {
      this.data.basic.avgDegree = (2 * graph.edges.length) / graph.nodes.length;
    }

    return this;
  }

  build() {
    return this.data;
  }
}

/**
 * Visualization Data Builder
 */
export class VisualizationDataBuilder {
  constructor() {
    this.data = {
      metadata: {
        version: '1.0.0',
        generated: new Date().toISOString(),
        source: {
          totalNodes: 0,
          totalEdges: 0,
        },
        statistics: {},
        chunking: {
          enabled: false,
          chunkSize: 1000,
          totalChunks: 0,
        },
      },
      elements: {
        nodes: [],
        edges: [],
      },
      styles: [],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 500,
      },
    };
  }

  withElements(nodes, edges) {
    this.data.elements.nodes = nodes;
    this.data.elements.edges = edges;
    this.data.metadata.source.totalNodes = nodes.length;
    this.data.metadata.source.totalEdges = edges.length;
    return this;
  }

  withStyles(styles) {
    this.data.styles = styles;
    return this;
  }

  withLayout(layout) {
    this.data.layout = { ...this.data.layout, ...layout };
    return this;
  }

  enableChunking(chunkSize = 1000) {
    const totalNodes = this.data.elements.nodes.length;
    const totalChunks = Math.ceil(totalNodes / chunkSize);

    this.data.metadata.chunking = {
      enabled: totalNodes > chunkSize,
      chunkSize,
      totalChunks: totalChunks > 1 ? totalChunks : 0,
    };
    return this;
  }

  fromGraph(graph, analysis = null) {
    // Transform nodes
    const nodes = graph.nodes.map((node) => ({
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        ...node.data,
      },
      classes: [node.type],
    }));

    // Transform edges
    const edges = graph.edges.map((edge) => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        ...edge.data,
      },
      classes: [edge.type],
    }));

    this.withElements(nodes, edges);

    // Add analysis data if provided
    if (analysis && analysis.centrality) {
      this.data.elements.nodes.forEach((node) => {
        if (analysis.centrality.degree.values[node.data.id] !== undefined) {
          node.data.centrality = {
            degree: analysis.centrality.degree.values[node.data.id],
            betweenness: analysis.centrality.betweenness.values[node.data.id],
            closeness: analysis.centrality.closeness.values[node.data.id],
          };
        }
      });
    }

    return this;
  }

  build() {
    return this.data;
  }
}

/**
 * Factory functions
 */
export function createGraphBuilder() {
  return new GraphDataBuilder();
}

export function createDocumentBuilder() {
  return new DocumentDataBuilder();
}

export function createConceptBuilder() {
  return new ConceptDataBuilder();
}

export function createAnalysisBuilder() {
  return new AnalysisDataBuilder();
}

export function createVisualizationBuilder() {
  return new VisualizationDataBuilder();
}
