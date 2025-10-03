/**
 * TopConceptsSection - Generates concept analysis section for documentation report.
 *
 * This section presents extracted concepts ranked by frequency, including category
 * breakdown and optional visualizations. Helps identify key themes and topics
 * throughout the documentation.
 *
 * @example
 * const section = new TopConceptsSection({maxConceptsToShow: 50});
 * await section.generate(analysisData, builder);
 */
export default class TopConceptsSection {
  // Section configuration
  static SECTION_TITLE = 'Concept analysis';
  static TABLE_HEADING = 'Top concepts by frequency';
  static CATEGORIES_HEADING = 'Concept categories';
  static VISUALIZATION_HEADING = 'Top 10 concepts visualization';

  // Default configuration values
  static DEFAULT_MAX_CONCEPTS = 50;
  static CATEGORY_BREAKDOWN_THRESHOLD = 20;
  static VISUALIZATION_TOP_N = 10;

  // Table column headers
  static HEADER_RANK = 'Rank';
  static HEADER_CONCEPT = 'Concept';
  static HEADER_FREQUENCY = 'Frequency';
  static HEADER_FILES = 'Files';
  static HEADER_CATEGORY = 'Category';
  static HEADER_TYPE = 'Type';

  // Category table headers
  static HEADER_CATEGORY_NAME = 'Category';
  static HEADER_COUNT = 'Count';
  static HEADER_PERCENTAGE = 'Percentage';

  // Defaults
  static DEFAULT_CATEGORY = 'uncategorized';
  static DEFAULT_TYPE = 'general';
  static NOT_AVAILABLE = 'N/A';

  // Formatting
  static FREQUENCY_DECIMAL_PLACES = 1;
  static PERCENTAGE_DECIMAL_PLACES = 2;
  static PERCENT_MULTIPLIER = 100;

  /**
   * Create a new TopConceptsSection.
   *
   * @param {Object} config - Section configuration
   * @param {number} config.maxConceptsToShow - Maximum concepts to display (default: 50)
   * @param {boolean} config.includeMermaidDiagrams - Include pie chart visualization
   */
  constructor(config = {}) {
    this.config = config;
    this.maxConcepts = config.maxConceptsToShow || TopConceptsSection.DEFAULT_MAX_CONCEPTS;
  }

  /**
   * Get the section title.
   *
   * @returns {string} Section title
   */
  getTitle() {
    return TopConceptsSection.SECTION_TITLE;
  }

  /**
   * Generate the concept analysis section.
   *
   * Creates introduction, concepts table, optional category breakdown,
   * and optional visualization.
   *
   * @param {Object} data - Analysis data containing concepts
   * @param {ReportBuilder} builder - Report builder instance
   * @returns {Promise<ReportBuilder>} Updated builder instance
   */
  async generate(data, builder) {
    builder.addHeading(this.getTitle(), 2);

    const topConcepts = this.getTopConcepts(data);
    const totalConcepts = this.getTotalConceptCount(data);

    // Add introduction
    this.addIntroduction(builder, totalConcepts, topConcepts.length);

    // Add concepts table
    this.addConceptsTable(builder, topConcepts);

    // Add category breakdown if applicable
    this.addCategoryBreakdownIfNeeded(builder, topConcepts);

    // Add visualization if configured
    this.addVisualizationIfConfigured(builder, topConcepts);

    return builder;
  }

  /**
   * Add introduction paragraph.
   *
   * @private
   * @param {ReportBuilder} builder - Report builder
   * @param {number} totalConcepts - Total unique concepts
   * @param {number} displayedConcepts - Number of concepts being displayed
   */
  addIntroduction(builder, totalConcepts, displayedConcepts) {
    const intro =
      `Extracted ${totalConcepts} unique concepts through NLP analysis. ` +
      `The following table shows the top ${displayedConcepts} concepts by frequency.`;

    builder.addParagraph(intro);
  }

  /**
   * Add top concepts table.
   *
   * @private
   * @param {ReportBuilder} builder - Report builder
   * @param {Array} topConcepts - Top concepts to display
   */
  addConceptsTable(builder, topConcepts) {
    builder.addSubheading(TopConceptsSection.TABLE_HEADING, 3);

    const headers = [
      TopConceptsSection.HEADER_RANK,
      TopConceptsSection.HEADER_CONCEPT,
      TopConceptsSection.HEADER_FREQUENCY,
      TopConceptsSection.HEADER_FILES,
      TopConceptsSection.HEADER_CATEGORY,
      TopConceptsSection.HEADER_TYPE,
    ];

    const rows = this.buildConceptRows(topConcepts);
    builder.addTable(headers, rows);
  }

  /**
   * Add category breakdown if concept count exceeds threshold.
   *
   * @private
   * @param {ReportBuilder} builder - Report builder
   * @param {Array} topConcepts - Top concepts
   */
  addCategoryBreakdownIfNeeded(builder, topConcepts) {
    if (topConcepts.length < TopConceptsSection.CATEGORY_BREAKDOWN_THRESHOLD) {
      return;
    }

    builder.addSubheading(TopConceptsSection.CATEGORIES_HEADING, 3);

    const categoryCounts = this.countCategories(topConcepts);
    const categoryRows = this.buildCategoryRows(categoryCounts, topConcepts.length);

    const headers = [
      TopConceptsSection.HEADER_CATEGORY_NAME,
      TopConceptsSection.HEADER_COUNT,
      TopConceptsSection.HEADER_PERCENTAGE,
    ];

    builder.addTable(headers, categoryRows);
  }

  /**
   * Add visualization if configured.
   *
   * @private
   * @param {ReportBuilder} builder - Report builder
   * @param {Array} topConcepts - Top concepts
   */
  addVisualizationIfConfigured(builder, topConcepts) {
    if (!this.config.includeMermaidDiagrams) {
      return;
    }

    builder.addSubheading(TopConceptsSection.VISUALIZATION_HEADING, 3);

    const top10 = topConcepts.slice(0, TopConceptsSection.VISUALIZATION_TOP_N).map((c) => ({
      label: c.concept,
      value: c.frequency,
    }));

    builder.addMermaidDiagram('pie', top10);
  }

  /**
   * Get top N concepts from data.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {Array} Top concepts limited to maxConcepts
   */
  getTopConcepts(data) {
    const allConcepts = data.concepts?.topConcepts || [];
    const topN = Math.min(this.maxConcepts, allConcepts.length);
    return allConcepts.slice(0, topN);
  }

  /**
   * Get total concept count from data.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {number} Total unique concepts
   */
  getTotalConceptCount(data) {
    return data.concepts?.topConcepts?.length || 0;
  }

  /**
   * Build concept table rows.
   *
   * @private
   * @param {Array} concepts - Concepts to format
   * @returns {Array<Array>} Table rows
   */
  buildConceptRows(concepts) {
    return concepts.map((concept, index) => [
      index + 1,
      concept.concept,
      concept.frequency.toFixed(TopConceptsSection.FREQUENCY_DECIMAL_PLACES),
      concept.fileCount,
      concept.category || TopConceptsSection.NOT_AVAILABLE,
      concept.type || TopConceptsSection.DEFAULT_TYPE,
    ]);
  }

  /**
   * Count concepts by category.
   *
   * @param {Array} concepts - Concepts to categorize
   * @returns {Object} Category name to count mapping
   */
  countCategories(concepts) {
    const counts = {};

    for (const concept of concepts) {
      const category = concept.category || TopConceptsSection.DEFAULT_CATEGORY;
      counts[category] = (counts[category] || 0) + 1;
    }

    return counts;
  }

  /**
   * Build category breakdown table rows.
   *
   * @private
   * @param {Object} categoryCounts - Category counts
   * @param {number} total - Total concepts
   * @returns {Array<Array>} Table rows
   */
  buildCategoryRows(categoryCounts, total) {
    return Object.entries(categoryCounts).map(([category, count]) => {
      const percentage = (count / total) * TopConceptsSection.PERCENT_MULTIPLIER;
      const formattedPercentage = `${percentage.toFixed(
        TopConceptsSection.PERCENTAGE_DECIMAL_PLACES,
      )}%`;

      return [category, count, formattedPercentage];
    });
  }
}
