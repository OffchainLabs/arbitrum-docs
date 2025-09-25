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
import TopicFilter from '../filters/topicFilter.js';
import ReportGenerator from '../generators/reportGenerator.js';

const program = new Command();

program
  .name('topic-analyzer')
  .description('Topic-specific Documentation Knowledge Graph Analysis')
  .version('1.0.0');

program
  .argument('<topic>', 'Topic to filter by (e.g., "Arbitrum chain", "Node", "How-tos")')
  .option('-i, --input <path>', 'Input directory containing documentation', '/Users/allup/dev/OCL/arbitrum-docs/docs')
  .option('-o, --output <path>', 'Output directory for generated files', './dist')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('-f, --format <format>', 'Output format (html, json, markdown, all)', 'all')
  .option('--use-cache', 'Use cached extraction results if available', true)
  .option('--case-sensitive', 'Use case-sensitive topic matching', false)
  .option('--fuzzy', 'Enable fuzzy matching for topic keywords', false)
  .option('--threshold <number>', 'Minimum relevance score (0-1)', '0.3')
  .action(async (topic, options) => {
    try {
      await runTopicAnalysis(topic, options);
    } catch (error) {
      logger.error('Topic analysis failed:', error);
      process.exit(1);
    }
  });

async function runTopicAnalysis(topic, options) {
  logger.setVerbose(options.verbose);
  
  const startTime = Date.now();
  const inputDir = path.resolve(options.input);
  const outputDir = path.resolve(options.output);
  const topicSlug = topic.toLowerCase().replace(/\s+/g, '-');
  
  logger.section(`Topic-Specific Analysis: "${topic}"`);
  logger.info(`Input directory: ${inputDir}`);
  logger.info(`Output directory: ${outputDir}`);
  logger.info(`Topic filter: ${topic}`);
  logger.info(`Output format: ${options.format}`);
  
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
  
  // Apply topic filter
  const filter = new TopicFilter({
    caseSensitive: options.caseSensitive,
    fuzzyMatching: options.fuzzy,
    relevanceThreshold: parseFloat(options.threshold)
  });
  
  const filteredResults = filter.filterByTopic(
    documents,
    conceptData,
    topic
  );
  
  logger.stat('Documents matching topic', filteredResults.documents.size);
  logger.stat('Concepts matching topic', filteredResults.concepts.size);
  logger.stat('Total relevance score', filteredResults.stats.totalRelevance.toFixed(2));
  
  if (filteredResults.documents.size === 0) {
    logger.warn(`No documents found matching topic "${topic}"`);
    logger.info('Try using --fuzzy flag for broader matching');
    return;
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
  
  // Perform analysis on filtered graph
  const analyzer = new GraphAnalyzer(graph);
  const analysis = await analyzer.performFullAnalysis();
  
  // Generate reports
  const reportGenerator = new ReportGenerator();
  const reports = await reportGenerator.generateTopicReports({
    topic,
    filteredResults,
    graph: graphBuilder.exportGraph(),
    analysis,
    stats: {
      originalDocuments: documents.size,
      filteredDocuments: filteredResults.documents.size,
      originalConcepts: conceptData.concepts.size,
      filteredConcepts: filteredResults.concepts.size,
      ...graphStats
    }
  });
  
  // Save outputs based on format
  await saveOutputs(outputDir, topicSlug, options.format, {
    graph: graphBuilder.exportGraph(),
    analysis,
    reports,
    filteredResults
  });
  
  // Generate visualization if requested
  if (options.format === 'html' || options.format === 'all') {
    const visualizer = new HtmlVisualizer();
    const visualizationPath = path.join(outputDir, `knowledge-graph-visualization-${topicSlug}.html`);
    
    await visualizer.generateVisualization(
      graphBuilder.exportGraph(),
      analysis,
      visualizationPath,
      {
        title: `Knowledge Graph: ${topic}`,
        subtitle: `Filtered view showing ${filteredResults.documents.size} documents and ${filteredResults.concepts.size} concepts`
      }
    );
    
    logger.success(`Topic visualization created: ${visualizationPath}`);
  }
  
  // Final Summary
  const totalTime = Date.now() - startTime;
  const minutes = Math.floor(totalTime / 60000);
  const seconds = ((totalTime % 60000) / 1000).toFixed(1);
  
  logger.section('Topic Analysis Complete');
  logger.summary({
    'Topic': topic,
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
    logger.info(`${index + 1}. ${doc.title || path} (relevance: ${(score * 100).toFixed(1)}%)`);
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

async function saveOutputs(outputDir, topicSlug, format, data) {
  const formats = format === 'all' ? ['json', 'markdown'] : [format];
  
  for (const fmt of formats) {
    switch (fmt) {
      case 'json':
        await FileUtils.writeJSON(
          path.join(outputDir, `topic-analysis-${topicSlug}.json`),
          {
            topic: topicSlug,
            timestamp: new Date().toISOString(),
            graph: data.graph,
            analysis: data.analysis,
            reports: data.reports,
            stats: data.filteredResults.stats
          }
        );
        logger.success(`JSON report saved: topic-analysis-${topicSlug}.json`);
        break;
        
      case 'markdown':
        const markdownReport = data.reports.markdown || generateMarkdownReport(data);
        await FileUtils.writeFile(
          path.join(outputDir, `topic-report-${topicSlug}.md`),
          markdownReport
        );
        logger.success(`Markdown report saved: topic-report-${topicSlug}.md`);
        break;
    }
  }
}

function generateMarkdownReport(data) {
  const { analysis, filteredResults, reports } = data;
  
  return `# Topic Analysis Report: ${reports.topic}

Generated: ${new Date().toISOString()}

## Summary

- **Matching Documents**: ${filteredResults.documents.size}
- **Matching Concepts**: ${filteredResults.concepts.size}
- **Graph Quality Score**: ${analysis.quality.overallScore}/100

## Key Statistics

${reports.stats ? Object.entries(reports.stats)
  .map(([key, value]) => `- **${key}**: ${value}`)
  .join('\n') : ''}

## Top Documents

${Array.from(filteredResults.documents.entries())
  .slice(0, 10)
  .map(([path, doc], i) => `${i + 1}. **${doc.title || path}**\n   - Path: ${path}\n   - Type: ${doc.contentType || 'unknown'}`)
  .join('\n\n')}

## Recommendations

${analysis.recommendations
  .slice(0, 5)
  .map((rec, i) => `${i + 1}. **[${rec.priority.toUpperCase()}]** ${rec.title}\n   - ${rec.description}`)
  .join('\n\n')}
`;
}

// Handle CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}

export default runTopicAnalysis;