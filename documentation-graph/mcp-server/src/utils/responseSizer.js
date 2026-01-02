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
 * ResponseSizer - Utility for managing response size budgets
 *
 * Provides size estimation and intelligent truncation to keep
 * MCP tool responses within token limits.
 */

import { logger } from './logger.js';

export class ResponseSizer {
  constructor(maxSizeBytes = 100 * 1024) {
    // Default: 100KB
    this.maxSizeBytes = maxSizeBytes;
  }

  /**
   * Estimate the JSON string size of an object in bytes
   */
  estimateSize(obj) {
    try {
      const jsonString = JSON.stringify(obj);
      return Buffer.byteLength(jsonString, 'utf8');
    } catch (error) {
      logger.warn('Failed to estimate object size', { error: error.message });
      return 0;
    }
  }

  /**
   * Check if response is within size budget
   */
  isWithinBudget(obj) {
    const size = this.estimateSize(obj);
    return size <= this.maxSizeBytes;
  }

  /**
   * Get size info for an object
   */
  getSizeInfo(obj) {
    const size = this.estimateSize(obj);
    return {
      sizeBytes: size,
      sizeKB: (size / 1024).toFixed(2),
      withinBudget: size <= this.maxSizeBytes,
      budgetKB: (this.maxSizeBytes / 1024).toFixed(0),
    };
  }

  /**
   * Truncate arrays in object to fit size budget
   * Returns truncated object and truncation info
   */
  truncateToSize(obj, options = {}) {
    const { priorityFields = [], minArraySize = 5 } = options;

    let currentSize = this.estimateSize(obj);

    if (currentSize <= this.maxSizeBytes) {
      return {
        data: obj,
        truncated: false,
        originalSize: currentSize,
        finalSize: currentSize,
      };
    }

    // Clone object to avoid mutating original
    const result = JSON.parse(JSON.stringify(obj));
    const truncations = [];

    // Find all arrays in the object
    const arrays = this.findArrays(result);

    // Sort arrays by size (largest first), but keep priority fields last
    arrays.sort((a, b) => {
      const aIsPriority = priorityFields.includes(a.path);
      const bIsPriority = priorityFields.includes(a.path);

      if (aIsPriority && !bIsPriority) return 1;
      if (!aIsPriority && bIsPriority) return -1;

      return b.length - a.length;
    });

    // Truncate arrays until we're within budget
    for (const arrayInfo of arrays) {
      if (currentSize <= this.maxSizeBytes) break;
      if (arrayInfo.length <= minArraySize) continue;

      // Truncate to 50% or minArraySize, whichever is larger
      const newLength = Math.max(minArraySize, Math.floor(arrayInfo.length / 2));
      const removed = arrayInfo.length - newLength;

      // Truncate the array
      this.setNestedValue(result, arrayInfo.path, arrayInfo.value.slice(0, newLength));

      truncations.push({
        field: arrayInfo.path,
        originalLength: arrayInfo.length,
        newLength,
        removed,
      });

      currentSize = this.estimateSize(result);
    }

    // If still too large, be more aggressive
    if (currentSize > this.maxSizeBytes) {
      for (const arrayInfo of arrays) {
        if (currentSize <= this.maxSizeBytes) break;

        const currentLength = this.getNestedValue(result, arrayInfo.path)?.length || 0;
        if (currentLength <= 3) continue;

        const newLength = Math.max(3, Math.floor(currentLength / 2));
        this.setNestedValue(
          result,
          arrayInfo.path,
          this.getNestedValue(result, arrayInfo.path).slice(0, newLength),
        );

        currentSize = this.estimateSize(result);
      }
    }

    const finalSize = this.estimateSize(result);

    if (truncations.length > 0) {
      logger.warn('Response truncated to fit size budget', {
        originalSize: `${(currentSize / 1024).toFixed(2)}KB`,
        finalSize: `${(finalSize / 1024).toFixed(2)}KB`,
        budgetKB: `${(this.maxSizeBytes / 1024).toFixed(0)}KB`,
        truncations,
      });
    }

    return {
      data: result,
      truncated: truncations.length > 0,
      originalSize: this.estimateSize(obj),
      finalSize,
      truncations,
    };
  }

  /**
   * Find all arrays in an object (recursive)
   */
  findArrays(obj, path = '', arrays = []) {
    if (Array.isArray(obj)) {
      arrays.push({ path, value: obj, length: obj.length });
      return arrays;
    }

    if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        const newPath = path ? `${path}.${key}` : key;
        this.findArrays(value, newPath, arrays);
      }
    }

    return arrays;
  }

  /**
   * Get nested value from object by path (e.g., "a.b.c")
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested value in object by path (e.g., "a.b.c")
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => current?.[key], obj);

    if (target && lastKey) {
      target[lastKey] = value;
    }
  }

  /**
   * Add size metadata to response
   */
  addSizeMetadata(response) {
    const sizeInfo = this.getSizeInfo(response);
    return {
      ...response,
      _metadata: {
        responseSizeKB: sizeInfo.sizeKB,
        withinBudget: sizeInfo.withinBudget,
      },
    };
  }
}

/**
 * Helper function to create document reference (minimal info)
 */
export function toDocumentReference(doc) {
  if (!doc) return null;

  return {
    path: doc.relativePath || doc.path,
    title: doc.frontmatter?.title,
    contentType: doc.frontmatter?.content_type,
    wordCount: doc.stats?.wordCount,
    directory: doc.directory,
  };
}

/**
 * Helper function to convert array of docs to references
 */
export function toDocumentReferences(docs) {
  if (!Array.isArray(docs)) return [];
  return docs.map(toDocumentReference).filter((ref) => ref !== null);
}
