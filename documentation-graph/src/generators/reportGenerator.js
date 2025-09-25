import logger from '../utils/logger.js';

class ReportGenerator {
  constructor(options = {}) {
    this.includeVisualizations = options.includeVisualizations || true;
    this.maxItemsPerSection = options.maxItemsPerSection || 20;
  }
  
  async generateTopicReports(data) {
    const { topic, filteredResults, graph, analysis, stats } = data;
    
    logger.subsection('Generating topic-specific reports');
    
    const reports = {
      topic,
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(filteredResults, stats),
      documentAnalysis: this.analyzeDocuments(filteredResults),
      conceptAnalysis: this.analyzeConcepts(filteredResults),
      navigationAnalysis: this.analyzeNavigation(analysis, filteredResults),
      graphMetrics: this.extractGraphMetrics(graph, analysis),
      recommendations: this.generateRecommendations(analysis, filteredResults),
      stats
    };
    
    // Generate markdown report
    reports.markdown = this.generateTopicMarkdown(reports);
    
    // Generate visualization data
    if (this.includeVisualizations) {
      reports.visualizationData = this.prepareVisualizationData(graph, filteredResults);
    }
    
    return reports;
  }
  
  async generateKeywordReports(data) {
    const { keywords, operator, filteredResults, graph, analysis, stats } = data;
    
    logger.subsection('Generating keyword-specific reports');
    
    const reports = {
      keywords,
      operator,
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(filteredResults, stats),
      keywordAnalysis: this.analyzeKeywordMatches(filteredResults, keywords),
      documentAnalysis: this.analyzeDocuments(filteredResults),
      conceptAnalysis: this.analyzeConcepts(filteredResults),
      navigationAnalysis: this.analyzeNavigation(analysis, filteredResults),
      graphMetrics: this.extractGraphMetrics(graph, analysis),
      recommendations: this.generateRecommendations(analysis, filteredResults),
      stats
    };
    
    // Generate markdown report
    reports.markdown = this.generateKeywordMarkdown(reports);
    
    // Generate visualization data
    if (this.includeVisualizations) {
      reports.visualizationData = this.prepareVisualizationData(graph, filteredResults);
    }
    
    return reports;
  }
  
  generateSummary(filteredResults, stats) {
    return {
      totalDocuments: filteredResults.documents.size,
      totalConcepts: filteredResults.concepts.size,
      averageRelevance: stats.avgRelevance || 0,
      coverage: {
        documents: `${filteredResults.documents.size}/${stats.originalDocuments}`,
        concepts: `${filteredResults.concepts.size}/${stats.originalConcepts}`,
        percentage: ((filteredResults.documents.size / stats.originalDocuments) * 100).toFixed(1) + '%'
      }
    };
  }
  
  analyzeDocuments(filteredResults) {
    const documents = Array.from(filteredResults.documents.entries());
    const relevanceScores = filteredResults.relevanceScores || new Map();
    
    // Sort by relevance
    const sortedDocs = documents
      .map(([path, doc]) => ({
        path,
        doc,
        relevance: relevanceScores.get(path) || 0
      }))
      .sort((a, b) => b.relevance - a.relevance);
    
    // Group by content type
    const byType = {};
    for (const { doc } of sortedDocs) {
      const type = doc.contentType || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
    }
    
    // Group by directory
    const byDirectory = {};
    for (const { path } of sortedDocs) {
      const dir = path.split('/').slice(0, -1).join('/') || '/';
      byDirectory[dir] = (byDirectory[dir] || 0) + 1;
    }
    
    // Identify hub documents (most linked)
    const hubDocs = sortedDocs
      .filter(({ doc }) => doc.links && (doc.links.internal?.length || 0) > 5)
      .slice(0, 10);
    
    return {
      topDocuments: sortedDocs.slice(0, this.maxItemsPerSection).map(({ path, doc, relevance }) => ({
        path,
        title: doc.title,
        type: doc.contentType,
        relevance,
        description: doc.description,
        wordCount: doc.wordCount,
        linkCount: (doc.links?.internal?.length || 0) + (doc.links?.external?.length || 0)
      })),
      byType,
      byDirectory,
      hubDocuments: hubDocs.map(({ path, doc }) => ({
        path,
        title: doc.title,
        internalLinks: doc.links?.internal?.length || 0,
        externalLinks: doc.links?.external?.length || 0
      }))
    };
  }
  
  analyzeConcepts(filteredResults) {
    const concepts = Array.from(filteredResults.concepts.entries());
    const frequency = filteredResults.conceptData?.frequency || new Map();
    
    // Sort by frequency
    const sortedConcepts = concepts
      .map(([key, concept]) => ({
        key,
        concept,
        frequency: frequency.get(key) || 0
      }))
      .sort((a, b) => b.frequency - a.frequency);
    
    // Group by type
    const byType = {};
    for (const { concept } of sortedConcepts) {
      const type = concept.type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
    }
    
    // Group by category
    const byCategory = {};
    for (const { concept } of sortedConcepts) {
      const category = concept.category || 'unknown';
      byCategory[category] = (byCategory[category] || 0) + 1;
    }
    
    // Find domain-specific concepts
    const domainConcepts = sortedConcepts
      .filter(({ concept }) => concept.type === 'domain')
      .slice(0, this.maxItemsPerSection);
    
    // Find technical concepts
    const technicalConcepts = sortedConcepts
      .filter(({ concept }) => concept.type === 'technical')
      .slice(0, this.maxItemsPerSection);
    
    return {
      topConcepts: sortedConcepts.slice(0, this.maxItemsPerSection).map(({ key, concept, frequency }) => ({
        text: concept.text,
        type: concept.type,
        category: concept.category,
        frequency,
        weight: concept.totalWeight
      })),
      byType,
      byCategory,
      domainConcepts: domainConcepts.map(({ concept, frequency }) => ({
        text: concept.text,
        category: concept.category,
        frequency
      })),
      technicalConcepts: technicalConcepts.map(({ concept, frequency }) => ({
        text: concept.text,
        category: concept.category,
        frequency
      }))
    };
  }
  
  analyzeKeywordMatches(filteredResults, keywords) {
    const keywordMatches = filteredResults.keywordMatches || new Map();
    const documentKeywords = filteredResults.documentKeywords || new Map();
    
    // Calculate keyword statistics
    const keywordStats = keywords.map(keyword => {
      const matches = keywordMatches.get(keyword) || 0;
      const coverage = filteredResults.documents.size > 0 
        ? matches / filteredResults.documents.size 
        : 0;
      
      return {
        keyword,
        matches,
        coverage: (coverage * 100).toFixed(1) + '%'
      };
    });
    
    // Find documents matching multiple keywords
    const multiKeywordDocs = [];
    for (const [path, matchedKeywords] of documentKeywords.entries()) {
      if (matchedKeywords.length > 1) {
        const doc = filteredResults.documents.get(path);
        multiKeywordDocs.push({
          path,
          title: doc?.title,
          matchedKeywords,
          keywordCount: matchedKeywords.length
        });
      }
    }
    
    multiKeywordDocs.sort((a, b) => b.keywordCount - a.keywordCount);
    
    return {
      keywordStats,
      totalMatches: Array.from(keywordMatches.values()).reduce((sum, count) => sum + count, 0),
      multiKeywordDocuments: multiKeywordDocs.slice(0, this.maxItemsPerSection)
    };
  }

  analyzeNavigation(analysis, filteredResults) {
    // Check if navigation analysis is available
    if (!analysis.navigation || !analysis.navigation.available) {
      return {
        available: false,
        reason: 'Navigation data not available in analysis'
      };
    }

    const navAnalysis = analysis.navigation;
    const navigationReport = {
      available: true,
      coverage: {
        total: navAnalysis.coverage?.total || 0,
        inNavigation: navAnalysis.coverage?.inNavigation || 0,
        notInNavigation: navAnalysis.coverage?.notInNavigation || 0,
        coveragePercentage: navAnalysis.coverage?.coveragePercentage || '0%'
      },
      structure: {
        sidebars: navAnalysis.sidebars || 0,
        totalEntries: navAnalysis.totalEntries || 0,
        categories: navAnalysis.categories || 0,
        maxDepth: navAnalysis.maxDepth || 0,
        externalLinks: navAnalysis.externalLinks || 0
      },
      entryPoints: {
        count: navAnalysis.entryPoints?.count || 0,
        documents: navAnalysis.entryPoints?.documents?.slice(0, 10) || []
      },
      issues: {
        orphanedDocuments: navAnalysis.orphanedDocuments?.count || 0,
        deeplyNested: navAnalysis.deepNesting?.count || 0,
        orphanedEntries: navAnalysis.orphanedEntries || 0
      },
      balance: {
        score: navAnalysis.balance?.score || 0,
        balanced: navAnalysis.balance?.balanced || false,
        issues: navAnalysis.balance?.issues || []
      },
      userJourneys: {
        available: navAnalysis.userJourneys?.available || false,
        crossReferences: navAnalysis.userJourneys?.crossReferences?.length || 0,
        deadEnds: navAnalysis.userJourneys?.deadEnds?.length || 0,
        entryPointConnections: navAnalysis.userJourneys?.entryPoints?.reduce((sum, ep) => sum + ep.connections, 0) || 0
      }
    };

    // Analyze filtered documents for navigation patterns
    const documentsInFilter = Array.from(filteredResults.documents.entries());
    const navigationPatterns = this.analyzeFilteredNavigation(documentsInFilter);
    navigationReport.filteredAnalysis = navigationPatterns;

    return navigationReport;
  }

  analyzeFilteredNavigation(documentsInFilter) {
    const patterns = {
      documentsWithNavigation: 0,
      documentsWithoutNavigation: 0,
      averageNavigationDepth: 0,
      entryPointDocuments: 0,
      orphanedInFilter: 0,
      navigationPaths: new Set(),
      categories: new Set()
    };

    let totalDepth = 0;
    let depthCount = 0;

    for (const [path, doc] of documentsInFilter) {
      if (doc.navigation) {
        if (doc.navigation.inNavigation) {
          patterns.documentsWithNavigation++;
          
          if (doc.navigation.isEntryPoint) {
            patterns.entryPointDocuments++;
          }
          
          if (doc.navigation.depth > 0) {
            totalDepth += doc.navigation.depth;
            depthCount++;
          }

          // Collect navigation paths and categories
          if (doc.navigation.navigationPaths) {
            doc.navigation.navigationPaths.forEach(pathArray => {
              if (pathArray.length > 0) {
                patterns.navigationPaths.add(pathArray[0]); // Sidebar name
              }
            });
          }

          if (doc.navigation.categories) {
            doc.navigation.categories.forEach(cat => patterns.categories.add(cat));
          }
        } else {
          patterns.documentsWithoutNavigation++;
          patterns.orphanedInFilter++;
        }
      } else {
        patterns.documentsWithoutNavigation++;
        patterns.orphanedInFilter++;
      }
    }

    patterns.averageNavigationDepth = depthCount > 0 ? (totalDepth / depthCount).toFixed(1) : 0;
    patterns.navigationPaths = Array.from(patterns.navigationPaths);
    patterns.categories = Array.from(patterns.categories);

    // Calculate navigation diversity score
    patterns.navigationDiversity = patterns.navigationPaths.length > 0 ? 
      (patterns.categories.length / patterns.navigationPaths.length).toFixed(2) : 0;

    return patterns;
  }
  
  extractGraphMetrics(graph, analysis) {
    return {
      nodes: graph.nodes?.length || 0,
      edges: graph.edges?.length || 0,
      density: analysis.structure?.density || 0,
      averageDegree: analysis.structure?.avgDegree || 0,
      clustering: analysis.structure?.clustering || 0,
      components: analysis.structure?.components || 0,
      diameter: analysis.structure?.diameter || 0,
      qualityScore: analysis.quality?.overallScore || 0,
      issues: analysis.quality?.issues?.length || 0,
      strengths: analysis.quality?.strengths?.length || 0
    };
  }
  
  generateRecommendations(analysis, filteredResults) {
    const recommendations = [];
    
    // Add analysis-based recommendations
    if (analysis.recommendations) {
      recommendations.push(...analysis.recommendations.slice(0, 5));
    }
    
    // Add filter-specific recommendations
    if (filteredResults.documents.size < 5) {
      recommendations.push({
        priority: 'high',
        title: 'Limited Results',
        description: 'Very few documents match your criteria. Consider broadening your search or using fuzzy matching.',
        type: 'search'
      });
    }
    
    if (filteredResults.concepts.size < 10) {
      recommendations.push({
        priority: 'medium',
        title: 'Low Concept Coverage',
        description: 'The filtered view contains few concepts. This might indicate sparse documentation in this area.',
        type: 'coverage'
      });
    }
    
    // Check for isolated documents
    const isolatedDocs = Array.from(filteredResults.documents.entries()).filter(([path, doc]) => 
      !doc.links || (doc.links.internal?.length || 0) === 0
    );
    
    if (isolatedDocs.length > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Isolated Documents',
        description: `Found ${isolatedDocs.length} documents with no internal links. Consider adding cross-references.`,
        type: 'structure',
        affectedItems: isolatedDocs.slice(0, 5).map(([path]) => path)
      });
    }
    
    return recommendations;
  }
  
  prepareVisualizationData(graph, filteredResults) {
    const relevanceScores = filteredResults.relevanceScores || new Map();
    
    // Enhance nodes with relevance scores
    const enhancedNodes = graph.nodes?.map(node => {
      if (node.type === 'document') {
        const relevance = relevanceScores.get(node.id) || 0;
        return {
          ...node,
          relevance,
          size: 10 + (relevance * 20) // Scale node size by relevance
        };
      }
      return node;
    }) || [];
    
    return {
      nodes: enhancedNodes,
      edges: graph.edges || [],
      layout: 'force-directed',
      colorScheme: 'relevance'
    };
  }
  
  generateTopicMarkdown(reports) {
    const sections = [
      `# Topic Analysis: ${reports.topic}`,
      '',
      `Generated: ${reports.timestamp}`,
      '',
      '## Executive Summary',
      '',
      `- **Documents Found**: ${reports.summary.totalDocuments}`,
      `- **Concepts Identified**: ${reports.summary.totalConcepts}`,
      `- **Average Relevance**: ${(reports.summary.averageRelevance * 100).toFixed(1)}%`,
      `- **Coverage**: ${reports.summary.coverage.percentage} of total documentation`,
      '',
      '## Top Documents',
      '',
      ...reports.documentAnalysis.topDocuments.slice(0, 10).map((doc, i) => 
        `${i + 1}. **${doc.title || 'Untitled'}** (${(doc.relevance * 100).toFixed(1)}%)
   - Path: \`${doc.path}\`
   - Type: ${doc.type || 'unknown'}
   - Words: ${doc.wordCount || 0}
   ${doc.description ? `- ${doc.description}` : ''}`
      ),
      '',
      '## Key Concepts',
      '',
      '### Domain Concepts',
      ...reports.conceptAnalysis.domainConcepts.map(c => 
        `- **${c.text}** (${c.frequency} occurrences)`
      ),
      '',
      '### Technical Terms',
      ...reports.conceptAnalysis.technicalConcepts.map(c => 
        `- **${c.text}** (${c.frequency} occurrences)`
      ),
      '',
      '## Navigation Analysis',
      '',
      this.generateNavigationSection(reports.navigationAnalysis),
      '',
      '## Graph Metrics',
      '',
      `- Nodes: ${reports.graphMetrics.nodes}`,
      `- Edges: ${reports.graphMetrics.edges}`,
      `- Quality Score: ${reports.graphMetrics.qualityScore}/100`,
      `- Average Degree: ${reports.graphMetrics.averageDegree.toFixed(2)}`,
      '',
      '## Recommendations',
      '',
      ...reports.recommendations.map((rec, i) => 
        `${i + 1}. **[${rec.priority.toUpperCase()}]** ${rec.title}
   
   ${rec.description}`
      )
    ];
    
    return sections.join('\n');
  }
  
  generateKeywordMarkdown(reports) {
    const sections = [
      `# Keyword Analysis: ${reports.keywords.join(' ' + reports.operator + ' ')}`,
      '',
      `Generated: ${reports.timestamp}`,
      '',
      '## Executive Summary',
      '',
      `- **Search Operator**: ${reports.operator}`,
      `- **Documents Found**: ${reports.summary.totalDocuments}`,
      `- **Concepts Identified**: ${reports.summary.totalConcepts}`,
      `- **Average Relevance**: ${(reports.summary.averageRelevance * 100).toFixed(1)}%`,
      '',
      '## Keyword Statistics',
      '',
      ...reports.keywordAnalysis.keywordStats.map(stat => 
        `- **${stat.keyword}**: ${stat.matches} matches (${stat.coverage} coverage)`
      ),
      `- **Total Matches**: ${reports.keywordAnalysis.totalMatches}`,
      '',
      '## Top Matching Documents',
      '',
      ...reports.documentAnalysis.topDocuments.slice(0, 15).map((doc, i) => 
        `${i + 1}. **${doc.title || 'Untitled'}** (${(doc.relevance * 100).toFixed(1)}%)
   - Path: \`${doc.path}\`
   - Type: ${doc.type || 'unknown'}
   ${doc.description ? `- ${doc.description}` : ''}`
      ),
      '',
      '## Multi-Keyword Documents',
      '',
      'Documents matching multiple keywords:',
      '',
      ...reports.keywordAnalysis.multiKeywordDocuments.map((doc, i) => 
        `${i + 1}. **${doc.title || doc.path}**
   - Keywords: ${doc.matchedKeywords.join(', ')}
   - Match count: ${doc.keywordCount}`
      ),
      '',
      '## Navigation Analysis',
      '',
      this.generateNavigationSection(reports.navigationAnalysis),
      '',
      '## Graph Metrics',
      '',
      `- Nodes: ${reports.graphMetrics.nodes}`,
      `- Edges: ${reports.graphMetrics.edges}`,
      `- Quality Score: ${reports.graphMetrics.qualityScore}/100`,
      '',
      '## Recommendations',
      '',
      ...reports.recommendations.map((rec, i) => 
        `${i + 1}. **[${rec.priority.toUpperCase()}]** ${rec.title}
   
   ${rec.description}`
      )
    ];
    
    return sections.join('\n');
  }

  generateNavigationSection(navigationAnalysis) {
    if (!navigationAnalysis || !navigationAnalysis.available) {
      return '- Navigation analysis not available (sidebar data missing)';
    }

    const sections = [];

    // Coverage overview
    sections.push('### Navigation Coverage');
    sections.push(`- Total Documents: ${navigationAnalysis.coverage.total}`);
    sections.push(`- In Navigation: ${navigationAnalysis.coverage.inNavigation} (${navigationAnalysis.coverage.coveragePercentage})`);
    sections.push(`- Orphaned: ${navigationAnalysis.coverage.notInNavigation} documents`);
    sections.push('');

    // Structure overview
    sections.push('### Navigation Structure');
    sections.push(`- Sidebars: ${navigationAnalysis.structure.sidebars}`);
    sections.push(`- Total Entries: ${navigationAnalysis.structure.totalEntries}`);
    sections.push(`- Categories: ${navigationAnalysis.structure.categories}`);
    sections.push(`- Max Depth: ${navigationAnalysis.structure.maxDepth} levels`);
    sections.push(`- External Links: ${navigationAnalysis.structure.externalLinks}`);
    sections.push('');

    // Entry points
    if (navigationAnalysis.entryPoints.count > 0) {
      sections.push('### Entry Points');
      sections.push(`- ${navigationAnalysis.entryPoints.count} entry point documents identified`);
      if (navigationAnalysis.entryPoints.documents.length > 0) {
        sections.push(`- Top entry points: ${navigationAnalysis.entryPoints.documents.slice(0, 3).map(ep => ep.document).join(', ')}`);
      }
      sections.push('');
    }

    // Issues
    if (navigationAnalysis.issues.orphanedDocuments > 0 || 
        navigationAnalysis.issues.deeplyNested > 0 || 
        navigationAnalysis.issues.orphanedEntries > 0) {
      sections.push('### Navigation Issues');
      if (navigationAnalysis.issues.orphanedDocuments > 0) {
        sections.push(`- ${navigationAnalysis.issues.orphanedDocuments} orphaned documents`);
      }
      if (navigationAnalysis.issues.deeplyNested > 0) {
        sections.push(`- ${navigationAnalysis.issues.deeplyNested} deeply nested documents`);
      }
      if (navigationAnalysis.issues.orphanedEntries > 0) {
        sections.push(`- ${navigationAnalysis.issues.orphanedEntries} broken sidebar entries`);
      }
      sections.push('');
    }

    // Balance assessment
    sections.push('### Navigation Balance');
    sections.push(`- Balance Score: ${(navigationAnalysis.balance.score * 100).toFixed(1)}%`);
    sections.push(`- Status: ${navigationAnalysis.balance.balanced ? 'Well Balanced' : 'Needs Improvement'}`);
    if (navigationAnalysis.balance.issues.length > 0) {
      sections.push(`- Issues: ${navigationAnalysis.balance.issues.length} balance issues identified`);
    }
    sections.push('');

    // User journeys (if available)
    if (navigationAnalysis.userJourneys.available) {
      sections.push('### User Journey Analysis');
      sections.push(`- Cross-references: ${navigationAnalysis.userJourneys.crossReferences} cross-section links`);
      sections.push(`- Dead ends: ${navigationAnalysis.userJourneys.deadEnds} low-connectivity documents`);
      if (navigationAnalysis.userJourneys.entryPointConnections > 0) {
        sections.push(`- Entry point connections: ${navigationAnalysis.userJourneys.entryPointConnections} total`);
      }
      sections.push('');
    }

    // Filtered analysis (for topic/keyword reports)
    if (navigationAnalysis.filteredAnalysis) {
      const filtered = navigationAnalysis.filteredAnalysis;
      sections.push('### Filtered Content Navigation');
      sections.push(`- Documents with navigation: ${filtered.documentsWithNavigation}`);
      sections.push(`- Orphaned in filter: ${filtered.orphanedInFilter}`);
      sections.push(`- Entry points in filter: ${filtered.entryPointDocuments}`);
      sections.push(`- Average depth: ${filtered.averageNavigationDepth} levels`);
      if (filtered.categories.length > 0) {
        sections.push(`- Categories covered: ${filtered.categories.slice(0, 5).join(', ')}`);
      }
      if (filtered.navigationPaths.length > 0) {
        sections.push(`- Sidebars involved: ${filtered.navigationPaths.join(', ')}`);
      }
      sections.push(`- Navigation diversity: ${filtered.navigationDiversity}`);
    }

    return sections.join('\n');
  }
}

export default ReportGenerator;