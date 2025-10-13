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
 * FileWatcher - Monitors dist/ directory for changes and triggers refresh
 *
 * Uses chokidar for efficient file system watching
 */

import chokidar from 'chokidar';
import { join } from 'path';
import { logger } from '../utils/logger.js';

export class FileWatcher {
  constructor(distPath, onChangeCallback) {
    this.distPath = distPath;
    this.onChangeCallback = onChangeCallback;
    this.watcher = null;
    this.debounceTimeout = null;
    this.debounceDelay = 2000; // Wait 2 seconds after last change
  }

  async start() {
    logger.info(`Starting file watcher on ${this.distPath}`);

    const watchPaths = [
      join(this.distPath, 'knowledge-graph.json'),
      join(this.distPath, 'extracted-documents.json'),
      join(this.distPath, 'extracted-concepts.json'),
      join(this.distPath, 'graph-analysis.json'),
    ];

    this.watcher = chokidar.watch(watchPaths, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100,
      },
    });

    this.watcher.on('change', (path) => {
      logger.debug(`File changed: ${path}`);
      this.handleChange();
    });

    this.watcher.on('add', (path) => {
      logger.debug(`File added: ${path}`);
      this.handleChange();
    });

    this.watcher.on('error', (error) => {
      logger.error('File watcher error:', error);
    });

    logger.info('File watcher started');
  }

  handleChange() {
    // Debounce: wait for all changes to settle
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.onChangeCallback();
      this.debounceTimeout = null;
    }, this.debounceDelay);
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      logger.info('File watcher stopped');
    }

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
  }
}
