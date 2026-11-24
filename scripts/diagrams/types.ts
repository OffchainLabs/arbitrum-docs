/** A part shared by every flow: a box on the diagram. */
export interface Part {
  id: string;
  label: string;
  tech?: string;
  kind: string;
  lane: string;
  // A docs page path, such as /get-started. The widget previews it when the pointer rests on the box.
  docs?: string;
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
  // `next`: the step the reader lands on after the detail flow's last step. Default: the next step.
  detail?: { part: string; flow: string; next?: string };
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
  /** Output file name, without `.svg`, of the static SVG. */
  svg?: string;
  alt?: string;
  file: string;
}

export interface ProjectConfig {
  lanes: Record<
    string,
    {
      label: string;
      short?: string | null;
      svg?: { fill: string; stroke: string; label?: string };
      widget?: { accent: string; fill: [string, string]; border: [string, string] };
    }
  >;
  kinds: Record<
    string,
    {
      label: string;
      svg: { fill: string; title: string; sub: string; stroke?: string; key?: string };
      widget?: {
        fill: string;
        title: string;
        sub: string;
        offLane?: { lane: string; label: string };
      };
    }
  >;
  repos: Record<string, { url: string; code?: string }>;
  finality?: Record<string, { label: string; term?: string }>;
  card?: {
    overviewTab: string;
    failureTab: string;
    symptoms: string;
    impact: string;
    recovery: string;
    showFlag: boolean;
  };
  svg: {
    canvas: [number, number];
    cols: number[];
    rows: number[];
    box: [number, number];
    scale: number;
    offset: [number, number];
    background?: string;
    /** A canvas area no box may overlap, in final SVG units. */
    reserve?: { x: [number, number]; y: [number, number] };
  };
}

export interface LoadedProject {
  config: ProjectConfig;
  parts: Map<string, Part>;
  flows: Map<string, DiagramFlow>;
}
