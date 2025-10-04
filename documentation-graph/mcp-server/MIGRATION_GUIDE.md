# Migration Guide: v1.0.0 → v2.0.0

This guide helps you migrate from MCP Server v1.0.0 to v2.0.0, which includes significant improvements following the MCP 2025 specification and best practices.

## Breaking Changes

### 1. Configuration System

**Old (v1.0.0):**

```javascript
// Hardcoded in src/index.js
this.config = {
  distPath: join(__dirname, '../../dist'),
  docsPath: join(__dirname, '../../../docs'),
  enableAutoRefresh: true,
  cacheEnabled: true,
  cacheTTL: 300000,
  performanceTarget: 20000,
};
```

**New (v2.0.0):**

```bash
# Environment variables (see .env.example)
DIST_PATH=/custom/path/to/dist
DOCS_PATH=/custom/path/to/docs
ENABLE_AUTO_REFRESH=true
ENABLE_CACHE=true
CACHE_TTL=300000
LOG_LEVEL=INFO
```

**Migration Steps:**

1. Copy `.env.example` to `.env`
2. Set custom paths if needed:
   ```bash
   DIST_PATH=/absolute/path/to/your/dist
   DOCS_PATH=/absolute/path/to/your/docs
   ```
3. Configure logging and features as needed

### 2. Logging Changes

**Old (v1.0.0):**

```javascript
logger.info('Message');
logger.error('Error:', error);
logger.debug('Debug info', data);
```

**New (v2.0.0):**

```javascript
// Same API, but enhanced with structured logging and metrics
logger.info('Message', { metadata: 'value' });
logger.error('Error occurred', error, { context: 'data' });
logger.debug('Debug info', { requestId: 'abc' });

// New capabilities
const timer = logger.startTimer('operation');
// ... do work
const duration = timer.end();

logger.printMetrics(); // Print performance metrics
```

**No migration required** - backward compatible, but you can enhance logging with metadata.

### 3. Error Handling

**Old (v1.0.0):**

```javascript
throw new Error('Something went wrong');
```

**New (v2.0.0):**

```javascript
import { DocumentNotFoundError, ConceptNotFoundError, ValidationError } from './utils/errors.js';

// Structured errors with context
throw new DocumentNotFoundError(docPath, 'Try checking the path');
throw new ConceptNotFoundError(concept, availableConcepts);
throw new ValidationError('fieldName', value, 'must be positive');
```

**Migration Steps:**

1. Update error handling in custom code to use new error classes
2. Errors are automatically wrapped with context by the middleware
3. No changes needed for tool handlers - they're automatically wrapped

## New Features

### 1. Environment-Based Configuration

All server configuration is now via environment variables:

```bash
# .env file
LOG_LEVEL=DEBUG
ENABLE_METRICS=true
ENABLE_HEALTH_CHECK=true
TOOL_TIMEOUT=30000
```

**Benefits:**

- Environment-specific configuration (dev, staging, production)
- No code changes needed for configuration
- Validation on startup

### 2. Structured Logging with Metrics

Track performance automatically:

```javascript
// Automatic tracking
logger.logToolExecution('find_duplicate_content', 1500, true);
logger.logCacheHit();
logger.logCacheMiss();

// Get metrics
const metrics = logger.getMetrics();
// {
//   requests: { total: 100, avgExecutionTime: 1250 },
//   tools: { find_duplicate_content: { count: 50, avgTime: 1200 } },
//   cache: { hits: 80, misses: 20, hitRate: '80.00%' }
// }
```

### 3. Health Monitoring

Monitor server component status:

```javascript
// Automatic health checks every 30s (configurable)
const health = await server.getHealth();
// {
//   status: 'healthy',
//   components: {
//     dataLoader: { status: 'healthy', documentCount: 150 },
//     cache: { status: 'healthy', hitRate: '75.00%' },
//     memory: { status: 'healthy', heapUsedMB: 512 }
//   }
// }
```

**Components monitored:**

- Data loader status
- Cache performance
- Memory usage
- File watcher status
- Similarity engine
- Scattering analyzer
- Tool registry

### 4. Tool Execution Middleware

Automatic protection for all tools:

- ✅ Input validation (Zod schemas)
- ✅ Timeout handling (configurable, default 30s)
- ✅ Rate limiting (optional)
- ✅ Circuit breaker (prevent cascading failures)
- ✅ Request ID tracking
- ✅ Performance monitoring

No code changes needed - automatically applied to all tools.

### 5. Security Enhancements

**Path Validation:**

```javascript
// Prevents directory traversal attacks
// Validates: doc_paths, doc_path_1, doc_path_2, filter_directory
// Automatically sanitizes all path inputs
```

**Input Sanitization:**

```javascript
// Removes dangerous characters from string inputs
// Prevents XSS and injection attacks
// Configurable via ENABLE_INPUT_SANITIZATION
```

### 6. Circuit Breaker Pattern

Prevents cascading failures:

```bash
# Configure thresholds
ENABLE_CIRCUIT_BREAKER=true
CIRCUIT_BREAKER_THRESHOLD=5       # Open after 5 failures
CIRCUIT_BREAKER_TIMEOUT=60000     # Retry after 1 minute
```

When a tool fails 5 times consecutively, the circuit breaker opens and prevents further calls for 60 seconds, allowing the system to recover.

### 7. Enhanced Error Codes

All errors now include:

- Unique error code (e.g., `TOOL_NOT_FOUND`, `TIMEOUT`, `VALIDATION_ERROR`)
- Structured details (context, suggestions)
- HTTP status code equivalent
- Stack trace (in development mode)

## Configuration Reference

### Required Configuration

```bash
# Paths (uses defaults if not set)
DIST_PATH=/path/to/dist
DOCS_PATH=/path/to/docs
```

### Optional Configuration

```bash
# Server Behavior
ENABLE_AUTO_REFRESH=true
ENABLE_CACHE=true

# Cache
CACHE_TTL=300000
CACHE_CLEANUP_INTERVAL=60000

# Performance
PERFORMANCE_TARGET=20000
TOOL_TIMEOUT=30000

# Rate Limiting
ENABLE_RATE_LIMIT=false
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=60

# Logging
LOG_LEVEL=INFO
ENABLE_STRUCTURED_LOGS=false
ENABLE_METRICS=true

# Health
ENABLE_HEALTH_CHECK=true
HEALTH_CHECK_INTERVAL=30000

# Security
ENABLE_PATH_VALIDATION=true
ENABLE_INPUT_SANITIZATION=true

# Circuit Breaker
ENABLE_CIRCUIT_BREAKER=true
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000

# Environment
NODE_ENV=production
```

## Testing Your Migration

### 1. Verify Configuration

```bash
# Run with debug logging to see configuration
LOG_LEVEL=DEBUG node src/index.js
```

You should see:

```
=== MCP Server Configuration ===
Paths:
  - Distribution: /path/to/dist
  - Documentation: /path/to/docs
Features:
  - Auto-refresh: true
  - Cache: true (TTL: 300000ms)
...
```

### 2. Test Tools

Run existing tools to ensure they work:

```javascript
// Claude Code CLI
Use find_duplicate_content with topic "gas optimization"
```

Should work identically to v1.0.0, but with:

- Better error messages
- Request ID tracking
- Performance metrics
- Timeout protection

### 3. Monitor Metrics

```bash
# Enable metrics
ENABLE_METRICS=true node src/index.js
```

After some tool calls, check logs for:

```
=== Performance Metrics ===
Total requests: 10
Average execution time: 1250ms
Cache performance:
  Hits: 8
  Misses: 2
  Hit rate: 80.00%
Tool execution stats:
  find_duplicate_content: 5 calls, 1200ms avg, 100.0% success
```

### 4. Test Health Checks

```bash
# Enable health checks
ENABLE_HEALTH_CHECK=true node src/index.js
```

Logs should show periodic health checks:

```
[INFO] Health check status: healthy
```

## Rollback Instructions

If you need to rollback to v1.0.0:

1. **Remove environment configuration:**

   ```bash
   rm .env
   ```

2. **Checkout v1.0.0:**

   ```bash
   git checkout v1.0.0
   npm install
   ```

3. **Restart server:**
   ```bash
   npm start
   ```

## Support

### Common Issues

**Issue:** `Configuration validation failed`

- **Solution:** Check `.env` file syntax, ensure boolean values are `true`/`false`

**Issue:** `Data path does not exist`

- **Solution:** Set `DIST_PATH` to absolute path to your `dist/` directory

**Issue:** `Tool timeout after 30000ms`

- **Solution:** Increase `TOOL_TIMEOUT` or optimize your documentation size

**Issue:** `Circuit breaker open`

- **Solution:** Check error logs, fix underlying issue, or increase `CIRCUIT_BREAKER_THRESHOLD`

### Debugging

```bash
# Maximum verbosity
LOG_LEVEL=DEBUG \
ENABLE_METRICS=true \
ENABLE_HEALTH_CHECK=true \
node src/index.js
```

### Getting Help

1. Check logs with `LOG_LEVEL=DEBUG`
2. Review error codes and context
3. Check health status
4. Review metrics for performance issues
5. Open an issue with error details

## Summary of Improvements

### Reliability

- ✅ Structured error handling with codes
- ✅ Timeout protection (30s default)
- ✅ Circuit breaker pattern
- ✅ Health monitoring

### Performance

- ✅ Performance metrics tracking
- ✅ Cache hit rate monitoring
- ✅ Tool execution time tracking
- ✅ Memory usage monitoring

### Security

- ✅ Path validation (directory traversal prevention)
- ✅ Input sanitization
- ✅ Rate limiting (optional)
- ✅ Output validation

### Observability

- ✅ Structured logging with request IDs
- ✅ Automatic metrics collection
- ✅ Health check system
- ✅ Performance warnings

### Configuration

- ✅ Environment-based configuration
- ✅ Validation on startup
- ✅ No code changes for config
- ✅ Environment-specific settings

## What Stays the Same

- ✅ All tool APIs (no breaking changes)
- ✅ All resource URIs
- ✅ MCP protocol compatibility
- ✅ Claude Code CLI integration
- ✅ Tool schemas and responses
- ✅ Core analysis algorithms
- ✅ Data loading and indexing

**Your existing tool calls and workflows will continue to work without modification.**
