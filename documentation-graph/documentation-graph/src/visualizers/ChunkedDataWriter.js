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
 * ChunkedDataWriter
 * Writes visualization data to files (chunked or complete)
 *
 * Supports two writing modes:
 * - Complete mode: Single JSON file with all data
 * - Chunked mode: Multiple smaller files for progressive loading
 *
 * Features:
 * - Automatic directory creation
 * - Pretty-printed JSON output
 * - Old chunk cleanup before writing new chunks
 * - Absolute path resolution for all output files
 *
 * @example
 * const writer = new ChunkedDataWriter('/path/to/output');
 * const paths = await writer.write(visualizationData, true);
 * // Returns: { chunks: [...], metadata: '...' }
 */

import { promises as fs } from 'fs';
import path from 'path';
import { DataExtractor } from './DataExtractor.js';

// File name constants
const FILE_NAMES = {
  COMPLETE_DATA: 'graph-visualization-data.json',
  CHUNK_PREFIX: 'graph-visualization-data-chunk-',
  CHUNK_SUFFIX: '.json',
  METADATA: 'graph-visualization-data-meta.json',
};

// JSON formatting constants
const JSON_FORMATTING = {
  INDENT_SPACES: 2,
  ENCODING: 'utf-8',
};

// Error messages
const ERROR_MESSAGES = {
  MISSING_OUTPUT_DIR: 'Output directory is required',
  MISSING_VISUALIZATION_DATA: 'Visualization data is required',
  INVALID_DATA_STRUCTURE: 'Invalid visualization data structure',
  MISSING_ELEMENTS: 'Visualization data must contain elements',
  MISSING_METADATA: 'Visualization data must contain metadata',
  MISSING_METADATA_PARAM: 'Metadata is required',
  INVALID_METADATA_STRUCTURE: 'Invalid metadata structure',
};

export class ChunkedDataWriter {
  /**
   * Create a new ChunkedDataWriter instance
   *
   * @param {string} outputDir - Directory path for output files (absolute or relative)
   * @throws {Error} If output directory is not provided or empty
   *
   * @example
   * const writer = new ChunkedDataWriter('./dist/visualization');
   */
  constructor(outputDir) {
    this._validateOutputDir(outputDir);
    this.outputDir = outputDir;
  }

  /**
   * Validate output directory parameter
   * @private
   * @param {string} outputDir - Output directory to validate
   * @throws {Error} If output directory is invalid
   */
  _validateOutputDir(outputDir) {
    if (!outputDir || outputDir === '') {
      throw new Error(ERROR_MESSAGES.MISSING_OUTPUT_DIR);
    }
  }

  /**
   * Write visualization data to files
   *
   * Routes to either complete or chunked writing based on configuration.
   * Creates output directory if it doesn't exist.
   *
   * @param {Object} visualizationData - Complete visualization data
   * @param {Object} visualizationData.metadata - Metadata with chunking config
   * @param {Object} visualizationData.elements - Nodes and edges
   * @param {boolean} [enableChunking] - Override chunking setting from metadata
   * @returns {Promise<Object>} Paths object
   * @returns {string} [returns.data] - Path to complete data file (if not chunked)
   * @returns {Array<string>} [returns.chunks] - Paths to chunk files (if chunked)
   * @returns {string} [returns.metadata] - Path to metadata file (if chunked)
   * @throws {Error} If visualization data is invalid or missing
   *
   * @example
   * // Complete mode
   * const paths = await writer.write(data, false);
   * // Returns: { data: '/path/to/graph-visualization-data.json' }
   *
   * @example
   * // Chunked mode
   * const paths = await writer.write(data, true);
   * // Returns: { chunks: [...], metadata: '...' }
   */
  async write(visualizationData, enableChunking) {
    this._validateVisualizationData(visualizationData);

    await this._ensureOutputDirectoryExists();

    const shouldChunk = this._shouldEnableChunking(visualizationData, enableChunking);

    return shouldChunk
      ? await this._writeChunkedMode(visualizationData)
      : await this._writeCompleteMode(visualizationData);
  }

  /**
   * Validate visualization data structure
   * @private
   * @param {Object} visualizationData - Data to validate
   * @throws {Error} If data is invalid
   */
  _validateVisualizationData(visualizationData) {
    if (!visualizationData) {
      throw new Error(ERROR_MESSAGES.MISSING_VISUALIZATION_DATA);
    }
    // Check for empty object or missing both properties
    if (!visualizationData.metadata && !visualizationData.elements) {
      throw new Error(ERROR_MESSAGES.INVALID_DATA_STRUCTURE);
    }
    if (!visualizationData.elements) {
      throw new Error(ERROR_MESSAGES.MISSING_ELEMENTS);
    }
    if (!visualizationData.metadata) {
      throw new Error(ERROR_MESSAGES.MISSING_METADATA);
    }
  }

  /**
   * Ensure output directory exists
   * @private
   * @returns {Promise<void>}
   */
  async _ensureOutputDirectoryExists() {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  /**
   * Determine if chunking should be enabled
   * @private
   * @param {Object} visualizationData - Visualization data with metadata
   * @param {boolean} [enableChunking] - Override parameter
   * @returns {boolean} True if chunking should be used
   */
  _shouldEnableChunking(visualizationData, enableChunking) {
    const shouldChunk =
      enableChunking !== undefined ? enableChunking : visualizationData.metadata.chunking?.enabled;

    return shouldChunk && visualizationData.metadata.chunking?.enabled;
  }

  /**
   * Write in complete mode (single file)
   * @private
   * @param {Object} visualizationData - Complete visualization data
   * @returns {Promise<Object>} Paths object with data property
   */
  async _writeCompleteMode(visualizationData) {
    const dataPath = await this.writeComplete(visualizationData);
    return { data: dataPath };
  }

  /**
   * Write in chunked mode (multiple files)
   * @private
   * @param {Object} visualizationData - Complete visualization data
   * @returns {Promise<Object>} Paths object with chunks and metadata properties
   */
  async _writeChunkedMode(visualizationData) {
    const chunkPaths = await this.writeChunked(visualizationData);
    const metadataPath = await this.writeMetadata(visualizationData.metadata);

    return {
      chunks: chunkPaths,
      metadata: metadataPath,
    };
  }

  /**
   * Write complete data to single JSON file
   *
   * Writes all visualization data to a single file with pretty-printed JSON.
   * Overwrites existing file if present.
   *
   * @param {Object} visualizationData - Complete visualization data
   * @returns {Promise<string>} Absolute path to written file
   *
   * @example
   * const filePath = await writer.writeComplete(visualizationData);
   * // Returns: '/absolute/path/to/graph-visualization-data.json'
   */
  async writeComplete(visualizationData) {
    const filePath = this._buildCompleteDataPath();
    const jsonContent = this._serializeToJSON(visualizationData);

    await this._writeJSONFile(filePath, jsonContent);

    return path.resolve(filePath);
  }

  /**
   * Build path for complete data file
   * @private
   * @returns {string} File path
   */
  _buildCompleteDataPath() {
    return path.join(this.outputDir, FILE_NAMES.COMPLETE_DATA);
  }

  /**
   * Write data in chunks for progressive loading
   *
   * Splits data into multiple chunk files using DataExtractor.
   * Automatically cleans up old chunk files before writing new ones.
   *
   * @param {Object} visualizationData - Complete visualization data
   * @returns {Promise<Array<string>>} Array of absolute paths to chunk files
   *
   * @example
   * const chunkPaths = await writer.writeChunked(visualizationData);
   * // Returns: ['/path/chunk-0.json', '/path/chunk-1.json', ...]
   */
  async writeChunked(visualizationData) {
    const chunks = this._extractChunks(visualizationData);

    await this._cleanupOldChunks();

    return await this._writeAllChunks(chunks);
  }

  /**
   * Extract chunks from visualization data
   * @private
   * @param {Object} visualizationData - Complete visualization data
   * @returns {Array<Object>} Array of chunk objects
   */
  _extractChunks(visualizationData) {
    const chunkSize = visualizationData.metadata.chunking.chunkSize;
    const dataExtractor = new DataExtractor({ chunkSize });
    return dataExtractor.chunkData(visualizationData);
  }

  /**
   * Clean up old chunk files from output directory
   * @private
   * @returns {Promise<void>}
   */
  async _cleanupOldChunks() {
    const files = await this._readOutputDirectory();
    const oldChunks = this._filterChunkFiles(files);

    await this._deleteChunkFiles(oldChunks);
  }

  /**
   * Read output directory file list
   * @private
   * @returns {Promise<Array<string>>} Array of file names
   */
  async _readOutputDirectory() {
    return await fs.readdir(this.outputDir).catch(() => []);
  }

  /**
   * Filter files to find chunk files
   * @private
   * @param {Array<string>} files - Array of file names
   * @returns {Array<string>} Filtered chunk file names
   */
  _filterChunkFiles(files) {
    return files.filter((f) => f.startsWith(FILE_NAMES.CHUNK_PREFIX));
  }

  /**
   * Delete chunk files
   * @private
   * @param {Array<string>} chunkFiles - Array of chunk file names
   * @returns {Promise<void>}
   */
  async _deleteChunkFiles(chunkFiles) {
    for (const chunkFile of chunkFiles) {
      const filePath = path.join(this.outputDir, chunkFile);
      await fs.unlink(filePath).catch(() => {});
    }
  }

  /**
   * Write all chunks to files
   * @private
   * @param {Array<Object>} chunks - Array of chunk objects
   * @returns {Promise<Array<string>>} Array of absolute file paths
   */
  async _writeAllChunks(chunks) {
    const chunkPaths = [];

    for (const chunk of chunks) {
      const chunkPath = await this._writeChunk(chunk);
      chunkPaths.push(chunkPath);
    }

    return chunkPaths;
  }

  /**
   * Write a single chunk to file
   * @private
   * @param {Object} chunk - Chunk object with index and elements
   * @returns {Promise<string>} Absolute path to written file
   */
  async _writeChunk(chunk) {
    const fileName = this._buildChunkFileName(chunk.index);
    const filePath = path.join(this.outputDir, fileName);
    const jsonContent = this._serializeToJSON(chunk);

    await this._writeJSONFile(filePath, jsonContent);

    return path.resolve(filePath);
  }

  /**
   * Build chunk file name from index
   * @private
   * @param {number} index - Zero-based chunk index
   * @returns {string} Chunk file name
   */
  _buildChunkFileName(index) {
    return `${FILE_NAMES.CHUNK_PREFIX}${index}${FILE_NAMES.CHUNK_SUFFIX}`;
  }

  /**
   * Write metadata file describing chunk structure
   *
   * Writes metadata to separate JSON file for use by progressive loading logic.
   *
   * @param {Object} metadata - Metadata object
   * @param {string} metadata.version - Schema version
   * @param {string} metadata.generated - Generation timestamp
   * @returns {Promise<string>} Absolute path to metadata file
   * @throws {Error} If metadata is invalid
   *
   * @example
   * const metaPath = await writer.writeMetadata(metadata);
   * // Returns: '/path/to/graph-visualization-data-meta.json'
   */
  async writeMetadata(metadata) {
    this._validateMetadata(metadata);

    const filePath = this._buildMetadataPath();
    const jsonContent = this._serializeToJSON(metadata);

    await this._writeJSONFile(filePath, jsonContent);

    return path.resolve(filePath);
  }

  /**
   * Validate metadata structure
   * @private
   * @param {Object} metadata - Metadata to validate
   * @throws {Error} If metadata is invalid
   */
  _validateMetadata(metadata) {
    if (!metadata) {
      throw new Error(ERROR_MESSAGES.MISSING_METADATA_PARAM);
    }
    if (!metadata.version || !metadata.generated) {
      throw new Error(ERROR_MESSAGES.INVALID_METADATA_STRUCTURE);
    }
  }

  /**
   * Build path for metadata file
   * @private
   * @returns {string} File path
   */
  _buildMetadataPath() {
    return path.join(this.outputDir, FILE_NAMES.METADATA);
  }

  /**
   * Serialize object to pretty-printed JSON string
   * @private
   * @param {Object} data - Data to serialize
   * @returns {string} JSON string
   */
  _serializeToJSON(data) {
    return JSON.stringify(data, null, JSON_FORMATTING.INDENT_SPACES);
  }

  /**
   * Write JSON content to file
   * @private
   * @param {string} filePath - File path to write
   * @param {string} jsonContent - JSON string content
   * @returns {Promise<void>}
   */
  async _writeJSONFile(filePath, jsonContent) {
    await fs.writeFile(filePath, jsonContent, JSON_FORMATTING.ENCODING);
  }
}
