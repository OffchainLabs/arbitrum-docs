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
 * Tool Execution Middleware - Validation, timeout, rate limiting, and monitoring
 *
 * Wraps tool execution with comprehensive safety checks and observability
 */

import { getLogger } from '../utils/logger.js';
import {
  TimeoutError,
  InvalidArgumentError,
  RateLimitError,
  CircuitBreakerError,
  wrapError,
} from '../utils/errors.js';

/**
 * Rate limiter for tool execution
 */
class RateLimiter {
  constructor(config) {
    this.enabled = config.enableRateLimit || false;
    this.windowMs = config.rateLimitWindow || 60000;
    this.max = config.rateLimitMax || 60;
    this.requests = new Map(); // toolName -> [timestamps]
  }

  check(toolName) {
    if (!this.enabled) return true;

    const now = Date.now();
    const toolRequests = this.requests.get(toolName) || [];

    // Remove old requests outside the window
    const validRequests = toolRequests.filter((timestamp) => now - timestamp < this.windowMs);

    if (validRequests.length >= this.max) {
      const oldestRequest = validRequests[0];
      const retryAfter = this.windowMs - (now - oldestRequest);
      throw new RateLimitError(this.max, this.windowMs, retryAfter);
    }

    validRequests.push(now);
    this.requests.set(toolName, validRequests);

    return true;
  }

  reset(toolName = null) {
    if (toolName) {
      this.requests.delete(toolName);
    } else {
      this.requests.clear();
    }
  }
}

/**
 * Circuit breaker for preventing cascading failures
 */
class CircuitBreaker {
  constructor(config) {
    this.enabled = config.enableCircuitBreaker || false;
    this.threshold = config.circuitBreakerThreshold || 5;
    this.timeout = config.circuitBreakerTimeout || 60000;
    this.failures = new Map(); // toolName -> { count, lastFailure }
  }

  async execute(toolName, fn) {
    if (!this.enabled) {
      return await fn();
    }

    const failureData = this.failures.get(toolName);

    // Check if circuit is open
    if (failureData && failureData.count >= this.threshold) {
      const timeSinceLastFailure = Date.now() - failureData.lastFailure;

      if (timeSinceLastFailure < this.timeout) {
        throw new CircuitBreakerError(toolName, failureData.count, this.threshold);
      } else {
        // Half-open state: reset and try again
        this.failures.delete(toolName);
      }
    }

    try {
      const result = await fn();
      // Success: reset failure count
      this.failures.delete(toolName);
      return result;
    } catch (error) {
      // Failure: increment count
      const current = this.failures.get(toolName) || { count: 0, lastFailure: 0 };
      this.failures.set(toolName, {
        count: current.count + 1,
        lastFailure: Date.now(),
      });
      throw error;
    }
  }

  reset(toolName = null) {
    if (toolName) {
      this.failures.delete(toolName);
    } else {
      this.failures.clear();
    }
  }

  getStatus() {
    return Object.fromEntries(
      Array.from(this.failures.entries()).map(([name, data]) => [
        name,
        {
          failures: data.count,
          isOpen: data.count >= this.threshold,
          lastFailure: new Date(data.lastFailure).toISOString(),
        },
      ]),
    );
  }
}

/**
 * Tool execution middleware
 */
export class ToolMiddleware {
  constructor(config) {
    this.config = config;
    this.logger = getLogger();
    this.rateLimiter = new RateLimiter(config);
    this.circuitBreaker = new CircuitBreaker(config);
  }

  /**
   * Execute tool with all middleware protections
   */
  async execute(tool, args, context = {}) {
    const { requestId } = context;
    const startTime = Date.now();
    let success = false;

    // Set request context for logging
    if (requestId) {
      this.logger.setContext({ requestId });
    }

    try {
      // 1. Rate limiting check
      this.rateLimiter.check(tool.name);

      // 2. Input validation (already done by Zod in ToolRegistry, but double-check)
      const validatedArgs = await this.validateInput(tool, args);

      // 3. Execute with timeout and circuit breaker
      const result = await this.circuitBreaker.execute(tool.name, async () => {
        return await this.executeWithTimeout(tool, validatedArgs, this.config.toolTimeout);
      });

      success = true;

      // 4. Validate output (if schema provided)
      const validatedResult = await this.validateOutput(tool, result);

      return validatedResult;
    } catch (error) {
      // Wrap and enhance error
      const wrappedError = wrapError(error, {
        toolName: tool.name,
        args,
        requestId,
      });

      // Log error with context
      this.logger.error(`Tool execution failed: ${tool.name}`, wrappedError, {
        toolName: tool.name,
        duration: Date.now() - startTime,
      });

      throw wrappedError;
    } finally {
      const duration = Date.now() - startTime;

      // Log execution metrics
      this.logger.logToolExecution(tool.name, duration, success);

      // Warn if exceeding performance target
      if (duration > this.config.performanceTarget) {
        this.logger.warn(
          `Tool ${tool.name} exceeded performance target (${duration}ms > ${this.config.performanceTarget}ms)`,
          {
            toolName: tool.name,
            duration,
            target: this.config.performanceTarget,
          },
        );
      }

      // Clear request context
      this.logger.clearContext();
    }
  }

  /**
   * Execute tool with timeout
   */
  async executeWithTimeout(tool, args, timeoutMs) {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new TimeoutError(tool.name, timeoutMs, { args }));
      }, timeoutMs);

      try {
        const result = await tool.handler(args);
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Validate input arguments
   */
  async validateInput(tool, args) {
    try {
      // Zod validation already done, but we can add custom validation here
      if (this.config.enableInputSanitization) {
        return this.sanitizeInput(args);
      }
      return args;
    } catch (error) {
      throw new InvalidArgumentError(tool.name, 'input', error.message, {
        originalError: error.message,
      });
    }
  }

  /**
   * Validate output
   */
  async validateOutput(tool, result) {
    // If tool has output schema, validate it
    if (tool.outputSchema) {
      try {
        return tool.outputSchema.parse(result);
      } catch (error) {
        this.logger.warn(`Output validation failed for tool ${tool.name}`, {
          error: error.message,
        });
        // Don't throw - log warning and return original result
        return result;
      }
    }
    return result;
  }

  /**
   * Sanitize input to prevent injection attacks
   */
  sanitizeInput(args) {
    if (typeof args !== 'object' || args === null) {
      return args;
    }

    const sanitized = {};

    for (const [key, value] of Object.entries(args)) {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        sanitized[key] = value.replace(/[<>&'"]/g, '');
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          typeof item === 'string' ? item.replace(/[<>&'"]/g, '') : item,
        );
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Get middleware status
   */
  getStatus() {
    return {
      rateLimiter: {
        enabled: this.rateLimiter.enabled,
        windowMs: this.rateLimiter.windowMs,
        max: this.rateLimiter.max,
        activeTools: Array.from(this.rateLimiter.requests.keys()),
      },
      circuitBreaker: {
        enabled: this.circuitBreaker.enabled,
        threshold: this.circuitBreaker.threshold,
        timeout: this.circuitBreaker.timeout,
        status: this.circuitBreaker.getStatus(),
      },
    };
  }

  /**
   * Reset middleware state
   */
  reset() {
    this.rateLimiter.reset();
    this.circuitBreaker.reset();
  }
}

export default ToolMiddleware;
