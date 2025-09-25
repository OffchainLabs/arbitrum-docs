import logger from '../utils/logger.js';

export class GraphAnalyzer {
  constructor(graph, sidebarData = null, exclusionRules = null) {
    this.graph = graph;
    this.sidebarData = sidebarData;
    this.exclusionRules = exclusionRules || { frontmatterExcluded: [], internalLinkingExcluded: [] };
    this.analysis = {};
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
      recommendations: []
    };

    this.generateRecommendations();
    
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
    
    const density = this.graph.size / (this.graph.order * (this.graph.order - 1) / 2);
    const avgDegree = (this.graph.size * 2) / this.graph.order;
    
    return {
      totalNodes: this.graph.order,
      totalEdges: this.graph.size,
      nodesByType,
      edgesByType,
      density,
      avgDegree,
      isConnected: this.isConnected()
    };
  }

  analyzeCentrality() {
    logger.subsection('Centrality analysis');
    
    const degreeCentrality = new Map();
    const betweennessCentrality = this.calculateBetweennessCentrality();
    const closenessCentrality = this.calculateClosenessCentrality();
    
    // Calculate degree centrality
    this.graph.forEachNode((node) => {
      degreeCentrality.set(node, this.graph.degree(node));
    });
    
    // Get top nodes by each centrality measure
    const topDegree = this.getTopNodes(degreeCentrality, 10);
    const topBetweenness = this.getTopNodes(betweennessCentrality, 10);
    const topCloseness = this.getTopNodes(closenessCentrality, 10);
    
    return {
      degree: {
        values: Object.fromEntries(degreeCentrality),
        top: topDegree.map(([node, score]) => ({
          node,
          score,
          label: this.graph.getNodeAttribute(node, 'label'),
          type: this.graph.getNodeAttribute(node, 'type')
        }))
      },
      betweenness: {
        values: Object.fromEntries(betweennessCentrality),
        top: topBetweenness.map(([node, score]) => ({
          node,
          score,
          label: this.graph.getNodeAttribute(node, 'label'),
          type: this.graph.getNodeAttribute(node, 'type')
        }))
      },
      closeness: {
        values: Object.fromEntries(closenessCentrality),
        top: topCloseness.map(([node, score]) => ({
          node,
          score,
          label: this.graph.getNodeAttribute(node, 'label'),
          type: this.graph.getNodeAttribute(node, 'type')
        }))
      }
    };
  }

  analyzeCommunities() {
    logger.subsection('Community detection');
    
    // Simple community detection based on modularity
    const communities = this.detectCommunities();
    const communityStats = this.analyzeCommunityStats(communities);
    
    return {
      communities,
      stats: communityStats,
      modularity: this.calculateModularity(communities)
    };
  }

  analyzeConnectivity() {
    logger.subsection('Connectivity analysis');
    
    const components = this.findConnectedComponents();
    const bridges = this.findBridges();
    const articulationPoints = this.findArticulationPoints();
    
    return {
      components: components.map(component => ({
        size: component.length,
        nodes: component.slice(0, 5), // First 5 nodes for brevity
        nodeTypes: this.getComponentNodeTypes(component)
      })),
      bridges: bridges.length,
      articulationPoints: articulationPoints.length,
      largestComponent: Math.max(...components.map(c => c.length)),
      totalComponents: components.length
    };
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
          fileCount: attributes.fileCount
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
        median: this.calculateMedian(conceptFrequencies)
      }
    };
  }

  analyzeDocumentStructure() {
    logger.subsection('Document structure analysis');
    
    const documentNodes = [];
    const documentsByDirectory = {};
    const documentsByType = {};
    const orphanDocuments = [];
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
          outDegree
        };
        
        documentNodes.push(docInfo);
        
        // Categorize documents
        const dir = attributes.directory || 'root';
        documentsByDirectory[dir] = (documentsByDirectory[dir] || 0) + 1;
        
        const type = attributes.contentType || 'unknown';
        documentsByType[type] = (documentsByType[type] || 0) + 1;
        
        // Identify orphans (low degree) and hubs (high degree)
        if (degree <= 1) {
          orphanDocuments.push(docInfo);
        } else if (degree >= 10) {
          hubDocuments.push(docInfo);
        }
      }
    });
    
    return {
      total: documentNodes.length,
      byDirectory: documentsByDirectory,
      byType: documentsByType,
      orphans: orphanDocuments.slice(0, 10),
      hubs: hubDocuments.sort((a, b) => b.degree - a.degree).slice(0, 10),
      avgConnections: documentNodes.reduce((sum, doc) => sum + doc.degree, 0) / documentNodes.length
    };
  }

  analyzeNavigationStructure() {
    logger.subsection('Navigation structure analysis');
    
    if (!this.sidebarData) {
      return {
        available: false,
        reason: 'No sidebar data available'
      };
    }

    const navigationAnalysis = {
      available: true,
      sidebars: this.sidebarData.metrics?.totalSidebars || 0,
      totalEntries: this.sidebarData.metrics?.totalEntries || 0,
      maxDepth: this.sidebarData.metrics?.maxDepth || 0,
      categories: this.sidebarData.metrics?.totalCategories || 0,
      externalLinks: this.sidebarData.metrics?.totalLinks || 0,
      orphanedEntries: this.sidebarData.metrics?.orphanedEntries || 0
    };

    // Analyze navigation coverage
    const documentNodes = [];
    const documentsInNavigation = new Set();
    const documentsNotInNavigation = [];
    const entryPointDocuments = [];
    const deeplyNestedDocuments = [];

    this.graph.forEachNode((node, attributes) => {
      if (attributes.type === 'document') {
        documentNodes.push({
          node,
          label: attributes.label,
          navigationData: attributes.navigation || {}
        });

        const navData = attributes.navigation || {};
        
        if (navData.inNavigation) {
          documentsInNavigation.add(node);
          
          if (navData.isEntryPoint) {
            entryPointDocuments.push({
              node,
              label: attributes.label,
              paths: navData.navigationPaths || []
            });
          }
          
          if (navData.depth > 3) {
            deeplyNestedDocuments.push({
              node,
              label: attributes.label,
              depth: navData.depth,
              categories: navData.categories || []
            });
          }
        } else {
          documentsNotInNavigation.push({
            node,
            label: attributes.label,
            directory: attributes.directory,
            wordCount: attributes.wordCount
          });
        }
      }
    });

    navigationAnalysis.coverage = {
      total: documentNodes.length,
      inNavigation: documentsInNavigation.size,
      notInNavigation: documentsNotInNavigation.length,
      coveragePercentage: documentNodes.length > 0 ? 
        (documentsInNavigation.size / documentNodes.length * 100).toFixed(1) : '0'
    };

    navigationAnalysis.entryPoints = {
      count: entryPointDocuments.length,
      documents: entryPointDocuments.slice(0, 10)
    };

    navigationAnalysis.deepNesting = {
      count: deeplyNestedDocuments.length,
      documents: deeplyNestedDocuments.slice(0, 10)
    };

    navigationAnalysis.orphanedDocuments = {
      count: documentsNotInNavigation.length,
      documents: documentsNotInNavigation.slice(0, 15)
    };

    // Analyze navigation balance
    const categoryDistribution = this.analyzeNavigationBalance();
    navigationAnalysis.balance = categoryDistribution;

    // Analyze user journey paths
    const journeyAnalysis = this.analyzeUserJourneys();
    navigationAnalysis.userJourneys = journeyAnalysis;

    return navigationAnalysis;
  }

  analyzeNavigationBalance() {
    if (!this.sidebarData || !this.sidebarData.structure) {
      return {
        balanced: false,
        reason: 'No navigation structure data'
      };
    }

    const sidebarBalance = [];
    
    for (const [sidebarKey, structure] of this.sidebarData.structure.entries()) {
      const balance = {
        sidebar: sidebarKey,
        totalDocuments: structure.documents.size,
        totalCategories: structure.categories.size,
        maxDepth: structure.depth,
        documentsPerCategory: structure.categories.size > 0 ? 
          structure.documents.size / structure.categories.size : structure.documents.size
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
      issues: this.identifyNavigationBalanceIssues(sidebarBalance)
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
          collapsed: entry.collapsed
        });
      }
    }

    // Calculate balance metrics
    if (categoryStats.length === 0) {
      return { balanced: true, categories: [] };
    }

    const docCounts = categoryStats.map(cat => cat.documentCount);
    const avgDocs = docCounts.reduce((sum, count) => sum + count, 0) / docCounts.length;
    const variance = docCounts.reduce((sum, count) => sum + Math.pow(count - avgDocs, 2), 0) / docCounts.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = avgDocs > 0 ? standardDeviation / avgDocs : 0;

    return {
      balanced: coefficientOfVariation < 0.5, // Considered balanced if CV < 0.5
      averageDocuments: avgDocs.toFixed(1),
      standardDeviation: standardDeviation.toFixed(1),
      coefficientOfVariation: coefficientOfVariation.toFixed(2),
      categories: categoryStats,
      imbalancedCategories: categoryStats.filter(cat => 
        Math.abs(cat.documentCount - avgDocs) > standardDeviation
      )
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
      const docsPerCatScore = sidebar.documentsPerCategory <= optimalDocsPerCategory ? 
        1 : Math.max(0, 1 - (sidebar.documentsPerCategory - optimalDocsPerCategory) * 0.1);
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
          description: `Navigation depth of ${sidebar.maxDepth} may hurt user experience`
        });
      }

      // Too many documents per category
      if (sidebar.documentsPerCategory > 15) {
        issues.push({
          type: 'overcrowded_categories',
          sidebar: sidebar.sidebar,
          docsPerCategory: sidebar.documentsPerCategory.toFixed(1),
          severity: 'medium',
          description: 'Categories may be too crowded, consider subcategories'
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
            categories: imbalanced.slice(0, 3).map(cat => cat.name),
            severity: 'low',
            description: 'Some categories have significantly different numbers of documents'
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
        reason: 'No sidebar data available'
      };
    }

    const journeys = {
      available: true,
      entryPoints: [],
      commonPaths: [],
      deadEnds: [],
      crossReferences: []
    };

    // Identify entry points (documents at shallow depths)
    this.graph.forEachNode((node, attributes) => {
      if (attributes.type === 'document' && attributes.navigation) {
        const navData = attributes.navigation;
        
        if (navData.isEntryPoint) {
          journeys.entryPoints.push({
            document: attributes.label,
            paths: navData.navigationPaths,
            connections: this.graph.degree(node)
          });
        }

        // Identify potential dead ends (low connectivity)
        if (this.graph.degree(node) <= 2 && navData.inNavigation) {
          journeys.deadEnds.push({
            document: attributes.label,
            connections: this.graph.degree(node),
            navigationDepth: navData.depth,
            categories: navData.categories
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
      deadEnds: journeys.deadEnds.slice(0, 10)
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
        
        if (sourceNav && targetNav && 
            sourceNav.inNavigation && targetNav.inNavigation &&
            sourceNav.navigationPaths && targetNav.navigationPaths) {
          
          // Check if documents are in different navigation sections
          const sourceSections = new Set(sourceNav.navigationPaths.map(path => path[0]));
          const targetSections = new Set(targetNav.navigationPaths.map(path => path[0]));
          
          const intersection = new Set([...sourceSections].filter(x => targetSections.has(x)));
          
          if (intersection.size === 0) {
            // Cross-section reference
            crossRefs.push({
              sourceDocument: this.graph.getNodeAttribute(sourceNode, 'label'),
              targetDocument: this.graph.getNodeAttribute(targetNode, 'label'),
              sourceSections: Array.from(sourceSections),
              targetSections: Array.from(targetSections)
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
    
    logger.debug(`Using exclusion rules: ${this.exclusionRules.frontmatterExcluded.length} frontmatter patterns, ${this.exclusionRules.internalLinkingExcluded.length} internal linking patterns`);
    
    // Check for orphaned documents
    let orphanCount = 0;
    this.graph.forEachNode((node, attributes) => {
      if (attributes.type === 'document' && this.graph.degree(node) === 0) {
        orphanCount++;
      }
    });
    
    if (orphanCount > 0) {
      issues.push({
        type: 'orphaned_documents',
        count: orphanCount,
        severity: 'medium',
        description: `${orphanCount} documents have no connections to other content`
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
        description: `${brokenLinksCount} broken internal links detected`
      });
    }
    
    // Check concept coverage
    const conceptCoverage = this.calculateConceptCoverage();
    if (conceptCoverage < 0.7) {
      issues.push({
        type: 'low_concept_coverage',
        coverage: conceptCoverage,
        severity: 'low',
        description: 'Some documents may lack sufficient conceptual connections'
      });
    } else {
      strengths.push({
        type: 'good_concept_coverage',
        coverage: conceptCoverage,
        description: 'Documents have good conceptual coverage'
      });
    }
    
    // Check connectivity
    const connectivity = this.analysis.basic?.density || this.graph.size / (this.graph.order * (this.graph.order - 1) / 2);
    if (connectivity > 0.1) {
      strengths.push({
        type: 'well_connected',
        density: connectivity,
        description: 'Documentation is well-connected'
      });
    }

    // Navigation-specific quality checks
    if (this.analysis.navigation && this.analysis.navigation.available) {
      const navAnalysis = this.analysis.navigation;

      // Check navigation coverage (with exclusions)
      const coveragePercent = parseFloat(navAnalysis.coverage?.coveragePercentage || '0');
      const orphanedDocs = navAnalysis.orphanedDocuments?.documents || [];
      
      // Filter orphaned documents to exclude those that match exclusion patterns
      const filteredOrphanedDocs = this.filterDocumentsByExclusionRules(orphanedDocs, this.exclusionRules.frontmatterExcluded);
      const filteredOrphanedCount = filteredOrphanedDocs.length;
      
      if (coveragePercent < 80 && filteredOrphanedCount > 0) {
        issues.push({
          type: 'low_navigation_coverage',
          coverage: coveragePercent,
          orphanedCount: filteredOrphanedCount,
          excludedCount: orphanedDocs.length - filteredOrphanedCount,
          severity: coveragePercent < 60 ? 'high' : 'medium',
          description: `${coveragePercent}% of documents are included in navigation (${filteredOrphanedCount} relevant orphaned documents after applying exclusion rules)`
        });
      } else {
        strengths.push({
          type: 'good_navigation_coverage',
          coverage: coveragePercent,
          description: 'Most documents are included in navigation structure'
        });
      }

      // Check navigation balance
      if (navAnalysis.balance && !navAnalysis.balance.balanced) {
        issues.push({
          type: 'unbalanced_navigation',
          score: navAnalysis.balance.score,
          severity: 'medium',
          description: 'Navigation structure is not well balanced across categories'
        });
      }

      // Check for deep nesting
      if (navAnalysis.deepNesting && navAnalysis.deepNesting.count > 0) {
        issues.push({
          type: 'deep_navigation_nesting',
          count: navAnalysis.deepNesting.count,
          severity: navAnalysis.deepNesting.count > 10 ? 'high' : 'low',
          description: `${navAnalysis.deepNesting.count} documents are deeply nested in navigation`
        });
      }

      // Check for missing entry points
      if (navAnalysis.entryPoints && navAnalysis.entryPoints.count < 3) {
        issues.push({
          type: 'few_entry_points',
          count: navAnalysis.entryPoints.count,
          severity: 'medium',
          description: 'Documentation may benefit from more clear entry points'
        });
      }

      // Check for dead ends
      if (navAnalysis.userJourneys && navAnalysis.userJourneys.deadEnds && 
          navAnalysis.userJourneys.deadEnds.length > 5) {
        issues.push({
          type: 'navigation_dead_ends',
          count: navAnalysis.userJourneys.deadEnds.length,
          severity: 'low',
          description: 'Some documents have few connections and may be hard to discover'
        });
      }

      // Positive signals for cross-references
      if (navAnalysis.userJourneys && navAnalysis.userJourneys.crossReferences && 
          navAnalysis.userJourneys.crossReferences.length > 0) {
        strengths.push({
          type: 'cross_section_links',
          count: navAnalysis.userJourneys.crossReferences.length,
          description: 'Good cross-references between different documentation sections'
        });
      }
    }
    
    return {
      issues,
      strengths,
      overallScore: Math.max(0, 100 - (issues.length * 20) + (strengths.length * 10))
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
              category: 'structure',
              title: 'Connect orphaned documents',
              description: `Link ${issue.count} orphaned documents to related content through internal links or concept relationships.`,
              action: 'Review isolated documents and add relevant cross-references'
            });
            break;
            
          case 'broken_links':
            recommendations.push({
              priority: 'critical',
              category: 'maintenance',
              title: 'Fix broken internal links',
              description: `Repair ${issue.count} broken internal links to improve navigation and user experience.`,
              action: 'Audit and update broken link references'
            });
            break;
            
          case 'low_concept_coverage':
            recommendations.push({
              priority: 'medium',
              category: 'content',
              title: 'Improve conceptual connections',
              description: 'Some documents lack sufficient connections to key concepts.',
              action: 'Review content and add references to important domain concepts'
            });
            break;

          case 'low_navigation_coverage':
            recommendations.push({
              priority: 'high',
              category: 'navigation',
              title: 'Improve navigation coverage',
              description: `Only ${issue.coverage}% of documents are included in navigation. ${issue.orphanedCount} documents are orphaned.`,
              action: 'Review orphaned documents and add them to appropriate sidebar sections'
            });
            break;

          case 'unbalanced_navigation':
            recommendations.push({
              priority: 'medium',
              category: 'navigation',
              title: 'Balance navigation structure',
              description: 'Navigation categories are not well balanced in terms of content distribution.',
              action: 'Reorganize categories to achieve better balance, consider splitting large sections'
            });
            break;

          case 'deep_navigation_nesting':
            recommendations.push({
              priority: 'medium',
              category: 'navigation',
              title: 'Reduce navigation depth',
              description: `${issue.count} documents are deeply nested, which may hurt discoverability.`,
              action: 'Restructure deeply nested content or promote important documents to higher levels'
            });
            break;

          case 'few_entry_points':
            recommendations.push({
              priority: 'medium',
              category: 'navigation',
              title: 'Create more entry points',
              description: 'Documentation lacks clear entry points for new users.',
              action: 'Add overview pages, quickstart guides, or promote key documents to top-level navigation'
            });
            break;

          case 'navigation_dead_ends':
            recommendations.push({
              priority: 'low',
              category: 'navigation',
              title: 'Improve document connectivity',
              description: `${issue.count} documents have few connections and may be hard to discover.`,
              action: 'Add cross-references and related links to improve document discoverability'
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
        description: 'Several documents have very high connectivity which may indicate they need restructuring.',
        action: 'Review hub documents and consider breaking them into smaller, focused pieces'
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
        action: 'Review content clusters and align with navigation structure'
      });
    }
    
    this.analysis.recommendations = recommendations;
  }

  // Helper methods for calculations
  
  isConnected() {
    if (this.graph.order === 0) return true;
    
    const visited = new Set();
    const stack = [this.graph.nodes()[0]];
    
    while (stack.length > 0) {
      const node = stack.pop();
      if (!visited.has(node)) {
        visited.add(node);
        this.graph.forEachNeighbor(node, neighbor => {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        });
      }
    }
    
    return visited.size === this.graph.order;
  }

  calculateBetweennessCentrality() {
    const centrality = new Map();
    const nodes = this.graph.nodes();
    
    // Initialize centrality values
    nodes.forEach(node => centrality.set(node, 0));
    
    // Simple approximation of betweenness centrality
    for (const s of nodes.slice(0, Math.min(50, nodes.length))) { // Sample for performance
      const distances = new Map();
      const predecessors = new Map();
      const sigma = new Map();
      const delta = new Map();
      
      // Initialize
      nodes.forEach(node => {
        distances.set(node, -1);
        predecessors.set(node, []);
        sigma.set(node, 0);
        delta.set(node, 0);
      });
      
      distances.set(s, 0);
      sigma.set(s, 1);
      
      const queue = [s];
      const stack = [];
      
      // BFS
      while (queue.length > 0) {
        const v = queue.shift();
        stack.push(v);
        
        this.graph.forEachNeighbor(v, w => {
          if (distances.get(w) < 0) {
            queue.push(w);
            distances.set(w, distances.get(v) + 1);
          }
          
          if (distances.get(w) === distances.get(v) + 1) {
            sigma.set(w, sigma.get(w) + sigma.get(v));
            predecessors.get(w).push(v);
          }
        });
      }
      
      // Accumulation
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
    }
    
    return centrality;
  }

  calculateClosenessCentrality() {
    const centrality = new Map();
    const nodes = this.graph.nodes();
    
    for (const node of nodes.slice(0, Math.min(100, nodes.length))) { // Sample for performance
      const distances = this.calculateShortestPaths(node);
      const totalDistance = Array.from(distances.values()).reduce((sum, dist) => sum + dist, 0);
      centrality.set(node, totalDistance > 0 ? (nodes.length - 1) / totalDistance : 0);
    }
    
    return centrality;
  }

  calculateShortestPaths(source) {
    const distances = new Map();
    const queue = [source];
    
    distances.set(source, 0);
    
    while (queue.length > 0) {
      const current = queue.shift();
      const currentDistance = distances.get(current);
      
      this.graph.forEachNeighbor(current, neighbor => {
        if (!distances.has(neighbor)) {
          distances.set(neighbor, currentDistance + 1);
          queue.push(neighbor);
        }
      });
    }
    
    return distances;
  }

  detectCommunities() {
    // Simple community detection using connected components and modularity
    const communities = [];
    const visited = new Set();
    
    this.graph.forEachNode(node => {
      if (!visited.has(node)) {
        const community = [];
        const stack = [node];
        
        while (stack.length > 0) {
          const current = stack.pop();
          if (!visited.has(current)) {
            visited.add(current);
            community.push(current);
            
            this.graph.forEachNeighbor(current, neighbor => {
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
      
      community.forEach(node => {
        const type = this.graph.getNodeAttribute(node, 'type');
        nodeTypes[type] = (nodeTypes[type] || 0) + 1;
        
        this.graph.forEachNeighbor(node, neighbor => {
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
        density: (internalEdges.length / 2) / (community.length * (community.length - 1) / 2)
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
      
      community.forEach(node => {
        totalDegree += this.graph.degree(node);
        this.graph.forEachNeighbor(node, neighbor => {
          if (community.includes(neighbor)) {
            internalEdges++;
          }
        });
      });
      
      internalEdges /= 2; // Undirected
      modularity += (internalEdges / m) - Math.pow(totalDegree / (2 * m), 2);
    }
    
    return modularity;
  }

  findConnectedComponents() {
    const components = [];
    const visited = new Set();
    
    this.graph.forEachNode(node => {
      if (!visited.has(node)) {
        const component = [];
        const stack = [node];
        
        while (stack.length > 0) {
          const current = stack.pop();
          if (!visited.has(current)) {
            visited.add(current);
            component.push(current);
            
            this.graph.forEachNeighbor(current, neighbor => {
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
    // Simplified bridge detection
    const bridges = [];
    const edges = this.graph.edges();
    
    for (const edge of edges.slice(0, Math.min(100, edges.length))) { // Sample for performance
      const [source, target] = this.graph.extremities(edge);
      
      // Temporarily remove edge
      const edgeData = this.graph.getEdgeAttributes(edge);
      this.graph.dropEdge(edge);
      
      // Check if graph becomes disconnected
      const isConnected = this.isPathExists(source, target);
      
      // Restore edge
      this.graph.addEdge(source, target, edgeData);
      
      if (!isConnected) {
        bridges.push(edge);
      }
    }
    
    return bridges;
  }

  findArticulationPoints() {
    // Simplified articulation point detection
    const articulationPoints = [];
    const nodes = this.graph.nodes();
    
    for (const node of nodes.slice(0, Math.min(50, nodes.length))) { // Sample for performance
      if (this.graph.degree(node) > 1) {
        const neighbors = this.graph.neighbors(node);
        
        // Temporarily remove node
        const nodeData = this.graph.getNodeAttributes(node);
        const edges = this.graph.edges(node).map(edge => ({
          edge,
          data: this.graph.getEdgeAttributes(edge),
          extremities: this.graph.extremities(edge)
        }));
        
        this.graph.dropNode(node);
        
        // Check if any neighbors become disconnected
        let disconnected = false;
        for (let i = 0; i < neighbors.length - 1; i++) {
          for (let j = i + 1; j < neighbors.length; j++) {
            if (!this.isPathExists(neighbors[i], neighbors[j])) {
              disconnected = true;
              break;
            }
          }
          if (disconnected) break;
        }
        
        // Restore node and edges
        this.graph.addNode(node, nodeData);
        edges.forEach(({ edge, data, extremities }) => {
          const [source, target] = extremities;
          if (this.graph.hasNode(source) && this.graph.hasNode(target)) {
            this.graph.addEdge(source, target, data);
          }
        });
        
        if (disconnected) {
          articulationPoints.push(node);
        }
      }
    }
    
    return articulationPoints;
  }

  isPathExists(source, target) {
    if (!this.graph.hasNode(source) || !this.graph.hasNode(target)) return false;
    if (source === target) return true;
    
    const visited = new Set();
    const queue = [source];
    
    while (queue.length > 0) {
      const current = queue.shift();
      if (current === target) return true;
      
      if (!visited.has(current)) {
        visited.add(current);
        this.graph.forEachNeighbor(current, neighbor => {
          if (!visited.has(neighbor)) {
            queue.push(neighbor);
          }
        });
      }
    }
    
    return false;
  }

  getComponentNodeTypes(component) {
    const types = {};
    component.forEach(node => {
      const type = this.graph.getNodeAttribute(node, 'type');
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }

  calculateConceptCoverage() {
    let documentsWithConcepts = 0;
    let totalDocuments = 0;
    
    this.graph.forEachNode((node, attributes) => {
      if (attributes.type === 'document') {
        totalDocuments++;
        
        // Check if document has concept connections
        let hasConcepts = false;
        this.graph.forEachNeighbor(node, neighbor => {
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

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  filterDocumentsByExclusionRules(documents, exclusionPatterns) {
    if (!exclusionPatterns || exclusionPatterns.length === 0) {
      return documents;
    }
    
    return documents.filter(doc => {
      const docPath = doc.path || doc.label || doc.node || '';
      
      // Check if document matches any exclusion pattern
      for (const pattern of exclusionPatterns) {
        // Convert glob pattern to regex (simplified)
        const regexPattern = pattern
          .replace(/\*\*/g, '.*')  // ** matches any path
          .replace(/\*/g, '[^/]*')  // * matches any filename chars except path separator
          .replace(/\./g, '\\.')    // Escape dots
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
        .replace(/\*\*/g, '.*')  // ** matches any path
        .replace(/\*/g, '[^/]*')  // * matches any filename chars except path separator
        .replace(/\./g, '\\.')    // Escape dots
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
}

export default GraphAnalyzer;