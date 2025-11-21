import { Node, Edge, MarkerType, Position } from 'reactflow';
import dagre from 'dagre';
import { ReactFlowData, MermaidNode, MermaidEdge, SubgraphInfo } from '../types';
import { parseLinkMetadata } from './linkParser';

function cleanLabel(label: string): string {
  // Remove HTML tags and clean up
  return label
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/:::link:[^\s]+/g, '') // Remove link syntax from label
    .trim();
}

function getNodeShape(nodeDefinition: string): string {
  if (nodeDefinition.includes('{') && nodeDefinition.includes('}')) return 'diamond';
  if (nodeDefinition.includes('((') && nodeDefinition.includes('))')) return 'circle';
  if (nodeDefinition.includes('([') && nodeDefinition.includes('])')) return 'stadium';
  if (nodeDefinition.includes('[') && nodeDefinition.includes(']')) return 'rect';
  if (nodeDefinition.includes('(') && nodeDefinition.includes(')')) return 'round';
  return 'rect';
}

function parseMermaidCode(
  code: string,
  linkMap: Map<string, string>,
): { nodes: MermaidNode[]; edges: MermaidEdge[]; subgraphs: SubgraphInfo[] } {
  const nodes: MermaidNode[] = [];
  const edges: MermaidEdge[] = [];
  const subgraphs: SubgraphInfo[] = [];
  const nodeMap = new Map<string, MermaidNode>();

  // Clean code
  const cleanCode = code
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('%%'))
    .join('\n');

  const lines = cleanCode.split('\n');
  let currentSubgraph: string | null = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle subgraph start
    const subgraphMatch = line.match(/^subgraph\s+([^\s]+)(?:\s*\[(.+)\])?/);
    if (subgraphMatch) {
      const [, subgraphId, subgraphTitle] = subgraphMatch;
      currentSubgraph = subgraphId;
      subgraphs.push({
        id: subgraphId,
        title: subgraphTitle || subgraphId,
        nodes: [],
      });
      continue;
    }

    // Handle subgraph end
    if (line === 'end') {
      currentSubgraph = null;
      continue;
    }

    // Parse edge connections
    const edgePatterns = [
      /([A-Za-z0-9_]+)(?:[\[\(\{][^\]\)\}]*[\]\)\}])?(?::::[^\s]+)?\s*(-->|->|---|===>|==>|-\.-)\s*(?:\|([^|]+)\|)?\s*([A-Za-z0-9_]+)(?:[\[\(\{][^\]\)\}]*[\]\)\}])?(?::::[^\s]+)?/,
      /([A-Za-z0-9_]+)\s*(-->|->|---|===>|==>|-\.-)\s*([A-Za-z0-9_]+)/,
    ];

    let edgeMatch = null;
    for (const pattern of edgePatterns) {
      edgeMatch = line.match(pattern);
      if (edgeMatch) break;
    }

    if (edgeMatch) {
      const sourceId = edgeMatch[1];
      const edgeType = edgeMatch[2];
      const edgeLabel = edgeMatch[3] || '';
      const targetId = edgeMatch[4] || edgeMatch[3];

      // Parse source node
      const sourceNodeMatch = line.match(
        new RegExp(`${sourceId}([\\[\\(\\{][^\\]\\)\\}]*[\\]\\)\\}])`),
      );
      if (sourceNodeMatch && !nodeMap.has(sourceId)) {
        const fullDef = sourceNodeMatch[0];
        const shape = getNodeShape(fullDef);
        const labelMatch = fullDef.match(/[\[\(\{]([^\]\)\}]*)[\]\)\}]/);
        const label = labelMatch ? cleanLabel(labelMatch[1]) : sourceId;
        const link = linkMap.get(sourceId) || undefined;

        const node: MermaidNode = {
          id: sourceId,
          label,
          shape,
          subgraph: currentSubgraph || undefined,
          link,
        };
        nodes.push(node);
        nodeMap.set(sourceId, node);

        if (currentSubgraph) {
          const subgraph = subgraphs.find((sg) => sg.id === currentSubgraph);
          if (subgraph) subgraph.nodes.push(sourceId);
        }
      } else if (!nodeMap.has(sourceId)) {
        const link = linkMap.get(sourceId) || undefined;
        const node: MermaidNode = {
          id: sourceId,
          label: sourceId,
          shape: 'rect',
          subgraph: currentSubgraph || undefined,
          link,
        };
        nodes.push(node);
        nodeMap.set(sourceId, node);

        if (currentSubgraph) {
          const subgraph = subgraphs.find((sg) => sg.id === currentSubgraph);
          if (subgraph) subgraph.nodes.push(sourceId);
        }
      }

      // Parse target node
      const targetNodeMatch = line.match(
        new RegExp(`${targetId}([\\[\\(\\{][^\\]\\)\\}]*[\\]\\)\\}])`),
      );
      if (targetNodeMatch && !nodeMap.has(targetId)) {
        const fullDef = targetNodeMatch[0];
        const shape = getNodeShape(fullDef);
        const labelMatch = fullDef.match(/[\[\(\{]([^\]\)\}]*)[\]\)\}]/);
        const label = labelMatch ? cleanLabel(labelMatch[1]) : targetId;
        const link = linkMap.get(targetId) || undefined;

        const node: MermaidNode = {
          id: targetId,
          label,
          shape,
          subgraph: currentSubgraph || undefined,
          link,
        };
        nodes.push(node);
        nodeMap.set(targetId, node);

        if (currentSubgraph) {
          const subgraph = subgraphs.find((sg) => sg.id === currentSubgraph);
          if (subgraph) subgraph.nodes.push(targetId);
        }
      } else if (!nodeMap.has(targetId)) {
        const link = linkMap.get(targetId) || undefined;
        const node: MermaidNode = {
          id: targetId,
          label: targetId,
          shape: 'rect',
          subgraph: currentSubgraph || undefined,
          link,
        };
        nodes.push(node);
        nodeMap.set(targetId, node);

        if (currentSubgraph) {
          const subgraph = subgraphs.find((sg) => sg.id === currentSubgraph);
          if (subgraph) subgraph.nodes.push(targetId);
        }
      }

      // Add edge
      edges.push({
        source: sourceId,
        target: targetId,
        label: edgeLabel,
        type: edgeType,
      });
    }
  }

  return { nodes, edges, subgraphs };
}

function calculateNodeSize(label: string, shape: string) {
  const lines = label.split('\n');
  const maxLineLength = Math.max(...lines.map((line) => line.length));
  const width = Math.max(100, Math.min(250, maxLineLength * 7 + 30));
  const height = Math.max(40, lines.length * 18 + 25);

  if (shape === 'diamond') {
    return { width: Math.max(80, width * 0.8), height: Math.max(80, height * 0.8) };
  }
  if (shape === 'circle') {
    const size = Math.max(width, height) + 10;
    return { width: size, height: size };
  }
  return { width, height };
}

function layoutGraph(
  nodes: MermaidNode[],
  edges: MermaidEdge[],
  onNavigate?: (link: string) => void,
): ReactFlowData {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'TB',
    nodesep: 50,
    ranksep: 80,
    marginx: 50,
    marginy: 50,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to graph
  nodes.forEach((node) => {
    const size = calculateNodeSize(node.label, node.shape);
    g.setNode(node.id, { width: size.width, height: size.height });
  });

  // Add edges
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Layout
  dagre.layout(g);

  // Create React Flow nodes
  const reactFlowNodes: Node[] = nodes.map((node, index) => {
    const nodeLayout = g.node(node.id);
    const size = calculateNodeSize(node.label, node.shape);

    // Determine colors - clickable nodes get blue, others get gray
    const hasLink = !!node.link;
    const colors = hasLink
      ? { backgroundColor: '#E3F2FD', borderColor: '#1976D2' }
      : { backgroundColor: '#F5F5F5', borderColor: '#9E9E9E' };

    let nodeStyle: any = {
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    };

    // Adjust style based on shape
    switch (node.shape) {
      case 'diamond':
        nodeStyle.borderRadius = '0px';
        break;
      case 'circle':
        nodeStyle.borderRadius = '50%';
        break;
      case 'stadium':
        nodeStyle.borderRadius = '30px';
        break;
      case 'round':
        nodeStyle.borderRadius = '15px';
        break;
    }

    return {
      id: node.id,
      type: 'custom',
      position: {
        x: nodeLayout.x - size.width / 2,
        y: nodeLayout.y - size.height / 2,
      },
      data: {
        label: node.label,
        shape: node.shape,
        colors,
        link: node.link,
        onNavigate,
      },
      style: nodeStyle,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      draggable: false, // Disable dragging for navigation-only interaction
    };
  });

  // Create React Flow edges
  const reactFlowEdges: Edge[] = edges.map((edge, index) => {
    let edgeStyle: any = {
      stroke: '#1976D2',
      strokeWidth: 2,
    };

    let animated = false;

    // Style edges based on type
    switch (edge.type) {
      case '-->':
      case '->':
        animated = true;
        edgeStyle.strokeWidth = 2.5;
        break;
      case '---':
        edgeStyle.strokeDasharray = '8,4';
        break;
      case '-.-':
        edgeStyle.strokeDasharray = '4,4';
        break;
      case '==>':
      case '===>':
        edgeStyle.strokeWidth = 4;
        animated = true;
        break;
    }

    return {
      id: `edge-${edge.source}-${edge.target}-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated,
      style: edgeStyle,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#1976D2',
      },
    };
  });

  return { nodes: reactFlowNodes, edges: reactFlowEdges };
}

export async function convertMermaidToReactFlow(
  mermaidCode: string,
  onNavigate?: (link: string) => void,
): Promise<ReactFlowData> {
  try {
    // Parse link metadata first
    const linkMap = parseLinkMetadata(mermaidCode);

    // Parse the Mermaid code
    const { nodes, edges, subgraphs } = parseMermaidCode(mermaidCode, linkMap);

    if (nodes.length === 0) {
      console.warn('No nodes found in Mermaid diagram');
      return { nodes: [], edges: [] };
    }

    // Layout and return (simplified - no subgraph support in POC)
    return layoutGraph(nodes, edges, onNavigate);
  } catch (error) {
    console.error('Error converting Mermaid to React Flow:', error);
    return { nodes: [], edges: [] };
  }
}
