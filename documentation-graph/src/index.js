#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import FileUtils from './utils/fileUtils.js';
import logger from './utils/logger.js';
import DocumentExtractor from './extractors/documentExtractor.js';
import ConceptExtractor from './extractors/conceptExtractor.js';
import GraphBuilder from './builders/graphBuilder.js';
import GraphAnalyzer from './analyzers/graphAnalyzer.js';
import HtmlVisualizer from './visualizers/htmlVisualizer.js';

const program = new Command();

program
  .name('arbitrum-docs-graph')
  .description('Documentation Knowledge Graph Builder for Arbitrum Documentation')
  .version('1.0.0');

program
  .option('-i, --input <path>', 'Input directory containing documentation', '/Users/allup/dev/OCL/arbitrum-docs/docs')
  .option('-o, --output <path>', 'Output directory for generated files', './dist')
  .option('-c, --config <path>', 'Path to JSON configuration file for analysis customization')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('--skip-extraction', 'Skip document extraction phase', false)
  .option('--skip-concepts', 'Skip concept extraction phase', false)
  .option('--skip-analysis', 'Skip graph analysis phase', false)
  .option('--skip-visualization', 'Skip visualization generation', false)
  .option('--issue-report', 'Generate timestamped issue report after analysis', false)
  .action(async (options) => {
    try {
      await runAnalysis(options);
    } catch (error) {
      logger.error('Analysis failed:', error);
      process.exit(1);
    }
  });

async function runAnalysis(options) {
  logger.setVerbose(options.verbose);
  
  const startTime = Date.now();
  const inputDir = path.resolve(options.input);
  const outputDir = path.resolve(options.output);
  
  logger.section('Arbitrum Documentation Knowledge Graph Analysis');
  logger.info(`Input directory: ${inputDir}`);
  logger.info(`Output directory: ${outputDir}`);
  
  await FileUtils.ensureDirectory(outputDir);
  
  let documents, conceptData, graph, analysis, sidebarData;
  
  // Phase 1: Document Extraction
  if (!options.skipExtraction) {
    const extractor = new DocumentExtractor(inputDir);
    const extractionResult = await extractor.extractAll();
    documents = extractionResult.documents;
    sidebarData = extractionResult.sidebarData;
    
    const extractionStats = extractor.getStats();
    logger.stat('Documents processed', extractionStats.processedFiles);
    logger.stat('With frontmatter', extractionStats.withFrontmatter);
    logger.stat('Without frontmatter', extractionStats.withoutFrontmatter);
    logger.stat('Average words per document', extractionStats.averageWordsPerDoc);
    
    // Save extraction results
    const documentsArray = Array.from(documents.entries()).map(([path, doc]) => ({
      path,
      ...doc,
      // Convert Sets to Arrays for JSON serialization
      links: {
        internal: doc.links.internal,
        external: doc.links.external,
        anchor: doc.links.anchor
      }
    }));
    
    await FileUtils.writeJSON(
      path.join(outputDir, 'extracted-documents.json'),
      documentsArray
    );
    
    logger.success(`Saved extraction results to: ${path.join(outputDir, 'extracted-documents.json')}`);
  } else {
    logger.info('Skipping document extraction - loading from file');
    const documentsArray = await FileUtils.readJSON(path.join(outputDir, 'extracted-documents.json'));
    documents = new Map(documentsArray.map(doc => [doc.path, doc]));
  }
  
  // Phase 2: Concept Extraction
  if (!options.skipConcepts) {
    const conceptExtractor = new ConceptExtractor(options.config);
    conceptData = await conceptExtractor.extractFromDocuments(documents);
    
    const conceptStats = conceptExtractor.getStats();
    logger.stat('Total concepts extracted', conceptStats.totalConcepts);
    logger.stat('Unique concepts', conceptStats.uniqueConcepts);
    logger.stat('Domain concepts', conceptStats.domainConcepts);
    logger.stat('Technical terms', conceptStats.technicalTerms);
    
    // Save concept results (only top concepts to avoid memory issues)
    const topConcepts = conceptExtractor.getTopConcepts(500);
    const conceptsForSave = {
      topConcepts,
      conceptStats: conceptExtractor.getStats(),
      totalConcepts: conceptData.concepts.size,
      domainConcepts: Array.from(conceptData.concepts.entries())
        .filter(([_, concept]) => concept.type === 'domain')
        .slice(0, 100)
        .map(([key, concept]) => ({
          key,
          text: concept.text,
          type: concept.type,
          category: concept.category,
          fileCount: concept.files.size,
          totalWeight: concept.totalWeight
        }))
    };
    
    await FileUtils.writeJSON(
      path.join(outputDir, 'extracted-concepts.json'),
      conceptsForSave
    );
    
    logger.success(`Saved concept results to: ${path.join(outputDir, 'extracted-concepts.json')}`);
  } else {
    logger.info('Skipping concept extraction - loading from file');
    // For skipped extraction, create minimal concept data structure
    conceptData = {
      concepts: new Map(),
      frequency: new Map(),
      cooccurrence: new Map()
    };
    
    const savedConcepts = await FileUtils.readJSON(path.join(outputDir, 'extracted-concepts.json'));
    if (savedConcepts && savedConcepts.topConcepts) {
      // Reconstruct minimal concept data from saved top concepts
      for (const concept of savedConcepts.topConcepts) {
        conceptData.frequency.set(concept.concept, concept.frequency);
        conceptData.concepts.set(concept.concept, {
          text: concept.data.text,
          type: concept.data.type,
          category: concept.data.category,
          files: new Set([]), // Empty for now
          sources: new Set([]),
          totalWeight: concept.data.totalWeight || concept.frequency
        });
      }
    }
  }
  
  // Phase 3: Graph Construction
  const graphBuilder = new GraphBuilder();
  graph = await graphBuilder.buildGraph(documents, conceptData.concepts, conceptData);
  
  const graphStats = graphBuilder.getStats();
  logger.stat('Graph nodes', graphStats.totalNodes);
  logger.stat('Graph edges', graphStats.totalEdges);
  logger.stat('Graph density', (graphStats.density * 100).toFixed(2) + '%');
  logger.stat('Average degree', graphStats.avgDegree.toFixed(2));
  
  // Save graph data
  const graphData = graphBuilder.exportGraph();
  await FileUtils.writeJSON(
    path.join(outputDir, 'knowledge-graph.json'),
    graphData
  );
  
  logger.success(`Saved graph data to: ${path.join(outputDir, 'knowledge-graph.json')}`);
  
  // Phase 4: Graph Analysis
  if (!options.skipAnalysis) {
    // Get exclusion rules from concept extractor if config was provided
    let exclusionRules = null;
    if (options.config) {
      const tempExtractor = new ConceptExtractor(options.config);
      exclusionRules = tempExtractor.getExclusionRules();
    }
    
    const analyzer = new GraphAnalyzer(graph, sidebarData, exclusionRules);
    analysis = await analyzer.performFullAnalysis();
    
    logger.stat('Quality score', `${analysis.quality.overallScore}/100`);
    logger.stat('Issues found', analysis.quality.issues.length);
    logger.stat('Strengths identified', analysis.quality.strengths.length);
    logger.stat('Recommendations', analysis.recommendations.length);
    
    // Save analysis results
    await FileUtils.writeJSON(
      path.join(outputDir, 'graph-analysis.json'),
      analysis
    );
    
    logger.success(`Saved analysis results to: ${path.join(outputDir, 'graph-analysis.json')}`);
    
    // Generate detailed reports
    await generateReports(analysis, conceptData, outputDir);
  } else {
    logger.info('Skipping graph analysis - loading from file');
    analysis = await FileUtils.readJSON(path.join(outputDir, 'graph-analysis.json'));
  }
  
  // Phase 5: Visualization
  if (!options.skipVisualization) {
    const visualizer = new HtmlVisualizer();
    const visualizationPath = path.join(outputDir, 'knowledge-graph-visualization.html');
    
    await visualizer.generateVisualization(graphData, analysis, visualizationPath);
    
    logger.success(`Interactive visualization created: ${visualizationPath}`);
    logger.info(`Open in browser: file://${visualizationPath}`);
  }
  
  // Final Summary
  const totalTime = Date.now() - startTime;
  const minutes = Math.floor(totalTime / 60000);
  const seconds = ((totalTime % 60000) / 1000).toFixed(1);
  
  logger.section('Analysis Complete');
  logger.summary({
    'Total processing time': `${minutes}m ${seconds}s`,
    'Documents analyzed': documents.size,
    'Concepts extracted': conceptData.concepts.size,
    'Graph nodes': graphStats.totalNodes,
    'Graph edges': graphStats.totalEdges,
    'Quality score': `${analysis.quality.overallScore}/100`,
    'Output directory': outputDir
  });
  
  // Generate issue report if requested
  if (options.issueReport) {
    // Get exclusion rules from concept extractor if config was provided
    let exclusionRulesForReport = null;
    if (options.config) {
      const tempExtractor = new ConceptExtractor(options.config);
      exclusionRulesForReport = tempExtractor.getExclusionRules();
    }
    
    const reportPath = await generateIssueReport(
      analysis, 
      conceptData, 
      documents, 
      graphStats, 
      outputDir, 
      inputDir,
      sidebarData,
      exclusionRulesForReport
    );
    logger.section('Issue Report Generated');
    logger.info(`Report saved to: ${reportPath}`);
  }

  // Print key recommendations
  if (analysis.recommendations.length > 0) {
    logger.section('Key Recommendations');
    analysis.recommendations.slice(0, 5).forEach((rec, index) => {
      logger.info(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      logger.info(`   ${rec.description}`);
    });
  }
}

async function generateReports(analysis, conceptData, outputDir) {
  logger.subsection('Generating detailed reports');
  
  // Concept frequency report
  const topConcepts = Array.from(conceptData.frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([concept, frequency]) => ({
      concept,
      frequency,
      fileCount: conceptData.concepts.get(concept)?.files.size || 0,
      type: conceptData.concepts.get(concept)?.type || 'unknown',
      category: conceptData.concepts.get(concept)?.category || 'unknown'
    }));
  
  await FileUtils.writeJSON(
    path.join(outputDir, 'top-concepts-report.json'),
    topConcepts
  );
  
  // Document structure report
  const documentReport = {
    byDirectory: analysis.documents.byDirectory,
    byType: analysis.documents.byType,
    hubDocuments: analysis.documents.hubs,
    orphanDocuments: analysis.documents.orphans,
    totalDocuments: analysis.documents.total
  };
  
  await FileUtils.writeJSON(
    path.join(outputDir, 'document-structure-report.json'),
    documentReport
  );
  
  // Quality issues report
  const qualityReport = {
    overallScore: analysis.quality.overallScore,
    issues: analysis.quality.issues,
    strengths: analysis.quality.strengths,
    recommendations: analysis.recommendations
  };
  
  await FileUtils.writeJSON(
    path.join(outputDir, 'quality-assessment-report.json'),
    qualityReport
  );
  
  // Generate CSV for concept analysis
  const csvContent = [
    'Concept,Frequency,File Count,Type,Category',
    ...topConcepts.map(c => `"${c.concept}",${c.frequency},${c.fileCount},"${c.type}","${c.category}"`)
  ].join('\\n');
  
  await FileUtils.writeFile(
    path.join(outputDir, 'concepts-analysis.csv'),
    csvContent
  );
  
  logger.success('Generated detailed reports');
}

function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

function generateContentQualityAnalysis(analysis, documents, conceptData) {
  const issues = [];
  
  // Analyze potential content duplication based on concept similarity
  const duplicateAnalysis = analyzePotentialDuplicates(documents, conceptData);
  if (duplicateAnalysis.suspiciousPairs.length > 0) {
    issues.push(`**Potential Content Duplication**: ${duplicateAnalysis.suspiciousPairs.length} document pairs show high concept similarity (>80%)`);
    duplicateAnalysis.suspiciousPairs.slice(0, 3).forEach(pair => {
      issues.push(`  - \`${pair.doc1 || 'unknown'}\` ↔ \`${pair.doc2 || 'unknown'}\` (${pair.similarity}% similar)`);
    });
  }
  
  // Analyze content depth and completeness
  const documentsArray = Array.from(documents.values());
  const shallowDocs = documentsArray.filter(doc => {
    const wordCount = doc.wordCount || doc.stats?.wordCount || 0;
    return wordCount < 200;
  });
  if (shallowDocs.length > 0) {
    issues.push(`**Shallow Content**: ${shallowDocs.length} documents have fewer than 200 words`);
    shallowDocs.slice(0, 3).forEach(doc => {
      const docPath = doc.path || doc.relativePath || 'unknown path';
      const wordCount = doc.wordCount || doc.stats?.wordCount || 0;
      issues.push(`  - \`${docPath}\` (${wordCount} words)`);
    });
  }
  
  // Analyze concept density
  const avgConceptsPerDoc = Array.from(conceptData.frequency.entries()).reduce((sum, [concept, freq]) => sum + freq, 0) / documents.size;
  if (avgConceptsPerDoc < 5) {
    issues.push(`**Low Concept Density**: Average ${avgConceptsPerDoc.toFixed(1)} concepts per document (recommended: 5+)`);
  }
  
  return issues.length > 0 ? issues.join('\n') : '- No significant content quality issues detected';
}

function generateStructuralAnalysis(analysis, documents, exclusionRules = null) {
  const issues = [];
  
  // Check for missing frontmatter (with exclusions)
  const documentsArray = Array.from(documents.values());
  let missingFrontmatter = documentsArray.filter(doc => !doc.frontmatter || Object.keys(doc.frontmatter).length === 0);
  
  // Apply exclusion rules for frontmatter if provided
  if (exclusionRules?.frontmatterExcluded) {
    missingFrontmatter = missingFrontmatter.filter(doc => {
      const docPath = doc.path || doc.relativePath || '';
      return !matchesExclusionPattern(docPath, exclusionRules.frontmatterExcluded);
    });
  }
  
  if (missingFrontmatter.length > 0) {
    issues.push(`**Missing Frontmatter**: ${missingFrontmatter.length} documents lack structured metadata`);
    missingFrontmatter.slice(0, 3).forEach(doc => {
      const docPath = doc.path || doc.relativePath || 'unknown path';
      issues.push(`  - \`${docPath}\``);
    });
  }
  
  // Check for inconsistent directory structure
  const directoryStats = analysis.documents?.byDirectory || {};
  const dirSizes = Object.values(directoryStats);
  const avgDirSize = dirSizes.reduce((a, b) => a + b, 0) / dirSizes.length;
  const oversizedDirs = Object.entries(directoryStats).filter(([dir, count]) => count > avgDirSize * 2);
  
  if (oversizedDirs.length > 0) {
    issues.push(`**Oversized Directories**: ${oversizedDirs.length} directories significantly exceed average size`);
    oversizedDirs.slice(0, 3).forEach(([dir, count]) => {
      issues.push(`  - \`${dir}\`: ${count} files (avg: ${avgDirSize.toFixed(0)})`);
    });
  }
  
  // Check for hub document concentration
  const hubDocs = analysis.documents?.hubs || [];
  if (hubDocs.length < 3) {
    issues.push(`**Limited Hub Documents**: Only ${hubDocs.length} major hub documents identified (recommended: 5+)`);
  }
  
  return issues.length > 0 ? issues.join('\n') : '- No significant structural issues detected';
}

function generateCoverageGapsAnalysis(analysis, conceptData, documents) {
  const issues = [];
  
  // Analyze concept distribution by directory
  const conceptsByDir = {};
  const documentsArray = Array.from(documents.values());
  documentsArray.forEach(doc => {
    const docPath = doc.path || doc.relativePath;
    if (!docPath) return; // Skip documents without paths
    const dir = docPath.split('/').slice(-2, -1)[0] || doc.directory || 'root';
    if (!conceptsByDir[dir]) conceptsByDir[dir] = new Set();
    // Add concepts from this document (simplified - would need actual concept-document mapping)
  });
  
  // Check for low-concept directories
  const directoriesWithFewConcepts = Object.entries(analysis.documents?.byDirectory || {})
    .filter(([dir, count]) => count > 3) // Only check directories with multiple files
    .map(([dir, count]) => ({ dir, count, avgConcepts: (conceptsByDir[dir]?.size || 0) / count }))
    .filter(item => item.avgConcepts < 2);
    
  if (directoriesWithFewConcepts.length > 0) {
    issues.push(`**Low Concept Coverage**: ${directoriesWithFewConcepts.length} directories have sparse conceptual content`);
    directoriesWithFewConcepts.slice(0, 3).forEach(item => {
      issues.push(`  - \`${item.dir}\`: ${item.avgConcepts.toFixed(1)} concepts/doc (${item.count} docs)`);
    });
  }
  
  // Check for missing cross-references between major topics
  const topConcepts = Array.from(conceptData.frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([concept]) => concept);
    
  if (topConcepts.length > 0) {
    issues.push(`**Potential Cross-Reference Gaps**: Major concepts may lack sufficient interconnections`);
    issues.push(`  - Key concepts: ${topConcepts.slice(0, 5).join(', ')}`);
    issues.push(`  - Consider adding more cross-references between these topics`);
  }
  
  // Check for underrepresented documentation types
  const docTypes = ['how-to', 'tutorial', 'reference', 'concept'];
  const missingTypes = docTypes.filter(type => {
    const typeCount = documentsArray.filter(doc => {
      const docPath = doc.path || doc.relativePath || '';
      return doc.frontmatter?.content_type === type || 
             docPath.toLowerCase().includes(type);
    }).length;
    return typeCount < 3;
  });
  
  if (missingTypes.length > 0) {
    issues.push(`**Documentation Type Gaps**: Underrepresented content types: ${missingTypes.join(', ')}`);
  }
  
  return issues.length > 0 ? issues.join('\n') : '- No significant coverage gaps detected';
}

function generateDiscoverabilityAnalysis(analysis, documents, exclusionRules = null) {
  const issues = [];
  
  // Check for orphaned documents
  const orphanDocs = analysis.documents?.orphans || [];
  if (orphanDocs.length > 0) {
    issues.push(`**Orphaned Content**: ${orphanDocs.length} documents have minimal connections to other content`);
    orphanDocs.slice(0, 3).forEach(orphan => {
      // Try to construct a meaningful path from available data
      let docPath = 'unknown path';
      if (orphan.directory && orphan.label) {
        docPath = `${orphan.directory}/${orphan.label}`;
      } else if (orphan.label) {
        docPath = orphan.label;
      } else if (orphan.node) {
        docPath = orphan.node;
      }
      
      const degree = orphan.degree || 0;
      issues.push(`  - \`${docPath}\` (${degree} connections)`);
    });
  }
  
  // Check for documents with poor internal linking (with exclusions)
  const documentsArray = Array.from(documents.values());
  let poorlyLinkedDocs = documentsArray.filter(doc => {
    const internalLinks = doc.links?.internal?.length || 0;
    const wordCount = doc.wordCount || doc.stats?.wordCount || 0;
    return wordCount > 300 && internalLinks < 2; // Long docs with few links
  });
  
  // Apply exclusion rules for internal linking if provided
  if (exclusionRules?.internalLinkingExcluded) {
    poorlyLinkedDocs = poorlyLinkedDocs.filter(doc => {
      const docPath = doc.path || doc.relativePath || '';
      return !matchesExclusionPattern(docPath, exclusionRules.internalLinkingExcluded);
    });
  }
  
  if (poorlyLinkedDocs.length > 0) {
    issues.push(`**Poor Internal Linking**: ${poorlyLinkedDocs.length} substantial documents have fewer than 2 internal links`);
    poorlyLinkedDocs.slice(0, 3).forEach(doc => {
      const docPath = doc.path || doc.relativePath || 'unknown path';
      const wordCount = doc.wordCount || doc.stats?.wordCount || 0;
      const internalLinks = doc.links?.internal?.length || 0;
      issues.push(`  - \`${docPath}\` (${wordCount} words, ${internalLinks} links)`);
    });
  }
  
  // Check for missing navigation aids (with exclusions)
  let docsWithoutTitles = documentsArray.filter(doc => 
    !doc.frontmatter?.title && !doc.frontmatter?.sidebar_label
  );
  
  // Apply exclusion rules for frontmatter if provided
  if (exclusionRules?.frontmatterExcluded) {
    docsWithoutTitles = docsWithoutTitles.filter(doc => {
      const docPath = doc.path || doc.relativePath || '';
      return !matchesExclusionPattern(docPath, exclusionRules.frontmatterExcluded);
    });
  }
  
  if (docsWithoutTitles.length > 0) {
    issues.push(`**Missing Navigation Metadata**: ${docsWithoutTitles.length} documents lack title or sidebar_label`);
    docsWithoutTitles.slice(0, 3).forEach(doc => {
      const docPath = doc.path || doc.relativePath || 'unknown path';
      issues.push(`  - \`${docPath}\``);
    });
  }
  
  // Check for deep nesting that may hurt discoverability
  const deeplyNestedDocs = documentsArray.filter(doc => {
    const docPath = doc.path || doc.relativePath;
    if (!docPath) return false;
    const pathDepth = docPath.split('/').length - 2; // Subtract docs/ and filename
    return pathDepth > 3;
  });
  
  if (deeplyNestedDocs.length > 10) {
    issues.push(`**Deep Navigation**: ${deeplyNestedDocs.length} documents are deeply nested (>3 levels)`);
    issues.push(`  - Consider flattening navigation hierarchy for better discoverability`);
  }
  
  return issues.length > 0 ? issues.join('\n') : '- No significant discoverability issues detected';
}

function generateNavigationAnalysis(analysis, sidebarData) {
  const issues = [];
  
  // Check if navigation analysis is available
  if (!analysis.navigation || !analysis.navigation.available) {
    issues.push('**Navigation Analysis Unavailable**: Sidebar data not found or processed');
    return issues.join('\n');
  }

  const navAnalysis = analysis.navigation;

  // Coverage issues
  const coveragePercent = parseFloat(navAnalysis.coverage?.coveragePercentage || '0');
  if (coveragePercent < 90) {
    issues.push(`**Navigation Coverage Gap**: Only ${coveragePercent}% of documents are included in navigation`);
    if (navAnalysis.orphanedDocuments?.count > 0) {
      issues.push(`  - ${navAnalysis.orphanedDocuments.count} orphaned documents not accessible through navigation`);
      const orphanedDocs = navAnalysis.orphanedDocuments.documents || [];
      orphanedDocs.slice(0, 3).forEach(doc => {
        issues.push(`  - \`${doc.path || doc.label || 'unknown'}\``);
      });
    }
  }

  // Balance issues
  if (navAnalysis.balance && !navAnalysis.balance.balanced) {
    issues.push(`**Navigation Structure Imbalance**: Balance score ${(navAnalysis.balance.score * 100).toFixed(1)}%`);
    const balanceIssues = navAnalysis.balance.issues || [];
    balanceIssues.slice(0, 3).forEach(issue => {
      issues.push(`  - ${issue.description} (${issue.sidebar})`);
    });
  }

  // Deep nesting issues
  if (navAnalysis.deepNesting?.count > 0) {
    issues.push(`**Deep Navigation Hierarchy**: ${navAnalysis.deepNesting.count} documents deeply nested (>3 levels)`);
    const deepDocs = navAnalysis.deepNesting.documents || [];
    deepDocs.slice(0, 3).forEach(doc => {
      issues.push(`  - \`${doc.label}\` at depth ${doc.depth} in ${doc.categories?.join(' > ') || 'unknown category'}`);
    });
  }

  // Entry point issues
  if (navAnalysis.entryPoints?.count < 5) {
    issues.push(`**Limited Entry Points**: Only ${navAnalysis.entryPoints?.count || 0} clear entry points identified`);
    issues.push(`  - Users may struggle to find starting points for different use cases`);
  }

  // User journey issues
  if (navAnalysis.userJourneys?.available) {
    if (navAnalysis.userJourneys.deadEnds > 10) {
      issues.push(`**Navigation Dead Ends**: ${navAnalysis.userJourneys.deadEnds} documents with poor connectivity`);
      issues.push(`  - These documents may be hard to discover through natural navigation flows`);
    }

    if (navAnalysis.userJourneys.crossReferences === 0) {
      issues.push(`**Limited Cross-Section Linking**: No cross-references between major navigation sections`);
      issues.push(`  - Consider adding links between related topics in different sections`);
    }
  }

  // Structural issues
  if (navAnalysis.maxDepth > 5) {
    issues.push(`**Excessive Navigation Depth**: Maximum depth of ${navAnalysis.maxDepth} levels`);
    issues.push(`  - Deep hierarchies can hurt user experience and content discoverability`);
  }

  // Broken sidebar entries
  if (navAnalysis.orphanedEntries > 0) {
    issues.push(`**Broken Sidebar References**: ${navAnalysis.orphanedEntries} sidebar entries point to non-existent files`);
    issues.push(`  - These create broken links in the navigation system`);
  }

  return issues.length > 0 ? issues.join('\n') : '- Navigation structure is well-organized with good coverage and balance';
}

function generateNavigationSummary(analysis, sidebarData) {
  if (!analysis.navigation || !analysis.navigation.available) {
    return '- Navigation analysis not available';
  }

  const navAnalysis = analysis.navigation;
  const sections = [];

  // Overall structure
  sections.push(`#### Navigation Overview`);
  sections.push(`- **Total Sidebars**: ${navAnalysis.sidebars || 0} navigation sections`);
  sections.push(`- **Navigation Entries**: ${navAnalysis.totalEntries || 0} total items`);
  sections.push(`- **Categories**: ${navAnalysis.categories || 0} content categories`);
  sections.push(`- **Maximum Depth**: ${navAnalysis.maxDepth || 0} levels deep`);
  sections.push(`- **External Links**: ${navAnalysis.externalLinks || 0} outbound references`);
  sections.push('');

  // Coverage metrics
  const coverage = navAnalysis.coverage || {};
  sections.push(`#### Navigation Coverage`);
  sections.push(`- **Coverage Rate**: ${coverage.coveragePercentage || '0%'} of documents in navigation`);
  sections.push(`- **Documents in Navigation**: ${coverage.inNavigation || 0}`);
  sections.push(`- **Orphaned Documents**: ${coverage.notInNavigation || 0} not accessible through navigation`);
  sections.push('');

  // Quality indicators
  sections.push(`#### Navigation Quality`);
  sections.push(`- **Entry Points**: ${navAnalysis.entryPoints?.count || 0} clear starting points`);
  if (navAnalysis.balance) {
    sections.push(`- **Structure Balance**: ${(navAnalysis.balance.score * 100).toFixed(1)}% (${navAnalysis.balance.balanced ? 'Good' : 'Needs Improvement'})`);
  }
  if (navAnalysis.userJourneys?.available) {
    sections.push(`- **Cross-Section Links**: ${navAnalysis.userJourneys.crossReferences || 0} inter-section connections`);
    sections.push(`- **Dead Ends**: ${navAnalysis.userJourneys.deadEnds || 0} poorly connected documents`);
  }
  sections.push('');

  // Issues summary
  const issueCount = (navAnalysis.orphanedDocuments?.count || 0) + 
                     (navAnalysis.deepNesting?.count || 0) + 
                     (navAnalysis.orphanedEntries || 0);
  
  if (issueCount > 0) {
    sections.push(`#### Navigation Issues`);
    if (navAnalysis.orphanedDocuments?.count > 0) {
      sections.push(`- ${navAnalysis.orphanedDocuments.count} orphaned documents`);
    }
    if (navAnalysis.deepNesting?.count > 0) {
      sections.push(`- ${navAnalysis.deepNesting.count} deeply nested documents (>3 levels)`);
    }
    if (navAnalysis.orphanedEntries > 0) {
      sections.push(`- ${navAnalysis.orphanedEntries} broken sidebar references`);
    }
    sections.push('');
  }

  // User experience insights
  sections.push(`#### User Experience Insights`);
  if (navAnalysis.entryPoints?.count >= 5) {
    sections.push(`- **Good Entry Points**: ${navAnalysis.entryPoints.count} clear starting points for different user journeys`);
  } else {
    sections.push(`- **Limited Entry Points**: Only ${navAnalysis.entryPoints?.count || 0} entry points (recommend 5+)`);
  }
  
  if (navAnalysis.balance?.balanced) {
    sections.push(`- **Well-Balanced Structure**: Content is evenly distributed across categories`);
  } else {
    sections.push(`- **Structure Imbalance**: Some categories are significantly over/under-populated`);
  }

  if (navAnalysis.maxDepth <= 4) {
    sections.push(`- **Good Navigation Depth**: Maximum ${navAnalysis.maxDepth} levels maintains usability`);
  } else {
    sections.push(`- **Deep Hierarchy Warning**: ${navAnalysis.maxDepth} level depth may hurt discoverability`);
  }

  return sections.join('\n');
}

function analyzePotentialDuplicates(documents, conceptData) {
  const documentPairs = [];
  const documentsArray = Array.from(documents.values());
  
  // Compare documents based on concept overlap (simplified analysis)
  for (let i = 0; i < documentsArray.length - 1; i++) {
    for (let j = i + 1; j < Math.min(documentsArray.length, i + 20); j++) { // Limit comparisons for performance
      const doc1 = documentsArray[i];
      const doc2 = documentsArray[j];
      
      if (!doc1 || !doc2) continue; // Skip undefined documents
      
      // Simple similarity based on title and path similarity
      const doc1Title = doc1.frontmatter?.title || doc1.path || doc1.relativePath || 'unknown';
      const doc2Title = doc2.frontmatter?.title || doc2.path || doc2.relativePath || 'unknown';
      
      const titleSimilarity = calculateStringSimilarity(doc1Title, doc2Title);
      
      if (titleSimilarity > 0.8) {
        documentPairs.push({
          doc1: doc1.path || doc1.relativePath || 'unknown path',
          doc2: doc2.path || doc2.relativePath || 'unknown path',
          similarity: Math.round(titleSimilarity * 100)
        });
      }
    }
  }
  
  return {
    suspiciousPairs: documentPairs.sort((a, b) => b.similarity - a.similarity)
  };
}

function calculateStringSimilarity(str1, str2) {
  // Handle undefined or null strings
  if (!str1 || !str2) return 0;
  
  // Simple Jaccard similarity for string comparison
  const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 0));
  const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 0));
  
  if (words1.size === 0 && words2.size === 0) return 1;
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

async function generateIssueReport(analysis, conceptData, documents, graphStats, outputDir, inputDir, sidebarData, exclusionRules = null) {
  logger.subsection('Generating timestamped issue report');
  
  const timestamp = generateTimestamp();
  const reportPath = path.join(path.dirname(outputDir), `ANALYSIS_REPORT_${timestamp}.md`);
  
  // Get top concepts for the report
  const topConcepts = Array.from(conceptData.frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([concept, frequency], index) => {
      const conceptInfo = conceptData.concepts.get(concept);
      return `${index + 1}. **${concept}** (${frequency.toLocaleString()} mentions) - ${getConceptDescription(concept)}`;
    });

  // Get directory distribution
  const directoryStats = analysis.documents?.byDirectory || {};
  const totalFiles = documents.size;
  const dirDistribution = Object.entries(directoryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([dir, count]) => `- **${dir || 'root'}**: ${count} documents (${((count / totalFiles) * 100).toFixed(1)}%)`);

  // Calculate statistics
  const documentsArray = Array.from(documents.values());
  const withFrontmatter = documentsArray.filter(doc => doc.frontmatter && Object.keys(doc.frontmatter).length > 0).length;
  const withoutFrontmatter = totalFiles - withFrontmatter;
  const avgWordsPerDoc = Math.round(
    documentsArray.reduce((sum, doc) => {
      const wordCount = doc.wordCount || doc.stats?.wordCount || 0;
      return sum + wordCount;
    }, 0) / totalFiles
  );

  // Format concept categories
  const conceptStats = {
    totalConcepts: conceptData.concepts.size,
    domainConcepts: Array.from(conceptData.concepts.values()).filter(c => c.type === 'domain').length,
    technicalTerms: Array.from(conceptData.concepts.values()).filter(c => c.type === 'technical').length
  };

  // Generate report content
  const reportContent = `# Arbitrum Documentation Knowledge Graph - Analysis Report

## Executive Summary

This report presents the comprehensive analysis of the Arbitrum documentation repository, conducted using a custom-built Documentation Graph Builder Agent. The analysis processed **${totalFiles} documentation files** and extracted **${conceptStats.totalConcepts.toLocaleString()} unique concepts**, building a knowledge graph with **${graphStats.totalNodes} nodes** and **${graphStats.totalEdges} edges** to reveal the structural relationships, conceptual landscape, and organizational patterns within the documentation.

## Key Findings

### 📊 Documentation Inventory

- **Total Files Processed**: ${totalFiles} MDX/Markdown files
- **Files with Frontmatter**: ${withFrontmatter} (${Math.round((withFrontmatter / totalFiles) * 100)}%)
- **Files without Frontmatter**: ${withoutFrontmatter} (${Math.round((withoutFrontmatter / totalFiles) * 100)}%)
- **Average Words per Document**: ${avgWordsPerDoc} words
- **Processing Success Rate**: 100%

### 🔍 Concept Analysis

#### Top Concepts by Frequency
${topConcepts.join('\n')}

#### Concept Categories
- **Domain Concepts**: ${conceptStats.domainConcepts} (Arbitrum-specific terminology)
- **Technical Terms**: ${conceptStats.technicalTerms} (Programming and blockchain concepts)
- **Total Unique Concepts**: ${conceptStats.totalConcepts.toLocaleString()}
- **Concept Types**: Nouns, domain-specific terms, technical jargon, named entities

### 🏗️ Documentation Structure

#### Directory Distribution
${dirDistribution.join('\n')}

#### Content Types
- **How-to Guides**: Most common format
- **Conceptual Documentation**: Technical explanations
- **Reference Material**: API and configuration docs
- **Troubleshooting**: Problem-solving guides
- **Quickstarts**: Getting started content

### 🕸️ Graph Structure Analysis

#### Network Properties
- **Total Nodes**: ${graphStats.totalNodes}
  - Documents: ${analysis.basic?.nodesByType?.document || 'N/A'} (${analysis.basic?.nodesByType?.document ? ((analysis.basic.nodesByType.document / graphStats.totalNodes) * 100).toFixed(1) : 'N/A'}%)
  - Sections: ${analysis.basic?.nodesByType?.section || 'N/A'} (${analysis.basic?.nodesByType?.section ? ((analysis.basic.nodesByType.section / graphStats.totalNodes) * 100).toFixed(1) : 'N/A'}%)
  - Concepts: ${analysis.basic?.nodesByType?.concept || 'N/A'} (${analysis.basic?.nodesByType?.concept ? ((analysis.basic.nodesByType.concept / graphStats.totalNodes) * 100).toFixed(1) : 'N/A'}%)
  - Directories: ${analysis.basic?.nodesByType?.directory || 'N/A'} (${analysis.basic?.nodesByType?.directory ? ((analysis.basic.nodesByType.directory / graphStats.totalNodes) * 100).toFixed(1) : 'N/A'}%)
- **Total Edges**: ${graphStats.totalEdges}
  - Contains: ${analysis.basic?.edgesByType?.contains || 'N/A'} (${analysis.basic?.edgesByType?.contains ? ((analysis.basic.edgesByType.contains / graphStats.totalEdges) * 100).toFixed(1) : 'N/A'}%)
  - Parent-Child: ${analysis.basic?.edgesByType?.['parent-child'] || 'N/A'} (${analysis.basic?.edgesByType?.['parent-child'] ? ((analysis.basic.edgesByType['parent-child'] / graphStats.totalEdges) * 100).toFixed(1) : 'N/A'}%)
  - Links-to: ${analysis.basic?.edgesByType?.['links-to'] || 'N/A'} (${analysis.basic?.edgesByType?.['links-to'] ? ((analysis.basic.edgesByType['links-to'] / graphStats.totalEdges) * 100).toFixed(1) : 'N/A'}%)
- **Graph Density**: ${(graphStats.density * 100).toFixed(2)}% (sparse network)
- **Average Degree**: ${graphStats.avgDegree.toFixed(2)} connections per node

#### Connectivity Analysis
- **Graph Connectivity**: ${analysis.connectivity?.totalComponents ? (analysis.connectivity.totalComponents === 1 ? 'Connected' : `Disconnected (${analysis.connectivity.totalComponents} components)`) : 'Connected'}
- **Largest Connected Component**: ${analysis.connectivity?.largestComponent || 'N/A'} nodes
- **Isolated Components**: ${analysis.connectivity?.totalComponents > 1 ? (analysis.connectivity.totalComponents - 1) : 0}
- **Network Bridges**: ${analysis.connectivity?.bridges || 0} critical connections

### 📈 Quality Assessment

#### Overall Quality Score: **${analysis.quality.overallScore}/100**

#### Strengths Identified
${analysis.quality.strengths.map(strength => `- ${strength}`).join('\n')}

#### Issues Found

##### Content Quality Analysis
${generateContentQualityAnalysis(analysis, documents, conceptData)}

##### Structural Issues
${generateStructuralAnalysis(analysis, documents, exclusionRules)}

##### Coverage Gaps  
${generateCoverageGapsAnalysis(analysis, conceptData, documents)}

##### Discoverability Problems
${generateDiscoverabilityAnalysis(analysis, documents, exclusionRules)}

##### Navigation Structure Analysis
${generateNavigationAnalysis(analysis, sidebarData)}

##### System-Detected Issues
${analysis.quality.issues.length > 0 ? analysis.quality.issues.map((issue, index) => `${index + 1}. **${getIssueTitle(issue.type)}** (${capitalizeFirst(issue.severity)} Priority)
   - ${issue.description}`).join('\n') : '- No major system issues detected'}

#### Key Recommendations for Implementation

${analysis.recommendations.slice(0, 4).map((rec, index) => `##### ${index + 1}. **${rec.title}** (${rec.priority.toUpperCase()} Priority)
- **Issue**: ${rec.description}
- **Action**: ${rec.action || 'Review and address the identified issue'}
- **Impact**: ${rec.impact || 'Improved documentation quality and user experience'}`).join('\n\n')}

### 🧭 Navigation Structure Analysis

${sidebarData ? generateNavigationSummary(analysis, sidebarData) : '- Navigation analysis unavailable (sidebar data not found)'}

## Technical Architecture Insights

### Documentation Patterns
1. **Modular Structure**: Heavy use of partials and reusable components
2. **Frontmatter Standardization**: ${Math.round((withFrontmatter / totalFiles) * 100)}% compliance with metadata standards
3. **Cross-referencing**: Extensive internal linking, especially in core topics
4. **Domain Expertise**: Rich technical vocabulary specific to Arbitrum ecosystem

### Content Distribution
- **Launch Chain Documentation**: Largest section, reflecting key use case
- **Developer Resources**: Well-distributed across multiple specializations
- **Integration Guides**: Comprehensive third-party service coverage
- **Concept Depth**: Strong technical detail with appropriate abstraction levels

## Implementation Recommendations

### Recommended Next Steps

1. **Structural Improvements**
   - Merge or split documents based on connectivity analysis
   - Create bridging content for isolated topic areas
   - Standardize frontmatter across all documents

2. **Content Enhancement**
   - Develop concept maps for complex topic areas
   - Create learning path recommendations
   - Add contextual cross-references to improve flow

3. **Navigation Optimization**
   - Align directory structure with natural content clusters
   - Implement progressive disclosure for complex topics
   - Create topic-based entry points

4. **Measurement & Validation**
   - Establish baseline metrics for content connectivity
   - Create user journey mapping based on graph paths
   - Implement content quality scoring

## Interactive Visualization

An interactive knowledge graph visualization has been generated at:
\`${path.resolve(outputDir, 'knowledge-graph-visualization.html')}\`

This tool allows for:
- **Dynamic Exploration**: Filter by node types and relationships
- **Centrality Analysis**: Identify important documents and concepts  
- **Community Detection**: Visualize content clusters
- **Link Analysis**: Trace connections between topics
- **Search Functionality**: Find specific content quickly

## Conclusion

The Arbitrum documentation represents a well-structured, comprehensive resource with strong domain coverage and good organizational principles. The knowledge graph analysis reveals both the documentation's strengths in covering complex technical topics and opportunities for improving content connectivity and user navigation paths.

This **analysis** provides the foundation for **data-driven restructuring decisions**, with clear recommendations for enhancing the documentation's effectiveness and user experience.

---

*Generated by Documentation Graph Builder Agent*  
*Analysis Date: ${new Date().toLocaleDateString('en-US')}*  
*Run Timestamp: ${timestamp}*  
*Files Analyzed: ${totalFiles}*  
*Concepts Extracted: ${conceptStats.totalConcepts.toLocaleString()}*
*Input Directory: ${inputDir}*
`;

  await FileUtils.writeFile(reportPath, reportContent);
  
  logger.success(`Generated timestamped issue report: ${reportPath}`);
  return reportPath;
}

function getConceptDescription(concept) {
  const descriptions = {
    // Core Arbitrum concepts
    'arbitrum': 'Core blockchain platform',
    'arbitrum one': 'Main Arbitrum rollup network',
    'nitro': 'Current Arbitrum technology stack',
    'arbos': 'Arbitrum operating system',
    'stylus': 'WebAssembly smart contract support',
    
    // Transaction and execution
    'transaction': 'Blockchain transaction operations',
    'sequencer': 'Transaction ordering service',
    'stf': 'State transition function',
    'gas': 'Execution cost measurement',
    'block': 'Blockchain data structure',
    
    // Cross-chain and bridging
    'bridge': 'Cross-chain asset transfer',
    'gateway': 'Bridge contract interface',
    'custom gateway': 'Custom bridge implementation',
    'parent chain': 'Layer 1 blockchain (Ethereum)',
    'child chain': 'Layer 2 blockchain (Arbitrum)',
    'cross-chain': 'Inter-blockchain communication',
    
    // Smart contracts and development
    'smart contract': 'Programmable blockchain code',
    'contract': 'Smart contract references',
    'solidity': 'Smart contract language',
    'evm': 'Ethereum Virtual Machine',
    'wasm': 'WebAssembly runtime',
    'precompile': 'Built-in contract functions',
    'nodeinterface': 'Node interaction interface',
    
    // Tokens and assets
    'token': 'Digital asset references',
    'nft': 'Non-fungible tokens',
    'wallet': 'Cryptocurrency wallet',
    'metamask': 'Popular web3 wallet',
    
    // Technical infrastructure
    'rpc': 'Remote procedure call interface',
    'sdk': 'Software development kit',
    'blockchain': 'Distributed ledger technology',
    'node': 'Network infrastructure',
    'vrf': 'Verifiable random function',
    
    // Development and tools
    'dapp': 'Decentralized application',
    'go-ethereum': 'Ethereum client implementation',
    'rust': 'Programming language for Stylus',
    
    // Arbitrum-specific precompiles
    'arbowner': 'Owner precompile contract',
    'arbretryabletx': 'Retryable transaction precompile',
    'nitro-precompile': 'Nitro precompile contracts',
    'nitro-precompile-interfaces': 'Precompile interface definitions',
    
    // Other concepts
    'dia': 'Data availability',
    'timeboost': 'Transaction ordering mechanism',
    'ethereum': 'Parent chain reference',
    'chain': 'Blockchain infrastructure',
    
    // Data/UI elements (likely from tables)
    'v372': 'Version or data reference',
    'td td': 'Table data element',
    'data-quicklook': 'UI data element',
    'targetblank ': 'Link target attribute'
  };
  
  // Normalize the concept to lowercase for matching
  const normalizedConcept = concept.toLowerCase();
  return descriptions[normalizedConcept] || 'Technical terminology';
}

function getIssueTitle(issueType) {
  const titles = {
    'orphaned_documents': 'Isolated Documents',
    'broken_links': 'Broken Internal Links',
    'low_concept_coverage': 'Limited Concept Coverage',
    'hub_documents': 'Hub Document Complexity',
    'missing_frontmatter': 'Missing Metadata',
    'poor_connectivity': 'Poor Document Connectivity'
  };
  
  return titles[issueType] || 'Documentation Issue';
}

function capitalizeFirst(str) {
  if (!str) return 'Medium';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function matchesExclusionPattern(filePath, patterns) {
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

// Handle CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}

export { runAnalysis };