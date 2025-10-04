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
