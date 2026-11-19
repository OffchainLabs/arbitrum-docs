/** A part shared by every flow: a box on the diagram. */
export interface Part {
  id: string;
  label: string;
  tech?: string;
  kind: string;
  lane: string;
}

export type EdgeStyle = 'solid' | 'dashed' | 'dotted';

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  both: boolean;
  style: EdgeStyle;
}

/** A step of a flow. The step sections are parsed in a later task. */
export interface DiagramStep {
  id: string;
}

export interface FlowPath {
  id: string;
  label: string;
  steps: string[];
}

export interface DiagramFlow {
  id: string;
  widget?: string;
  title: string;
  showLanes: boolean;
  parts: Part[];
  edges: DiagramEdge[];
  steps: DiagramStep[];
  paths?: FlowPath[];
  card?: Record<string, string | boolean>;
  static?: Record<string, [number, number]>;
  file: string;
}

export interface ProjectConfig {
  lanes: Record<string, { label: string; svg?: { fill: string; stroke: string } }>;
  kinds: Record<
    string,
    { label: string; svg: { fill: string; title: string; sub: string; stroke?: string } }
  >;
  repos: Record<string, { url: string }>;
  svg: {
    theme: string;
    canvas: [number, number];
    cols: number[];
    rows: number[];
    box: [number, number];
    scale: number;
    offset: [number, number];
  };
}

export interface LoadedProject {
  config: ProjectConfig;
  parts: Map<string, Part>;
  flows: Map<string, DiagramFlow>;
}
