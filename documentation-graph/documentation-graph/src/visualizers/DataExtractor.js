/**
 * DataExtractor
 * Extracts and transforms graph data for Cytoscape.js visualization
 *
 * Converts knowledge graph data into Cytoscape-compatible format with support for:
 * - Node and edge transformation with centrality metrics
 * - Chunked data loading for large graphs (progressive enhancement)
 * - Customizable visual styles and layout configurations
 *
 * @example
 * const extractor = new DataExtractor({ chunkSize: 500 });
 * const visualizationData = extractor.extract(graphData, analysisData);
 * const chunks = extractor.chunkData(visualizationData);
 */

// Constants
const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_VERSION = '1.0.0';
const DEFAULT_EDGE_WEIGHT = 1;
const DEFAULT_EDGE_LABEL = '';
const DEFAULT_CENTRALITY = 0;

// Visual style constants
const NODE_COLORS = {
  DOCUMENT: '#3498db',
  CONCEPT: '#e74c3c',
  DIRECTORY: '#2ecc71',
};

const NODE_SHAPES = {
  DOCUMENT: 'roundrectangle',
  CONCEPT: 'ellipse',
  DIRECTORY: 'octagon',
};

const EDGE_STYLE = {
  WIDTH: 2,
  COLOR: '#ccc',
  ARROW_SHAPE: 'triangle',
  CURVE: 'bezier',
};

const NODE_STYLE = {
  FONT_SIZE: '12px',
  TEXT_VALIGN: 'center',
  TEXT_HALIGN: 'center',
};

// Layout configuration constants
const LAYOUT_CONFIG = {
  NAME: 'cose',
  ANIMATION_DURATION: 500,
  NODE_REPULSION: 8000,
  IDEAL_EDGE_LENGTH: 100,
  EDGE_ELASTICITY: 100,
  NESTING_FACTOR: 5,
  GRAVITY: 80,
  NUM_ITERATIONS: 1000,
  INITIAL_TEMP: 200,
  COOLING_FACTOR: 0.95,
  MIN_TEMP: 1.0,
};

// Error messages
const ERROR_MESSAGES = {
  INVALID_CHUNK_SIZE: 'Chunk size must be positive',
  MISSING_GRAPH_DATA: 'Graph data is required',
  MISSING_ANALYSIS_DATA: 'Analysis data is required',
  MISSING_NODES_ARRAY: 'Graph data must contain nodes array',
  MISSING_EDGES_ARRAY: 'Graph data must contain edges array',
};

export class DataExtractor {
  /**
   * Create a new DataExtractor instance
   *
   * @param {Object} config - Configuration options
   * @param {number} [config.chunkSize=1000] - Number of nodes per chunk for progressive loading
   * @throws {Error} If chunk size is not positive
   *
   * @example
   * const extractor = new DataExtractor({ chunkSize: 500 });
   */
  constructor(config = {}) {
    this.chunkSize = config.chunkSize !== undefined ? config.chunkSize : DEFAULT_CHUNK_SIZE;

    this._validateChunkSize();
  }

  /**
   * Validate chunk size configuration
   * @private
   * @throws {Error} If chunk size is not positive
   */
  _validateChunkSize() {
    if (this.chunkSize <= 0) {
      throw new Error(ERROR_MESSAGES.INVALID_CHUNK_SIZE);
    }
  }

  /**
   * Extract complete visualization data from graph
   *
   * Transforms knowledge graph data into Cytoscape.js compatible format with metadata,
   * elements (nodes and edges), visual styles, and layout configuration.
   *
   * @param {Object} graphData - Knowledge graph data
   * @param {Array} graphData.nodes - Array of graph nodes
   * @param {Array} graphData.edges - Array of graph edges
   * @param {Object} analysisData - Graph analysis results
   * @param {Object} analysisData.basic - Basic graph metrics
   * @param {Object} analysisData.centrality - Centrality calculations
   * @returns {Object} Complete visualization data structure
   * @returns {Object} returns.metadata - Metadata about the visualization
   * @returns {Object} returns.elements - Cytoscape elements (nodes and edges)
   * @returns {Array} returns.styles - Visual style definitions
   * @returns {Object} returns.layout - Layout algorithm configuration
   * @throws {Error} If required data is missing or invalid
   *
   * @example
   * const visualizationData = extractor.extract(graphData, analysisData);
   * // Returns: { metadata, elements, styles, layout }
   */
  extract(graphData, analysisData) {
    this._validateExtractionInputs(graphData, analysisData);

    return {
      metadata: this.buildMetadata(graphData, analysisData),
      elements: this.buildElements(graphData, analysisData),
      styles: this.buildStyles(),
      layout: this.buildLayoutConfig(),
    };
  }

  /**
   * Validate extraction method inputs
   * @private
   * @param {Object} graphData - Graph data to validate
   * @param {Object} analysisData - Analysis data to validate
   * @throws {Error} If validation fails
   */
  _validateExtractionInputs(graphData, analysisData) {
    if (!graphData) {
      throw new Error(ERROR_MESSAGES.MISSING_GRAPH_DATA);
    }
    if (!analysisData) {
      throw new Error(ERROR_MESSAGES.MISSING_ANALYSIS_DATA);
    }
    if (!Array.isArray(graphData.nodes)) {
      throw new Error(ERROR_MESSAGES.MISSING_NODES_ARRAY);
    }
    if (!Array.isArray(graphData.edges)) {
      throw new Error(ERROR_MESSAGES.MISSING_EDGES_ARRAY);
    }
  }

  /**
   * Build metadata object describing the visualization
   *
   * Includes version information, generation timestamp, source statistics,
   * graph metrics, and chunking configuration.
   *
   * @param {Object} graphData - Knowledge graph data
   * @param {Object} analysisData - Graph analysis results
   * @returns {Object} Metadata object
   * @returns {string} returns.version - Schema version
   * @returns {string} returns.generated - ISO 8601 timestamp
   * @returns {Object} returns.source - Source data statistics
   * @returns {Object} returns.statistics - Graph metrics (density, degree, connectivity)
   * @returns {Object} returns.chunking - Chunking configuration
   *
   * @example
   * const metadata = extractor.buildMetadata(graphData, analysisData);
   * // Returns: { version, generated, source, statistics, chunking }
   */
  buildMetadata(graphData, analysisData) {
    const totalNodes = graphData.nodes.length;
    const totalEdges = graphData.edges.length;
    const chunkingEnabled = this._shouldEnableChunking(totalNodes);
    const totalChunks = this._calculateTotalChunks(totalNodes);

    return {
      version: DEFAULT_VERSION,
      generated: new Date().toISOString(),
      source: this._buildSourceInfo(totalNodes, totalEdges, analysisData),
      statistics: this._buildStatistics(analysisData),
      chunking: {
        enabled: chunkingEnabled,
        chunkSize: this.chunkSize,
        totalChunks,
      },
    };
  }

  /**
   * Determine if chunking should be enabled based on node count
   * @private
   * @param {number} nodeCount - Total number of nodes
   * @returns {boolean} True if chunking should be enabled
   */
  _shouldEnableChunking(nodeCount) {
    return nodeCount > this.chunkSize;
  }

  /**
   * Calculate total number of chunks needed
   * @private
   * @param {number} nodeCount - Total number of nodes
   * @returns {number} Number of chunks
   */
  _calculateTotalChunks(nodeCount) {
    return Math.ceil(nodeCount / this.chunkSize);
  }

  /**
   * Build source information object
   * @private
   * @param {number} totalNodes - Total node count
   * @param {number} totalEdges - Total edge count
   * @param {Object} analysisData - Analysis data containing type information
   * @returns {Object} Source information
   */
  _buildSourceInfo(totalNodes, totalEdges, analysisData) {
    return {
      totalNodes,
      totalEdges,
      nodeTypes: Object.keys(analysisData.basic.nodesByType || {}),
      edgeTypes: Object.keys(analysisData.basic.edgesByType || {}),
    };
  }

  /**
   * Build statistics object from analysis data
   * @private
   * @param {Object} analysisData - Graph analysis results
   * @returns {Object} Statistics object
   */
  _buildStatistics(analysisData) {
    return {
      density: analysisData.basic.density,
      avgDegree: analysisData.basic.avgDegree,
      isConnected: analysisData.basic.isConnected,
    };
  }

  /**
   * Build Cytoscape elements (nodes and edges)
   *
   * Transforms all graph nodes and edges into Cytoscape-compatible format
   * with proper data structure, classes, and attributes.
   *
   * @param {Object} graphData - Knowledge graph data
   * @param {Object} analysisData - Graph analysis results for enrichment
   * @returns {Object} Elements object
   * @returns {Array} returns.nodes - Array of Cytoscape node elements
   * @returns {Array} returns.edges - Array of Cytoscape edge elements
   *
   * @example
   * const elements = extractor.buildElements(graphData, analysisData);
   * // Returns: { nodes: [...], edges: [...] }
   */
  buildElements(graphData, analysisData) {
    const nodes = graphData.nodes.map((node) => this.transformNode(node, analysisData));
    const edges = graphData.edges.map((edge) => this.transformEdge(edge));

    return { nodes, edges };
  }

  /**
   * Transform graph node to Cytoscape element format
   *
   * Converts a knowledge graph node into Cytoscape element structure with:
   * - All original node properties spread into data
   * - Centrality metrics from analysis
   * - CSS classes for styling
   * - Optional position information
   *
   * @param {Object} node - Graph node to transform
   * @param {string} node.id - Unique node identifier
   * @param {string} node.label - Display label
   * @param {string} node.type - Node type (document, concept, etc.)
   * @param {Object} [node.position] - Optional x/y coordinates
   * @param {Object} analysisData - Analysis data containing centrality metrics
   * @returns {Object} Cytoscape node element
   * @returns {Object} returns.data - Node data including centrality
   * @returns {Array<string>} returns.classes - CSS classes for styling
   * @returns {Object|undefined} returns.position - Node position if available
   *
   * @example
   * const cytoscapeNode = extractor.transformNode(graphNode, analysisData);
   * // Returns: { data: {...}, classes: ['document'], position: {...} }
   */
  transformNode(node, analysisData) {
    const centralityValue = this._extractCentralityValue(node.id, analysisData);

    return {
      data: {
        id: node.id,
        label: node.label,
        type: node.type,
        ...node,
        centrality: {
          degree: centralityValue,
        },
      },
      classes: [node.type],
      position: node.position || undefined,
    };
  }

  /**
   * Extract centrality value for a node
   * @private
   * @param {string} nodeId - Node identifier
   * @param {Object} analysisData - Analysis data containing centrality
   * @returns {number} Centrality value or default
   */
  _extractCentralityValue(nodeId, analysisData) {
    return analysisData?.centrality?.degree?.values?.[nodeId] || DEFAULT_CENTRALITY;
  }

  /**
   * Transform graph edge to Cytoscape element format
   *
   * Converts a knowledge graph edge into Cytoscape element structure with:
   * - Source and target node references
   * - Edge type and optional weight
   * - Optional label for display
   * - CSS classes for styling
   *
   * @param {Object} edge - Graph edge to transform
   * @param {string} edge.id - Unique edge identifier
   * @param {string} edge.source - Source node ID
   * @param {string} edge.target - Target node ID
   * @param {string} edge.type - Edge type (mentions, links_to, etc.)
   * @param {number} [edge.weight=1] - Optional edge weight
   * @param {string} [edge.label=''] - Optional display label
   * @returns {Object} Cytoscape edge element
   * @returns {Object} returns.data - Edge data with source, target, weight, label
   * @returns {Array<string>} returns.classes - CSS classes for styling
   *
   * @example
   * const cytoscapeEdge = extractor.transformEdge(graphEdge);
   * // Returns: { data: {...}, classes: ['mentions'] }
   */
  transformEdge(edge) {
    return {
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        weight: edge.weight !== undefined ? edge.weight : DEFAULT_EDGE_WEIGHT,
        label: edge.label || DEFAULT_EDGE_LABEL,
      },
      classes: [edge.type],
    };
  }

  /**
   * Build Cytoscape visual styles
   *
   * Generates complete stylesheet for graph visualization including:
   * - Base node and edge styles
   * - Type-specific styles (document, concept, directory)
   * - Colors, shapes, and visual properties
   *
   * @returns {Array<Object>} Array of Cytoscape style objects
   * @returns {string} returns[].selector - CSS-style selector
   * @returns {Object} returns[].style - Style properties object
   *
   * @example
   * const styles = extractor.buildStyles();
   * // Returns: [{ selector: 'node', style: {...} }, ...]
   */
  buildStyles() {
    return [
      this._buildBaseNodeStyle(),
      this._buildBaseEdgeStyle(),
      this._buildDocumentNodeStyle(),
      this._buildConceptNodeStyle(),
      this._buildDirectoryNodeStyle(),
    ];
  }

  /**
   * Build base node style
   * @private
   * @returns {Object} Base node style object
   */
  _buildBaseNodeStyle() {
    return {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'background-color': 'data(color)',
        'width': 'data(size)',
        'height': 'data(size)',
        'font-size': NODE_STYLE.FONT_SIZE,
        'text-valign': NODE_STYLE.TEXT_VALIGN,
        'text-halign': NODE_STYLE.TEXT_HALIGN,
      },
    };
  }

  /**
   * Build base edge style
   * @private
   * @returns {Object} Base edge style object
   */
  _buildBaseEdgeStyle() {
    return {
      selector: 'edge',
      style: {
        'width': EDGE_STYLE.WIDTH,
        'line-color': EDGE_STYLE.COLOR,
        'target-arrow-color': EDGE_STYLE.COLOR,
        'target-arrow-shape': EDGE_STYLE.ARROW_SHAPE,
        'curve-style': EDGE_STYLE.CURVE,
      },
    };
  }

  /**
   * Build document node style
   * @private
   * @returns {Object} Document node style object
   */
  _buildDocumentNodeStyle() {
    return {
      selector: '.document',
      style: {
        'shape': NODE_SHAPES.DOCUMENT,
        'background-color': NODE_COLORS.DOCUMENT,
      },
    };
  }

  /**
   * Build concept node style
   * @private
   * @returns {Object} Concept node style object
   */
  _buildConceptNodeStyle() {
    return {
      selector: '.concept',
      style: {
        'shape': NODE_SHAPES.CONCEPT,
        'background-color': NODE_COLORS.CONCEPT,
      },
    };
  }

  /**
   * Build directory node style
   * @private
   * @returns {Object} Directory node style object
   */
  _buildDirectoryNodeStyle() {
    return {
      selector: '.directory',
      style: {
        'shape': NODE_SHAPES.DIRECTORY,
        'background-color': NODE_COLORS.DIRECTORY,
      },
    };
  }

  /**
   * Build Cytoscape layout configuration
   *
   * Creates COSE (Compound Spring Embedder) layout configuration with:
   * - Physics-based force-directed algorithm
   * - Animation settings for smooth transitions
   * - Tuned parameters for optimal graph layouts
   *
   * @returns {Object} Layout configuration
   * @returns {string} returns.name - Layout algorithm name ('cose')
   * @returns {boolean} returns.animate - Enable animation
   * @returns {number} returns.animationDuration - Animation duration in ms
   * @returns {number} returns.nodeRepulsion - Force between nodes
   * @returns {number} returns.idealEdgeLength - Preferred edge length
   * @returns {number} returns.edgeElasticity - Edge spring strength
   * @returns {number} returns.nestingFactor - Nested compound strength
   * @returns {number} returns.gravity - Center gravity force
   * @returns {number} returns.numIter - Maximum iterations
   * @returns {number} returns.initialTemp - Starting temperature
   * @returns {number} returns.coolingFactor - Temperature reduction rate
   * @returns {number} returns.minTemp - Minimum temperature threshold
   *
   * @example
   * const layout = extractor.buildLayoutConfig();
   * // Returns: { name: 'cose', animate: true, ... }
   */
  buildLayoutConfig() {
    return {
      name: LAYOUT_CONFIG.NAME,
      animate: true,
      animationDuration: LAYOUT_CONFIG.ANIMATION_DURATION,
      nodeRepulsion: LAYOUT_CONFIG.NODE_REPULSION,
      idealEdgeLength: LAYOUT_CONFIG.IDEAL_EDGE_LENGTH,
      edgeElasticity: LAYOUT_CONFIG.EDGE_ELASTICITY,
      nestingFactor: LAYOUT_CONFIG.NESTING_FACTOR,
      gravity: LAYOUT_CONFIG.GRAVITY,
      numIter: LAYOUT_CONFIG.NUM_ITERATIONS,
      initialTemp: LAYOUT_CONFIG.INITIAL_TEMP,
      coolingFactor: LAYOUT_CONFIG.COOLING_FACTOR,
      minTemp: LAYOUT_CONFIG.MIN_TEMP,
    };
  }

  /**
   * Chunk visualization data for progressive loading
   *
   * Splits large graphs into smaller chunks for progressive loading in browser.
   * Each chunk contains:
   * - A subset of nodes (up to chunkSize)
   * - All edges connecting to nodes in this chunk
   * - Metadata about chunk position (index, total)
   *
   * If chunking is disabled or graph is small, returns single chunk with all data.
   *
   * @param {Object} visualizationData - Complete visualization data
   * @param {Object} visualizationData.metadata - Metadata with chunking config
   * @param {Object} visualizationData.elements - Elements with nodes and edges
   * @returns {Array<Object>} Array of chunk objects
   * @returns {number} returns[].index - Zero-based chunk index
   * @returns {number} returns[].total - Total number of chunks
   * @returns {Object} returns[].elements - Subset of nodes and edges
   *
   * @example
   * const chunks = extractor.chunkData(visualizationData);
   * // Returns: [{ index: 0, total: 3, elements: {...} }, ...]
   */
  chunkData(visualizationData) {
    const allNodes = visualizationData.elements.nodes;
    const allEdges = visualizationData.elements.edges;

    // Check if chunking is explicitly disabled
    if (this._isChunkingDisabled(visualizationData)) {
      return this._createSingleChunk(visualizationData.elements);
    }

    // Check if graph is small enough to skip chunking
    if (!this._shouldEnableChunking(allNodes.length)) {
      return this._createSingleChunk(visualizationData.elements);
    }

    return this._createMultipleChunks(allNodes, allEdges);
  }

  /**
   * Check if chunking is explicitly disabled in metadata
   * @private
   * @param {Object} visualizationData - Visualization data with metadata
   * @returns {boolean} True if chunking is disabled
   */
  _isChunkingDisabled(visualizationData) {
    return visualizationData.metadata.chunking.enabled === false;
  }

  /**
   * Create single chunk containing all elements
   * @private
   * @param {Object} elements - All nodes and edges
   * @returns {Array<Object>} Array with single chunk
   */
  _createSingleChunk(elements) {
    return [
      {
        index: 0,
        total: 1,
        elements,
      },
    ];
  }

  /**
   * Create multiple chunks from nodes and edges
   * @private
   * @param {Array} allNodes - All visualization nodes
   * @param {Array} allEdges - All visualization edges
   * @returns {Array<Object>} Array of chunks
   */
  _createMultipleChunks(allNodes, allEdges) {
    const totalChunks = this._calculateTotalChunks(allNodes.length);
    const chunks = [];

    for (let i = 0; i < totalChunks; i++) {
      const chunk = this._createChunk(i, totalChunks, allNodes, allEdges);
      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * Create a single chunk with nodes and relevant edges
   * @private
   * @param {number} index - Chunk index
   * @param {number} totalChunks - Total number of chunks
   * @param {Array} allNodes - All visualization nodes
   * @param {Array} allEdges - All visualization edges
   * @returns {Object} Chunk object
   */
  _createChunk(index, totalChunks, allNodes, allEdges) {
    const { startIdx, endIdx } = this._calculateChunkBounds(index);
    const chunkNodes = allNodes.slice(startIdx, endIdx);
    const chunkNodeIds = this._extractNodeIds(chunkNodes);
    const chunkEdges = this._filterRelevantEdges(allEdges, chunkNodeIds);

    return {
      index,
      total: totalChunks,
      elements: {
        nodes: chunkNodes,
        edges: chunkEdges,
      },
    };
  }

  /**
   * Calculate start and end indices for a chunk
   * @private
   * @param {number} chunkIndex - Zero-based chunk index
   * @returns {Object} Bounds object
   * @returns {number} returns.startIdx - Start index (inclusive)
   * @returns {number} returns.endIdx - End index (exclusive)
   */
  _calculateChunkBounds(chunkIndex) {
    const startIdx = chunkIndex * this.chunkSize;
    const endIdx = startIdx + this.chunkSize;
    return { startIdx, endIdx: Math.min(endIdx, Number.MAX_SAFE_INTEGER) };
  }

  /**
   * Extract node IDs from chunk nodes into a Set
   * @private
   * @param {Array} chunkNodes - Nodes in this chunk
   * @returns {Set<string>} Set of node IDs
   */
  _extractNodeIds(chunkNodes) {
    return new Set(chunkNodes.map((n) => n.data.id));
  }

  /**
   * Filter edges that connect to nodes in this chunk
   * @private
   * @param {Array} allEdges - All visualization edges
   * @param {Set<string>} chunkNodeIds - Node IDs in this chunk
   * @returns {Array} Filtered edges
   */
  _filterRelevantEdges(allEdges, chunkNodeIds) {
    return allEdges.filter((edge) => {
      return chunkNodeIds.has(edge.data.source) || chunkNodeIds.has(edge.data.target);
    });
  }
}
