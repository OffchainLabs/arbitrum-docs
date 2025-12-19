/**
 * Extracts link metadata from Mermaid node definitions
 * Syntax: A[Label]:::link:/diagrams/target.mmd
 */

export interface ParsedNodeLink {
  nodeId: string;
  link: string | null;
}

/**
 * Parse link metadata from Mermaid code
 * Returns a map of node IDs to their target diagram links
 */
export function parseLinkMetadata(mermaidCode: string): Map<string, string> {
  const linkMap = new Map<string, string>();

  // Pattern to match: NodeID[Label]:::link:/path/to/diagram.mmd
  const linkPattern = /([A-Za-z0-9_]+)[\[\(\{][^\]\)\}]*[\]\)\}]:::link:([^\s]+)/g;

  let match;
  while ((match = linkPattern.exec(mermaidCode)) !== null) {
    const [, nodeId, link] = match;
    linkMap.set(nodeId, link.trim());
  }

  return linkMap;
}

/**
 * Check if a node has a link
 */
export function hasLink(nodeId: string, linkMap: Map<string, string>): boolean {
  return linkMap.has(nodeId);
}

/**
 * Get link for a node
 */
export function getLink(nodeId: string, linkMap: Map<string, string>): string | null {
  return linkMap.get(nodeId) || null;
}

/**
 * Remove link syntax from label to clean it up
 */
export function cleanLinkSyntax(label: string): string {
  return label.replace(/:::link:[^\s]+/g, '').trim();
}
