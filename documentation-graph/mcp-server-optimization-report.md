# MCP Server Context Overflow Analysis Report

## Executive Summary

The documentation-analysis MCP server is experiencing context overflow when serving the `docs://documents` resource, returning over 23,187 lines of JSON data. This analysis identifies the root causes and provides architectural recommendations for handling large documentation graphs without exhausting context limits.

## Problem Analysis

### Current State

1. **Data Volume**
   - `extracted-documents.json`: 4.3MB, 449 documents, 52,128 lines when pretty-printed
   - `knowledge-graph.json`: 7.7MB with 4,588 nodes and 23,565 edges
   - `graph-analysis.json`: 1.2MB of analysis data
   - Total content length across documents: ~2.5 million characters

2. **Resource Serving Approach**
   - The `ResourceManager.readResource()` method loads entire datasets into memory
   - Returns full JSON with pretty printing (`JSON.stringify(data, null, 2)`)
   - No pagination, filtering, or partial data retrieval
   - All document content is included in responses

3. **Key Issues**
   ```javascript
   // From ResourceManager.js lines 89-97
   case 'docs://documents':
     return {
       contents: [{
         uri,
         mimeType: 'application/json',
         text: JSON.stringify(this.dataLoader.documents, null, 2),  // Full dataset!
       }],
     };
   ```

## Root Causes

1. **Monolithic Data Transfer**: Resources return complete datasets without chunking
2. **Pretty Printing Overhead**: JSON formatting with 2-space indentation multiplies line count
3. **Content Inclusion**: Full document content is included instead of metadata-only views
4. **No Query Parameters**: Resources don't support filtering or scoping
5. **Synchronous Loading**: All data loaded at startup into memory

## Architecture Recommendations

### Solution 1: Pagination and Chunking (Recommended)

Implement paginated resource endpoints with configurable page sizes:

```javascript
// Enhanced resource URI structure
'docs://documents?page=1&limit=20'
'docs://documents?offset=40&limit=20'
'docs://documents/[doc-id]'  // Single document

// Response structure
{
  contents: [{
    uri,
    mimeType: 'application/json',
    text: JSON.stringify({
      total: 449,
      page: 1,
      limit: 20,
      hasMore: true,
      data: documents.slice(0, 20)
    })
  }]
}
```

**Benefits:**
- Predictable response sizes
- Progressive data loading
- Lower memory footprint

### Solution 2: Query Parameters and Filtering

Add query parameter support for targeted data retrieval:

```javascript
// Filter examples
'docs://documents?directory=guides'
'docs://documents?content_type=tutorial'
'docs://documents?search=arbitrum'
'docs://documents?fields=path,title,frontmatter'  // Field selection

// Implementation approach
parseResourceQuery(uri) {
  const url = new URL(uri, 'docs://');
  const params = Object.fromEntries(url.searchParams);
  return {
    resource: url.pathname,
    filters: params
  };
}
```

**Benefits:**
- Reduced data transfer
- Targeted queries
- Field-level granularity

### Solution 3: Summary and Detail Views

Separate lightweight summary views from detailed content:

```javascript
// Resource structure
'docs://documents/summary'     // Metadata only, no content
'docs://documents/list'         // Paths and titles only
'docs://documents/full'         // Complete data (current behavior)
'docs://documents/[id]/content' // Single document content

// Summary response (compact)
{
  documents: documents.map(doc => ({
    id: doc.path,
    title: doc.frontmatter?.title,
    directory: doc.directory,
    wordCount: doc.stats?.words,
    hasContent: true
  }))
}
```

**Benefits:**
- Fast initial loading
- On-demand detail retrieval
- Hierarchical data access

### Solution 4: Streaming and Async Resources

Implement streaming for large datasets using MCP's async capabilities:

```javascript
// Streaming implementation
async* streamDocuments(filters = {}) {
  const batchSize = 50;
  let offset = 0;

  while (offset < this.documents.length) {
    const batch = this.documents
      .slice(offset, offset + batchSize)
      .filter(applyFilters(filters));

    yield {
      batch: offset / batchSize + 1,
      data: batch,
      hasMore: offset + batchSize < this.documents.length
    };

    offset += batchSize;
  }
}
```

**Benefits:**
- Progressive rendering
- Lower peak memory usage
- Better UX for large datasets

### Solution 5: Resource Granularity

Split monolithic resources into smaller, focused endpoints:

```javascript
// Current (monolithic)
'docs://documents'  // All 449 documents

// Proposed (granular)
'docs://directories'           // Directory listing
'docs://directories/[name]'    // Documents in directory
'docs://concepts/top'          // Top 20 concepts
'docs://concepts/[name]'       // Single concept details
'docs://graph/nodes'           // Node list without edges
'docs://graph/edges'           // Edge list without nodes
'docs://graph/subgraph/[id]'   // Local neighborhood of node
```

**Benefits:**
- Composable queries
- Cached partial results
- Reduced response sizes

## Implementation Priority

### Phase 1: Quick Wins (1-2 days)
1. Add `limit` parameter to `docs://documents` (default: 50)
2. Create `docs://documents/summary` without content field
3. Remove pretty printing (use compact JSON)

### Phase 2: Core Features (3-5 days)
1. Implement full pagination with offset/limit
2. Add field selection via `fields` parameter
3. Create granular resources for concepts and graph

### Phase 3: Advanced Features (1 week)
1. Query language for complex filters
2. Streaming support for large responses
3. Response caching with ETags

## Performance Impact

### Current Performance
- Response size: ~4.3MB for documents
- Line count: 52,128 lines
- Context usage: >23,187 lines shown

### Expected Performance (After Phase 1)
- Response size: ~200KB for 50 documents
- Line count: ~2,000 lines
- Context usage: <5% of current

### Expected Performance (After Phase 3)
- Response size: Configurable (10KB - 500KB)
- Line count: User-controlled
- Context usage: Optimized per query

## Code Changes Required

### 1. ResourceManager Enhancement
```javascript
class ResourceManager {
  async readResource(uri) {
    const { resource, params } = this.parseResourceURI(uri);

    switch (resource) {
      case 'documents':
        return this.getDocuments(params);
      case 'documents/summary':
        return this.getDocumentsSummary(params);
      // ... other cases
    }
  }

  getDocuments({ limit = 50, offset = 0, fields, ...filters }) {
    let docs = this.dataLoader.documents;

    // Apply filters
    docs = this.applyFilters(docs, filters);

    // Pagination
    const paged = docs.slice(offset, offset + limit);

    // Field selection
    const projected = fields
      ? this.projectFields(paged, fields)
      : paged;

    return {
      total: docs.length,
      offset,
      limit,
      data: projected
    };
  }
}
```

### 2. Tool Enhancement
```javascript
// Add pagination to tools returning large results
{
  name: 'find_duplicate_content',
  inputSchema: z.object({
    // ... existing fields
    limit: z.number().default(20).optional(),
    offset: z.number().default(0).optional(),
  }),
  handler: async (args) => {
    const results = await this.findDuplicateContent(args);
    return this.paginate(results, args.limit, args.offset);
  }
}
```

### 3. Caching Layer
```javascript
class SmartCache {
  constructor() {
    this.queryCache = new Map();
    this.resourceCache = new Map();
  }

  getCachedResource(uri) {
    const key = this.hashURI(uri);
    if (this.resourceCache.has(key)) {
      const { data, timestamp } = this.resourceCache.get(key);
      if (Date.now() - timestamp < this.ttl) {
        return data;
      }
    }
    return null;
  }
}
```

## Testing Requirements

1. **Unit Tests**
   - Pagination logic with edge cases
   - Filter application correctness
   - Field projection accuracy

2. **Integration Tests**
   - Large dataset handling (>1000 documents)
   - Memory usage under load
   - Response time validation

3. **Performance Tests**
   - Context usage measurement
   - Response size validation
   - Throughput benchmarking

## Migration Path

1. **Backward Compatibility**
   - Keep existing endpoints working
   - Add new paginated endpoints alongside
   - Deprecate monolithic endpoints after transition

2. **Client Updates**
   - Update Claude Code integration to use paginated resources
   - Add progressive loading UI feedback
   - Handle pagination in client-side code

## Conclusion

The current MCP server architecture wasn't designed for the scale of data it's now handling. The proposed solutions provide a clear path to resolve context overflow while improving performance and user experience. Priority should be given to implementing pagination and summary views (Phase 1) as these provide immediate relief with minimal code changes.

The long-term solution involves a combination of:
1. **Paginated responses** for predictable context usage
2. **Query parameters** for targeted data retrieval
3. **Summary views** for fast initial loading
4. **Granular resources** for composable queries

These changes will reduce context usage by 95%+ while maintaining full functionality.