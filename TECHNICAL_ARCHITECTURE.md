# Technical Architecture: MCP Documentation Analysis Enhancements

**Document Version:** 1.0
**Date:** November 24, 2025
**Project:** Documentation Analysis MCP Server v2.0.0
**Scope:** Three Complementary Search & Matching Improvements

---

## Executive Summary

This document defines the technical architecture for implementing three complementary improvements to the MCP documentation-analysis server: **fuzzy/partial matching**, **multi-word phrase extraction**, and **full-text search fallback**. The architecture ensures these features work together seamlessly while maintaining backward compatibility, performance targets, and production-grade quality.

**Architectural Principles:**

- **Layered Search Strategy:** Exact → Fuzzy → Phrase → Full-Text fallback
- **Separation of Concerns:** Build-time vs. Runtime components clearly separated
- **Performance-First:** Pre-computed indexes, caching, lazy evaluation
- **Backward Compatible:** Existing MCP tools unchanged, internal enhancements only
- **Observable:** Metrics, logging, and performance monitoring built-in

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Fix 1: Fuzzy/Partial Matching](#2-fix-1-fuzzypartial-matching)
3. [Fix 2: Multi-Word Phrase Extraction](#3-fix-2-multi-word-phrase-extraction)
4. [Fix 3: Full-Text Search Fallback](#4-fix-3-full-text-search-fallback)
5. [Cross-Feature Integration](#5-cross-feature-integration)
6. [Data Models & Schemas](#6-data-models--schemas)
7. [Performance & Scalability](#7-performance--scalability)
8. [Security & Validation](#8-security--validation)
9. [Testing Strategy](#9-testing-strategy)
10. [Deployment & Rollout](#10-deployment--rollout)

---

## 1. System Architecture Overview

### 1.1 Current System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BUILD-TIME PIPELINE                          │
│  (documentation-graph/src/)                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Document Extraction (documentExtractor.js)                  │
│     ├─ Scan MDX/MD files                                        │
│     ├─ Parse frontmatter, links, headings                       │
│     └─ Output: extracted-documents.json                         │
│                                                                  │
│  2. Concept Extraction (conceptExtractor.js)                    │
│     ├─ NLP-based term extraction (compromise, natural)          │
│     ├─ Domain-specific term matching                            │
│     ├─ TF-IDF weighting, co-occurrence tracking                 │
│     └─ Output: extracted-concepts.json (500 top concepts)       │
│                                                                  │
│  3. Graph Building (graphBuilder.js)                            │
│     ├─ Construct knowledge graph (graphology)                   │
│     ├─ Node/edge relationships                                  │
│     └─ Output: knowledge-graph.json                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Pre-computed JSON files
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      RUNTIME MCP SERVER                          │
│  (documentation-graph/mcp-server/src/)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DataLoader.js                                                   │
│  ├─ Load pre-computed JSON from dist/                           │
│  ├─ Build in-memory indexes (Map structures)                    │
│  └─ Serve data to engines/analyzers                             │
│                                                                  │
│  QueryParser.js (Current: Limited fuzzy)                        │
│  ├─ findConcept(): EXACT match only (lines 161-166)            │
│  ├─ Partial substring matching (lines 169-177)                  │
│  └─ NO Levenshtein/fuzzy distance calculation                   │
│                                                                  │
│  ScatteringAnalyzer.js (Current: Exact matching)                │
│  ├─ analyzeConceptScattering(): EXACT match (lines 63-65)      │
│  └─ NO fuzzy concept resolution                                 │
│                                                                  │
│  ToolRegistry.js (MCP tool implementations)                     │
│  ├─ find_duplicate_content → uses exact topic match            │
│  ├─ find_scattered_topics → exact concept match                │
│  └─ 8 total MCP tools exposed to Claude                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Current Limitations Addressed by This Architecture:**

1. ❌ No fuzzy matching → typos fail ("Arbitrom" returns nothing)
2. ❌ No multi-word phrases → "gas optimization" not in index
3. ❌ No full-text fallback → misses unlisted concepts
4. ❌ Limited partial matching → only substring, not edit distance

---

### 1.2 Proposed Enhanced Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  ENHANCED BUILD-TIME PIPELINE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ConceptExtractor.js (ENHANCED)                                 │
│  ├─ extractPhrases() [NEW]                                      │
│  │   ├─ Multi-word NLP extraction (2-4 word phrases)           │
│  │   ├─ Domain-specific phrase dictionary                      │
│  │   └─ Frequency-based filtering (min 2 occurrences)          │
│  │                                                              │
│  ├─ buildPhraseFuzzyIndex() [NEW]                              │
│  │   ├─ Pre-compute n-grams for phrases                        │
│  │   └─ Store in fuzzy-search-ready structure                  │
│  │                                                              │
│  └─ Output: extracted-concepts.json                             │
│      ├─ topConcepts: [{ term, type: 'single'/'phrase', ... }]  │
│      └─ fuzzyIndex: { ngrams, variants, abbreviations }        │
│                                                                  │
│  FullTextIndexer.js [NEW MODULE]                                │
│  ├─ Build inverted index from document content                  │
│  ├─ Index structure:                                            │
│  │   ├─ terms → [docId, positions[]]                           │
│  │   ├─ documentFrequency (DF)                                 │
│  │   └─ termFrequency (TF) per document                        │
│  ├─ Apply stemming (porter stemmer from 'natural')             │
│  ├─ Stop word filtering                                         │
│  └─ Output: fulltext-index.json (~10MB)                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
          Enhanced Pre-computed JSON files (3 new/modified)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   ENHANCED RUNTIME MCP SERVER                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DataLoader.js (ENHANCED)                                       │
│  ├─ loadJSON('extracted-concepts.json')                         │
│  │   └─ Now includes phrases + fuzzy index                     │
│  ├─ loadJSON('fulltext-index.json') [NEW]                      │
│  │   └─ Build searchable inverted index                        │
│  └─ Build enhanced indexes:                                     │
│      ├─ conceptsByName (single terms)                           │
│      ├─ phrasesByName [NEW] (multi-word concepts)              │
│      ├─ fuzzyConceptIndex [NEW] (n-gram lookup)                │
│      └─ fulltextTermIndex [NEW] (inverted index)               │
│                                                                  │
│  FuzzyMatcher.js [NEW MODULE - RUNTIME]                        │
│  ├─ Class: FuzzyMatcher                                         │
│  ├─ findFuzzyConcept(searchTerm, threshold=0.8)                │
│  │   ├─ 1. Fast pre-filter: length diff check                  │
│  │   ├─ 2. N-gram overlap (Jaccard similarity)                 │
│  │   ├─ 3. Levenshtein distance (fallback)                     │
│  │   └─ Return: [{ concept, score, matchType }]                │
│  ├─ matchAbbreviation(term) [abbreviation expansion]           │
│  ├─ Cache: LRU cache (5000 entries)                            │
│  └─ Performance: <200ms P50, <1s P99                            │
│                                                                  │
│  PhraseMatcher.js [NEW MODULE - RUNTIME]                       │
│  ├─ Class: PhraseMatcher                                        │
│  ├─ findPhrase(searchTerm)                                      │
│  │   ├─ Exact multi-word match                                 │
│  │   ├─ Word order permutations (limited)                      │
│  │   └─ Fuzzy matching for phrase components                   │
│  ├─ extractQueryPhrases(query)                                  │
│  └─ Performance: <300ms P50                                     │
│                                                                  │
│  FullTextSearch.js [NEW MODULE - RUNTIME]                      │
│  ├─ Class: FullTextSearchEngine                                │
│  ├─ search(query, options)                                      │
│  │   ├─ Parse query: phrase/boolean/proximity                  │
│  │   ├─ Apply stemming to query terms                          │
│  │   ├─ Lookup inverted index                                  │
│  │   ├─ Rank by TF-IDF/BM25                                    │
│  │   └─ Return: [{ doc, score, snippets[] }]                   │
│  ├─ phraseSearch(phrase) [consecutive word matching]           │
│  ├─ proximitySearch(term1, term2, distance)                    │
│  ├─ generateSnippets(doc, terms, contextLength=200)            │
│  └─ Performance: <500ms P50, <2s P99                            │
│                                                                  │
│  QueryParser.js (ENHANCED)                                      │
│  ├─ findConcept(searchTerm, options) [ENHANCED]                │
│  │   ├─ 1. Exact match (existing)                              │
│  │   ├─ 2. Fuzzy match via FuzzyMatcher [NEW]                  │
│  │   ├─ 3. Phrase match via PhraseMatcher [NEW]               │
│  │   ├─ 4. Full-text fallback via FullTextSearch [NEW]        │
│  │   └─ Return best match with confidence score                │
│  └─ Options: { fuzzyThreshold, enablePhrases, enableFulltext } │
│                                                                  │
│  ScatteringAnalyzer.js (ENHANCED)                               │
│  ├─ analyzeConceptScattering(conceptName) [ENHANCED]           │
│  │   ├─ Use QueryParser.findConcept() for fuzzy resolution    │
│  │   └─ Support phrase-based scattering analysis               │
│  └─ Backward compatible: exact match still works               │
│                                                                  │
│  ToolRegistry.js (ENHANCED - NO API CHANGES)                   │
│  ├─ find_duplicate_content(args)                               │
│  │   ├─ NEW: fuzzy_threshold parameter (optional)              │
│  │   └─ Uses enhanced QueryParser internally                   │
│  ├─ find_scattered_topics(args)                                │
│  │   └─ Automatically uses fuzzy/phrase matching               │
│  └─ search_fulltext(query, options) [NEW TOOL]                │
│      └─ Exposes full-text search as standalone capability      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Architectural Decisions:**

1. ✅ **Build-time preprocessing** → Minimize runtime overhead
2. ✅ **Layered fallback strategy** → Try fast methods first
3. ✅ **Caching at multiple levels** → Query cache, fuzzy distance cache, result cache
4. ✅ **Feature flags** → Enable/disable each feature independently
5. ✅ **Backward compatibility** → Existing tool APIs unchanged

---

## 2. Fix 1: Fuzzy/Partial Matching

### 2.1 Component Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    FuzzyMatcher Module                        │
│  Location: mcp-server/src/search/FuzzyMatcher.js             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Class: FuzzyMatcher                                          │
│  ├─ constructor(concepts, config)                            │
│  │   ├─ this.concepts = concepts (from DataLoader)           │
│  │   ├─ this.config = { threshold, minLength, cache }        │
│  │   ├─ this.cache = new LRUCache(5000)                      │
│  │   └─ this.abbreviationMap = loadAbbreviations()           │
│  │                                                            │
│  ├─ findFuzzyConcept(searchTerm, options)                    │
│  │   ├─ INPUT: searchTerm (string), options {}               │
│  │   ├─ OUTPUT: [{ concept, score, matchType, explanation }] │
│  │   │                                                        │
│  │   └─ Algorithm:                                            │
│  │       1. Normalize input (lowercase, trim)                │
│  │       2. Check cache (O(1) lookup)                        │
│  │       3. Try exact match first (fast path)                │
│  │       4. Try abbreviation expansion                        │
│  │       5. Pre-filter candidates by length                   │
│  │       6. Calculate similarity scores:                      │
│  │          a) Substring match (boost score)                  │
│  │          b) N-gram overlap (Jaccard)                       │
│  │          c) Levenshtein distance (expensive fallback)      │
│  │       7. Filter by threshold (default 0.8)                 │
│  │       8. Rank by score descending                          │
│  │       9. Cache result                                      │
│  │      10. Return top matches                                │
│  │                                                            │
│  ├─ calculateJaccardSimilarity(term1, term2)                 │
│  │   ├─ Generate character bigrams                            │
│  │   ├─ Calculate intersection/union                          │
│  │   └─ Return: similarity score (0-1)                        │
│  │                                                            │
│  ├─ calculateLevenshteinDistance(term1, term2)               │
│  │   ├─ Dynamic programming matrix                            │
│  │   ├─ Normalize to 0-1 similarity                           │
│  │   └─ Cache expensive calculations                          │
│  │                                                            │
│  ├─ preFilterByLength(searchTerm, candidates)                │
│  │   └─ Skip if |len(a) - len(b)| > 30% of max length       │
│  │                                                            │
│  └─ matchAbbreviation(term)                                   │
│      ├─ Map: ARB → Arbitrum, ETH → Ethereum                  │
│      └─ Return: expanded term or null                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Data Structures

**Abbreviation Map** (loaded from config):

```javascript
{
  "ARB": "arbitrum",
  "ETH": "ethereum",
  "L2": "layer 2",
  "DAO": "dao",
  "NFT": "nft",
  "USDC": "usdc"
}
```

**LRU Cache Structure**:

```javascript
class LRUCache {
  constructor(maxSize = 5000) {
    this.cache = new Map(); // key: searchTerm, value: {results, timestamp}
    this.maxSize = maxSize;
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    // Move to end (LRU behavior)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest (first entry)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}
```

### 2.3 Similarity Algorithms

**Algorithm Selection Matrix:**

| Scenario             | Algorithm         | Complexity | Use Case                  |
| -------------------- | ----------------- | ---------- | ------------------------- |
| Exact match          | String equality   | O(n)       | "arbitrum" === "arbitrum" |
| Substring            | includes()        | O(n\*m)    | "arb" in "arbitrum"       |
| Character similarity | Jaccard (n-grams) | O(n)       | "arbitrom" vs "arbitrum"  |
| Edit distance        | Levenshtein       | O(n\*m)    | "arbtrm" vs "arbitrum"    |

**Jaccard Similarity (Primary - Fast)**:

```javascript
jaccardSimilarity(term1, term2) {
  const ngrams1 = this.generateBigrams(term1);
  const ngrams2 = this.generateBigrams(term2);

  const intersection = ngrams1.filter(x => ngrams2.has(x));
  const union = new Set([...ngrams1, ...ngrams2]);

  return intersection.size / union.size; // 0-1 score
}

generateBigrams(str) {
  const bigrams = new Set();
  const padded = `_${str}_`; // Add padding for edge matching

  for (let i = 0; i < padded.length - 1; i++) {
    bigrams.add(padded.substring(i, i + 2));
  }

  return bigrams;
}
```

**Levenshtein Distance (Fallback - Expensive)**:

```javascript
levenshteinDistance(term1, term2) {
  const matrix = Array(term1.length + 1)
    .fill(null)
    .map(() => Array(term2.length + 1).fill(0));

  for (let i = 0; i <= term1.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= term2.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= term1.length; i++) {
    for (let j = 1; j <= term2.length; j++) {
      const cost = term1[i - 1] === term2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[term1.length][term2.length];
  const maxLen = Math.max(term1.length, term2.length);
  return 1 - (distance / maxLen); // Normalize to similarity (0-1)
}
```

### 2.4 Integration with QueryParser

**Enhanced findConcept() Method**:

```javascript
// Location: mcp-server/src/core/QueryParser.js

findConcept(searchTerm, options = {}) {
  const {
    fuzzyThreshold = 0.8,
    enableFuzzy = true,
    maxResults = 5
  } = options;

  const searchLower = searchTerm.toLowerCase();

  // STEP 1: Exact match (fastest)
  const exactMatch = this.concepts.topConcepts?.find(
    c => c.concept.toLowerCase() === searchLower
  );

  if (exactMatch) {
    return {
      concept: exactMatch.concept,
      matchType: 'exact',
      score: 1.0,
      explanation: 'Exact match found'
    };
  }

  // STEP 2: Fuzzy matching (NEW)
  if (enableFuzzy && this.fuzzyMatcher) {
    const fuzzyMatches = this.fuzzyMatcher.findFuzzyConcept(
      searchTerm,
      { threshold: fuzzyThreshold, limit: maxResults }
    );

    if (fuzzyMatches.length > 0) {
      return fuzzyMatches[0]; // Return best match
    }
  }

  // STEP 3: Partial substring match (existing fallback)
  const partialMatches = this.concepts.topConcepts?.filter(
    c => c.concept.toLowerCase().includes(searchLower)
  );

  if (partialMatches && partialMatches.length > 0) {
    partialMatches.sort((a, b) => b.frequency - a.frequency);
    return {
      concept: partialMatches[0].concept,
      matchType: 'partial',
      score: 0.7,
      explanation: `Partial substring match (contains "${searchTerm}")`
    };
  }

  return null; // No match found
}
```

### 2.5 Configuration

**Environment Variables**:

```bash
# Feature toggle
FEATURE_FUZZY_MATCHING=true

# Fuzzy matching parameters
FUZZY_THRESHOLD=0.8              # Minimum similarity (0-1)
FUZZY_MIN_LENGTH=3               # Don't fuzzy match terms <3 chars
FUZZY_CACHE_SIZE=5000            # LRU cache size
FUZZY_ALGORITHM=jaccard          # 'jaccard' or 'levenshtein'
FUZZY_MAX_CANDIDATES=100         # Limit pre-filter candidates
```

**Config File** (`config/search-config.json`):

```json
{
  "fuzzyMatching": {
    "enabled": true,
    "threshold": 0.8,
    "minTermLength": 3,
    "cacheSize": 5000,
    "algorithms": {
      "primary": "jaccard",
      "fallback": "levenshtein"
    },
    "abbreviations": {
      "ARB": "arbitrum",
      "ETH": "ethereum",
      "L2": "layer 2",
      "USDC": "usdc"
    },
    "performance": {
      "maxCandidates": 100,
      "timeout": 1000
    }
  }
}
```

---

## 3. Fix 2: Multi-Word Phrase Extraction

### 3.1 Component Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              Enhanced ConceptExtractor Module                 │
│  Location: documentation-graph/src/extractors/               │
│            conceptExtractor.js (ENHANCED)                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  NEW METHOD: extractPhrases(doc, weight)                     │
│  ├─ INPUT: compromise doc object, weight multiplier          │
│  ├─ OUTPUT: [{ text, type: 'phrase', weight, length }]       │
│  │                                                            │
│  └─ Algorithm:                                                │
│      1. Extract noun phrases using compromise NLP            │
│         doc.match('#Adjective? #Noun+ #Noun')                │
│         → "gas optimization", "layer 2 scaling"              │
│                                                               │
│      2. Extract technical compounds                           │
│         Pattern: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/               │
│         → "Arbitrum Nova", "Nitro Stack"                     │
│                                                               │
│      3. Apply domain dictionary matching                      │
│         Check against config.phrasePatterns:                  │
│         ["optimistic rollup", "fraud proof", ...]            │
│                                                               │
│      4. Filter by length (2-4 words)                          │
│         Extract: minLength=2, maxLength=4                     │
│                                                               │
│      5. Validate phrase quality                               │
│         - No stop words as phrase head                        │
│         - Minimum combined word length: 8 chars              │
│         - Not pure numbers or symbols                         │
│                                                               │
│      6. Track phrase frequency                                │
│         this.phraseFrequency.set(phrase, count)              │
│                                                               │
│      7. Filter by minimum frequency (≥2)                      │
│         Only index phrases that appear 2+ times              │
│                                                               │
│  NEW METHOD: recordPhrases(phrases, filePath)                │
│  ├─ Store phrase metadata in this.phrases Map                │
│  ├─ Track phrase co-location with single concepts            │
│  └─ Build phrase → documents index                            │
│                                                               │
│  ENHANCED: getTopConcepts(limit)                              │
│  ├─ Return mixed results:                                     │
│  │   - Single-word concepts (type: 'single')                 │
│  │   - Multi-word phrases (type: 'phrase')                   │
│  ├─ Sort by combined frequency                                │
│  └─ Include phrase metadata                                   │
│                                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   PhraseMatcher Module                        │
│  Location: mcp-server/src/search/PhraseMatcher.js (NEW)     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Class: PhraseMatcher                                         │
│  ├─ constructor(phrases, fuzzyMatcher)                       │
│  │   ├─ this.phrases = phrases (multi-word concepts)         │
│  │   └─ this.fuzzyMatcher = fuzzyMatcher (for components)   │
│  │                                                            │
│  ├─ findPhrase(searchQuery)                                   │
│  │   ├─ INPUT: "gas optimization arbitrum"                   │
│  │   ├─ OUTPUT: [{ phrase, score, matchType }]               │
│  │   │                                                        │
│  │   └─ Algorithm:                                            │
│  │       1. Normalize query (lowercase, trim)                │
│  │       2. Try exact phrase match                            │
│  │          "gas optimization" in phrases → exact             │
│  │       3. Try word order permutations (limited)            │
│  │          "optimization gas" → reorder → match             │
│  │       4. Try fuzzy matching on phrase components          │
│  │          "gas optim" → fuzzy match each word              │
│  │       5. Score by:                                         │
│  │          - Exact match: 1.0                                │
│  │          - Reordered: 0.9                                  │
│  │          - Fuzzy components: avg(componentScores)         │
│  │       6. Return ranked results                             │
│  │                                                            │
│  ├─ extractQueryPhrases(query)                                │
│  │   ├─ Split query into potential phrases                   │
│  │   └─ Return: ["gas optimization", "arbitrum"]            │
│  │                                                            │
│  └─ matchPhraseComponents(queryWords, phraseWords)           │
│      ├─ Use fuzzyMatcher for each word pair                  │
│      └─ Calculate average similarity                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 NLP-Based Phrase Extraction

**Compromise.js Patterns**:

```javascript
extractNounPhrases(doc) {
  const phrases = [];

  // Pattern 1: Adjective + Noun + Noun (e.g., "optimistic rollup design")
  const pattern1 = doc.match('#Adjective? #Noun+ #Noun').json();
  phrases.push(...pattern1.map(p => p.text));

  // Pattern 2: Noun + Preposition + Noun (e.g., "bridge to arbitrum")
  const pattern2 = doc.match('#Noun #Preposition #Noun').json();
  phrases.push(...pattern2.map(p => p.text));

  // Pattern 3: Compound nouns (e.g., "gas optimization")
  const pattern3 = doc.match('#Noun #Noun').json();
  phrases.push(...pattern3.map(p => p.text));

  return phrases;
}
```

**Domain-Specific Phrase Dictionary**:

```json
{
  "phrasePatterns": [
    "optimistic rollup",
    "fraud proof",
    "gas optimization",
    "layer 2 scaling",
    "cross-chain messaging",
    "arbitrum nova",
    "nitro stack",
    "sequencer decentralization",
    "transaction lifecycle",
    "state transition function"
  ]
}
```

### 3.3 Data Model Changes

**Enhanced Concept Schema**:

```json
{
  "topConcepts": [
    {
      "concept": "gas",
      "data": {
        "text": "gas",
        "normalized": "gas",
        "type": "single",
        "category": "technical",
        "files": { "/path/to/doc.mdx": 1 },
        "totalWeight": 45.2
      },
      "frequency": 120,
      "fileCount": 35
    },
    {
      "concept": "gas optimization",
      "data": {
        "text": "gas optimization",
        "normalized": "gas optimization",
        "type": "phrase",
        "length": 2,
        "components": ["gas", "optimization"],
        "category": "technical",
        "files": { "/path/to/doc.mdx": 1.5 },
        "totalWeight": 18.3
      },
      "frequency": 42,
      "fileCount": 12
    }
  ]
}
```

**Phrase Index Structure** (in-memory):

```javascript
{
  phrasesByName: Map {
    "gas optimization" => {
      concept: "gas optimization",
      length: 2,
      components: ["gas", "optimization"],
      frequency: 42,
      documents: [...]
    }
  },

  phraseComponentIndex: Map {
    "gas" => ["gas optimization", "gas fees", "gas limit"],
    "optimization" => ["gas optimization", "code optimization"]
  }
}
```

### 3.4 Performance Optimization

**Phrase Extraction Performance Budget**:

- Per-document extraction: <100ms
- Total extraction time (100 docs): <10 seconds
- Index size increase: <20% (5-6MB additional)

**Optimization Techniques**:

1. **Frequency filtering:** Only index phrases with ≥2 occurrences
2. **Length limits:** 2-4 words only (no 5+ word phrases)
3. **Batch processing:** Extract phrases in document batches
4. **Caching:** Cache compromise document objects (already implemented)
5. **Lazy evaluation:** Don't extract phrases for every document immediately

---

## 4. Fix 3: Full-Text Search Fallback

### 4.1 Component Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  FullTextIndexer Module                       │
│  Location: documentation-graph/src/indexers/                 │
│            FullTextIndexer.js (NEW BUILD-TIME)               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Class: FullTextIndexer                                       │
│  ├─ constructor(documents, config)                           │
│  │   ├─ this.documents = extracted documents                 │
│  │   ├─ this.config = { stemming, stopWords, minLength }     │
│  │   └─ this.stemmer = natural.PorterStemmer                 │
│  │                                                            │
│  ├─ buildIndex()                                              │
│  │   ├─ INPUT: documents from extraction phase               │
│  │   ├─ OUTPUT: fulltext-index.json                          │
│  │   │                                                        │
│  │   └─ Algorithm:                                            │
│  │       1. For each document:                                │
│  │          a) Tokenize content into terms                   │
│  │          b) Apply stemming (if enabled)                   │
│  │          c) Filter stop words                             │
│  │          d) Track term positions                          │
│  │                                                            │
│  │       2. Build inverted index:                             │
│  │          term → [{docId, positions[], tf}]                │
│  │                                                            │
│  │       3. Calculate IDF (Inverse Document Frequency):      │
│  │          idf(term) = log(N / df(term))                    │
│  │          where N = total docs, df = docs containing term  │
│  │                                                            │
│  │       4. Store document metadata:                          │
│  │          docId → {path, title, length, fieldWeights}      │
│  │                                                            │
│  │       5. Serialize to JSON                                 │
│  │                                                            │
│  ├─ tokenize(text)                                            │
│  │   ├─ Split on whitespace and punctuation                  │
│  │   ├─ Lowercase normalization                              │
│  │   └─ Remove tokens <3 characters                          │
│  │                                                            │
│  ├─ applyStemming(term)                                       │
│  │   └─ Use Porter Stemmer: "optimization" → "optim"        │
│  │                                                            │
│  └─ filterStopWords(terms)                                    │
│      └─ Remove: the, and, or, but, for, with, ...           │
│                                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│               FullTextSearchEngine Module                     │
│  Location: mcp-server/src/search/                            │
│            FullTextSearch.js (NEW RUNTIME)                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Class: FullTextSearchEngine                                  │
│  ├─ constructor(index, config)                               │
│  │   ├─ this.index = loaded fulltext-index.json             │
│  │   ├─ this.config = { ranking, snippets }                  │
│  │   └─ this.queryCache = new LRUCache(1000)                │
│  │                                                            │
│  ├─ search(query, options)                                    │
│  │   ├─ INPUT: "layer 2 scaling solution"                    │
│  │   ├─ OUTPUT: [{ doc, score, snippets[], matchType }]      │
│  │   │                                                        │
│  │   └─ Algorithm:                                            │
│  │       1. Parse query:                                      │
│  │          - Detect phrases: "..."                          │
│  │          - Detect boolean: AND, OR, NOT                   │
│  │          - Detect proximity: term1 NEAR term2             │
│  │                                                            │
│  │       2. Tokenize and stem query terms                     │
│  │          ["layer", "2", "scaling", "solution"]           │
│  │          → ["layer", "2", "scale", "solut"]              │
│  │                                                            │
│  │       3. Lookup inverted index                             │
│  │          For each term, get posting lists                 │
│  │                                                            │
│  │       4. Merge posting lists (AND/OR logic)               │
│  │          Intersection for AND, Union for OR               │
│  │                                                            │
│  │       5. Calculate relevance scores (BM25):               │
│  │          score(d,q) = Σ IDF(qi) * TF(qi,d) * k1+1        │
│  │                       ─────────────────────────           │
│  │                       TF(qi,d) + k1*(1-b+b*|d|/avgdl)     │
│  │                                                            │
│  │       6. Apply field boosting:                             │
│  │          - Title matches: 2x weight                       │
│  │          - Heading matches: 1.5x weight                   │
│  │          - Body matches: 1x weight                        │
│  │                                                            │
│  │       7. Sort by score descending                          │
│  │                                                            │
│  │       8. Generate context snippets                         │
│  │          Extract 200 chars around matches                 │
│  │                                                            │
│  │       9. Cache result                                      │
│  │                                                            │
│  │      10. Return top N results                              │
│  │                                                            │
│  ├─ phraseSearch(phrase)                                      │
│  │   ├─ Find documents with consecutive term positions       │
│  │   └─ pos(term1) + 1 === pos(term2)                        │
│  │                                                            │
│  ├─ proximitySearch(term1, term2, maxDistance)               │
│  │   ├─ Find documents where terms are within N words        │
│  │   └─ |pos(term1) - pos(term2)| <= maxDistance            │
│  │                                                            │
│  ├─ generateSnippets(doc, queryTerms, contextLength)         │
│  │   ├─ Find positions of query terms in document            │
│  │   ├─ Extract ±contextLength/2 chars around each match    │
│  │   ├─ Highlight matched terms: <mark>term</mark>          │
│  │   └─ Return: ["...context <mark>term</mark> context..."] │
│  │                                                            │
│  └─ parseQuery(queryString)                                   │
│      ├─ Detect quoted phrases: "exact phrase"                │
│      ├─ Detect boolean operators: AND, OR, NOT               │
│      ├─ Detect field queries: title:arbitrum                 │
│      └─ Return: AST of query structure                        │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Inverted Index Data Structure

**Index Schema** (`fulltext-index.json`):

```json
{
  "version": "2.0.0",
  "metadata": {
    "documentCount": 150,
    "termCount": 8500,
    "avgDocLength": 1200,
    "indexedAt": "2025-11-24T12:00:00Z"
  },

  "invertedIndex": {
    "arbitrum": [
      {
        "docId": "doc_001",
        "tf": 12,
        "positions": [45, 123, 456, 789, ...],
        "fields": {
          "title": 2,
          "headings": 3,
          "body": 7
        }
      }
    ],
    "optim": [
      {
        "docId": "doc_045",
        "tf": 5,
        "positions": [234, 567, 890, ...],
        "fields": {
          "title": 0,
          "headings": 1,
          "body": 4
        }
      }
    ]
  },

  "documentFrequency": {
    "arbitrum": 120,
    "optim": 45,
    "layer": 89
  },

  "idf": {
    "arbitrum": 0.223,
    "optim": 1.204,
    "layer": 0.521
  },

  "documents": {
    "doc_001": {
      "path": "/docs/build-decentralized-apps/01-quickstart.mdx",
      "title": "Quickstart: Build on Arbitrum",
      "length": 1450,
      "fieldWeights": {
        "title": 2.0,
        "headings": 1.5,
        "body": 1.0
      }
    }
  }
}
```

### 4.3 BM25 Ranking Algorithm

**BM25 Formula**:

```
score(D, Q) = Σ IDF(qi) × (f(qi, D) × (k1 + 1)) / (f(qi, D) + k1 × (1 - b + b × |D| / avgdl))

Where:
- D = document
- Q = query
- qi = query term i
- f(qi, D) = term frequency of qi in D
- IDF(qi) = inverse document frequency of qi
- |D| = length of document D
- avgdl = average document length
- k1 = 1.2 (tuning parameter)
- b = 0.75 (length normalization parameter)
```

**Implementation**:

```javascript
calculateBM25Score(doc, queryTerms) {
  const k1 = 1.2;
  const b = 0.75;
  const avgDocLength = this.index.metadata.avgDocLength;
  const docLength = this.index.documents[doc.id].length;

  let score = 0;

  for (const term of queryTerms) {
    const stemmedTerm = this.stem(term);
    const idf = this.index.idf[stemmedTerm] || 0;

    // Get term frequency in document
    const posting = this.getPosting(doc.id, stemmedTerm);
    if (!posting) continue;

    const tf = posting.tf;

    // Apply field boosting
    const fieldBoost = this.calculateFieldBoost(posting.fields);

    // BM25 calculation
    const numerator = idf * tf * (k1 + 1) * fieldBoost;
    const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));

    score += numerator / denominator;
  }

  return score;
}

calculateFieldBoost(fields) {
  let boost = 1.0;
  if (fields.title > 0) boost *= 2.0;
  if (fields.headings > 0) boost *= 1.5;
  return boost;
}
```

### 4.4 Integration with MCP Tools

**New MCP Tool: `search_fulltext`**:

```javascript
// Location: mcp-server/src/tools/ToolRegistry.js

{
  name: 'search_fulltext',
  description: 'Perform full-text search across documentation content with phrase and proximity matching',
  inputSchema: z.object({
    query: z.string().describe('Search query (supports phrases, boolean operators)'),
    search_type: z
      .enum(['simple', 'phrase', 'boolean', 'proximity'])
      .default('simple')
      .optional()
      .describe('Search type'),
    min_relevance: z
      .number()
      .min(0)
      .max(1)
      .default(0.5)
      .optional()
      .describe('Minimum relevance score (0-1)'),
    result_limit: z
      .number()
      .min(1)
      .max(50)
      .default(20)
      .optional()
      .describe('Maximum results to return'),
    include_snippets: z
      .boolean()
      .default(true)
      .optional()
      .describe('Include context snippets in results')
  }),
  handler: this.searchFullText.bind(this)
}

async searchFullText(args) {
  const { query, search_type, min_relevance, result_limit, include_snippets } = args;

  const results = this.fullTextSearch.search(query, {
    type: search_type,
    minScore: min_relevance,
    limit: result_limit,
    snippets: include_snippets
  });

  return {
    found: results.length > 0,
    query,
    totalResults: results.length,
    results: results.map(r => ({
      path: r.document.relativePath,
      title: r.document.frontmatter?.title,
      score: r.score.toFixed(3),
      matchType: r.matchType,
      snippets: include_snippets ? r.snippets : undefined
    }))
  };
}
```

**Enhanced `find_duplicate_content` with Fallback**:

```javascript
async findDuplicateContent(args) {
  const { topic, min_similarity, include_exact, include_conceptual } = args;

  // STEP 1: Try concept-based search (existing)
  let docsWithConcept = this.dataLoader.getDocumentsForConcept(topic);

  // STEP 2: Fallback to full-text search if no concept match
  if (docsWithConcept.length === 0) {
    logger.info(`No concept match for "${topic}", trying full-text search...`);

    const fullTextResults = this.fullTextSearch.search(topic, {
      minScore: 0.6,
      limit: 20
    });

    if (fullTextResults.length > 0) {
      return {
        found: true,
        topic,
        matchType: 'fulltext_fallback',
        totalDocuments: fullTextResults.length,
        documents: fullTextResults.map(r => ({
          path: r.document.relativePath,
          title: r.document.frontmatter?.title,
          relevanceScore: r.score,
          snippets: r.snippets
        })),
        note: 'Results from full-text search (concept not found in index)'
      };
    }

    return {
      found: false,
      topic,
      error: 'Topic not found in concept index or full-text search',
      suggestion: 'Try related terms or check spelling'
    };
  }

  // Continue with existing duplicate detection logic...
}
```

### 4.5 Library Selection

**Comparison of Full-Text Search Libraries**:

| Library                   | Pros                                                    | Cons                                               | Recommendation                           |
| ------------------------- | ------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------- |
| **Lunr.js**               | • Client-side<br>• Small (~10KB)<br>• No external deps  | • Limited features<br>• Slower with large datasets | ✅ **RECOMMENDED**<br>Best for <500 docs |
| **Custom Implementation** | • Full control<br>• Optimized for use case<br>• No deps | • More code to maintain<br>• Requires testing      | ⚠️ Fallback option                       |
| **Meilisearch**           | • Fast<br>• Typo tolerance<br>• Advanced features       | • External server<br>• Complex setup<br>• Overkill | ❌ Too complex                           |

**Selected: Lunr.js** - Reasoning:

- Lightweight, well-tested library
- Perfect for documentation-scale datasets (<1000 docs)
- Built-in BM25 ranking
- Supports stemming, stop words, field boosting
- No external dependencies or servers required

**Integration Example**:

```javascript
import lunr from 'lunr';

class FullTextSearchEngine {
  buildLunrIndex(documents) {
    this.lunrIndex = lunr(function () {
      this.ref('id');
      this.field('title', { boost: 2 });
      this.field('headings', { boost: 1.5 });
      this.field('content');

      this.metadataWhitelist = ['position'];

      documents.forEach((doc) => {
        this.add({
          id: doc.id,
          title: doc.frontmatter?.title || '',
          headings: doc.headings.map((h) => h.text).join(' '),
          content: doc.content,
        });
      });
    });
  }

  search(query, options) {
    const results = this.lunrIndex.search(query);

    return results.map((result) => ({
      document: this.getDocument(result.ref),
      score: result.score,
      matches: result.matchData.metadata,
    }));
  }
}
```

---

## 5. Cross-Feature Integration

### 5.1 Layered Search Pipeline

**Unified Search Strategy** (QueryParser.findConcept enhanced):

```javascript
findConceptWithFallbacks(searchTerm, options = {}) {
  const {
    fuzzyThreshold = 0.8,
    phraseThreshold = 0.85,
    fulltextMinScore = 0.5,
    enableFuzzy = true,
    enablePhrases = true,
    enableFulltext = true
  } = options;

  const results = {
    attempts: [],
    bestMatch: null,
    confidence: 0
  };

  // LAYER 1: Exact concept match (fastest, most accurate)
  const exactMatch = this.exactConceptMatch(searchTerm);
  if (exactMatch) {
    results.attempts.push({ layer: 'exact', success: true });
    results.bestMatch = { ...exactMatch, confidence: 1.0, layer: 'exact' };
    return results;
  }
  results.attempts.push({ layer: 'exact', success: false });

  // LAYER 2: Fuzzy concept match
  if (enableFuzzy) {
    const fuzzyMatch = this.fuzzyMatcher.findFuzzyConcept(searchTerm, {
      threshold: fuzzyThreshold
    });

    if (fuzzyMatch.length > 0 && fuzzyMatch[0].score >= fuzzyThreshold) {
      results.attempts.push({ layer: 'fuzzy', success: true, score: fuzzyMatch[0].score });
      results.bestMatch = { ...fuzzyMatch[0], layer: 'fuzzy' };
      return results;
    }
    results.attempts.push({ layer: 'fuzzy', success: false });
  }

  // LAYER 3: Phrase matching
  if (enablePhrases) {
    const phraseMatch = this.phraseMatcher.findPhrase(searchTerm);

    if (phraseMatch.length > 0 && phraseMatch[0].score >= phraseThreshold) {
      results.attempts.push({ layer: 'phrase', success: true, score: phraseMatch[0].score });
      results.bestMatch = { ...phraseMatch[0], layer: 'phrase' };
      return results;
    }
    results.attempts.push({ layer: 'phrase', success: false });
  }

  // LAYER 4: Full-text search fallback (last resort)
  if (enableFulltext) {
    const fulltextMatch = this.fullTextSearch.search(searchTerm, {
      minScore: fulltextMinScore,
      limit: 1
    });

    if (fulltextMatch.length > 0) {
      results.attempts.push({ layer: 'fulltext', success: true, score: fulltextMatch[0].score });
      results.bestMatch = {
        concept: searchTerm, // Use original query
        matchType: 'fulltext',
        score: fulltextMatch[0].score,
        documents: fulltextMatch,
        layer: 'fulltext',
        confidence: fulltextMatch[0].score
      };
      return results;
    }
    results.attempts.push({ layer: 'fulltext', success: false });
  }

  // No match found
  results.bestMatch = null;
  return results;
}
```

### 5.2 Result Ranking & Merging

**Unified Scoring System**:

```javascript
class ResultMerger {
  mergeResults(exactResults, fuzzyResults, phraseResults, fulltextResults) {
    const allResults = [];

    // Add exact matches with highest priority
    exactResults.forEach((r) => {
      allResults.push({
        ...r,
        finalScore: r.score * 1.0, // No penalty
        source: 'exact',
        priority: 1,
      });
    });

    // Add fuzzy matches with slight penalty
    fuzzyResults.forEach((r) => {
      allResults.push({
        ...r,
        finalScore: r.score * 0.95, // 5% penalty
        source: 'fuzzy',
        priority: 2,
      });
    });

    // Add phrase matches
    phraseResults.forEach((r) => {
      allResults.push({
        ...r,
        finalScore: r.score * 0.9, // 10% penalty
        source: 'phrase',
        priority: 3,
      });
    });

    // Add full-text results with larger penalty
    fulltextResults.forEach((r) => {
      allResults.push({
        ...r,
        finalScore: r.score * 0.8, // 20% penalty
        source: 'fulltext',
        priority: 4,
      });
    });

    // Deduplicate by document path
    const uniqueResults = this.deduplicateByPath(allResults);

    // Sort by finalScore descending, then priority ascending
    uniqueResults.sort((a, b) => {
      if (Math.abs(a.finalScore - b.finalScore) < 0.01) {
        return a.priority - b.priority;
      }
      return b.finalScore - a.finalScore;
    });

    return uniqueResults;
  }

  deduplicateByPath(results) {
    const seen = new Map();

    for (const result of results) {
      const path = result.document?.path || result.path;

      if (!seen.has(path) || result.finalScore > seen.get(path).finalScore) {
        seen.set(path, result);
      }
    }

    return Array.from(seen.values());
  }
}
```

### 5.3 Caching Strategy

**Multi-Level Cache Architecture**:

```javascript
class CacheManager {
  constructor() {
    // L1: Query result cache (hot cache)
    this.queryCache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 5, // 5 minutes
    });

    // L2: Fuzzy distance cache (expensive calculations)
    this.fuzzyDistanceCache = new LRUCache({
      max: 5000,
      ttl: 1000 * 60 * 30, // 30 minutes
    });

    // L3: Full-text search cache
    this.fulltextCache = new LRUCache({
      max: 500,
      ttl: 1000 * 60 * 10, // 10 minutes
    });
  }

  getCachedQuery(query, options) {
    const cacheKey = this.generateCacheKey(query, options);
    return this.queryCache.get(cacheKey);
  }

  setCachedQuery(query, options, result) {
    const cacheKey = this.generateCacheKey(query, options);
    this.queryCache.set(cacheKey, result);
  }

  getCachedFuzzyDistance(term1, term2) {
    const key = [term1, term2].sort().join('|');
    return this.fuzzyDistanceCache.get(key);
  }

  setCachedFuzzyDistance(term1, term2, distance) {
    const key = [term1, term2].sort().join('|');
    this.fuzzyDistanceCache.set(key, distance);
  }

  generateCacheKey(query, options) {
    return `${query}|${JSON.stringify(options)}`;
  }

  invalidateAll() {
    this.queryCache.clear();
    this.fuzzyDistanceCache.clear();
    this.fulltextCache.clear();
  }
}
```

**Cache Invalidation Strategy**:

- **Data refresh:** Clear all caches when data reloaded
- **TTL-based:** Automatic expiration (query: 5min, fuzzy: 30min, fulltext: 10min)
- **LRU eviction:** Remove least recently used when cache full
- **Manual invalidation:** API endpoint to clear caches

---

## 6. Data Models & Schemas

### 6.1 Enhanced Concept Model

```typescript
interface ConceptEntry {
  concept: string; // "gas optimization"
  data: {
    text: string; // Original form
    normalized: string; // Normalized form
    type: 'single' | 'phrase'; // NEW: Type distinction
    length?: number; // NEW: Word count for phrases
    components?: string[]; // NEW: ["gas", "optimization"]
    category: string; // Domain category
    files: Record<string, number>; // File path → weight
    sources: string[]; // Where found (content, headings, etc.)
    totalWeight: number; // Aggregate weight
  };
  frequency: number; // Total occurrences
  fileCount: number; // Documents mentioning this
}

interface FuzzyIndex {
  ngrams: Record<string, string[]>; // Bigram → concepts
  abbreviations: Record<string, string>; // ARB → arbitrum
  variants: Record<string, string[]>; // arbitrum → [arbitrum, arbtrum, ...]
}

interface EnhancedConceptOutput {
  topConcepts: ConceptEntry[];
  fuzzyIndex: FuzzyIndex; // NEW
  phraseIndex: {
    // NEW
    phrases: ConceptEntry[];
    componentIndex: Record<string, string[]>;
  };
  metadata: {
    singleConceptCount: number;
    phraseConceptCount: number;
    totalConceptCount: number;
    extractedAt: string;
  };
}
```

### 6.2 Full-Text Index Model

```typescript
interface FullTextIndex {
  version: string;
  metadata: {
    documentCount: number;
    termCount: number;
    avgDocLength: number;
    indexedAt: string;
  };

  invertedIndex: Record<string, PostingList[]>;

  documentFrequency: Record<string, number>; // term → DF
  idf: Record<string, number>; // term → IDF score

  documents: Record<string, DocumentMetadata>;
}

interface PostingList {
  docId: string;
  tf: number; // Term frequency
  positions: number[]; // Term positions in document
  fields: {
    title: number;
    headings: number;
    body: number;
  };
}

interface DocumentMetadata {
  path: string;
  title: string;
  length: number; // Word count
  fieldWeights: {
    title: number;
    headings: number;
    body: number;
  };
}
```

### 6.3 Search Result Model

```typescript
interface SearchResult {
  concept?: string; // Matched concept (if applicable)
  document?: DocumentEntry; // Matched document (fulltext)
  score: number; // Relevance score (0-1)
  matchType: 'exact' | 'fuzzy' | 'phrase' | 'fulltext';
  layer: 'exact' | 'fuzzy' | 'phrase' | 'fulltext';
  confidence: number; // Confidence in match (0-1)
  explanation: string; // Human-readable match reason

  // Full-text specific
  snippets?: string[]; // Context snippets with highlights
  termPositions?: number[]; // Matched term positions

  // Fuzzy-specific
  editDistance?: number; // Levenshtein distance
  similarity?: number; // Jaccard similarity

  // Metadata
  source: string; // Which search layer found this
  cacheHit: boolean; // Was this cached?
  queryTime: number; // Time to execute (ms)
}

interface UnifiedSearchResponse {
  found: boolean;
  query: string;
  bestMatch: SearchResult | null;
  allMatches: SearchResult[];
  attempts: {
    layer: string;
    success: boolean;
    time: number;
  }[];
  totalTime: number;
}
```

---

## 7. Performance & Scalability

### 7.1 Performance Targets

| Operation        | P50 Latency | P99 Latency | Throughput   |
| ---------------- | ----------- | ----------- | ------------ |
| Exact match      | <10ms       | <50ms       | 10,000 req/s |
| Fuzzy match      | <200ms      | <1000ms     | 500 req/s    |
| Phrase match     | <300ms      | <1500ms     | 300 req/s    |
| Full-text search | <500ms      | <2000ms     | 200 req/s    |
| Combined search  | <600ms      | <2500ms     | 150 req/s    |

### 7.2 Memory Budgets

| Component            | Max Memory | Notes                    |
| -------------------- | ---------- | ------------------------ |
| Fuzzy index          | <5MB       | N-gram structures        |
| Phrase index         | <10MB      | Multi-word concepts      |
| Full-text index      | <20MB      | Inverted index           |
| Query cache          | <50MB      | LRU cache (1000 entries) |
| Fuzzy distance cache | <20MB      | LRU cache (5000 entries) |
| **Total Added**      | **<105MB** | Runtime overhead         |

### 7.3 Optimization Techniques

**1. Pre-filtering:**

```javascript
// Skip expensive calculations if guaranteed no match
if (Math.abs(term1.length - term2.length) > maxEditDistance) {
  return { match: false, score: 0 };
}
```

**2. Early termination:**

```javascript
// Stop searching if we found a great match
if (bestScore >= 0.95) {
  return bestMatch; // Don't waste time finding marginally better matches
}
```

**3. Batch processing:**

```javascript
// Process multiple queries in parallel
const results = await Promise.all(queries.map((q) => this.search(q)));
```

**4. Lazy index building:**

```javascript
// Only build full-text index when first requested
get fulltextIndex() {
  if (!this._fulltextIndex) {
    this._fulltextIndex = this.buildFulltextIndex();
  }
  return this._fulltextIndex;
}
```

**5. Compressed storage:**

```javascript
// Store indexes in compressed format
const compressedIndex = gzip(JSON.stringify(index));
fs.writeFileSync('fulltext-index.json.gz', compressedIndex);
```

### 7.4 Scalability Considerations

**Horizontal Scaling:**

- Stateless MCP server design allows multiple instances
- Shared pre-computed indexes (read-only, can be CDN-cached)
- No cross-instance coordination required

**Vertical Scaling:**

- Index size grows linearly with document count
- Memory usage: ~100KB per document (fulltext) + ~10KB per concept
- For 1000 docs: ~100MB fulltext + ~10MB concepts = ~110MB total

**Index Partitioning** (for very large datasets >10K docs):

```javascript
// Partition by directory or content type
class PartitionedFullTextSearch {
  constructor() {
    this.partitions = {
      'build-decentralized-apps': new FullTextSearchEngine(...),
      'how-arbitrum-works': new FullTextSearchEngine(...),
      'for-devs': new FullTextSearchEngine(...)
    };
  }

  search(query, partition = null) {
    if (partition) {
      return this.partitions[partition].search(query);
    }

    // Search all partitions and merge results
    const results = Object.values(this.partitions)
      .flatMap(p => p.search(query));

    return this.mergeAndRank(results);
  }
}
```

---

## 8. Security & Validation

### 8.1 Input Validation

**Query Sanitization:**

```javascript
class InputValidator {
  validateSearchQuery(query) {
    // 1. Length limits
    if (query.length > 500) {
      throw new Error('Query too long (max 500 characters)');
    }

    // 2. Character whitelist
    const allowedPattern = /^[a-zA-Z0-9\s\-_.'"()]+$/;
    if (!allowedPattern.test(query)) {
      throw new Error('Query contains invalid characters');
    }

    // 3. No regex injection
    const dangerousPatterns = [
      /[\[\]{}()*+?.\\^$|]/g, // Regex special chars
      /<!--.*?-->/g, // HTML comments
      /<script/gi, // Script tags
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        throw new Error('Query contains potentially dangerous patterns');
      }
    }

    return query.trim();
  }

  validateThreshold(threshold) {
    if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
      throw new Error('Threshold must be a number between 0 and 1');
    }
    return threshold;
  }
}
```

### 8.2 Rate Limiting

**DoS Prevention:**

```javascript
class RateLimiter {
  constructor() {
    this.requestCounts = new Map(); // clientId → { count, resetAt }
    this.limits = {
      perMinute: 100,
      perHour: 1000,
      perDay: 10000,
    };
  }

  checkLimit(clientId) {
    const now = Date.now();
    const clientData = this.requestCounts.get(clientId);

    if (!clientData || now > clientData.resetAt) {
      this.requestCounts.set(clientId, {
        count: 1,
        resetAt: now + 60000, // 1 minute
      });
      return { allowed: true };
    }

    if (clientData.count >= this.limits.perMinute) {
      return {
        allowed: false,
        error: 'Rate limit exceeded',
        retryAfter: clientData.resetAt - now,
      };
    }

    clientData.count++;
    return { allowed: true };
  }
}
```

### 8.3 Resource Limits

**Query Complexity Limits:**

```javascript
class QueryComplexityAnalyzer {
  analyzeComplexity(query) {
    const tokens = query.split(/\s+/);

    // Limit 1: Max tokens
    if (tokens.length > 50) {
      throw new Error('Query too complex (max 50 terms)');
    }

    // Limit 2: Max wildcard expansions
    const wildcards = query.match(/\*/g);
    if (wildcards && wildcards.length > 5) {
      throw new Error('Too many wildcards (max 5)');
    }

    // Limit 3: Max boolean operators
    const booleans = query.match(/\b(AND|OR|NOT)\b/gi);
    if (booleans && booleans.length > 10) {
      throw new Error('Too many boolean operators (max 10)');
    }

    return { complexity: 'acceptable' };
  }

  enforceTimeout(operation, timeout = 5000) {
    return Promise.race([
      operation,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timeout')), timeout)),
    ]);
  }
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

**FuzzyMatcher Tests** (`__tests__/search/FuzzyMatcher.test.js`):

```javascript
describe('FuzzyMatcher', () => {
  test('exact match returns score 1.0', () => {
    const result = fuzzyMatcher.findFuzzyConcept('arbitrum');
    expect(result[0].score).toBe(1.0);
    expect(result[0].matchType).toBe('exact');
  });

  test('typo tolerance (1-2 edits)', () => {
    const result = fuzzyMatcher.findFuzzyConcept('arbitrom');
    expect(result[0].concept).toBe('arbitrum');
    expect(result[0].score).toBeGreaterThan(0.8);
  });

  test('abbreviation expansion', () => {
    const result = fuzzyMatcher.findFuzzyConcept('ARB');
    expect(result[0].concept).toBe('arbitrum');
  });

  test('partial word matching', () => {
    const result = fuzzyMatcher.findFuzzyConcept('gas opt');
    expect(result[0].concept).toContain('optimization');
  });

  test('short terms require high confidence', () => {
    const result = fuzzyMatcher.findFuzzyConcept('ab');
    expect(result.length).toBe(0); // Too short, no fuzzy match
  });
});
```

**PhraseMatcher Tests**:

```javascript
describe('PhraseMatcher', () => {
  test('exact phrase match', () => {
    const result = phraseMatcher.findPhrase('gas optimization');
    expect(result[0].phrase).toBe('gas optimization');
    expect(result[0].matchType).toBe('exact');
  });

  test('word order permutation', () => {
    const result = phraseMatcher.findPhrase('optimization gas');
    expect(result[0].phrase).toBe('gas optimization');
    expect(result[0].matchType).toBe('reordered');
  });

  test('fuzzy component matching', () => {
    const result = phraseMatcher.findPhrase('gas optimizaton');
    expect(result[0].phrase).toBe('gas optimization');
    expect(result[0].score).toBeGreaterThan(0.8);
  });
});
```

**FullTextSearch Tests**:

```javascript
describe('FullTextSearchEngine', () => {
  test('simple query returns ranked results', () => {
    const results = fullTextSearch.search('arbitrum scaling');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(0);
  });

  test('phrase search (quoted)', () => {
    const results = fullTextSearch.search('"layer 2 scaling"');
    expect(results[0].matchType).toBe('phrase');
  });

  test('boolean query (AND)', () => {
    const results = fullTextSearch.search('arbitrum AND optimization');
    results.forEach((r) => {
      expect(r.document.content).toMatch(/arbitrum/i);
      expect(r.document.content).toMatch(/optimization/i);
    });
  });

  test('proximity search', () => {
    const results = fullTextSearch.proximitySearch('gas', 'optimization', 5);
    expect(results.length).toBeGreaterThan(0);
  });

  test('snippet generation', () => {
    const snippets = fullTextSearch.generateSnippets(doc, ['arbitrum'], 200);
    expect(snippets[0]).toContain('<mark>arbitrum</mark>');
  });
});
```

### 9.2 Integration Tests

**Layered Search Pipeline Test**:

```javascript
describe('Layered Search Integration', () => {
  test('exact match bypasses fuzzy', async () => {
    const result = await queryParser.findConceptWithFallbacks('arbitrum');
    expect(result.bestMatch.layer).toBe('exact');
    expect(result.attempts.length).toBe(1); // Only tried exact
  });

  test('fuzzy fallback when no exact match', async () => {
    const result = await queryParser.findConceptWithFallbacks('arbitrom');
    expect(result.bestMatch.layer).toBe('fuzzy');
    expect(result.attempts.length).toBe(2); // Exact failed, fuzzy succeeded
  });

  test('fulltext fallback when no concept match', async () => {
    const result = await queryParser.findConceptWithFallbacks('random phrase not in index');
    expect(result.bestMatch.layer).toBe('fulltext');
    expect(result.attempts.length).toBe(4); // All layers tried
  });
});
```

### 9.3 Performance Tests

**Benchmark Suite** (`__tests__/performance/search-benchmarks.test.js`):

```javascript
describe('Search Performance Benchmarks', () => {
  test('exact match <10ms P50', async () => {
    const times = await benchmark(() => queryParser.findConcept('arbitrum'), 1000);
    expect(median(times)).toBeLessThan(10);
  });

  test('fuzzy match <200ms P50', async () => {
    const times = await benchmark(() => fuzzyMatcher.findFuzzyConcept('arbitrom'), 100);
    expect(median(times)).toBeLessThan(200);
  });

  test('fulltext search <500ms P50', async () => {
    const times = await benchmark(() => fullTextSearch.search('layer 2 scaling solution'), 100);
    expect(median(times)).toBeLessThan(500);
  });

  test('cache hit <5ms', async () => {
    // Prime cache
    await queryParser.findConcept('arbitrum');

    const times = await benchmark(() => queryParser.findConcept('arbitrum'), 1000);
    expect(median(times)).toBeLessThan(5);
  });
});
```

### 9.4 User Acceptance Tests

**Real-World Search Scenarios**:

```javascript
describe('User Acceptance Tests', () => {
  test('User searches for "deploy arbitrum" (multi-word)', async () => {
    const result = await queryParser.findConceptWithFallbacks('deploy arbitrum');
    expect(result.found).toBe(true);
    expect(result.bestMatch.layer).toBeIn(['phrase', 'fulltext']);
  });

  test('User makes typo "arbitrom chain"', async () => {
    const result = await queryParser.findConceptWithFallbacks('arbitrom chain');
    expect(result.found).toBe(true);
    expect(result.bestMatch.concept).toContain('arbitrum');
  });

  test('User searches for abbreviation "L2 scaling"', async () => {
    const result = await queryParser.findConceptWithFallbacks('L2 scaling');
    expect(result.found).toBe(true);
    expect(result.bestMatch.concept).toMatch(/layer.*2|l2/i);
  });
});
```

---

## 10. Deployment & Rollout

### 10.1 Phased Rollout Plan

**Phase 1: Fuzzy Matching (Week 1-2)**

- ✅ Implement FuzzyMatcher module
- ✅ Integrate with QueryParser
- ✅ Unit + integration tests
- ✅ Performance benchmarks
- ✅ Deploy behind feature flag: `FEATURE_FUZZY_MATCHING=true`
- ✅ Monitor metrics: match rate, latency, errors

**Phase 2: Phrase Extraction (Week 3-4)**

- ✅ Enhance ConceptExtractor for multi-word phrases
- ✅ Implement PhraseMatcher module
- ✅ Rebuild concept index with phrases
- ✅ Integration tests
- ✅ Deploy behind feature flag: `FEATURE_PHRASE_EXTRACTION=true`
- ✅ Monitor: phrase extraction quality, index size

**Phase 3: Full-Text Search (Week 5-6)**

- ✅ Implement FullTextIndexer (build-time)
- ✅ Implement FullTextSearchEngine (runtime)
- ✅ Build fulltext-index.json
- ✅ Add new MCP tool: `search_fulltext`
- ✅ Integration tests
- ✅ Deploy behind feature flag: `FEATURE_FULLTEXT_SEARCH=true`
- ✅ Monitor: search latency, result relevance

**Phase 4: Integration & Optimization (Week 7-8)**

- ✅ End-to-end testing of all three features
- ✅ Performance tuning (caching, indexing)
- ✅ Documentation updates
- ✅ User acceptance testing
- ✅ Gradual rollout: 10% → 50% → 100%
- ✅ Remove feature flags (default enabled)

### 10.2 Feature Flags

**Configuration** (`.env`):

```bash
# Feature toggles (default: all enabled in v2.0.0)
FEATURE_FUZZY_MATCHING=true
FEATURE_PHRASE_EXTRACTION=true
FEATURE_FULLTEXT_SEARCH=true

# Gradual rollout percentage (0-100)
ROLLOUT_PERCENTAGE=100
```

**Runtime Check**:

```javascript
class FeatureFlags {
  isEnabled(featureName) {
    const envVar = `FEATURE_${featureName.toUpperCase()}`;
    const enabled = process.env[envVar] === 'true';

    if (!enabled) return false;

    // Gradual rollout logic
    const rolloutPct = parseInt(process.env.ROLLOUT_PERCENTAGE || '100');
    const random = Math.random() * 100;

    return random < rolloutPct;
  }
}

// Usage
if (featureFlags.isEnabled('fuzzy_matching')) {
  result = fuzzyMatcher.findFuzzyConcept(query);
}
```

### 10.3 Monitoring & Metrics

**Key Metrics to Track**:

```javascript
class Metrics {
  recordSearchRequest(layer, success, latency) {
    this.metrics.push({
      timestamp: Date.now(),
      layer, // 'exact', 'fuzzy', 'phrase', 'fulltext'
      success, // boolean
      latency, // milliseconds
    });
  }

  getStats() {
    return {
      totalRequests: this.metrics.length,
      successRate: this.calculateSuccessRate(),
      latencyP50: this.calculatePercentile(50),
      latencyP99: this.calculatePercentile(99),
      byLayer: this.groupByLayer(),
      cacheHitRate: this.calculateCacheHitRate(),
    };
  }
}
```

**Logging Strategy**:

```javascript
logger.info('Search request', {
  query: searchTerm,
  layer: 'fuzzy',
  success: true,
  latency: 145,
  cacheHit: false,
  resultCount: 3,
});

logger.warn('High latency detected', {
  query: searchTerm,
  latency: 1500,
  threshold: 1000,
});

logger.error('Search failed', {
  query: searchTerm,
  error: error.message,
  stack: error.stack,
});
```

### 10.4 Rollback Plan

**Rollback Triggers**:

- P99 latency >5s for any search layer
- Error rate >5% on any feature
- Memory usage >500MB (runtime)
- User complaints about search quality

**Rollback Procedure**:

1. Set feature flag to `false` in `.env`
2. Restart MCP server
3. Verify fallback to exact matching works
4. Investigate root cause
5. Fix and redeploy with gradual rollout

---

## Appendix A: File Structure

```
documentation-graph/
├── src/                              # Build-time processing
│   ├── extractors/
│   │   ├── conceptExtractor.js       # ENHANCED: Add extractPhrases()
│   │   └── documentExtractor.js
│   ├── indexers/
│   │   └── FullTextIndexer.js        # NEW: Build-time indexing
│   ├── builders/
│   │   └── graphBuilder.js
│   └── config/
│       └── search-config.json        # NEW: Search configuration
│
├── mcp-server/src/                   # Runtime MCP server
│   ├── core/
│   │   ├── DataLoader.js             # ENHANCED: Load fulltext index
│   │   ├── QueryParser.js            # ENHANCED: Layered search
│   │   └── ScatteringAnalyzer.js     # ENHANCED: Use fuzzy matching
│   ├── search/                       # NEW: Search modules
│   │   ├── FuzzyMatcher.js           # NEW: Fuzzy/partial matching
│   │   ├── PhraseMatcher.js          # NEW: Multi-word phrase matching
│   │   └── FullTextSearch.js         # NEW: Full-text search engine
│   ├── tools/
│   │   └── ToolRegistry.js           # ENHANCED: Add search_fulltext tool
│   └── utils/
│       ├── CacheManager.js           # NEW: Multi-level caching
│       └── InputValidator.js         # NEW: Security validation
│
├── dist/                             # Pre-computed outputs
│   ├── extracted-concepts.json       # ENHANCED: Include phrases
│   ├── fulltext-index.json           # NEW: Inverted index
│   └── knowledge-graph.json
│
└── __tests__/                        # Test suites
    ├── unit/
    │   ├── FuzzyMatcher.test.js
    │   ├── PhraseMatcher.test.js
    │   └── FullTextSearch.test.js
    ├── integration/
    │   └── layered-search.test.js
    └── performance/
        └── search-benchmarks.test.js
```

---

## Appendix B: Configuration Reference

**Complete Configuration File** (`config/search-config.json`):

```json
{
  "fuzzyMatching": {
    "enabled": true,
    "threshold": 0.8,
    "minTermLength": 3,
    "cacheSize": 5000,
    "algorithms": {
      "primary": "jaccard",
      "fallback": "levenshtein"
    },
    "abbreviations": {
      "ARB": "arbitrum",
      "ETH": "ethereum",
      "L2": "layer 2",
      "USDC": "usdc",
      "DAO": "dao",
      "NFT": "nft"
    }
  },

  "phraseExtraction": {
    "enabled": true,
    "minLength": 2,
    "maxLength": 4,
    "minFrequency": 2,
    "method": "nlp",
    "domainPhrases": ["optimistic rollup", "fraud proof", "gas optimization", "layer 2 scaling"]
  },

  "fulltextSearch": {
    "enabled": true,
    "indexType": "lunr",
    "minTermLength": 3,
    "resultLimit": 20,
    "snippetLength": 200,
    "stemming": true,
    "stopWords": ["the", "and", "or", "but", "for", "with"],
    "fieldBoosts": {
      "title": 2.0,
      "headings": 1.5,
      "body": 1.0
    }
  }
}
```

---

## Appendix C: API Examples

**Example 1: Fuzzy Search**

```javascript
// User searches with typo
const result = await queryParser.findConcept('arbitrom', {
  fuzzyThreshold: 0.8,
  enableFuzzy: true
});

// Response:
{
  concept: 'arbitrum',
  matchType: 'fuzzy',
  score: 0.92,
  explanation: 'Fuzzy match via Jaccard similarity (1 character difference)',
  layer: 'fuzzy'
}
```

**Example 2: Phrase Search**

```javascript
// User searches for multi-word concept
const result = await queryParser.findConcept('gas optimization', {
  enablePhrases: true
});

// Response:
{
  concept: 'gas optimization',
  matchType: 'phrase_exact',
  score: 1.0,
  explanation: 'Exact phrase match',
  layer: 'phrase',
  components: ['gas', 'optimization']
}
```

**Example 3: Full-Text Fallback**

```javascript
// User searches for unlisted concept
const result = await queryParser.findConceptWithFallbacks(
  'arbitrum chain deployment process',
  { enableFulltext: true }
);

// Response:
{
  found: true,
  query: 'arbitrum chain deployment process',
  bestMatch: {
    matchType: 'fulltext',
    score: 0.78,
    documents: [
      {
        path: '/docs/build-decentralized-apps/deploy-smart-contracts.mdx',
        title: 'Deploy Smart Contracts',
        score: 0.85,
        snippets: [
          '...deployment on <mark>Arbitrum</mark> chains requires...'
        ]
      }
    ],
    layer: 'fulltext'
  },
  attempts: [
    { layer: 'exact', success: false },
    { layer: 'fuzzy', success: false },
    { layer: 'phrase', success: false },
    { layer: 'fulltext', success: true, score: 0.78 }
  ]
}
```

---

**End of Technical Architecture Document**

This architecture provides a comprehensive, production-ready design for implementing three complementary search improvements to the MCP documentation-analysis server. The design emphasizes performance, scalability, security, and backward compatibility while delivering a significantly improved user experience.
