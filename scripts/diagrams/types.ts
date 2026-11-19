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

export interface CodeRef {
  repo: string;
  path: string;
  line?: number;
}

export interface StepFailure {
  symptoms: string;
  impact: string;
  recovery: string;
}

/** One step of a flow, read from a `## Title {#id}` section. */
export interface DiagramStep {
  id: string;
  title: string;
  text: string;
  parts: string[];
  edges: string[];
  flag?: string;
  code?: CodeRef;
  cites: CodeRef[];
  finality?: string;
  lane: string;
  docs?: { href: string; label: string };
  failure?: StepFailure;
  detail?: { part: string; flow: string };
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
