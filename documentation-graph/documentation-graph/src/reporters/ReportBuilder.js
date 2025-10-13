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
 * ReportBuilder - Fluent API for building markdown reports.
 *
 * This class provides a chainable interface for constructing markdown documents
 * with headings, paragraphs, lists, tables, code blocks, and Mermaid diagrams.
 * All methods return `this` to enable method chaining.
 *
 * @example
 * const builder = new ReportBuilder();
 * const markdown = builder
 *   .addTitle('My Report')
 *   .addParagraph('Introduction text')
 *   .addTable(['Name', 'Age'], [['Alice', 30]])
 *   .build();
 */
import TableFormatter from './formatters/TableFormatter.js';
import MermaidFormatter from './formatters/MermaidFormatter.js';

export default class ReportBuilder {
  // Markdown syntax constants
  static HEADING_PREFIX = '#';
  static LIST_ITEM_UNORDERED = '-';
  static HORIZONTAL_RULE = '---';
  static CODE_FENCE = '```';
  static COMMENT_START = '<!--';
  static COMMENT_END = '-->';
  static BLOCKQUOTE_PREFIX = '>';

  // Heading levels
  static LEVEL_TITLE = 1;
  static LEVEL_HEADING = 2;
  static LEVEL_SUBHEADING = 3;

  // Message prefixes
  static WARNING_PREFIX = '**Warning**:';
  static NOTE_PREFIX = '**Note**:';

  // Formatting
  static NEWLINE = '\n';
  static EMPTY_LINE = '';

  /**
   * Create a new ReportBuilder instance.
   *
   * Initializes an empty content array and formatter instances.
   */
  constructor() {
    this.content = [];
    this.tableFormatter = new TableFormatter();
    this.mermaidFormatter = new MermaidFormatter();
  }

  /**
   * Add a title (level 1 heading by default).
   *
   * @param {string} text - Title text
   * @param {number} level - Heading level (default: 1)
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addTitle('Report Title');
   */
  addTitle(text, level = ReportBuilder.LEVEL_TITLE) {
    return this.addHeadingAtLevel(text, level);
  }

  /**
   * Add a heading (level 2 by default).
   *
   * @param {string} text - Heading text
   * @param {number} level - Heading level (default: 2)
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addHeading('Section Heading');
   */
  addHeading(text, level = ReportBuilder.LEVEL_HEADING) {
    return this.addHeadingAtLevel(text, level);
  }

  /**
   * Add a subheading (level 3 by default).
   *
   * @param {string} text - Subheading text
   * @param {number} level - Heading level (default: 3)
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addSubheading('Subsection Title');
   */
  addSubheading(text, level = ReportBuilder.LEVEL_SUBHEADING) {
    return this.addHeadingAtLevel(text, level);
  }

  /**
   * Add a heading at a specific level.
   *
   * @private
   * @param {string} text - Heading text
   * @param {number} level - Heading level (1-6)
   * @returns {ReportBuilder} This instance for chaining
   */
  addHeadingAtLevel(text, level) {
    const hashes = ReportBuilder.HEADING_PREFIX.repeat(level);
    this.content.push(`${hashes} ${text}${ReportBuilder.NEWLINE}`);
    return this;
  }

  /**
   * Add a paragraph of text.
   *
   * @param {string} text - Paragraph content
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addParagraph('This is a paragraph.');
   */
  addParagraph(text) {
    this.content.push(`${text}${ReportBuilder.NEWLINE}`);
    return this;
  }

  /**
   * Add a bulleted or numbered list.
   *
   * @param {string[]} items - List items
   * @param {boolean} ordered - If true, creates numbered list (default: false)
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addList(['Item 1', 'Item 2'], false);
   * builder.addList(['Step 1', 'Step 2'], true);
   */
  addList(items, ordered = false) {
    if (items.length === 0) {
      return this;
    }

    for (let i = 0; i < items.length; i++) {
      const listItem = ordered
        ? this.formatOrderedListItem(i, items[i])
        : this.formatUnorderedListItem(items[i]);
      this.content.push(listItem);
    }
    this.content.push(ReportBuilder.EMPTY_LINE);
    return this;
  }

  /**
   * Format an ordered list item.
   *
   * @private
   * @param {number} index - Item index (0-based)
   * @param {string} text - Item text
   * @returns {string} Formatted list item
   */
  formatOrderedListItem(index, text) {
    return `${index + 1}. ${text}`;
  }

  /**
   * Format an unordered list item.
   *
   * @private
   * @param {string} text - Item text
   * @returns {string} Formatted list item
   */
  formatUnorderedListItem(text) {
    return `${ReportBuilder.LIST_ITEM_UNORDERED} ${text}`;
  }

  /**
   * Add a markdown table.
   *
   * @param {string[]} headers - Column headers
   * @param {Array<Array>} rows - Table rows
   * @param {string[]} alignment - Column alignments (optional)
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addTable(['Name', 'Age'], [['Alice', 30], ['Bob', 25]]);
   */
  addTable(headers, rows, alignment) {
    const table = this.tableFormatter.format(headers, rows, alignment);
    this.content.push(table);
    return this;
  }

  /**
   * Add a fenced code block.
   *
   * @param {string} code - Code content
   * @param {string} language - Language identifier (default: empty)
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addCodeBlock('const x = 5;', 'javascript');
   */
  addCodeBlock(code, language = '') {
    this.content.push(`${ReportBuilder.CODE_FENCE}${language}`);
    this.content.push(code);
    this.content.push(`${ReportBuilder.CODE_FENCE}${ReportBuilder.NEWLINE}`);
    return this;
  }

  /**
   * Add a Mermaid diagram.
   *
   * @param {string} type - Diagram type ('pie', 'flowchart', 'graph')
   * @param {*} data - Diagram data structure
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addMermaidDiagram('pie', [{label: 'A', value: 30}]);
   */
  addMermaidDiagram(type, data) {
    const diagram = this.mermaidFormatter.format(type, data);
    this.content.push(`${ReportBuilder.CODE_FENCE}mermaid`);
    this.content.push(diagram);
    this.content.push(`${ReportBuilder.CODE_FENCE}${ReportBuilder.NEWLINE}`);
    return this;
  }

  /**
   * Add metadata as HTML comments.
   *
   * Embeds key-value pairs in HTML comment block for metadata tracking.
   *
   * @param {Object} data - Metadata key-value pairs
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addMetadata({generated: '2025-01-15', version: '1.0'});
   */
  addMetadata(data) {
    this.content.push(`${ReportBuilder.COMMENT_START} Report Metadata`);
    for (const [key, value] of Object.entries(data)) {
      this.content.push(`${key}: ${value}`);
    }
    this.content.push(`${ReportBuilder.COMMENT_END}${ReportBuilder.NEWLINE}`);
    return this;
  }

  /**
   * Add a table of contents with links to sections.
   *
   * Creates a numbered list with anchor links to each section.
   *
   * @param {string[]} sections - Section titles
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addTableOfContents(['Introduction', 'Methods', 'Results']);
   */
  addTableOfContents(sections) {
    this.addHeading('Table of Contents', 2);

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const anchor = this.createAnchorLink(section);
      this.content.push(`${i + 1}. [${section}](#${anchor})`);
    }
    this.content.push(ReportBuilder.EMPTY_LINE);
    return this;
  }

  /**
   * Create an anchor link from section title.
   *
   * @private
   * @param {string} title - Section title
   * @returns {string} URL-safe anchor string
   */
  createAnchorLink(title) {
    return title.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Add a horizontal rule divider.
   *
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addHorizontalRule();
   */
  addHorizontalRule() {
    this.content.push(`${ReportBuilder.HORIZONTAL_RULE}${ReportBuilder.NEWLINE}`);
    return this;
  }

  /**
   * Add a warning message as blockquote.
   *
   * @param {string} text - Warning message
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addWarning('This feature is deprecated.');
   */
  addWarning(text) {
    const message = `${ReportBuilder.BLOCKQUOTE_PREFIX} ${ReportBuilder.WARNING_PREFIX} ${text}${ReportBuilder.NEWLINE}`;
    this.content.push(message);
    return this;
  }

  /**
   * Add an info message as blockquote.
   *
   * @param {string} text - Info message
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addInfo('Remember to save your work.');
   */
  addInfo(text) {
    const message = `${ReportBuilder.BLOCKQUOTE_PREFIX} ${ReportBuilder.NOTE_PREFIX} ${text}${ReportBuilder.NEWLINE}`;
    this.content.push(message);
    return this;
  }

  /**
   * Add custom content directly.
   *
   * @param {string} content - Raw markdown content
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.addSection('Custom **markdown** content');
   */
  addSection(content) {
    this.content.push(content);
    return this;
  }

  /**
   * Reset the builder to empty state.
   *
   * Clears all accumulated content, allowing reuse of the builder instance.
   *
   * @returns {ReportBuilder} This instance for chaining
   *
   * @example
   * builder.reset().addTitle('New Report');
   */
  reset() {
    this.content = [];
    return this;
  }

  /**
   * Build and return the final markdown document.
   *
   * Joins all content with newlines to produce the complete markdown string.
   *
   * @returns {string} Complete markdown document
   *
   * @example
   * const markdown = builder.build();
   */
  build() {
    return this.content.join(ReportBuilder.NEWLINE);
  }
}
