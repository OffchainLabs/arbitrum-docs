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

#### Core Commands (Original)

- **`npm start`**: Run the complete analysis pipeline with memory optimizations (recommended)
- **`npm run help`**: Display help and available options
- **`npm run serve`**: Start a local web server to view visualizations

#### Enhanced CLI Commands (New)

- **`npm run topic <topic>`**: Filter documentation by specific topics (e.g., "Arbitrum chain", "Node", "How-tos")
- **`npm run keyword <keywords...>`**: Search documentation using keywords with logical operators
- **`npm run analyze:topic <topic>`**: Alias for topic analysis
- **`npm run analyze:keyword <keywords...>`**: Alias for keyword analysis

### Quick Examples

```bash
# Original command - analyze everything
npm start

# New - Analyze Arbitrum chain documentation
npm run topic "Arbitrum chain" -- --fuzzy

# New - Search for node and validator docs
npm run keyword node validator -- --operator OR

# New - Find all how-to guides
npm run topic "How-tos" -- --format html
```

### Command Line Options

#### Basic CLI Options

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
```

#### Topic Analyzer Options

```bash
npm run topic <topic> [options]

Options:
  -i, --input <path>    Input directory (default: docs)
  -o, --output <path>   Output directory (default: ./dist)
  -v, --verbose         Enable verbose logging
  -f, --format <type>   Output format: html, json, markdown, all (default: all)
  --use-cache           Use cached extraction results (default: true)
  --case-sensitive      Use case-sensitive matching
  --fuzzy               Enable fuzzy matching for broader results
  --threshold <n>       Minimum relevance score 0-1 (default: 0.3)
```

#### Keyword Analyzer Options

```bash
npm run keyword <keywords...> [options]

Options:
  -i, --input <path>    Input directory (default: docs)
  -o, --output <path>   Output directory (default: ./dist)
  -v, --verbose         Enable verbose logging
  -f, --format <type>   Output format: html, json, markdown, csv, all (default: all)
  --use-cache           Use cached extraction results (default: true)
  --operator <op>       Logical operator: AND, OR (default: OR)
  --include-related     Include related concepts and documents
  --depth <n>           Depth of related content 1-3 (default: 1)
  --min-score <n>       Minimum relevance score 0-1 (default: 0.2)
  --max-results <n>     Maximum number of results (default: 100)
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
- **`similarity-matrix.json`**: Document similarity calculations

### Topic Analysis Outputs (New)

When you run topic analysis, the following files are generated:

- **`knowledge-graph-visualization-{topic}.html`**: Interactive filtered visualization
- **`topic-analysis-{topic}.json`**: Complete analysis data in JSON format
- **`topic-report-{topic}.md`**: Markdown report with findings and recommendations

### Keyword Analysis Outputs (New)

When you run keyword analysis, the following files are generated:

- **`knowledge-graph-visualization-{keywords}.html`**: Interactive filtered visualization
- **`keyword-analysis-{keywords}.json`**: Complete analysis data in JSON format
- **`keyword-report-{keywords}.md`**: Markdown report with findings
- **`keyword-matches-{keywords}.csv`**: CSV file with matching documents

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

### Topic-Specific Analysis (New)

Use the enhanced CLI features for:

- **Deep-dive analysis**: Focus on specific areas like "Arbitrum chain" or "Node" documentation
- **How-to coverage**: Analyze completeness of tutorial and guide documentation
- **Keyword tracking**: Monitor coverage of important terms and concepts
- **Targeted improvements**: Generate focused reports for specific documentation areas

Example workflows:

```bash
# Analyze Arbitrum chain documentation health
npm run topic "Arbitrum chain" -- --format markdown

# Find all security-related documentation
npm run keyword security vulnerability audit -- --operator OR

# Check how-to guide coverage
npm run topic "How-tos" -- --fuzzy --threshold 0.4
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
- Consider filtering to specific document subdirectories
- Run analysis on subsets of content for iterative improvements
- Use topic/keyword filtering to focus on specific areas: `npm run topic "specific area"`

**Memory usage:**

- Default command uses up to 8GB heap space with garbage collection optimizations
- Large repositories (500+ files) may use 1-2GB of memory during processing
- Processing automatically optimizes similarity calculations for datasets with 500+ concepts
- Topic and keyword analysis use cached data for faster processing

**Optimizing enhanced CLI features:**

- Use `--use-cache` (default) to leverage existing extraction results
- Adjust `--threshold` to balance result quality vs. quantity
- Use `--max-results` to limit output size for keyword searches
- Enable `--fuzzy` matching cautiously as it may include less relevant results

### Getting Help

For issues specific to:

- **Configuration**: Adjust thresholds in `config/thresholds.js` (centralized)
- **Concept extraction**: Review `src/extractors/conceptExtractor.js` and adjust domain terms
- **Graph structure**: Modify parameters in `config/thresholds.js` or `src/builders/graphBuilder.js`
- **Visualization**: Check browser console for Cytoscape.js errors
- **Performance**: Monitor memory usage and consider batch processing
- **Topic analysis**: Run with `--verbose` flag to see detailed filtering logs
- **Keyword search**: Try different operators (AND/OR) and adjust thresholds
- **No results**: Use `--fuzzy` matching and lower `--threshold` values

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
