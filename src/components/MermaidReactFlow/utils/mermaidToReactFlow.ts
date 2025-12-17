import { Node, Edge, MarkerType, Position } from 'reactflow';
import dagre from 'dagre';
import { ReactFlowData, MermaidNode, MermaidEdge, SubgraphInfo } from '../types';
import { parseLinkMetadata } from './linkParser';

const SUBGRAPH_HEADER_HEIGHT = 50;
const SUBGRAPH_PADDING = 30;

interface SubgraphLayout {
  id: string;
  title: string;
  nodes: Map<string, { x: number; y: number; width: number; height: number }>;
  width: number;
  height: number;
  position?: { x: number; y: number };
}

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

// Phase 1: Layout each subgraph independently
function layoutSubgraphs(
  nodes: MermaidNode[],
  edges: MermaidEdge[],
  subgraphs: SubgraphInfo[],
): Map<string, SubgraphLayout> {
  const subgraphLayouts = new Map<string, SubgraphLayout>();

  subgraphs.forEach((subgraph) => {
    const subgraphNodes = nodes.filter((n) => n.subgraph === subgraph.id);
    const subgraphEdges = edges.filter((e) => {
      const sourceNode = nodes.find((n) => n.id === e.source);
      const targetNode = nodes.find((n) => n.id === e.target);
      return sourceNode?.subgraph === subgraph.id && targetNode?.subgraph === subgraph.id;
    });

    if (subgraphNodes.length === 0) return;

    // Create a new graph for this subgraph
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: 'TB',
      nodesep: 40,
      ranksep: 60,
      marginx: SUBGRAPH_PADDING,
      marginy: SUBGRAPH_PADDING + SUBGRAPH_HEADER_HEIGHT,
    });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes
    subgraphNodes.forEach((node) => {
      const size = calculateNodeSize(node.label, node.shape);
      g.setNode(node.id, { width: size.width, height: size.height });
    });

    // Add edges
    subgraphEdges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    // Layout this subgraph
    dagre.layout(g);

    // Calculate bounding box
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    const nodePositions = new Map<
      string,
      { x: number; y: number; width: number; height: number }
    >();

    subgraphNodes.forEach((node) => {
      const nodeLayout = g.node(node.id);
      const size = calculateNodeSize(node.label, node.shape);

      nodePositions.set(node.id, {
        x: nodeLayout.x,
        y: nodeLayout.y,
        width: size.width,
        height: size.height,
      });

      minX = Math.min(minX, nodeLayout.x - size.width / 2);
      maxX = Math.max(maxX, nodeLayout.x + size.width / 2);
      minY = Math.min(minY, nodeLayout.y - size.height / 2);
      maxY = Math.max(maxY, nodeLayout.y + size.height / 2);
    });

    // Normalize positions to start from (0, 0) with header space
    const offsetX = -minX + SUBGRAPH_PADDING;
    const offsetY = -minY + SUBGRAPH_PADDING + SUBGRAPH_HEADER_HEIGHT;

    nodePositions.forEach((pos, nodeId) => {
      nodePositions.set(nodeId, {
        ...pos,
        x: pos.x + offsetX,
        y: pos.y + offsetY,
      });
    });

    subgraphLayouts.set(subgraph.id, {
      id: subgraph.id,
      title: subgraph.title,
      nodes: nodePositions,
      width: maxX - minX + SUBGRAPH_PADDING * 2,
      height: maxY - minY + SUBGRAPH_PADDING * 2 + SUBGRAPH_HEADER_HEIGHT,
    });
  });

  return subgraphLayouts;
}

// Phase 2: Layout meta-graph (containers + standalone nodes)
function layoutMetaGraph(
  nodes: MermaidNode[],
  edges: MermaidEdge[],
  subgraphLayouts: Map<string, SubgraphLayout>,
): {
  subgraphPositions: Map<string, { x: number; y: number }>;
  standalonePositions: Map<string, { x: number; y: number }>;
} {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'TB',
    nodesep: 80,
    ranksep: 100,
    marginx: 50,
    marginy: 50,
  });
  g.setDefaultEdgeLabel(() => ({}));

  // Add subgraph containers as nodes
  subgraphLayouts.forEach((layout, id) => {
    g.setNode(id, { width: layout.width, height: layout.height });
  });

  // Add standalone nodes
  const standaloneNodes = nodes.filter((n) => !n.subgraph);
  standaloneNodes.forEach((node) => {
    const size = calculateNodeSize(node.label, node.shape);
    g.setNode(node.id, { width: size.width, height: size.height });
  });

  // Add edges between containers and standalone nodes
  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    // Determine the meta-nodes for this edge
    const sourceMetaNode = sourceNode?.subgraph || sourceNode?.id;
    const targetMetaNode = targetNode?.subgraph || targetNode?.id;

    if (sourceMetaNode && targetMetaNode && sourceMetaNode !== targetMetaNode) {
      // Don't add duplicate edges between same containers
      if (!g.hasEdge(sourceMetaNode, targetMetaNode)) {
        g.setEdge(sourceMetaNode, targetMetaNode);
      }
    }
  });

  // Layout the meta-graph
  dagre.layout(g);

  // Extract positions
  const subgraphPositions = new Map<string, { x: number; y: number }>();
  const standalonePositions = new Map<string, { x: number; y: number }>();

  subgraphLayouts.forEach((layout, id) => {
    const node = g.node(id);
    subgraphPositions.set(id, {
      x: node.x - layout.width / 2,
      y: node.y - layout.height / 2,
    });
  });

  standaloneNodes.forEach((node) => {
    const nodeLayout = g.node(node.id);
    const size = calculateNodeSize(node.label, node.shape);
    standalonePositions.set(node.id, {
      x: nodeLayout.x - size.width / 2,
      y: nodeLayout.y - size.height / 2,
    });
  });

  return { subgraphPositions, standalonePositions };
}

// Phase 3: Combine layouts and create React Flow nodes/edges
function createReactFlowElements(
  nodes: MermaidNode[],
  edges: MermaidEdge[],
  subgraphs: SubgraphInfo[],
  subgraphLayouts: Map<string, SubgraphLayout>,
  subgraphPositions: Map<string, { x: number; y: number }>,
  standalonePositions: Map<string, { x: number; y: number }>,
  onNavigate?: (link: string) => void,
): ReactFlowData {
  const reactFlowNodes: Node[] = [];

  // Color schemes using CSS variables
  const getNodeColors = (shape: string) => {
    const colorSchemes = {
      rect: { backgroundColor: 'var(--node-rect-bg)', borderColor: 'var(--node-rect-border)' },
      diamond: {
        backgroundColor: 'var(--node-diamond-bg)',
        borderColor: 'var(--node-diamond-border)',
      },
      circle: {
        backgroundColor: 'var(--node-circle-bg)',
        borderColor: 'var(--node-circle-border)',
      },
      stadium: {
        backgroundColor: 'var(--node-stadium-bg)',
        borderColor: 'var(--node-stadium-border)',
      },
      round: { backgroundColor: 'var(--node-round-bg)', borderColor: 'var(--node-round-border)' },
    };

    const defaultColors = { backgroundColor: '#F0F4F8', borderColor: '#2D3748' };
    return colorSchemes[shape as keyof typeof colorSchemes] || defaultColors;
  };

  const getSubgraphColors = (index: number) => {
    const subgraphColors = [
      { bg: 'var(--subgraph-color-0-bg)', border: 'var(--subgraph-color-0-border)' },
      { bg: 'var(--subgraph-color-1-bg)', border: 'var(--subgraph-color-1-border)' },
      { bg: 'var(--subgraph-color-2-bg)', border: 'var(--subgraph-color-2-border)' },
      { bg: 'var(--subgraph-color-3-bg)', border: 'var(--subgraph-color-3-border)' },
      { bg: 'var(--subgraph-color-4-bg)', border: 'var(--subgraph-color-4-border)' },
    ];
    return subgraphColors[index % subgraphColors.length];
  };

  // Add subgraph containers
  console.log(`Processing ${subgraphs.length} subgraphs:`, subgraphs);
  subgraphs.forEach((subgraph, index) => {
    const layout = subgraphLayouts.get(subgraph.id);
    const position = subgraphPositions.get(subgraph.id);
    console.log(`Subgraph ${subgraph.id}: layout=${!!layout}, position=${!!position}`);

    if (layout && position) {
      const colors = getSubgraphColors(index);

      const groupNode = {
        id: subgraph.id,
        type: 'group',
        position: position,
        data: {
          label: subgraph.title,
          isSubgraph: true,
        },
        style: {
          backgroundColor: colors.bg,
          border: `3px solid ${colors.border}`,
          borderRadius: '12px',
          width: layout.width,
          height: layout.height,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transform: 'none',
          zIndex: -1,
        },
        selectable: true,
        draggable: false,
        connectable: false,
      };
      console.log('Creating group node:', groupNode);
      reactFlowNodes.push(groupNode);
    }
  });

  // Add nodes
  nodes.forEach((node) => {
    const colors = getNodeColors(node.shape);

    let nodeStyle = {
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      borderWidth: '2px',
      borderStyle: 'solid' as const,
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

    let position: { x: number; y: number };
    let parentNode: string | undefined;

    if (node.subgraph) {
      // Node is inside a subgraph
      const subgraphLayout = subgraphLayouts.get(node.subgraph);
      const subgraphPosition = subgraphPositions.get(node.subgraph);
      const nodeLayout = subgraphLayout?.nodes.get(node.id);

      if (nodeLayout && subgraphPosition) {
        // Position relative to parent
        position = {
          x: nodeLayout.x - nodeLayout.width / 2,
          y: nodeLayout.y - nodeLayout.height / 2,
        };
        parentNode = node.subgraph;
      } else {
        position = { x: 0, y: 0 };
      }
    } else {
      // Standalone node
      const standalonePos = standalonePositions.get(node.id);
      position = standalonePos || { x: 0, y: 0 };
    }

    reactFlowNodes.push({
      id: node.id,
      type: 'custom',
      position: position,
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
      parentNode: parentNode,
      draggable: false,
      zIndex: 1,
    });
  });

  // Create edges with rotating color palette and enhanced styling
  const reactFlowEdges: Edge[] = edges.map((edge, index) => {
    // Rotating edge color palette (5 colors matching node/subgraph theme)
    const edgeColors = ['#1976D2', '#388E3C', '#F57C00', '#7B1FA2', '#C2185B'];
    const edgeColor = edgeColors[index % edgeColors.length];

    let edgeStyle: any = {
      stroke: edgeColor,
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

    const edgeObj = {
      id: `edge-${edge.source}-${edge.target}-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated,
      style: edgeStyle,
      labelStyle: {
        fontSize: '12px',
        fontWeight: '500',
        color: edgeColor,
        backgroundColor: 'white',
        padding: '2px 6px',
        borderRadius: '4px',
        border: `1px solid ${edgeColor}`,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: edgeColor,
      },
      zIndex: 0,
    };

    console.log('Created edge:', edgeObj);
    return edgeObj;
  });

  console.log(`Total edges created: ${reactFlowEdges.length}`);
  console.log(
    'All nodes created:',
    reactFlowNodes.map((n) => ({ id: n.id, type: n.type, data: n.data })),
  );

  return { nodes: reactFlowNodes, edges: reactFlowEdges };
}

function layoutGraph(
  nodes: MermaidNode[],
  edges: MermaidEdge[],
  subgraphs: SubgraphInfo[],
  onNavigate?: (link: string) => void,
): ReactFlowData {
  // Phase 1: Layout each subgraph independently
  const subgraphLayouts = layoutSubgraphs(nodes, edges, subgraphs);

  // Phase 2: Layout meta-graph (containers + standalone nodes)
  const { subgraphPositions, standalonePositions } = layoutMetaGraph(nodes, edges, subgraphLayouts);

  // Phase 3: Combine layouts and create React Flow elements
  return createReactFlowElements(
    nodes,
    edges,
    subgraphs,
    subgraphLayouts,
    subgraphPositions,
    standalonePositions,
    onNavigate,
  );
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

    // Layout using three-phase algorithm with subgraph support
    return layoutGraph(nodes, edges, subgraphs, onNavigate);
  } catch (error) {
    console.error('Error converting Mermaid to React Flow:', error);
    return { nodes: [], edges: [] };
  }
}
