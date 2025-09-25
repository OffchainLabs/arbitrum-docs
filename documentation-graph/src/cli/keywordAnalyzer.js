#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import FileUtils from '../utils/fileUtils.js';
import logger from '../utils/logger.js';
import DocumentExtractor from '../extractors/documentExtractor.js';
import ConceptExtractor from '../extractors/conceptExtractor.js';
import GraphBuilder from '../builders/graphBuilder.js';
import GraphAnalyzer from '../analyzers/graphAnalyzer.js';
import HtmlVisualizer from '../visualizers/htmlVisualizer.js';
import KeywordFilter from '../filters/keywordFilter.js';
import ReportGenerator from '../generators/reportGenerator.js';

const program = new Command();

program
  .name('keyword-analyzer')
  .description('Keyword-based Documentation Knowledge Graph Analysis')
  .version('1.0.0');

program
  .argument('<keywords...>', 'Keywords to search for (can specify multiple)')
  .option('-i, --input <path>', 'Input directory containing documentation', '/Users/allup/dev/OCL/arbitrum-docs/docs')
  .option('-o, --output <path>', 'Output directory for generated files', './dist')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('-f, --format <format>', 'Output format (html, json, markdown, csv, all)', 'all')
  .option('--use-cache', 'Use cached extraction results if available', true)
  .option('--operator <op>', 'Logical operator for multiple keywords (AND, OR)', 'OR')
  .option('--include-related', 'Include related concepts and documents', false)
  .option('--depth <number>', 'Depth of related content to include (1-3)', '1')
  .option('--min-score <number>', 'Minimum relevance score (0-1)', '0.2')
  .option('--max-results <number>', 'Maximum number of results to include', '100')
  .action(async (keywords, options) => {
    try {
      await runKeywordAnalysis(keywords, options);
    } catch (error) {
      logger.error('Keyword analysis failed:', error);
      process.exit(1);
    }
  });

async function runKeywordAnalysis(keywords, options) {
  logger.setVerbose(options.verbose);
  
  const startTime = Date.now();
  const inputDir = path.resolve(options.input);
  const outputDir = path.resolve(options.output);
  const keywordSlug = keywords.join('-').toLowerCase().replace(/\s+/g, '-').substring(0, 50);
  
  logger.section('Keyword-Based Analysis');
  logger.info(`Keywords: ${keywords.join(', ')}`);
  logger.info(`Operator: ${options.operator}`);
  logger.info(`Input directory: ${inputDir}`);
  logger.info(`Output directory: ${outputDir}`);
  
  await FileUtils.ensureDirectory(outputDir);
  
  // Load or extract documents
  let documents, conceptData;
  
  if (options.useCache) {
    const docsPath = path.join(outputDir, 'extracted-documents.json');
    const conceptsPath = path.join(outputDir, 'extracted-concepts.json');
    
    if (await fs.pathExists(docsPath) && await fs.pathExists(conceptsPath)) {
      logger.info('Loading cached extraction results');
      
      const documentsArray = await FileUtils.readJSON(docsPath);
      documents = new Map(documentsArray.map(doc => [doc.path, doc]));
      
      const savedConcepts = await FileUtils.readJSON(conceptsPath);
      conceptData = reconstructConceptData(savedConcepts);
      
      logger.success('Loaded cached data successfully');
    } else {
      logger.info('Cache not found, performing fresh extraction');
      const result = await extractFreshData(inputDir);
      documents = result.documents;
      conceptData = result.conceptData;
    }
  } else {
    const result = await extractFreshData(inputDir);
    documents = result.documents;
    conceptData = result.conceptData;
  }
  
  // Apply keyword filter
  const filter = new KeywordFilter({
    operator: options.operator,
    includeRelated: options.includeRelated,
    relatedDepth: parseInt(options.depth),
    minScore: parseFloat(options.minScore),
    maxResults: parseInt(options.maxResults)
  });
  
  const filteredResults = filter.filterByKeywords(
    documents,
    conceptData,
    keywords
  );
  
  logger.stat('Documents matching keywords', filteredResults.documents.size);
  logger.stat('Concepts matching keywords', filteredResults.concepts.size);
  logger.stat('Average relevance score', filteredResults.stats.avgRelevance.toFixed(3));
  
  if (filteredResults.documents.size === 0) {
    logger.warn(`No documents found matching keywords: ${keywords.join(', ')}`);
    logger.info('Try using --operator OR for broader matching');
    return;
  }
  
  // Show keyword match distribution
  if (filteredResults.keywordMatches) {
    logger.subsection('Keyword Match Distribution');
    keywords.forEach(keyword => {
      const matches = filteredResults.keywordMatches.get(keyword) || 0;
      logger.info(`- "${keyword}": ${matches} matches`);
    });
  }
  
  // Build filtered graph
  const graphBuilder = new GraphBuilder();
  const graph = await graphBuilder.buildGraph(
    filteredResults.documents,
    filteredResults.concepts,
    filteredResults.conceptData
  );
  
  const graphStats = graphBuilder.getStats();
  logger.stat('Filtered graph nodes', graphStats.totalNodes);
  logger.stat('Filtered graph edges', graphStats.totalEdges);
  logger.stat('Graph connectivity', (graphStats.connectivity * 100).toFixed(1) + '%');
  
  // Perform analysis on filtered graph
  const analyzer = new GraphAnalyzer(graph);
  const analysis = await analyzer.performFullAnalysis();
  
  // Generate keyword-specific reports
  const reportGenerator = new ReportGenerator();
  const reports = await reportGenerator.generateKeywordReports({
    keywords,
    operator: options.operator,
    filteredResults,
    graph: graphBuilder.exportGraph(),
    analysis,
    stats: {
      originalDocuments: documents.size,
      filteredDocuments: filteredResults.documents.size,
      originalConcepts: conceptData.concepts.size,
      filteredConcepts: filteredResults.concepts.size,
      keywordMatches: Object.fromEntries(filteredResults.keywordMatches || new Map()),
      ...graphStats
    }
  });
  
  // Save outputs based on format
  await saveOutputs(outputDir, keywordSlug, options.format, {
    keywords,
    graph: graphBuilder.exportGraph(),
    analysis,
    reports,
    filteredResults
  });
  
  // Generate visualization if requested
  if (options.format === 'html' || options.format === 'all') {
    const visualizer = new HtmlVisualizer();
    const visualizationPath = path.join(outputDir, `knowledge-graph-visualization-${keywordSlug}.html`);
    
    await visualizer.generateVisualization(
      graphBuilder.exportGraph(),
      analysis,
      visualizationPath,
      {
        title: `Knowledge Graph: ${keywords.join(' ' + options.operator + ' ')}`,
        subtitle: `Keyword-filtered view with ${filteredResults.documents.size} documents`,
        highlightKeywords: keywords
      }
    );
    
    logger.success(`Keyword visualization created: ${visualizationPath}`);
  }
  
  // Final Summary
  const totalTime = Date.now() - startTime;
  const minutes = Math.floor(totalTime / 60000);
  const seconds = ((totalTime % 60000) / 1000).toFixed(1);
  
  logger.section('Keyword Analysis Complete');
  logger.summary({
    'Keywords': keywords.join(', '),
    'Operator': options.operator,
    'Processing time': `${minutes}m ${seconds}s`,
    'Matching documents': filteredResults.documents.size,
    'Matching concepts': filteredResults.concepts.size,
    'Graph nodes': graphStats.totalNodes,
    'Graph edges': graphStats.totalEdges,
    'Quality score': `${analysis.quality.overallScore}/100`,
    'Output directory': outputDir
  });
  
  // Print top matching documents
  logger.subsection('Top Matching Documents');
  const topDocs = Array.from(filteredResults.documents.entries())
    .sort((a, b) => (filteredResults.relevanceScores.get(b[0]) || 0) - (filteredResults.relevanceScores.get(a[0]) || 0))
    .slice(0, 5);
  
  topDocs.forEach(([path, doc], index) => {
    const score = filteredResults.relevanceScores.get(path) || 0;
    const matchedKeywords = filteredResults.documentKeywords?.get(path) || [];
    logger.info(`${index + 1}. ${doc.title || path}`);
    logger.info(`   Relevance: ${(score * 100).toFixed(1)}% | Keywords: ${matchedKeywords.join(', ')}`);
  });
}

async function extractFreshData(inputDir) {
  const extractor = new DocumentExtractor(inputDir);
  const documents = await extractor.extractAll();
  
  const conceptExtractor = new ConceptExtractor();
  const conceptData = await conceptExtractor.extractFromDocuments(documents);
  
  return { documents, conceptData };
}

function reconstructConceptData(savedConcepts) {
  const conceptData = {
    concepts: new Map(),
    frequency: new Map(),
    cooccurrence: new Map()
  };
  
  if (savedConcepts && savedConcepts.topConcepts) {
    for (const concept of savedConcepts.topConcepts) {
      conceptData.frequency.set(concept.concept, concept.frequency);
      conceptData.concepts.set(concept.concept, {
        text: concept.data.text,
        type: concept.data.type,
        category: concept.data.category,
        files: new Set(),
        sources: new Set(),
        totalWeight: concept.data.totalWeight || concept.frequency
      });
    }
  }
  
  if (savedConcepts && savedConcepts.domainConcepts) {
    for (const concept of savedConcepts.domainConcepts) {
      if (!conceptData.concepts.has(concept.key)) {
        conceptData.concepts.set(concept.key, {
          text: concept.text,
          type: concept.type,
          category: concept.category,
          files: new Set(),
          sources: new Set(),
          totalWeight: concept.totalWeight
        });
      }
    }
  }
  
  return conceptData;
}

async function saveOutputs(outputDir, keywordSlug, format, data) {
  const formats = format === 'all' ? ['json', 'markdown', 'csv'] : [format];
  
  for (const fmt of formats) {
    switch (fmt) {
      case 'json':
        await FileUtils.writeJSON(
          path.join(outputDir, `keyword-analysis-${keywordSlug}.json`),
          {
            keywords: data.keywords,
            timestamp: new Date().toISOString(),
            graph: data.graph,
            analysis: data.analysis,
            reports: data.reports,
            stats: data.filteredResults.stats
          }
        );
        logger.success(`JSON report saved: keyword-analysis-${keywordSlug}.json`);
        break;
        
      case 'markdown':
        const markdownReport = generateMarkdownReport(data);
        await FileUtils.writeFile(
          path.join(outputDir, `keyword-report-${keywordSlug}.md`),
          markdownReport
        );
        logger.success(`Markdown report saved: keyword-report-${keywordSlug}.md`);
        break;
        
      case 'csv':
        const csvReport = generateCSVReport(data);
        await FileUtils.writeFile(
          path.join(outputDir, `keyword-matches-${keywordSlug}.csv`),
          csvReport
        );
        logger.success(`CSV report saved: keyword-matches-${keywordSlug}.csv`);
        break;
    }
  }
}

function generateMarkdownReport(data) {
  const { keywords, analysis, filteredResults, reports } = data;
  
  return `# Keyword Analysis Report

**Keywords**: ${keywords.join(', ')}  
**Generated**: ${new Date().toISOString()}

## Summary

- **Matching Documents**: ${filteredResults.documents.size}
- **Matching Concepts**: ${filteredResults.concepts.size}
- **Graph Quality Score**: ${analysis.quality.overallScore}/100
- **Average Relevance**: ${(filteredResults.stats.avgRelevance * 100).toFixed(1)}%

## Keyword Distribution

${keywords.map(kw => {
  const matches = filteredResults.keywordMatches?.get(kw) || 0;
  return `- **${kw}**: ${matches} matches`;
}).join('\n')}

## Top Matching Documents

${Array.from(filteredResults.documents.entries())
  .sort((a, b) => (filteredResults.relevanceScores.get(b[0]) || 0) - (filteredResults.relevanceScores.get(a[0]) || 0))
  .slice(0, 15)
  .map(([path, doc], i) => {
    const score = filteredResults.relevanceScores.get(path) || 0;
    const matchedKw = filteredResults.documentKeywords?.get(path) || [];
    return `### ${i + 1}. ${doc.title || path}

- **Path**: ${path}
- **Type**: ${doc.contentType || 'unknown'}
- **Relevance**: ${(score * 100).toFixed(1)}%
- **Matched Keywords**: ${matchedKw.join(', ')}
- **Description**: ${doc.description || 'No description available'}`;
  }).join('\n\n')}

## Key Concepts

${Array.from(filteredResults.concepts.entries())
  .slice(0, 20)
  .map(([key, concept]) => `- **${concept.text}** (${concept.type})`)
  .join('\n')}

## Recommendations

${analysis.recommendations
  .slice(0, 10)
  .map((rec, i) => `### ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}

${rec.description}`)
  .join('\n\n')}
`;
}

function generateCSVReport(data) {
  const { filteredResults } = data;
  
  const headers = ['Path', 'Title', 'Type', 'Relevance Score', 'Matched Keywords', 'Description'];
  
  const rows = Array.from(filteredResults.documents.entries())
    .sort((a, b) => (filteredResults.relevanceScores.get(b[0]) || 0) - (filteredResults.relevanceScores.get(a[0]) || 0))
    .map(([path, doc]) => {
      const score = filteredResults.relevanceScores.get(path) || 0;
      const matchedKw = filteredResults.documentKeywords?.get(path) || [];
      
      return [
        `"${path}"`,
        `"${doc.title || ''}"`,
        `"${doc.contentType || 'unknown'}"`,
        (score * 100).toFixed(2),
        `"${matchedKw.join(', ')}"`,
        `"${(doc.description || '').replace(/"/g, '""')}"`
      ].join(',');
    });
  
  return [headers.join(','), ...rows].join('\n');
}

// Handle CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}

export default runKeywordAnalysis;