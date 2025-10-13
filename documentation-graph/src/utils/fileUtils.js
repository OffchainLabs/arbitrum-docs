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

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import logger from './logger.js';

export class FileUtils {
  static async findDocumentationFiles(baseDir, patterns, excludePatterns = []) {
    logger.debug(`Searching for files in: ${baseDir}`);
    logger.debug(`Patterns: ${patterns.join(', ')}`);
    logger.debug(`Exclude patterns: ${excludePatterns.join(', ')}`);

    const allFiles = [];
    
    for (const pattern of patterns) {
      const files = await glob(pattern, {
        cwd: baseDir,
        absolute: true,
        ignore: excludePatterns
      });
      allFiles.push(...files);
    }

    // Remove duplicates and sort
    const uniqueFiles = [...new Set(allFiles)].sort();
    
    logger.debug(`Found ${uniqueFiles.length} documentation files`);
    return uniqueFiles;
  }

  static async readFile(filePath) {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      logger.error(`Failed to read file: ${filePath}`, error.message);
      return null;
    }
  }

  static async writeFile(filePath, content) {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf-8');
      return true;
    } catch (error) {
      logger.error(`Failed to write file: ${filePath}`, error.message);
      return false;
    }
  }

  static async writeJSON(filePath, data, pretty = true) {
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    return this.writeFile(filePath, content);
  }

  static async readJSON(filePath) {
    try {
      const content = await this.readFile(filePath);
      return content ? JSON.parse(content) : null;
    } catch (error) {
      logger.error(`Failed to parse JSON file: ${filePath}`, error.message);
      return null;
    }
  }

  static getRelativePath(filePath, baseDir) {
    return path.relative(baseDir, filePath);
  }

  static getFileExtension(filePath) {
    return path.extname(filePath).toLowerCase();
  }

  static getFileName(filePath) {
    return path.basename(filePath, path.extname(filePath));
  }

  static getDirectoryName(filePath) {
    return path.dirname(filePath);
  }

  static async ensureDirectory(dirPath) {
    return fs.ensureDir(dirPath);
  }

  static async exists(filePath) {
    return fs.pathExists(filePath);
  }

  static existsSync(filePath) {
    return fs.pathExistsSync(filePath);
  }

  static async getFileStats(filePath) {
    try {
      return await fs.stat(filePath);
    } catch (error) {
      logger.debug(`Failed to get stats for: ${filePath}`);
      return null;
    }
  }
}

export default FileUtils;