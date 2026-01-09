import { Node, Edge } from 'reactflow';

export interface MermaidReactFlowProps {
  diagramFile: string;
  height?: string;
  className?: string;
}

export interface ReactFlowData {
  nodes: Node[];
  edges: Edge[];
}

export interface MermaidNode {
  id: string;
  label: string;
  shape: string;
  subgraph?: string;
  link?: string; // Link to another diagram file
}

export interface MermaidEdge {
  source: string;
  target: string;
  label?: string;
  type: string;
}

export interface SubgraphInfo {
  id: string;
  title: string;
  nodes: string[];
}

export interface NavigationState {
  currentDiagram: string;
  history: string[];
}

export interface NodeData {
  label: string;
  shape: string;
  colors: {
    backgroundColor: string;
    borderColor: string;
  };
  link?: string;
  onNavigate?: (link: string) => void;
}
