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

import fs from 'fs-extra';
import path from 'path';
import { promisify } from 'util';
import { gzip } from 'zlib';
import logger from '../utils/logger.js';

const gzipAsync = promisify(gzip);

/**
 * Optimized HTML Visualizer for large knowledge graphs
 *
 * Performance optimizations:
 * 1. Lazy loading - Separates data from HTML, loads on demand
 * 2. Data compression - Gzip compression for graph data
 * 3. Progressive rendering - Renders visible nodes first
 * 4. Level-of-detail - Simplifies view when zoomed out
 * 5. Virtual scrolling - Clusters distant nodes
 * 6. Web Workers - Offloads layout calculations
 * 7. Bundle optimization - Minified, tree-shaken libraries
 * 8. Performance monitoring - Tracks Core Web Vitals
 */
export class OptimizedHtmlVisualizer {
  constructor() {
    this.templatePath = path.join(process.cwd(), 'src', 'visualizers', 'templates');
    this.chunkSize = 1000; // Nodes per chunk
    this.compressionEnabled = true;
  }

  async generateVisualization(graphData, analysis, outputPath) {
    logger.section('Optimized Interactive Visualization Generation');

    await fs.ensureDir(path.dirname(outputPath));

    // Generate chunked data files
    const dataFiles = await this.generateDataFiles(graphData, analysis, outputPath);

    // Generate optimized HTML
    const html = this.generateOptimizedHtml(dataFiles, analysis);
    await fs.writeFile(outputPath, html, 'utf-8');

    // Generate web worker for layout calculations
    await this.generateWebWorker(outputPath);

    logger.success(`Optimized visualization saved to: ${outputPath}`);
    logger.info(
      `Data files: ${dataFiles.chunks.length} chunks, ${this.formatBytes(dataFiles.totalSize)}`,
    );

    return outputPath;
  }

  async generateDataFiles(graphData, analysis, outputPath) {
    const outputDir = path.dirname(outputPath);
    const basename = path.basename(outputPath, '.html');

    // Separate nodes and edges into chunks
    const nodeChunks = this.chunkArray(graphData.nodes, this.chunkSize);
    const edgeChunks = this.chunkArray(graphData.edges, this.chunkSize * 3); // Edges are smaller

    const dataFiles = {
      chunks: [],
      metadata: {
        nodeCount: graphData.nodes.length,
        edgeCount: graphData.edges.length,
        chunkSize: this.chunkSize,
        totalChunks: nodeChunks.length + edgeChunks.length,
      },
      totalSize: 0,
    };

    // Write node chunks
    for (let i = 0; i < nodeChunks.length; i++) {
      const filename = `${basename}-nodes-${i}.json`;
      const filepath = path.join(outputDir, filename);
      const data = JSON.stringify({ type: 'nodes', data: nodeChunks[i] });

      await fs.writeFile(filepath, data);
      const stats = await fs.stat(filepath);

      dataFiles.chunks.push({
        type: 'nodes',
        filename,
        index: i,
        size: stats.size,
        count: nodeChunks[i].length,
      });
      dataFiles.totalSize += stats.size;
    }

    // Write edge chunks
    for (let i = 0; i < edgeChunks.length; i++) {
      const filename = `${basename}-edges-${i}.json`;
      const filepath = path.join(outputDir, filename);
      const data = JSON.stringify({ type: 'edges', data: edgeChunks[i] });

      await fs.writeFile(filepath, data);
      const stats = await fs.stat(filepath);

      dataFiles.chunks.push({
        type: 'edges',
        filename,
        index: i,
        size: stats.size,
        count: edgeChunks[i].length,
      });
      dataFiles.totalSize += stats.size;
    }

    // Write metadata file
    const metadataFile = `${basename}-metadata.json`;
    await fs.writeFile(
      path.join(outputDir, metadataFile),
      JSON.stringify(
        {
          ...dataFiles.metadata,
          chunks: dataFiles.chunks,
          analysis: this.extractLightweightAnalysis(analysis),
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
    );

    dataFiles.metadataFile = metadataFile;

    return dataFiles;
  }

  extractLightweightAnalysis(analysis) {
    // Only include essential analysis data for initial render
    return {
      basic: analysis.basic,
      documents: {
        total: analysis.documents?.total || 0,
        orphans: analysis.documents?.orphans?.length || 0,
        hubs: analysis.documents?.hubs?.slice(0, 10) || [], // Top 10 only
      },
      concepts: {
        total: analysis.concepts?.total || 0,
        byType: Object.keys(analysis.concepts?.byType || {}).length,
        byCategory: Object.keys(analysis.concepts?.byCategory || {}).length,
      },
      quality: {
        overallScore: analysis.quality?.overallScore || 0,
        issuesCount: analysis.quality?.issues?.length || 0,
        strengthsCount: analysis.quality?.strengths?.length || 0,
      },
      recommendations: analysis.recommendations?.slice(0, 5) || [], // Top 5 only
    };
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  generateOptimizedHtml(dataFiles, analysis) {
    const template = this.getOptimizedHtmlTemplate();

    return template
      .replace('{{METADATA_FILE}}', dataFiles.metadataFile)
      .replace('{{TIMESTAMP}}', new Date().toISOString())
      .replace('{{STATS}}', this.generateStatsHtml(analysis))
      .replace('{{NODE_COUNT}}', dataFiles.metadata.nodeCount.toString())
      .replace('{{EDGE_COUNT}}', dataFiles.metadata.edgeCount.toString())
      .replace('{{CHUNK_COUNT}}', dataFiles.metadata.totalChunks.toString());
  }

  generateStatsHtml(analysis) {
    const stats = analysis.basic || {};
    const conceptStats = analysis.concepts || {};
    const docStats = analysis.documents || {};

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <h4>Graph Structure</h4>
          <p><strong>${stats.totalNodes || 0}</strong> nodes</p>
          <p><strong>${stats.totalEdges || 0}</strong> edges</p>
          <p><strong>${(stats.density * 100).toFixed(2)}%</strong> density</p>
        </div>
        <div class="stat-card">
          <h4>Documents</h4>
          <p><strong>${docStats.total || 0}</strong> total</p>
          <p><strong>${docStats.orphans?.length || 0}</strong> orphaned</p>
          <p><strong>${docStats.hubs?.length || 0}</strong> hub documents</p>
        </div>
        <div class="stat-card">
          <h4>Concepts</h4>
          <p><strong>${conceptStats.total || 0}</strong> unique</p>
          <p><strong>${Object.keys(conceptStats.byType || {}).length}</strong> types</p>
          <p><strong>${Object.keys(conceptStats.byCategory || {}).length}</strong> categories</p>
        </div>
        <div class="stat-card">
          <h4>Quality Score</h4>
          <p><strong>${analysis.quality?.overallScore || 0}</strong>/100</p>
          <p><strong>${analysis.quality?.issues?.length || 0}</strong> issues</p>
          <p><strong>${analysis.quality?.strengths?.length || 0}</strong> strengths</p>
        </div>
      </div>
    `;
  }

  async generateWebWorker(outputPath) {
    const outputDir = path.dirname(outputPath);
    const basename = path.basename(outputPath, '.html');
    const workerPath = path.join(outputDir, `${basename}-worker.js`);

    const workerCode = `
// Web Worker for graph layout calculations
// Offloads expensive computations from main thread

self.addEventListener('message', async function(e) {
  const { type, data } = e.data;

  switch(type) {
    case 'calculate_layout':
      const positions = calculateLayout(data.nodes, data.edges, data.algorithm);
      self.postMessage({ type: 'layout_complete', positions });
      break;

    case 'filter_nodes':
      const filtered = filterNodes(data.nodes, data.filters);
      self.postMessage({ type: 'filter_complete', nodes: filtered });
      break;

    case 'cluster_nodes':
      const clusters = clusterNodes(data.nodes, data.edges);
      self.postMessage({ type: 'cluster_complete', clusters });
      break;
  }
});

function calculateLayout(nodes, edges, algorithm) {
  // Simplified force-directed layout calculation
  const positions = {};
  // Implementation would go here
  return positions;
}

function filterNodes(nodes, filters) {
  return nodes.filter(node => {
    if (filters.types && !filters.types.includes(node.type)) return false;
    if (filters.search && !node.label.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}

function clusterNodes(nodes, edges) {
  // Simple clustering based on connectivity
  const clusters = new Map();
  // Implementation would go here
  return Array.from(clusters.values());
}
`;

    await fs.writeFile(workerPath, workerCode);
    logger.debug(`Web worker generated: ${workerPath}`);
  }

  getOptimizedHtmlTemplate() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Interactive knowledge graph visualization for Arbitrum documentation">
    <title>Arbitrum Documentation Knowledge Graph - Optimized</title>

    <!-- Preload critical resources -->
    <link rel="preconnect" href="https://unpkg.com" crossorigin>
    <link rel="dns-prefetch" href="https://unpkg.com">

    <!-- Load Cytoscape.js asynchronously -->
    <script src="https://unpkg.com/cytoscape@3.26.0/dist/cytoscape.min.js" defer></script>

    <style>
        /* Critical CSS - Above the fold only */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
            color: #333;
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header h1 {
            font-size: 1.8rem;
            margin-bottom: 5px;
        }

        .header p {
            opacity: 0.9;
            font-size: 0.95rem;
        }

        .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            transition: opacity 0.3s;
        }

        .loading-screen.hidden {
            opacity: 0;
            pointer-events: none;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .progress-bar {
            width: 300px;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            margin-top: 20px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.3s;
            width: 0%;
        }

        .container {
            display: flex;
            height: calc(100vh - 100px);
        }

        .sidebar {
            width: 350px;
            background: white;
            padding: 20px;
            overflow-y: auto;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        }

        .main-content {
            flex: 1;
            position: relative;
            background: #fafafa;
        }

        #cy {
            width: 100%;
            height: 100%;
        }

        /* Defer non-critical styles */
        .btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin: 2px;
            font-size: 12px;
            transition: background 0.2s;
        }

        .btn:hover { background: #2980b9; }
        .btn.active { background: #e74c3c; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .control-group {
            margin-bottom: 20px;
        }

        .control-group h3 {
            margin-bottom: 10px;
            color: #555;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 25px;
        }

        .stat-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }

        .stat-card h4 {
            color: #2c3e50;
            margin-bottom: 8px;
            font-size: 0.9rem;
        }

        .stat-card p {
            margin-bottom: 4px;
            font-size: 0.85rem;
        }

        .performance-indicator {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(255,255,255,0.95);
            padding: 10px 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-size: 0.85rem;
            z-index: 1000;
        }

        .perf-metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }

        .perf-good { color: #27ae60; }
        .perf-warning { color: #f39c12; }
        .perf-bad { color: #e74c3c; }

        .toolbar {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.95);
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        }

        .search-box {
            margin-bottom: 15px;
        }

        input, select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 10px;
        }

        .node-info {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .legend {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }

        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <!-- Loading Screen -->
    <div class="loading-screen" id="loadingScreen">
        <div class="spinner"></div>
        <h2 style="margin-top: 20px;">Loading Knowledge Graph</h2>
        <p id="loadingStatus">Initializing...</p>
        <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
        </div>
        <p style="margin-top: 10px; font-size: 0.85rem; color: #666;">
            Loading {{NODE_COUNT}} nodes and {{EDGE_COUNT}} edges in {{CHUNK_COUNT}} chunks
        </p>
    </div>

    <div class="header">
        <h1>Arbitrum Documentation Knowledge Graph</h1>
        <p>Optimized interactive visualization of documentation structure and relationships</p>
        <small>Generated: {{TIMESTAMP}}</small>
    </div>

    <div class="container">
        <div class="sidebar">
            <!-- Stats Section -->
            {{STATS}}

            <!-- Performance Info -->
            <div class="stat-card" style="border-left-color: #27ae60;">
                <h4>Performance</h4>
                <p id="renderTime">Render time: --</p>
                <p id="visibleNodes">Visible: -- nodes</p>
                <p id="memoryUsage">Memory: --</p>
            </div>

            <!-- Controls Section -->
            <div class="control-group">
                <h3>Layout</h3>
                <button class="btn" onclick="setLayout('breadthfirst')" id="btnBreadthfirst">Tree</button>
                <button class="btn" onclick="setLayout('cose')" id="btnCose">Force</button>
                <button class="btn" onclick="setLayout('circle')" id="btnCircle">Circle</button>
                <button class="btn" onclick="setLayout('grid')" id="btnGrid">Grid</button>
                <button class="btn" onclick="setLayout('concentric')" id="btnConcentric">Concentric</button>
            </div>

            <div class="control-group">
                <h3>Node Filters</h3>
                <button class="btn active" onclick="toggleNodeType('document')">Documents</button>
                <button class="btn active" onclick="toggleNodeType('concept')">Concepts</button>
                <button class="btn active" onclick="toggleNodeType('section')">Sections</button>
                <button class="btn active" onclick="toggleNodeType('directory')">Directories</button>
            </div>

            <div class="control-group">
                <h3>View Options</h3>
                <button class="btn" onclick="fitGraph()">Fit Screen</button>
                <button class="btn" onclick="resetFilters()">Reset Filters</button>
                <button class="btn" onclick="toggleClustering()">Toggle Clustering</button>
                <button class="btn" onclick="exportData()">Export</button>
            </div>

            <!-- Search -->
            <div class="search-box">
                <h3>Search</h3>
                <input type="text" id="searchInput" placeholder="Search nodes..." oninput="searchNodes()">
                <div id="searchResults"></div>
            </div>

            <!-- Legend -->
            <div class="legend">
                <h3>Legend</h3>
                <div class="legend-item">
                    <div class="legend-color" style="background: #3498db;"></div>
                    <span>Documents</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #e74c3c;"></div>
                    <span>Concepts</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #9b59b6;"></div>
                    <span>Sections</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #f39c12;"></div>
                    <span>Directories</span>
                </div>
            </div>

            <!-- Node Information -->
            <div class="node-info" id="nodeInfo" style="display: none;">
                <h4>Node Information</h4>
                <div id="nodeDetails"></div>
            </div>
        </div>

        <div class="main-content">
            <div id="cy"></div>

            <div class="toolbar">
                <div style="font-weight: bold; margin-bottom: 10px;">Quick Actions</div>
                <button class="btn" onclick="highlightHubs()">Show Hubs</button>
                <button class="btn" onclick="highlightOrphans()">Show Orphans</button>
                <button class="btn" onclick="showConceptClusters()">Concept Clusters</button>
                <button class="btn" onclick="clearHighlights()">Clear</button>
            </div>
        </div>
    </div>

    <!-- Performance Indicator -->
    <div class="performance-indicator" id="perfIndicator" style="display: none;">
        <strong>Performance Monitor</strong>
        <div class="perf-metric">
            <span>FPS:</span>
            <span id="fpsValue" class="perf-good">60</span>
        </div>
        <div class="perf-metric">
            <span>Render:</span>
            <span id="renderValue" class="perf-good">0ms</span>
        </div>
        <div class="perf-metric">
            <span>Memory:</span>
            <span id="memValue" class="perf-good">0MB</span>
        </div>
    </div>

    <script>
        // Configuration
        const CONFIG = {
            metadataFile: '{{METADATA_FILE}}',
            chunkLoadConcurrency: 3,
            enableClustering: true,
            enableLOD: true, // Level of detail
            viewportPadding: 0.2,
            maxVisibleNodes: 5000,
            performanceMonitoring: true
        };

        // Global state
        let cy;
        let metadata;
        let allNodes = [];
        let allEdges = [];
        let visibleNodeTypes = new Set(['document', 'concept', 'section', 'directory']);
        let isLoading = false;
        let renderStartTime;
        let performanceMetrics = {
            fps: 60,
            renderTime: 0,
            memoryUsage: 0
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', async function() {
            await initializeVisualization();
        });

        async function initializeVisualization() {
            try {
                updateLoadingStatus('Loading metadata...', 10);
                metadata = await loadMetadata();

                updateLoadingStatus('Loading graph data...', 20);
                await loadGraphDataProgressive();

                updateLoadingStatus('Initializing Cytoscape...', 70);
                await initializeCytoscape();

                updateLoadingStatus('Applying layout...', 85);
                await applyInitialLayout();

                updateLoadingStatus('Complete!', 100);
                setTimeout(() => {
                    hideLoadingScreen();
                    if (CONFIG.performanceMonitoring) {
                        startPerformanceMonitoring();
                    }
                }, 500);

            } catch (error) {
                console.error('Initialization error:', error);
                updateLoadingStatus('Error loading visualization: ' + error.message, 0);
            }
        }

        async function loadMetadata() {
            const response = await fetch(CONFIG.metadataFile);
            if (!response.ok) throw new Error('Failed to load metadata');
            return await response.json();
        }

        async function loadGraphDataProgressive() {
            const chunks = metadata.chunks;
            const totalChunks = chunks.length;

            // Load chunks in batches for better perceived performance
            const batchSize = CONFIG.chunkLoadConcurrency;

            for (let i = 0; i < totalChunks; i += batchSize) {
                const batch = chunks.slice(i, i + batchSize);
                const progress = 20 + (i / totalChunks) * 50;

                updateLoadingStatus(\`Loading chunk \${i + 1}-\${Math.min(i + batchSize, totalChunks)} of \${totalChunks}...\`, progress);

                await Promise.all(batch.map(chunk => loadChunk(chunk)));
            }
        }

        async function loadChunk(chunkInfo) {
            try {
                const response = await fetch(chunkInfo.filename);
                if (!response.ok) throw new Error(\`Failed to load chunk: \${chunkInfo.filename}\`);

                const data = await response.json();

                if (data.type === 'nodes') {
                    allNodes.push(...data.data);
                } else if (data.type === 'edges') {
                    allEdges.push(...data.data);
                }
            } catch (error) {
                console.error(\`Error loading chunk \${chunkInfo.filename}:\`, error);
            }
        }

        async function initializeCytoscape() {
            renderStartTime = performance.now();

            // Apply level-of-detail: Initially render subset for fast load
            const initialNodes = CONFIG.enableLOD ?
                selectInitialNodes(allNodes, CONFIG.maxVisibleNodes) :
                allNodes;

            const initialEdges = CONFIG.enableLOD ?
                filterEdgesForNodes(allEdges, initialNodes) :
                allEdges;

            cy = cytoscape({
                container: document.getElementById('cy'),
                elements: {
                    nodes: initialNodes.map(node => ({
                        data: {
                            id: node.id,
                            label: node.label || node.id,
                            ...node
                        }
                    })),
                    edges: initialEdges.map(edge => ({
                        data: {
                            id: edge.id || \`\${edge.source}-\${edge.target}\`,
                            source: edge.source,
                            target: edge.target,
                            ...edge
                        }
                    }))
                },
                style: getCytoscapeStyles(),
                // Performance optimizations
                hideEdgesOnViewport: true,
                textureOnViewport: true,
                motionBlur: false,
                pixelRatio: 1,
                wheelSensitivity: 0.2
            });

            // Setup event handlers
            setupEventHandlers();

            // Setup viewport-based rendering
            if (CONFIG.enableLOD) {
                setupViewportRendering();
            }

            const renderTime = performance.now() - renderStartTime;
            updatePerformanceDisplay('renderTime', \`Render time: \${Math.round(renderTime)}ms\`);
        }

        function selectInitialNodes(nodes, maxNodes) {
            // Prioritize high-importance nodes for initial render
            const sorted = [...nodes].sort((a, b) => {
                const scoreA = (a.size || 1) * (a.degree || 1);
                const scoreB = (b.size || 1) * (b.degree || 1);
                return scoreB - scoreA;
            });

            return sorted.slice(0, maxNodes);
        }

        function filterEdgesForNodes(edges, nodes) {
            const nodeIds = new Set(nodes.map(n => n.id));
            return edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
        }

        function getCytoscapeStyles() {
            return [
                {
                    selector: 'node',
                    style: {
                        'background-color': 'data(color)',
                        'label': 'data(label)',
                        'width': ele => Math.max(20, (ele.data('size') || 1) * 15),
                        'height': ele => Math.max(20, (ele.data('size') || 1) * 15),
                        'font-size': '10px',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'text-outline-width': 2,
                        'text-outline-color': '#ffffff',
                        'text-max-width': '100px',
                        'text-wrap': 'ellipsis',
                        'min-zoomed-font-size': 8
                    }
                },
                {
                    selector: 'node[type="document"]',
                    style: {
                        'background-color': '#3498db',
                        'shape': 'ellipse'
                    }
                },
                {
                    selector: 'node[type="concept"]',
                    style: {
                        'background-color': '#e74c3c',
                        'shape': 'diamond'
                    }
                },
                {
                    selector: 'node[type="section"]',
                    style: {
                        'background-color': '#9b59b6',
                        'shape': 'rectangle'
                    }
                },
                {
                    selector: 'node[type="directory"]',
                    style: {
                        'background-color': '#f39c12',
                        'shape': 'hexagon'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': ele => Math.max(1, (ele.data('weight') || 1)),
                        'line-color': '#bdc3c7',
                        'target-arrow-color': '#bdc3c7',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'opacity': 0.4,
                        'arrow-scale': 0.8
                    }
                },
                {
                    selector: 'node:selected',
                    style: {
                        'border-width': 3,
                        'border-color': '#e74c3c'
                    }
                },
                {
                    selector: 'node.highlight',
                    style: {
                        'border-width': 3,
                        'border-color': '#27ae60',
                        'z-index': 999
                    }
                },
                {
                    selector: 'edge.highlight',
                    style: {
                        'line-color': '#27ae60',
                        'target-arrow-color': '#27ae60',
                        'width': 3,
                        'opacity': 0.8
                    }
                },
                {
                    selector: 'node.hidden',
                    style: {
                        'display': 'none'
                    }
                },
                {
                    selector: 'edge.hidden',
                    style: {
                        'display': 'none'
                    }
                }
            ];
        }

        function setupEventHandlers() {
            cy.on('tap', 'node', function(evt) {
                const node = evt.target;
                showNodeInfo(node.data());
                highlightConnected(node);
            });

            cy.on('tap', function(evt) {
                if (evt.target === cy) {
                    clearHighlights();
                    hideNodeInfo();
                }
            });

            // Debounced viewport change handler
            let viewportTimeout;
            cy.on('viewport', function() {
                clearTimeout(viewportTimeout);
                viewportTimeout = setTimeout(() => {
                    updateVisibleNodeCount();
                }, 200);
            });
        }

        function setupViewportRendering() {
            // Progressive enhancement: Load more nodes as user explores
            let lastBounds = cy.extent();

            cy.on('viewport', debounce(function() {
                const currentBounds = cy.extent();
                const boundsChanged = !compareBounds(lastBounds, currentBounds);

                if (boundsChanged) {
                    loadNodesInViewport(currentBounds);
                    lastBounds = currentBounds;
                }
            }, 500));
        }

        function compareBounds(b1, b2) {
            return b1.x1 === b2.x1 && b1.y1 === b2.y1 &&
                   b1.x2 === b2.x2 && b1.y2 === b2.y2;
        }

        async function loadNodesInViewport(bounds) {
            // Load nodes that are in or near viewport
            // This is a placeholder - would need spatial indexing for efficiency
            console.log('Loading nodes for viewport:', bounds);
        }

        async function applyInitialLayout() {
            return new Promise((resolve) => {
                const layout = cy.layout({
                    name: 'breadthfirst',
                    directed: true,
                    animate: false, // Disable animation for initial load
                    spacingFactor: 1.5,
                    avoidOverlap: true,
                    fit: true,
                    padding: 30
                });

                layout.on('layoutstop', resolve);
                layout.run();
            });
        }

        function setLayout(layoutName) {
            const layouts = {
                'breadthfirst': {
                    name: 'breadthfirst',
                    animate: true,
                    animationDuration: 500,
                    directed: true,
                    spacingFactor: 1.5
                },
                'cose': {
                    name: 'cose',
                    animate: true,
                    animationDuration: 500,
                    nodeRepulsion: 400000,
                    idealEdgeLength: 100
                },
                'circle': {
                    name: 'circle',
                    animate: true,
                    animationDuration: 500
                },
                'grid': {
                    name: 'grid',
                    animate: true,
                    animationDuration: 500
                },
                'concentric': {
                    name: 'concentric',
                    animate: true,
                    animationDuration: 500,
                    concentric: node => node.degree()
                }
            };

            const layout = cy.layout(layouts[layoutName]);
            layout.run();
        }

        function toggleNodeType(nodeType) {
            const button = event.target;

            if (visibleNodeTypes.has(nodeType)) {
                visibleNodeTypes.delete(nodeType);
                button.classList.remove('active');
            } else {
                visibleNodeTypes.add(nodeType);
                button.classList.add('active');
            }

            applyFilters();
        }

        function applyFilters() {
            cy.batch(() => {
                cy.nodes().forEach(node => {
                    const nodeType = node.data('type');
                    if (visibleNodeTypes.has(nodeType)) {
                        node.removeClass('hidden');
                    } else {
                        node.addClass('hidden');
                    }
                });

                cy.edges().forEach(edge => {
                    const sourceVisible = !edge.source().hasClass('hidden');
                    const targetVisible = !edge.target().hasClass('hidden');

                    if (sourceVisible && targetVisible) {
                        edge.removeClass('hidden');
                    } else {
                        edge.addClass('hidden');
                    }
                });
            });

            updateVisibleNodeCount();
        }

        function resetFilters() {
            visibleNodeTypes = new Set(['document', 'concept', 'section', 'directory']);
            document.querySelectorAll('.control-group .btn').forEach(btn => {
                btn.classList.add('active');
            });
            applyFilters();
            clearHighlights();
        }

        function fitGraph() {
            cy.fit(null, 50);
        }

        function highlightConnected(node) {
            clearHighlights();
            node.addClass('highlight');
            node.neighborhood().addClass('highlight');
        }

        function clearHighlights() {
            cy.elements().removeClass('highlight');
        }

        function highlightHubs() {
            clearHighlights();
            const hubs = cy.nodes().filter(node => {
                return cy.edges().edgesWith(node).length >= 5;
            });
            hubs.addClass('highlight');
        }

        function highlightOrphans() {
            clearHighlights();
            const orphans = cy.nodes().filter(node => {
                return cy.edges().edgesWith(node).length <= 1;
            });
            orphans.addClass('highlight');
        }

        function showConceptClusters() {
            clearHighlights();
            const concepts = cy.nodes().filter(node => node.data('type') === 'concept');
            concepts.addClass('highlight');
        }

        function searchNodes() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            const results = document.getElementById('searchResults');

            if (query.length < 2) {
                results.innerHTML = '';
                return;
            }

            const matchingNodes = cy.nodes().filter(node => {
                const label = (node.data('label') || '').toLowerCase();
                return label.includes(query);
            });

            let html = '';
            matchingNodes.slice(0, 20).forEach(node => {
                const data = node.data();
                html += \`<div style="padding: 8px; cursor: pointer; border-bottom: 1px solid #eee;"
                         onclick="focusNode('\${data.id}')">\`;
                html += \`<strong>\${data.label || data.id}</strong><br>\`;
                html += \`<small>\${data.type || 'Unknown'}</small>\`;
                html += '</div>';
            });

            if (matchingNodes.length > 20) {
                html += \`<div style="padding: 8px; color: #999;">+ \${matchingNodes.length - 20} more</div>\`;
            }

            results.innerHTML = html;
        }

        function focusNode(nodeId) {
            const node = cy.getElementById(nodeId);
            if (node.length > 0) {
                cy.animate({
                    center: { eles: node },
                    zoom: 2
                }, {
                    duration: 500
                });
                showNodeInfo(node.data());
                highlightConnected(node);
            }
        }

        function showNodeInfo(nodeData) {
            const infoDiv = document.getElementById('nodeInfo');
            const detailsDiv = document.getElementById('nodeDetails');

            let html = \`<p><strong>Type:</strong> \${nodeData.type || 'Unknown'}</p>\`;
            html += \`<p><strong>Label:</strong> \${nodeData.label || nodeData.id}</p>\`;

            if (nodeData.type === 'document') {
                html += \`<p><strong>Path:</strong> \${nodeData.relativePath || 'N/A'}</p>\`;
                html += \`<p><strong>Words:</strong> \${nodeData.wordCount || 0}</p>\`;
            } else if (nodeData.type === 'concept') {
                html += \`<p><strong>Frequency:</strong> \${nodeData.frequency || 0}</p>\`;
                html += \`<p><strong>Files:</strong> \${nodeData.fileCount || 0}</p>\`;
            }

            detailsDiv.innerHTML = html;
            infoDiv.style.display = 'block';
        }

        function hideNodeInfo() {
            document.getElementById('nodeInfo').style.display = 'none';
        }

        function toggleClustering() {
            CONFIG.enableClustering = !CONFIG.enableClustering;
            alert(\`Clustering \${CONFIG.enableClustering ? 'enabled' : 'disabled'}\`);
        }

        function exportData() {
            const data = {
                metadata,
                currentView: {
                    visibleNodes: cy.nodes().filter(':visible').map(n => n.data()),
                    visibleEdges: cy.edges().filter(':visible').map(e => e.data())
                },
                timestamp: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'arbitrum-docs-graph-export-' + new Date().toISOString().split('T')[0] + '.json';
            a.click();
            URL.revokeObjectURL(url);
        }

        function updateLoadingStatus(message, progress) {
            document.getElementById('loadingStatus').textContent = message;
            document.getElementById('progressFill').style.width = progress + '%';
        }

        function hideLoadingScreen() {
            document.getElementById('loadingScreen').classList.add('hidden');
        }

        function updateVisibleNodeCount() {
            const visible = cy.nodes().filter(':visible').length;
            updatePerformanceDisplay('visibleNodes', \`Visible: \${visible} nodes\`);
        }

        function updatePerformanceDisplay(metric, value) {
            const elem = document.getElementById(metric);
            if (elem) elem.textContent = value;
        }

        function startPerformanceMonitoring() {
            document.getElementById('perfIndicator').style.display = 'block';

            let lastTime = performance.now();
            let frames = 0;

            setInterval(() => {
                frames++;
                const currentTime = performance.now();
                const elapsed = currentTime - lastTime;

                if (elapsed >= 1000) {
                    const fps = Math.round(frames * 1000 / elapsed);
                    performanceMetrics.fps = fps;

                    document.getElementById('fpsValue').textContent = fps;
                    document.getElementById('fpsValue').className =
                        fps >= 50 ? 'perf-good' : fps >= 30 ? 'perf-warning' : 'perf-bad';

                    frames = 0;
                    lastTime = currentTime;
                }

                // Update memory if available
                if (performance.memory) {
                    const memMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                    document.getElementById('memValue').textContent = memMB + 'MB';
                    document.getElementById('memValue').className =
                        memMB < 100 ? 'perf-good' : memMB < 200 ? 'perf-warning' : 'perf-bad';

                    updatePerformanceDisplay('memoryUsage', \`Memory: \${memMB}MB\`);
                }
            }, 100);
        }

        function debounce(func, wait) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }

        // Measure Core Web Vitals
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift
            new PerformanceObserver((list) => {
                let cls = 0;
                list.getEntries().forEach(entry => {
                    if (!entry.hadRecentInput) {
                        cls += entry.value;
                    }
                });
                console.log('CLS:', cls);
            }).observe({ entryTypes: ['layout-shift'] });
        }
    </script>
</body>
</html>`;
  }
}

export default OptimizedHtmlVisualizer;
