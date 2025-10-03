# Schema Structure Tests - RED Phase (TDD)

## Overview

This directory contains **FAILING** unit tests for JSON Schema structure and validation. These tests are part of the RED phase of Test-Driven Development (TDD) and validate the structure and completeness of JSON Schema files.

## Test Files

### schemas.test.js

Comprehensive tests for all JSON Schema files covering:

**Graph Schema (graph-schema.json) - 22 tests**

_Basic Structure_

- File existence
- Valid JSON Schema Draft 07 compliance
- Correct schema metadata ($schema, $id, title, description)
- Root object type definition

_Required Fields_

- Metadata, nodes, and edges requirements
- Metadata properties (version, generated, source)
- Source metadata structure (inputPath, fileCount, totalNodes, totalEdges)

_Nodes_

- Array structure for nodes
- Node object structure with required fields (id, type, label)
- Valid node types enum (document, concept, section, directory, tag, navigation)
- Additional properties in node data field

_Edges_

- Array structure for edges
- Edge object structure with required fields (id, source, target, type)
- Valid edge types enum (contains, mentions, links_to, similar, parent_child, co_occurs, navigation)
- Additional properties in edge data field

_Validation Rules_

- Non-negative integers for counts (fileCount, totalNodes, totalEdges)
- Version format validation (semver pattern)
- ISO date-time format for timestamps

**Document Schema (document-schema.json) - 15 tests**

_Basic Structure_

- File existence
- Valid JSON Schema Draft 07 compliance
- Schema metadata
- Root object type

_Required Fields_

- Essential fields (path, extension, content, frontmatter, headings, links)
- Path as string
- Valid extension enum (.md, .mdx)
- Content as string

_Frontmatter_

- Object structure with additional properties
- Optional standard fields (title, sidebar_label, description, content_type)

_Headings_

- Array structure
- Heading object (level, text)
- Level validation (1-6 integer range)

_Links_

- Structure with internal and external arrays
- String arrays for both types
- URI format validation for external links

_Optional Fields_

- Word count as non-negative integer

**Concept Schema (concept-schema.json) - 13 tests**

_Basic Structure_

- File existence
- Valid JSON Schema Draft 07 compliance
- Schema metadata
- Root object type

_Required Fields_

- Metadata and topConcepts requirements

_Metadata_

- Structure with totalConcepts and extractionDate
- Non-negative integer for totalConcepts
- ISO date-time format for extractionDate

_Concepts Array_

- Array structure for topConcepts
- Concept object structure (concept, frequency, fileCount)
- String with minimum length for concept name
- Positive integers for frequency and fileCount
- Valid concept types enum (domain, technical, general)
- Valid concept categories enum (blockchain, arbitrum, technical, development)

_Optional Fields_

- TF-IDF score as non-negative number
- Co-occurrence data as array

**Analysis Schema (analysis-schema.json) - 22 tests**

_Basic Structure_

- File existence
- Valid JSON Schema Draft 07 compliance
- Schema metadata
- Root object type

_Required Fields_

- Metadata, basic, and centrality sections

_Basic Statistics_

- Required fields (totalNodes, totalEdges, density, avgDegree, isConnected, nodesByType, edgesByType)
- Non-negative integers for counts
- Density between 0 and 1
- Non-negative number for avgDegree
- Boolean for isConnected
- Object with integer values for nodesByType
- Object with integer values for edgesByType

_Centrality Metrics_

- Structure with degree, betweenness, closeness
- Metric structure with required values field
- Non-negative numbers in values objects
- Optional min/max/avg fields

_Optional Sections_

- Communities object
- Hubs array
- Orphans array

**Cross-Validation (5 tests)**

- Consistent version format across schemas
- Consistent date-time format across schemas
- Consistent node type enums
- Consistent edge type enums
- Consistent integer validation for counts

**Schema Documentation (5 tests)**

- Description fields in all schemas
- Examples in schemas where helpful

**Total: 82 test cases**

## Schema Files to Create

All schemas must be created in `/schemas/` directory:

### 1. graph-schema.json

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://arbitrum.io/schemas/graph-schema.json",
  "title": "Knowledge Graph",
  "description": "Schema for documentation knowledge graph structure",
  "type": "object",
  "required": ["metadata", "nodes", "edges"],
  "properties": {
    "metadata": { ... },
    "nodes": { ... },
    "edges": { ... }
  }
}
```

### 2. document-schema.json

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://arbitrum.io/schemas/document-schema.json",
  "title": "Document",
  "description": "Schema for extracted documentation files",
  "type": "object",
  "required": ["path", "extension", "content", "frontmatter", "headings", "links"],
  "properties": { ... }
}
```

### 3. concept-schema.json

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://arbitrum.io/schemas/concept-schema.json",
  "title": "Concepts",
  "description": "Schema for extracted concepts data",
  "type": "object",
  "required": ["metadata", "topConcepts"],
  "properties": { ... }
}
```

### 4. analysis-schema.json

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://arbitrum.io/schemas/analysis-schema.json",
  "title": "Graph Analysis",
  "description": "Schema for graph analysis results",
  "type": "object",
  "required": ["metadata", "basic", "centrality"],
  "properties": { ... }
}
```

## Test Expectations

### All tests will FAIL because:

1. **Schema files don't exist**

   - `/schemas/graph-schema.json` - Not created
   - `/schemas/document-schema.json` - Not created
   - `/schemas/concept-schema.json` - Not created
   - `/schemas/analysis-schema.json` - Not created

2. **beforeAll() will fail**
   - Cannot load non-existent schema files
   - JSON parsing will fail

## Schema Requirements

Each schema must:

1. **Follow JSON Schema Draft 07 specification**

   - Include `$schema` field
   - Include `$id` field
   - Include `title` and `description`

2. **Define clear structure**

   - Specify `type` for all fields
   - Mark required fields explicitly
   - Use enums for constrained values

3. **Include validation rules**

   - Minimum/maximum for numbers
   - Pattern matching for strings
   - Format validation (date-time, uri, etc.)

4. **Support additional properties where needed**

   - Allow flexibility in data fields
   - Strict on required structure

5. **Include documentation**
   - Description for each major field
   - Examples for complex structures

## Node Types (graph-schema.json)

Must support these node types:

- `document` - Documentation files
- `concept` - Extracted concepts
- `section` - Document sections
- `directory` - Directory groupings
- `tag` - Content tags
- `navigation` - Navigation items

## Edge Types (graph-schema.json)

Must support these edge types:

- `contains` - Hierarchical containment
- `mentions` - Concept mentions
- `links_to` - Document links
- `similar` - Similarity relationships
- `parent_child` - Parent-child relationships
- `co_occurs` - Concept co-occurrence
- `navigation` - Navigation relationships

## Validation Patterns

### Version Format

```
Pattern: ^\d+\.\d+\.\d+$
Example: "1.0.0", "2.1.3"
```

### Date-Time Format

```
Format: date-time (ISO 8601)
Example: "2024-10-02T15:30:00Z"
```

### URI Format

```
Format: uri
Example: "https://example.com/path"
```

## Running Tests

```shell
# Run schema tests
npm test -- test/unit/schemas/schemas.test.js

# Run with coverage
npm test -- --coverage test/unit/schemas/

# Run in watch mode
npm test -- --watch test/unit/schemas/
```

## Expected Initial Results

```
FAIL test/unit/schemas/schemas.test.js

Tests: 82 failed, 82 total
Time: ~1s
```

This is EXPECTED and CORRECT for the RED phase of TDD.

## Next Steps (GREEN Phase)

1. **Create schemas directory**

   ```shell
   mkdir -p schemas
   ```

2. **Create each schema file**

   - Start with graph-schema.json
   - Follow with document-schema.json
   - Then concept-schema.json
   - Finally analysis-schema.json

3. **Run tests iteratively**

   - Create basic structure first
   - Run tests to see what's missing
   - Add required fields
   - Add validation rules
   - Add descriptions and examples

4. **Validate schemas**
   - Use online JSON Schema validators
   - Test with sample data
   - Ensure all tests pass

## Test Coverage Goals

Since these are schema structure tests, coverage metrics focus on:

- Complete field definition coverage
- Validation rule coverage
- Cross-schema consistency

## Test Utilities Used

- `assertionHelpers.js` - Custom assertions including `assertValidSchema()`
- Native Jest assertions for structure validation
- File system promises for schema loading
