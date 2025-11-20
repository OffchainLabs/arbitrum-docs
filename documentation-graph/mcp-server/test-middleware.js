#!/usr/bin/env node

/**
 * Unit test for middleware MCP formatting
 */

import { ToolMiddleware } from './src/middleware/toolMiddleware.js';

async function testMiddlewareFormatting() {
  console.log('Testing middleware MCP formatting...\n');

  const config = {
    toolTimeout: 30000,
    performanceTarget: 5000,
    enableInputSanitization: false,
    enableRateLimit: false,
    enableCircuitBreaker: false,
  };

  const middleware = new ToolMiddleware(config);

  // Mock tool
  const mockTool = {
    name: 'test_tool',
    handler: async (args) => {
      return {
        found: true,
        data: 'test data',
        args: args,
      };
    },
  };

  console.log('Test 1: Plain object result should be wrapped in MCP format');
  const result1 = await middleware.execute(mockTool, { test: 'value' }, {});

  console.log('Result keys:', Object.keys(result1));
  console.log('Has content?', 'content' in result1);
  console.log('Content is array?', Array.isArray(result1.content));
  console.log('Content length:', result1.content?.length);
  console.log('First item type:', result1.content?.[0]?.type);
  console.log('Has text?', 'text' in (result1.content?.[0] || {}));

  if (!result1.content || !Array.isArray(result1.content)) {
    console.log('✗ FAILED: Result missing content array');
    return false;
  }

  if (result1.content[0].type !== 'text') {
    console.log('✗ FAILED: Content type is not "text"');
    return false;
  }

  if (!result1.content[0].text) {
    console.log('✗ FAILED: Content missing text field');
    return false;
  }

  const parsed = JSON.parse(result1.content[0].text);
  console.log('Parsed data:', parsed);

  if (parsed.found !== true || parsed.data !== 'test data') {
    console.log('✗ FAILED: Data not preserved correctly');
    return false;
  }

  console.log('✓ Test 1 PASSED\n');

  // Test 2: Already wrapped result
  console.log('Test 2: Already wrapped result should not be double-wrapped');
  const mockToolWrapped = {
    name: 'test_tool_wrapped',
    handler: async () => {
      return {
        content: [
          {
            type: 'text',
            text: 'already wrapped',
          },
        ],
      };
    },
  };

  const result2 = await middleware.execute(mockToolWrapped, {}, {});
  console.log('Content length:', result2.content?.length);
  console.log('First item text:', result2.content?.[0]?.text);

  if (result2.content.length !== 1 || result2.content[0].text !== 'already wrapped') {
    console.log('✗ FAILED: Already wrapped result was modified');
    return false;
  }

  console.log('✓ Test 2 PASSED\n');

  // Test 3: String result
  console.log('Test 3: String result should be wrapped');
  const mockToolString = {
    name: 'test_tool_string',
    handler: async () => 'simple string result',
  };

  const result3 = await middleware.execute(mockToolString, {}, {});
  console.log('Text content:', result3.content?.[0]?.text);

  if (result3.content[0].text !== 'simple string result') {
    console.log('✗ FAILED: String result not wrapped correctly');
    return false;
  }

  console.log('✓ Test 3 PASSED\n');

  console.log('=====================================');
  console.log('ALL TESTS PASSED ✓');
  console.log('MCP formatting is working correctly!');
  console.log('=====================================');

  return true;
}

testMiddlewareFormatting().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('✗ TEST FAILED WITH ERROR:');
  console.error(error);
  process.exit(1);
});
