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

import chalk from 'chalk';
import ProgressBar from 'progress';

class Logger {
  constructor() {
    this.verbose = false;
    this.startTime = Date.now();
  }

  setVerbose(verbose) {
    this.verbose = verbose;
  }

  info(message, ...args) {
    console.log(chalk.blue('ℹ'), message, ...args);
  }

  success(message, ...args) {
    console.log(chalk.green('✓'), message, ...args);
  }

  warn(message, ...args) {
    console.log(chalk.yellow('⚠'), message, ...args);
  }

  error(message, ...args) {
    console.log(chalk.red('✗'), message, ...args);
  }

  debug(message, ...args) {
    if (this.verbose) {
      console.log(chalk.gray('🔍'), message, ...args);
    }
  }

  section(title) {
    console.log('\n' + chalk.cyan.bold(`═══ ${title} ═══`));
  }

  subsection(title) {
    console.log('\n' + chalk.blue(`─── ${title} ───`));
  }

  stat(label, value) {
    console.log(`  ${chalk.gray(label + ':')} ${chalk.white(value)}`);
  }

  createProgressBar(label, total, options = {}) {
    const format = `${chalk.cyan(label)} [:bar] :percent :current/:total (:etas remaining)`;
    return new ProgressBar(format, {
      complete: '█',
      incomplete: '░',
      width: 30,
      total,
      ...options
    });
  }

  elapsed() {
    const elapsed = Date.now() - this.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  summary(stats) {
    this.section('Summary');
    Object.entries(stats).forEach(([key, value]) => {
      this.stat(key, value);
    });
    this.stat('Total time', this.elapsed());
    this.logMemoryUsage();
  }

  logMemoryUsage() {
    const used = process.memoryUsage();
    const formatBytes = (bytes) => {
      const mb = bytes / 1024 / 1024;
      return `${mb.toFixed(2)} MB`;
    };
    
    console.log(chalk.gray('\nMemory Usage:'));
    this.stat('RSS', formatBytes(used.rss));
    this.stat('Heap Total', formatBytes(used.heapTotal));
    this.stat('Heap Used', formatBytes(used.heapUsed));
    this.stat('External', formatBytes(used.external));
  }
}

export default new Logger();