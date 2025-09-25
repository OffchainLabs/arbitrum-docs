# Documentation Knowledge Graph Builder

A toolset for analyzing, visualizing, and understanding the structure and relationships within OCL's documentation repositories. Built specifically for Docusaurus-based documentation projects.
Creates interactive knowledge graphs that reveal content connections, identify gaps, and inform restructuring decisions.

## Purpose

This toolset addresses challenges in OCL's documentation project:

- **Content Discovery**: Understanding what documentation exists and how it's organized
- **Relationship Mapping**: Identifying connections between concepts and documents  
- **Gap Analysis**: Finding orphaned content and missing connections
- **Structure Optimization**: Data-driven insights for improving navigation and organization
- **Quality Assessment**: Quantitative metrics for documentation health

## Features

- **Comprehensive Analysis**: Scans all MDX/Markdown files with frontmatter parsing
- **Concept Extraction**: Uses NLP to identify key concepts and terminology
- **Configurable Analysis**: Customize domain terms, stop words, and exclusion rules
- **Knowledge Graph**: Builds interactive networks showing document relationships
- **Quality Metrics**: Centrality analysis, connectivity scores, and structural insights
- **Interactive Visualization**: Web-based graph explorer with filtering and search
- **Detailed Reports**: JSON/CSV exports and markdown analysis reports

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

## Configuration

The Documentation Knowledge Graph Builder supports customization through JSON configuration files. This allows you to tailor the analysis to your specific documentation needs.

### Configuration File Structure

Create a JSON configuration file with the following sections:

```json
{
  "domainSpecificTerms": {
    "blockchain": ["arbitrum", "ethereum", "rollup", "layer2"],
    "technical": ["api", "sdk", "rpc", "json"],
    "development": ["javascript", "typescript", "react", "nodejs"]
  },
  "stopWords": [
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to"
  ],
  "frontmatterExcludedFileTypes": [
    "**/static/**/*.md",
    "**/i18n/**/*.mdx",
    "**/README.md"
  ],
  "internalLinkingExcludedFileTypes": [
    "**/partials/**/*.md",
    "**/LICENSE.md"
  ]
}
```

### Configuration Options

#### `domainSpecificTerms`
**Purpose**: Industry-specific vocabulary that should be included in concept extraction.

**Format**: Object with categories as keys and arrays of terms as values.

**Benefits**:
- Improves concept extraction accuracy for your domain
- Ensures important terminology is not missed
- Categorizes concepts for better analysis

**Example**:
```json
"domainSpecificTerms": {
  "blockchain": ["arbitrum", "ethereum", "rollup", "smart contract"],
  "technical": ["api", "sdk", "rpc", "websocket"],
  "business": ["governance", "dao", "proposal", "voting"]
}
```

#### `stopWords`
**Purpose**: Irrelevant terms that should be filtered out during concept extraction.

**Format**: Array of strings (case-insensitive).

**Benefits**:
- Improves concept extraction quality by removing noise
- Reduces processing time and memory usage
- Focuses analysis on meaningful terms

**Example**:
```json
"stopWords": [
  "the", "a", "an", "and", "or", "but", "very", "just", "now", "also"
]
```

#### `frontmatterExcludedFileTypes`
**Purpose**: File patterns that should be excluded from "Missing Navigation Metadata" reports.

**Format**: Array of glob patterns (case-insensitive).

**Use Cases**:
- Exclude auto-generated files
- Skip translation files
- Ignore system files

**Examples**:
```json
"frontmatterExcludedFileTypes": [
  "**/static/**/*.md",      // All .md files in static directories
  "**/i18n/**/*.mdx",       // Internationalization files
  "**/*.en.md",             // Language-specific files
  "**/README.md",           // README files at any level
  "**/CHANGELOG.md"         // Changelog files
]
```

#### `internalLinkingExcludedFileTypes`
**Purpose**: File patterns that should be excluded from "Poor Internal Linking" reports.

**Format**: Array of glob patterns (case-insensitive).

**Use Cases**:
- Exclude partial files that are included elsewhere
- Skip files that don't need internal links (like licenses)
- Ignore auto-generated content

**Examples**:
```json
"internalLinkingExcludedFileTypes": [
  "**/partials/**/*.md",    // Partial files meant for inclusion
  "**/templates/**/*.mdx",  // Template files
  "**/LICENSE.md",          // License files
  "**/CONTRIBUTING.md"      // Contributing guidelines
]
```

### Using Configuration Files

1. **Create a configuration file**:
   ```bash
   cp config/example-config.json config/my-config.json
   # Edit config/my-config.json with your specific settings
   ```

2. **Run analysis with configuration**:
   ```bash
   node src/index.js --config config/my-config.json
   ```

3. **Verify configuration loading**:
   ```bash
   node src/index.js --config config/my-config.json --verbose
   ```
   Look for messages like:
   - "ℹ Loaded custom configuration from: config/my-config.json"
   - "🔍 Loaded N custom stop words"
   - "🔍 Initialized N domain terms from custom configuration"

### Sample Configuration Files

The project includes sample configuration files:

- **`config/analysis-config.json`**: Basic configuration with Arbitrum-specific terms
- **`config/example-config.json`**: Comprehensive example with documentation

### Best Practices

1. **Start with examples**: Copy and modify the provided sample configurations
2. **Test incrementally**: Add domain terms gradually and observe their impact
3. **Use verbose logging**: Enable `--verbose` to see configuration loading messages
4. **Document your choices**: Keep notes about why certain exclusions were added
5. **Repository-specific**: Create different configs for different documentation repositories

## Available Scripts

### Primary Commands

#### `npm start`
Run the complete analysis pipeline with memory optimizations (recommended).

**Usage:**
```bash
npm start
# Equivalent to: node --max-old-space-size=8192 --expose-gc --optimize-for-size src/index.js
```

**Options:** (via direct CLI usage: `node src/index.js [options]`)
- `-i, --input <path>` - Input directory containing documentation (default: `/Users/allup/dev/OCL/arbitrum-docs/docs`)
- `-o, --output <path>` - Output directory for generated files (default: `./dist`)
- `-c, --config <path>` - Path to JSON configuration file for analysis customization
- `-v, --verbose` - Enable verbose logging
- `--skip-extraction` - Skip document extraction phase
- `--skip-concepts` - Skip concept extraction phase
- `--skip-analysis` - Skip graph analysis phase
- `--skip-visualization` - Skip visualization generation
- `--issue-report` - Generate timestamped issue report after analysis

**Examples:**
```bash
# Basic usage with default settings
npm start

# Generate optimized analysis with timestamped issue report (recommended)
npm run report

# Or use CLI without optimized configuration
node src/index.js --issue-report

# Custom input/output directories with verbose logging and report
node src/index.js -i /path/to/docs -o /path/to/output -v --issue-report

# Use custom configuration file
node src/index.js --config config/my-custom-config.json

# Combine configuration with other options
node src/index.js --config config/analysis-config.json --issue-report -v

# Skip phases for faster iteration
node src/index.js --skip-concepts --skip-analysis

# Generate only visualization (after data exists)
node src/index.js --skip-extraction --skip-concepts --skip-analysis

# Generate report from existing analysis data
node src/index.js --skip-extraction --skip-concepts --skip-visualization --issue-report
```

#### `npm run start:basic`
Run the complete analysis pipeline without memory optimizations.

**Usage:**
```bash
npm run start:basic
# Equivalent to: node src/index.js
```

**Use cases:**
- Debugging and development
- Smaller repositories (< 200 files)
- When memory optimization flags cause issues

#### `npm run report`
Generate a comprehensive timestamped issue report with optimized analysis (recommended).

**Usage:**
```bash
npm run report
# Uses pre-configured analysis settings with Arbitrum-specific terminology
```

**Output:** Creates `ANALYSIS_REPORT_YYYY-MM-DD_HH-MM-SS.md` with:
- Executive summary and key findings
- Quality assessment with actionable recommendations
- Navigation analysis and coverage metrics
- Content structure and relationship insights
- Interactive visualization links

**Features:**
- Pre-configured with 135+ domain-specific terms for accurate concept extraction
- Optimized stop word filtering and file exclusions for cleaner reports
- Memory-optimized execution for large repositories
- Ready-to-use without additional configuration

**Use cases:**
- Regular documentation health checks
- Stakeholder reporting and documentation reviews
- Content audit and improvement planning
- Before/after analysis for restructuring projects

### Help and Information

#### `npm run help`
Display command-line help and available options.

**Usage:**
```bash
npm run help
# Shows all available command-line options and usage examples
```

### Individual Analysis Components

#### `npm run extract`
Run only the document extraction phase.

**Usage:**
```bash
npm run extract
# Equivalent to: node src/extractor.js
```

**Output:** Creates `dist/extracted-documents.json` with document metadata and content.

#### `npm run build-graph`
Run only the graph building phase.

**Usage:**
```bash
npm run build-graph
# Equivalent to: node src/graphBuilder.js
```

**Prerequisites:** Requires extracted documents data from previous extraction.

#### `npm run analyze`
Run the comprehensive analysis engine.

**Usage:**
```bash
npm run analyze
# Equivalent to: node src/analyzer.js
```

**Output:** Generates quality assessment and structural analysis reports.

#### `npm run visualize`
Generate interactive visualizations.

**Usage:**
```bash
npm run visualize
# Equivalent to: node src/visualizer.js
```

**Output:** Creates `dist/knowledge-graph-visualization.html` and related visualization files.

### Specialized Analysis Tools

#### `npm run analyze:topic <topic>`
Run topic-focused analysis for specific subject areas.

**Usage:**
```bash
npm run analyze:topic <topic> [options]
# Equivalent to: node src/cli/topicAnalyzer.js <topic> [options]
```

**Arguments:**
- `<topic>` - Topic to filter by (e.g., "Arbitrum chain", "Node", "How-tos")

**Options:**
- `-i, --input <path>` - Input directory containing documentation
- `-o, --output <path>` - Output directory for generated files
- `-v, --verbose` - Enable verbose logging
- `-f, --format <format>` - Output format: `html`, `json`, `markdown`, `all` (default: `all`)
- `--use-cache` - Use cached extraction results if available (default: `true`)
- `--case-sensitive` - Use case-sensitive topic matching (default: `false`)
- `--fuzzy` - Enable fuzzy matching for topic keywords (default: `false`)
- `--threshold <number>` - Minimum relevance score 0-1 (default: `0.3`)

**Examples:**
```bash
# Analyze documents related to "Node" topics
npm run analyze:topic "Node"

# Case-sensitive analysis with custom threshold
npm run analyze:topic "Smart Contract" --case-sensitive --threshold 0.5

# Generate only JSON output with verbose logging
npm run analyze:topic "Bridge" -f json -v

# Use fuzzy matching for broader results
npm run analyze:topic "deployment" --fuzzy
```

#### `npm run analyze:keyword <keywords...>`
Run keyword-based analysis for specific terms.

**Usage:**
```bash
npm run analyze:keyword <keywords...> [options]
# Equivalent to: node src/cli/keywordAnalyzer.js <keywords...> [options]
```

**Arguments:**
- `<keywords...>` - Keywords to search for (can specify multiple)

**Options:**
- `-i, --input <path>` - Input directory containing documentation
- `-o, --output <path>` - Output directory for generated files
- `-v, --verbose` - Enable verbose logging
- `-f, --format <format>` - Output format: `html`, `json`, `markdown`, `csv`, `all` (default: `all`)
- `--use-cache` - Use cached extraction results if available (default: `true`)
- `--operator <op>` - Logical operator for multiple keywords: `AND`, `OR` (default: `OR`)
- `--include-related` - Include related concepts and documents (default: `false`)
- `--depth <number>` - Depth of related content to include 1-3 (default: `1`)
- `--min-score <number>` - Minimum relevance score 0-1 (default: `0.2`)
- `--max-results <number>` - Maximum number of results to include (default: `100`)

**Examples:**
```bash
# Search for documents containing "bridge" or "cross-chain"
npm run analyze:keyword bridge cross-chain

# AND logic: documents must contain both terms
npm run analyze:keyword "smart contract" "deployment" --operator AND

# Include related content with higher relevance threshold
npm run analyze:keyword "Arbitrum" --include-related --min-score 0.4 --depth 2

# Generate CSV output for spreadsheet analysis
npm run analyze:keyword "gas" "fee" -f csv --max-results 50

# Multiple keywords with verbose output
npm run analyze:keyword node validator sequencer -v --operator OR
```

#### `npm run topic <topic>`
Shorthand for topic analysis.

**Usage:**
```bash
npm run topic <topic>
# Equivalent to: npm run analyze:topic <topic>
```

**Example:**
```bash
npm run topic "Developer Guide"
```

#### `npm run keyword <keywords...>`
Shorthand for keyword analysis.

**Usage:**
```bash
npm run keyword <keywords...>
# Equivalent to: npm run analyze:keyword <keywords...>
```

**Example:**
```bash
npm run keyword bridge deployment
```

### Development and Serving

#### `npm run serve`
Start a local web server to view visualizations.

**Usage:**
```bash
npm run serve
# Equivalent to: npx http-server dist -p 8080
```

**Access:** Open `http://localhost:8080` in your browser to view:
- `knowledge-graph-visualization.html` - Interactive graph explorer
- Other generated HTML reports and visualizations

**Note:** Required to properly view the interactive graph visualization due to CORS restrictions with `file://` URLs.

#### `npm run report`
Generate comprehensive timestamped issue reports with optimized analysis.

**Usage:**
```bash
npm run report
# Uses config/analysis-config.json with Arbitrum-specific terms and optimizations
```

**Output:** Creates timestamped analysis reports with format `ANALYSIS_REPORT_YYYY-MM-DD_HH-MM-SS.md`

**Benefits:**
- Pre-configured with 135+ blockchain and technical terms
- Optimized file exclusions for cleaner quality reports
- Memory-optimized execution for large repositories
- Ready-to-use without additional configuration

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
```

### Configuration

The tool automatically detects:
- **Documentation directory**: `docs/` (configurable in `src/main.js`)
- **Output directory**: `dist/` (configurable)
- **File patterns**: `*.md`, `*.mdx` files
- **Frontmatter parsing**: YAML frontmatter extraction

### Customization

#### Adjusting Concept Extraction

**Recommended Approach**: Use configuration files (no code editing required)

1. **Create a custom configuration file**:
   ```bash
   cp config/analysis-config.json config/my-custom-config.json
   ```

2. **Edit your configuration file** to customize:
   - **Domain-specific terms**: Add industry-specific vocabulary organized by categories
   - **Stop words**: Filter out irrelevant terms specific to your documentation
   - **File exclusions**: Control which files appear in quality reports

3. **Use your configuration**:
   ```bash
   # Generate report with custom configuration
   node src/index.js --config config/my-custom-config.json --issue-report
   
   # Or run full analysis with custom configuration
   node src/index.js --config config/my-custom-config.json
   ```

**Example custom configuration**:
```json
{
  "domainSpecificTerms": {
    "myProduct": ["feature-name", "api-endpoint", "service-name"],
    "technical": ["microservice", "kubernetes", "docker"],
    "business": ["workflow", "integration", "automation"]
  },
  "stopWords": ["very", "just", "really", "quite", "somewhat"],
  "frontmatterExcludedFileTypes": ["**/templates/**/*.md"],
  "internalLinkingExcludedFileTypes": ["**/generated/**/*.mdx"]
}
```

**Advanced Customization**: For algorithmic changes, edit `src/extractors/conceptExtractor.js` to modify:
- **Weight algorithms**: Adjust concept importance scoring
- **Extraction patterns**: Modify how concepts are identified and normalized
- **Similarity thresholds**: Fine-tune relationship detection between documents

#### Modifying Graph Structure

Edit `src/graphBuilder.js` to change:
- **Connection thresholds**: Minimum similarity for document linking
- **Node types**: Different categories of content nodes
- **Edge weights**: Relationship strength calculations

## Output Files

After running the analysis, check the `dist/` directory for:

### Primary Deliverables

- **`knowledge-graph-visualization.html`**: Interactive graph explorer
- **`PHASE1_ANALYSIS_REPORT.md`**: Comprehensive analysis report (when available)
- **`ANALYSIS_REPORT_<timestamp>.md`**: Timestamped analysis report (generated with `--issue-report` option)
- **`graph-data.json`**: Complete graph structure for external tools

### Data Exports

- **`concepts-analysis.json`**: Detailed concept metrics
- **`top-concepts.csv`**: Most important concepts (spreadsheet-friendly)
- **`documents-metadata.json`**: File inventory with extracted metadata

### Technical Files

- **`extracted-concepts.json`**: Raw concept extraction results
- **`similarity-matrix.json`**: Document similarity calculations

## Understanding the Results

### Knowledge Graph Visualization

Open `dist/knowledge-graph-visualization.html` in your browser to:

- **Explore connections**: Click nodes to see related documents
- **Filter by type**: Show only specific document categories
- **Search concepts**: Find documents containing specific terms
- **Adjust layout**: Different visualization algorithms

### Analysis Reports

When using the `--issue-report` option, a timestamped report is generated with format `ANALYSIS_REPORT_YYYY-MM-DD_HH-MM-SS.md`:

- **Executive Summary**: Current repository state and key metrics
- **Key Findings**: Documentation inventory, concept analysis, structure insights
- **Quality Assessment**: Overall score with identified issues and strengths
- **Implementation Recommendations**: Prioritized action items for improvement
- **Technical Architecture**: Documentation patterns and content distribution
- **Interactive Visualization**: Direct links to generated visualization tools

**Usage:**
```bash
# Generate optimized timestamped report (recommended)
npm run report

# Or use CLI directly for custom options
node src/index.js --config config/my-custom-config.json --issue-report

# Generate report from existing analysis data (faster)
node src/index.js --skip-extraction --skip-concepts --skip-visualization --issue-report
```

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

## Technical Details

### Architecture

The toolset consists of several modular components:

- **Document Scanner**: Finds and parses documentation files
- **Concept Extractor**: NLP-based terminology identification
- **Graph Builder**: Network construction and relationship mapping
- **Analyzer**: Metrics calculation and insight generation
- **Visualizer**: Interactive web-based graph rendering

### Dependencies

Key libraries used:
- **Natural**: NLP processing for concept extraction
- **Gravis**: Graph analysis and metrics calculation
- **Cytoscape.js**: Interactive graph visualization
- **Gray-matter**: Frontmatter parsing
- **Glob**: File pattern matching

### Performance

**Maximum Coverage Mode** (current configuration):
Optimized for comprehensive concept extraction and relationship analysis:
- **Small repos** (50-100 files): 45-90 seconds
- **Medium repos** (200-500 files): 3-4 minutes  
- **Large repos** (500+ files): 4-6 minutes

**Key improvements in maximum coverage mode:**
- Extracts up to 15,000 unique concepts (doubled from previous 7,000)
- Processes 500 concepts per document (doubled from previous 250)  
- Captures 350,000 co-occurrence relationships (doubled from previous 175,000)
- Better concept normalization with 5,000 processed concepts (doubled from previous 2,500)

Memory usage scales with repository size and complexity. The maximum coverage mode prioritizes comprehensive analysis over speed for the richest possible insights.

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

**Memory usage:**
- Default command uses up to 8GB heap space with garbage collection optimizations
- Large repositories (500+ files) may use 1-2GB of memory during processing
- Processing automatically optimizes similarity calculations for datasets with 500+ concepts

### Getting Help

For issues specific to:
- **Concept extraction**: Review `src/conceptExtractor.js` and adjust domain terms
- **Graph structure**: Modify thresholds in `src/graphBuilder.js`  
- **Visualization**: Check browser console for Cytoscape.js errors
- **Performance**: Monitor memory usage and consider batch processing

## Contributing

This toolset is designed to be extensible and customizable for different documentation projects. Key areas for enhancement:

- Additional NLP techniques for concept extraction
- Alternative graph layout algorithms
- Integration with documentation platforms beyond Docusaurus
- Real-time analysis for continuous documentation improvement

## License

This project is part of the Arbitrum documentation toolchain and follows the same licensing terms as the parent repository.
