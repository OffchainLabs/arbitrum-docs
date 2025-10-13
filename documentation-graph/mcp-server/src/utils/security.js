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
 * Security Utilities - Input validation and sanitization
 *
 * Provides path validation, input sanitization, and security checks
 */

import { resolve, normalize, isAbsolute } from 'path';
import { PathValidationError } from './errors.js';

/**
 * Validate and sanitize file paths to prevent directory traversal attacks
 */
export class PathValidator {
  constructor(allowedBasePaths = []) {
    this.allowedBasePaths = allowedBasePaths.map((p) => resolve(p));
  }

  /**
   * Validate that a path is within allowed base paths
   */
  validate(inputPath, basePath = null) {
    if (!inputPath) {
      throw new PathValidationError(inputPath, 'Path is empty or null');
    }

    // Normalize path to prevent traversal attacks
    const normalizedPath = normalize(inputPath);

    // Check for directory traversal patterns
    if (normalizedPath.includes('..')) {
      throw new PathValidationError(inputPath, 'Path contains directory traversal (..)');
    }

    // Check for absolute paths outside allowed bases
    if (isAbsolute(normalizedPath)) {
      const isAllowed = this.allowedBasePaths.some((base) => normalizedPath.startsWith(base));

      if (!isAllowed) {
        throw new PathValidationError(inputPath, 'Absolute path not within allowed base paths');
      }

      return normalizedPath;
    }

    // For relative paths, resolve against base path
    if (basePath) {
      const resolvedBase = resolve(basePath);
      const resolvedPath = resolve(resolvedBase, normalizedPath);

      // Ensure resolved path is within base
      if (!resolvedPath.startsWith(resolvedBase)) {
        throw new PathValidationError(inputPath, 'Resolved path escapes base directory');
      }

      return resolvedPath;
    }

    return normalizedPath;
  }

  /**
   * Validate multiple paths
   */
  validatePaths(paths, basePath = null) {
    return paths.map((path) => this.validate(path, basePath));
  }

  /**
   * Check if path is safe (doesn't throw, returns boolean)
   */
  isSafe(inputPath, basePath = null) {
    try {
      this.validate(inputPath, basePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add allowed base path
   */
  addAllowedPath(basePath) {
    const resolved = resolve(basePath);
    if (!this.allowedBasePaths.includes(resolved)) {
      this.allowedBasePaths.push(resolved);
    }
  }
}

/**
 * Sanitize string inputs to prevent injection attacks
 */
export class InputSanitizer {
  /**
   * Remove potentially dangerous characters from string
   */
  static sanitizeString(input, options = {}) {
    if (typeof input !== 'string') {
      return input;
    }

    const { allowHtml = false, allowScripts = false, maxLength = null } = options;

    let sanitized = input;

    // Remove script tags if not allowed
    if (!allowScripts) {
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    // Remove HTML tags if not allowed
    if (!allowHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>&'"]/g, (char) => {
      const escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&#x27;',
        '"': '&quot;',
      };
      return escapeMap[char] || char;
    });

    // Enforce max length
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj, options = {}) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj, options);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item, options));
    }

    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value, options);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Validate concept/topic name (alphanumeric, spaces, hyphens, underscores)
   */
  static validateConceptName(name) {
    if (typeof name !== 'string') {
      return false;
    }

    // Allow alphanumeric, spaces, hyphens, underscores
    const pattern = /^[a-zA-Z0-9\s\-_]+$/;
    return pattern.test(name);
  }

  /**
   * Validate and sanitize document path
   */
  static sanitizeDocPath(path) {
    if (typeof path !== 'string') {
      return path;
    }

    // Remove any dangerous path components
    let sanitized = path
      .replace(/\\/g, '/') // Normalize path separators
      .replace(/\/\//g, '/') // Remove double slashes
      .replace(/^\//g, ''); // Remove leading slash

    return sanitized;
  }
}

/**
 * Security middleware for tool arguments
 */
export class SecurityMiddleware {
  constructor(config = {}) {
    this.pathValidator = new PathValidator(config.allowedBasePaths || []);
    this.enablePathValidation = config.enablePathValidation !== false;
    this.enableInputSanitization = config.enableInputSanitization !== false;
  }

  /**
   * Validate and sanitize tool arguments
   */
  validateToolArgs(toolName, args) {
    if (!this.enablePathValidation && !this.enableInputSanitization) {
      return args;
    }

    const sanitized = { ...args };

    // Handle path-related arguments
    const pathFields = this.getPathFields(toolName);
    for (const field of pathFields) {
      if (sanitized[field]) {
        if (Array.isArray(sanitized[field])) {
          // Validate array of paths
          sanitized[field] = sanitized[field].map((path) =>
            this.enablePathValidation
              ? this.pathValidator.validate(path)
              : InputSanitizer.sanitizeDocPath(path),
          );
        } else {
          // Validate single path
          sanitized[field] = this.enablePathValidation
            ? this.pathValidator.validate(sanitized[field])
            : InputSanitizer.sanitizeDocPath(sanitized[field]);
        }
      }
    }

    // Sanitize string inputs
    if (this.enableInputSanitization) {
      for (const [key, value] of Object.entries(sanitized)) {
        if (typeof value === 'string' && !pathFields.includes(key)) {
          sanitized[key] = InputSanitizer.sanitizeString(value, {
            allowHtml: false,
            allowScripts: false,
            maxLength: 1000,
          });
        }
      }
    }

    return sanitized;
  }

  /**
   * Get path-related fields for a tool
   */
  getPathFields(toolName) {
    const pathFieldsByTool = {
      find_similar_documents: ['doc_path'],
      find_content_overlaps: ['doc_path_1', 'doc_path_2'],
      suggest_consolidation: ['doc_paths'],
      find_orphaned_content: ['filter_directory'],
    };

    return pathFieldsByTool[toolName] || [];
  }

  /**
   * Validate resource URI
   */
  validateResourceUri(uri) {
    if (typeof uri !== 'string') {
      return false;
    }

    // Only allow specific URI patterns
    const allowedPatterns = [
      /^docs:\/\/graph$/,
      /^docs:\/\/documents$/,
      /^docs:\/\/concepts$/,
      /^docs:\/\/analysis$/,
      /^docs:\/\/summary$/,
    ];

    return allowedPatterns.some((pattern) => pattern.test(uri));
  }
}

/**
 * Rate limiting utilities
 */
export class SecurityRateLimiter {
  constructor(windowMs = 60000, maxRequests = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map(); // IP/identifier -> [timestamps]
  }

  /**
   * Check if request is allowed
   */
  checkLimit(identifier = 'default') {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = userRequests.filter((timestamp) => now - timestamp < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      const oldestRequest = validRequests[0];
      const retryAfter = this.windowMs - (now - oldestRequest);
      return {
        allowed: false,
        retryAfter,
        remaining: 0,
      };
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return {
      allowed: true,
      retryAfter: null,
      remaining: this.maxRequests - validRequests.length,
    };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier = null) {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

export default {
  PathValidator,
  InputSanitizer,
  SecurityMiddleware,
  SecurityRateLimiter,
};
