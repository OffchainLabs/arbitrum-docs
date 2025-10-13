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
 * MermaidFormatter - Formats Mermaid diagrams for markdown documentation.
 *
 * This class generates Mermaid diagram syntax for various diagram types including
 * pie charts, flowcharts, and graphs. All output is valid Mermaid.js syntax.
 *
 * @example
 * const formatter = new MermaidFormatter();
 * const pie = formatter.format('pie', [{label: 'A', value: 30}, {label: 'B', value: 70}]);
 */
export default class MermaidFormatter {
  // Supported diagram types
  static DIAGRAM_TYPE_PIE = 'pie';
  static DIAGRAM_TYPE_FLOWCHART = 'flowchart';
  static DIAGRAM_TYPE_GRAPH = 'graph';

  // Diagram prefixes and syntax
  static PIE_PREFIX = 'pie title Concept Distribution';
  static FLOWCHART_PREFIX = 'flowchart TD';
  static GRAPH_PREFIX = 'graph LR';
  static INDENTATION = '    ';

  // Error messages
  static ERROR_TYPE_REQUIRED = 'Diagram type is required';
  static ERROR_TYPE_UNSUPPORTED = 'Unsupported diagram type';
  static ERROR_DATA_REQUIRED = 'Diagram data is required';

  /**
   * Format a diagram based on type.
   *
   * Dispatches to the appropriate formatter method based on diagram type.
   * Throws an error if the type is not supported.
   *
   * @param {string} type - Diagram type: 'pie', 'flowchart', or 'graph'
   * @param {*} data - Diagram-specific data structure
   * @returns {string} Formatted Mermaid diagram syntax
   * @throws {Error} If type is missing or unsupported
   *
   * @example
   * const diagram = formatter.format('pie', [{label: 'Item A', value: 60}]);
   */
  format(type, data) {
    this.validateDiagramType(type);

    switch (type) {
      case MermaidFormatter.DIAGRAM_TYPE_PIE:
        return this.formatPieChart(data);
      case MermaidFormatter.DIAGRAM_TYPE_FLOWCHART:
        return this.formatFlowchart(data);
      case MermaidFormatter.DIAGRAM_TYPE_GRAPH:
        return this.formatGraph(data);
      default:
        throw new Error(`${MermaidFormatter.ERROR_TYPE_UNSUPPORTED}: ${type}`);
    }
  }

  /**
   * Validate that diagram type is provided.
   *
   * @private
   * @param {string} type - Diagram type to validate
   * @throws {Error} If type is missing or empty
   */
  validateDiagramType(type) {
    if (!type) {
      throw new Error(MermaidFormatter.ERROR_TYPE_REQUIRED);
    }
  }

  /**
   * Validate that diagram data is provided.
   *
   * @private
   * @param {*} data - Diagram data to validate
   * @param {string} diagramType - Type of diagram for error message
   * @throws {Error} If data is missing
   */
  validateDiagramData(data, diagramType) {
    if (!data) {
      throw new Error(`${diagramType} data is required`);
    }
  }

  /**
   * Format a pie chart diagram.
   *
   * Creates a Mermaid pie chart with title "Concept Distribution".
   * Only includes items with both label and value defined.
   *
   * @param {Array<{label: string, value: number}>} data - Array of pie chart segments
   * @returns {string} Formatted Mermaid pie chart syntax
   * @throws {Error} If data is not provided
   *
   * @example
   * const pie = formatter.formatPieChart([
   *   {label: 'Transactions', value: 45},
   *   {label: 'Contracts', value: 30}
   * ]);
   */
  formatPieChart(data) {
    this.validateDiagramData(data, 'Pie chart');

    const lines = [MermaidFormatter.PIE_PREFIX];

    for (const item of data) {
      if (this.isValidPieChartItem(item)) {
        const line = this.formatPieChartItem(item);
        lines.push(line);
      }
    }

    return this.joinLines(lines);
  }

  /**
   * Check if pie chart item is valid.
   *
   * @private
   * @param {Object} item - Pie chart item to validate
   * @returns {boolean} True if item has label and value
   */
  isValidPieChartItem(item) {
    return item.label && item.value !== undefined;
  }

  /**
   * Format a single pie chart item.
   *
   * @private
   * @param {Object} item - Pie chart item with label and value
   * @returns {string} Formatted pie chart line
   */
  formatPieChartItem(item) {
    return `${MermaidFormatter.INDENTATION}"${item.label}" : ${item.value}`;
  }

  /**
   * Format a flowchart diagram.
   *
   * Creates a top-down flowchart with nodes and edges.
   * Only includes nodes with id and label, edges with source and target.
   *
   * @param {{nodes: Array, edges: Array}} data - Flowchart structure with nodes and edges
   * @returns {string} Formatted Mermaid flowchart syntax
   * @throws {Error} If data is not provided
   *
   * @example
   * const flowchart = formatter.formatFlowchart({
   *   nodes: [{id: 'A', label: 'Start'}, {id: 'B', label: 'End'}],
   *   edges: [{source: 'A', target: 'B'}]
   * });
   */
  formatFlowchart(data) {
    this.validateDiagramData(data, 'Flowchart');

    const lines = [MermaidFormatter.FLOWCHART_PREFIX];
    const nodes = data.nodes || [];
    const edges = data.edges || [];

    // Add node definitions
    for (const node of nodes) {
      if (this.isValidFlowchartNode(node)) {
        const line = this.formatFlowchartNode(node);
        lines.push(line);
      }
    }

    // Add edge connections
    for (const edge of edges) {
      if (this.isValidFlowchartEdge(edge)) {
        const line = this.formatFlowchartEdge(edge);
        lines.push(line);
      }
    }

    return this.joinLines(lines);
  }

  /**
   * Check if flowchart node is valid.
   *
   * @private
   * @param {Object} node - Flowchart node to validate
   * @returns {boolean} True if node has id and label
   */
  isValidFlowchartNode(node) {
    return node.id && node.label;
  }

  /**
   * Check if flowchart edge is valid.
   *
   * @private
   * @param {Object} edge - Flowchart edge to validate
   * @returns {boolean} True if edge has source and target
   */
  isValidFlowchartEdge(edge) {
    return edge.source && edge.target;
  }

  /**
   * Format a flowchart node definition.
   *
   * @private
   * @param {Object} node - Node with id and label
   * @returns {string} Formatted node line
   */
  formatFlowchartNode(node) {
    return `${MermaidFormatter.INDENTATION}${node.id}[${node.label}]`;
  }

  /**
   * Format a flowchart edge connection.
   *
   * @private
   * @param {Object} edge - Edge with source and target
   * @returns {string} Formatted edge line
   */
  formatFlowchartEdge(edge) {
    return `${MermaidFormatter.INDENTATION}${edge.source} --> ${edge.target}`;
  }

  /**
   * Format a graph diagram.
   *
   * Creates a left-right graph showing relationships between nodes.
   * Only includes edges with source, target, and both labels defined.
   *
   * @param {Array} data - Array of graph edges with node information
   * @returns {string} Formatted Mermaid graph syntax
   * @throws {Error} If data is not provided
   *
   * @example
   * const graph = formatter.formatGraph([
   *   {source: 'A', target: 'B', sourceLabel: 'Start', targetLabel: 'End'}
   * ]);
   */
  formatGraph(data) {
    this.validateDiagramData(data, 'Graph');

    const lines = [MermaidFormatter.GRAPH_PREFIX];

    for (const edge of data) {
      if (this.isValidGraphEdge(edge)) {
        const line = this.formatGraphEdge(edge);
        lines.push(line);
      }
    }

    return this.joinLines(lines);
  }

  /**
   * Check if graph edge is valid.
   *
   * @private
   * @param {Object} edge - Graph edge to validate
   * @returns {boolean} True if edge has all required properties
   */
  isValidGraphEdge(edge) {
    return edge.source && edge.target && edge.sourceLabel && edge.targetLabel;
  }

  /**
   * Format a graph edge with inline node labels.
   *
   * @private
   * @param {Object} edge - Edge with source, target, and labels
   * @returns {string} Formatted graph edge line
   */
  formatGraphEdge(edge) {
    return `${MermaidFormatter.INDENTATION}${edge.source}[${edge.sourceLabel}] --> ${edge.target}[${edge.targetLabel}]`;
  }

  /**
   * Join lines with newline separators.
   *
   * @private
   * @param {string[]} lines - Array of diagram lines
   * @returns {string} Joined string
   */
  joinLines(lines) {
    return lines.join('\n');
  }
}
