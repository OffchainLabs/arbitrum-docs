import type React from 'react';
import { Node, Edge } from 'reactflow';

export interface ZoomConfig {
  level: number;
  duration: number;
}

export interface PauseConfig {
  duration: number;
}

export interface FadeConfig {
  duration: number;
  easing: string;
}

export type TransitionMode = 'zoom' | 'modal';

export interface TransitionConfig {
  fromFile: string;
  trigger: string;
  targetDiagram: string;
  targetFile: string;
  mode: TransitionMode;
  zoom: ZoomConfig;
  pause: PauseConfig;
  fade: FadeConfig;
}

export interface ManifestData {
  id: string;
  title: string;
  entryDiagramFile: string;
  diagrams: Map<string, string>;
  transitions: TransitionConfig[];
}

export interface DiagramProps {
  diagramFile?: string;
  manifest?: string;
  height?: string;
  className?: string;
  hoverContent?: Record<string, React.ComponentType>;
}

export type DrawioReactFlowProps = DiagramProps;

export interface ReactFlowData {
  nodes: Node[];
  edges: Edge[];
}

export interface NavigationState {
  currentDiagram: string;
  history: string[];
}

export interface NodeData {
  label: string;
  shape: string;
  link?: string;
  centerable?: boolean;
  navigateTo?: string;
  topAligned?: boolean;
  colorToken?: string;
  onNavigate?: (link: string) => void;
  hoverContentKey?: string;
  hoverContentComponent?: React.ComponentType;
}

export interface EdgeData {
  hoverContentKey?: string;
  hoverContentComponent?: React.ComponentType;
}
