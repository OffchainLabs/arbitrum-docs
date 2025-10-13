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
 * Centralized Thresholds Configuration
 *
 * This module consolidates all magic numbers used throughout the codebase
 * for similarity calculations, clustering, and analysis thresholds.
 *
 * Benefits:
 * - Single source of truth for all threshold values
 * - Easy tuning and experimentation
 * - Clear documentation of what each threshold controls
 * - Prevents duplicate magic numbers across codebase
 */

export const THRESHOLDS = {
  /**
   * SIMILARITY THRESHOLDS
   * Control when concepts/terms are considered similar
   */
  similarity: {
    // Jaccard similarity threshold for merging similar concepts (0-1 scale)
    // Higher values = more strict matching (fewer merges)
    conceptMerge: 0.75,

    // General similarity threshold for creating edges between concepts
    // Used in graph building to connect related concepts
    edgeCreation: 0.3,

    // Fast pre-filtering threshold for character overlap
    // Used to quickly reject obviously dissimilar terms
    fastCheck: 0.6,

    // Length difference tolerance for fast similarity check (0-1 scale)
    // Maximum relative length difference to consider for similarity
    lengthDifference: 0.3,
  },

  /**
   * GRAPH ANALYSIS THRESHOLDS
   * Control community detection and structural analysis
   */
  graph: {
    // Modularity threshold for community structure assessment
    // 0.3-0.7 indicates moderate community structure
    moderateCommunity: 0.3,

    // Similarity threshold for including neighbors in community expansion
    communityNeighbor: 0.3,

    // Minimum community size to apply strict similarity filtering
    minCommunitySize: 50,
  },

  /**
   * QUALITY SCORING WEIGHTS
   * Control how different factors contribute to quality scores
   */
  weights: {
    // Depth reasonableness factor in hierarchy quality scoring
    depthFactor: 0.3,

    // Documents per category factor in hierarchy quality scoring
    docsPerCategoryFactor: 0.3,

    // Giant component contribution to connectivity score
    giantComponent: 0.4,

    // Component count contribution to connectivity score
    componentCount: 0.3,

    // Bridge nodes contribution to connectivity score
    bridgeNodes: 0.15,

    // Articulation points contribution to connectivity score
    articulationPoints: 0.15,
  },

  /**
   * MEMORY AND PERFORMANCE THRESHOLDS
   * Control chunk sizes and efficiency targets
   */
  performance: {
    // Cache hit rate thresholds for memory efficiency
    excellentHitRate: 0.7,
    goodHitRate: 0.5,
    fairHitRate: 0.3,

    // Chunk size multipliers based on graph density
    denseGraphMultiplier: 0.3,
    mediumDensityMultiplier: 0.6,

    // Sampling targets
    highDegreeTarget: 0.3, // Top 30% of nodes by degree
  },

  /**
   * VISUALIZATION THRESHOLDS
   * Control visual appearance and layout
   */
  visualization: {
    // Node opacity in visualization
    nodeOpacity: 0.6,

    // Layout radius multiplier
    radiusMultiplier: 0.3,

    // Node size calculations
    minNodeSize: 0.3,
    sizeScalingFactor: 0.5,
    maxNodeSize: 2.0,
  },

  /**
   * STRUCTURE ANALYSIS THRESHOLDS
   * Control sidebar and content structure assessment
   */
  structure: {
    // Sidebar imbalance threshold
    // If <30% of sidebars are imbalanced, structure is considered good
    imbalanceThreshold: 0.3,

    // Q3 index for quartile calculations (75th percentile)
    q3Percentile: 0.75,
  },
};

/**
 * Get a threshold value by path
 * @param {string} path - Dot notation path (e.g., 'similarity.conceptMerge')
 * @returns {number} The threshold value
 */
export function getThreshold(path) {
  const parts = path.split('.');
  let value = THRESHOLDS;

  for (const part of parts) {
    if (value[part] === undefined) {
      throw new Error(`Threshold not found: ${path}`);
    }
    value = value[part];
  }

  return value;
}

/**
 * Check if a value meets a threshold
 * @param {number} value - The value to check
 * @param {string} path - Threshold path
 * @param {string} operator - Comparison operator ('>', '<', '>=', '<=', '===')
 * @returns {boolean} True if threshold is met
 */
export function meetsThreshold(value, path, operator = '>') {
  const threshold = getThreshold(path);

  switch (operator) {
    case '>':
      return value > threshold;
    case '<':
      return value < threshold;
    case '>=':
      return value >= threshold;
    case '<=':
      return value <= threshold;
    case '===':
      return value === threshold;
    default:
      throw new Error(`Invalid operator: ${operator}`);
  }
}

export default THRESHOLDS;
