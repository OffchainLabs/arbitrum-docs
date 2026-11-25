export interface Actor {
  id: string;
  label: string;
  tech?: string;
  // A kind id and a lane id of `PROJECT`.
  kind: string;
  chain: string;
  // The page a hover card previews. `previewUrl` is the page's static preview JSON.
  docs?: { href: string; previewUrl: string };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface CodeRef {
  repo: string;
  path: string;
  line?: number;
}

export interface Failure {
  symptoms: string;
  impact: string;
  recovery: string;
}

export interface Step {
  id: string;
  title: string;
  text: string;
  actors: string[];
  edges: string[];
  flag?: string;
  code?: CodeRef;
  finality?: string;
  failure?: Failure;
  docs?: DocsLink;
  citations: CodeRef[];
  // Where the user's transaction is during this step; that lane's band is highlighted.
  txChain: string;
  // SPIKE: an inner flow the reader opens by clicking `actor` on this step.
  detail?: StepDetail;
}

export interface DocsLink {
  // Root-absolute, with an optional #fragment.
  href: string;
  label: string;
}

export interface FlowPath {
  id: string;
  label: string;
  // Step ids.
  steps: string[];
}

export interface ResolvedPath {
  id: string;
  label: string;
  steps: Step[];
}

export interface CardLabels {
  // The step caption's two tabs: the step text, and the failure paragraphs.
  overviewTab: string;
  failureTab: string;
  symptoms: string;
  impact: string;
  recovery: string;
  showFlag: boolean;
}

export interface LaneInfo {
  label: string;
  // The lane name in an actor's sub-line.
  short?: string | null;
  // Present when the lane is drawn as a band. Each pair is [inactive, active].
  widget?: { accent: string; fill: [string, string]; border: [string, string] };
}

export interface KindInfo {
  label: string;
  widget: {
    fill: string;
    title: string;
    sub: string;
    offLane?: { lane: string; label: string };
  };
}

/** The labels and colors a project declares in `diagrams/project.yaml`. */
export interface Project {
  // In row order.
  lanes: Record<string, LaneInfo>;
  // Only the kinds with widget colors, in key order.
  kinds: Record<string, KindInfo>;
  finality: Record<string, { label: string; term?: string }>;
  // A code link base per repo, with {var:name} tokens.
  repos: Record<string, { code: string }>;
  card: CardLabels;
}

/** The colors and font of `diagrams/theme.yaml`, shared by the widget and the static SVG. */
export interface Theme {
  gradient: string;
  connector: string;
  active: string;
  activeGlow: string;
  startGlow: string;
  focus: string;
  chip: string;
  ink: string;
  badge: string;
  badgeText: string;
  attribution: string;
  font: string;
  dimmed: number;
}

export interface StepDetail {
  actor: string;
  flow: Flow;
  // The step id the reader lands on after the detail flow's last step. Default: the next step.
  next?: string;
}

export interface Flow {
  id: string;
  title: string;
  // SPIKE: false for a detail flow inside one process, where the chain carries no information.
  showChains?: boolean;
  actors: Actor[];
  edges: FlowEdge[];
  steps: Step[];
  paths?: FlowPath[];
  card?: CardLabels;
}

export function flowPaths(flow: Flow): ResolvedPath[] {
  if (!flow.paths) return [{ id: '', label: flow.title, steps: flow.steps }];
  const byId = new Map(flow.steps.map((step) => [step.id, step]));
  return flow.paths.map((path) => {
    const steps: Step[] = [];
    for (const id of path.steps) {
      const step = byId.get(id);
      if (!step) {
        throw new Error(`Flow "${flow.id}" path "${path.id}" lists unknown step "${id}"`);
      }
      steps.push(step);
    }
    return { id: path.id, label: path.label, steps };
  });
}

export function codeRefs(flow: Flow): CodeRef[] {
  const seen = new Map<string, CodeRef>();
  const collect = (current: Flow) => {
    for (const step of current.steps) {
      for (const ref of [...(step.code ? [step.code] : []), ...step.citations]) {
        const key = `${ref.repo}:${ref.path}`;
        if (!seen.has(key)) seen.set(key, ref);
      }
      if (step.detail) collect(step.detail.flow);
    }
  };
  collect(flow);
  return [...seen.values()];
}

/** The key text of `kind`: `offLane.label` when a part of that kind is not on `offLane.lane`. */
export function kindKey(flow: Flow, id: string, kind: KindInfo): string {
  const { offLane } = kind.widget;
  if (!offLane) return kind.label;
  const parts = flow.actors.filter((actor) => actor.kind === id);
  return parts.every((actor) => actor.chain === offLane.lane) ? kind.label : offLane.label;
}
