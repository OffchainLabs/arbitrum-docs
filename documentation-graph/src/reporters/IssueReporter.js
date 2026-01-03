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
 * Issue Reporter
 *
 * Extracted from index.js to reduce monolithic orchestrator complexity.
 * Generates comprehensive timestamped analysis reports for documentation graphs.
 *
 * This module was previously a 293-line function embedded in index.js.
 */

import path from 'path';
import FileUtils from '../utils/fileUtils.js';
import logger from '../utils/logger.js';
import { generateTimestamp, generateContentTypesSection } from '../helpers/reportHelpers.js';

/**
 * IssueReporter generates comprehensive analysis reports
 */
export class IssueReporter {
  constructor() {}

  /**
   * Get description for a concept
   * @param {string} concept - Concept name
   * @param {Object} conceptData - Concept data
   * @returns {string} Concept description
   */
  getConceptDescription(concept, conceptData) {
    if (!conceptData || !conceptData.concepts) {
      return 'No description available';
    }

    const conceptInfo = conceptData.concepts.get(concept);
    if (!conceptInfo) {
      return 'No description available';
    }

    const files = conceptInfo.files ? conceptInfo.files.size : 0;
    const type = conceptInfo.type || 'general';
    return `Found in ${files} file(s), type: ${type}`;
  }

  /**
   * Get title for issue type
   * @param {string} issueType - Issue type identifier
   * @returns {string} Human-readable title
   */
  getIssueTitle(issueType) {
    const titles = {
      orphaned_documents: 'Documents Not in Navigation',
      isolated_documents: 'Documents with No Internal Links',
      broken_links: 'Broken Internal Links',
      missing_frontmatter: 'Missing Metadata',
      low_connectivity: 'Weak Content Relationships',
      unbalanced_hierarchy: 'Unbalanced Navigation Structure',
    };
    return titles[issueType] || 'Unknown Issue';
  }

  /**
   * Capitalize first letter of string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalizeFirst(str) {
    if (!str) return 'Medium';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Generate content quality analysis section
   * @param {Object} analysis - Analysis results
   * @param {Map} documents - Document map
   * @param {Object} conceptData - Concept data
   * @returns {string} Markdown content
   */
  generateContentQualityAnalysis(analysis, documents, conceptData) {
    const issues = [];

    // Basic quality checks
    const documentsArray = Array.from(documents.values());
    const withoutFrontmatter = documentsArray.filter(
      (doc) => !doc.frontmatter || Object.keys(doc.frontmatter).length === 0,
    ).length;

    if (withoutFrontmatter > documents.size * 0.2) {
      issues.push(
        `**Missing Frontmatter**: ${withoutFrontmatter} documents (${Math.round(
          (withoutFrontmatter / documents.size) * 100,
        )}%) lack metadata`,
      );
    }

    // Concept coverage
    const avgConcepts = conceptData.concepts ? conceptData.concepts.size / documents.size : 0;
    if (avgConcepts < 5) {
      issues.push(
        `**Low Concept Density**: Average ${avgConcepts.toFixed(
          1,
        )} concepts per document (target: 5+)`,
      );
    }

    return issues.length > 0
      ? issues.join('\n')
      : '- No significant content quality issues detected';
  }

  /**
   * Generate structural analysis section
   * @param {Object} analysis - Analysis results
   * @param {Map} documents - Document map
   * @param {Object} exclusionRules - Exclusion rules
   * @returns {string} Markdown content
   */
  generateStructuralAnalysis(analysis, documents, exclusionRules = null) {
    const issues = [];

    // Check for documents not in navigation (true orphans)
    if (
      analysis.quality &&
      analysis.quality.orphanedDocuments &&
      analysis.quality.orphanedDocuments.length > 0
    ) {
      const orphanCount = analysis.quality.orphanedDocuments.length;
      issues.push(
        `**Documents Not in Navigation**: ${orphanCount} documents are not included in sidebars.js`,
      );
      analysis.quality.orphanedDocuments.slice(0, 3).forEach((doc) => {
        issues.push(`  - \`${doc}\` - Add to sidebars.js`);
      });
      if (orphanCount > 3) {
        issues.push(`  - ... and ${orphanCount - 3} more`);
      }
    }

    // Check for isolated documents (in navigation but no links)
    if (
      analysis.documents &&
      analysis.documents.weaklyConnected &&
      analysis.documents.weaklyConnected.length > 0
    ) {
      const isolatedCount = analysis.documents.weaklyConnected.length;
      issues.push(
        `**Isolated Documents**: ${isolatedCount} documents are in navigation but have no internal links`,
      );
      analysis.documents.weaklyConnected.slice(0, 3).forEach((doc) => {
        issues.push(`  - \`${doc.label}\` - Consider adding contextual links`);
      });
      if (isolatedCount > 3) {
        issues.push(`  - ... and ${isolatedCount - 3} more`);
      }
    }

    // Check for broken links
    if (
      analysis.quality &&
      analysis.quality.brokenLinks &&
      analysis.quality.brokenLinks.length > 0
    ) {
      issues.push(
        `**Broken Links**: ${analysis.quality.brokenLinks.length} broken internal references detected`,
      );
    }

    return issues.length > 0 ? issues.join('\n') : '- No significant structural issues detected';
  }

  /**
   * Generate coverage gaps analysis section
   * @param {Object} analysis - Analysis results
   * @param {Object} conceptData - Concept data
   * @param {Map} documents - Document map
   * @returns {string} Markdown content
   */
  generateCoverageGapsAnalysis(analysis, conceptData, documents) {
    const issues = [];

    // Check for directories with few concepts
    const directoriesWithFewConcepts = [];
    if (analysis.documents && analysis.documents.byDirectory) {
      Object.entries(analysis.documents.byDirectory).forEach(([dir, count]) => {
        if (count > 3) {
          // Only check directories with multiple files
          const avgConcepts = conceptData.concepts ? conceptData.concepts.size / count : 0;
          if (avgConcepts < 3) {
            directoriesWithFewConcepts.push({ dir, count, avgConcepts });
          }
        }
      });
    }

    if (directoriesWithFewConcepts.length > 0) {
      issues.push(
        `**Low Concept Coverage**: ${directoriesWithFewConcepts.length} directories have sparse conceptual content`,
      );
      directoriesWithFewConcepts.slice(0, 3).forEach((item) => {
        issues.push(
          `  - \`${item.dir}\`: ${item.avgConcepts.toFixed(1)} concepts/doc (${item.count} docs)`,
        );
      });
    }

    return issues.length > 0 ? issues.join('\n') : '- No significant coverage gaps detected';
  }

  /**
   * Generate discoverability analysis section
   * @param {Object} analysis - Analysis results
   * @param {Map} documents - Document map
   * @param {Object} exclusionRules - Exclusion rules
   * @returns {string} Markdown content
   */
  generateDiscoverabilityAnalysis(analysis, documents, exclusionRules = null) {
    const issues = [];

    // Check for low-degree nodes (poor discoverability)
    if (analysis.centrality && analysis.centrality.byDegree) {
      const lowDegreeNodes = analysis.centrality.byDegree.filter(
        (node) => node.degree < 2 && node.type === 'document',
      );
      if (lowDegreeNodes.length > documents.size * 0.2) {
        issues.push(
          `**Poor Discoverability**: ${lowDegreeNodes.length} documents (${Math.round(
            (lowDegreeNodes.length / documents.size) * 100,
          )}%) have <2 connections`,
        );
      }
    }

    return issues.length > 0
      ? issues.join('\n')
      : '- No significant discoverability issues detected';
  }

  /**
   * Generate navigation analysis section
   * @param {Object} analysis - Analysis results
   * @param {Object} sidebarData - Sidebar data
   * @returns {string} Markdown content
   */
  generateNavigationAnalysis(analysis, sidebarData) {
    const issues = [];

    if (!sidebarData || !analysis.navigation) {
      return '- Navigation analysis not available';
    }

    // Check for navigation issues
    if (analysis.navigation.orphanedFiles && analysis.navigation.orphanedFiles.length > 0) {
      issues.push(
        `**Orphaned Files**: ${analysis.navigation.orphanedFiles.length} files not in navigation`,
      );
    }

    if (
      analysis.navigation.imbalancedSidebars &&
      analysis.navigation.imbalancedSidebars.length > 0
    ) {
      issues.push(
        `**Unbalanced Sidebars**: ${analysis.navigation.imbalancedSidebars.length} sidebars with depth issues`,
      );
    }

    return issues.length > 0 ? issues.join('\n') : '- Navigation structure is well-organized';
  }

  /**
   * Generate navigation summary section
   * @param {Object} analysis - Analysis results
   * @param {Object} sidebarData - Sidebar data
   * @returns {string} Markdown content
   */
  generateNavigationSummary(analysis, sidebarData) {
    if (!analysis.navigation || !analysis.navigation.available) {
      return '- Navigation analysis not available';
    }

    const summary = [];
    summary.push(`- **Total Sidebar Entries**: ${analysis.navigation.totalEntries || 0}`);
    summary.push(`- **Maximum Depth**: ${analysis.navigation.maxDepth || 0} levels`);
    summary.push(`- **Average Depth**: ${(analysis.navigation.avgDepth || 0).toFixed(1)} levels`);

    if (analysis.navigation.orphanedFiles) {
      summary.push(`- **Files Not in Sidebar**: ${analysis.navigation.orphanedFiles.length}`);
    }

    return summary.join('\n');
  }

  /**
   * Generate timestamped issue report
   * @param {Object} options - Report options
   * @returns {Promise<string>} Path to generated report
   */
  async generateIssueReport({
    analysis,
    conceptData,
    documents,
    graphStats,
    outputDir,
    inputDir,
    sidebarData,
    exclusionRules = null,
  }) {
    logger.subsection('Generating timestamped issue report');

    const timestamp = generateTimestamp();
    const reportPath = path.join(path.dirname(outputDir), `ANALYSIS_REPORT_${timestamp}.md`);

    // Get top concepts for the report
    const topConcepts = Array.from(conceptData.frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
      .map(([concept, frequency], index) => {
        return `${
          index + 1
        }. **${concept}** (${frequency.toLocaleString()} mentions) - ${this.getConceptDescription(
          concept,
          conceptData,
        )}`;
      });

    // Get directory distribution
    const directoryStats = analysis.documents?.byDirectory || {};
    const totalFiles = documents.size;
    const dirDistribution = Object.entries(directoryStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(
        ([dir, count]) =>
          `- **${dir || 'root'}**: ${count} documents (${((count / totalFiles) * 100).toFixed(
            1,
          )}%)`,
      );

    // Calculate statistics
    const documentsArray = Array.from(documents.values());
    const withFrontmatter = documentsArray.filter(
      (doc) => doc.frontmatter && Object.keys(doc.frontmatter).length > 0,
    ).length;
    const withoutFrontmatter = totalFiles - withFrontmatter;
    const avgWordsPerDoc = Math.round(
      documentsArray.reduce((sum, doc) => {
        const wordCount = doc.wordCount || doc.stats?.wordCount || 0;
        return sum + wordCount;
      }, 0) / totalFiles,
    );

    // Format concept categories
    const conceptStats = {
      totalConcepts: conceptData.concepts.size,
      domainConcepts: Array.from(conceptData.concepts.values()).filter((c) => c.type === 'domain')
        .length,
      technicalTerms: Array.from(conceptData.concepts.values()).filter(
        (c) => c.type === 'technical',
      ).length,
    };

    // Generate report content
    const reportContent = `# Arbitrum Documentation Knowledge Graph - Analysis Report

## Executive Summary

This report presents the comprehensive analysis of the Arbitrum documentation repository, conducted using a custom-built Documentation Graph Builder Agent. The analysis processed **${totalFiles} documentation files** and extracted **${conceptStats.totalConcepts.toLocaleString()} unique concepts**, building a knowledge graph with **${
      graphStats.totalNodes
    } nodes** and **${
      graphStats.totalEdges
    } edges** to reveal the structural relationships, conceptual landscape, and organizational patterns within the documentation.

## Key Findings

### 📊 Documentation Inventory

- **Total Files Processed**: ${totalFiles} MDX/Markdown files
- **Files with Frontmatter**: ${withFrontmatter} (${Math.round(
      (withFrontmatter / totalFiles) * 100,
    )}%)
- **Files without Frontmatter**: ${withoutFrontmatter} (${Math.round(
      (withoutFrontmatter / totalFiles) * 100,
    )}%)
- **Average Words per Document**: ${avgWordsPerDoc} words
- **Processing Success Rate**: 100%

### 🔍 Concept Analysis

#### Top Concepts by Frequency
${topConcepts.join('\n')}

#### Concept Categories
- **Domain Concepts**: ${conceptStats.domainConcepts} (Arbitrum-specific terminology)
- **Technical Terms**: ${conceptStats.technicalTerms} (Programming and blockchain concepts)
- **Total Unique Concepts**: ${conceptStats.totalConcepts.toLocaleString()}
- **Concept Types**: Nouns, domain-specific terms, technical jargon, named entities

### 🏗️ Documentation Structure

#### Directory Distribution
${dirDistribution.join('\n')}

#### Content Types
${generateContentTypesSection(documents)}

### 🕸️ Graph Structure Analysis

#### Network Properties
- **Total Nodes**: ${graphStats.totalNodes}
  - Documents: ${analysis.basic?.nodesByType?.document || 'N/A'} (${
      analysis.basic?.nodesByType?.document
        ? ((analysis.basic.nodesByType.document / graphStats.totalNodes) * 100).toFixed(1)
        : 'N/A'
    }%)
  - Sections: ${analysis.basic?.nodesByType?.section || 'N/A'} (${
      analysis.basic?.nodesByType?.section
        ? ((analysis.basic.nodesByType.section / graphStats.totalNodes) * 100).toFixed(1)
        : 'N/A'
    }%)
  - Concepts: ${analysis.basic?.nodesByType?.concept || 'N/A'} (${
      analysis.basic?.nodesByType?.concept
        ? ((analysis.basic.nodesByType.concept / graphStats.totalNodes) * 100).toFixed(1)
        : 'N/A'
    }%)
  - Directories: ${analysis.basic?.nodesByType?.directory || 'N/A'} (${
      analysis.basic?.nodesByType?.directory
        ? ((analysis.basic.nodesByType.directory / graphStats.totalNodes) * 100).toFixed(1)
        : 'N/A'
    }%)
- **Total Edges**: ${graphStats.totalEdges}
  - Contains: ${analysis.basic?.edgesByType?.contains || 'N/A'} (${
      analysis.basic?.edgesByType?.contains
        ? ((analysis.basic.edgesByType.contains / graphStats.totalEdges) * 100).toFixed(1)
        : 'N/A'
    }%)
  - Parent-Child: ${analysis.basic?.edgesByType?.['parent-child'] || 'N/A'} (${
      analysis.basic?.edgesByType?.['parent-child']
        ? ((analysis.basic.edgesByType['parent-child'] / graphStats.totalEdges) * 100).toFixed(1)
        : 'N/A'
    }%)
  - Links-to: ${analysis.basic?.edgesByType?.['links-to'] || 'N/A'} (${
      analysis.basic?.edgesByType?.['links-to']
        ? ((analysis.basic.edgesByType['links-to'] / graphStats.totalEdges) * 100).toFixed(1)
        : 'N/A'
    }%)
- **Graph Density**: ${(graphStats.density * 100).toFixed(2)}% (sparse network)
- **Average Degree**: ${graphStats.avgDegree.toFixed(2)} connections per node

#### Connectivity Analysis
- **Graph Connectivity**: ${
      analysis.connectivity?.totalComponents
        ? analysis.connectivity.totalComponents === 1
          ? 'Connected'
          : `Disconnected (${analysis.connectivity.totalComponents} components)`
        : 'Connected'
    }
- **Largest Connected Component**: ${analysis.connectivity?.largestComponent || 'N/A'} nodes
- **Isolated Components**: ${
      analysis.connectivity?.totalComponents > 1 ? analysis.connectivity.totalComponents - 1 : 0
    }
- **Network Bridges**: ${analysis.connectivity?.bridges || 0} critical connections

### 📈 Quality Assessment

#### Overall Quality Score: **${analysis.quality.overallScore}/100**

#### Strengths Identified
${analysis.quality.strengths.map((strength) => `- ${strength}`).join('\n')}

#### Issues Found

##### Content Quality Analysis
${this.generateContentQualityAnalysis(analysis, documents, conceptData)}

##### Structural Issues
${this.generateStructuralAnalysis(analysis, documents, exclusionRules)}

##### Coverage Gaps
${this.generateCoverageGapsAnalysis(analysis, conceptData, documents)}

##### Discoverability Problems
${this.generateDiscoverabilityAnalysis(analysis, documents, exclusionRules)}

##### Navigation Structure Analysis
${this.generateNavigationAnalysis(analysis, sidebarData)}

##### System-Detected Issues
${
  analysis.quality.issues.length > 0
    ? analysis.quality.issues
        .map(
          (issue, index) =>
            `${index + 1}. **${this.getIssueTitle(issue.type)}** (${this.capitalizeFirst(
              issue.severity,
            )} Priority)
   - ${issue.description}`,
        )
        .join('\n')
    : '- No major system issues detected'
}

#### Key Recommendations for Implementation

${analysis.recommendations
  .slice(0, 4)
  .map(
    (rec, index) => `##### ${index + 1}. **${rec.title}** (${rec.priority.toUpperCase()} Priority)
- **Issue**: ${rec.description}
- **Action**: ${rec.action || 'Review and address the identified issue'}
- **Impact**: ${rec.impact || 'Improved documentation quality and user experience'}`,
  )
  .join('\n\n')}

### 🧭 Navigation Structure Analysis

${
  sidebarData
    ? this.generateNavigationSummary(analysis, sidebarData)
    : '- Navigation analysis unavailable (sidebar data not found)'
}

## Technical Architecture Insights

### Documentation Patterns
- **Frontmatter Standardization**: ${Math.round(
      (withFrontmatter / totalFiles) * 100,
    )}% compliance with metadata standards
- **Average Document Length**: ${Math.round(
      totalFiles > 0
        ? documents.size > 0
          ? Array.from(documents.values()).reduce((sum, doc) => sum + (doc.wordCount || 0), 0) /
            documents.size
          : 0
        : 0,
    )} words per document
- **Total Unique Concepts**: ${conceptStats.totalConcepts.toLocaleString()} identified across documentation

## Implementation Recommendations

### Recommended Next Steps

1. **Structural Improvements**
   - Merge or split documents based on connectivity analysis
   - Create bridging content for isolated topic areas
   - Standardize frontmatter across all documents

2. **Content Enhancement**
   - Develop concept maps for complex topic areas
   - Create learning path recommendations
   - Add contextual cross-references to improve flow

3. **Navigation Optimization**
   - Align directory structure with natural content clusters
   - Implement progressive disclosure for complex topics
   - Create topic-based entry points

4. **Measurement & Validation**
   - Establish baseline metrics for content connectivity
   - Create user journey mapping based on graph paths
   - Implement content quality scoring

## Interactive Visualization

An interactive knowledge graph visualization has been generated at:
\`${path.resolve(outputDir, 'knowledge-graph-visualization.html')}\`

This tool allows for:
- **Dynamic Exploration**: Filter by node types and relationships
- **Centrality Analysis**: Identify important documents and concepts
- **Community Detection**: Visualize content clusters
- **Link Analysis**: Trace connections between topics
- **Search Functionality**: Find specific content quickly

## Conclusion

The Arbitrum documentation represents a well-structured, comprehensive resource with strong domain coverage and good organizational principles. The knowledge graph analysis reveals both the documentation's strengths in covering complex technical topics and opportunities for improving content connectivity and user navigation paths.

This **analysis** provides the foundation for **data-driven restructuring decisions**, with clear recommendations for enhancing the documentation's effectiveness and user experience.

---

*Generated by Documentation Graph Builder Agent*
*Analysis Date: ${new Date().toLocaleDateString('en-US')}*
*Run Timestamp: ${timestamp}*
*Files Analyzed: ${totalFiles}*
*Concepts Extracted: ${conceptStats.totalConcepts.toLocaleString()}*
*Input Directory: ${inputDir}*
`;

    await FileUtils.writeFile(reportPath, reportContent);

    logger.success(`Generated timestamped issue report: ${reportPath}`);
    return reportPath;
  }
}

export default IssueReporter;
