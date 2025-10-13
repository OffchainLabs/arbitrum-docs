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
 * Server Configuration - Environment-based configuration with validation
 *
 * Supports environment variables and provides sensible defaults
 */

import { z } from 'zod';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration schema with validation
 */
const ConfigSchema = z.object({
  // Paths
  distPath: z.string().describe('Path to analysis output directory'),
  docsPath: z.string().describe('Path to source documentation'),

  // Server behavior
  enableAutoRefresh: z.boolean().default(true).describe('Enable file watching and auto-refresh'),
  enableCache: z.boolean().default(true).describe('Enable in-memory caching'),

  // Cache settings
  cacheTtl: z
    .number()
    .int()
    .positive()
    .default(300000)
    .describe('Cache TTL in milliseconds (default 5 minutes)'),
  cacheCleanupInterval: z
    .number()
    .int()
    .positive()
    .default(60000)
    .describe('Cache cleanup interval in milliseconds (default 1 minute)'),

  // Performance
  performanceTarget: z
    .number()
    .int()
    .positive()
    .default(20000)
    .describe('Target response time in milliseconds (default 20 seconds)'),
  toolTimeout: z
    .number()
    .int()
    .positive()
    .default(30000)
    .describe('Tool execution timeout in milliseconds (default 30 seconds)'),

  // Rate limiting
  enableRateLimit: z.boolean().default(false).describe('Enable rate limiting'),
  rateLimitWindow: z
    .number()
    .int()
    .positive()
    .default(60000)
    .describe('Rate limit window in milliseconds (default 1 minute)'),
  rateLimitMax: z
    .number()
    .int()
    .positive()
    .default(60)
    .describe('Max requests per window (default 60)'),

  // Logging
  logLevel: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).default('INFO').describe('Logging level'),
  enableStructuredLogs: z
    .boolean()
    .default(true)
    .describe('Enable structured JSON logging for production'),
  enableMetrics: z.boolean().default(true).describe('Enable performance metrics tracking'),

  // Health monitoring
  enableHealthCheck: z.boolean().default(true).describe('Enable health check monitoring'),
  healthCheckInterval: z
    .number()
    .int()
    .positive()
    .default(30000)
    .describe('Health check interval in milliseconds (default 30 seconds)'),

  // Security
  enablePathValidation: z
    .boolean()
    .default(true)
    .describe('Enable path validation to prevent directory traversal'),
  enableInputSanitization: z.boolean().default(true).describe('Enable input sanitization'),

  // Circuit breaker
  enableCircuitBreaker: z.boolean().default(true).describe('Enable circuit breaker pattern'),
  circuitBreakerThreshold: z
    .number()
    .int()
    .positive()
    .default(5)
    .describe('Circuit breaker failure threshold'),
  circuitBreakerTimeout: z
    .number()
    .int()
    .positive()
    .default(60000)
    .describe('Circuit breaker timeout in milliseconds (default 1 minute)'),

  // Environment
  nodeEnv: z
    .enum(['development', 'production', 'test'])
    .default('production')
    .describe('Node environment'),
});

/**
 * Parse environment variable as boolean
 */
function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parse environment variable as integer
 */
function parseInteger(value, defaultValue) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Load configuration from environment variables with defaults
 */
export function loadConfig() {
  // Default paths based on script location
  const defaultDistPath = resolve(__dirname, '../../../dist');
  const defaultDocsPath = resolve(__dirname, '../../../../docs');

  const rawConfig = {
    // Paths
    distPath: process.env.DIST_PATH || defaultDistPath,
    docsPath: process.env.DOCS_PATH || defaultDocsPath,

    // Server behavior
    enableAutoRefresh: parseBoolean(process.env.ENABLE_AUTO_REFRESH, true),
    enableCache: parseBoolean(process.env.ENABLE_CACHE, true),

    // Cache settings
    cacheTtl: parseInteger(process.env.CACHE_TTL, 300000),
    cacheCleanupInterval: parseInteger(process.env.CACHE_CLEANUP_INTERVAL, 60000),

    // Performance
    performanceTarget: parseInteger(process.env.PERFORMANCE_TARGET, 20000),
    toolTimeout: parseInteger(process.env.TOOL_TIMEOUT, 30000),

    // Rate limiting
    enableRateLimit: parseBoolean(process.env.ENABLE_RATE_LIMIT, false),
    rateLimitWindow: parseInteger(process.env.RATE_LIMIT_WINDOW, 60000),
    rateLimitMax: parseInteger(process.env.RATE_LIMIT_MAX, 60),

    // Logging
    logLevel: process.env.LOG_LEVEL || 'INFO',
    enableStructuredLogs: parseBoolean(
      process.env.ENABLE_STRUCTURED_LOGS,
      process.env.NODE_ENV === 'production',
    ),
    enableMetrics: parseBoolean(process.env.ENABLE_METRICS, true),

    // Health monitoring
    enableHealthCheck: parseBoolean(process.env.ENABLE_HEALTH_CHECK, true),
    healthCheckInterval: parseInteger(process.env.HEALTH_CHECK_INTERVAL, 30000),

    // Security
    enablePathValidation: parseBoolean(process.env.ENABLE_PATH_VALIDATION, true),
    enableInputSanitization: parseBoolean(process.env.ENABLE_INPUT_SANITIZATION, true),

    // Circuit breaker
    enableCircuitBreaker: parseBoolean(process.env.ENABLE_CIRCUIT_BREAKER, true),
    circuitBreakerThreshold: parseInteger(process.env.CIRCUIT_BREAKER_THRESHOLD, 5),
    circuitBreakerTimeout: parseInteger(process.env.CIRCUIT_BREAKER_TIMEOUT, 60000),

    // Environment
    nodeEnv: process.env.NODE_ENV || 'production',
  };

  // Validate configuration
  try {
    const config = ConfigSchema.parse(rawConfig);
    return config;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    throw new Error(`Invalid configuration: ${error.message}`);
  }
}

/**
 * Get configuration with caching
 */
let cachedConfig = null;

export function getConfig() {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}

/**
 * Reset cached configuration (useful for testing)
 */
export function resetConfig() {
  cachedConfig = null;
}

/**
 * Validate configuration paths exist
 */
export async function validateConfigPaths(config) {
  const { access } = await import('fs/promises');
  const { constants } = await import('fs');

  const errors = [];

  try {
    await access(config.distPath, constants.R_OK);
  } catch {
    errors.push(`Distribution path does not exist or is not readable: ${config.distPath}`);
  }

  try {
    await access(config.docsPath, constants.R_OK);
  } catch {
    errors.push(`Documentation path does not exist or is not readable: ${config.docsPath}`);
  }

  if (errors.length > 0) {
    throw new Error(`Configuration path validation failed:\n${errors.join('\n')}`);
  }

  return true;
}

/**
 * Print configuration (for debugging)
 */
export function printConfig(config) {
  console.error('\n=== MCP Server Configuration ===');
  console.error('Paths:');
  console.error(`  - Distribution: ${config.distPath}`);
  console.error(`  - Documentation: ${config.docsPath}`);
  console.error('\nFeatures:');
  console.error(`  - Auto-refresh: ${config.enableAutoRefresh}`);
  console.error(`  - Cache: ${config.enableCache} (TTL: ${config.cacheTtl}ms)`);
  console.error(`  - Rate limiting: ${config.enableRateLimit}`);
  console.error(`  - Health check: ${config.enableHealthCheck}`);
  console.error(`  - Circuit breaker: ${config.enableCircuitBreaker}`);
  console.error('\nPerformance:');
  console.error(`  - Target response time: ${config.performanceTarget}ms`);
  console.error(`  - Tool timeout: ${config.toolTimeout}ms`);
  console.error('\nLogging:');
  console.error(`  - Level: ${config.logLevel}`);
  console.error(`  - Structured logs: ${config.enableStructuredLogs}`);
  console.error(`  - Metrics: ${config.enableMetrics}`);
  console.error('\nEnvironment:');
  console.error(`  - NODE_ENV: ${config.nodeEnv}`);
  console.error('================================\n');
}

export default {
  loadConfig,
  getConfig,
  resetConfig,
  validateConfigPaths,
  printConfig,
  ConfigSchema,
};
