# Feature Requirements: MCP Documentation Analysis Server Improvements

**Document Status:** Draft - Requirements Analysis Phase
**Date:** November 24, 2025
**Project:** Documentation Analysis MCP Server v2.0.0
**Target Component:** Query/Search Layer

---

## Executive Summary

This document defines requirements for three complementary improvements to the MCP documentation-analysis server's concept matching and search capabilities. Currently, the server performs exact string matching against a pre-indexed concept list of ~500 terms, which causes legitimate searches to fail when users employ natural language variations, multi-word phrases, or morphological variants.

**Problem Statement:** Users cannot find relevant documentation using common search patterns:

- "Arbitrum chain deployment" fails (3-word phrase not extracted)
- "deployment" fails (only "deploy" in index, no stemming)
- "deploy arbitrum" fails (phrase order doesn't match concept order)

**Proposed Solution:** Implement three complementary improvements that work together to provide robust, user-friendly search:

1. **Fix 1: Fuzzy/Partial Matching** - Handle typos, abbreviations, and approximate matches
2. **Fix 2: Multi-Word Phrase Extraction** - Support complex domain concepts like "optimistic rollup design"
3. **Fix 3: Full-Text Search Fallback** - Index document content directly when concept matching fails

---

## Feature 1: Fuzzy/Partial Matching

### User Story

**As a** documentation analyst
**I want to** search for concepts even when I'm unsure of exact spelling or terminology
**So that** I can discover relevant documentation without knowing the precise indexed terms

#### Usage Examples

| Search Input          | Expected Behavior                      | Matched Concept    |
| --------------------- | -------------------------------------- | ------------------ |
| "Arbitrom"            | Typo tolerance (Levenshtein 1-2 edits) | "Arbitrum"         |
| "gas opt"             | Partial word matching                  | "gas optimization" |
| "rollup" vs "rollups" | Morphological variants                 | Both matched       |
| "ABR"                 | Abbreviation expansion                 | "Arbitrum"         |

### Acceptance Criteria

**Core Functionality:**

1. Fuzzy match searches using Levenshtein distance with configurable threshold (default: edit distance ≤ 2)
2. Partial word matching (e.g., "gas opt" matches "gas optimization")
3. Morphological variant handling (stemming or lemmatization for common suffixes)
4. Case-insensitive matching throughout
5. Ranking results by match quality (exact > fuzzy > partial)

**Performance Targets:**

1. Query response time: <1 second for single concept (even with fuzzy matching)
2. Memory overhead: <5MB for fuzzy index structures
3. Preprocessing time: <500ms for concept list (one-time, at startup)

**User Experience:**

1. Include match score (0-1) in results showing confidence
2. Explain why a match occurred (e.g., "matched via fuzzy: 1 character difference")
3. Gracefully degrade when no matches found (return empty, not error)
4. Support optional threshold parameter in API (default 0.8)

**Edge Cases:**

1. Very short search terms (1-2 chars): require exact or very high-confidence matches
2. Common abbreviations: maintain mapping (e.g., "ARB" → "Arbitrum", "ETH" → "Ethereum")
3. Hyphenated terms: normalize hyphens/underscores as word boundaries

### Success Metrics

- Search success rate increases from ~65% to >85% (including fuzzy matches)
- Average match score >0.80 (confidence in returned results)
- P50 latency <200ms, P99 latency <1000ms
- Zero false positives (no matching unrelated concepts)
- User satisfaction: fuzzy results feel "relevant" in UX testing

### Business Value

**Why This Matters:**

- Reduces "No results found" frustration for technical writers
- Enables discovery of related concepts through variant searching
- Supports international team members with spelling variations
- Improves accessibility for non-native English speakers
- Competitive feature vs. basic full-text search

**Impact:**

- Estimated 20-30% improvement in search discoverability
- Reduces time to find relevant documentation by 15-25%
- Increases adoption of analysis tools by non-expert users

### Dependencies and Risks

**Dependencies:**

1. Requires fuzzy matching library (e.g., `fuse.js`, `levenshtein-distance`, or `string-similarity`)
2. Depends on concept list availability from DataLoader
3. May require caching layer to avoid recomputing distances

**Risks:**

1. **Fuzzy matching too permissive** → includes irrelevant results
   - Mitigation: Conservative default threshold (0.8), configurable by user
2. **Performance degradation** → response time exceeds 1 second
   - Mitigation: Use indexed/preprocessed fuzzy structures, limit to top N matches
3. **Over-matching short terms** → "gas" matches "gasp", "gases", etc.
   - Mitigation: Minimum length checks, exclude very common words
4. **Inconsistent with database search** → users confused by different results
   - Mitigation: Document fuzzy matching behavior clearly, test comprehensively

### Scope Boundaries

**In Scope:**

- Fuzzy matching for single-word and multi-word concepts
- Edit distance-based algorithm (Levenshtein)
- Integration with existing `QueryParser.findConcept()` method
- Configuration parameters for threshold and behavior
- Comprehensive test coverage for common scenarios

**Out of Scope:**

- Semantic similarity (different from fuzzy matching)
- Machine learning-based matching
- Custom domain-specific spell correction
- Real-time fuzzy index rebuilding
- Multi-language support (English only, initially)

---

## Feature 2: Expand Concept Extraction for Multi-Word Phrases

### User Story

**As a** technical writer analyzing domain-specific topics
**I want to** search for complex multi-word concepts like "optimistic rollup design" as single phrases
**So that** I can accurately identify all documentation covering specific architectural concepts

#### Usage Examples

| Multi-Word Phrase                | Current Behavior                   | Desired Behavior     |
| -------------------------------- | ---------------------------------- | -------------------- |
| "optimistic rollup design"       | Not extracted (3+ words)           | Extracted as concept |
| "gas optimization strategies"    | Not extracted                      | Extracted as concept |
| "cross-chain messaging protocol" | Not extracted                      | Extracted as concept |
| "sequencer decentralization"     | Partially extracted as "sequencer" | Extracted as phrase  |

### Acceptance Criteria

**Core Functionality:**

1. Extract and index multi-word phrases (2-4 words) from document content
2. Identify phrases using dependency parsing, noun phrase chunking, or domain dictionary
3. Weight multi-word phrases based on frequency and document importance
4. Build compound concept index (not just single-word terms)
5. Maintain backward compatibility with existing single-word concepts

**Phrase Identification Methods** (implement at least one):

1. **Linguistic Approach (Recommended):**

   - Use NLP library (Natural.js, compromise.js already available) for noun phrase extraction
   - Extract noun compounds and technical terminology sequences
   - Validate against domain-specific term dictionary

2. **Domain Dictionary Approach:**

   - Pre-define known multi-word terms in configuration
   - Use pattern matching to identify phrases from whitelist
   - Easier to maintain, more predictable results

3. **Statistical Approach:**
   - Identify n-grams (2-4 words) with high co-occurrence frequency
   - Use TF-IDF or PMI scoring to rank phrase importance
   - Extract top N phrases automatically

**Data Structure Changes:**

1. Expand concept index to include phrase entries:
   ```json
   {
     "term": "optimistic rollup design",
     "type": "phrase",
     "length": 3,
     "frequency": 12,
     "documents": ["doc1", "doc2"],
     "components": ["optimistic", "rollup", "design"]
   }
   ```

**Integration Points:**

1. Update `DataPreprocessor` to extract phrases during preprocessing
2. Expand concept list in `extracted-concepts.json` to include phrases
3. Modify `QueryParser.findConcept()` to match phrase queries
4. Update similarity calculations to consider phrase overlap

**Performance Targets:**

1. Phrase extraction: <100ms per document
2. Index size increase: <20% total (5-6MB for ~1000 phrases)
3. Search latency with phrases: <500ms (same as single-word)

**Quality Targets:**

1. Extraction precision: >90% (meaningful phrases, not garbage combinations)
2. Extraction recall: >75% (capture most domain concepts)
3. Phrase frequency threshold: minimum 2 occurrences to be indexed

### Success Metrics

- Number of indexed concepts increases from 500 to 700-800 (with phrases)
- Search success for multi-word queries: >90%
- Phrase extraction false positive rate: <10%
- Average phrase length: 2.5 words
- Top 10 phrases by frequency represent 15-20% of total concept mentions

### Business Value

**Why This Matters:**

- Domain experts naturally search for multi-word concepts
- Improves precision of duplicate/similarity detection
- Enables more nuanced documentation analysis
- Better reflects how domain concepts are actually discussed

**Impact:**

- Identifies previously invisible concept clusters
- Reveals which domain concepts are discussed most frequently
- Enables targeted consolidation recommendations for complex topics
- Increases relevance of search results (fewer false matches)

### Dependencies and Risks

**Dependencies:**

1. NLP library enhancements (Natural.js, compromise.js)
2. Optional: domain-specific term dictionary configuration
3. Re-extraction required during preprocessing phase

**Risks:**

1. **Over-extraction** → too many meaningless phrases
   - Mitigation: Use minimum frequency threshold (≥2), validation rules
2. **Performance regression** → preprocessing time increases significantly
   - Mitigation: Batch processing, lazy extraction, caching
3. **Phrase overlap issues** → "gas optimization" vs "optimization" conflicts
   - Mitigation: Store phrase components separately, use range queries
4. **Data quality issues** → malformed phrases from poor extraction
   - Mitigation: Validation schema, manual review capability

### Scope Boundaries

**In Scope:**

- 2-4 word phrases (configurable)
- Noun phrase extraction using existing NLP libraries
- Integration with preprocessing pipeline
- Phrase weighting and ranking
- Phrase-level search matching
- Test coverage for phrase extraction quality

**Out of Scope:**

- Longer phrases (5+ words)
- Semantic relationship parsing (only term extraction)
- Phrase translation or canonicalization
- Automatic phrase synonym detection
- Cross-language phrase handling

---

## Feature 3: Full-Text Search Fallback

### User Story

**As a** documentation analyst performing comprehensive analysis
**I want to** search document content directly when concept matching doesn't find results
**So that** I can ensure I'm not missing relevant documentation due to concept extraction limitations

#### Usage Examples

| Search Query                     | Concept Match | Full-Text Fallback                    |
| -------------------------------- | ------------- | ------------------------------------- |
| "Arbitrum chain deployment"      | None          | Finds docs containing all words       |
| "layer 2 security model"         | Partial       | Falls back to full-text for precision |
| "transaction finality guarantee" | None          | Indexes and searches document content |
| Technical spec detail            | None          | Locates documents with exact phrase   |

### Acceptance Criteria

**Core Functionality:**

1. Build full-text index of document content at startup
2. Support phrase search (exact match of consecutive words)
3. Support word proximity search (words within N positions)
4. Support Boolean operators (AND, OR, NOT, parentheses)
5. Rank results by relevance (TF-IDF or BM25 scoring)
6. Return snippets showing context around matches

**Index Construction:**

1. Index all document content with term positions stored
2. Separate indexing for:
   - Document titles (higher weight)
   - Headings/sections (medium weight)
   - Body content (standard weight)
   - Code blocks (special handling)
3. Exclude common stop words (configurable list)
4. Support stemming for morphological variants

**Search Features:**

1. **Phrase Search:** "optimistic rollup" (consecutive words)
2. **Proximity Search:** "gas AND optimization" (within 5 words)
3. **Boolean Query:** "(layer 2 OR L2) AND scaling"
4. **Field Search:** "title:arbitrum" or "section:security"
5. **Wildcard Matching:** "opt\*" matches "optimization", "optimistic"

**Integration with Existing Tools:**

1. Modify `find_duplicate_content` tool to use fallback:
   ```
   1. Try exact concept match
   2. If no results, try fuzzy concept match
   3. If still empty, fallback to full-text search
   ```
2. Add new `full_text_search` tool as standalone capability
3. Combine results from both concept and full-text searches
4. Rank combined results by relevance score

**Performance Targets:**

1. Index build time: <2 seconds for 100 documents
2. Index size: <10MB (compressed if possible)
3. Search latency: <500ms for simple queries
4. Phrase search latency: <1 second for complex queries
5. Memory footprint: <20MB for full index

**Result Quality:**

1. Precision: >85% (returned docs contain search terms)
2. Recall: >90% (all relevant docs found)
3. Relevance ranking: Top 3 results contain answer >80% of time
4. No duplicate results in ranked output

### Success Metrics

- Fallback search success: >95% (finds something when concept fails)
- Average search latency: <500ms
- Index coverage: 100% of documents indexed
- User satisfaction: >80% find fallback results useful
- Coverage gain: 20-30% more topics discoverable through fallback

### Business Value

**Why This Matters:**

- Catches documentation that concept extraction misses
- Enables discovery of undocumented or poorly categorized content
- Provides safety net when NLP-based approach fails
- Supports power users who understand document structure

**Impact:**

- Increases overall search discoverability by 25-35%
- Enables more comprehensive duplicate detection
- Reveals content gaps and poorly-indexed documentation
- Improves confidence in analysis completeness

### Dependencies and Risks

**Dependencies:**

1. Full-text indexing library (e.g., `lunr.js`, `meilisearch-js`, or custom inverted index)
2. Integration with existing DataPreprocessor
3. Cache manager for index persistence
4. Query parser enhancements for Boolean syntax

**Risks:**

1. **Over-matching** → too many irrelevant results due to common words
   - Mitigation: Aggressive stop word list, relevance ranking, result limits
2. **Performance issues** → index too large or queries too slow
   - Mitigation: Limit to top documents, use compressed index, implement pagination
3. **Memory explosion** → index consumes excessive RAM
   - Mitigation: Lazy index building, compression, external storage if needed
4. **Inconsistent with concept search** → confusing different result types
   - Mitigation: Clear labeling of result source, combined ranking

### Implementation Approach Options

**Option A: Lightweight (Lunr.js)**

- Pros: Client-side, <1MB library, simple setup
- Cons: Limited features, slower with large datasets
- **Recommendation:** Start here if <500 documents

**Option B: Medium (Custom Inverted Index)**

- Pros: Full control, optimized for use case, no external deps
- Cons: More code to maintain, requires testing
- **Recommendation:** If need custom ranking or limited resources

**Option C: Full-Featured (Meilisearch or Elasticsearch)**

- Pros: Advanced features, excellent performance, typo tolerance
- Cons: External dependency, requires additional server
- **Recommendation:** If need production-grade search experience

### Scope Boundaries

**In Scope:**

- Full-text indexing of all document content
- Phrase and proximity search
- TF-IDF or BM25 relevance ranking
- Context snippets in results
- Boolean query support
- Integration as fallback mechanism
- Comprehensive testing

**Out of Scope:**

- Advanced NLP (entity recognition, sentiment)
- Semantic search (requires vector embeddings)
- Spell correction
- Automatic query expansion
- Machine learning-based ranking
- Multi-language search
- Real-time index updates

---

## Cross-Feature Requirements

### Integration Points

All three features must work together seamlessly:

1. **Query Resolution Pipeline:**

   ```
   User Query
     ↓
   1. Fuzzy match against concepts
   2. Multi-word phrase matching
   3. Full-text fallback search
     ↓
   Ranked Results
   ```

2. **Configuration Management:**

   - All three features use centralized config
   - Configurable enable/disable for each
   - Threshold parameters documented and settable
   - Environment-based defaults

3. **Caching Strategy:**

   - Cache fuzzy distance calculations (most expensive)
   - Cache full-text search results (query frequency)
   - Invalidate on data refresh
   - LRU eviction for memory management

4. **Logging and Monitoring:**
   - Track which search approach succeeds
   - Log performance metrics for each
   - Monitor cache hit rates
   - Alert on performance degradation

### Backward Compatibility

- **Must maintain:** Existing tool APIs unchanged
- **Should maintain:** Result format compatible with current tools
- **Can change:** Internal implementation details
- **Deprecation path:** Phase 1 (current) → Phase 2 (warnings) → Phase 3 (removal)

### Testing Requirements

**Unit Tests (per feature):**

- Fuzzy matching: 20+ test cases
- Phrase extraction: 15+ test cases
- Full-text search: 25+ test cases

**Integration Tests:**

- All three features working together
- Edge case combinations
- Performance under load
- Memory usage validation

**User Acceptance Tests:**

- Real documentation search scenarios
- Comparison with user expectations
- Performance benchmarks
- Regression testing

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

1. Implement fuzzy matching with Levenshtein distance
2. Update `QueryParser.findConcept()` for fuzzy fallback
3. Add configuration parameters
4. Write unit tests

**Deliverable:** Fuzzy matching for single concepts, 1-2 second latency

### Phase 2: Phrase Support (Weeks 3-4)

1. Implement multi-word phrase extraction
2. Update concept index format
3. Modify matching algorithms for phrases
4. Integration testing

**Deliverable:** Phrase extraction and matching, 500ms query latency

### Phase 3: Full-Text Search (Weeks 5-6)

1. Implement full-text index (choose library)
2. Integrate as fallback mechanism
3. Implement result ranking and snippets
4. Performance optimization

**Deliverable:** Full-text search fallback, <1 second latency

### Phase 4: Integration & Optimization (Weeks 7-8)

1. End-to-end testing of all three features
2. Performance tuning and benchmarking
3. Documentation and examples
4. User acceptance testing

**Deliverable:** Production-ready feature set

---

## Success Criteria Summary

### Metrics by Feature

| Metric              | Fix 1 (Fuzzy) | Fix 2 (Phrases) | Fix 3 (Full-Text) |
| ------------------- | ------------- | --------------- | ----------------- |
| Query Success Rate  | >85%          | >90%            | >95%              |
| P50 Latency         | <200ms        | <300ms          | <500ms            |
| P99 Latency         | <1s           | <1.5s           | <2s               |
| False Positive Rate | <10%          | <10%            | <5%               |
| User Satisfaction   | >80%          | >85%            | >80%              |

### Overall System Goals

1. **Availability:** 99.5% uptime for search functionality
2. **Reliability:** <0.1% error rate on valid queries
3. **Performance:** P95 latency <1 second for all features combined
4. **Usability:** Users find answer in top 5 results >80% of time
5. **Maintainability:** <20% increase in code complexity

---

## Configuration Reference

### Environment Variables

```bash
# Feature toggles
FEATURE_FUZZY_MATCHING=true
FEATURE_PHRASE_EXTRACTION=true
FEATURE_FULLTEXT_SEARCH=true

# Fuzzy matching config
FUZZY_THRESHOLD=0.8              # Levenshtein distance tolerance
FUZZY_MIN_LENGTH=3               # Don't fuzzy match terms <3 chars
FUZZY_CACHE_SIZE=5000            # Cache size for distances

# Phrase extraction config
PHRASE_MIN_LENGTH=2              # Minimum words in phrase
PHRASE_MAX_LENGTH=4              # Maximum words in phrase
PHRASE_MIN_FREQUENCY=2           # Minimum occurrences to index
PHRASE_EXTRACTION_METHOD=nlp     # 'nlp', 'dictionary', or 'statistical'

# Full-text search config
FULLTEXT_INDEX_TYPE=lunr         # 'lunr', 'custom', or 'meilisearch'
FULLTEXT_MIN_TERM_LENGTH=3       # Don't index terms <3 chars
FULLTEXT_RESULT_LIMIT=20         # Max results per query
FULLTEXT_SNIPPET_LENGTH=200      # Characters in context snippet
FULLTEXT_USE_STEMMING=true       # Enable morphological stemming
```

### Tool Parameter Examples

```javascript
// Fuzzy matching parameters (in find_duplicate_content)
{
  topic: "arbitrom",              // Typo
  fuzzy_threshold: 0.8,           // Custom tolerance
  min_similarity: 0.7,            // Concept matching threshold
  include_phrases: true           // Use phrase matching too
}

// Full-text search parameters (new tool)
{
  query: "layer 2 scaling solution",
  search_type: "phrase|boolean|proximity",
  fallback_only: false,           // Use full-text even if concepts found
  min_relevance: 0.5,
  result_limit: 20,
  include_snippets: true
}
```

---

## Risk Mitigation Strategies

### Performance Risk

**Risk:** Features degrade response time below acceptable levels

**Mitigation:**

- Implement caching at multiple levels (fuzzy distances, search results)
- Set strict performance budgets during development
- Load test with realistic document volumes
- Implement query timeouts and fallback behavior

### Data Quality Risk

**Risk:** Low-quality phrase extraction or false matches

**Mitigation:**

- Conservative thresholds (prefer precision over recall initially)
- Manual review and curation of extracted phrases
- Comprehensive test coverage for edge cases
- User feedback loop for refinement

### Compatibility Risk

**Risk:** Changes break existing tools or workflows

**Mitigation:**

- Maintain backward compatibility in APIs
- Feature flags for gradual rollout
- Comprehensive integration testing
- Clear documentation of changes

---

## Glossary and Definitions

- **Fuzzy Matching:** Finding approximate matches allowing for typos/variations
- **Levenshtein Distance:** Edit distance metric (number of single-character edits)
- **Phrase:** Multi-word concept (2-4 words treated as atomic unit)
- **Noun Phrase:** Grammatical phrase with noun as head word
- **Full-Text Index:** Inverted index enabling word-based document search
- **TF-IDF:** Term Frequency-Inverse Document Frequency relevance weighting
- **BM25:** Probabilistic relevance framework for full-text search ranking
- **Stemming:** Reducing words to root form (optimizations → optim)
- **Precision:** Proportion of returned results that are relevant
- **Recall:** Proportion of relevant documents that are returned

---

## Appendix: Reference Architecture

### Current System Flow

```
User Search Query
    ↓
QueryParser.findConcept() [EXACT MATCH ONLY]
    ↓
Return matches or empty
```

### Proposed System Flow

```
User Search Query
    ↓
1. Fuzzy Concept Match
   ├─ Search fuzzy index with Levenshtein
   ├─ Return matches > threshold
   └─ Fall through if empty
    ↓
2. Phrase/Multi-Word Match
   ├─ Check if multi-word concept
   ├─ Match against phrase index
   └─ Fall through if empty
    ↓
3. Full-Text Search Fallback
   ├─ Index query with stop words removed
   ├─ Execute Boolean/proximity search
   ├─ Rank by TF-IDF/BM25
   └─ Return snippets
    ↓
Results: Ranked, deduplicated, with explanations
```

### Data Structure Evolution

**Current (Pre-Fix):**

```json
{
  "topConcepts": [
    { "term": "gas", "frequency": 45 },
    { "term": "optimization", "frequency": 23 }
  ]
}
```

**After All Fixes:**

```json
{
  "topConcepts": [
    {
      "term": "gas",
      "frequency": 45,
      "type": "single",
      "fuzzyIndex": true
    },
    {
      "term": "gas optimization",
      "frequency": 18,
      "type": "phrase",
      "length": 2,
      "components": ["gas", "optimization"],
      "fuzzyIndex": true
    }
  ],
  "fullTextIndex": {
    "terms": {...},
    "positions": {...},
    "documentFrequency": {...}
  }
}
```

---

**Document Version:** 1.0
**Last Updated:** November 24, 2025
**Next Review:** Upon completion of Phase 1 implementation
