/**
 * ExecutiveSummarySection - Generates executive summary for documentation analysis report.
 *
 * This section provides a high-level overview of the analysis including document counts,
 * concept extraction results, graph metrics, and critical findings. It serves as the
 * entry point for understanding the overall documentation health and structure.
 *
 * @example
 * const section = new ExecutiveSummarySection(config);
 * await section.generate(analysisData, builder);
 */
export default class ExecutiveSummarySection {
  // Section configuration
  static SECTION_TITLE = 'Executive summary';
  static METRICS_HEADING = 'Key metrics';
  static FINDINGS_HEADING = 'Critical findings';

  // Metric labels
  static METRIC_DOCUMENTS = 'Total documents';
  static METRIC_CONCEPTS = 'Unique concepts';
  static METRIC_NODES = 'Graph nodes';
  static METRIC_EDGES = 'Graph edges';
  static METRIC_DENSITY = 'Graph density';
  static METRIC_AVG_CONNECTIONS = 'Avg connections';
  static METRIC_QUALITY = 'Quality score';

  // Metric descriptions
  static DESC_DOCUMENTS = 'Documentation files analyzed';
  static DESC_CONCEPTS = 'Concepts extracted via NLP';
  static DESC_NODES = 'Total nodes in knowledge graph';
  static DESC_EDGES = 'Relationships between nodes';
  static DESC_DENSITY = 'Ratio of actual to possible edges';
  static DESC_AVG_CONNECTIONS = 'Average edges per node';
  static DESC_QUALITY = 'Overall documentation quality';

  // Formatting
  static PERCENT_MULTIPLIER = 100;
  static DECIMAL_PLACES = 2;
  static NOT_AVAILABLE = 'N/A';

  /**
   * Create a new ExecutiveSummarySection.
   *
   * @param {Object} config - Section configuration options
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Get the section title.
   *
   * @returns {string} Section title
   */
  getTitle() {
    return ExecutiveSummarySection.SECTION_TITLE;
  }

  /**
   * Generate the executive summary section.
   *
   * Creates an overview paragraph, key metrics table, and critical findings list.
   *
   * @param {Object} data - Analysis data containing documents, concepts, analysis, and quality
   * @param {ReportBuilder} builder - Report builder instance
   * @returns {Promise<ReportBuilder>} Updated builder instance
   */
  async generate(data, builder) {
    builder.addHeading(this.getTitle(), 2);

    // Add overview paragraph
    this.addOverviewParagraph(data, builder);

    // Add metrics table
    this.addMetricsTable(data, builder);

    // Add critical findings
    this.addCriticalFindings(data, builder);

    return builder;
  }

  /**
   * Add high-level overview paragraph.
   *
   * @private
   * @param {Object} data - Analysis data
   * @param {ReportBuilder} builder - Report builder
   */
  addOverviewParagraph(data, builder) {
    const docCount = this.getDocumentCount(data);
    const conceptCount = this.getConceptCount(data);
    const nodeCount = this.getNodeCount(data);
    const edgeCount = this.getEdgeCount(data);

    const overview =
      `This report presents a comprehensive analysis of the documentation repository. ` +
      `The analysis examined ${docCount} documents, extracted ${conceptCount} unique concepts, ` +
      `and built a knowledge graph with ${nodeCount} nodes and ${edgeCount} edges.`;

    builder.addParagraph(overview);
  }

  /**
   * Add key metrics table.
   *
   * @private
   * @param {Object} data - Analysis data
   * @param {ReportBuilder} builder - Report builder
   */
  addMetricsTable(data, builder) {
    builder.addSubheading(ExecutiveSummarySection.METRICS_HEADING, 3);

    const metricsRows = this.buildMetricsRows(data);
    builder.addTable(['Metric', 'Value', 'Details'], metricsRows);
  }

  /**
   * Add critical findings list.
   *
   * @private
   * @param {Object} data - Analysis data
   * @param {ReportBuilder} builder - Report builder
   */
  addCriticalFindings(data, builder) {
    builder.addSubheading(ExecutiveSummarySection.FINDINGS_HEADING, 3);

    const findings = this.extractCriticalFindings(data);
    builder.addList(findings);
  }

  /**
   * Build metrics table rows.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {Array<Array>} Metrics rows
   */
  buildMetricsRows(data) {
    return [
      [
        ExecutiveSummarySection.METRIC_DOCUMENTS,
        this.getDocumentCount(data),
        ExecutiveSummarySection.DESC_DOCUMENTS,
      ],
      [
        ExecutiveSummarySection.METRIC_CONCEPTS,
        this.getConceptCount(data),
        ExecutiveSummarySection.DESC_CONCEPTS,
      ],
      [
        ExecutiveSummarySection.METRIC_NODES,
        this.getNodeCount(data),
        ExecutiveSummarySection.DESC_NODES,
      ],
      [
        ExecutiveSummarySection.METRIC_EDGES,
        this.getEdgeCount(data),
        ExecutiveSummarySection.DESC_EDGES,
      ],
      [
        ExecutiveSummarySection.METRIC_DENSITY,
        this.formatDensity(data),
        ExecutiveSummarySection.DESC_DENSITY,
      ],
      [
        ExecutiveSummarySection.METRIC_AVG_CONNECTIONS,
        this.formatAvgDegree(data),
        ExecutiveSummarySection.DESC_AVG_CONNECTIONS,
      ],
      [
        ExecutiveSummarySection.METRIC_QUALITY,
        this.getQualityScore(data),
        ExecutiveSummarySection.DESC_QUALITY,
      ],
    ];
  }

  /**
   * Get document count from data.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {number} Document count
   */
  getDocumentCount(data) {
    return data.documents?.length || 0;
  }

  /**
   * Get concept count from data.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {number} Concept count
   */
  getConceptCount(data) {
    return data.concepts?.topConcepts?.length || 0;
  }

  /**
   * Get node count from data.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {number} Node count
   */
  getNodeCount(data) {
    return data.analysis?.basic?.totalNodes || 0;
  }

  /**
   * Get edge count from data.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {number} Edge count
   */
  getEdgeCount(data) {
    return data.analysis?.basic?.totalEdges || 0;
  }

  /**
   * Format density as percentage.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {string} Formatted density percentage
   */
  formatDensity(data) {
    const density = data.analysis?.basic?.density || 0;
    const percentage = density * ExecutiveSummarySection.PERCENT_MULTIPLIER;
    return `${percentage.toFixed(ExecutiveSummarySection.DECIMAL_PLACES)}%`;
  }

  /**
   * Format average degree.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {string} Formatted average degree
   */
  formatAvgDegree(data) {
    const avgDegree = data.analysis?.basic?.avgDegree || 0;
    return avgDegree.toFixed(ExecutiveSummarySection.DECIMAL_PLACES);
  }

  /**
   * Get quality score from data.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {string|number} Quality score or 'N/A'
   */
  getQualityScore(data) {
    return data.quality?.overallScore || ExecutiveSummarySection.NOT_AVAILABLE;
  }

  /**
   * Extract critical findings from analysis data.
   *
   * Identifies key insights including top concepts, orphaned documents,
   * graph connectivity, and quality metrics.
   *
   * @param {Object} data - Analysis data
   * @returns {string[]} Array of finding statements
   */
  extractCriticalFindings(data) {
    const findings = [];

    // Add top concept finding
    const topConceptFinding = this.extractTopConceptFinding(data);
    if (topConceptFinding) {
      findings.push(topConceptFinding);
    }

    // Add orphaned documents finding
    const orphanFinding = this.extractOrphanDocumentsFinding(data);
    if (orphanFinding) {
      findings.push(orphanFinding);
    }

    // Add connectivity finding
    const connectivityFinding = this.extractConnectivityFinding(data);
    if (connectivityFinding) {
      findings.push(connectivityFinding);
    }

    // Add quality score finding
    const qualityFinding = this.extractQualityFinding(data);
    if (qualityFinding) {
      findings.push(qualityFinding);
    }

    return findings;
  }

  /**
   * Extract top concept finding.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {string|null} Finding statement or null
   */
  extractTopConceptFinding(data) {
    if (!data.concepts?.topConcepts?.length) {
      return null;
    }

    const topConcept = data.concepts.topConcepts[0];
    const frequency = topConcept.frequency.toFixed(0);
    const fileCount = topConcept.fileCount;

    return `**${topConcept.concept}** is the most mentioned concept with ${frequency} occurrences across ${fileCount} files`;
  }

  /**
   * Extract orphaned documents finding.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {string|null} Finding statement or null
   */
  extractOrphanDocumentsFinding(data) {
    if (!data.structure?.orphanDocuments?.length) {
      return null;
    }

    const count = data.structure.orphanDocuments.length;
    return `${count} orphaned documents identified requiring integration`;
  }

  /**
   * Extract graph connectivity finding.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {string|null} Finding statement or null
   */
  extractConnectivityFinding(data) {
    const isConnected = data.analysis?.basic?.isConnected;

    if (isConnected === true) {
      return 'Documentation forms a fully connected knowledge graph';
    } else if (isConnected === false) {
      return 'Documentation has disconnected components requiring linking';
    }

    return null;
  }

  /**
   * Extract quality score finding.
   *
   * @private
   * @param {Object} data - Analysis data
   * @returns {string|null} Finding statement or null
   */
  extractQualityFinding(data) {
    const score = data.quality?.overallScore;

    if (!score) {
      return null;
    }

    return `Overall quality score: ${score}/100`;
  }
}
