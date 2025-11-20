#!/usr/bin/env node

/**
 * Test script to verify tool schemas are properly formatted as JSON Schema
 */

import { ToolRegistry } from './src/tools/ToolRegistry.js';

// Mock dependencies
const mockEngine = {
  calculateComprehensiveSimilarity: () => ({}),
  findSimilarDocuments: () => [],
};

const mockAnalyzer = {
  analyzeConceptScattering: () => ({}),
  findScatteredTopics: () => [],
};

const mockConsolidation = {
  suggestConsolidation: () => ({}),
  suggestCanonicalReference: () => ({}),
};

const mockParser = {};

const mockLoader = {
  getDocumentsForConcept: () => [],
  getDocument: () => null,
  getAllDocuments: () => [],
  getGraphNode: () => null,
  getGraphEdges: () => [],
};

const registry = new ToolRegistry({
  similarityEngine: mockEngine,
  scatteringAnalyzer: mockAnalyzer,
  consolidationEngine: mockConsolidation,
  queryParser: mockParser,
  dataLoader: mockLoader,
});

const tools = registry.listTools();

console.log('=== Tool Schema Validation ===\n');

let hasErrors = false;

tools.forEach((tool, index) => {
  console.log(`Tool ${index + 1}: ${tool.name}`);
  console.log(`Description: ${tool.description}`);

  // Check inputSchema has required fields
  if (!tool.inputSchema) {
    console.log('❌ ERROR: Missing inputSchema');
    hasErrors = true;
  } else if (tool.inputSchema.type !== 'object') {
    console.log(`❌ ERROR: inputSchema.type is "${tool.inputSchema.type}", expected "object"`);
    hasErrors = true;
  } else if (!tool.inputSchema.properties) {
    console.log('❌ ERROR: Missing inputSchema.properties');
    hasErrors = true;
  } else {
    console.log(`✅ Valid JSON Schema with ${Object.keys(tool.inputSchema.properties).length} properties`);
    console.log(`   Required fields: ${tool.inputSchema.required?.join(', ') || 'none'}`);
  }

  console.log('');
});

if (!hasErrors) {
  console.log('✅ All tool schemas are valid!\n');
  console.log('Sample schema for first tool:');
  console.log(JSON.stringify(tools[0].inputSchema, null, 2));
} else {
  console.log('❌ Some tool schemas have errors');
  process.exit(1);
}
