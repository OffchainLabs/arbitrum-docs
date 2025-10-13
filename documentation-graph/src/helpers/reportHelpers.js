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
 * Report Generation Helpers
 *
 * Provides utility functions for generating dynamic analysis reports:
 * - Content type discovery from document metadata
 * - Configuration loading and validation with threshold management
 * - Dynamic concept description generation
 * - Threshold flattening for easier access
 *
 * All functions follow SOLID principles with single responsibilities
 * and composition-based design patterns.
 *
 * @module helpers/reportHelpers
 */

/**
 * Calculate percentage for a count
 * @private
 * @param {number} count - Count value
 * @param {number} total - Total value
 * @returns {string} Formatted percentage (1 decimal place)
 */
function calculatePercentage(count, total) {
  return ((count / total) * 100).toFixed(1);
}

/**
 * Extract content type from document
 * @private
 * @param {Object} doc - Document object
 * @returns {string} Content type or 'unspecified'
 */
function extractContentType(doc) {
  return doc?.frontmatter?.content_type || 'unspecified';
}

/**
 * Discover content types from documents by analyzing frontmatter metadata
 *
 * Scans all documents and extracts their content_type from frontmatter,
 * counting occurrences and calculating distribution percentages.
 * Documents without content_type are classified as "unspecified".
 *
 * @param {Map} documents - Map of document objects with frontmatter
 * @returns {Array<Object>} Array of content type objects sorted by frequency, each containing:
 *   - type {string} - Content type name or "unspecified"
 *   - count {number} - Number of documents with this type
 *   - percentage {string} - Percentage of total documents (1 decimal place)
 * @example
 * const types = discoverContentTypes(documents);
 * // [{ type: 'how-to', count: 42, percentage: '35.0' }, ...]
 */
export function discoverContentTypes(documents) {
  if (!documents || documents.size === 0) {
    return [];
  }

  // Count documents by content type
  const typeCounts = new Map();

  for (const doc of documents.values()) {
    const contentType = extractContentType(doc);
    typeCounts.set(contentType, (typeCounts.get(contentType) || 0) + 1);
  }

  // Transform to array with percentages and sort by count
  return Array.from(typeCounts.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: calculatePercentage(count, documents.size),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get default threshold configuration for all analysis categories
 *
 * Returns a complete configuration object with default thresholds for:
 * - Content Quality: shallow content, concept density, similarity detection
 * - Structural: hub documents, directory sizing
 * - Coverage: concept distribution, documentation type representation
 * - Discoverability: linking quality, navigation depth
 * - Navigation: coverage percentages, entry points, structure balance
 *
 * @returns {Object} Default configuration object with nested categories
 * @example
 * const defaults = getDefaultConfiguration();
 * // { contentQuality: { shallowWordCount: 200, ... }, ... }
 */
export function getDefaultConfiguration() {
  return {
    contentQuality: {
      shallowWordCount: 200,
      lowConceptDensity: 5,
      highSimilarityThreshold: 0.8,
    },
    structural: {
      minHubDocuments: 3,
      oversizedDirMultiplier: 2,
    },
    coverage: {
      lowConceptsPerDoc: 2,
      minDirFileCount: 3,
      underrepresentedTypeCount: 3,
    },
    discoverability: {
      substantialDocWordCount: 300,
      poorLinkingThreshold: 2,
      deepNestingDepth: 3,
      deepNestingCount: 10,
    },
    navigation: {
      goodCoveragePercent: 90,
      minEntryPoints: 5,
      maxDeadEnds: 10,
      maxDepth: 5,
    },
  };
}

/**
 * Load configuration from file path
 * @private
 * @param {string} filePath - Path to configuration file
 * @returns {Object|null} Parsed configuration or null if file cannot be read
 */
async function loadConfigurationFile(filePath) {
  try {
    const fs = await import('fs');

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Validate a single threshold value
 * @private
 * @param {*} value - Value to validate
 * @param {string} category - Configuration category
 * @param {string} key - Configuration key
 * @throws {Error} If validation fails
 */
function validateThresholdValue(value, category, key) {
  if (typeof value !== 'number') {
    throw new Error(`Threshold value must be numeric: ${category}.${key}`);
  }

  if (value < 0) {
    throw new Error(`Threshold value cannot be negative: ${category}.${key}`);
  }

  // Validate percentage/threshold values (0-1 range)
  const isPercentageThreshold = key.includes('Threshold') && key !== 'poorLinkingThreshold';
  if (isPercentageThreshold && (value < 0 || value > 1)) {
    throw new Error(`Threshold value must be in range 0-1: ${category}.${key}`);
  }
}

/**
 * Merge and validate configuration with defaults
 * @private
 * @param {Object} userConfig - User-provided configuration
 * @param {Object} defaults - Default configuration
 * @returns {Object} Merged and validated configuration
 */
function mergeAndValidateConfig(userConfig, defaults) {
  const merged = JSON.parse(JSON.stringify(defaults));

  for (const category of Object.keys(defaults)) {
    if (!userConfig[category]) {
      continue;
    }

    for (const key of Object.keys(userConfig[category])) {
      const value = userConfig[category][key];
      validateThresholdValue(value, category, key);
      merged[category][key] = value;
    }
  }

  return merged;
}

/**
 * Load and validate report configuration from file or object
 *
 * Supports loading configuration from:
 * - JSON file path (string) - reads and parses file
 * - Configuration object - validates directly
 * - null/undefined - returns default configuration
 *
 * Performs comprehensive validation:
 * - Ensures all threshold values are numeric
 * - Rejects negative values
 * - Validates percentage thresholds are in 0-1 range
 * - Merges partial configs with defaults
 *
 * @param {string|Object} config - Path to config file or config object
 * @returns {Promise<Object>} Validated configuration object with all thresholds
 * @throws {Error} If validation fails (invalid types, negative values, out of range)
 * @example
 * const config = await loadReportConfiguration('./custom-config.json');
 * const config2 = await loadReportConfiguration({ contentQuality: { shallowWordCount: 150 } });
 */
export async function loadReportConfiguration(config) {
  const defaults = getDefaultConfiguration();

  // Load from file path if string provided
  if (typeof config === 'string') {
    const loadedConfig = await loadConfigurationFile(config);
    config = loadedConfig;
  }

  // Return defaults if no valid config provided
  if (!config || typeof config !== 'object') {
    return defaults;
  }

  // Merge and validate configuration
  return mergeAndValidateConfig(config, defaults);
}

/**
 * Build base description from concept type and category
 * @private
 * @param {string} type - Concept type (domain, technical, etc.)
 * @param {string} category - Concept category
 * @returns {string} Base description
 */
function buildBaseDescription(type, category) {
  if (type === 'domain') {
    return `Domain-specific ${category} concept`;
  }
  if (type === 'technical') {
    return `Technical ${category} terminology`;
  }
  return 'Technical terminology';
}

/**
 * Add file count information to description
 * @private
 * @param {string} description - Current description
 * @param {number} fileCount - Number of files containing concept
 * @returns {string} Description with file count
 */
function appendFileCount(description, fileCount) {
  if (fileCount === 0) {
    return description;
  }
  const plural = fileCount !== 1 ? 's' : '';
  return `${description} found in ${fileCount} file${plural}`;
}

/**
 * Add related concept information to description
 * @private
 * @param {string} description - Current description
 * @param {Map} cooccurrenceMap - Co-occurrence data for all concepts
 * @param {string} concept - The concept to find relations for
 * @returns {string} Description with related concept
 */
function appendRelatedConcept(description, cooccurrenceMap, concept) {
  if (!cooccurrenceMap?.has(concept)) {
    return description;
  }

  const related = cooccurrenceMap.get(concept);
  if (!related?.size) {
    return description;
  }

  const topRelated = Array.from(related.keys())[0];
  if (!topRelated) {
    return description;
  }

  return `${description}, related to ${topRelated}`;
}

/**
 * Truncate description to maximum length
 * @private
 * @param {string} description - Description to truncate
 * @param {number} maxLength - Maximum length (default 100)
 * @returns {string} Truncated description
 */
function truncateDescription(description, maxLength = 100) {
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength - 3) + '...';
}

/**
 * Generate description for a concept dynamically based on its metadata
 *
 * Creates human-readable descriptions by composing information about:
 * - Concept type (domain-specific vs technical)
 * - Category classification
 * - File count (number of documents containing the concept)
 * - Related concepts from co-occurrence data
 *
 * Descriptions are automatically truncated to 100 characters for consistency.
 * Returns a generic "Technical terminology" for unknown concepts.
 *
 * @param {string} concept - The concept name to generate description for
 * @param {Object} conceptData - The full concept data structure containing:
 *   - concepts {Map} - Map of concept names to metadata
 *   - cooccurrence {Map} - Map of concept co-occurrence relationships
 * @returns {string} Generated description (max 100 characters)
 * @example
 * const desc = generateConceptDescription('arbitrum', conceptData);
 * // "Domain-specific blockchain concept found in 42 files, related to rollup"
 */
export function generateConceptDescription(concept, conceptData) {
  // Return default for missing or invalid concept data
  if (!conceptData?.concepts?.has(concept)) {
    return 'Technical terminology';
  }

  const conceptInfo = conceptData.concepts.get(concept);
  if (!conceptInfo) {
    return 'Technical terminology';
  }

  // Extract concept metadata
  const fileCount = conceptInfo.files?.size || 0;
  const type = conceptInfo.type || 'technical';
  const category = conceptInfo.category || 'general';

  // Build description through composition
  let description = buildBaseDescription(type, category);
  description = appendFileCount(description, fileCount);
  description = appendRelatedConcept(description, conceptData.cooccurrence, concept);
  description = truncateDescription(description);

  return description;
}

/**
 * Threshold mapping configuration for flattening nested config
 * @private
 */
const THRESHOLD_MAPPING = {
  // Content Quality thresholds
  shallowWordCount: { category: 'contentQuality', default: 200 },
  lowConceptDensity: { category: 'contentQuality', default: 5 },
  highSimilarityThreshold: { category: 'contentQuality', default: 0.8 },

  // Structural thresholds
  minHubDocuments: { category: 'structural', default: 3 },
  oversizedDirMultiplier: { category: 'structural', default: 2 },

  // Coverage thresholds
  lowConceptsPerDoc: { category: 'coverage', default: 2 },
  minDirFileCount: { category: 'coverage', default: 3 },
  underrepresentedTypeCount: { category: 'coverage', default: 3 },

  // Discoverability thresholds
  substantialDocWordCount: { category: 'discoverability', default: 300 },
  poorLinkingThreshold: { category: 'discoverability', default: 2 },
  deepNestingDepth: { category: 'discoverability', default: 3 },
  deepNestingCount: { category: 'discoverability', default: 10 },

  // Navigation thresholds
  goodCoveragePercent: { category: 'navigation', default: 90 },
  minEntryPoints: { category: 'navigation', default: 5 },
  maxDeadEnds: { category: 'navigation', default: 10 },
  maxDepth: { category: 'navigation', default: 5 },
};

/**
 * Get thresholds from configuration in flattened format
 *
 * Converts nested configuration structure to a flat object for easier access.
 * This eliminates the need to navigate nested categories throughout the codebase.
 *
 * Uses data-driven mapping to extract values and provide defaults.
 * If no config is provided, uses default configuration automatically.
 *
 * @param {Object} config - Configuration object (optional, defaults to getDefaultConfiguration())
 * @returns {Object} Flattened threshold values with all keys at root level:
 *   - shallowWordCount, lowConceptDensity, highSimilarityThreshold
 *   - minHubDocuments, oversizedDirMultiplier
 *   - lowConceptsPerDoc, minDirFileCount, underrepresentedTypeCount
 *   - substantialDocWordCount, poorLinkingThreshold, deepNestingDepth, deepNestingCount
 *   - goodCoveragePercent, minEntryPoints, maxDeadEnds, maxDepth
 * @example
 * const thresholds = getThresholds(config);
 * if (wordCount < thresholds.shallowWordCount) { ... }
 */
export function getThresholds(config) {
  const sourceConfig = config || getDefaultConfiguration();
  const flattened = {};

  for (const [key, mapping] of Object.entries(THRESHOLD_MAPPING)) {
    const categoryData = sourceConfig[mapping.category];
    flattened[key] = categoryData?.[key] ?? mapping.default;
  }

  return flattened;
}

/**
 * Generate markdown section for content types discovered from documents
 *
 * Creates a formatted markdown list showing content type distribution
 * with counts and percentages. Uses discoverContentTypes() to extract
 * actual content types from document frontmatter.
 *
 * @param {Map} documents - Map of document objects with frontmatter
 * @returns {string} Formatted markdown section with content type list
 * @example
 * const section = generateContentTypesSection(documents);
 * // Returns:
 * // - **how-to**: 42 documents (35.0%)
 * // - **concept**: 30 documents (25.0%)
 */
export function generateContentTypesSection(documents) {
  const contentTypes = discoverContentTypes(documents);

  if (contentTypes.length === 0) {
    return '- No content types found';
  }

  return contentTypes
    .map(
      ({ type, count, percentage }) =>
        `- **${type}**: ${count} document${count !== 1 ? 's' : ''} (${percentage}%)`,
    )
    .join('\n');
}
