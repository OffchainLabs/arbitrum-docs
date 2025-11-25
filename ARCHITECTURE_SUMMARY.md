# Technical Architecture Summary

## MCP Documentation Analysis v2.0.0 - Search Enhancements

---

## 🎯 Three Complementary Improvements

### **Fix 1: Fuzzy/Partial Matching**

- **Purpose:** Handle typos, abbreviations, and morphological variants
- **Technology:** Jaccard similarity (n-grams) + Levenshtein distance fallback
- **Performance:** <200ms P50, <1s P99
- **Example:** "arbitrom" → "arbitrum" (typo tolerance)

### **Fix 2: Multi-Word Phrase Extraction**

- **Purpose:** Index complex domain concepts like "gas optimization"
- **Technology:** NLP-based extraction (compromise.js) + domain dictionary
- **Performance:** <100ms per document extraction
- **Example:** "gas optimization" extracted as single concept

### **Fix 3: Full-Text Search Fallback**

- **Purpose:** Find content when concept matching fails
- **Technology:** Inverted index + BM25 ranking (Lunr.js)
- **Performance:** <500ms P50, <2s P99
- **Example:** "layer 2 scaling solution" → full-text search

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   LAYERED SEARCH STRATEGY                    │
│                                                              │
│  User Query: "arbitrom gas optimization"                    │
│       ↓                                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Layer 1: EXACT MATCH          [Fastest: <10ms]      │  │
│  │ ✓ Check: "arbitrom" === concepts                    │  │
│  │ ✗ Result: No exact match                             │  │
│  └──────────────────────────────────────────────────────┘  │
│       ↓                                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Layer 2: FUZZY MATCH          [Fast: <200ms]        │  │
│  │ ✓ Jaccard similarity: "arbitrom" → "arbitrum"       │  │
│  │ ✓ Score: 0.92 (above threshold 0.8)                  │  │
│  │ ✓ Result: MATCH FOUND - Return "arbitrum"           │  │
│  └──────────────────────────────────────────────────────┘  │
│       ↓                                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Layer 3: PHRASE MATCH         [Medium: <300ms]      │  │
│  │ (Skipped - already found match in Layer 2)           │  │
│  └──────────────────────────────────────────────────────┘  │
│       ↓                                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Layer 4: FULL-TEXT FALLBACK   [Slow: <500ms]        │  │
│  │ (Skipped - already found match in Layer 2)           │  │
│  └──────────────────────────────────────────────────────┘  │
│       ↓                                                      │
│  Result: { concept: "arbitrum", score: 0.92, layer: 'fuzzy' }│
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Architecture

### **Build-Time Components** (Pre-processing)

```
ConceptExtractor.js (ENHANCED)
├─ extractPhrases()                    [NEW]
│  └─ Extract 2-4 word phrases using NLP
├─ buildPhraseFuzzyIndex()             [NEW]
│  └─ Pre-compute n-grams for fuzzy matching
└─ Output: extracted-concepts.json
   └─ Contains: single terms + multi-word phrases

FullTextIndexer.js (NEW)
├─ buildIndex()
│  ├─ Tokenize document content
│  ├─ Apply stemming (Porter Stemmer)
│  ├─ Build inverted index: term → [docId, positions]
│  └─ Calculate IDF scores
└─ Output: fulltext-index.json (~10MB)
```

### **Runtime Components** (MCP Server)

```
DataLoader.js (ENHANCED)
├─ Load extracted-concepts.json        [Enhanced with phrases]
├─ Load fulltext-index.json            [NEW]
└─ Build indexes:
   ├─ conceptsByName
   ├─ phrasesByName                    [NEW]
   ├─ fuzzyConceptIndex                [NEW]
   └─ fulltextTermIndex                [NEW]

FuzzyMatcher.js (NEW)
├─ findFuzzyConcept(term, threshold)
│  ├─ 1. Pre-filter by length difference
│  ├─ 2. Calculate Jaccard similarity (n-grams)
│  ├─ 3. Fallback to Levenshtein if needed
│  └─ 4. Cache result (LRU cache: 5000 entries)
└─ Performance: <200ms P50

PhraseMatcher.js (NEW)
├─ findPhrase(query)
│  ├─ 1. Exact multi-word match
│  ├─ 2. Word order permutations
│  └─ 3. Fuzzy match on components
└─ Performance: <300ms P50

FullTextSearch.js (NEW)
├─ search(query, options)
│  ├─ 1. Parse query (phrase/boolean/proximity)
│  ├─ 2. Stem query terms
│  ├─ 3. Lookup inverted index
│  ├─ 4. Rank by BM25
│  └─ 5. Generate snippets
└─ Performance: <500ms P50

QueryParser.js (ENHANCED)
├─ findConceptWithFallbacks(term)      [NEW METHOD]
│  ├─ Try Layer 1: Exact match
│  ├─ Try Layer 2: Fuzzy match
│  ├─ Try Layer 3: Phrase match
│  └─ Try Layer 4: Full-text fallback
└─ Returns best match with confidence score
```

---

## 🗄️ Data Models

### **Enhanced Concept Schema**

```json
{
  "topConcepts": [
    {
      "concept": "gas optimization",
      "data": {
        "type": "phrase", // NEW: 'single' or 'phrase'
        "length": 2, // NEW: Word count
        "components": ["gas", "optimization"], // NEW
        "files": { "/path/to/doc.mdx": 1.5 },
        "totalWeight": 18.3
      },
      "frequency": 42,
      "fileCount": 12
    }
  ],
  "fuzzyIndex": {
    // NEW
    "ngrams": { "_a": ["arbitrum"], "ar": ["arbitrum"] },
    "abbreviations": { "ARB": "arbitrum" }
  }
}
```

### **Full-Text Index Schema**

```json
{
  "invertedIndex": {
    "arbitrum": [
      {
        "docId": "doc_001",
        "tf": 12,
        "positions": [45, 123, 456],
        "fields": { "title": 2, "body": 10 }
      }
    ]
  },
  "idf": { "arbitrum": 0.223 },
  "documents": {
    "doc_001": {
      "path": "/docs/quickstart.mdx",
      "title": "Quickstart",
      "length": 1450
    }
  }
}
```

---

## ⚡ Performance Budget

| Component           | Memory     | Latency P50      | Latency P99 |
| ------------------- | ---------- | ---------------- | ----------- |
| **Fuzzy Index**     | <5MB       | <200ms           | <1s         |
| **Phrase Index**    | <10MB      | <300ms           | <1.5s       |
| **Full-Text Index** | <20MB      | <500ms           | <2s         |
| **Query Cache**     | <50MB      | <5ms (cache hit) | <10ms       |
| **Total Overhead**  | **<105MB** | **<600ms**       | **<2.5s**   |

### **Memory Distribution**

```
┌──────────────────────────────────────────┐
│  Runtime Memory Allocation (~105MB)      │
├──────────────────────────────────────────┤
│  Full-Text Index        ████████  20MB   │
│  Query Cache            ████████████ 50MB│
│  Fuzzy Distance Cache   ████ 20MB        │
│  Phrase Index           █████ 10MB       │
│  Fuzzy Index            ██ 5MB           │
└──────────────────────────────────────────┘
```

---

## 🔒 Security & Validation

### **Input Validation**

```javascript
// Query sanitization
validateSearchQuery(query) {
  ✓ Length: max 500 characters
  ✓ Characters: alphanumeric + spaces + basic punctuation
  ✓ No regex injection patterns
  ✓ No HTML/script tags
}

// Rate limiting
✓ 100 requests/minute per client
✓ 1000 requests/hour per client
✓ Query complexity limits (max 50 terms)
✓ Timeout: 5 seconds per query
```

---

## 🧪 Testing Strategy

### **Test Coverage**

```
Unit Tests (60+ tests)
├─ FuzzyMatcher: 20 test cases
│  ├─ Exact match
│  ├─ Typo tolerance (1-2 edits)
│  ├─ Abbreviation expansion
│  └─ Partial word matching
├─ PhraseMatcher: 15 test cases
│  ├─ Exact phrase match
│  ├─ Word order permutations
│  └─ Fuzzy component matching
└─ FullTextSearch: 25 test cases
   ├─ Simple query
   ├─ Phrase search (quoted)
   ├─ Boolean operators
   └─ Proximity search

Integration Tests
├─ Layered search pipeline
├─ Cache behavior
└─ Result ranking & merging

Performance Tests
├─ Latency benchmarks (P50, P99)
├─ Memory usage validation
└─ Cache hit rate monitoring
```

---

## 🚀 Deployment Plan

### **Phased Rollout (8 weeks)**

```
Phase 1 (Week 1-2): Fuzzy Matching
├─ Implement FuzzyMatcher
├─ Integrate with QueryParser
├─ Feature flag: FEATURE_FUZZY_MATCHING=true
└─ Monitor: match rate, latency

Phase 2 (Week 3-4): Phrase Extraction
├─ Enhance ConceptExtractor
├─ Implement PhraseMatcher
├─ Feature flag: FEATURE_PHRASE_EXTRACTION=true
└─ Monitor: phrase quality, index size

Phase 3 (Week 5-6): Full-Text Search
├─ Implement FullTextIndexer
├─ Implement FullTextSearchEngine
├─ Feature flag: FEATURE_FULLTEXT_SEARCH=true
└─ Monitor: search latency, relevance

Phase 4 (Week 7-8): Integration & Optimization
├─ End-to-end testing
├─ Performance tuning
├─ Gradual rollout: 10% → 50% → 100%
└─ Remove feature flags (default enabled)
```

---

## 📊 Success Metrics

### **Target Improvements**

| Metric                  | Before | After | Improvement    |
| ----------------------- | ------ | ----- | -------------- |
| **Search Success Rate** | 65%    | >85%  | +30%           |
| **Typo Tolerance**      | 0%     | >80%  | New capability |
| **Multi-Word Queries**  | 0%     | >90%  | New capability |
| **Coverage (Fallback)** | 65%    | >95%  | +46%           |
| **P99 Latency**         | N/A    | <2.5s | Acceptable     |

### **Monitoring Dashboards**

```
Search Performance Dashboard
├─ Request rate by layer
│  ├─ Exact: 40% (fastest)
│  ├─ Fuzzy: 30% (medium)
│  ├─ Phrase: 20% (medium)
│  └─ Fulltext: 10% (slowest)
├─ Latency percentiles (P50, P95, P99)
├─ Cache hit rate (target: >60%)
└─ Error rate (target: <1%)
```

---

## 🔧 Configuration Example

### **Environment Variables**

```bash
# Feature toggles (default: all enabled)
FEATURE_FUZZY_MATCHING=true
FEATURE_PHRASE_EXTRACTION=true
FEATURE_FULLTEXT_SEARCH=true

# Fuzzy matching config
FUZZY_THRESHOLD=0.8
FUZZY_MIN_LENGTH=3
FUZZY_CACHE_SIZE=5000

# Phrase extraction config
PHRASE_MIN_LENGTH=2
PHRASE_MAX_LENGTH=4
PHRASE_MIN_FREQUENCY=2

# Full-text search config
FULLTEXT_INDEX_TYPE=lunr
FULLTEXT_RESULT_LIMIT=20
FULLTEXT_SNIPPET_LENGTH=200
```

---

## 📚 Key Decisions Summary

### **Technology Selection**

| Component             | Technology        | Rationale                                                 |
| --------------------- | ----------------- | --------------------------------------------------------- |
| **Fuzzy Matching**    | Jaccard (n-grams) | 50-70% faster than Levenshtein, comparable accuracy       |
| **Phrase Extraction** | Compromise.js NLP | Already used in project, robust noun phrase extraction    |
| **Full-Text Search**  | Lunr.js           | Lightweight (<10KB), perfect for <1000 docs, BM25 ranking |
| **Caching**           | LRU Cache (Map)   | Native JavaScript, no external deps, configurable size    |

### **Architectural Patterns**

- ✅ **Build-time preprocessing** → Minimize runtime overhead
- ✅ **Layered fallback strategy** → Fast paths first, expensive last
- ✅ **Multi-level caching** → Query cache, fuzzy distance cache, fulltext cache
- ✅ **Feature flags** → Gradual rollout, easy rollback
- ✅ **Backward compatibility** → Existing MCP tool APIs unchanged

---

## 🎓 Learning Resources

### **For Implementation**

1. **Fuzzy Matching:**

   - Jaccard Similarity: https://en.wikipedia.org/wiki/Jaccard_index
   - Levenshtein Distance: https://en.wikipedia.org/wiki/Levenshtein_distance

2. **NLP & Phrase Extraction:**

   - Compromise.js Docs: https://github.com/spencermountain/compromise
   - Noun Phrase Chunking: https://nlp.stanford.edu/software/

3. **Full-Text Search:**
   - Lunr.js Documentation: https://lunrjs.com/
   - BM25 Ranking: https://en.wikipedia.org/wiki/Okapi_BM25
   - TF-IDF: https://en.wikipedia.org/wiki/Tf%E2%80%93idf

### **For Testing**

1. Performance Testing: https://jestjs.io/docs/timer-mocks
2. Integration Testing: https://jestjs.io/docs/testing-recipes
3. Load Testing: https://k6.io/docs/

---

## 📝 Next Steps

1. **Review Architecture:** Team review and approval
2. **Create Implementation Tasks:** Break down into Jira/GitHub issues
3. **Set Up Dev Environment:** Install dependencies, configure tooling
4. **Start Phase 1:** Implement FuzzyMatcher module
5. **Write Tests First:** TDD approach for all new modules
6. **Monitor Metrics:** Set up dashboards for performance tracking

---

**Document Status:** ✅ Ready for Implementation
**Last Updated:** November 24, 2025
**Version:** 1.0.0
