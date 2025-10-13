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
 * TableFormatter - Formats markdown tables with support for alignment and styling.
 *
 * This class provides methods for creating well-formatted markdown tables from structured data.
 * All output follows standard markdown table syntax with proper spacing and alignment.
 *
 * @example
 * const formatter = new TableFormatter();
 * const table = formatter.format(['Name', 'Age'], [['Alice', 30], ['Bob', 25]]);
 */
export default class TableFormatter {
  // Markdown table formatting constants
  static COLUMN_DELIMITER = ' | ';
  static ROW_START = '| ';
  static ROW_END = ' |';
  static ALIGNMENT_LEFT = '---';
  static ALIGNMENT_CENTER = ':---:';
  static ALIGNMENT_RIGHT = '---:';
  static LINE_ENDING = '\n';

  // Alignment type constants
  static ALIGN_LEFT = 'left';
  static ALIGN_CENTER = 'center';
  static ALIGN_RIGHT = 'right';

  /**
   * Format a markdown table from headers and rows.
   *
   * Creates a properly formatted markdown table with optional column alignment.
   * Empty or null values are converted to empty strings. All values are stringified.
   * Returns an empty string if headers are not provided or empty.
   *
   * @param {string[]} headers - Table column headers (required, must be non-empty)
   * @param {Array<Array>} rows - Array of row data arrays (default: [])
   * @param {string[]} alignment - Column alignment values: 'left', 'center', 'right' (default: [])
   * @returns {string} Formatted markdown table with trailing newline, or empty string if no headers
   *
   * @example
   * const table = formatter.format(
   *   ['Name', 'Score', 'Status'],
   *   [['Alice', 95, 'Pass'], ['Bob', 87, 'Pass']],
   *   ['left', 'right', 'center']
   * );
   */
  format(headers, rows, alignment = []) {
    if (!headers || headers.length === 0) {
      return '';
    }

    const lines = [];

    // Build header row
    const headerRow = this.buildRow(headers);
    lines.push(headerRow);

    // Build separator row with alignment markers
    const separatorRow = this.buildSeparatorRow(headers, alignment);
    lines.push(separatorRow);

    // Build data rows
    for (const row of rows) {
      const cells = this.normalizeCells(row);
      const dataRow = this.buildRow(cells);
      lines.push(dataRow);
    }

    return this.joinLines(lines);
  }

  /**
   * Build a single table row from cell values.
   *
   * @private
   * @param {Array} cells - Array of cell values
   * @returns {string} Formatted table row
   */
  buildRow(cells) {
    const normalizedCells = cells.map((cell) => String(cell ?? ''));
    return (
      TableFormatter.ROW_START +
      normalizedCells.join(TableFormatter.COLUMN_DELIMITER) +
      TableFormatter.ROW_END
    );
  }

  /**
   * Build the separator row with alignment markers.
   *
   * @private
   * @param {string[]} headers - Table headers (used for column count)
   * @param {string[]} alignment - Alignment specifications per column
   * @returns {string} Formatted separator row
   */
  buildSeparatorRow(headers, alignment) {
    const separators = headers.map((_, index) => {
      return this.getAlignmentMarker(alignment[index]);
    });
    return (
      TableFormatter.ROW_START +
      separators.join(TableFormatter.COLUMN_DELIMITER) +
      TableFormatter.ROW_END
    );
  }

  /**
   * Get the alignment marker for a column.
   *
   * @private
   * @param {string} align - Alignment specification ('left', 'center', 'right')
   * @returns {string} Markdown alignment marker
   */
  getAlignmentMarker(align) {
    switch (align) {
      case TableFormatter.ALIGN_CENTER:
        return TableFormatter.ALIGNMENT_CENTER;
      case TableFormatter.ALIGN_RIGHT:
        return TableFormatter.ALIGNMENT_RIGHT;
      default:
        return TableFormatter.ALIGNMENT_LEFT;
    }
  }

  /**
   * Normalize cell values to strings, handling null and undefined.
   *
   * @private
   * @param {Array} row - Row of cell values
   * @returns {string[]} Normalized cell strings
   */
  normalizeCells(row) {
    return row.map((cell) => {
      if (cell === null || cell === undefined) {
        return '';
      }
      return String(cell);
    });
  }

  /**
   * Join lines with newlines and add trailing newline.
   *
   * @private
   * @param {string[]} lines - Array of table lines
   * @returns {string} Joined string with trailing newline
   */
  joinLines(lines) {
    return lines.join(TableFormatter.LINE_ENDING) + TableFormatter.LINE_ENDING;
  }

  /**
   * Format an object as a two-column key-value markdown table.
   *
   * Converts an object into a table with 'Property' and 'Value' columns.
   * Object values are JSON-stringified, null/undefined become empty strings,
   * and all other values are converted to strings.
   *
   * @param {Object} data - Object to format as table (required)
   * @returns {string} Formatted markdown table with Property and Value columns
   *
   * @example
   * const data = { name: 'Alice', age: 30, active: true };
   * const table = formatter.formatKeyValue(data);
   * // Creates table with Property | Value columns
   */
  formatKeyValue(data) {
    // Validate input
    if (!data || typeof data !== 'object') {
      return '';
    }

    const headers = [this.getPropertyHeader(), this.getValueHeader()];
    const rows = this.buildKeyValueRows(data);

    return this.format(headers, rows);
  }

  /**
   * Get the property header label.
   *
   * @private
   * @returns {string} Property column header
   */
  getPropertyHeader() {
    return 'Property';
  }

  /**
   * Get the value header label.
   *
   * @private
   * @returns {string} Value column header
   */
  getValueHeader() {
    return 'Value';
  }

  /**
   * Build rows for key-value table from object entries.
   *
   * @private
   * @param {Object} data - Object to convert to rows
   * @returns {Array<Array>} Array of [key, value] pairs
   */
  buildKeyValueRows(data) {
    const rows = [];

    for (const [key, value] of Object.entries(data)) {
      const formattedValue = this.formatValue(value);
      rows.push([key, formattedValue]);
    }

    return rows;
  }

  /**
   * Format a value for table display.
   *
   * Objects are JSON-stringified, null/undefined become empty strings,
   * all other values are converted to strings.
   *
   * @private
   * @param {*} value - Value to format
   * @returns {string} Formatted value string
   */
  formatValue(value) {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }
}
