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
 * FAILING TESTS for threshold configuration extraction
 *
 * Priority: HIGH
 * Issue: Magic numbers hard-coded throughout report generators
 * Goal: Extract all thresholds to centralized configuration object
 *
 * These tests WILL FAIL because the implementation doesn't exist yet.
 */

import { describe, it, expect } from '@jest/globals';
import { loadFixture } from '../../helpers/fixtureLoader.js';
import {
  loadReportConfiguration,
  getDefaultConfiguration,
} from '../../../src/helpers/reportHelpers.js';

describe('Threshold Configuration - FAILING TESTS', () => {
  describe('getDefaultConfiguration()', () => {
    // TEST 1: Return complete configuration object
    it('should return configuration object with all threshold categories', () => {
      const config = getDefaultConfiguration();

      expect(config).toHaveProperty('contentQuality');
      expect(config).toHaveProperty('structural');
      expect(config).toHaveProperty('coverage');
      expect(config).toHaveProperty('discoverability');
      expect(config).toHaveProperty('navigation');
    });

    // TEST 2: Content quality thresholds
    it('should include all content quality thresholds', () => {
      const config = getDefaultConfiguration();

      expect(config.contentQuality).toHaveProperty('shallowWordCount');
      expect(config.contentQuality).toHaveProperty('lowConceptDensity');
      expect(config.contentQuality).toHaveProperty('highSimilarityThreshold');

      expect(config.contentQuality.shallowWordCount).toBe(200);
      expect(config.contentQuality.lowConceptDensity).toBe(5);
      expect(config.contentQuality.highSimilarityThreshold).toBe(0.8);
    });

    // TEST 3: Structural thresholds
    it('should include all structural analysis thresholds', () => {
      const config = getDefaultConfiguration();

      expect(config.structural).toHaveProperty('minHubDocuments');
      expect(config.structural).toHaveProperty('oversizedDirMultiplier');

      expect(config.structural.minHubDocuments).toBe(3);
      expect(config.structural.oversizedDirMultiplier).toBe(2);
    });

    // TEST 4: Coverage thresholds
    it('should include all coverage gap thresholds', () => {
      const config = getDefaultConfiguration();

      expect(config.coverage).toHaveProperty('lowConceptsPerDoc');
      expect(config.coverage).toHaveProperty('minDirFileCount');
      expect(config.coverage).toHaveProperty('underrepresentedTypeCount');

      expect(config.coverage.lowConceptsPerDoc).toBe(2);
      expect(config.coverage.minDirFileCount).toBe(3);
      expect(config.coverage.underrepresentedTypeCount).toBe(3);
    });

    // TEST 5: Discoverability thresholds
    it('should include all discoverability thresholds', () => {
      const config = getDefaultConfiguration();

      expect(config.discoverability).toHaveProperty('substantialDocWordCount');
      expect(config.discoverability).toHaveProperty('poorLinkingThreshold');
      expect(config.discoverability).toHaveProperty('deepNestingDepth');
      expect(config.discoverability).toHaveProperty('deepNestingCount');

      expect(config.discoverability.substantialDocWordCount).toBe(300);
      expect(config.discoverability.poorLinkingThreshold).toBe(2);
      expect(config.discoverability.deepNestingDepth).toBe(3);
      expect(config.discoverability.deepNestingCount).toBe(10);
    });

    // TEST 6: Navigation thresholds
    it('should include all navigation analysis thresholds', () => {
      const config = getDefaultConfiguration();

      expect(config.navigation).toHaveProperty('goodCoveragePercent');
      expect(config.navigation).toHaveProperty('minEntryPoints');
      expect(config.navigation).toHaveProperty('maxDeadEnds');
      expect(config.navigation).toHaveProperty('maxDepth');

      expect(config.navigation.goodCoveragePercent).toBe(90);
      expect(config.navigation.minEntryPoints).toBe(5);
      expect(config.navigation.maxDeadEnds).toBe(10);
      expect(config.navigation.maxDepth).toBe(5);
    });
  });

  describe('loadReportConfiguration()', () => {
    // TEST 7: Load from file path
    it('should load configuration from JSON file path', async () => {
      const configPath = 'test/fixtures/configs/default-thresholds.json';

      const config = await loadReportConfiguration(configPath);

      expect(config).toBeDefined();
      expect(config.contentQuality).toBeDefined();
      expect(config.contentQuality.shallowWordCount).toBe(200);
    });

    // TEST 8: Accept object directly
    it('should accept configuration object directly', async () => {
      const configObj = {
        contentQuality: {
          shallowWordCount: 150,
          lowConceptDensity: 3,
        },
      };

      const config = await loadReportConfiguration(configObj);

      expect(config.contentQuality.shallowWordCount).toBe(150);
      expect(config.contentQuality.lowConceptDensity).toBe(3);
    });

    // TEST 9: Merge with defaults
    it('should merge partial configuration with defaults', async () => {
      const partialConfig = {
        contentQuality: {
          shallowWordCount: 150, // Override only this value
        },
      };

      const config = await loadReportConfiguration(partialConfig);

      // Custom value
      expect(config.contentQuality.shallowWordCount).toBe(150);
      // Default values preserved
      expect(config.contentQuality.lowConceptDensity).toBe(5);
      expect(config.structural.minHubDocuments).toBe(3);
    });

    // TEST 10: Validate configuration values
    it('should reject negative threshold values', async () => {
      const invalidConfig = {
        contentQuality: {
          shallowWordCount: -100,
        },
      };

      await expect(async () => {
        await loadReportConfiguration(invalidConfig);
      }).rejects.toThrow(/negative/i);
    });

    // TEST 11: Validate percentage values
    it('should reject percentage values outside 0-1 range', async () => {
      const invalidConfig = {
        contentQuality: {
          highSimilarityThreshold: 1.5, // Should be 0-1
        },
      };

      await expect(async () => {
        await loadReportConfiguration(invalidConfig);
      }).rejects.toThrow(/range|threshold/i);
    });

    // TEST 12: Handle missing file gracefully
    it('should return defaults when config file not found', async () => {
      const config = await loadReportConfiguration('/nonexistent/config.json');

      // Should return default configuration
      expect(config.contentQuality.shallowWordCount).toBe(200);
    });

    // TEST 13: Validate required properties
    it('should ensure all threshold categories exist', async () => {
      const config = await loadReportConfiguration({});

      expect(config).toHaveProperty('contentQuality');
      expect(config).toHaveProperty('structural');
      expect(config).toHaveProperty('coverage');
      expect(config).toHaveProperty('discoverability');
      expect(config).toHaveProperty('navigation');
    });

    // TEST 14: Type validation
    it('should reject non-numeric threshold values', async () => {
      const invalidConfig = {
        contentQuality: {
          shallowWordCount: 'two hundred',
        },
      };

      await expect(async () => {
        await loadReportConfiguration(invalidConfig);
      }).rejects.toThrow(/numeric|number/i);
    });

    // TEST 15: Custom configuration persistence
    it('should preserve all custom values provided', async () => {
      const customConfig = {
        contentQuality: {
          shallowWordCount: 250,
          lowConceptDensity: 7,
          highSimilarityThreshold: 0.85,
        },
        structural: {
          minHubDocuments: 5,
          oversizedDirMultiplier: 3,
        },
      };

      const config = await loadReportConfiguration(customConfig);

      expect(config.contentQuality.shallowWordCount).toBe(250);
      expect(config.contentQuality.lowConceptDensity).toBe(7);
      expect(config.contentQuality.highSimilarityThreshold).toBe(0.85);
      expect(config.structural.minHubDocuments).toBe(5);
      expect(config.structural.oversizedDirMultiplier).toBe(3);
    });
  });
});
