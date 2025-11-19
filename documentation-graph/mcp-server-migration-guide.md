# MCP Server Context Overflow - Migration Guide

## Quick Start (5-Minute Fix)

To immediately reduce context usage by 90%, follow these steps:

### Step 1: Backup Current ResourceManager
```bash
cp mcp-server/src/resources/ResourceManager.js mcp-server/src/resources/ResourceManager.original.js
```

### Step 2: Update ResourceManager.js

Add these methods to the existing ResourceManager class:

```javascript
// Add to ResourceManager.js after the constructor

parseResourceURI(uri) {
  const match = uri.match(/^docs:\/\/([^?]+)(\?(.+))?$/);
  if (!match) return { resourcePath: uri.replace('docs://', ''), params: {} };

  const resourcePath = match[1];
  const params = {};
  if (match[3]) {
    const searchParams = new URLSearchParams(match[3]);
    for (const [key, value] of searchParams) {
      params[key] = key === 'limit' || key === 'offset'
        ? parseInt(value, 10)
        : value;
    }
  }
  return { resourcePath, params };
}

// Update readResource method
async readResource(uri) {
  const { resourcePath, params } = this.parseResourceURI(uri);
  logger.debug(`Reading resource: ${resourcePath}`, params);

  switch (resourcePath) {
    case 'documents':
      // Add pagination support
      if (params.limit !== undefined) {
        const limit = Math.min(params.limit || 50, 100); // Max 100
        const offset = params.offset || 0;
        const docs = this.dataLoader.documents.slice(offset, offset + limit);
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              total: this.dataLoader.documents.length,
              offset,
              limit,
              hasMore: offset + limit < this.dataLoader.documents.length,
              documents: docs
            }) // No pretty printing!
          }]
        };
      }
      // Fallback to original behavior if no limit specified
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(this.dataLoader.documents, null, 2),
        }],
      };

    case 'documents/summary':
      // New lightweight endpoint
      const summaries = this.dataLoader.documents.map(doc => ({
        path: doc.relativePath,
        title: doc.frontmatter?.title || doc.fileName,
        directory: doc.directory,
        wordCount: doc.stats?.words || 0
      }));
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(summaries)
        }]
      };

    // ... rest of the switch cases remain the same
  }
}
```

### Step 3: Test the Changes

1. Restart the MCP server
2. Test paginated access:
   ```
   readMcpResource("docs://documents?limit=20")
   readMcpResource("docs://documents/summary")
   ```

## Full Migration Path

### Phase 1: Immediate Relief (Day 1)

#### 1.1 Replace ResourceManager
```bash
# Copy the optimized version
cp mcp-server-quick-fix.js mcp-server/src/resources/OptimizedResourceManager.js

# Update index.js import
sed -i '' "s/ResourceManager/OptimizedResourceManager as ResourceManager/" mcp-server/src/index.js
```

#### 1.2 Update Client Usage
When using the MCP server, prefer these endpoints:
- `docs://documents/summary` - For document listings
- `docs://documents?limit=20` - For paginated full documents
- `docs://concepts/top` - For concept overview
- `docs://summary` - For system overview

### Phase 2: Tool Updates (Day 2-3)

#### 2.1 Add Pagination to Tools

Update ToolRegistry.js to add pagination parameters:

```javascript
// In find_duplicate_content tool definition
inputSchema: z.object({
  // ... existing fields
  limit: z.number().min(1).max(50).default(10).optional()
    .describe('Maximum results to return'),
  offset: z.number().min(0).default(0).optional()
    .describe('Number of results to skip'),
})

// In the handler
async findDuplicateContent(args) {
  const { limit = 10, offset = 0 } = args;
  // ... existing logic

  // Apply pagination before returning
  const paginatedResults = {
    total: results.length,
    offset,
    limit,
    results: results.slice(offset, offset + limit)
  };

  return paginatedResults;
}
```

#### 2.2 Update All List-Returning Tools

Apply similar pagination to:
- `find_scattered_topics`
- `find_similar_documents`
- `find_orphaned_content`
- `analyze_topic_distribution`

### Phase 3: Advanced Features (Week 1)

#### 3.1 Implement Field Selection

Add field projection support:

```javascript
// In ResourceManager
getDocumentsWithFields(fields = [], limit = 50, offset = 0) {
  const docs = this.dataLoader.documents.slice(offset, offset + limit);

  if (fields.length === 0) return docs;

  return docs.map(doc => {
    const projected = {};
    for (const field of fields) {
      if (field.includes('.')) {
        // Handle nested fields like 'frontmatter.title'
        const [parent, child] = field.split('.');
        if (!projected[parent]) projected[parent] = {};
        projected[parent][child] = doc[parent]?.[child];
      } else {
        projected[field] = doc[field];
      }
    }
    return projected;
  });
}

// Usage: docs://documents?fields=path,title,frontmatter.content_type&limit=50
```

#### 3.2 Add Caching Headers

Include cache hints in responses:

```javascript
return {
  contents: [{
    uri,
    mimeType: 'application/json',
    text: JSON.stringify(data),
    metadata: {
      etag: generateETag(data),
      cacheControl: 'max-age=300',
      lastModified: this.dataLoader.lastLoadTime
    }
  }]
};
```

### Phase 4: Monitoring and Optimization

#### 4.1 Add Response Size Tracking

```javascript
// In toolMiddleware.js
async execute(tool, args, context) {
  const result = await tool.handler(args);

  // Track response size
  const responseSize = JSON.stringify(result).length;
  if (responseSize > 100000) { // 100KB warning threshold
    logger.warn(`Large response from ${tool.name}: ${responseSize} bytes`);
  }

  return result;
}
```

#### 4.2 Implement Response Streaming

For very large datasets, implement streaming:

```javascript
// New streaming resource type
case 'documents/stream':
  return {
    contents: [{
      uri,
      mimeType: 'application/x-ndjson',
      stream: async function* () {
        for (const doc of this.dataLoader.documents) {
          yield JSON.stringify(doc) + '\n';
        }
      }
    }]
  };
```

## Testing Checklist

### Unit Tests
- [ ] Pagination with various limits (0, 1, 50, 100, 1000)
- [ ] Offset handling at boundaries
- [ ] Field selection with nested fields
- [ ] URI parsing with query parameters
- [ ] Empty dataset handling

### Integration Tests
- [ ] Claude Code CLI compatibility
- [ ] Memory usage under 500MB
- [ ] Response time under 2 seconds
- [ ] Concurrent request handling
- [ ] File watcher with paginated resources

### Performance Tests
- [ ] Context usage measurement before/after
- [ ] Response size validation
- [ ] Throughput with pagination

## Rollback Plan

If issues arise, rollback is simple:

```bash
# Restore original ResourceManager
cp mcp-server/src/resources/ResourceManager.original.js mcp-server/src/resources/ResourceManager.js

# Restart server
npm run dev
```

## Success Metrics

### Before Migration
- Response size: 4.3MB+
- Context lines: 23,000+
- Load time: 5-10 seconds
- Memory usage: 500MB+

### After Phase 1
- Response size: <200KB
- Context lines: <2,000
- Load time: <1 second
- Memory usage: <200MB

### After Full Migration
- Response size: Configurable (10-500KB)
- Context lines: User-controlled
- Load time: <500ms
- Memory usage: <150MB

## Common Issues and Solutions

### Issue 1: Client expects full dataset
**Solution**: Use the original endpoint without parameters, or update client to handle pagination

### Issue 2: Tools break with paginated responses
**Solution**: Update tool handlers to work with paginated structure

### Issue 3: Performance degradation with filters
**Solution**: Add indexes for commonly filtered fields

## Support and Resources

- Original implementation: `mcp-server/src/resources/ResourceManager.js`
- Optimized implementation: `mcp-server-quick-fix.js`
- Architecture documentation: `mcp-server/ARCHITECTURE.md`
- Test fixtures: `mcp-server/test/fixtures/`

## Next Steps

1. Implement Phase 1 quick fixes
2. Monitor context usage improvements
3. Gather feedback on new endpoints
4. Plan Phase 2 tool updates
5. Consider implementing streaming for real-time updates