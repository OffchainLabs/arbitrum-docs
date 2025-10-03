/**
 * Custom Test Sequencer
 *
 * Orders tests to run unit tests first, then integration, then performance
 */

import Sequencer from '@jest/test-sequencer';

class CustomTestSequencer extends Sequencer {
  /**
   * Sort tests by type priority
   */
  sort(tests) {
    const copyTests = Array.from(tests);

    return copyTests.sort((testA, testB) => {
      const pathA = testA.path;
      const pathB = testB.path;

      // Define test type priorities
      const getPriority = (path) => {
        if (path.includes('/unit/')) return 1;
        if (path.includes('/integration/')) return 2;
        if (path.includes('/performance/')) return 3;
        return 4;
      };

      const priorityA = getPriority(pathA);
      const priorityB = getPriority(pathB);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If same priority, sort alphabetically
      return pathA.localeCompare(pathB);
    });
  }
}

export default CustomTestSequencer;
