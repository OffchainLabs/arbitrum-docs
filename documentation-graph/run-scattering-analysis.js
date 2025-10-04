#!/usr/bin/env node

/**
 * Quick script to run scattered topics analysis for a specific concept
 */

import { DataLoader } from './mcp-server/src/core/DataLoader.js';
import { ScatteringAnalyzer } from './mcp-server/src/core/ScatteringAnalyzer.js';
import { CacheManager } from './mcp-server/src/core/CacheManager.js';

async function runScatteringAnalysis(conceptName, depth = 'semantic', minFragmentation = 0.6) {
  try {
    console.log('Loading documentation analysis data...');

    // Initialize cache manager
    const cacheManager = new CacheManager({
      enabled: false, // Disable cache for one-time script
      ttl: 0,
    });

    // Initialize data loader
    const dataLoader = new DataLoader('./dist');
    await dataLoader.load();

    // Initialize scattering analyzer
    const scatteringAnalyzer = new ScatteringAnalyzer(
      dataLoader.graph,
      dataLoader.documents,
      dataLoader.concepts,
      cacheManager,
    );

    console.log(`\nAnalyzing scattering for concept: "${conceptName}"\n`);

    // Run the analysis
    const result = scatteringAnalyzer.analyzeConceptScattering(conceptName);

    // Pretty print the results
    console.log('='.repeat(80));
    console.log('SCATTERING ANALYSIS RESULT');
    console.log('='.repeat(80));
    console.log(JSON.stringify(result, null, 2));
    console.log('='.repeat(80));

    // Summary
    if (result.found) {
      console.log('\nSUMMARY:');
      console.log(`  Concept: ${result.conceptName}`);
      console.log(`  Is Scattered: ${result.isScattered ? 'YES' : 'NO'}`);
      console.log(`  Fragmentation Score: ${result.fragmentationScore.toFixed(3)}`);
      console.log(`  Total Documents: ${result.metrics.totalDocuments}`);
      console.log(`  Max Concentration: ${result.metrics.maxConcentration}`);
      console.log(`  Gini Coefficient: ${result.metrics.giniCoefficient}`);

      if (result.directoryDistribution.length > 0) {
        console.log(`\n  Directory Distribution (Top 5):`);
        result.directoryDistribution.slice(0, 5).forEach((dir, i) => {
          console.log(
            `    ${i + 1}. ${dir.directory}: ${dir.documents.length} docs (${dir.percentage.toFixed(
              1,
            )}%)`,
          );
        });
      }

      if (result.navigationIssues.length > 0) {
        console.log(`\n  Navigation Issues:`);
        result.navigationIssues.forEach((issue) => {
          console.log(`    - [${issue.severity}] ${issue.description}`);
        });
      }

      if (result.recommendation && result.recommendation.length > 0) {
        console.log(`\n  Recommendations:`);
        result.recommendation.forEach((rec) => {
          console.log(`    - [${rec.priority}] ${rec.action}: ${rec.description}`);
        });
      }

      console.log(`\n  Top Documents (by weight):`);
      result.documentMentions.slice(0, 10).forEach((doc, i) => {
        const title = doc.document?.frontmatter?.title || 'Untitled';
        const path = doc.document?.relativePath || doc.path;
        console.log(`    ${i + 1}. ${title}`);
        console.log(`       Path: ${path}`);
        console.log(`       Weight: ${doc.weight.toFixed(2)} (${doc.percentage.toFixed(1)}%)`);
      });
    } else {
      console.log(`\nConcept "${conceptName}" not found in the documentation.`);
      if (result.error) {
        console.log(`Error: ${result.error}`);
      }
    }
  } catch (error) {
    console.error('Error running scattering analysis:', error);
    process.exit(1);
  }
}

// Get concept from command line or use default
const conceptName = process.argv[2] || 'Orbit deployment';
const depth = process.argv[3] || 'semantic';
const minFragmentation = parseFloat(process.argv[4]) || 0.6;

runScatteringAnalysis(conceptName, depth, minFragmentation);
