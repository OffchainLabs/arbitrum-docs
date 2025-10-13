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

/**
 * Schema Structure Tests
 *
 * These are FAILING tests (RED phase of TDD)
 * Schema files do not exist yet
 *
 * Tests for:
 * - graph-schema.json structure and completeness
 * - document-schema.json structure and completeness
 * - concept-schema.json structure and completeness
 * - analysis-schema.json structure and completeness
 * - Schema compliance with JSON Schema Draft 07
 * - Schema validation capabilities
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { assertValidSchema } from '../../helpers/assertionHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMAS_DIR = path.join(__dirname, '../../../schemas');

describe('JSON Schemas Structure', () => {
  let schemas = {};

  beforeAll(async () => {
    try {
      // Load all schema files
      const schemaFiles = [
        'graph-schema.json',
        'document-schema.json',
        'concept-schema.json',
        'analysis-schema.json',
      ];

      for (const file of schemaFiles) {
        const filePath = path.join(SCHEMAS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const schemaName = file.replace('-schema.json', '');
        schemas[schemaName] = JSON.parse(content);
      }
    } catch (error) {
      console.warn('Schema files not created yet - tests will fail as expected');
    }
  });

  describe('Graph Schema (graph-schema.json)', () => {
    it('should exist as a file', async () => {
      const filePath = path.join(SCHEMAS_DIR, 'graph-schema.json');
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);
    });

    it('should be valid JSON Schema Draft 07', () => {
      assertValidSchema(schemas.graph);
    });

    it('should have correct schema metadata', () => {
      expect(schemas.graph.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(schemas.graph.$id).toBeDefined();
      expect(schemas.graph.title).toBe('Knowledge Graph');
      expect(schemas.graph.description).toBeDefined();
    });

    it('should define root as object type', () => {
      expect(schemas.graph.type).toBe('object');
    });

    it('should require metadata, nodes, and edges', () => {
      expect(schemas.graph.required).toContain('metadata');
      expect(schemas.graph.required).toContain('nodes');
      expect(schemas.graph.required).toContain('edges');
    });

    it('should define metadata properties', () => {
      expect(schemas.graph.properties.metadata).toBeDefined();
      expect(schemas.graph.properties.metadata.type).toBe('object');
      expect(schemas.graph.properties.metadata.required).toContain('version');
      expect(schemas.graph.properties.metadata.required).toContain('generated');
      expect(schemas.graph.properties.metadata.required).toContain('source');
    });

    it('should define source metadata structure', () => {
      const source = schemas.graph.properties.metadata.properties.source;

      expect(source).toBeDefined();
      expect(source.type).toBe('object');
      expect(source.required).toContain('inputPath');
      expect(source.required).toContain('fileCount');
      expect(source.required).toContain('totalNodes');
      expect(source.required).toContain('totalEdges');
    });

    it('should define nodes as array of node objects', () => {
      expect(schemas.graph.properties.nodes).toBeDefined();
      expect(schemas.graph.properties.nodes.type).toBe('array');
      expect(schemas.graph.properties.nodes.items).toBeDefined();
    });

    it('should define node structure with required fields', () => {
      const nodeSchema = schemas.graph.properties.nodes.items;

      expect(nodeSchema.type).toBe('object');
      expect(nodeSchema.required).toContain('id');
      expect(nodeSchema.required).toContain('type');
      expect(nodeSchema.required).toContain('label');
    });

    it('should define valid node types', () => {
      const nodeSchema = schemas.graph.properties.nodes.items;
      const typeEnum = nodeSchema.properties.type.enum;

      expect(typeEnum).toContain('document');
      expect(typeEnum).toContain('concept');
      expect(typeEnum).toContain('section');
      expect(typeEnum).toContain('directory');
      expect(typeEnum).toContain('tag');
      expect(typeEnum).toContain('navigation');
    });

    it('should define edges as array of edge objects', () => {
      expect(schemas.graph.properties.edges).toBeDefined();
      expect(schemas.graph.properties.edges.type).toBe('array');
      expect(schemas.graph.properties.edges.items).toBeDefined();
    });

    it('should define edge structure with required fields', () => {
      const edgeSchema = schemas.graph.properties.edges.items;

      expect(edgeSchema.type).toBe('object');
      expect(edgeSchema.required).toContain('id');
      expect(edgeSchema.required).toContain('source');
      expect(edgeSchema.required).toContain('target');
      expect(edgeSchema.required).toContain('type');
    });

    it('should define valid edge types', () => {
      const edgeSchema = schemas.graph.properties.edges.items;
      const typeEnum = edgeSchema.properties.type.enum;

      expect(typeEnum).toContain('contains');
      expect(typeEnum).toContain('mentions');
      expect(typeEnum).toContain('links_to');
      expect(typeEnum).toContain('similar');
      expect(typeEnum).toContain('parent_child');
      expect(typeEnum).toContain('co_occurs');
      expect(typeEnum).toContain('navigation');
    });

    it('should validate fileCount as non-negative integer', () => {
      const fileCount = schemas.graph.properties.metadata.properties.source.properties.fileCount;

      expect(fileCount.type).toBe('integer');
      expect(fileCount.minimum).toBe(0);
    });

    it('should validate totalNodes as non-negative integer', () => {
      const totalNodes = schemas.graph.properties.metadata.properties.source.properties.totalNodes;

      expect(totalNodes.type).toBe('integer');
      expect(totalNodes.minimum).toBe(0);
    });

    it('should validate totalEdges as non-negative integer', () => {
      const totalEdges = schemas.graph.properties.metadata.properties.source.properties.totalEdges;

      expect(totalEdges.type).toBe('integer');
      expect(totalEdges.minimum).toBe(0);
    });

    it('should validate version format', () => {
      const version = schemas.graph.properties.metadata.properties.version;

      expect(version.type).toBe('string');
      expect(version.pattern).toBeDefined();
      expect(version.pattern).toContain('\\d+\\.\\d+\\.\\d+');
    });

    it('should validate generated as ISO date-time', () => {
      const generated = schemas.graph.properties.metadata.properties.generated;

      expect(generated.type).toBe('string');
      expect(generated.format).toBe('date-time');
    });

    it('should allow additional properties in nodes data field', () => {
      const nodeSchema = schemas.graph.properties.nodes.items;

      expect(nodeSchema.properties.data).toBeDefined();
      expect(nodeSchema.properties.data.type).toBe('object');
      expect(nodeSchema.properties.data.additionalProperties).toBe(true);
    });

    it('should allow additional properties in edges data field', () => {
      const edgeSchema = schemas.graph.properties.edges.items;

      expect(edgeSchema.properties.data).toBeDefined();
      expect(edgeSchema.properties.data.type).toBe('object');
      expect(edgeSchema.properties.data.additionalProperties).toBe(true);
    });
  });

  describe('Document Schema (document-schema.json)', () => {
    it('should exist as a file', async () => {
      const filePath = path.join(SCHEMAS_DIR, 'document-schema.json');
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);
    });

    it('should be valid JSON Schema Draft 07', () => {
      assertValidSchema(schemas.document);
    });

    it('should have correct schema metadata', () => {
      expect(schemas.document.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(schemas.document.$id).toBeDefined();
      expect(schemas.document.title).toBe('Document');
      expect(schemas.document.description).toBeDefined();
    });

    it('should define root as object type', () => {
      expect(schemas.document.type).toBe('object');
    });

    it('should require essential document fields', () => {
      expect(schemas.document.required).toContain('path');
      expect(schemas.document.required).toContain('extension');
      expect(schemas.document.required).toContain('content');
      expect(schemas.document.required).toContain('frontmatter');
      expect(schemas.document.required).toContain('headings');
      expect(schemas.document.required).toContain('links');
    });

    it('should define path as string', () => {
      expect(schemas.document.properties.path.type).toBe('string');
    });

    it('should define extension with valid values', () => {
      const extension = schemas.document.properties.extension;

      expect(extension.type).toBe('string');
      expect(extension.enum).toContain('.md');
      expect(extension.enum).toContain('.mdx');
    });

    it('should define content as string', () => {
      expect(schemas.document.properties.content.type).toBe('string');
    });

    it('should define frontmatter as object', () => {
      expect(schemas.document.properties.frontmatter.type).toBe('object');
      expect(schemas.document.properties.frontmatter.additionalProperties).toBe(true);
    });

    it('should define optional frontmatter fields', () => {
      const frontmatter = schemas.document.properties.frontmatter.properties;

      expect(frontmatter.title).toBeDefined();
      expect(frontmatter.sidebar_label).toBeDefined();
      expect(frontmatter.description).toBeDefined();
      expect(frontmatter.content_type).toBeDefined();
    });

    it('should define headings as array', () => {
      expect(schemas.document.properties.headings.type).toBe('array');
      expect(schemas.document.properties.headings.items).toBeDefined();
    });

    it('should define heading structure', () => {
      const heading = schemas.document.properties.headings.items;

      expect(heading.type).toBe('object');
      expect(heading.required).toContain('level');
      expect(heading.required).toContain('text');
      expect(heading.properties.level.type).toBe('integer');
      expect(heading.properties.level.minimum).toBe(1);
      expect(heading.properties.level.maximum).toBe(6);
      expect(heading.properties.text.type).toBe('string');
    });

    it('should define links structure', () => {
      const links = schemas.document.properties.links;

      expect(links.type).toBe('object');
      expect(links.required).toContain('internal');
      expect(links.required).toContain('external');
    });

    it('should define internal links as array of strings', () => {
      const internal = schemas.document.properties.links.properties.internal;

      expect(internal.type).toBe('array');
      expect(internal.items.type).toBe('string');
    });

    it('should define external links as array of strings', () => {
      const external = schemas.document.properties.links.properties.external;

      expect(external.type).toBe('array');
      expect(external.items.type).toBe('string');
    });

    it('should validate external links as URLs', () => {
      const external = schemas.document.properties.links.properties.external;

      expect(external.items.format).toBe('uri');
    });

    it('should allow optional word count field', () => {
      expect(schemas.document.properties.wordCount).toBeDefined();
      expect(schemas.document.properties.wordCount.type).toBe('integer');
      expect(schemas.document.properties.wordCount.minimum).toBe(0);
    });
  });

  describe('Concept Schema (concept-schema.json)', () => {
    it('should exist as a file', async () => {
      const filePath = path.join(SCHEMAS_DIR, 'concept-schema.json');
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);
    });

    it('should be valid JSON Schema Draft 07', () => {
      assertValidSchema(schemas.concept);
    });

    it('should have correct schema metadata', () => {
      expect(schemas.concept.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(schemas.concept.$id).toBeDefined();
      expect(schemas.concept.title).toBe('Concepts');
      expect(schemas.concept.description).toBeDefined();
    });

    it('should define root as object type', () => {
      expect(schemas.concept.type).toBe('object');
    });

    it('should require metadata and topConcepts', () => {
      expect(schemas.concept.required).toContain('metadata');
      expect(schemas.concept.required).toContain('topConcepts');
    });

    it('should define metadata structure', () => {
      const metadata = schemas.concept.properties.metadata;

      expect(metadata.type).toBe('object');
      expect(metadata.required).toContain('totalConcepts');
      expect(metadata.required).toContain('extractionDate');
    });

    it('should validate totalConcepts as non-negative integer', () => {
      const totalConcepts = schemas.concept.properties.metadata.properties.totalConcepts;

      expect(totalConcepts.type).toBe('integer');
      expect(totalConcepts.minimum).toBe(0);
    });

    it('should validate extractionDate as ISO date-time', () => {
      const extractionDate = schemas.concept.properties.metadata.properties.extractionDate;

      expect(extractionDate.type).toBe('string');
      expect(extractionDate.format).toBe('date-time');
    });

    it('should define topConcepts as array', () => {
      expect(schemas.concept.properties.topConcepts.type).toBe('array');
      expect(schemas.concept.properties.topConcepts.items).toBeDefined();
    });

    it('should define concept structure', () => {
      const conceptItem = schemas.concept.properties.topConcepts.items;

      expect(conceptItem.type).toBe('object');
      expect(conceptItem.required).toContain('concept');
      expect(conceptItem.required).toContain('frequency');
      expect(conceptItem.required).toContain('fileCount');
    });

    it('should validate concept name as string', () => {
      const conceptItem = schemas.concept.properties.topConcepts.items;

      expect(conceptItem.properties.concept.type).toBe('string');
      expect(conceptItem.properties.concept.minLength).toBe(1);
    });

    it('should validate frequency as positive integer', () => {
      const conceptItem = schemas.concept.properties.topConcepts.items;

      expect(conceptItem.properties.frequency.type).toBe('integer');
      expect(conceptItem.properties.frequency.minimum).toBe(1);
    });

    it('should validate fileCount as positive integer', () => {
      const conceptItem = schemas.concept.properties.topConcepts.items;

      expect(conceptItem.properties.fileCount.type).toBe('integer');
      expect(conceptItem.properties.fileCount.minimum).toBe(1);
    });

    it('should define valid concept types', () => {
      const conceptItem = schemas.concept.properties.topConcepts.items;
      const typeEnum = conceptItem.properties.type.enum;

      expect(typeEnum).toContain('domain');
      expect(typeEnum).toContain('technical');
      expect(typeEnum).toContain('general');
    });

    it('should define valid concept categories', () => {
      const conceptItem = schemas.concept.properties.topConcepts.items;
      const categoryEnum = conceptItem.properties.category.enum;

      expect(categoryEnum).toContain('blockchain');
      expect(categoryEnum).toContain('arbitrum');
      expect(categoryEnum).toContain('technical');
      expect(categoryEnum).toContain('development');
    });

    it('should allow optional TF-IDF score', () => {
      const conceptItem = schemas.concept.properties.topConcepts.items;

      expect(conceptItem.properties.tfidf).toBeDefined();
      expect(conceptItem.properties.tfidf.type).toBe('number');
      expect(conceptItem.properties.tfidf.minimum).toBe(0);
    });

    it('should allow optional co-occurrence data', () => {
      const conceptItem = schemas.concept.properties.topConcepts.items;

      expect(conceptItem.properties.coOccurs).toBeDefined();
      expect(conceptItem.properties.coOccurs.type).toBe('array');
    });
  });

  describe('Analysis Schema (analysis-schema.json)', () => {
    it('should exist as a file', async () => {
      const filePath = path.join(SCHEMAS_DIR, 'analysis-schema.json');
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);
    });

    it('should be valid JSON Schema Draft 07', () => {
      assertValidSchema(schemas.analysis);
    });

    it('should have correct schema metadata', () => {
      expect(schemas.analysis.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(schemas.analysis.$id).toBeDefined();
      expect(schemas.analysis.title).toBe('Graph Analysis');
      expect(schemas.analysis.description).toBeDefined();
    });

    it('should define root as object type', () => {
      expect(schemas.analysis.type).toBe('object');
    });

    it('should require metadata, basic, and centrality', () => {
      expect(schemas.analysis.required).toContain('metadata');
      expect(schemas.analysis.required).toContain('basic');
      expect(schemas.analysis.required).toContain('centrality');
    });

    it('should define metadata structure', () => {
      const metadata = schemas.analysis.properties.metadata;

      expect(metadata.type).toBe('object');
      expect(metadata.required).toContain('version');
      expect(metadata.required).toContain('generated');
    });

    it('should define basic statistics structure', () => {
      const basic = schemas.analysis.properties.basic;

      expect(basic.type).toBe('object');
      expect(basic.required).toContain('totalNodes');
      expect(basic.required).toContain('totalEdges');
      expect(basic.required).toContain('density');
      expect(basic.required).toContain('avgDegree');
      expect(basic.required).toContain('isConnected');
      expect(basic.required).toContain('nodesByType');
      expect(basic.required).toContain('edgesByType');
    });

    it('should validate totalNodes as non-negative integer', () => {
      const totalNodes = schemas.analysis.properties.basic.properties.totalNodes;

      expect(totalNodes.type).toBe('integer');
      expect(totalNodes.minimum).toBe(0);
    });

    it('should validate totalEdges as non-negative integer', () => {
      const totalEdges = schemas.analysis.properties.basic.properties.totalEdges;

      expect(totalEdges.type).toBe('integer');
      expect(totalEdges.minimum).toBe(0);
    });

    it('should validate density as number between 0 and 1', () => {
      const density = schemas.analysis.properties.basic.properties.density;

      expect(density.type).toBe('number');
      expect(density.minimum).toBe(0);
      expect(density.maximum).toBe(1);
    });

    it('should validate avgDegree as non-negative number', () => {
      const avgDegree = schemas.analysis.properties.basic.properties.avgDegree;

      expect(avgDegree.type).toBe('number');
      expect(avgDegree.minimum).toBe(0);
    });

    it('should validate isConnected as boolean', () => {
      const isConnected = schemas.analysis.properties.basic.properties.isConnected;

      expect(isConnected.type).toBe('boolean');
    });

    it('should define nodesByType as object with integer values', () => {
      const nodesByType = schemas.analysis.properties.basic.properties.nodesByType;

      expect(nodesByType.type).toBe('object');
      expect(nodesByType.additionalProperties.type).toBe('integer');
      expect(nodesByType.additionalProperties.minimum).toBe(0);
    });

    it('should define edgesByType as object with integer values', () => {
      const edgesByType = schemas.analysis.properties.basic.properties.edgesByType;

      expect(edgesByType.type).toBe('object');
      expect(edgesByType.additionalProperties.type).toBe('integer');
      expect(edgesByType.additionalProperties.minimum).toBe(0);
    });

    it('should define centrality structure', () => {
      const centrality = schemas.analysis.properties.centrality;

      expect(centrality.type).toBe('object');
      expect(centrality.required).toContain('degree');
      expect(centrality.required).toContain('betweenness');
      expect(centrality.required).toContain('closeness');
    });

    it('should define centrality metric structure', () => {
      const degree = schemas.analysis.properties.centrality.properties.degree;

      expect(degree.type).toBe('object');
      expect(degree.required).toContain('values');
      expect(degree.properties.values.type).toBe('object');
      expect(degree.properties.values.additionalProperties.type).toBe('number');
      expect(degree.properties.values.additionalProperties.minimum).toBe(0);
    });

    it('should allow optional min/max/avg in centrality metrics', () => {
      const degree = schemas.analysis.properties.centrality.properties.degree;

      expect(degree.properties.max).toBeDefined();
      expect(degree.properties.min).toBeDefined();
      expect(degree.properties.avg).toBeDefined();
      expect(degree.properties.max.type).toBe('number');
      expect(degree.properties.min.type).toBe('number');
      expect(degree.properties.avg.type).toBe('number');
    });

    it('should validate betweenness centrality structure', () => {
      const betweenness = schemas.analysis.properties.centrality.properties.betweenness;

      expect(betweenness.type).toBe('object');
      expect(betweenness.required).toContain('values');
      expect(betweenness.properties.values.additionalProperties.minimum).toBe(0);
    });

    it('should validate closeness centrality structure', () => {
      const closeness = schemas.analysis.properties.centrality.properties.closeness;

      expect(closeness.type).toBe('object');
      expect(closeness.required).toContain('values');
      expect(closeness.properties.values.additionalProperties.minimum).toBe(0);
    });

    it('should allow optional communities section', () => {
      expect(schemas.analysis.properties.communities).toBeDefined();
      expect(schemas.analysis.properties.communities.type).toBe('object');
    });

    it('should allow optional hubs section', () => {
      expect(schemas.analysis.properties.hubs).toBeDefined();
      expect(schemas.analysis.properties.hubs.type).toBe('array');
    });

    it('should allow optional orphans section', () => {
      expect(schemas.analysis.properties.orphans).toBeDefined();
      expect(schemas.analysis.properties.orphans.type).toBe('array');
    });
  });

  describe('Schema Cross-Validation', () => {
    it('should have consistent version format across all schemas', () => {
      const graphVersion = schemas.graph.properties.metadata.properties.version.pattern;
      const analysisVersion = schemas.analysis.properties.metadata.properties.version.pattern;

      expect(graphVersion).toBe(analysisVersion);
    });

    it('should have consistent date-time format across all schemas', () => {
      const graphDate = schemas.graph.properties.metadata.properties.generated.format;
      const conceptDate = schemas.concept.properties.metadata.properties.extractionDate.format;
      const analysisDate = schemas.analysis.properties.metadata.properties.generated.format;

      expect(graphDate).toBe('date-time');
      expect(conceptDate).toBe('date-time');
      expect(analysisDate).toBe('date-time');
    });

    it('should have consistent node type enums between graph and analysis', () => {
      const graphNodeTypes = schemas.graph.properties.nodes.items.properties.type.enum;
      const expectedTypes = ['document', 'concept', 'section', 'directory', 'tag', 'navigation'];

      expectedTypes.forEach((type) => {
        expect(graphNodeTypes).toContain(type);
      });
    });

    it('should have consistent edge type enums', () => {
      const graphEdgeTypes = schemas.graph.properties.edges.items.properties.type.enum;
      const expectedTypes = [
        'contains',
        'mentions',
        'links_to',
        'similar',
        'parent_child',
        'co_occurs',
        'navigation',
      ];

      expectedTypes.forEach((type) => {
        expect(graphEdgeTypes).toContain(type);
      });
    });

    it('should use consistent integer validation for counts', () => {
      const graphFileCount =
        schemas.graph.properties.metadata.properties.source.properties.fileCount;
      const analysisNodeCount = schemas.analysis.properties.basic.properties.totalNodes;

      expect(graphFileCount.type).toBe('integer');
      expect(graphFileCount.minimum).toBe(0);
      expect(analysisNodeCount.type).toBe('integer');
      expect(analysisNodeCount.minimum).toBe(0);
    });
  });

  describe('Schema Documentation', () => {
    it('should include description in graph schema', () => {
      expect(schemas.graph.description).toBeDefined();
      expect(schemas.graph.description.length).toBeGreaterThan(0);
    });

    it('should include description in document schema', () => {
      expect(schemas.document.description).toBeDefined();
      expect(schemas.document.description.length).toBeGreaterThan(0);
    });

    it('should include description in concept schema', () => {
      expect(schemas.concept.description).toBeDefined();
      expect(schemas.concept.description.length).toBeGreaterThan(0);
    });

    it('should include description in analysis schema', () => {
      expect(schemas.analysis.description).toBeDefined();
      expect(schemas.analysis.description.length).toBeGreaterThan(0);
    });

    it('should include examples in schemas where helpful', () => {
      // At least one schema should have examples
      const hasExamples = Object.values(schemas).some((schema) => schema.examples !== undefined);
      expect(hasExamples).toBe(true);
    });
  });
});
