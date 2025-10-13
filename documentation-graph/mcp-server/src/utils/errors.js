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
 * MCP Error Classes - Structured error handling following MCP 2025 specification
 *
 * Categorizes errors into client errors, server errors, and external errors
 * with appropriate error codes and context for debugging.
 */

/**
 * Base MCP Error class with structured error information
 */
export class McpError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }
}

/**
 * Client Errors (4xx) - Invalid input or request from client
 */
export class McpClientError extends McpError {
  constructor(message, code = 'CLIENT_ERROR', details = {}) {
    super(message, code, details);
  }
}

/**
 * Invalid tool arguments or parameters
 */
export class InvalidArgumentError extends McpClientError {
  constructor(toolName, argument, reason, details = {}) {
    super(`Invalid argument '${argument}' for tool '${toolName}': ${reason}`, 'INVALID_ARGUMENT', {
      toolName,
      argument,
      reason,
      ...details,
    });
  }
}

/**
 * Tool not found
 */
export class ToolNotFoundError extends McpClientError {
  constructor(toolName, availableTools = []) {
    super(`Tool '${toolName}' not found`, 'TOOL_NOT_FOUND', {
      toolName,
      availableTools: availableTools.map((t) => t.name),
    });
  }
}

/**
 * Resource not found
 */
export class ResourceNotFoundError extends McpClientError {
  constructor(uri, availableResources = []) {
    super(`Resource '${uri}' not found`, 'RESOURCE_NOT_FOUND', {
      uri,
      availableResources: availableResources.map((r) => r.uri),
    });
  }
}

/**
 * Document not found in loaded data
 */
export class DocumentNotFoundError extends McpClientError {
  constructor(docPath, suggestion = null) {
    super(`Document not found: ${docPath}`, 'DOCUMENT_NOT_FOUND', {
      docPath,
      suggestion,
    });
  }
}

/**
 * Concept not found in analysis data
 */
export class ConceptNotFoundError extends McpClientError {
  constructor(concept, availableConcepts = []) {
    super(`Concept '${concept}' not found in documentation`, 'CONCEPT_NOT_FOUND', {
      concept,
      suggestion: 'Try searching for related terms or check spelling',
      availableConcepts: availableConcepts.slice(0, 10), // Top 10 suggestions
    });
  }
}

/**
 * Validation error for input parameters
 */
export class ValidationError extends McpClientError {
  constructor(field, value, constraint) {
    super(`Validation failed for '${field}': ${constraint}`, 'VALIDATION_ERROR', {
      field,
      value,
      constraint,
    });
  }
}

/**
 * Rate limit exceeded
 */
export class RateLimitError extends McpClientError {
  constructor(limit, windowMs, retryAfter) {
    super(
      `Rate limit exceeded: ${limit} requests per ${windowMs}ms. Retry after ${retryAfter}ms`,
      'RATE_LIMIT_EXCEEDED',
      {
        limit,
        windowMs,
        retryAfter,
      },
    );
  }
}

/**
 * Server Errors (5xx) - Internal server issues
 */
export class McpServerError extends McpError {
  constructor(message, code = 'SERVER_ERROR', details = {}) {
    super(message, code, details);
  }
}

/**
 * Server not initialized or data not loaded
 */
export class ServerNotInitializedError extends McpServerError {
  constructor(component = 'server', reason = '') {
    super(
      `Server component '${component}' not initialized${reason ? ': ' + reason : ''}`,
      'SERVER_NOT_INITIALIZED',
      {
        component,
        reason,
      },
    );
  }
}

/**
 * Data loading failure
 */
export class DataLoadError extends McpServerError {
  constructor(dataType, filePath, originalError) {
    super(`Failed to load ${dataType} from ${filePath}`, 'DATA_LOAD_ERROR', {
      dataType,
      filePath,
      originalError: originalError?.message,
      stack: originalError?.stack,
    });
  }
}

/**
 * Cache operation failure
 */
export class CacheError extends McpServerError {
  constructor(operation, key, originalError) {
    super(`Cache ${operation} failed for key '${key}'`, 'CACHE_ERROR', {
      operation,
      key,
      originalError: originalError?.message,
    });
  }
}

/**
 * File system operation failure
 */
export class FileSystemError extends McpServerError {
  constructor(operation, path, originalError) {
    super(`File system ${operation} failed for path '${path}'`, 'FILE_SYSTEM_ERROR', {
      operation,
      path,
      originalError: originalError?.message,
      code: originalError?.code,
    });
  }
}

/**
 * Graph operation failure
 */
export class GraphError extends McpServerError {
  constructor(operation, details = {}) {
    super(`Graph operation '${operation}' failed`, 'GRAPH_ERROR', {
      operation,
      ...details,
    });
  }
}

/**
 * External Errors - Issues with external dependencies or services
 */
export class McpExternalError extends McpError {
  constructor(message, code = 'EXTERNAL_ERROR', details = {}) {
    super(message, code, details);
  }
}

/**
 * Timeout error for long-running operations
 */
export class TimeoutError extends McpExternalError {
  constructor(operation, timeoutMs, details = {}) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`, 'TIMEOUT', {
      operation,
      timeoutMs,
      ...details,
    });
  }
}

/**
 * Circuit breaker open (too many failures)
 */
export class CircuitBreakerError extends McpExternalError {
  constructor(operation, failureCount, threshold) {
    super(
      `Circuit breaker open for '${operation}': ${failureCount} failures (threshold: ${threshold})`,
      'CIRCUIT_BREAKER_OPEN',
      {
        operation,
        failureCount,
        threshold,
      },
    );
  }
}

/**
 * Path validation error (security)
 */
export class PathValidationError extends McpClientError {
  constructor(path, reason) {
    super(`Invalid path '${path}': ${reason}`, 'INVALID_PATH', {
      path,
      reason,
    });
  }
}

/**
 * Helper function to categorize and wrap unknown errors
 */
export function wrapError(error, context = {}) {
  // If already an MCP error, return as-is
  if (error instanceof McpError) {
    return error;
  }

  // Categorize based on error properties
  if (error.code === 'ENOENT') {
    return new FileSystemError('read', context.path || 'unknown', error);
  }

  if (error.code === 'EACCES') {
    return new FileSystemError('access', context.path || 'unknown', error);
  }

  if (error.name === 'ValidationError' || error.name === 'ZodError') {
    return new ValidationError(
      context.field || 'unknown',
      context.value,
      error.message || 'validation failed',
    );
  }

  // Default to server error
  return new McpServerError(error.message || 'Unknown error', 'UNKNOWN_ERROR', {
    originalError: error.message,
    stack: error.stack,
    ...context,
  });
}

/**
 * Helper function to check if error is retryable
 */
export function isRetryableError(error) {
  if (!(error instanceof McpError)) {
    return false;
  }

  const retryableCodes = [
    'TIMEOUT',
    'CIRCUIT_BREAKER_OPEN',
    'DATA_LOAD_ERROR',
    'FILE_SYSTEM_ERROR',
    'CACHE_ERROR',
  ];

  return retryableCodes.includes(error.code);
}

/**
 * Helper function to determine HTTP status code equivalent
 */
export function getHttpStatusCode(error) {
  if (error instanceof McpClientError) {
    if (error.code === 'VALIDATION_ERROR' || error.code === 'INVALID_ARGUMENT') {
      return 400; // Bad Request
    }
    if (
      error.code === 'TOOL_NOT_FOUND' ||
      error.code === 'RESOURCE_NOT_FOUND' ||
      error.code === 'DOCUMENT_NOT_FOUND' ||
      error.code === 'CONCEPT_NOT_FOUND'
    ) {
      return 404; // Not Found
    }
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      return 429; // Too Many Requests
    }
    return 400; // Default client error
  }

  if (error instanceof McpServerError) {
    return 500; // Internal Server Error
  }

  if (error instanceof McpExternalError) {
    if (error.code === 'TIMEOUT') {
      return 504; // Gateway Timeout
    }
    return 503; // Service Unavailable
  }

  return 500; // Unknown errors default to server error
}
