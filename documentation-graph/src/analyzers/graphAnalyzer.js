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

import logger from '../utils/logger.js';

// Efficient Queue implementation to replace array.shift() operations
class Queue {
  constructor() {
    this.items = {};
    this.head = 0;
    this.tail = 0;
  }

  enqueue(item) {
    this.items[this.tail] = item;
    this.tail++;
  }

  dequeue() {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return item;
  }

  isEmpty() {
    return this.head === this.tail;
  }

  size() {
    return this.tail - this.head;
  }
}

export class GraphAnalyzer {
  constructor(graph, sidebarData = null, exclusionRules = null) {
    this.graph = graph;
    this.sidebarData = sidebarData;
    this.exclusionRules = exclusionRules || {
      frontmatterExcluded: [],
      internalLinkingExcluded: [],
    };
    this.analysis = {};

    // Advanced Memory Management System
    this.memoryPools = {
      maps: [],
      sets: [],
      arrays: [],
      queues: [],
    };

    // Memory monitoring and configuration
    this.memoryStats = {
      poolHits: 0,
      poolMisses: 0,
      maxPoolSize: 200, // Increased pool size for better reuse
      gcInterval: 5000, // Less frequent GC to allow more pool reuse
      totalAllocations: 0,
      totalDeallocations: 0,
      peakMemoryUsage: 0,
    };

    this.operationCount = 0;
    this.lastGcTime = Date.now();

    // Pre-populate pools with initial objects for commonly used structures
    this.initializePools();
  }

  async performFullAnalysis() {
    logger.section('Graph Analysis Phase');

    this.analysis = {
      basic: this.analyzeBasicStructure(),
      centrality: this.analyzeCentrality(),
      communities: this.analyzeCommunities(),
      connectivity: this.analyzeConnectivity(),
      concepts: this.analyzeConceptDistribution(),
      documents: this.analyzeDocumentStructure(),
      navigation: this.analyzeNavigationStructure(),
      quality: this.analyzeQuality(),
      recommendations: [],
    };

    this.generateRecommendations();

    // Final memory statistics
    this.logFinalMemoryStats();

    logger.success('Completed comprehensive graph analysis');
    return this.analysis;
  }

  analyzeBasicStructure() {
    logger.subsection('Basic structure analysis');

    const nodesByType = {};
    const edgesByType = {};

    this.graph.forEachNode((node, attributes) => {
      const type = attributes.type;
      nodesByType[type] = (nodesByType[type] || 0) + 1;
    });

    this.graph.forEachEdge((edge, attributes) => {
      const type = attributes.type;
      edgesByType[type] = (edgesByType[type] || 0) + 1;
    });

    const density = this.graph.size / ((this.graph.order * (this.graph.order - 1)) / 2);
    const avgDegree = (this.graph.size * 2) / this.graph.order;

    return {
      totalNodes: this.graph.order,
      totalEdges: this.graph.size,
      nodesByType,
      edgesByType,
      density,
      avgDegree,
      isConnected: this.isConnected(),
    };
  }

  analyzeCentrality() {
    logger.subsection('Centrality analysis');
    const startTime = Date.now();

    logger.debug('Computing degree centrality for all nodes');
    const degreeCentrality = new Map();

    // Calculate degree centrality (fast - O(V))
    this.graph.forEachNode((node) => {
      degreeCentrality.set(node, this.graph.degree(node));
    });

    logger.success(
      `Degree centrality completed in ${((Date.now() - startTime) / 1000).toFixed(1)}s`,
    );

    // Calculate betweenness centrality (using efficient Brandes algorithm)
    const betweennessCentrality = this.calculateBetweennessCentrality();

    // Calculate harmonic centrality (scalable alternative to closeness)
    const harmonicCentrality = this.calculateClosenessCentrality();

    // Get top nodes by each centrality measure
    const topDegree = this.getTopNodes(degreeCentrality, 15);
    const topBetweenness = this.getTopNodes(betweennessCentrality, 15);
    const topHarmonic = this.getTopNodes(harmonicCentrality, 15);

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.success(`Centrality analysis completed in ${totalTime}s`);

    return {
      degree: {
        values: Object.fromEntries(degreeCentrality),
        statistics: this.calculateCentralityStatistics(degreeCentrality),
        top: topDegree.map(([node, score]) => ({
          node,
          score,
          label: this.graph.getNodeAttribute(node, 'label'),
          type: this.graph.getNodeAttribute(node, 'type'),
        })),
      },
      betweenness: {
        values: Object.fromEntries(betweennessCentrality),
        statistics: this.calculateCentralityStatistics(betweennessCentrality),
        top: topBetweenness.map(([node, score]) => ({
          node,
          score: parseFloat(score.toFixed(6)), // Round for readability
          label: this.graph.getNodeAttribute(node, 'label'),
          type: this.graph.getNodeAttribute(node, 'type'),
        })),
      },
      harmonic: {
        values: Object.fromEntries(harmonicCentrality),
        statistics: this.calculateCentralityStatistics(harmonicCentrality),
        description:
          'Harmonic centrality (sum of reciprocal distances) - more robust than closeness centrality for large/disconnected graphs',
        top: topHarmonic.map(([node, score]) => ({
          node,
          score: parseFloat(score.toFixed(4)), // Round for readability
          label: this.graph.getNodeAttribute(node, 'label'),
          type: this.graph.getNodeAttribute(node, 'type'),
        })),
      },
      // Keep legacy name for backward compatibility but note the change
      closeness: {
        values: Object.fromEntries(harmonicCentrality),
        statistics: this.calculateCentralityStatistics(harmonicCentrality),
        description:
          'Note: This is actually harmonic centrality, which is more scalable and robust than traditional closeness centrality',
        top: topHarmonic.map(([node, score]) => ({
          node,
          score: parseFloat(score.toFixed(4)),
          label: this.graph.getNodeAttribute(node, 'label'),
          type: this.graph.getNodeAttribute(node, 'type'),
        })),
      },
    };
  }

  analyzeCommunities() {
    logger.subsection('Community detection');
    const startTime = Date.now();

    const communities = this.detectCommunities();
    const communityStats = this.analyzeCommunityStats(communities);
    const modularity = this.calculateModularity(communities);

    const result = {
      total: communities.length,
      communities: communities.slice(0, 20).map((community, index) => ({
        id: index,
        size: community.length,
        nodes: community.slice(0, 3), // Sample nodes for inspection
        types: this.getComponentNodeTypes(community),
        density: this.calculateComponentDensity(community),
      })),
      stats: communityStats,
      modularity: {
        value: modularity,
        interpretation: this.interpretModularity(modularity),
      },
      distribution: {
        sizes: communities.map((c) => c.length).sort((a, b) => b - a),
        largestCommunity: Math.max(...communities.map((c) => c.length)),
        averageSize:
          communities.length > 0
            ? communities.reduce((sum, c) => sum + c.length, 0) / communities.length
            : 0,
        coverage: {
          totalNodesInCommunities: communities.reduce((sum, c) => sum + c.length, 0),
          percentage: (
            (communities.reduce((sum, c) => sum + c.length, 0) / this.graph.order) *
            100
          ).toFixed(1),
        },
      },
    };

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.success(`Community analysis completed in ${totalTime}s`);

    return result;
  }

  interpretModularity(modularity) {
    if (modularity > 0.7) return 'Very strong community structure';
    if (modularity > 0.5) return 'Strong community structure';
    if (modularity > 0.3) return 'Moderate community structure';
    if (modularity > 0.1) return 'Weak community structure';
    return 'Little to no community structure';
  }

  analyzeConnectivity() {
    logger.subsection('Connectivity analysis');
    const startTime = Date.now();

    const components = this.findConnectedComponents();
    const bridges = this.findBridges();
    const articulationPoints = this.findArticulationPoints();

    const largestComponent = Math.max(...components.map((c) => c.length));
    const componentSizes = components.map((c) => c.length).sort((a, b) => b - a);

    const result = {
      components: components.map((component, index) => ({
        id: index,
        size: component.length,
        nodes: component.slice(0, 5), // First 5 nodes for brevity
        nodeTypes: this.getComponentNodeTypes(component),
        density: this.calculateComponentDensity(component),
      })),
      bridges: {
        count: bridges.length,
        examples: bridges.slice(0, 5).map((bridge) => ({
          source: this.graph.getNodeAttribute(bridge.source, 'label') || bridge.source,
          target: this.graph.getNodeAttribute(bridge.target, 'label') || bridge.target,
          sourceType: this.graph.getNodeAttribute(bridge.source, 'type'),
          targetType: this.graph.getNodeAttribute(bridge.target, 'type'),
        })),
      },
      articulationPoints: {
        count: articulationPoints.length,
        examples: articulationPoints.slice(0, 10).map((node) => ({
          node,
          label: this.graph.getNodeAttribute(node, 'label'),
          type: this.graph.getNodeAttribute(node, 'type'),
          degree: this.graph.degree(node),
        })),
      },
      largestComponent,
      totalComponents: components.length,
      componentDistribution: {
        sizes: componentSizes.slice(0, 10),
        singletonComponents: componentSizes.filter((size) => size === 1).length,
        giantComponent: {
          size: largestComponent,
          percentage: ((largestComponent / this.graph.order) * 100).toFixed(1),
        },
      },
      connectivityScore: this.calculateConnectivityScore(
        components,
        bridges.length,
        articulationPoints.length,
      ),
    };

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.success(`Connectivity analysis completed in ${totalTime}s`);

    return result;
  }

  analyzeConceptDistribution() {
    logger.subsection('Concept distribution analysis');

    const conceptNodes = [];
    const conceptsByType = {};
    const conceptsByCategory = {};
    const conceptFrequencies = [];

    this.graph.forEachNode((node, attributes) => {
      if (attributes.type === 'concept') {
        conceptNodes.push({
          node,
          label: attributes.label,
          conceptType: attributes.conceptType,
          category: attributes.category,
          frequency: attributes.frequency,
          fileCount: attributes.fileCount,
        });

        const type = attributes.conceptType || 'unknown';
        conceptsByType[type] = (conceptsByType[type] || 0) + 1;

        const category = attributes.category || 'unknown';
        conceptsByCategory[category] = (conceptsByCategory[category] || 0) + 1;

        conceptFrequencies.push(attributes.frequency || 0);
      }
    });

    conceptNodes.sort((a, b) => b.frequency - a.frequency);

    return {
      total: conceptNodes.length,
      byType: conceptsByType,
      byCategory: conceptsByCategory,
      topConcepts: conceptNodes.slice(0, 20),
      frequencyStats: {
        min: Math.min(...conceptFrequencies),
        max: Math.max(...conceptFrequencies),
        avg: conceptFrequencies.reduce((sum, f) => sum + f, 0) / conceptFrequencies.length,
        median: this.calculateMedian(conceptFrequencies),
      },
    };
  }

  analyzeDocumentStructure() {
    logger.subsection('Document structure analysis');

    const documentNodes = [];
    const documentsByDirectory = {};
    const documentsByType = {};
    const orphanDocuments = [];
    const weaklyConnectedDocuments = [];
    const hubDocuments = [];

    this.graph.forEachNode((node, attributes) => {
      if (attributes.type === 'document') {
        const degree = this.graph.degree(node);
        const inDegree = this.graph.inDegree(node);
        const outDegree = this.graph.outDegree(node);

        const docInfo = {
          node,
          label: attributes.label,
          directory: attributes.directory,
          contentType: attributes.contentType,
          wordCount: attributes.wordCount,
          degree,
          inDegree,
          outDegree,
        };

        documentNodes.push(docInfo);

        // Categorize documents
        const dir = attributes.directory || 'root';
        documentsByDirectory[dir] = (documentsByDirectory[dir] || 0) + 1;

        const type = attributes.contentType || 'unknown';
        documentsByType[type] = (documentsByType[type] || 0) + 1;

        // Identify navigation orphans (not in sidebars.js)
        if (attributes.navigation?.isOrphaned === true) {
          orphanDocuments.push(docInfo);
        }

        // Identify weakly connected documents (separate from orphans)
        if (degree <= 1 && attributes.navigation?.isOrphaned !== true) {
          weaklyConnectedDocuments.push(docInfo);
        }

        // Identify hubs (high degree)
        if (degree >= 10) {
          hubDocuments.push(docInfo);
        }
      }
    });

    return {
      total: documentNodes.length,
      byDirectory: documentsByDirectory,
      byType: documentsByType,
      orphans: orphanDocuments.slice(0, 10),
      weaklyConnected: weaklyConnectedDocuments.slice(0, 10),
      hubs: hubDocuments.sort((a, b) => b.degree - a.degree).slice(0, 10),
      avgConnections:
        documentNodes.reduce((sum, doc) => sum + doc.degree, 0) / documentNodes.length,
    };
  }

  analyzeNavigationStructure() {
    logger.subsection('Navigation structure analysis');

    if (!this.sidebarData) {
      logger.warn('Navigation Analysis Unavailable: Sidebar data not found or processed');
      return {
        available: false,
        reason: 'Sidebar data not found or processed',
        message: 'Run extraction with sidebar analysis enabled to get navigation insights',
      };
    }

    logger.info('Performing comprehensive navigation analysis using sidebars.js as root');

    // Get comprehensive root analysis from enhanced SidebarExtractor
    const rootAnalysis = this.sidebarData.analyzeSidebarAsRoot
      ? this.sidebarData.analyzeSidebarAsRoot()
      : null;

    if (!rootAnalysis) {
      logger.warn('Enhanced sidebar analysis not available - using basic metrics');
      return this.fallbackNavigationAnalysis();
    }

    logger.debug('Building comprehensive navigation analysis with root tree structure');

    const navigationAnalysis = {
      available: true,
      timestamp: new Date().toISOString(),
      rootFile: rootAnalysis.rootFile,

      // Basic metrics from sidebar analysis
      metrics: {
        totalSidebars: rootAnalysis.totalSidebars,
        totalEntries: this.sidebarData.metrics?.totalEntries || 0,
        maxDepth: this.sidebarData.metrics?.maxDepth || 0,
        totalCategories: this.sidebarData.metrics?.totalCategories || 0,
        totalDocuments: this.sidebarData.metrics?.totalDocuments || 0,
        externalLinks: this.sidebarData.metrics?.totalLinks || 0,
        orphanedEntries: this.sidebarData.metrics?.orphanedEntries || 0,
      },

      // Master navigation tree from sidebars.js
      masterNavigationTree: rootAnalysis.masterNavigationTree,

      // Document coverage analysis
      documentCoverage: {
        ...rootAnalysis.documentCoverage,
        // Cross-reference with graph nodes for additional insights
        graphIntegration: this.analyzeGraphNavigationCoverage(rootAnalysis.documentCoverage),
      },

      // Navigation path analysis
      navigationPaths: rootAnalysis.navigationPaths,

      // Hierarchy balance analysis
      hierarchyBalance: {
        ...rootAnalysis.hierarchyBalance,
        // Additional graph-based balance metrics
        graphConnectivity: this.analyzeNavigationConnectivity(rootAnalysis),
      },

      // Cross-references and inter-section links
      crossReferences: rootAnalysis.crossReferences,

      // Primary entry points identification
      entryPoints: {
        count: rootAnalysis.entryPoints.length,
        documents: rootAnalysis.entryPoints,
        // Enhance with centrality data from graph
        centralityEnhanced: this.enhanceEntryPointsWithCentrality(rootAnalysis.entryPoints),
      },

      // Orphaned documents analysis
      orphanedDocuments: this.analyzeOrphanedDocuments(rootAnalysis),

      // User journey analysis based on navigation structure
      userJourneys: this.analyzeUserJourneys(rootAnalysis),

      // Navigation quality assessment
      quality: this.assessNavigationQuality(rootAnalysis),

      // Coverage summary for reporting (derived from documentCoverage)
      coverage: this.buildCoverageSummary(rootAnalysis),

      // Specific recommendations for improvements
      recommendations: this.generateNavigationRecommendations(rootAnalysis),
    };

    logger.success(
      `Navigation analysis complete: ${navigationAnalysis.metrics.totalSidebars} sidebars, ${navigationAnalysis.documentCoverage.totalDocumentsInNavigation} documents in navigation`,
    );

    return navigationAnalysis;
  }

  analyzeNavigationBalance() {
    if (!this.sidebarData || !this.sidebarData.structure) {
      return {
        balanced: false,
        reason: 'No navigation structure data',
      };
    }

    const sidebarBalance = [];

    for (const [sidebarKey, structure] of this.sidebarData.structure.entries()) {
      const balance = {
        sidebar: sidebarKey,
        totalDocuments: structure.documents.size,
        totalCategories: structure.categories.size,
        maxDepth: structure.depth,
        documentsPerCategory:
          structure.categories.size > 0
            ? structure.documents.size / structure.categories.size
            : structure.documents.size,
      };

      // Analyze category balance within this sidebar
      balance.categoryBalance = this.analyzeCategoryBalance(structure);

      sidebarBalance.push(balance);
    }

    // Calculate overall balance metrics
    const totalDocs = sidebarBalance.reduce((sum, sb) => sum + sb.totalDocuments, 0);
    const avgDocsPerSidebar = sidebarBalance.length > 0 ? totalDocs / sidebarBalance.length : 0;

    const balanceScore = this.calculateNavigationBalanceScore(sidebarBalance);

    return {
      balanced: balanceScore > 0.7,
      score: balanceScore,
      averageDocsPerSidebar: avgDocsPerSidebar.toFixed(1),
      sidebars: sidebarBalance,
      issues: this.identifyNavigationBalanceIssues(sidebarBalance),
    };
  }

  analyzeCategoryBalance(structure) {
    if (!structure.entries || structure.entries.length === 0) {
      return { balanced: true, categories: [] };
    }

    const categoryStats = [];

    for (const entry of structure.entries) {
      if (entry.type === 'category') {
        categoryStats.push({
          name: entry.label,
          documentCount: entry.totalDocuments || 0,
          subcategoryCount: entry.totalSubcategories || 0,
          depth: entry.depth || 1,
          collapsed: entry.collapsed,
        });
      }
    }

    // Calculate balance metrics
    if (categoryStats.length === 0) {
      return { balanced: true, categories: [] };
    }

    const docCounts = categoryStats.map((cat) => cat.documentCount);
    const avgDocs = docCounts.reduce((sum, count) => sum + count, 0) / docCounts.length;
    const variance =
      docCounts.reduce((sum, count) => sum + Math.pow(count - avgDocs, 2), 0) / docCounts.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = avgDocs > 0 ? standardDeviation / avgDocs : 0;

    return {
      balanced: coefficientOfVariation < 0.5, // Considered balanced if CV < 0.5
      averageDocuments: avgDocs.toFixed(1),
      standardDeviation: standardDeviation.toFixed(1),
      coefficientOfVariation: coefficientOfVariation.toFixed(2),
      categories: categoryStats,
      imbalancedCategories: categoryStats.filter(
        (cat) => Math.abs(cat.documentCount - avgDocs) > standardDeviation,
      ),
    };
  }

  calculateNavigationBalanceScore(sidebarBalance) {
    if (sidebarBalance.length === 0) return 0;

    let totalScore = 0;
    let factors = 0;

    for (const sidebar of sidebarBalance) {
      // Factor 1: Category balance (weight: 0.4)
      if (sidebar.categoryBalance && sidebar.categoryBalance.coefficientOfVariation !== undefined) {
        const cvScore = Math.max(0, 1 - parseFloat(sidebar.categoryBalance.coefficientOfVariation));
        totalScore += cvScore * 0.4;
        factors += 0.4;
      }

      // Factor 2: Depth reasonableness (weight: 0.3)
      const depthScore = sidebar.maxDepth <= 4 ? 1 : Math.max(0, 1 - (sidebar.maxDepth - 4) * 0.2);
      totalScore += depthScore * 0.3;
      factors += 0.3;

      // Factor 3: Documents per category (weight: 0.3)
      const optimalDocsPerCategory = 8; // Ideal number
      const docsPerCatScore =
        sidebar.documentsPerCategory <= optimalDocsPerCategory
          ? 1
          : Math.max(0, 1 - (sidebar.documentsPerCategory - optimalDocsPerCategory) * 0.1);
      totalScore += docsPerCatScore * 0.3;
      factors += 0.3;
    }

    return factors > 0 ? totalScore / factors : 0;
  }

  identifyNavigationBalanceIssues(sidebarBalance) {
    const issues = [];

    for (const sidebar of sidebarBalance) {
      // Too deep navigation
      if (sidebar.maxDepth > 4) {
        issues.push({
          type: 'deep_navigation',
          sidebar: sidebar.sidebar,
          depth: sidebar.maxDepth,
          severity: sidebar.maxDepth > 6 ? 'high' : 'medium',
          description: `Navigation depth of ${sidebar.maxDepth} may hurt user experience`,
        });
      }

      // Too many documents per category
      if (sidebar.documentsPerCategory > 15) {
        issues.push({
          type: 'overcrowded_categories',
          sidebar: sidebar.sidebar,
          docsPerCategory: sidebar.documentsPerCategory.toFixed(1),
          severity: 'medium',
          description: 'Categories may be too crowded, consider subcategories',
        });
      }

      // Imbalanced categories
      if (sidebar.categoryBalance && !sidebar.categoryBalance.balanced) {
        const imbalanced = sidebar.categoryBalance.imbalancedCategories || [];
        if (imbalanced.length > 0) {
          issues.push({
            type: 'imbalanced_categories',
            sidebar: sidebar.sidebar,
            imbalancedCount: imbalanced.length,
            categories: imbalanced.slice(0, 3).map((cat) => cat.name),
            severity: 'low',
            description: 'Some categories have significantly different numbers of documents',
          });
        }
      }
    }

    return issues;
  }

  analyzeUserJourneys() {
    if (!this.sidebarData) {
      return {
        available: false,
        reason: 'No sidebar data available',
      };
    }

    const journeys = {
      available: true,
      entryPoints: [],
      commonPaths: [],
      deadEnds: [],
      crossReferences: [],
    };

    // Identify entry points (documents at shallow depths)
    this.graph.forEachNode((node, attributes) => {
      if (attributes.type === 'document' && attributes.navigation) {
        const navData = attributes.navigation;

        if (navData.isEntryPoint) {
          journeys.entryPoints.push({
            document: attributes.label,
            paths: navData.navigationPaths,
            connections: this.graph.degree(node),
          });
        }

        // Identify potential dead ends (low connectivity)
        if (this.graph.degree(node) <= 2 && navData.inNavigation) {
          journeys.deadEnds.push({
            document: attributes.label,
            connections: this.graph.degree(node),
            navigationDepth: navData.depth,
            categories: navData.categories,
          });
        }
      }
    });

    // Analyze cross-references between different navigation sections
    journeys.crossReferences = this.analyzeCrossNavReferences();

    // Sort by relevance
    journeys.entryPoints.sort((a, b) => b.connections - a.connections);
    journeys.deadEnds.sort((a, b) => a.connections - b.connections);

    return {
      ...journeys,
      entryPoints: journeys.entryPoints.slice(0, 10),
      deadEnds: journeys.deadEnds.slice(0, 10),
    };
  }

  analyzeCrossNavReferences() {
    const crossRefs = [];

    this.graph.forEachEdge((edge, attributes) => {
      if (attributes.type === 'links_to') {
        const sourceNode = this.graph.source(edge);
        const targetNode = this.graph.target(edge);

        const sourceNav = this.graph.getNodeAttribute(sourceNode, 'navigation');
        const targetNav = this.graph.getNodeAttribute(targetNode, 'navigation');

        if (
          sourceNav &&
          targetNav &&
          sourceNav.inNavigation &&
          targetNav.inNavigation &&
          sourceNav.navigationPaths &&
          targetNav.navigationPaths
        ) {
          // Check if documents are in different navigation sections
          const sourceSections = new Set(sourceNav.navigationPaths.map((path) => path[0]));
          const targetSections = new Set(targetNav.navigationPaths.map((path) => path[0]));

          const intersection = new Set([...sourceSections].filter((x) => targetSections.has(x)));

          if (intersection.size === 0) {
            // Cross-section reference
            crossRefs.push({
              sourceDocument: this.graph.getNodeAttribute(sourceNode, 'label'),
              targetDocument: this.graph.getNodeAttribute(targetNode, 'label'),
              sourceSections: Array.from(sourceSections),
              targetSections: Array.from(targetSections),
            });
          }
        }
      }
    });

    return crossRefs.slice(0, 20); // Limit for report
  }

  analyzeQuality() {
    logger.subsection('Quality analysis');

    const issues = [];
    const strengths = [];

    logger.debug(
      `Using exclusion rules: ${this.exclusionRules.frontmatterExcluded.length} frontmatter patterns, ${this.exclusionRules.internalLinkingExcluded.length} internal linking patterns`,
    );

    // Check for documents not in navigation (true orphans) and isolated documents
    let orphanCount = 0;
    let isolatedCount = 0;

    this.graph.forEachNode((node, attributes) => {
      if (attributes.type === 'document') {
        // True orphans: not in sidebars.js
        if (attributes.navigation?.isOrphaned === true) {
          orphanCount++;
        }
        // Isolated documents: in navigation but no graph connections
        else if (this.graph.degree(node) === 0) {
          isolatedCount++;
        }
      }
    });

    if (orphanCount > 0) {
      issues.push({
        type: 'orphaned_documents',
        count: orphanCount,
        severity: 'high',
        description: `${orphanCount} documents are not included in sidebars.js navigation`,
      });
    }

    if (isolatedCount > 0) {
      issues.push({
        type: 'isolated_documents',
        count: isolatedCount,
        severity: 'low',
        description: `${isolatedCount} documents are in navigation but have no internal links`,
      });
    }

    // Check for broken links
    let brokenLinksCount = 0;
    this.graph.forEachEdge((edge, attributes) => {
      if (attributes.type === 'links_to' && !this.graph.hasNode(attributes.target)) {
        brokenLinksCount++;
      }
    });

    if (brokenLinksCount > 0) {
      issues.push({
        type: 'broken_links',
        count: brokenLinksCount,
        severity: 'high',
        description: `${brokenLinksCount} broken internal links detected`,
      });
    }

    // Check concept coverage
    const conceptCoverage = this.calculateConceptCoverage();
    if (conceptCoverage < 0.7) {
      issues.push({
        type: 'low_concept_coverage',
        coverage: conceptCoverage,
        severity: 'low',
        description: 'Some documents may lack sufficient conceptual connections',
      });
    } else {
      strengths.push({
        type: 'good_concept_coverage',
        coverage: conceptCoverage,
        description: 'Documents have good conceptual coverage',
      });
    }

    // Check connectivity
    const connectivity =
      this.analysis.basic?.density ||
      this.graph.size / ((this.graph.order * (this.graph.order - 1)) / 2);
    if (connectivity > 0.1) {
      strengths.push({
        type: 'well_connected',
        density: connectivity,
        description: 'Documentation is well-connected',
      });
    }

    // Navigation-specific quality checks
    if (this.analysis.navigation && this.analysis.navigation.available) {
      const navAnalysis = this.analysis.navigation;

      // Check navigation coverage (with exclusions)
      const coveragePercent = parseFloat(navAnalysis.coverage?.coveragePercentage || '0');
      const orphanedDocs = navAnalysis.orphanedDocuments?.documents || [];

      // Filter orphaned documents to exclude those that match exclusion patterns
      const filteredOrphanedDocs = this.filterDocumentsByExclusionRules(
        orphanedDocs,
        this.exclusionRules.frontmatterExcluded,
      );
      const filteredOrphanedCount = filteredOrphanedDocs.length;

      if (coveragePercent < 80 && filteredOrphanedCount > 0) {
        issues.push({
          type: 'low_navigation_coverage',
          coverage: coveragePercent,
          orphanedCount: filteredOrphanedCount,
          excludedCount: orphanedDocs.length - filteredOrphanedCount,
          severity: coveragePercent < 60 ? 'high' : 'medium',
          description: `${coveragePercent}% of documents are included in navigation (${filteredOrphanedCount} relevant orphaned documents after applying exclusion rules)`,
        });
      } else {
        strengths.push({
          type: 'good_navigation_coverage',
          coverage: coveragePercent,
          description: 'Most documents are included in navigation structure',
        });
      }

      // Check navigation balance
      if (navAnalysis.balance && !navAnalysis.balance.balanced) {
        issues.push({
          type: 'unbalanced_navigation',
          score: navAnalysis.balance.score,
          severity: 'medium',
          description: 'Navigation structure is not well balanced across categories',
        });
      }

      // Check for deep nesting
      if (navAnalysis.deepNesting && navAnalysis.deepNesting.count > 0) {
        issues.push({
          type: 'deep_navigation_nesting',
          count: navAnalysis.deepNesting.count,
          severity: navAnalysis.deepNesting.count > 10 ? 'high' : 'low',
          description: `${navAnalysis.deepNesting.count} documents are deeply nested in navigation`,
        });
      }

      // Check for missing entry points
      if (navAnalysis.entryPoints && navAnalysis.entryPoints.count < 3) {
        issues.push({
          type: 'few_entry_points',
          count: navAnalysis.entryPoints.count,
          severity: 'medium',
          description: 'Documentation may benefit from more clear entry points',
        });
      }

      // Check for dead ends
      if (
        navAnalysis.userJourneys &&
        navAnalysis.userJourneys.deadEnds &&
        navAnalysis.userJourneys.deadEnds.length > 5
      ) {
        issues.push({
          type: 'navigation_dead_ends',
          count: navAnalysis.userJourneys.deadEnds.length,
          severity: 'low',
          description: 'Some documents have few connections and may be hard to discover',
        });
      }

      // Positive signals for cross-references
      if (
        navAnalysis.userJourneys &&
        navAnalysis.userJourneys.crossReferences &&
        navAnalysis.userJourneys.crossReferences.length > 0
      ) {
        strengths.push({
          type: 'cross_section_links',
          count: navAnalysis.userJourneys.crossReferences.length,
          description: 'Good cross-references between different documentation sections',
        });
      }
    }

    return {
      issues,
      strengths,
      overallScore: Math.max(0, 100 - issues.length * 20 + strengths.length * 10),
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const quality = this.analysis.quality;

    if (quality.issues) {
      for (const issue of quality.issues) {
        switch (issue.type) {
          case 'orphaned_documents':
            recommendations.push({
              priority: 'high',
              category: 'navigation',
              title: 'Add orphaned documents to sidebars.js',
              description: `${issue.count} documents are not included in the navigation structure. Add them to appropriate sidebar sections in sidebars.js to make them discoverable to users.`,
              action: 'Add documents to sidebars.js navigation structure',
            });
            break;

          case 'isolated_documents':
            recommendations.push({
              priority: 'low',
              category: 'structure',
              title: 'Improve internal linking for isolated documents',
              description: `${issue.count} documents are in navigation but have no internal links. Consider adding contextual links to and from related content.`,
              action: 'Review documents and add relevant cross-references',
            });
            break;

          case 'broken_links':
            recommendations.push({
              priority: 'critical',
              category: 'maintenance',
              title: 'Fix broken internal links',
              description: `Repair ${issue.count} broken internal links to improve navigation and user experience.`,
              action: 'Audit and update broken link references',
            });
            break;

          case 'low_concept_coverage':
            recommendations.push({
              priority: 'medium',
              category: 'content',
              title: 'Improve conceptual connections',
              description: 'Some documents lack sufficient connections to key concepts.',
              action: 'Review content and add references to important domain concepts',
            });
            break;

          case 'low_navigation_coverage':
            recommendations.push({
              priority: 'high',
              category: 'navigation',
              title: 'Improve navigation coverage',
              description: `Only ${issue.coverage}% of documents are included in navigation. ${issue.orphanedCount} documents are orphaned.`,
              action: 'Review orphaned documents and add them to appropriate sidebar sections',
            });
            break;

          case 'unbalanced_navigation':
            recommendations.push({
              priority: 'medium',
              category: 'navigation',
              title: 'Balance navigation structure',
              description:
                'Navigation categories are not well balanced in terms of content distribution.',
              action:
                'Reorganize categories to achieve better balance, consider splitting large sections',
            });
            break;

          case 'deep_navigation_nesting':
            recommendations.push({
              priority: 'medium',
              category: 'navigation',
              title: 'Reduce navigation depth',
              description: `${issue.count} documents are deeply nested, which may hurt discoverability.`,
              action:
                'Restructure deeply nested content or promote important documents to higher levels',
            });
            break;

          case 'few_entry_points':
            recommendations.push({
              priority: 'medium',
              category: 'navigation',
              title: 'Create more entry points',
              description: 'Documentation lacks clear entry points for new users.',
              action:
                'Add overview pages, quickstart guides, or promote key documents to top-level navigation',
            });
            break;

          case 'navigation_dead_ends':
            recommendations.push({
              priority: 'low',
              category: 'navigation',
              title: 'Improve document connectivity',
              description: `${issue.count} documents have few connections and may be hard to discover.`,
              action: 'Add cross-references and related links to improve document discoverability',
            });
            break;
        }
      }
    }

    // Structural recommendations
    const hubs = this.analysis.documents?.hubs || [];
    if (hubs.length > 5) {
      recommendations.push({
        priority: 'medium',
        category: 'structure',
        title: 'Consider hub document optimization',
        description:
          'Several documents have very high connectivity which may indicate they need restructuring.',
        action: 'Review hub documents and consider breaking them into smaller, focused pieces',
      });
    }

    // Community recommendations
    const communities = this.analysis.communities?.communities || [];
    if (communities.length > 10) {
      recommendations.push({
        priority: 'low',
        category: 'organization',
        title: 'Optimize content organization',
        description: `${communities.length} distinct content clusters detected. Consider reorganizing navigation.`,
        action: 'Review content clusters and align with navigation structure',
      });
    }

    this.analysis.recommendations = recommendations;
  }

  // Advanced Memory Management Methods

  initializePools() {
    // Pre-populate pools with initial objects to improve hit rate
    const initialPoolSize = Math.min(
      20,
      this.graph ? Math.ceil(Math.log10(this.graph.order || 10)) : 10,
    );

    // Pre-create Maps
    for (let i = 0; i < initialPoolSize; i++) {
      this.memoryPools.maps.push(new Map());
    }

    // Pre-create Sets
    for (let i = 0; i < initialPoolSize; i++) {
      this.memoryPools.sets.push(new Set());
    }

    // Pre-create Arrays
    for (let i = 0; i < initialPoolSize; i++) {
      this.memoryPools.arrays.push([]);
    }

    // Pre-create Queues
    for (let i = 0; i < Math.ceil(initialPoolSize / 2); i++) {
      this.memoryPools.queues.push(new Queue());
    }

    logger.debug(
      `Initialized memory pools with ${initialPoolSize} objects each (except queues: ${Math.ceil(
        initialPoolSize / 2,
      )})`,
    );
  }

  getPooledMap() {
    if (this.memoryPools.maps.length > 0) {
      this.memoryStats.poolHits++;
      const map = this.memoryPools.maps.pop();
      map.clear(); // Ensure it's clean
      return map;
    } else {
      this.memoryStats.poolMisses++;
      this.memoryStats.totalAllocations++;
      return new Map();
    }
  }

  getPooledSet() {
    if (this.memoryPools.sets.length > 0) {
      this.memoryStats.poolHits++;
      const set = this.memoryPools.sets.pop();
      set.clear(); // Ensure it's clean
      return set;
    } else {
      this.memoryStats.poolMisses++;
      this.memoryStats.totalAllocations++;
      return new Set();
    }
  }

  getPooledArray() {
    if (this.memoryPools.arrays.length > 0) {
      this.memoryStats.poolHits++;
      const array = this.memoryPools.arrays.pop();
      array.length = 0; // Clear array efficiently
      return array;
    } else {
      this.memoryStats.poolMisses++;
      this.memoryStats.totalAllocations++;
      return [];
    }
  }

  getPooledQueue() {
    if (this.memoryPools.queues.length > 0) {
      this.memoryStats.poolHits++;
      const queue = this.memoryPools.queues.pop();
      // Reset queue state
      queue.items = {};
      queue.head = 0;
      queue.tail = 0;
      return queue;
    } else {
      this.memoryStats.poolMisses++;
      this.memoryStats.totalAllocations++;
      return new Queue();
    }
  }

  returnToPool(type, obj) {
    if (!obj) return;

    this.memoryStats.totalDeallocations++;

    const pool = this.memoryPools[type];
    if (pool && pool.length < this.memoryStats.maxPoolSize) {
      // Clear the object before returning to pool
      if (type === 'maps' && obj instanceof Map) {
        obj.clear();
        pool.push(obj);
      } else if (type === 'sets' && obj instanceof Set) {
        obj.clear();
        pool.push(obj);
      } else if (type === 'arrays' && Array.isArray(obj)) {
        obj.length = 0;
        pool.push(obj);
      } else if (type === 'queues' && obj instanceof Queue) {
        obj.items = {};
        obj.head = 0;
        obj.tail = 0;
        pool.push(obj);
      }
    }
  }

  returnPooledArraysFromMap(mapWithArrays) {
    // Return all arrays stored as values in a map to the array pool
    if (!mapWithArrays || !(mapWithArrays instanceof Map)) return;

    mapWithArrays.forEach((array) => {
      if (Array.isArray(array)) {
        this.returnToPool('arrays', array);
      }
    });
  }

  initializeMapWithNodes(map, nodes, defaultValue) {
    // Optimized batch initialization to reduce overhead
    for (let i = 0; i < nodes.length; i++) {
      map.set(nodes[i], defaultValue);
    }
  }

  performMemoryMaintenance() {
    // Perform maintenance every gcInterval operations
    if (this.operationCount % this.memoryStats.gcInterval === 0) {
      this.triggerGarbageCollection();
      this.logMemoryStats();
    }
  }

  triggerGarbageCollection() {
    const now = Date.now();
    if (now - this.lastGcTime > 5000) {
      // At least 5 seconds between GC hints
      if (global.gc) {
        global.gc();
        this.lastGcTime = now;
        logger.debug('Manual garbage collection triggered');
      }
    }

    // Clean up oversized pools
    Object.keys(this.memoryPools).forEach((poolType) => {
      const pool = this.memoryPools[poolType];
      if (pool.length > this.memoryStats.maxPoolSize * 1.5) {
        const excess = pool.length - this.memoryStats.maxPoolSize;
        pool.splice(0, excess);
        logger.debug(`Trimmed ${excess} objects from ${poolType} pool`);
      }
    });
  }

  logMemoryStats() {
    if (this.operationCount % (this.memoryStats.gcInterval * 10) === 0) {
      const hitRate =
        this.memoryStats.poolHits / (this.memoryStats.poolHits + this.memoryStats.poolMisses);
      logger.debug(
        `Memory Stats - Pool hit rate: ${(hitRate * 100).toFixed(1)}%, ` +
          `Allocations: ${this.memoryStats.totalAllocations}, ` +
          `Deallocations: ${this.memoryStats.totalDeallocations}, ` +
          `Pool sizes: Maps=${this.memoryPools.maps.length}, Sets=${this.memoryPools.sets.length}, ` +
          `Arrays=${this.memoryPools.arrays.length}, Queues=${this.memoryPools.queues.length}`,
      );
    }
  }

  logFinalMemoryStats() {
    const hitRate =
      this.memoryStats.poolHits / (this.memoryStats.poolHits + this.memoryStats.poolMisses);
    const netAllocations = this.memoryStats.totalAllocations - this.memoryStats.totalDeallocations;

    logger.section('Final Memory Management Report');
    logger.info(`Total operations: ${this.operationCount.toLocaleString()}`);
    logger.info(
      `Pool hit rate: ${(hitRate * 100).toFixed(
        1,
      )}% (${this.memoryStats.poolHits.toLocaleString()} hits, ${this.memoryStats.poolMisses.toLocaleString()} misses)`,
    );
    logger.info(`Memory allocations: ${this.memoryStats.totalAllocations.toLocaleString()}`);
    logger.info(`Memory deallocations: ${this.memoryStats.totalDeallocations.toLocaleString()}`);
    logger.info(
      `Net allocations: ${netAllocations.toLocaleString()} (${
        netAllocations < 1000 ? 'Good' : 'Consider optimization'
      })`,
    );
    logger.info(
      `Final pool sizes: Maps=${this.memoryPools.maps.length}, Sets=${this.memoryPools.sets.length}, Arrays=${this.memoryPools.arrays.length}, Queues=${this.memoryPools.queues.length}`,
    );
    logger.info(
      `Memory efficiency: ${
        hitRate > 0.7 ? 'Excellent' : hitRate > 0.5 ? 'Good' : hitRate > 0.3 ? 'Fair' : 'Poor'
      }`,
    );
  }

  // Batch processing with memory-aware chunk sizing
  processInMemoryAwareChunks(items, processor, baseChunkSize = 100) {
    const totalNodes = this.graph.order;
    const avgDegree = (this.graph.size * 2) / totalNodes;

    // Dynamically adjust chunk size based on graph density
    let chunkSize = baseChunkSize;
    if (avgDegree > 10) {
      chunkSize = Math.max(25, Math.floor(baseChunkSize * 0.3)); // Dense graphs - smaller chunks
    } else if (avgDegree > 5) {
      chunkSize = Math.max(50, Math.floor(baseChunkSize * 0.6)); // Medium density
    }

    const results = [];

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const chunkResults = processor(chunk);
      if (chunkResults) {
        results.push(...(Array.isArray(chunkResults) ? chunkResults : [chunkResults]));
      }

      // Memory maintenance after each chunk
      this.performMemoryMaintenance();

      // Progress reporting
      if ((i + chunkSize) % (chunkSize * 10) === 0) {
        const progress = (((i + chunkSize) / items.length) * 100).toFixed(1);
        logger.debug(`Chunk processing progress: ${progress}% (chunk size: ${chunkSize})`);
      }
    }

    return results;
  }

  // Helper methods for calculations

  isConnected() {
    if (this.graph.order === 0) return true;

    const visited = this.getPooledSet();
    const stack = this.getPooledArray();
    stack.push(this.graph.nodes()[0]);

    while (stack.length > 0) {
      const node = stack.pop();
      if (!visited.has(node)) {
        visited.add(node);
        this.graph.forEachNeighbor(node, (neighbor) => {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        });
      }
    }

    const result = visited.size === this.graph.order;

    // Return pooled structures
    this.returnToPool('sets', visited);
    this.returnToPool('arrays', stack);

    return result;
  }

  calculateBetweennessCentrality() {
    const totalNodes = this.graph.order;

    if (totalNodes > 20000) {
      logger.debug('Using approximation method for betweenness centrality (large graph detected)');
      return this.calculateBetweennessCentralityApproximate();
    } else {
      logger.debug('Computing exact betweenness centrality using Brandes algorithm');
      return this.calculateBetweennessCentralityExact();
    }
  }

  calculateBetweennessCentralityApproximate() {
    const startTime = Date.now();
    const centrality = this.getPooledMap();
    const nodes = this.graph.nodes();

    // Initialize centrality values with memory-efficient approach
    this.initializeMapWithNodes(centrality, nodes, 0);

    // For very dense graphs, use aggressive sampling with landmark nodes
    const totalNodes = nodes.length;
    const avgDegree = (this.graph.size * 2) / totalNodes;

    // Adaptive sample size based on graph density
    let sampleSize;
    if (avgDegree > 4) {
      // Dense graph - use very small sample
      sampleSize = Math.min(100, Math.ceil(Math.log10(totalNodes) * 10));
    } else {
      // Sparse graph - can use larger sample
      sampleSize = Math.min(1000, Math.ceil(Math.sqrt(totalNodes)));
    }

    logger.debug(
      `Computing betweenness using landmark-based sampling (${sampleSize}/${totalNodes} nodes, avg degree: ${avgDegree.toFixed(
        1,
      )})`,
    );

    // Select landmark nodes (high-degree nodes are more likely to be on shortest paths)
    const landmarks = this.selectLandmarkNodes(nodes, sampleSize);

    logger.debug(`Selected ${landmarks.length} landmark nodes for betweenness approximation`);

    let processedCount = 0;

    // Apply Brandes algorithm to landmarks using pooled data structures
    for (const s of landmarks) {
      const distances = this.getPooledMap();
      const predecessors = this.getPooledMap();
      const sigma = this.getPooledMap();
      const delta = this.getPooledMap();

      // Initialize all nodes with memory-efficient approach
      this.initializeMapWithNodes(distances, nodes, -1);
      nodes.forEach((node) => {
        predecessors.set(node, this.getPooledArray());
      });
      this.initializeMapWithNodes(sigma, nodes, 0);
      this.initializeMapWithNodes(delta, nodes, 0);

      distances.set(s, 0);
      sigma.set(s, 1);

      const queue = this.getPooledQueue();
      queue.enqueue(s);
      const stack = this.getPooledArray();

      // BFS phase - find shortest paths
      while (!queue.isEmpty()) {
        const v = queue.dequeue();
        stack.push(v);

        this.graph.forEachNeighbor(v, (w) => {
          if (distances.get(w) < 0) {
            queue.enqueue(w);
            distances.set(w, distances.get(v) + 1);
          }

          if (distances.get(w) === distances.get(v) + 1) {
            sigma.set(w, sigma.get(w) + sigma.get(v));
            predecessors.get(w).push(v);
          }
        });
      }

      // Accumulation phase - back-propagate dependencies
      while (stack.length > 0) {
        const w = stack.pop();
        for (const v of predecessors.get(w)) {
          const contribution = (sigma.get(v) / sigma.get(w)) * (1 + delta.get(w));
          delta.set(v, delta.get(v) + contribution);
        }
        if (w !== s) {
          centrality.set(w, centrality.get(w) + delta.get(w));
        }
      }

      // Return data structures to pools for reuse
      this.returnPooledArraysFromMap(predecessors); // Return arrays stored in the map
      this.returnToPool('maps', distances);
      this.returnToPool('maps', predecessors);
      this.returnToPool('maps', sigma);
      this.returnToPool('maps', delta);
      this.returnToPool('queues', queue);
      this.returnToPool('arrays', stack);

      processedCount++;

      // Progress reporting and memory maintenance
      if (processedCount % 10 === 0 || processedCount === landmarks.length) {
        const progress = ((processedCount / landmarks.length) * 100).toFixed(1);
        const elapsed = (Date.now() - startTime) / 1000;
        logger.debug(
          `Betweenness approximation progress: ${progress}% (${processedCount}/${
            landmarks.length
          } landmark nodes, ${elapsed.toFixed(1)}s elapsed)`,
        );
      }

      // Periodic memory management
      this.operationCount++;
      this.performMemoryMaintenance();
    }

    // Scale results to approximate full graph values
    const scalingFactor = totalNodes / landmarks.length;
    centrality.forEach((value, node) => {
      centrality.set(node, value * scalingFactor);
    });

    // Normalize for unweighted graphs
    const n = nodes.length;
    const normalization = n > 2 ? 1 / ((n - 1) * (n - 2)) : 1;

    centrality.forEach((value, node) => {
      centrality.set(node, value * normalization);
    });

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.success(
      `Completed approximate betweenness centrality in ${totalTime}s (${landmarks.length}/${totalNodes} landmark nodes)`,
    );

    return centrality;
  }

  calculateBetweennessCentralityExact() {
    const startTime = Date.now();
    const centrality = this.getPooledMap();
    const nodes = this.graph.nodes();

    // Initialize centrality values with memory-efficient approach
    this.initializeMapWithNodes(centrality, nodes, 0);

    let processedCount = 0;
    const totalNodes = nodes.length;

    // Process in batches to manage memory and provide progress feedback
    const batchSize = 500;
    for (let batchStart = 0; batchStart < nodes.length; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, nodes.length);
      const batch = nodes.slice(batchStart, batchEnd);

      for (const s of batch) {
        // Brandes algorithm implementation with pooled data structures
        const distances = this.getPooledMap();
        const predecessors = this.getPooledMap();
        const sigma = this.getPooledMap();
        const delta = this.getPooledMap();

        // Initialize all nodes with memory-efficient approach
        this.initializeMapWithNodes(distances, nodes, -1);
        nodes.forEach((node) => {
          predecessors.set(node, this.getPooledArray());
        });
        this.initializeMapWithNodes(sigma, nodes, 0);
        this.initializeMapWithNodes(delta, nodes, 0);

        distances.set(s, 0);
        sigma.set(s, 1);

        const queue = this.getPooledQueue();
        queue.enqueue(s);
        const stack = this.getPooledArray();

        // BFS phase - find shortest paths
        while (!queue.isEmpty()) {
          const v = queue.dequeue();
          stack.push(v);

          this.graph.forEachNeighbor(v, (w) => {
            // First time we see w?
            if (distances.get(w) < 0) {
              queue.enqueue(w);
              distances.set(w, distances.get(v) + 1);
            }

            // Shortest path to w via v?
            if (distances.get(w) === distances.get(v) + 1) {
              sigma.set(w, sigma.get(w) + sigma.get(v));
              predecessors.get(w).push(v);
            }
          });
        }

        // Accumulation phase - back-propagate dependencies
        while (stack.length > 0) {
          const w = stack.pop();
          for (const v of predecessors.get(w)) {
            const contribution = (sigma.get(v) / sigma.get(w)) * (1 + delta.get(w));
            delta.set(v, delta.get(v) + contribution);
          }
          if (w !== s) {
            centrality.set(w, centrality.get(w) + delta.get(w));
          }
        }

        // Return data structures to pools for reuse
        this.returnPooledArraysFromMap(predecessors);
        this.returnToPool('maps', distances);
        this.returnToPool('maps', predecessors);
        this.returnToPool('maps', sigma);
        this.returnToPool('maps', delta);
        this.returnToPool('queues', queue);
        this.returnToPool('arrays', stack);

        processedCount++;

        // Progress reporting every 1000 nodes
        if (processedCount % 1000 === 0 || processedCount === totalNodes) {
          const progress = ((processedCount / totalNodes) * 100).toFixed(1);
          const elapsed = (Date.now() - startTime) / 1000;
          logger.debug(
            `Betweenness centrality progress: ${progress}% (${processedCount}/${totalNodes} nodes, ${elapsed.toFixed(
              1,
            )}s elapsed)`,
          );
        }

        // Periodic memory management
        this.operationCount++;
        this.performMemoryMaintenance();
      }
    }

    // Normalize betweenness centrality values for unweighted graphs
    const n = nodes.length;
    const normalization = n > 2 ? 1 / ((n - 1) * (n - 2)) : 1;

    centrality.forEach((value, node) => {
      centrality.set(node, value * normalization);
    });

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.success(`Completed exact betweenness centrality calculation in ${totalTime}s`);

    return centrality;
  }

  randomSample(array, sampleSize) {
    if (sampleSize >= array.length) return [...array];

    const result = [];
    const indices = new Set();

    while (result.length < sampleSize) {
      const randomIndex = Math.floor(Math.random() * array.length);
      if (!indices.has(randomIndex)) {
        indices.add(randomIndex);
        result.push(array[randomIndex]);
      }
    }

    return result;
  }

  selectLandmarkNodes(nodes, sampleSize) {
    const startTime = Date.now();

    // For dense graphs, prioritize high-degree nodes as landmarks
    // Use reservoir sampling to efficiently select without sorting all nodes

    const landmarks = [];
    const nodesByDegreeDesc = [];

    // First, collect a larger sample of high-degree candidates
    const candidateSize = Math.min(sampleSize * 10, nodes.length);
    let processed = 0;

    for (const node of nodes) {
      const degree = this.graph.degree(node);

      if (nodesByDegreeDesc.length < candidateSize) {
        nodesByDegreeDesc.push({ node, degree });
      } else {
        // Reservoir sampling with degree-based probability
        const randomIndex = Math.floor(Math.random() * processed);
        if (randomIndex < candidateSize) {
          // Replace with probability based on degree
          const minDegreeIndex = nodesByDegreeDesc.reduce(
            (minIdx, current, idx, arr) => (current.degree < arr[minIdx].degree ? idx : minIdx),
            0,
          );

          if (degree > nodesByDegreeDesc[minDegreeIndex].degree) {
            nodesByDegreeDesc[minDegreeIndex] = { node, degree };
          }
        }
      }

      processed++;

      // Early termination for very large graphs
      if (processed > candidateSize * 5) break;
    }

    // Sort candidates and take top nodes
    nodesByDegreeDesc.sort((a, b) => b.degree - a.degree);
    const topNodes = nodesByDegreeDesc.slice(0, sampleSize).map((item) => item.node);

    const selectionTime = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.debug(
      `Landmark selection completed in ${selectionTime}s: selected ${topNodes.length} high-degree nodes as landmarks`,
    );

    return topNodes;
  }

  efficientStratifiedSample(nodes, sampleSize) {
    const startTime = Date.now();

    // Efficient reservoir sampling with degree-based importance weighting
    const highDegreeNodes = [];
    const mediumDegreeNodes = [];
    const lowDegreeNodes = [];

    // One pass through nodes to categorize by degree ranges
    let maxDegree = 0;
    let totalDegree = 0;

    // First pass: get degree statistics
    const nodeInfo = [];
    for (let i = 0; i < Math.min(nodes.length, 10000); i++) {
      // Sample first 10K for stats
      const node = nodes[i];
      const degree = this.graph.degree(node);
      nodeInfo.push({ node, degree });
      maxDegree = Math.max(maxDegree, degree);
      totalDegree += degree;
    }

    const avgDegree = totalDegree / nodeInfo.length;
    const highThreshold = avgDegree * 2;
    const lowThreshold = Math.max(1, avgDegree * 0.5);

    // Second pass: stratified reservoir sampling
    const highReservoir = [];
    const medReservoir = [];
    const lowReservoir = [];

    const highTarget = Math.ceil(sampleSize * 0.3);
    const medTarget = Math.ceil(sampleSize * 0.5);
    const lowTarget = sampleSize - highTarget - medTarget;

    let highCount = 0;
    let medCount = 0;
    let lowCount = 0;

    for (const node of nodes) {
      const degree = this.graph.degree(node);

      if (degree >= highThreshold) {
        highCount++;
        if (highReservoir.length < highTarget) {
          highReservoir.push(node);
        } else {
          const randomIndex = Math.floor(Math.random() * highCount);
          if (randomIndex < highTarget) {
            highReservoir[randomIndex] = node;
          }
        }
      } else if (degree >= lowThreshold) {
        medCount++;
        if (medReservoir.length < medTarget) {
          medReservoir.push(node);
        } else {
          const randomIndex = Math.floor(Math.random() * medCount);
          if (randomIndex < medTarget) {
            medReservoir[randomIndex] = node;
          }
        }
      } else {
        lowCount++;
        if (lowReservoir.length < lowTarget) {
          lowReservoir.push(node);
        } else {
          const randomIndex = Math.floor(Math.random() * lowCount);
          if (randomIndex < lowTarget) {
            lowReservoir[randomIndex] = node;
          }
        }
      }
    }

    const result = [...highReservoir, ...medReservoir, ...lowReservoir];
    const samplingTime = ((Date.now() - startTime) / 1000).toFixed(2);

    logger.debug(
      `Efficient sampling completed in ${samplingTime}s: ${highReservoir.length} high-degree, ${medReservoir.length} medium-degree, ${lowReservoir.length} low-degree nodes`,
    );

    return result;
  }

  calculateClosenessCentrality() {
    const totalNodes = this.graph.order;
    const avgDegree = (this.graph.size * 2) / totalNodes;

    if (totalNodes > 20000 || avgDegree > 4) {
      logger.debug(
        'Using approximation method for harmonic centrality (large/dense graph detected)',
      );
      return this.calculateHarmonicCentralityApproximate();
    } else {
      logger.debug('Computing exact harmonic centrality for all nodes');
      return this.calculateHarmonicCentralityExact();
    }
  }

  calculateHarmonicCentralityApproximate() {
    logger.debug('Computing harmonic centrality using sampling approach for scalability');
    const startTime = Date.now();

    const centrality = this.getPooledMap();
    const nodes = this.graph.nodes();
    const totalNodes = nodes.length;

    // Initialize centrality values with memory-efficient approach
    this.initializeMapWithNodes(centrality, nodes, 0);

    // Use sampling approach - compute exact harmonic centrality for a sample of nodes
    // then estimate for the rest based on degree and local neighborhood
    const sampleSize = Math.min(1000, Math.ceil(Math.sqrt(totalNodes)));
    const sampleNodes = this.selectLandmarkNodes(nodes, sampleSize);

    logger.debug(`Computing exact harmonic centrality for ${sampleSize} landmark nodes`);

    let processedCount = 0;

    // Compute exact harmonic centrality for sample nodes
    for (const node of sampleNodes) {
      const distances = this.calculateShortestPathsOptimized(node);

      // Calculate harmonic centrality
      let harmonicSum = 0;
      distances.forEach((distance) => {
        if (distance > 0) {
          // Exclude the node itself (distance = 0)
          harmonicSum += 1 / distance;
        }
      });

      centrality.set(node, harmonicSum);
      processedCount++;

      // Progress reporting
      if (processedCount % 100 === 0 || processedCount === sampleNodes.length) {
        const progress = ((processedCount / sampleNodes.length) * 100).toFixed(1);
        const elapsed = (Date.now() - startTime) / 1000;
        logger.debug(
          `Harmonic centrality sampling progress: ${progress}% (${processedCount}/${
            sampleNodes.length
          } nodes, ${elapsed.toFixed(1)}s elapsed)`,
        );
      }
    }

    // Estimate harmonic centrality for non-sampled nodes based on degree correlation
    logger.debug(
      'Estimating harmonic centrality for remaining nodes using degree-based approximation',
    );

    const sampledCentralities = Array.from(sampleNodes.map((node) => centrality.get(node)));
    const sampledDegrees = Array.from(sampleNodes.map((node) => this.graph.degree(node)));

    // Simple linear regression: centrality ~ a * degree + b
    const avgSampledDegree = sampledDegrees.reduce((sum, d) => sum + d, 0) / sampledDegrees.length;
    const avgSampledCentrality =
      sampledCentralities.reduce((sum, c) => sum + c, 0) / sampledCentralities.length;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < sampleNodes.length; i++) {
      const degreeDiff = sampledDegrees[i] - avgSampledDegree;
      const centralityDiff = sampledCentralities[i] - avgSampledCentrality;
      numerator += degreeDiff * centralityDiff;
      denominator += degreeDiff * degreeDiff;
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = avgSampledCentrality - slope * avgSampledDegree;

    // Apply approximation to non-sampled nodes
    const sampleSet = new Set(sampleNodes);
    nodes.forEach((node) => {
      if (!sampleSet.has(node)) {
        const degree = this.graph.degree(node);
        const estimatedCentrality = Math.max(0, slope * degree + intercept);
        centrality.set(node, estimatedCentrality);
      }
    });

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.success(
      `Completed approximate harmonic centrality in ${totalTime}s (exact: ${
        sampleNodes.length
      }, estimated: ${totalNodes - sampleNodes.length})`,
    );

    return centrality;
  }

  calculateHarmonicCentralityExact() {
    logger.debug('Computing harmonic centrality (scalable closeness alternative) for all nodes');
    const startTime = Date.now();

    const centrality = this.getPooledMap();
    const nodes = this.graph.nodes();

    // Initialize centrality values with memory-efficient approach
    this.initializeMapWithNodes(centrality, nodes, 0);

    // Use harmonic centrality instead of closeness for better scalability and robustness
    // Harmonic centrality = sum(1/distance) for all reachable nodes
    let processedCount = 0;
    const totalNodes = nodes.length;

    // Process in batches for memory management
    const batchSize = 1000;
    for (let batchStart = 0; batchStart < nodes.length; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, nodes.length);
      const batch = nodes.slice(batchStart, batchEnd);

      for (const node of batch) {
        const distances = this.calculateShortestPathsOptimized(node);

        // Calculate harmonic centrality
        let harmonicSum = 0;
        distances.forEach((distance) => {
          if (distance > 0) {
            // Exclude the node itself (distance = 0)
            harmonicSum += 1 / distance;
          }
        });

        centrality.set(node, harmonicSum);
        processedCount++;

        // Progress reporting every 5000 nodes
        if (processedCount % 5000 === 0 || processedCount === totalNodes) {
          const progress = ((processedCount / totalNodes) * 100).toFixed(1);
          const elapsed = (Date.now() - startTime) / 1000;
          logger.debug(
            `Harmonic centrality progress: ${progress}% (${processedCount}/${totalNodes} nodes, ${elapsed.toFixed(
              1,
            )}s elapsed)`,
          );
        }
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.success(`Completed harmonic centrality calculation in ${totalTime}s`);

    return centrality;
  }

  calculateShortestPaths(source) {
    const distances = new Map();
    const queue = new Queue();
    queue.enqueue(source);

    distances.set(source, 0);

    while (!queue.isEmpty()) {
      const current = queue.dequeue();
      const currentDistance = distances.get(current);

      this.graph.forEachNeighbor(current, (neighbor) => {
        if (!distances.has(neighbor)) {
          distances.set(neighbor, currentDistance + 1);
          queue.enqueue(neighbor);
        }
      });
    }

    return distances;
  }

  calculateShortestPathsOptimized(source) {
    // Optimized BFS with early termination and memory efficiency
    const distances = this.getPooledMap();
    const queue = this.getPooledQueue();
    const visited = this.getPooledSet();

    queue.enqueue(source);
    distances.set(source, 0);
    visited.add(source);

    // Limit maximum distance to prevent excessive computation for very large graphs
    const maxDistance = Math.min(20, Math.ceil(Math.log2(this.graph.order)));

    while (!queue.isEmpty()) {
      const current = queue.dequeue();
      const currentDistance = distances.get(current);

      // Early termination for distant nodes
      if (currentDistance >= maxDistance) {
        continue;
      }

      this.graph.forEachNeighbor(current, (neighbor) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          const newDistance = currentDistance + 1;
          distances.set(neighbor, newDistance);

          // Only continue BFS if we haven't reached max distance
          if (newDistance < maxDistance) {
            queue.enqueue(neighbor);
          }
        }
      });
    }

    // Create a copy before returning pooled structures to pool
    const result = new Map(distances);

    // Return pooled structures
    this.returnToPool('maps', distances);
    this.returnToPool('queues', queue);
    this.returnToPool('sets', visited);

    return result;
  }

  detectCommunities() {
    logger.debug('Detecting communities using Louvain-inspired method for large graphs');
    const startTime = Date.now();

    // For very large graphs, use a more scalable approach
    const totalNodes = this.graph.order;

    if (totalNodes > 10000) {
      // Use hub-based community detection for scalability
      return this.detectCommunitiesScalable();
    } else {
      // Use traditional connected components approach for smaller graphs
      return this.detectCommunitiesTraditional();
    }
  }

  detectCommunitiesScalable() {
    logger.debug('Using scalable hub-based community detection');
    const startTime = Date.now();

    const communities = [];
    const visited = new Set();
    const degreeThreshold = Math.max(5, Math.ceil(Math.log2(this.graph.order)));

    // First, identify high-degree nodes as potential community centers
    const hubs = [];
    this.graph.forEachNode((node) => {
      if (this.graph.degree(node) >= degreeThreshold) {
        hubs.push({
          node,
          degree: this.graph.degree(node),
          type: this.graph.getNodeAttribute(node, 'type'),
        });
      }
    });

    hubs.sort((a, b) => b.degree - a.degree);
    logger.debug(`Identified ${hubs.length} hub nodes for community seeding`);

    // Build communities around hubs using BFS with early termination
    for (const hub of hubs.slice(0, Math.min(100, hubs.length))) {
      // Limit number of communities
      if (visited.has(hub.node)) continue;

      const community = [];
      const queue = new Queue();
      const localVisited = new Set();

      queue.enqueue(hub.node);
      localVisited.add(hub.node);

      // BFS with size limit for memory management
      while (!queue.isEmpty() && community.length < 1000) {
        const current = queue.dequeue();
        if (visited.has(current)) continue;

        visited.add(current);
        community.push(current);

        // Add neighbors with probability based on degree similarity
        this.graph.forEachNeighbor(current, (neighbor) => {
          if (!localVisited.has(neighbor) && !visited.has(neighbor)) {
            const neighborDegree = this.graph.degree(neighbor);
            const currentDegree = this.graph.degree(current);

            // Higher probability for nodes with similar connectivity patterns
            const similarity =
              Math.min(neighborDegree, currentDegree) / Math.max(neighborDegree, currentDegree, 1);

            if (similarity > 0.3 || community.length < 50) {
              // Always include early neighbors
              queue.enqueue(neighbor);
              localVisited.add(neighbor);
            }
          }
        });
      }

      if (community.length > 2) {
        communities.push(community);
      }
    }

    // Process remaining unvisited nodes in smaller communities
    let remainingCount = 0;
    this.graph.forEachNode((node) => {
      if (!visited.has(node)) {
        remainingCount++;
      }
    });

    if (remainingCount > 0) {
      logger.debug(`Processing ${remainingCount} remaining nodes in smaller communities`);
      const remaining = this.detectCommunitiesTraditionalForUnvisited(visited);
      communities.push(...remaining);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.success(
      `Detected ${communities.length} communities in ${totalTime}s using scalable method`,
    );

    return communities;
  }

  detectCommunitiesTraditional() {
    logger.debug('Using traditional connected components for community detection');

    const communities = [];
    const visited = new Set();

    this.graph.forEachNode((node) => {
      if (!visited.has(node)) {
        const community = [];
        const stack = [node];

        while (stack.length > 0) {
          const current = stack.pop();
          if (!visited.has(current)) {
            visited.add(current);
            community.push(current);

            this.graph.forEachNeighbor(current, (neighbor) => {
              if (!visited.has(neighbor)) {
                stack.push(neighbor);
              }
            });
          }
        }

        if (community.length > 1) {
          communities.push(community);
        }
      }
    });

    return communities;
  }

  detectCommunitiesTraditionalForUnvisited(alreadyVisited) {
    const communities = [];
    const visited = new Set(alreadyVisited);

    this.graph.forEachNode((node) => {
      if (!visited.has(node)) {
        const community = [];
        const stack = [node];

        while (stack.length > 0) {
          const current = stack.pop();
          if (!visited.has(current)) {
            visited.add(current);
            community.push(current);

            this.graph.forEachNeighbor(current, (neighbor) => {
              if (!visited.has(neighbor)) {
                stack.push(neighbor);
              }
            });
          }
        }

        if (community.length > 1) {
          communities.push(community);
        }
      }
    });

    return communities;
  }

  analyzeCommunityStats(communities) {
    return communities.map((community, index) => {
      const nodeTypes = {};
      const internalEdges = [];

      community.forEach((node) => {
        const type = this.graph.getNodeAttribute(node, 'type');
        nodeTypes[type] = (nodeTypes[type] || 0) + 1;

        this.graph.forEachNeighbor(node, (neighbor) => {
          if (community.includes(neighbor)) {
            internalEdges.push([node, neighbor]);
          }
        });
      });

      return {
        id: index,
        size: community.length,
        nodeTypes,
        internalConnections: internalEdges.length / 2, // Undirected
        density: internalEdges.length / 2 / ((community.length * (community.length - 1)) / 2),
      };
    });
  }

  calculateModularity(communities) {
    // Simplified modularity calculation
    let modularity = 0;
    const m = this.graph.size;

    for (const community of communities) {
      let internalEdges = 0;
      let totalDegree = 0;

      community.forEach((node) => {
        totalDegree += this.graph.degree(node);
        this.graph.forEachNeighbor(node, (neighbor) => {
          if (community.includes(neighbor)) {
            internalEdges++;
          }
        });
      });

      internalEdges /= 2; // Undirected
      modularity += internalEdges / m - Math.pow(totalDegree / (2 * m), 2);
    }

    return modularity;
  }

  findConnectedComponents() {
    const components = [];
    const visited = new Set();

    this.graph.forEachNode((node) => {
      if (!visited.has(node)) {
        const component = [];
        const stack = [node];

        while (stack.length > 0) {
          const current = stack.pop();
          if (!visited.has(current)) {
            visited.add(current);
            component.push(current);

            this.graph.forEachNeighbor(current, (neighbor) => {
              if (!visited.has(neighbor)) {
                stack.push(neighbor);
              }
            });
          }
        }

        components.push(component);
      }
    });

    return components;
  }

  findBridges() {
    logger.debug('Using sampling-based bridge detection for large graphs');
    const startTime = Date.now();

    // For very large graphs, use a sampling approach to avoid stack overflow
    const totalNodes = this.graph.order;
    const bridges = [];

    if (totalNodes > 20000) {
      // Sample high-degree nodes and check their edges
      const sampleSize = Math.min(500, Math.ceil(Math.sqrt(totalNodes)));
      const sampleNodes = this.selectLandmarkNodes(this.graph.nodes(), sampleSize);

      logger.debug(`Sampling ${sampleNodes.length} high-degree nodes for bridge detection`);

      // For each sampled node, check connectivity when its edges are removed
      let checkedEdges = 0;
      for (const node of sampleNodes) {
        const neighbors = this.graph.neighbors(node);

        for (const neighbor of neighbors.slice(0, 5)) {
          // Limit edges per node
          if (node < neighbor) {
            // Avoid checking the same edge twice
            checkedEdges++;

            // Quick connectivity test
            const nodeConnections = this.graph.degree(node);
            const neighborConnections = this.graph.degree(neighbor);

            // Heuristic: edges connecting high-degree nodes are less likely to be bridges
            if (nodeConnections > 10 && neighborConnections > 10) {
              continue; // Skip - likely not a bridge
            }

            // Sample-based connectivity check
            if (this.isPotentialBridge(node, neighbor)) {
              bridges.push({ source: node, target: neighbor });
            }
          }
        }

        if (checkedEdges > 1000) break; // Limit total checks
      }
    } else {
      // For smaller graphs, do a simple edge-based check
      const edges = this.graph.edges().slice(0, 1000); // Sample edges

      for (const edge of edges) {
        const [source, target] = this.graph.extremities(edge);
        if (this.isPotentialBridge(source, target)) {
          bridges.push({ source, target });
        }
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.debug(
      `Found ${bridges.length} potential bridges in ${totalTime}s using sampling approach`,
    );

    return bridges;
  }

  isPotentialBridge(node1, node2) {
    // Heuristic check: if both nodes have many connections, edge is likely not a bridge
    const node1Degree = this.graph.degree(node1);
    const node2Degree = this.graph.degree(node2);

    // High-degree nodes are less likely to be connected by bridges
    if (node1Degree > 20 && node2Degree > 20) {
      return false;
    }

    // If either node has very few connections, the edge might be important
    if (node1Degree < 3 || node2Degree < 3) {
      return true;
    }

    // Check if nodes have many common neighbors (less likely to be bridge)
    const neighbors1 = new Set(this.graph.neighbors(node1));
    const neighbors2 = new Set(this.graph.neighbors(node2));

    let commonNeighbors = 0;
    for (const neighbor of neighbors1) {
      if (neighbors2.has(neighbor)) {
        commonNeighbors++;
        if (commonNeighbors > 2) return false; // Many common neighbors - not a bridge
      }
    }

    return true; // Could be a bridge
  }

  findArticulationPoints() {
    logger.debug('Using heuristic-based articulation point detection for large graphs');
    const startTime = Date.now();

    const totalNodes = this.graph.order;
    const articulationPoints = [];

    if (totalNodes > 20000) {
      // Use degree-based heuristics for large graphs
      logger.debug('Using degree-based heuristic for articulation point detection');

      // Sample high-degree nodes as potential articulation points
      const sampleSize = Math.min(1000, Math.ceil(Math.sqrt(totalNodes)));
      const candidateNodes = this.selectLandmarkNodes(this.graph.nodes(), sampleSize);

      for (const node of candidateNodes) {
        const degree = this.graph.degree(node);

        // Heuristic: nodes with moderate-to-high degree that connect different regions
        if (degree >= 3 && degree <= 50) {
          // Check if node connects diverse neighborhoods
          if (this.isPotentialArticulationPoint(node)) {
            articulationPoints.push(node);
          }
        }
      }
    } else {
      // For smaller graphs, use a simplified approach
      const nodes = this.graph.nodes().slice(0, 5000); // Limit processing

      for (const node of nodes) {
        const degree = this.graph.degree(node);

        // Quick heuristic check
        if (degree >= 2 && degree <= 20) {
          if (this.isPotentialArticulationPoint(node)) {
            articulationPoints.push(node);
          }
        }

        if (articulationPoints.length > 100) break; // Limit results
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.debug(
      `Found ${articulationPoints.length} potential articulation points in ${totalTime}s using heuristic approach`,
    );

    return articulationPoints;
  }

  isPotentialArticulationPoint(node) {
    const neighbors = this.graph.neighbors(node);

    // If node has few neighbors, it's likely not critical
    if (neighbors.length < 2) return false;

    // If node has too many neighbors, it's likely not an articulation point in dense graphs
    if (neighbors.length > 50) return false;

    // Check neighbor connectivity diversity
    const neighborTypes = new Set();
    const neighborDegrees = [];

    for (const neighbor of neighbors) {
      const neighborType = this.graph.getNodeAttribute(neighbor, 'type');
      neighborTypes.add(neighborType);
      neighborDegrees.push(this.graph.degree(neighbor));
    }

    // Heuristic: articulation points often connect different types of nodes
    if (neighborTypes.size > 1) return true;

    // Heuristic: connects nodes with very different degrees
    const maxDegree = Math.max(...neighborDegrees);
    const minDegree = Math.min(...neighborDegrees);

    if (maxDegree > minDegree * 3) return true;

    // Check if neighbors have few common connections (indicating node bridges different regions)
    let totalCommonConnections = 0;
    for (let i = 0; i < neighbors.length - 1; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        const neighbors1 = new Set(this.graph.neighbors(neighbors[i]));
        const neighbors2 = new Set(this.graph.neighbors(neighbors[j]));

        let commonCount = 0;
        for (const n of neighbors1) {
          if (neighbors2.has(n)) commonCount++;
        }
        totalCommonConnections += commonCount;
      }
    }

    const avgCommonConnections =
      totalCommonConnections / Math.max(1, (neighbors.length * (neighbors.length - 1)) / 2);

    // Low average common connections suggests node is bridging different regions
    return avgCommonConnections < 2;
  }

  isPathExists(source, target) {
    if (!this.graph.hasNode(source) || !this.graph.hasNode(target)) return false;
    if (source === target) return true;

    const visited = new Set();
    const queue = new Queue();
    queue.enqueue(source);

    while (!queue.isEmpty()) {
      const current = queue.dequeue();
      if (current === target) return true;

      if (!visited.has(current)) {
        visited.add(current);
        this.graph.forEachNeighbor(current, (neighbor) => {
          if (!visited.has(neighbor)) {
            queue.enqueue(neighbor);
          }
        });
      }
    }

    return false;
  }

  getComponentNodeTypes(component) {
    const types = {};
    component.forEach((node) => {
      const type = this.graph.getNodeAttribute(node, 'type');
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }

  calculateComponentDensity(component) {
    if (component.length < 2) return 0;

    let edgeCount = 0;
    const nodeSet = new Set(component);

    component.forEach((node) => {
      this.graph.forEachNeighbor(node, (neighbor) => {
        if (nodeSet.has(neighbor) && node < neighbor) {
          // Count each edge once
          edgeCount++;
        }
      });
    });

    const maxPossibleEdges = (component.length * (component.length - 1)) / 2;
    return maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;
  }

  calculateConnectivityScore(components, bridgeCount, articulationPointCount) {
    const totalNodes = this.graph.order;
    const largestComponent = Math.max(...components.map((c) => c.length));
    const giantComponentRatio = largestComponent / totalNodes;

    // Factors contributing to connectivity score (0-1 scale)
    const giantComponentScore = giantComponentRatio; // Higher is better
    const componentScore = Math.max(0, 1 - (components.length - 1) / Math.sqrt(totalNodes)); // Fewer components is better
    const bridgeScore = Math.max(0, 1 - bridgeCount / Math.sqrt(totalNodes)); // Fewer bridges is better
    const articulationScore = Math.max(0, 1 - articulationPointCount / Math.sqrt(totalNodes)); // Fewer articulation points is better

    // Weighted average
    const score =
      giantComponentScore * 0.4 +
      componentScore * 0.3 +
      bridgeScore * 0.15 +
      articulationScore * 0.15;

    return {
      overall: parseFloat(score.toFixed(3)),
      factors: {
        giantComponent: parseFloat(giantComponentScore.toFixed(3)),
        componentCount: parseFloat(componentScore.toFixed(3)),
        bridges: parseFloat(bridgeScore.toFixed(3)),
        articulationPoints: parseFloat(articulationScore.toFixed(3)),
      },
    };
  }

  calculateConceptCoverage() {
    let documentsWithConcepts = 0;
    let totalDocuments = 0;

    this.graph.forEachNode((node, attributes) => {
      if (attributes.type === 'document') {
        totalDocuments++;

        // Check if document has concept connections
        let hasConcepts = false;
        this.graph.forEachNeighbor(node, (neighbor) => {
          if (this.graph.getNodeAttribute(neighbor, 'type') === 'concept') {
            hasConcepts = true;
          }
        });

        if (hasConcepts) documentsWithConcepts++;
      }
    });

    return totalDocuments > 0 ? documentsWithConcepts / totalDocuments : 0;
  }

  getTopNodes(centrality, limit) {
    return Array.from(centrality.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  calculateCentralityStatistics(centrality) {
    const values = Array.from(centrality.values());
    const sorted = [...values].sort((a, b) => a - b);

    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: parseFloat(mean.toFixed(6)),
      median: this.calculateMedian(values),
      stdDev: parseFloat(stdDev.toFixed(6)),
      q1: sorted[q1Index],
      q3: sorted[q3Index],
      iqr: sorted[q3Index] - sorted[q1Index],
      nonZeroCount: values.filter((v) => v > 0).length,
      zeroCount: values.filter((v) => v === 0).length,
    };
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  filterDocumentsByExclusionRules(documents, exclusionPatterns) {
    if (!exclusionPatterns || exclusionPatterns.length === 0) {
      return documents;
    }

    return documents.filter((doc) => {
      const docPath = doc.path || doc.label || doc.node || '';

      // Check if document matches any exclusion pattern
      for (const pattern of exclusionPatterns) {
        // Convert glob pattern to regex (simplified)
        const regexPattern = pattern
          .replace(/\*\*/g, '.*') // ** matches any path
          .replace(/\*/g, '[^/]*') // * matches any filename chars except path separator
          .replace(/\./g, '\\.') // Escape dots
          .replace(/\?/g, '.');

        try {
          const regex = new RegExp(regexPattern, 'i');
          if (regex.test(docPath)) {
            return false; // Exclude this document
          }
        } catch (error) {
          logger.debug(`Invalid exclusion pattern: ${pattern}`);
        }
      }

      return true; // Include this document
    });
  }

  matchesExclusionPattern(filePath, patterns) {
    if (!patterns || patterns.length === 0) return false;

    for (const pattern of patterns) {
      // Convert glob pattern to regex (simplified)
      const regexPattern = pattern
        .replace(/\*\*/g, '.*') // ** matches any path
        .replace(/\*/g, '[^/]*') // * matches any filename chars except path separator
        .replace(/\./g, '\\.') // Escape dots
        .replace(/\?/g, '.');

      try {
        const regex = new RegExp(regexPattern, 'i');
        if (regex.test(filePath)) {
          return true;
        }
      } catch (error) {
        logger.debug(`Invalid exclusion pattern: ${pattern}`);
      }
    }

    return false;
  }

  // Enhanced Navigation Analysis Helper Methods

  fallbackNavigationAnalysis() {
    // Fallback method when enhanced sidebar analysis isn't available
    return {
      available: true,
      fallback: true,
      message: 'Using basic navigation analysis - enhanced sidebar analysis not available',
      metrics: {
        totalSidebars: this.sidebarData.metrics?.totalSidebars || 0,
        totalEntries: this.sidebarData.metrics?.totalEntries || 0,
        maxDepth: this.sidebarData.metrics?.maxDepth || 0,
        totalCategories: this.sidebarData.metrics?.totalCategories || 0,
        totalDocuments: this.sidebarData.metrics?.totalDocuments || 0,
        externalLinks: this.sidebarData.metrics?.totalLinks || 0,
        orphanedEntries: this.sidebarData.metrics?.orphanedEntries || 0,
      },
    };
  }

  analyzeGraphNavigationCoverage(documentCoverage) {
    // Cross-reference sidebar document coverage with graph nodes
    const graphDocuments = new Set();
    const documentsInBothGraphAndNavigation = new Set();
    const documentsInGraphOnly = new Set();

    this.graph.forEachNode((node, attributes) => {
      if (attributes.type === 'document') {
        const docId = this.extractDocumentIdFromPath(attributes.path || attributes.label);
        graphDocuments.add(docId);

        if (documentCoverage.documentOccurrences && documentCoverage.documentOccurrences[docId]) {
          documentsInBothGraphAndNavigation.add(docId);
        } else {
          documentsInGraphOnly.add(docId);
        }
      }
    });

    return {
      totalDocumentsInGraph: graphDocuments.size,
      documentsInBothGraphAndNavigation: documentsInBothGraphAndNavigation.size,
      documentsInGraphOnly: documentsInGraphOnly.size,
      graphNavigationAlignment:
        graphDocuments.size > 0
          ? ((documentsInBothGraphAndNavigation.size / graphDocuments.size) * 100).toFixed(1)
          : '0',
    };
  }

  extractDocumentIdFromPath(path) {
    // Extract document ID from file path for comparison with sidebar references
    if (!path) return '';

    // Remove docs/ prefix and file extension
    let docId = path.replace(/^docs\//, '').replace(/\.(md|mdx)$/, '');
    return docId;
  }

  analyzeNavigationConnectivity(rootAnalysis) {
    // Analyze how navigation structure relates to graph connectivity
    const connectivity = {
      navigationPathsWithGraphConnections: 0,
      isolatedNavigationPaths: 0,
      averageGraphConnectivity: 0,
      navigationHubsInGraph: [],
    };

    if (!rootAnalysis.navigationPaths || !rootAnalysis.navigationPaths.totalPaths) {
      return connectivity;
    }

    // For each navigation path, check graph connectivity
    const navigationNodes = new Set();
    this.graph.forEachNode((node, attributes) => {
      if (attributes.type === 'document') {
        navigationNodes.add(node);
      }
    });

    // Calculate average connectivity for documents in navigation
    let totalConnections = 0;
    let documentCount = 0;

    navigationNodes.forEach((node) => {
      const degree = this.graph.degree(node);
      totalConnections += degree;
      documentCount++;

      // Identify highly connected documents (hubs)
      if (degree > 10) {
        const attributes = this.graph.getNodeAttributes(node);
        connectivity.navigationHubsInGraph.push({
          node,
          label: attributes.label,
          connections: degree,
          type: attributes.type,
        });
      }
    });

    if (documentCount > 0) {
      connectivity.averageGraphConnectivity = (totalConnections / documentCount).toFixed(2);
    }

    return connectivity;
  }

  enhanceEntryPointsWithCentrality(entryPoints) {
    // Enhance entry point analysis with centrality metrics from graph
    return entryPoints.map((entryPoint) => {
      // Find corresponding graph node
      const graphNode = this.findGraphNodeByDocumentId(entryPoint.documentId);

      if (graphNode) {
        const attributes = this.graph.getNodeAttributes(graphNode);
        return {
          ...entryPoint,
          graphMetrics: {
            degree: this.graph.degree(graphNode),
            betweenness: attributes.betweennessCentrality || 0,
            pagerank: attributes.pageRank || 0,
            isGraphHub: this.graph.degree(graphNode) > 10,
          },
        };
      }

      return entryPoint;
    });
  }

  findGraphNodeByDocumentId(documentId) {
    // Find graph node corresponding to a document ID
    let foundNode = null;

    this.graph.forEachNode((node, attributes) => {
      if (attributes.type === 'document') {
        const nodeDocId = this.extractDocumentIdFromPath(attributes.path || attributes.label);
        if (nodeDocId === documentId) {
          foundNode = node;
          return false; // Break out of forEach
        }
      }
    });

    return foundNode;
  }

  analyzeOrphanedDocuments(rootAnalysis) {
    // Comprehensive analysis of orphaned documents
    const orphanedAnalysis = {
      documentsNotInNavigation: [],
      documentsNotInGraph: [],
      trueOrphans: [], // Documents neither in navigation nor connected in graph
      potentialEntryPoints: [], // Orphaned documents that could be entry points
    };

    // Get all document IDs from navigation
    const documentsInNavigation = new Set();
    if (rootAnalysis.documentCoverage && rootAnalysis.documentCoverage.documentOccurrences) {
      Object.keys(rootAnalysis.documentCoverage.documentOccurrences).forEach((docId) => {
        documentsInNavigation.add(docId);
      });
    }

    // Analyze graph documents
    this.graph.forEachNode((node, attributes) => {
      if (attributes.type === 'document') {
        const docId = this.extractDocumentIdFromPath(attributes.path || attributes.label);
        const graphConnections = this.graph.degree(node);

        // Use navigation.isOrphaned as primary source of truth
        const isOrphaned = attributes.navigation?.isOrphaned === true;

        if (isOrphaned) {
          const orphanInfo = {
            documentId: docId,
            label: attributes.label,
            graphConnections,
            wordCount: attributes.wordCount || 0,
            directory: attributes.directory || '',
            lastModified: attributes.lastModified || null,
            navigationPaths: attributes.navigation?.navigationPaths || [],
          };

          orphanedAnalysis.documentsNotInNavigation.push(orphanInfo);

          if (graphConnections === 0) {
            orphanedAnalysis.trueOrphans.push(orphanInfo);
          } else if (graphConnections > 3 && attributes.wordCount > 500) {
            orphanedAnalysis.potentialEntryPoints.push(orphanInfo);
          }
        }
      }
    });

    // Sort by potential value (word count and connections)
    orphanedAnalysis.potentialEntryPoints.sort(
      (a, b) => b.wordCount + b.graphConnections * 100 - (a.wordCount + a.graphConnections * 100),
    );

    return {
      ...orphanedAnalysis,
      summary: {
        notInNavigation: orphanedAnalysis.documentsNotInNavigation.length,
        trueOrphans: orphanedAnalysis.trueOrphans.length,
        potentialEntryPoints: orphanedAnalysis.potentialEntryPoints.length,
        recommendations: this.generateOrphanRecommendations(orphanedAnalysis),
      },
    };
  }

  generateOrphanRecommendations(orphanedAnalysis) {
    const recommendations = [];

    if (orphanedAnalysis.potentialEntryPoints.length > 0) {
      recommendations.push({
        type: 'add_to_navigation',
        priority: 'high',
        description: `Consider adding ${orphanedAnalysis.potentialEntryPoints.length} well-connected documents to navigation`,
        documents: orphanedAnalysis.potentialEntryPoints.slice(0, 5).map((doc) => doc.label),
      });
    }

    if (orphanedAnalysis.trueOrphans.length > 0) {
      recommendations.push({
        type: 'review_content',
        priority: 'medium',
        description: `Review ${orphanedAnalysis.trueOrphans.length} documents that are neither in navigation nor linked`,
        action: 'Consider archiving outdated content or adding relevant links',
      });
    }

    return recommendations;
  }

  analyzeUserJourneys(rootAnalysis) {
    // Analyze user journey patterns based on navigation structure and graph connectivity
    const journeys = {
      primaryPaths: [],
      alternativePaths: [],
      deadEnds: [],
      circularPaths: [],
      recommendations: [],
    };

    if (!rootAnalysis.navigationPaths) {
      return journeys;
    }

    // Analyze navigation paths for user journey patterns
    const pathAnalysis = rootAnalysis.navigationPaths;

    if (pathAnalysis.totalPaths > 0) {
      // Identify primary paths (short, direct routes to important content)
      const shortPaths = Object.entries(pathAnalysis.pathDistribution)
        .filter(([depth, count]) => parseInt(depth) <= 3)
        .reduce((sum, [depth, count]) => sum + count, 0);

      journeys.primaryPaths = {
        count: shortPaths,
        percentage: ((shortPaths / pathAnalysis.totalPaths) * 100).toFixed(1),
        averageDepth: pathAnalysis.averagePathLength,
      };

      // Identify potential user journey issues
      if (pathAnalysis.averagePathLength > 4) {
        journeys.recommendations.push({
          type: 'simplify_navigation',
          priority: 'medium',
          description: `Average navigation depth is ${pathAnalysis.averagePathLength} - consider flattening hierarchy`,
        });
      }

      if (pathAnalysis.deepestPath && pathAnalysis.deepestPath.depth > 6) {
        journeys.recommendations.push({
          type: 'reduce_max_depth',
          priority: 'high',
          description: `Deepest navigation path has ${pathAnalysis.deepestPath.depth} levels - may hurt UX`,
        });
      }
    }

    return journeys;
  }

  assessNavigationQuality(rootAnalysis) {
    // Comprehensive navigation quality assessment
    const quality = {
      overallScore: 0,
      categories: {},
      strengths: [],
      weaknesses: [],
      criticalIssues: [],
    };

    // Coverage quality
    const coverage = rootAnalysis.documentCoverage;
    const coveragePercent =
      coverage.totalDocumentsInNavigation > 0
        ? (coverage.totalDocumentsInNavigation /
            (coverage.totalDocumentsInNavigation + coverage.duplicateCount)) *
          100
        : 0;

    quality.categories.coverage = {
      score: Math.min(100, coveragePercent + (coveragePercent > 80 ? 10 : 0)),
      description: `${coveragePercent.toFixed(1)}% document coverage in navigation`,
    };

    // Balance quality
    const balance = rootAnalysis.hierarchyBalance;
    let balanceScore = 0;

    if (balance.overallBalance === 'well-balanced') {
      balanceScore = 90;
    } else if (balance.overallBalance === 'mostly-balanced') {
      balanceScore = 70;
    } else {
      balanceScore = 40;
    }

    quality.categories.balance = {
      score: balanceScore,
      description: `Navigation hierarchy is ${balance.overallBalance}`,
    };

    // Path efficiency quality
    const paths = rootAnalysis.navigationPaths;
    const pathScore = paths.averagePathLength
      ? Math.max(0, 100 - (parseFloat(paths.averagePathLength) - 2) * 20)
      : 50;

    quality.categories.pathEfficiency = {
      score: pathScore,
      description: `Average path length: ${paths.averagePathLength || 'unknown'}`,
    };

    // Entry points quality
    const entryPoints = rootAnalysis.entryPoints;
    const entryPointScore = Math.min(100, (entryPoints.length / rootAnalysis.totalSidebars) * 30);

    quality.categories.entryPoints = {
      score: entryPointScore,
      description: `${entryPoints.length} entry points across ${rootAnalysis.totalSidebars} sidebars`,
    };

    // Calculate overall score
    const scores = Object.values(quality.categories).map((cat) => cat.score);
    quality.overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Identify strengths and weaknesses
    if (quality.categories.coverage.score > 80) {
      quality.strengths.push('Excellent navigation coverage');
    }
    if (quality.categories.balance.score > 80) {
      quality.strengths.push('Well-balanced navigation hierarchy');
    }
    if (quality.categories.pathEfficiency.score > 80) {
      quality.strengths.push('Efficient navigation paths');
    }

    if (quality.categories.coverage.score < 60) {
      quality.weaknesses.push('Poor navigation coverage - many documents not included');
    }
    if (quality.categories.balance.score < 60) {
      quality.weaknesses.push('Imbalanced navigation structure');
    }
    if (quality.categories.pathEfficiency.score < 60) {
      quality.weaknesses.push('Navigation paths may be too deep');
    }

    return quality;
  }

  buildCoverageSummary(rootAnalysis) {
    // Build a coverage summary object that matches the expected reporting interface
    const docCoverage = rootAnalysis.documentCoverage || {};
    const totalDocsInNav = docCoverage.totalDocumentsInNavigation || 0;

    // Get total number of documents from the graph to calculate orphaned documents
    const totalDocsInGraph = this.graph.nodes().filter((nodeId) => {
      const attributes = this.graph.getNodeAttributes(nodeId);
      return attributes.type === 'document';
    }).length;

    const orphanedCount = Math.max(0, totalDocsInGraph - totalDocsInNav);
    const coveragePercent =
      totalDocsInGraph > 0 ? ((totalDocsInNav / totalDocsInGraph) * 100).toFixed(1) : '0.0';

    return {
      coveragePercentage: `${coveragePercent}%`,
      inNavigation: totalDocsInNav,
      notInNavigation: orphanedCount,
      duplicateEntries: docCoverage.duplicateCount || 0,
      totalDocuments: totalDocsInGraph,
      // Additional metrics for enhanced reporting
      accuracy: {
        duplicateRate:
          totalDocsInNav > 0
            ? (((docCoverage.duplicateCount || 0) / totalDocsInNav) * 100).toFixed(1)
            : '0.0',
        orphanedRate:
          totalDocsInGraph > 0 ? ((orphanedCount / totalDocsInGraph) * 100).toFixed(1) : '0.0',
      },
    };
  }

  generateNavigationRecommendations(rootAnalysis) {
    // Generate specific, actionable recommendations for navigation improvements
    const recommendations = [];

    // Coverage recommendations
    const coverage = rootAnalysis.documentCoverage;
    if (coverage.duplicateCount > 0) {
      recommendations.push({
        type: 'reduce_duplication',
        priority: 'medium',
        description: `${coverage.duplicateCount} documents appear in multiple navigation sections`,
        action: 'Review and consolidate duplicate navigation entries to avoid user confusion',
      });
    }

    // Balance recommendations
    const balance = rootAnalysis.hierarchyBalance;
    if (balance.recommendations && balance.recommendations.length > 0) {
      recommendations.push(...balance.recommendations);
    }

    // Path efficiency recommendations
    const paths = rootAnalysis.navigationPaths;
    if (paths.deepestPath && paths.deepestPath.depth > 5) {
      recommendations.push({
        type: 'flatten_hierarchy',
        priority: 'high',
        description: `Navigation path "${paths.deepestPath.path?.join(' > ')}" is ${
          paths.deepestPath.depth
        } levels deep`,
        action:
          'Consider moving deeply nested content to shallower levels or creating direct links',
      });
    }

    // Entry point recommendations
    const entryPoints = rootAnalysis.entryPoints;
    if (entryPoints.length < rootAnalysis.totalSidebars * 0.5) {
      recommendations.push({
        type: 'add_entry_points',
        priority: 'medium',
        description: 'Limited entry points may make content discovery difficult',
        action: 'Consider adding more landing pages or overview documents for major sections',
      });
    }

    // Cross-reference recommendations
    const crossRefs = rootAnalysis.crossReferences;
    if (crossRefs.htmlLinks && crossRefs.htmlLinks.length > 0) {
      recommendations.push({
        type: 'improve_cross_references',
        priority: 'low',
        description: `Found ${crossRefs.htmlLinks.length} cross-section links`,
        action:
          'Review cross-section links for consistency and consider adding more where appropriate',
      });
    }

    return recommendations.slice(0, 10); // Limit to top 10 most important
  }
}

export default GraphAnalyzer;
