# Documentation Knowledge Graph Builder

A toolset for analyzing, visualizing, and understanding the structure and relationships within OCL's documentation repositories. Built specifically for Docusaurus-based documentation projects.
Creates interactive knowledge graphs that reveal content connections, identify gaps, and inform restructuring decisions.

## Important

This toolset is memory-greedy, it'll cost your box beaucoup resources.
Make sure you run it either on a monster, or, if it's a laptop, quit the usual memory gobblers like chrome-based browsers, Docker, etc.

## Purpose

This toolset addresses challenges in OCL's documentation project:

- **Content Discovery**: Understanding what documentation exists and how it's organized
- **Relationship Mapping**: Identifying connections between concepts and documents
- **Gap Analysis**: Finding orphaned content and missing connections
- **Structure Optimization**: Data-driven insights for improving navigation and organization
- **Quality Assessment**: Quantitative metrics for documentation health

## Features

- 🔍 **Comprehensive Analysis**: Scans all MDX/Markdown files with frontmatter parsing
- 🧠 **Concept Extraction**: Uses NLP to identify key concepts and terminology
- 📊 **Knowledge Graph**: Builds interactive networks showing document relationships
- 📈 **Quality Metrics**: Centrality analysis, connectivity scores, and structural insights
- 🎨 **Interactive Visualization**: Web-based graph explorer with filtering and search
- 📋 **Detailed Reports**: JSON/CSV exports and markdown analysis reports

## Installation

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- A Docusaurus-based documentation repository

### Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Generate initial analysis** (creates the `dist/` directory with visualizations):

   ```bash
   npm start
   ```

3. **Verify installation**:

   ```bash
   npm run help
   ```

   Or directly:

   ```bash
   node src/index.js --help
   ```

## Usage

### Basic Analysis

Run the complete analysis pipeline on your documentation:

```bash
npm start
```

This will:

1. Scan all MDX/MD files in your `docs/` directory
2. Extract concepts and build the knowledge graph
3. Generate analysis reports and visualizations
4. Output all results to the `dist/` directory

> **Note**: The `dist/` directory contains generated files and is not tracked in git. You need to run the analysis commands to generate the visualization files and reports locally.

### Available Commands

- **`npm start`**: Run the complete analysis pipeline with memory optimizations (recommended)
- **`npm run start:basic`**: Run analysis without memory optimizations
- **`npm run start:optimized`**: Run with optimized visualization for large graphs
- **`npm run help`**: Display help and available options
- **`npm run serve`**: Start a local web server to view visualizations (port 8080)
- **`npm run report`**: Generate timestamped issue report after analysis
- **`npm test`**: Run the test suite
- **`npm run test:watch`**: Run tests in watch mode
- **`npm run test:coverage`**: Run tests with coverage report
- **`npm run test:unit`**: Run only unit tests
- **`npm run test:integration`**: Run only integration tests

### Quick Examples

```bash
# Run complete analysis
npm start

# Run with custom input/output directories
node src/index.js -i /path/to/docs -o /path/to/output

# Generate timestamped issue report
npm run report

# View results in browser
npm run serve
# Then open http://localhost:8080/knowledge-graph-visualization.html
```

### Command Line Options

For more control, use the CLI directly:

```bash
# Run with custom input/output directories
node src/index.js -i /path/to/docs -o /path/to/output

# Run with verbose logging
node src/index.js --verbose

# Skip certain phases for faster iteration
node src/index.js --skip-concepts --skip-analysis

# Run only visualization (useful after making changes)
node src/index.js --skip-extraction --skip-concepts --skip-analysis

# Generate issue report
node src/index.js --issue-report

# Use optimized visualization for large graphs
node src/index.js --optimized-viz
```

All available options can be viewed with:

```bash
npm run help
```

### Configuration

The tool automatically detects:

- **Documentation directory**: `docs/` (configurable in `src/main.js`)
- **Output directory**: `dist/` (configurable)
- **File patterns**: `*.md`, `*.mdx` files
- **Frontmatter parsing**: YAML frontmatter extraction

### Customization

#### Adjusting Thresholds and Configuration

Edit `config/thresholds.js` to modify:

- **Similarity thresholds**: Control concept merging and edge creation (0.3, 0.6, 0.75)
- **Graph analysis**: Community detection and clustering parameters
- **Quality scoring**: Weights for different quality factors
- **Performance**: Cache hit rates and chunk sizes

All magic numbers are now centralized in this single configuration file.

#### Adjusting Concept Extraction

Edit `src/extractors/conceptExtractor.js` to modify:

- **Domain-specific terms**: Add industry-specific vocabulary
- **Stop words**: Filter out irrelevant terms
- **Weight algorithms**: Adjust concept importance scoring

The module now uses `src/utils/similarity.js` for all similarity calculations.

#### Modifying Graph Structure

Edit `src/builders/graphBuilder.js` to change:

- **Connection thresholds**: Uses centralized thresholds from `config/thresholds.js`
- **Node types**: Different categories of content nodes
- **Edge weights**: Relationship strength calculations

#### Using Similarity Utilities

The `src/utils/similarity.js` module provides:

- **Token-based similarity**: For comparing documents and phrases
- **N-gram similarity**: For comparing terms and words
- **Fast pre-filtering**: Quick rejection of dissimilar terms
- **Caching**: LRU cache for n-gram calculations (1000 entries)

Example usage:

```javascript
import { similarity } from './src/utils/similarity.js';

// Check if terms are similar enough to merge
const shouldMerge = similarity.areSimilarTerms('blockchain', 'blockchains');

// Calculate similarity score
const score = similarity.calculateNgramSimilarity('ethereum', 'ether');

// Fast pre-check before expensive calculations
if (similarity.fastSimilarityCheck(term1, term2)) {
  // Proceed with detailed analysis
}
```

## Output Files

After running the analysis, check the `dist/` directory for:

### Core Analysis Outputs (Original)

#### Primary Deliverables

- **`knowledge-graph-visualization.html`**: Interactive graph explorer
- **`PHASE1_ANALYSIS_REPORT.md`**: Comprehensive analysis report
- **`graph-data.json`**: Complete graph structure for external tools

#### Data Exports

- **`concepts-analysis.json`**: Detailed concept metrics
- **`top-concepts.csv`**: Most important concepts (spreadsheet-friendly)
- **`documents-metadata.json`**: File inventory with extracted metadata

#### Technical Files

- **`extracted-concepts.json`**: Raw concept extraction results
- **`extracted-documents.json`**: Raw document extraction results
- **`similarity-matrix.json`**: Document similarity calculations (when generated)

#### Timestamped Reports

When you run with `--issue-report` or `npm run report`:

- **`ANALYSIS_REPORT_{timestamp}.md`**: Timestamped comprehensive analysis report

## Understanding the Results

### Knowledge Graph Visualization

Open `dist/knowledge-graph-visualization.html` in your browser to:

- **Explore connections**: Click nodes to see related documents
- **Filter by type**: Show only specific document categories
- **Search concepts**: Find documents containing specific terms
- **Adjust layout**: Different visualization algorithms

### Analysis Report

The `PHASE1_ANALYSIS_REPORT.md` contains:

- **Document inventory**: Complete file catalog with metadata
- **Concept analysis**: Most important terms and their connections
- **Quality metrics**: Overall documentation health scores
- **Recommendations**: Specific improvement suggestions
- **Hub analysis**: Documents that serve as connection points

### Quality Metrics

The tool calculates several key metrics:

- **Connectivity Score**: How well documents link to each other
- **Concept Coverage**: Breadth of topics addressed
- **Centrality Measures**: Which documents/concepts are most important
- **Orphan Detection**: Content that lacks connections

## Use Cases

### Documentation Restructuring

Use the knowledge graph to:

- Identify natural topic clusters for navigation reorganization
- Find orphaned content that needs better integration
- Discover missing connections between related concepts
- Optimize hub pages and landing pages

### Content Strategy

Leverage the analysis for:

- Gap identification in coverage areas
- Redundancy detection and consolidation opportunities
- Concept relationship mapping for cross-references
- User journey optimization based on natural content flows

### Quality Improvement

Apply insights to:

- Strengthen weak connections between related topics
- Improve discoverability of isolated content
- Balance content distribution across categories
- Enhance internal linking strategies

### Advanced Analysis

Use command-line options for targeted analysis:

- **Phase control**: Skip specific phases for faster iteration
- **Custom directories**: Analyze specific subdirectories or external documentation
- **Issue reporting**: Generate detailed analysis reports with recommendations
- **Optimized visualization**: Handle large documentation sets efficiently

Example workflows:

```bash
# Analyze specific directory
node src/index.js -i /path/to/specific/docs -o ./specific-analysis

# Generate comprehensive report
npm run report

# Fast iteration - skip expensive phases
node src/index.js --skip-concepts --verbose

# Handle large documentation sets
node src/index.js --optimized-viz
```

## Technical Details

### Architecture

The toolset consists of several modular components organized following Single Responsibility Principle:

#### Core Pipeline

- **Document Extractor** (`src/extractors/documentExtractor.js`): Scans and parses MDX/Markdown files with frontmatter
- **Concept Extractor** (`src/extractors/conceptExtractor.js`): NLP-based terminology identification using natural library
- **Graph Builder** (`src/builders/graphBuilder.js`): Network construction and relationship mapping
- **Graph Analyzer** (`src/analyzers/graphAnalyzer.js`): Centrality metrics, connectivity, and quality assessment
- **Visualizers** (`src/visualizers/`): Interactive web-based graph rendering

#### Supporting Modules (Recently Refactored)

- **Similarity Utilities** (`src/utils/similarity.js`): Centralized string similarity algorithms with caching
  - Token-based Jaccard similarity for documents
  - Character n-gram similarity for terms
  - Fast pre-filtering for performance
  - LRU cache for n-gram calculations
- **Thresholds Configuration** (`config/thresholds.js`): Centralized magic numbers and tuning parameters
  - Similarity thresholds (0.3, 0.6, 0.75)
  - Graph analysis parameters
  - Quality scoring weights
  - Performance optimization settings
- **Issue Reporter** (`src/reporters/IssueReporter.js`): Comprehensive analysis report generation
  - Executive summaries
  - Content quality assessment
  - Structural analysis
  - Coverage gap detection
  - Navigation evaluation

#### Benefits of Modular Architecture

- **Maintainability**: Each module has a single, well-defined responsibility
- **Testability**: Components can be tested in isolation (99.5% test success rate)
- **Reusability**: Similarity utilities and configuration used across multiple modules
- **Performance**: Centralized caching and optimizations
- **Configuration**: Single source of truth for all tuning parameters

### Dependencies

Key libraries used:

- **Natural**: NLP processing for concept extraction
- **Gravis**: Graph analysis and metrics calculation
- **Cytoscape.js**: Interactive graph visualization
- **Gray-matter**: Frontmatter parsing
- **Glob**: File pattern matching

### Performance

Typical processing times:

- **Small repos** (50-100 files): 10-30 seconds
- **Medium repos** (200-500 files): 1-3 minutes
- **Large repos** (500+ files): 3-10 minutes

Memory usage scales with repository size and complexity.

## Troubleshooting

### Common Issues

**"No documentation files found"**

- Check that `docs/` directory exists and contains `.md` or `.mdx` files
- Verify file permissions allow reading

**"Concept extraction failed"**

- Ensure files contain readable text content
- Check for malformed frontmatter that might cause parsing errors

**"Graph visualization not loading"**

- Open browser developer tools to check for JavaScript errors
- Ensure the HTML file is being served from a web server (not file://)

### Performance Issues

**Slow processing on large repositories:**

- The default `npm start` command includes memory optimizations for large datasets
- If experiencing memory issues, try `npm run start:basic` for simpler analysis
- Use `--skip-concepts` or `--skip-analysis` to skip expensive phases during iteration
- Consider analyzing subdirectories separately using `-i` option
- Use `--optimized-viz` for large graphs (500+ nodes)

**Memory usage:**

- Default command uses up to 8GB heap space with garbage collection optimizations
- Large repositories (500+ files) may use 1-2GB of memory during processing
- Processing automatically optimizes similarity calculations for datasets with 500+ concepts
- Memory usage peaks during concept extraction and graph building phases

**Optimization tips:**

- Skip phases you don't need with `--skip-extraction`, `--skip-concepts`, etc.
- Use `--verbose` to monitor which phases are taking the most time
- Run analysis incrementally on subdirectories for very large codebases
- Use `--optimized-viz` to enable chunked loading for large visualizations

### Getting Help

For issues specific to:

- **Configuration**: Adjust thresholds in `config/thresholds.js` (centralized)
- **Concept extraction**: Review `src/extractors/conceptExtractor.js` and adjust domain terms
- **Graph structure**: Modify parameters in `config/thresholds.js` or `src/builders/graphBuilder.js`
- **Visualization**: Check browser console for Cytoscape.js errors
- **Performance**: Use `--verbose` flag and skip expensive phases during iteration
- **Memory issues**: Try `npm run start:basic` or analyze subdirectories separately
- **Empty results**: Check input directory path and file patterns

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- test/unit/extractors/conceptExtractor.test.js

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage

Current test status:

- **Test Suite**: 99.5% passing (197 out of 198 tests)
- **Unit Tests**: Comprehensive coverage for extractors, builders, and utilities
- **Integration Tests**: Available in `test/integration/`

Key test files:

- `test/unit/extractors/conceptExtractor.test.js`: Concept extraction and NLP processing
- `test/unit/extractors/documentExtractor.test.js`: Document parsing and metadata extraction
- `test/unit/builders/graphBuilder.test.js`: Graph construction and relationships
- `test/unit/utils/similarity.test.js`: Similarity calculation algorithms

## Recent Improvements

### Code Quality Enhancements (2025)

Recent refactoring has significantly improved code quality and maintainability:

1. **Centralized Configuration** (`config/thresholds.js`)

   - Eliminated magic numbers scattered across 4+ files
   - Single source of truth for all tuning parameters
   - Easy experimentation and optimization

2. **Similarity Utilities** (`src/utils/similarity.js`)

   - Consolidated duplicate code from 4 files
   - Added LRU caching for n-gram calculations
   - Performance improvements through optimized algorithms
   - Reduced code duplication by ~500 lines

3. **Modular Architecture**

   - Extracted IssueReporter from monolithic index.js
   - Improved Single Responsibility Principle compliance
   - Better testability and maintainability
   - Reduced complexity in core orchestration

4. **Test Suite Improvements**
   - Fixed API mismatches in test expectations
   - Improved test reliability (99.5% success rate)
   - Better coverage of edge cases
   - Consistent test patterns across modules

## Contributing

This toolset is designed to be extensible and customizable for different documentation projects. Key areas for enhancement:

- Additional NLP techniques for concept extraction
- Alternative graph layout algorithms
- Integration with documentation platforms beyond Docusaurus
- Real-time analysis for continuous documentation improvement

## License

This project is part of the Arbitrum documentation toolchain and follows the same licensing terms as the parent repository.
