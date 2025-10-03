# Usage Examples

This document provides real-world examples of using the Documentation Analysis MCP Server with Claude Code CLI.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Queries](#basic-queries)
3. [Interactive Workflows](#interactive-workflows)
4. [Advanced Analysis](#advanced-analysis)
5. [Common Patterns](#common-patterns)

## Getting Started

### Prerequisites

1. Ensure the MCP server is configured in Claude Code CLI
2. Run the documentation-graph analysis tool first:
   ```shell
   cd documentation-graph
   npm start
   ```
3. Start Claude Code CLI

### Verify MCP Server Connection

In Claude Code CLI:

```
Can you list the available documentation analysis tools?
```

Expected response: List of 8 tools (4 Tier 1, 4 Tier 2)

## Basic Queries

### Example 1: Find Duplicate Content for a Topic

**User Query:**

```
Find duplicate content for "gas optimization"
```

**Claude's MCP Call:**

```javascript
find_duplicate_content({
  topic: 'gas optimization',
  min_similarity: 0.7,
  include_exact: true,
  include_conceptual: true,
});
```

**Expected Output:**

```json
{
  "found": true,
  "topic": "gas optimization",
  "totalDocuments": 15,
  "duplicatePairs": 8,
  "clusters": [
    {
      "documents": [
        {
          "path": "build-dapps/concepts/gas-fees.mdx",
          "title": "Understanding Gas Fees on Arbitrum",
          "contentType": "concept",
          "wordCount": 850
        },
        {
          "path": "build-dapps/how-tos/optimize-gas.mdx",
          "title": "How to Optimize Gas Usage",
          "contentType": "how-to",
          "wordCount": 620
        },
        {
          "path": "for-devs/troubleshooting/high-gas-costs.mdx",
          "title": "Troubleshooting High Gas Costs",
          "contentType": "troubleshooting",
          "wordCount": 450
        }
      ],
      "avgSimilarity": 0.85,
      "recommendation": "HIGH PRIORITY: Consider consolidating these 3 documents"
    }
  ],
  "topDuplicatePairs": [
    {
      "doc1": {
        "path": "build-dapps/concepts/gas-fees.mdx",
        "title": "Understanding Gas Fees on Arbitrum"
      },
      "doc2": {
        "path": "build-dapps/how-tos/optimize-gas.mdx",
        "title": "How to Optimize Gas Usage"
      },
      "overallSimilarity": 0.87,
      "recommendation": "HIGHLY_DUPLICATE - Strong candidate for consolidation"
    }
  ]
}
```

**Follow-up Actions:**

- Review the cluster of 3 documents
- Check the duplicated text segments
- Consider consolidation strategy

### Example 2: Analyze Topic Scattering

**User Query:**

```
Is "Orbit deployment" scattered across multiple documents?
```

**Claude's MCP Call:**

```javascript
find_scattered_topics({
  concept: 'Orbit deployment',
  depth: 'full',
  min_fragmentation: 0.6,
});
```

**Expected Output:**

```json
{
  "found": true,
  "conceptName": "Orbit",
  "isScattered": true,
  "fragmentationScore": 0.78,
  "metrics": {
    "totalDocuments": 12,
    "totalWeight": 485.3,
    "maxConcentration": "18.5%",
    "giniCoefficient": "0.234",
    "averageWeight": 40.44
  },
  "documentMentions": [
    {
      "path": "build-dapps/orbit/quickstart.mdx",
      "weight": 89.7,
      "percentage": "18.5%"
    },
    {
      "path": "build-dapps/orbit/orbit-gentle-introduction.mdx",
      "weight": 72.3,
      "percentage": "14.9%"
    }
    // ... 10 more documents
  ],
  "directoryDistribution": [
    {
      "directory": "build-dapps/orbit",
      "documentCount": 7,
      "percentage": "58.3%"
    },
    {
      "directory": "launch-orbit-chain",
      "documentCount": 3,
      "percentage": "25.0%"
    },
    {
      "directory": "run-arbitrum-node",
      "documentCount": 2,
      "percentage": "16.7%"
    }
  ],
  "navigationIssues": [
    {
      "type": "SCATTERED_NAVIGATION",
      "severity": "MEDIUM",
      "count": 3,
      "description": "Content scattered across 3 different navigation categories"
    }
  ],
  "recommendation": [
    {
      "action": "CREATE_CANONICAL",
      "priority": "HIGH",
      "description": "Create a single canonical reference document for this topic (currently in 12 documents)"
    },
    {
      "action": "REORGANIZE",
      "priority": "MEDIUM",
      "description": "Content scattered across 3 directories - consider reorganization"
    }
  ]
}
```

**Follow-up Actions:**

- Create a comprehensive Orbit deployment guide
- Consolidate related content
- Update cross-links

### Example 3: Compare Two Documents

**User Query:**

```
Compare "build-dapps/orbit/quickstart.mdx" and "launch-orbit-chain/how-tos/orbit-quickstart.mdx"
```

**Claude's MCP Call:**

```javascript
find_content_overlaps({
  doc_path_1: 'build-dapps/orbit/quickstart.mdx',
  doc_path_2: 'launch-orbit-chain/how-tos/orbit-quickstart.mdx',
  detailed: true,
});
```

**Expected Output:**

```json
{
  "doc1": {
    "path": "build-dapps/orbit/quickstart.mdx",
    "title": "Quickstart: Launch Your Orbit Chain",
    "contentType": "quickstart",
    "wordCount": 850
  },
  "doc2": {
    "path": "launch-orbit-chain/how-tos/orbit-quickstart.mdx",
    "title": "How to Launch an Orbit Chain",
    "contentType": "how-to",
    "wordCount": 920
  },
  "overallSimilarity": 0.89,
  "isDuplicate": true,
  "recommendation": "HIGHLY_DUPLICATE - Strong candidate for consolidation",
  "breakdown": {
    "exactTextSimilarity": 0.92,
    "conceptualOverlap": 0.88,
    "semanticSimilarity": 0.87
  },
  "sharedConcepts": [
    {
      "concept": "Orbit",
      "weight1": 89.7,
      "weight2": 95.3,
      "avgWeight": 92.5
    },
    {
      "concept": "deployment",
      "weight1": 45.2,
      "weight2": 48.7,
      "avgWeight": 46.95
    }
  ],
  "duplicatedTextSegments": [
    {
      "text": "Orbit chains are Arbitrum chains that settle to another Arbitrum chain...",
      "similarity": 0.98
    },
    {
      "text": "Prerequisites: Node.js >= 16, Ethereum wallet with testnet ETH...",
      "similarity": 0.95
    }
  ]
}
```

**Follow-up Actions:**

- These are nearly identical → merge into single document
- Choose one as canonical (likely the concept doc)
- Add redirect from old location

## Interactive Workflows

### Workflow 1: Consolidation Exploration

**Step 1: Discover Topic**

**User:**

```
Show me all documentation about Orbit deployment
```

**Claude:**

```javascript
analyze_topic_distribution({
  concept: 'Orbit',
  include_recommendations: true,
});
```

**Result:** 12 documents found, scattered across 3 directories

---

**Step 2: Identify Overlaps**

**User:**

```
Which of those documents have overlapping content?
```

**Claude:**

```javascript
find_duplicate_content({
  topic: 'Orbit',
  min_similarity: 0.7,
});
```

**Result:** 3 clusters of similar documents identified

---

**Step 3: Get Consolidation Advice**

**User:**

```
Suggest how to consolidate the top cluster
```

**Claude:**

```javascript
suggest_consolidation({
  doc_paths: [
    'build-dapps/orbit/quickstart.mdx',
    'launch-orbit-chain/how-tos/orbit-quickstart.mdx',
    'run-arbitrum-node/how-tos/run-orbit-node.mdx',
  ],
  include_alternatives: true,
});
```

**Result:**

```json
{
  "strategy": [
    {
      "strategy": "MERGE",
      "priority": "HIGH",
      "confidence": "0.885",
      "description": "Documents are highly similar (88.5%) - strong candidate for merging",
      "steps": [
        "Identify the best base document (highest word count or centrality)",
        "Merge unique content from other documents",
        "Preserve all unique examples and code snippets",
        "Update all internal links to point to consolidated document",
        "Archive or redirect old documents"
      ]
    },
    {
      "strategy": "CANONICAL_WITH_CROSSLINKS",
      "priority": "MEDIUM",
      "confidence": "0.750",
      "description": "Documents serve different purposes - create canonical reference and cross-link",
      "steps": [
        "Keep how-to and quickstart documents separate",
        "Add clear cross-links between all related documents",
        "Ensure canonical document is comprehensive"
      ]
    }
  ]
}
```

---

**Step 4: Execute Consolidation**

**User:**

```
I'll merge them. Which should be the primary document?
```

**Claude:**

```javascript
suggest_canonical_reference({
  topic: 'Orbit',
  include_alternatives: true,
});
```

**Result:**

```json
{
  "recommendation": {
    "document": {
      "path": "build-dapps/orbit/orbit-gentle-introduction.mdx",
      "title": "Orbit Gentle Introduction"
    },
    "confidence": "0.892",
    "reasoning": "High topic focus (28.5% of total weight); Comprehensive (1,450 words); Appropriate content type (gentle-introduction); In navigation structure"
  },
  "alternatives": [
    {
      "document": {
        "path": "build-dapps/orbit/quickstart.mdx"
      },
      "confidence": "0.845"
    }
  ]
}
```

### Workflow 2: Canonical Reference Selection

**Step 1: Find All Mentions**

**User:**

```
Find all mentions of "gas optimization"
```

**Claude:**

```javascript
analyze_topic_distribution({
  concept: 'gas optimization',
});
```

**Result:** 23 documents mention this topic

---

**Step 2: Check for Duplicates**

**User:**

```
Are there duplicated explanations?
```

**Claude:**

```javascript
find_duplicate_content({
  topic: 'gas optimization',
  min_similarity: 0.8,
});
```

**Result:** 3 documents with high similarity (>80%), 5 more with moderate similarity (70-80%)

---

**Step 3: Select Canonical**

**User:**

```
Which should be the canonical reference?
```

**Claude:**

```javascript
suggest_canonical_reference({
  topic: 'gas optimization',
});
```

**Result:**

```json
{
  "recommendation": {
    "document": {
      "path": "build-dapps/concepts/gas-fees.mdx",
      "title": "Understanding Gas Fees on Arbitrum"
    },
    "confidence": "0.915",
    "reasoning": "High topic focus (45.2% of total weight); Well-connected in documentation graph; Comprehensive (1,250 words); Appropriate content type (concept); In navigation structure"
  }
}
```

---

**Step 4: Plan Updates**

**User:**

```
What should I do with the other documents?
```

**Claude provides guidance:**

1. Keep "concepts/gas-fees.mdx" as canonical reference
2. Update "how-tos/optimize-gas.mdx" to focus on practical steps, link to canonical
3. Update "troubleshooting/high-gas-costs.mdx" to link to canonical for background
4. Remove duplicated conceptual content from how-to and troubleshooting docs

## Advanced Analysis

### Example 4: Find All Scattered Topics

**User Query:**

```
Find all topics that are scattered across the documentation
```

**Claude's MCP Call:**

```javascript
find_scattered_topics({
  depth: 'semantic',
  min_fragmentation: 0.6,
});
```

**Expected Output:**

```json
{
  "found": true,
  "totalScatteredTopics": 15,
  "topics": [
    {
      "concept": "Orbit",
      "fragmentationScore": 0.78,
      "documentCount": 12,
      "maxConcentration": "18.5%",
      "recommendation": [
        {
          "action": "CREATE_CANONICAL",
          "priority": "HIGH"
        }
      ]
    },
    {
      "concept": "gas",
      "fragmentationScore": 0.72,
      "documentCount": 23,
      "maxConcentration": "22.3%"
    },
    {
      "concept": "sequencer",
      "fragmentationScore": 0.68,
      "documentCount": 18,
      "maxConcentration": "25.1%"
    }
    // ... 12 more topics
  ]
}
```

**Use Case:** Prioritize documentation improvement efforts

### Example 5: Find Orphaned Content

**User Query:**

```
Find all orphaned concept documents
```

**Claude's MCP Call:**

```javascript
find_orphaned_content({
  include_partial_orphans: true,
  filter_content_type: 'concept',
});
```

**Expected Output:**

```json
{
  "found": true,
  "totalOrphaned": 5,
  "totalPartiallyOrphaned": 3,
  "orphanedDocuments": [
    {
      "path": "build-dapps/advanced/custom-fee-token.mdx",
      "title": "Custom Fee Tokens",
      "contentType": "concept",
      "directory": "build-dapps/advanced"
    },
    {
      "path": "build-dapps/arbitrum-vs-ethereum.mdx",
      "title": "Arbitrum vs Ethereum",
      "contentType": "concept",
      "directory": "build-dapps"
    }
  ],
  "partiallyOrphanedDocuments": [
    {
      "path": "launch-orbit-chain/orbit-sdk-introduction.mdx",
      "title": "Orbit SDK Introduction",
      "linkCount": 2
    }
  ],
  "recommendation": "Add these documents to the navigation structure (sidebars.js) or link them from existing documents"
}
```

**Use Case:** Improve discoverability of isolated content

### Example 6: Find Similar Documents

**User Query:**

```
Find documents similar to "build-dapps/orbit/quickstart.mdx"
```

**Claude's MCP Call:**

```javascript
find_similar_documents({
  doc_path: 'build-dapps/orbit/quickstart.mdx',
  limit: 5,
  min_similarity: 0.6,
});
```

**Expected Output:**

```json
{
  "found": true,
  "document": {
    "path": "build-dapps/orbit/quickstart.mdx",
    "title": "Quickstart: Launch Your Orbit Chain"
  },
  "similarDocuments": [
    {
      "path": "launch-orbit-chain/how-tos/orbit-quickstart.mdx",
      "title": "How to Launch an Orbit Chain",
      "contentType": "how-to",
      "similarity": 0.89,
      "recommendation": "HIGHLY_DUPLICATE - Strong candidate for consolidation"
    },
    {
      "path": "build-dapps/orbit/orbit-gentle-introduction.mdx",
      "title": "Orbit Gentle Introduction",
      "contentType": "gentle-introduction",
      "similarity": 0.72,
      "recommendation": "SIMILAR - Review for potential redundancy"
    }
  ],
  "totalFound": 2
}
```

**Use Case:** Discover related content for cross-linking or consolidation

## Common Patterns

### Pattern 1: Topic-First Analysis

**Goal:** Understand everything about a topic

**Steps:**

1. `analyze_topic_distribution` - Get overview
2. `find_duplicate_content` - Find redundancies
3. `suggest_canonical_reference` - Identify best doc
4. `suggest_consolidation` - Get action plan

### Pattern 2: Document-First Analysis

**Goal:** Understand a specific document's relationships

**Steps:**

1. `find_similar_documents` - Find related docs
2. `find_content_overlaps` - Compare with top matches
3. `suggest_consolidation` - Get merge recommendations

### Pattern 3: Quality Audit

**Goal:** Find documentation quality issues

**Steps:**

1. `find_scattered_topics` - Find fragmented topics (no concept parameter)
2. `find_orphaned_content` - Find isolated docs
3. `find_duplicate_content` for top scattered topics
4. Prioritize by fragmentation score and duplicate count

### Pattern 4: Directory Cleanup

**Goal:** Consolidate a specific directory

**Steps:**

1. `find_orphaned_content` with `filter_directory`
2. List all concepts in that directory
3. `find_duplicate_content` for each major concept
4. `suggest_consolidation` for duplicate clusters

## Tips and Best Practices

### Tip 1: Start Broad, Then Narrow

1. Use `find_scattered_topics` without concept to see all issues
2. Pick highest fragmentation scores
3. Deep dive with `analyze_topic_distribution`
4. Get specific with `find_duplicate_content`

### Tip 2: Use Depth Levels Strategically

- `depth: "basic"` - Quick metrics only (faster)
- `depth: "semantic"` - Includes recommendations (default)
- `depth: "full"` - Comprehensive analysis with consolidation suggestions (slower)

### Tip 3: Adjust Similarity Thresholds

- `min_similarity: 0.9` - Only near-identical duplicates
- `min_similarity: 0.7` - Default, good balance
- `min_similarity: 0.5` - Catch more potential overlaps (more noise)

### Tip 4: Chain Multiple Queries

Claude maintains context, so you can:

1. Ask for analysis
2. Request clarification
3. Drill into specific documents
4. Get consolidation recommendations

All in natural conversation!

### Tip 5: Combine with Manual Review

MCP tools provide data-driven insights, but:

- Review duplicated text segments manually
- Consider user intent and use cases
- Evaluate content quality, not just similarity
- Preserve unique perspectives even in similar docs

## Troubleshooting Common Issues

### Issue: "Concept not found"

**Cause:** Typo or concept below threshold

**Solution:**

```
Find all scattered topics
```

Then find your concept in the list with correct spelling

### Issue: Slow responses

**Cause:** Large number of documents to compare

**Solution:**

- Use higher `min_similarity` threshold
- Use `depth: "basic"` for overview
- First query is slower (cache miss), subsequent queries are fast

### Issue: Unexpected consolidation recommendations

**Cause:** High similarity doesn't always mean merge is best

**Solution:**

- Review `include_alternatives: true` for other strategies
- Check `contentType` - different types may warrant separate docs
- Consider user journey - quickstart + concept may both be needed

## Next Steps

1. Try the [Getting Started](#getting-started) examples
2. Explore [Interactive Workflows](#interactive-workflows) for your use cases
3. Review [Common Patterns](#common-patterns) for efficient analysis
4. Consult [ARCHITECTURE.md](ARCHITECTURE.md) for algorithm details
5. Check [README.md](README.md) for full tool reference
