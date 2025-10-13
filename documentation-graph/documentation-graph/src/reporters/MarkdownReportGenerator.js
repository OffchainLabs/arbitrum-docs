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
 * MarkdownReportGenerator - Orchestrates markdown report generation.
 *
 * This class coordinates the generation of comprehensive documentation analysis reports
 * by assembling multiple report sections. It handles configuration, section registration,
 * error recovery, and file output.
 *
 * @example
 * const generator = new MarkdownReportGenerator({
 *   outputPath: 'dist/report.md',
 *   maxConceptsToShow: 50
 * });
 * const reportPath = await generator.generate(analysisData);
 */
import fs from 'fs';
import path from 'path';
import ReportBuilder from './ReportBuilder.js';
import ExecutiveSummarySection from './sections/ExecutiveSummarySection.js';
import TopConceptsSection from './sections/TopConceptsSection.js';
import HubDocumentsSection from './sections/HubDocumentsSection.js';
import OrphanedContentSection from './sections/OrphanedContentSection.js';
import QualityAssessmentSection from './sections/QualityAssessmentSection.js';
import StructureBreakdownSection from './sections/StructureBreakdownSection.js';
import RecommendationsSection from './sections/RecommendationsSection.js';

export default class MarkdownReportGenerator {
  // Report configuration defaults
  static DEFAULT_OUTPUT_PATH = 'dist/PHASE1_ANALYSIS_REPORT.md';
  static DEFAULT_INCLUDE_TOC = true;
  static DEFAULT_INCLUDE_DIAGRAMS = true;
  static DEFAULT_MAX_CONCEPTS = 50;
  static DEFAULT_MAX_HUBS = 20;
  static DEFAULT_MAX_ORPHANS = 30;

  // Report metadata
  static REPORT_TITLE = 'Arbitrum Documentation Knowledge Graph - Phase 1 Analysis Report';
  static VISUALIZATION_SECTION_TITLE = 'Interactive Visualization';

  // Error messages
  static ERROR_NO_DATA = 'Analysis data is required';
  static ERROR_NO_DOCUMENTS = 'Documents array is required in analysis data';
  static ERROR_NO_CONCEPTS = 'Concepts object is required in analysis data';

  /**
   * Create a new MarkdownReportGenerator.
   *
   * @param {Object} config - Generator configuration
   * @param {string} config.outputPath - Output file path (default: 'dist/PHASE1_ANALYSIS_REPORT.md')
   * @param {boolean} config.includeTableOfContents - Include TOC (default: true)
   * @param {boolean} config.includeMermaidDiagrams - Include diagrams (default: true)
   * @param {number} config.maxConceptsToShow - Max concepts to display (default: 50)
   * @param {number} config.maxHubsToShow - Max hub documents to show (default: 20)
   * @param {number} config.maxOrphansToShow - Max orphaned docs to show (default: 30)
   */
  constructor(config = {}) {
    this.config = this.buildConfiguration(config);
    this.builder = new ReportBuilder();
    this.sections = [];
  }

  /**
   * Build configuration with defaults.
   *
   * @private
   * @param {Object} config - User configuration
   * @returns {Object} Merged configuration
   */
  buildConfiguration(config) {
    return {
      outputPath: config.outputPath || MarkdownReportGenerator.DEFAULT_OUTPUT_PATH,
      includeTableOfContents:
        config.includeTableOfContents ?? MarkdownReportGenerator.DEFAULT_INCLUDE_TOC,
      includeMermaidDiagrams:
        config.includeMermaidDiagrams ?? MarkdownReportGenerator.DEFAULT_INCLUDE_DIAGRAMS,
      maxConceptsToShow: config.maxConceptsToShow || MarkdownReportGenerator.DEFAULT_MAX_CONCEPTS,
      maxHubsToShow: config.maxHubsToShow || MarkdownReportGenerator.DEFAULT_MAX_HUBS,
      maxOrphansToShow: config.maxOrphansToShow || MarkdownReportGenerator.DEFAULT_MAX_ORPHANS,
    };
  }

  /**
   * Register all report sections in order.
   *
   * Creates instances of all section generators with the current configuration.
   * Sections are registered in the order they should appear in the report.
   */
  registerSections() {
    this.sections = [
      new ExecutiveSummarySection(this.config),
      new TopConceptsSection(this.config),
      new HubDocumentsSection(this.config),
      new OrphanedContentSection(this.config),
      new QualityAssessmentSection(this.config),
      new StructureBreakdownSection(this.config),
      new RecommendationsSection(this.config),
    ];
  }

  /**
   * Generate complete markdown report.
   *
   * Validates input data, builds all sections with error handling,
   * and writes the final report to the configured output path.
   *
   * @param {Object} data - Analysis data containing documents, concepts, analysis, etc.
   * @returns {Promise<string>} Absolute path to generated report file
   * @throws {Error} If data validation fails
   *
   * @example
   * const reportPath = await generator.generate(analysisData);
   * console.log(`Report written to: ${reportPath}`);
   */
  async generate(data) {
    this.validateInputData(data);
    this.builder.reset();

    // Build report structure
    this.addReportHeader();
    this.addReportMetadata(data);
    this.ensureSectionsRegistered();
    this.addTableOfContentsIfConfigured();
    await this.generateAllSections(data);
    this.addVisualizationSection(data);

    // Write to file and return path
    const markdown = this.builder.build();
    return this.writeReportToFile(markdown);
  }

  /**
   * Validate input data structure.
   *
   * @private
   * @param {Object} data - Analysis data to validate
   * @throws {Error} If required data is missing
   */
  validateInputData(data) {
    if (!data) {
      throw new Error(MarkdownReportGenerator.ERROR_NO_DATA);
    }

    if (!data.documents) {
      throw new Error(MarkdownReportGenerator.ERROR_NO_DOCUMENTS);
    }

    if (!data.concepts) {
      throw new Error(MarkdownReportGenerator.ERROR_NO_CONCEPTS);
    }
  }

  /**
   * Add report title header.
   *
   * @private
   */
  addReportHeader() {
    this.builder.addTitle(MarkdownReportGenerator.REPORT_TITLE, 1);
  }

  /**
   * Add report metadata in HTML comments.
   *
   * @private
   * @param {Object} data - Analysis data
   */
  addReportMetadata(data) {
    const metadata = this.buildMetadata(data);
    this.builder.addMetadata(metadata);
  }

  /**
   * Build metadata object from analysis data.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {Object} Metadata key-value pairs
   */
  buildMetadata(data) {
    return {
      generated: new Date().toISOString(),
      documentsAnalyzed: data.documents?.length || 0,
      conceptsExtracted: data.concepts?.topConcepts?.length || 0,
      totalNodes: data.analysis?.basic?.totalNodes || 0,
      totalEdges: data.analysis?.basic?.totalEdges || 0,
    };
  }

  /**
   * Ensure sections are registered.
   *
   * @private
   */
  ensureSectionsRegistered() {
    if (this.sections.length === 0) {
      this.registerSections();
    }
  }

  /**
   * Add table of contents if configured.
   *
   * @private
   */
  addTableOfContentsIfConfigured() {
    if (!this.config.includeTableOfContents) {
      return;
    }

    const sectionTitles = this.getSectionTitles();
    this.builder.addTableOfContents(sectionTitles);
  }

  /**
   * Get all section titles including visualization.
   *
   * @private
   * @returns {string[]} Section titles
   */
  getSectionTitles() {
    const titles = this.sections.map((s) => s.getTitle());
    titles.push(MarkdownReportGenerator.VISUALIZATION_SECTION_TITLE);
    return titles;
  }

  /**
   * Generate all report sections with error handling.
   *
   * @private
   * @param {Object} data - Analysis data
   */
  async generateAllSections(data) {
    for (const section of this.sections) {
      await this.generateSectionWithErrorHandling(section, data);
    }
  }

  /**
   * Generate a single section with error handling.
   *
   * @private
   * @param {Object} section - Section generator instance
   * @param {Object} data - Analysis data
   */
  async generateSectionWithErrorHandling(section, data) {
    try {
      await section.generate(data, this.builder);
    } catch (error) {
      this.handleSectionGenerationError(section, error);
    }
  }

  /**
   * Handle section generation error by adding warning.
   *
   * @private
   * @param {Object} section - Failed section
   * @param {Error} error - Error that occurred
   */
  handleSectionGenerationError(section, error) {
    const warningMessage = `Failed to generate section "${section.getTitle()}": ${error.message}`;
    this.builder.addWarning(warningMessage);
  }

  /**
   * Write report markdown to file.
   *
   * @private
   * @param {string} markdown - Complete markdown content
   * @returns {string} Absolute path to written file
   */
  writeReportToFile(markdown) {
    const outputPath = path.resolve(this.config.outputPath);
    this.ensureOutputDirectoryExists(outputPath);
    fs.writeFileSync(outputPath, markdown, 'utf-8');
    return outputPath;
  }

  /**
   * Ensure output directory exists.
   *
   * @private
   * @param {string} filePath - Output file path
   */
  ensureOutputDirectoryExists(filePath) {
    const outputDir = path.dirname(filePath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  /**
   * Add interactive visualization section.
   *
   * Provides instructions for accessing and using the interactive knowledge graph.
   *
   * @param {Object} data - Analysis data (currently unused but kept for consistency)
   */
  addVisualizationSection(data) {
    this.builder.addHeading(MarkdownReportGenerator.VISUALIZATION_SECTION_TITLE, 2);

    this.addVisualizationIntroduction();
    this.addVisualizationAccessInstructions();
    this.addVisualizationFeatures();
  }

  /**
   * Add visualization introduction paragraph.
   *
   * @private
   */
  addVisualizationIntroduction() {
    const intro =
      'An interactive knowledge graph visualization has been generated. ' +
      'This visualization provides dynamic exploration of the documentation structure.';

    this.builder.addParagraph(intro);
  }

  /**
   * Add instructions for accessing the visualization.
   *
   * @private
   */
  addVisualizationAccessInstructions() {
    this.builder.addSubheading('Accessing the visualization', 3);

    this.builder.addParagraph('To view the interactive visualization, run the following command:');

    this.builder.addCodeBlock('npm run serve', 'shell');

    this.builder.addParagraph(
      'Then open your browser to http://localhost:8080 to explore the knowledge graph.',
    );
  }

  /**
   * Add list of visualization features.
   *
   * @private
   */
  addVisualizationFeatures() {
    this.builder.addSubheading('Visualization features', 3);

    const features = [
      'Dynamic exploration of document relationships',
      'Centrality analysis highlighting important documents',
      'Search functionality to find specific documents or concepts',
      'Filter options to focus on specific content areas',
      'Export capabilities for sharing insights',
    ];

    this.builder.addList(features);
  }
}
