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
import logger from '../utils/logger.js';

export class HtmlVisualizer {
  constructor() {
    this.templatePath = path.join(process.cwd(), 'src', 'visualizers', 'templates');
  }

  async generateVisualization(graphData, analysis, outputPath) {
    logger.section('Interactive Visualization Generation');
    
    await fs.ensureDir(path.dirname(outputPath));
    
    const html = this.generateHtmlContent(graphData, analysis);
    await fs.writeFile(outputPath, html, 'utf-8');
    
    logger.success(`Interactive visualization saved to: ${outputPath}`);
    return outputPath;
  }

  generateHtmlContent(graphData, analysis) {
    const template = this.getHtmlTemplate();
    const graphDataJson = JSON.stringify(graphData, null, 2);
    const analysisJson = JSON.stringify(analysis, null, 2);
    
    return template
      .replace('{{GRAPH_DATA}}', graphDataJson)
      .replace('{{ANALYSIS_DATA}}', analysisJson)
      .replace('{{TIMESTAMP}}', new Date().toISOString())
      .replace('{{STATS}}', this.generateStatsHtml(analysis));
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

  getHtmlTemplate() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arbitrum Documentation Knowledge Graph</title>
    <script src="https://unpkg.com/cytoscape@3.26.0/dist/cytoscape.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            color: #333;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }

        .container {
            display: flex;
            height: calc(100vh - 120px);
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
        }

        #cy {
            width: 100%;
            height: 100%;
            background: #fafafa;
        }

        .controls {
            margin-bottom: 25px;
        }

        .control-group {
            margin-bottom: 20px;
        }

        .control-group h3 {
            margin-bottom: 10px;
            color: #555;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

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

        .btn:hover {
            background: #2980b9;
        }

        .btn.active {
            background: #e74c3c;
        }

        .btn-small {
            padding: 4px 8px;
            font-size: 11px;
        }

        select, input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 10px;
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

        .node-info {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .node-info h4 {
            color: #2c3e50;
            margin-bottom: 8px;
        }

        .node-info p {
            margin-bottom: 6px;
            font-size: 0.85rem;
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

        .legend-text {
            font-size: 0.85rem;
        }

        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 1.2rem;
            color: #666;
        }

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

        .search-results {
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #eee;
            border-radius: 4px;
        }

        .search-result {
            padding: 8px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
            font-size: 0.85rem;
        }

        .search-result:hover {
            background: #f8f9fa;
        }

        .analysis-section {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }

        .analysis-section h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1rem;
        }

        .recommendation {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 12px;
            margin-bottom: 10px;
        }

        .recommendation.high {
            background: #f8d7da;
            border-color: #f5c6cb;
        }

        .recommendation.critical {
            background: #f8d7da;
            border-color: #f1b0b7;
        }

        .recommendation h5 {
            margin-bottom: 6px;
            font-size: 0.9rem;
        }

        .recommendation p {
            font-size: 0.8rem;
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔗 Arbitrum Documentation Knowledge Graph</h1>
        <p>Interactive visualization of documentation structure, concepts, and relationships</p>
        <small>Generated: {{TIMESTAMP}}</small>
    </div>

    <div class="container">
        <div class="sidebar">
            <!-- Stats Section -->
            {{STATS}}

            <!-- Controls Section -->
            <div class="controls">
                <div class="control-group">
                    <h3>Layout</h3>
                    <button class="btn" onclick="setLayout('breadthfirst')">Tree</button>
                    <button class="btn" onclick="setLayout('cose')">Force-Directed</button>
                    <button class="btn" onclick="setLayout('circle')">Circle</button>
                    <button class="btn" onclick="setLayout('grid')">Grid</button>
                    <button class="btn" onclick="setLayout('concentric')">Concentric</button>
                    <button class="btn" onclick="setLayout('random')">Random</button>
                </div>

                <div class="control-group">
                    <h3>Node Filters</h3>
                    <button class="btn active" onclick="toggleNodeType('navigation_root')">Navigation Root</button>
                    <button class="btn active" onclick="toggleNodeType('document')">Documents</button>
                    <button class="btn active" onclick="toggleNodeType('concept')">Concepts</button>
                    <button class="btn active" onclick="toggleNodeType('section')">Sections</button>
                    <button class="btn active" onclick="toggleNodeType('directory')">Directories</button>
                </div>

                <div class="control-group">
                    <h3>Edge Filters</h3>
                    <button class="btn active" onclick="toggleEdgeType('defines_navigation')">Defines Navigation</button>
                    <button class="btn active" onclick="toggleEdgeType('navigation_entry')">Navigation Entry</button>
                    <button class="btn active" onclick="toggleEdgeType('contains')">Contains</button>
                    <button class="btn active" onclick="toggleEdgeType('mentions')">Mentions</button>
                    <button class="btn active" onclick="toggleEdgeType('links_to')">Links</button>
                    <button class="btn active" onclick="toggleEdgeType('co_occurs')">Co-occurs</button>
                </div>

                <div class="control-group">
                    <h3>View Options</h3>
                    <button class="btn" onclick="fitGraph()">Fit to Screen</button>
                    <button class="btn" onclick="resetFilters()">Reset Filters</button>
                    <button class="btn" onclick="exportData()">Export Data</button>
                </div>
            </div>

            <!-- Search -->
            <div class="search-box">
                <h3>Search</h3>
                <input type="text" id="searchInput" placeholder="Search nodes..." onkeyup="searchNodes()">
                <div class="search-results" id="searchResults"></div>
            </div>

            <!-- Legend -->
            <div class="legend">
                <h3>Legend</h3>
                <div class="legend-item">
                    <div class="legend-color" style="background: #ff9800;"></div>
                    <span class="legend-text">Navigation Root</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #3498db;"></div>
                    <span class="legend-text">Documents</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #e74c3c;"></div>
                    <span class="legend-text">Concepts</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #9b59b6;"></div>
                    <span class="legend-text">Sections</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #f39c12;"></div>
                    <span class="legend-text">Directories</span>
                </div>
            </div>

            <!-- Node Information -->
            <div class="node-info" id="nodeInfo" style="display: none;">
                <h4>Node Information</h4>
                <div id="nodeDetails"></div>
            </div>

            <!-- Analysis Section -->
            <div class="analysis-section">
                <h3>Analysis & Recommendations</h3>
                <div id="recommendations"></div>
            </div>
        </div>

        <div class="main-content">
            <div class="loading" id="loading">Loading graph...</div>
            <div id="cy"></div>
            
            <div class="toolbar">
                <div style="font-weight: bold; margin-bottom: 10px;">Quick Actions</div>
                <button class="btn btn-small" onclick="highlightNavigationRoot()">Show Navigation</button>
                <button class="btn btn-small" onclick="highlightHubs()">Show Hubs</button>
                <button class="btn btn-small" onclick="highlightOrphans()">Show Orphans</button>
                <button class="btn btn-small" onclick="showConceptClusters()">Concept Clusters</button>
                <button class="btn btn-small" onclick="clearHighlights()">Clear Highlights</button>
            </div>
        </div>
    </div>

    <script>
        // Global variables
        let cy;
        let graphData = {{GRAPH_DATA}};
        let analysisData = {{ANALYSIS_DATA}};
        let visibleNodeTypes = new Set(['navigation_root', 'document', 'concept', 'section', 'directory']);
        let visibleEdgeTypes = new Set(['defines_navigation', 'navigation_entry', 'contains', 'mentions', 'links_to', 'co_occurs']);

        // Initialize the visualization
        document.addEventListener('DOMContentLoaded', function() {
            initializeCytoscape();
            loadRecommendations();
            document.getElementById('loading').style.display = 'none';
        });

        function initializeCytoscape() {
            cy = cytoscape({
                container: document.getElementById('cy'),
                elements: {
                    nodes: graphData.nodes.map(node => ({
                        data: {
                            id: node.id,
                            label: node.label || node.id,
                            ...node
                        }
                    })),
                    edges: graphData.edges.map(edge => ({
                        data: {
                            id: edge.id,
                            source: edge.source,
                            target: edge.target,
                            ...edge
                        }
                    }))
                },
                style: [
                    {
                        selector: 'node',
                        style: {
                            'background-color': 'data(color)',
                            'label': 'data(label)',
                            'width': (node) => Math.max(20, (node.data('size') || 1) * 20),
                            'height': (node) => Math.max(20, (node.data('size') || 1) * 20),
                            'font-size': '12px',
                            'text-valign': 'center',
                            'text-halign': 'center',
                            'text-outline-width': 2,
                            'text-outline-color': '#ffffff',
                            'text-max-width': '120px',
                            'text-wrap': 'wrap'
                        }
                    },
                    {
                        selector: 'node[type="navigation_root"]',
                        style: {
                            'background-color': '#ff9800',
                            'border-width': 4,
                            'border-color': '#f57c00',
                            'shape': 'star',
                            'width': (node) => Math.max(50, (node.data('size') || 2.5) * 20),
                            'height': (node) => Math.max(50, (node.data('size') || 2.5) * 20),
                            'font-size': '14px',
                            'font-weight': 'bold',
                            'text-outline-width': 3,
                            'text-outline-color': '#ffffff',
                            'z-index': 100
                        }
                    },
                    {
                        selector: 'edge[type="defines_navigation"], edge[type="navigation_entry"]',
                        style: {
                            'line-color': '#ff9800',
                            'target-arrow-color': '#ff9800',
                            'source-arrow-color': '#ff9800',
                            'width': (edge) => Math.max(2, (edge.data('weight') || 1.5) * 2),
                            'opacity': 0.8
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'width': (edge) => Math.max(1, (edge.data('weight') || 1) * 2),
                            'line-color': '#bdc3c7',
                            'target-arrow-color': '#bdc3c7',
                            'target-arrow-shape': 'triangle',
                            'curve-style': 'bezier',
                            'opacity': 0.6
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
                            'background-color': '#e74c3c',
                            'border-width': 3,
                            'border-color': '#c0392b'
                        }
                    },
                    {
                        selector: 'edge.highlight',
                        style: {
                            'line-color': '#e74c3c',
                            'target-arrow-color': '#e74c3c',
                            'width': 4,
                            'opacity': 1
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
                ],
                layout: {
                    name: 'breadthfirst',
                    directed: true,
                    animate: true,
                    animationDuration: 1000,
                    spacingFactor: 1.5,
                    avoidOverlap: true
                }
            });

            // Event handlers
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

            // Apply initial filters
            applyFilters();
        }

        function setLayout(layoutName) {
            const layouts = {
                'breadthfirst': {
                    name: 'breadthfirst',
                    animate: true,
                    animationDuration: 1000,
                    directed: true,
                    spacingFactor: 1.75,
                    avoidOverlap: true,
                    roots: cy.nodes().filter(node => node.data('type') === 'navigation_root')
                },
                'cose': {
                    name: 'cose',
                    animate: true,
                    animationDuration: 1000,
                    nodeRepulsion: 400000,
                    nodeOverlap: 10,
                    idealEdgeLength: 100,
                    edgeElasticity: 100,
                    nestingFactor: 5,
                    gravity: 80,
                    numIter: 1000,
                    initialTemp: 200,
                    coolingFactor: 0.95,
                    minTemp: 1.0
                },
                'circle': {
                    name: 'circle',
                    animate: true,
                    animationDuration: 1000,
                    radius: Math.min(window.innerWidth, window.innerHeight) * 0.3,
                    spacingFactor: 1.75,
                    avoidOverlap: true
                },
                'grid': {
                    name: 'grid',
                    animate: true,
                    animationDuration: 1000,
                    spacingFactor: 1.75,
                    avoidOverlap: true,
                    rows: Math.ceil(Math.sqrt(cy.nodes().length))
                },
                'concentric': {
                    name: 'concentric',
                    animate: true,
                    animationDuration: 1000,
                    concentric: node => node.degree(),
                    levelWidth: nodes => Math.max(nodes.maxDegree() / 4, 1),
                    spacingFactor: 1.75,
                    avoidOverlap: true
                },
                'random': {
                    name: 'random',
                    animate: true,
                    animationDuration: 1000
                }
            };

            const layout = cy.layout(layouts[layoutName] || layouts['breadthfirst']);
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

        function toggleEdgeType(edgeType) {
            const button = event.target;
            
            if (visibleEdgeTypes.has(edgeType)) {
                visibleEdgeTypes.delete(edgeType);
                button.classList.remove('active');
            } else {
                visibleEdgeTypes.add(edgeType);
                button.classList.add('active');
            }
            
            applyFilters();
        }

        function applyFilters() {
            // Filter nodes
            cy.nodes().forEach(node => {
                const nodeType = node.data('type');
                if (visibleNodeTypes.has(nodeType)) {
                    node.removeClass('hidden');
                } else {
                    node.addClass('hidden');
                }
            });

            // Filter edges
            cy.edges().forEach(edge => {
                const edgeType = edge.data('type');
                const sourceVisible = !edge.source().hasClass('hidden');
                const targetVisible = !edge.target().hasClass('hidden');
                
                if (visibleEdgeTypes.has(edgeType) && sourceVisible && targetVisible) {
                    edge.removeClass('hidden');
                } else {
                    edge.addClass('hidden');
                }
            });
        }

        function resetFilters() {
            visibleNodeTypes = new Set(['document', 'concept', 'section', 'directory']);
            visibleEdgeTypes = new Set(['contains', 'mentions', 'links_to', 'co_occurs']);
            
            // Update button states
            document.querySelectorAll('.btn').forEach(btn => {
                if (btn.onclick && btn.onclick.toString().includes('toggleNodeType') ||
                    btn.onclick && btn.onclick.toString().includes('toggleEdgeType')) {
                    btn.classList.add('active');
                }
            });
            
            applyFilters();
            clearHighlights();
        }

        function fitGraph() {
            cy.fit();
        }

        function showNodeInfo(nodeData) {
            const infoDiv = document.getElementById('nodeInfo');
            const detailsDiv = document.getElementById('nodeDetails');
            
            let html = '<p><strong>Type:</strong> ' + (nodeData.type || 'Unknown') + '</p>';
            html += '<p><strong>Label:</strong> ' + (nodeData.label || nodeData.id) + '</p>';
            
            if (nodeData.type === 'document') {
                html += '<p><strong>Path:</strong> ' + (nodeData.relativePath || 'N/A') + '</p>';
                html += '<p><strong>Words:</strong> ' + (nodeData.wordCount || 0) + '</p>';
                html += '<p><strong>Headings:</strong> ' + (nodeData.headingCount || 0) + '</p>';
                if (nodeData.contentType) {
                    html += '<p><strong>Content Type:</strong> ' + nodeData.contentType + '</p>';
                }
            } else if (nodeData.type === 'concept') {
                html += '<p><strong>Frequency:</strong> ' + (nodeData.frequency || 0) + '</p>';
                html += '<p><strong>Files:</strong> ' + (nodeData.fileCount || 0) + '</p>';
                if (nodeData.category) {
                    html += '<p><strong>Category:</strong> ' + nodeData.category + '</p>';
                }
            }
            
            detailsDiv.innerHTML = html;
            infoDiv.style.display = 'block';
        }

        function hideNodeInfo() {
            document.getElementById('nodeInfo').style.display = 'none';
        }

        function highlightConnected(node) {
            clearHighlights();
            
            node.addClass('highlight');
            
            // Highlight connected nodes and edges
            node.neighborhood().addClass('highlight');
        }

        function clearHighlights() {
            cy.elements().removeClass('highlight');
        }

        function highlightNavigationRoot() {
            clearHighlights();
            
            // Find and highlight navigation root node
            const navigationRoot = cy.nodes().filter(node => {
                return node.data('type') === 'navigation_root';
            });
            
            if (navigationRoot.length > 0) {
                navigationRoot.addClass('highlight');
                
                // Also highlight its connected entry points
                const connectedNodes = navigationRoot.connectedEdges().connectedNodes();
                connectedNodes.addClass('highlight');
                
                // Highlight the navigation edges
                const navigationEdges = cy.edges().filter(edge => {
                    return edge.data('type') === 'defines_navigation' || edge.data('type') === 'navigation_entry';
                });
                navigationEdges.addClass('highlight');
                
                // Center the view on the navigation root
                cy.center(navigationRoot);
            }
        }

        function highlightHubs() {
            clearHighlights();
            
            // Find nodes with high degree
            const hubs = cy.nodes().filter(node => {
                return cy.edges().edgesWith(node).length >= 5;
            });
            
            hubs.addClass('highlight');
        }

        function highlightOrphans() {
            clearHighlights();
            
            // Find nodes with degree 0 or 1
            const orphans = cy.nodes().filter(node => {
                return cy.edges().edgesWith(node).length <= 1;
            });
            
            orphans.addClass('highlight');
        }

        function showConceptClusters() {
            clearHighlights();
            
            // Highlight concept nodes
            const concepts = cy.nodes().filter(node => {
                return node.data('type') === 'concept';
            });
            
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
                const type = (node.data('type') || '').toLowerCase();
                return label.includes(query) || type.includes(query);
            });
            
            let html = '';
            matchingNodes.forEach(node => {
                const data = node.data();
                html += '<div class="search-result" onclick="focusNode(\\''+data.id+'\\')\">';
                html += '<strong>' + (data.label || data.id) + '</strong><br>';
                html += '<small>' + (data.type || 'Unknown') + '</small>';
                html += '</div>';
            });
            
            results.innerHTML = html;
        }

        function focusNode(nodeId) {
            const node = cy.getElementById(nodeId);
            if (node.length > 0) {
                cy.center(node);
                cy.zoom(2);
                showNodeInfo(node.data());
                highlightConnected(node);
            }
        }

        function loadRecommendations() {
            const recommendationsDiv = document.getElementById('recommendations');
            const recommendations = analysisData.recommendations || [];
            
            if (recommendations.length === 0) {
                recommendationsDiv.innerHTML = '<p>No specific recommendations at this time.</p>';
                return;
            }
            
            let html = '';
            recommendations.forEach(rec => {
                html += '<div class="recommendation ' + rec.priority + '">';
                html += '<h5>' + rec.title + '</h5>';
                html += '<p>' + rec.description + '</p>';
                html += '<p><strong>Action:</strong> ' + rec.action + '</p>';
                html += '</div>';
            });
            
            recommendationsDiv.innerHTML = html;
        }

        function exportData() {
            const data = {
                graph: graphData,
                analysis: analysisData,
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'arbitrum-docs-graph-' + new Date().toISOString().split('T')[0] + '.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>`;
  }
}

export default HtmlVisualizer;