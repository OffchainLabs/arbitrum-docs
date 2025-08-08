import type { Node, Edge } from '@xyflow/react';

export interface ClickableArea {
  nodeId: string;
  nextStateId: string;
  tooltip?: string;
}

export interface DiagramState {
  id: string;
  nodes: Node[];
  edges: Edge[];
  clickableAreas: ClickableArea[];
}

export interface LidiaFlowConfig {
  id: string;
  title: string;
  states: DiagramState[];
  initialStateId: string;
}

export interface LidiaFlowState {
  currentStateId: string;
  history: string[];
}

export interface ClickableNodeData {
  label: string;
  tooltip?: string;
  isClickable: boolean;
  nextStateId?: string;
}
