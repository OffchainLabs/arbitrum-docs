# Documentation Knowledge Graph Builder

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](./package.json)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](./package.json)
[![Tests](https://img.shields.io/badge/tests-99.5%25%20passing-brightgreen.svg)](#testing)
[![Coverage](https://img.shields.io/badge/coverage-%3E80%25-brightgreen.svg)](#testing)
[![MCP Server](https://img.shields.io/badge/MCP%20Server-v2.0.0-purple.svg)](./mcp-server)

A sophisticated AI-powered toolset for analyzing, visualizing, and understanding the structure and relationships within technical documentation repositories. Built specifically for Docusaurus-based projects with advanced search capabilities and interactive analysis tools.

Creates comprehensive knowledge graphs that reveal content connections, identify quality issues, and provide actionable insights for documentation improvement.

## Important

⚠️ **Resource Requirements**: This toolset is memory-intensive and requires significant system resources.

- **Recommended**: 8GB+ RAM available for analysis
- **Before running**: Close memory-heavy applications (Chrome, Docker, etc.)
- **Large repositories** (500+ files): Use `npm start` for memory optimizations

## Quick Start: Using the MCP Server

**Want to use the 8 AI-powered documentation analysis tools in Claude Code?**

Follow the [ONBOARDING.md](./ONBOARDING.md) guide for a zero-configuration setup:

```bash
# Clone the repo (if you haven't already)
git clone https://github.com/OffchainLabs/arbitrum-docs.git
cd arbitrum-docs
git checkout documentation-graph

# Run the automated setup script
cd documentation-graph
./scripts/setup-docs-graph.sh

# Wait ~10-12 minutes, then restart Claude Code
# You'll have 8 MCP tools available instantly!
```

The setup script handles everything automatically: dependency installation, analysis generation, and MCP server configuration.

**Tools you'll get:**

- Find duplicate content across docs
- Detect scattered topics and fragmentation
- Get consolidation recommendations
- Compare documents for overlaps
- Find similar documents
- Analyze topic distribution
- Find orphaned content
- Suggest canonical references

See [mcp-server/README.md](./mcp-server/README.md) for detailed tool documentation.

## Purpose

This toolset addresses challenges in OCL's documentation project:

- **Content Discovery**: Understanding what documentation exists and how it's organized
- **Relationship Mapping**: Identifying connections between concepts and documents
- **Gap Analysis**: Finding orphaned content and missing connections
- **Structure Optimization**: Data-driven insights for improving navigation and organization
- **Quality Assessment**: Quantitative metrics for documentation health

## Features

### Core Analysis

- 🔍 **Comprehensive Analysis**: Scans all MDX/Markdown files with frontmatter parsing and sidebar integration
- 🧠 **Advanced NLP Processing**: Multi-layer concept extraction (single words + technical phrases)
- 🔗 **Knowledge Graph Construction**: Interactive networks with 6+ node types and 7+ edge types
- 📊 **Quality Metrics**: Centrality analysis, connectivity scores, and structural health assessment
- 🎨 **Interactive Visualization**: Web-based Cytoscape.js explorer with filtering, search, and multiple layouts

### Search & Discovery (v1.2.0)

- 🎯 **Full-Text Search**: Inverted index with BM25 ranking (~11,300 unique terms)
- 🔤 **Phrase Extraction**: Multi-word technical phrase detection (2-4 words)
- ✨ **Fuzzy Matching**: Typo tolerance with Jaccard similarity and abbreviation expansion
- 🚀 **Layered Search Strategy**: Exact → Fuzzy → Phrase → Full-text fallback (<500ms)

### AI Integration

- 🤖 **MCP Server Integration**: Production-ready Model Context Protocol server (v2.0.0)
- 🔧 **7 Interactive Tools**: Duplication detection, topic scattering, consolidation recommendations
- 💾 **Smart Caching**: LRU cache with predictive prefetching and pattern learning
- ⚡ **Performance Optimized**: <20 seconds per query, <200ms fuzzy matching

### Outputs & Reports

- 📋 **Comprehensive Reports**: Markdown analysis, JSON/CSV exports, timestamped issue reports
- 📈 **Visual Analytics**: Interactive graph with hub analysis and community detection
- 🔄 **Auto-Refresh**: File watching with automatic data reload on changes

## Installation

### Prerequisites

- **Node.js**: Version 16.0.0 or higher (ES modules support required)
- **Memory**: 8GB+ RAM available for analysis (4GB minimum for small repos)
- **Storage**: ~100MB for dependencies + variable for analysis outputs
- **Target**: Docusaurus-based documentation repository with MDX/Markdown files

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

#### Core Analysis

- **`npm start`**: 🚀 Run complete analysis pipeline with memory optimizations (8GB heap, **recommended**)
- **`npm run start:basic`**: Run analysis without memory optimizations (for smaller repos)
- **`npm run start:optimized`**: Run with optimized visualization for large graphs (500+ files)
- **`npm run help`**: Display help and all available CLI options

#### Visualization & Reports

- **`npm run serve`**: 🌐 Start local web server for visualizations (http://localhost:8080)
- **`npm run report`**: 📊 Generate timestamped comprehensive issue report

#### Testing & Quality

- **`npm test`**: 🧪 Run complete test suite (720+ tests, 99.5% pass rate)
- **`npm run test:coverage`**: 📈 Run tests with coverage report (80%+ target)
- **`npm run test:watch`**: 👀 Run tests in watch mode for development
- **`npm run test:fuzzy`**: Test fuzzy matching algorithms
- **`npm run test:phrase`**: Test phrase extraction features
- **`npm run test:fulltext`**: Test full-text search functionality

#### MCP Server Integration

- **`cd mcp-server && npm start`**: 🤖 Start Model Context Protocol server for AI integration
- **`cd mcp-server && npm run dev`**: 🔧 Development mode with auto-restart

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

After running the analysis, check the `dist/` directory for comprehensive outputs:

### 🎯 Primary Deliverables

| File                                     | Size    | Purpose                                       |
| ---------------------------------------- | ------- | --------------------------------------------- |
| **`knowledge-graph-visualization.html`** | ~500KB  | 🌐 Interactive Cytoscape.js graph explorer    |
| **`PHASE1_ANALYSIS_REPORT.md`**          | ~50KB   | 📊 Comprehensive analysis report with metrics |
| **`graph-data.json`**                    | ~1-10MB | 🔗 Complete graph structure (nodes + edges)   |

### 🔍 Search & Discovery (New in v1.2.0)

| File                          | Size   | Purpose                                      |
| ----------------------------- | ------ | -------------------------------------------- |
| **`fulltext-index.json`**     | ~16MB  | 🎯 Full-text search index (11,300+ terms)    |
| **`extracted-concepts.json`** | ~1-5MB | 🧠 Single + multi-word concepts with phrases |
| **`concepts-analysis.json`**  | ~500KB | 📈 TF-IDF weights and co-occurrence data     |

### 📊 Data Exports

| File                           | Format | Purpose                                        |
| ------------------------------ | ------ | ---------------------------------------------- |
| **`top-concepts.csv`**         | CSV    | 📈 Spreadsheet-ready concept rankings          |
| **`documents-metadata.json`**  | JSON   | 📁 File inventory with extracted metadata      |
| **`extracted-documents.json`** | JSON   | 📄 Raw document extraction results             |
| **`similarity-matrix.json`**   | JSON   | 🔢 Document similarity calculations (optional) |

### 📋 Analysis Reports

| File                                 | When Generated                       | Purpose                               |
| ------------------------------------ | ------------------------------------ | ------------------------------------- |
| **`ANALYSIS_REPORT_{timestamp}.md`** | `--issue-report` or `npm run report` | 📊 Timestamped comprehensive analysis |
| **Performance logs**                 | During analysis                      | ⚡ Processing metrics and timing data |

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

## Technical Architecture

The toolset implements a sophisticated multi-stage analysis pipeline with modular, testable components:

### 🏗️ Core Pipeline (4 Phases)

| Phase                 | Module                          | Purpose                                    | Processing Time |
| --------------------- | ------------------------------- | ------------------------------------------ | --------------- |
| 1️⃣ **Extraction**     | `documentExtractor.js` (15.8KB) | 📄 MDX/Markdown parsing + frontmatter      | 10-30%          |
| 2️⃣ **Concepts**       | `conceptExtractor.js` (29.9KB)  | 🧠 NLP concept identification              | 30-50%          |
| 3️⃣ **Graph Building** | `graphBuilder.js` (25.9KB)      | 🔗 Network construction + relationships    | 15-25%          |
| 4️⃣ **Analysis**       | `graphAnalyzer.js`              | 📊 Centrality metrics + quality assessment | 10-20%          |

### 🔍 Search & Discovery (New in v1.2.0)

| Component              | File                 | Size   | Purpose                                        |
| ---------------------- | -------------------- | ------ | ---------------------------------------------- |
| **Phrase Extractor**   | `phraseExtractor.js` | 10.7KB | 🔤 Multi-word technical phrase detection       |
| **Full-Text Indexer**  | `fullTextIndexer.js` | 10.7KB | 🎯 BM25 search index generation                |
| **Search Integration** | Built into pipeline  | -      | ⚡ Unified search across all discovery methods |

### 🏛️ Supporting Infrastructure

#### Utilities & Configuration

- **Similarity Engine** (`src/utils/similarity.js`): Centralized algorithms with LRU caching
  - Token-based Jaccard similarity for documents
  - Character n-gram similarity for terms with pre-filtering
  - Fast similarity checks (<5ms cached operations)
- **Thresholds Config** (`config/thresholds.js`): Single source of truth for all parameters
  - Similarity thresholds: 0.3 (loose), 0.6 (medium), 0.75 (strict)
  - Graph analysis parameters and quality scoring weights
- **Performance Monitor** (`src/utils/performanceMonitor.js`): Real-time metrics collection

#### Quality & Reporting

- **Issue Reporter** (`src/reporters/IssueReporter.js`): Comprehensive analysis generation
  - Executive summaries with actionable recommendations
  - Content quality assessment and structural analysis
  - Coverage gap detection and navigation evaluation
- **Logger** (`src/utils/logger.js`): Structured logging with progress tracking

### 🤖 MCP Server Architecture

The Model Context Protocol server provides AI integration with production-grade performance:

| Component                        | Purpose                                 | Performance Target |
| -------------------------------- | --------------------------------------- | ------------------ |
| **DataLoader**                   | Load and index analysis outputs         | <2s initialization |
| **SmartCache** (18.2KB)          | LRU cache with predictive prefetching   | <5ms cache hits    |
| **SimilarityEngine** (12.5KB)    | Multi-dimensional duplication detection | <20s per query     |
| **ScatteringAnalyzer** (13KB)    | Topic fragmentation analysis            | <15s per query     |
| **ConsolidationEngine** (15.4KB) | Merge/reorganize recommendations        | <10s per query     |

### 📊 Quality Metrics

#### Architecture Benefits

- ✅ **99.5% Test Success Rate** (720+ tests across 9 files)
- ✅ **Single Responsibility**: Each module focused on one concern
- ✅ **High Performance**: Centralized caching and optimizations
- ✅ **Configurable**: All parameters externalized to config files
- ✅ **Modular**: Components tested in isolation with comprehensive mocks

### 📦 Key Dependencies

| Category       | Library            | Version  | Purpose                                     |
| -------------- | ------------------ | -------- | ------------------------------------------- |
| **NLP**        | `natural`          | ^6.10.0  | 🧠 Natural language processing              |
| **NLP**        | `compromise`       | ^14.11.0 | 🔤 Linguistic analysis and phrase detection |
| **Search**     | `lunr`             | ^2.3.9   | 🎯 Full-text search engine                  |
| **Graph**      | `graphology`       | ^0.25.4  | 🔗 Graph data structures and algorithms     |
| **Similarity** | `fast-levenshtein` | ^3.0.0   | ✨ Edit distance calculations               |
| **Parsing**    | `gray-matter`      | ^4.0.3   | 📄 YAML frontmatter extraction              |
| **Files**      | `glob`             | ^10.3.12 | 📁 File pattern matching                    |
| **UI**         | `cytoscape.js`     | Latest   | 🎨 Interactive graph visualization          |

### ⚡ Performance Characteristics

| Repository Size | Files   | Processing Time | Memory Usage | Search Index |
| --------------- | ------- | --------------- | ------------ | ------------ |
| **Small**       | 50-100  | 10-30 seconds   | 1-2GB        | ~2MB         |
| **Medium**      | 200-500 | 1-3 minutes     | 2-4GB        | ~8MB         |
| **Large**       | 500+    | 3-10 minutes    | 4-8GB        | ~16MB+       |

#### Optimization Features (v1.2.0)

- 🧠 **Memory Optimizations**: 8GB heap with garbage collection tuning
- ⚡ **Chunked Processing**: 30 files (documents) / 50 files (concepts) per batch
- 💾 **Smart Caching**: LRU cache with 5-minute TTL and pattern learning
- 🔍 **Layered Search**: Progressively slower but more comprehensive fallbacks
- 📊 **Performance Monitoring**: Real-time metrics and bottleneck identification

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

## Testing & Quality Assurance

### 🧪 Test Infrastructure

The project maintains high quality through comprehensive testing with **99.5% pass rate** across **720+ test cases**.

#### Test Commands

```bash
# Core Testing
npm test                    # 🧪 Run all tests (720+ tests)
npm run test:coverage       # 📊 Generate coverage report (80%+ target)
npm run test:watch         # 👀 Development mode with auto-rerun

# Feature-Specific Testing (New in v1.2.0)
npm run test:fuzzy         # ✨ Test fuzzy matching algorithms
npm run test:phrase        # 🔤 Test multi-word phrase extraction
npm run test:fulltext      # 🎯 Test full-text search functionality

# MCP Server Testing
cd mcp-server
npm run test:unit          # 🔧 Core module tests
npm run test:integration   # 🔗 Cross-module integration tests
npm run test:performance   # ⚡ Performance benchmarks
```

### 📊 Test Coverage & Quality

| Test Suite     | Files    | Tests          | Pass Rate | Coverage Target |
| -------------- | -------- | -------------- | --------- | --------------- |
| **Main Tool**  | 2 files  | 200+ tests     | 99.5%     | 80%+            |
| **MCP Server** | 9 files  | 520+ tests     | 99.5%     | 80%+            |
| **Combined**   | 11 files | **720+ tests** | **99.5%** | **80%+**        |

#### Key Test Files

**Main Tool:**

- `__tests__/performance/search-performance.test.js` - Search benchmarks
- `__tests__/fixtures/test-documents.js` - Test data

**MCP Server (Comprehensive Suite):**

- `test/unit/core/SmartCache.test.js` - Caching algorithms
- `test/unit/core/DataPreprocessor.test.js` - Metadata optimization
- `src/search/__tests__/FuzzyMatcher.test.js` - 150+ fuzzy matching tests
- `src/extractors/__tests__/phraseExtractor.test.js` - 100+ phrase extraction tests
- `test/integration/toolExecution.test.js` - End-to-end workflows

### ✅ Quality Metrics

#### Code Quality Indicators

- **Test Success Rate**: 99.5% (719/720 tests passing)
- **Coverage**: 80%+ across branches, functions, lines, statements
- **Execution Time**: <1 second for unit tests (optimized for rapid feedback)
- **Performance**: All search operations <500ms P99
- **Architecture**: Modular design with single responsibility principle

## 🚀 Recent Improvements (v1.2.0)

### Major Features Released

#### 1. 🔍 **Advanced Search Capabilities**

Three complementary search improvements working together:

- **Fuzzy Matching**: Typo tolerance with Jaccard similarity + abbreviation expansion

  - `"arbitrm"` → `"arbitrum"` (typo correction)
  - `"ARB"` → `"arbitrum"` (abbreviation expansion)
  - **Performance**: <200ms P50, <1s P99

- **Phrase Extraction**: Multi-word technical phrase detection

  - Patterns: `adjective+noun+noun`, `Title Case`, `hyphenated-terms`
  - Domain-specific: `"smart contract"`, `"Layer 2"`, `"gas optimization"`
  - **Integration**: Added to `extracted-concepts.json`

- **Full-Text Search**: BM25-ranked comprehensive fallback
  - **Index Size**: ~16MB with 11,300+ unique terms
  - **Performance**: <500ms P50, <2s P99
  - **Coverage**: Every word in documentation corpus

#### 2. 🤖 **Production-Grade MCP Server** (v2.0.0)

- **SmartCache**: LRU cache with predictive prefetching and pattern learning
- **7 Interactive Tools**: Duplication detection, topic scattering, consolidation recommendations
- **Auto-Refresh**: File watching with automatic data reload on analysis changes
- **Performance**: <20 seconds per query target with comprehensive caching

#### 3. 📊 **Enhanced Testing & Quality** (720+ Tests)

- **Test Success Rate**: 99.5% (719/720 tests passing)
- **New Test Suites**: FuzzyMatcher (150+ tests), PhraseExtractor (100+ tests)
- **Performance Benchmarks**: Automated testing for all search layers
- **Coverage Target**: 80%+ across all modules

### 🏗️ Architecture Improvements

#### **Centralized Configuration** (`config/thresholds.js`)

- ✅ Eliminated magic numbers across 4+ files
- ✅ Single source of truth for all tuning parameters
- ✅ Easy experimentation and optimization

#### **Similarity Engine** (`src/utils/similarity.js`)

- ✅ Consolidated duplicate code from 4 files (~500 lines reduced)
- ✅ Added LRU caching for n-gram calculations
- ✅ Performance improvements through optimized algorithms

#### **Modular Architecture Refinement**

- ✅ Extracted IssueReporter from monolithic index.js (50KB → modular)
- ✅ Enhanced Single Responsibility Principle compliance
- ✅ Improved testability with comprehensive mocks
- ✅ Reduced complexity in core orchestration

## 🤝 Contributing

This toolset is designed to be extensible and customizable for different documentation projects.

### Development Setup

```bash
# Clone and setup main tool
git clone <repository>
cd documentation-graph
npm install

# Setup MCP server
cd mcp-server
npm install

# Run tests to verify setup
npm test                    # Main tool tests
cd mcp-server && npm test   # MCP server tests
```

### Code Style & Standards

- **ES Modules**: Use `import/export` syntax throughout
- **Async/Await**: For all asynchronous operations
- **Single Responsibility**: Each module has one clear purpose
- **Comprehensive Testing**: 80%+ coverage target for new features
- **Performance First**: All search operations <500ms P99

### Priority Areas for Enhancement

| Area                        | Description                               | Impact |
| --------------------------- | ----------------------------------------- | ------ |
| 🧠 **Advanced NLP**         | Additional concept extraction techniques  | High   |
| 🎨 **Visualization**        | Alternative graph layout algorithms       | Medium |
| 🔗 **Platform Integration** | Support beyond Docusaurus (GitBook, etc.) | High   |
| ⚡ **Real-time Analysis**   | Continuous documentation improvement      | Medium |
| 🌐 **Multi-language**       | Support for non-English documentation     | Medium |

### Testing Requirements

- **Unit Tests**: Required for all new modules
- **Integration Tests**: Required for MCP tools and major features
- **Performance Tests**: Required for search and analysis features
- **Documentation**: Update README for significant changes

### Deployment & Release

- **Versioning**: Semantic versioning (current: v1.2.0)
- **Testing**: All tests must pass (maintain 99.5%+ success rate)
- **Documentation**: Update READMEs and technical docs
- **MCP Compatibility**: Ensure MCP server integration remains stable

## 📄 License

This project is part of the Arbitrum documentation toolchain and follows the same licensing terms as the parent repository.

## 🆘 Support & Documentation

### Additional Resources

- **[MCP Server Documentation](./mcp-server/README.md)**: Detailed MCP integration guide
- **[Technical Architecture](./TECHNICAL_ARCHITECTURE.md)**: Deep dive into implementation
- **[Test Suite Summary](./TEST_SUITE_SUMMARY.md)**: Comprehensive testing overview
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**: Step-by-step deployment instructions

### Getting Help

1. **Common Issues**: Check [Troubleshooting](#troubleshooting) section above
2. **Performance Problems**: Use `--verbose` flag for detailed diagnostics
3. **Configuration**: Review `config/` directory for tuning parameters
4. **MCP Integration**: See `mcp-server/README.md` for detailed setup instructions

For technical support, please provide:

- Node.js version (`node --version`)
- Memory available during analysis
- Repository size and file count
- Full error logs with `--verbose` flag
