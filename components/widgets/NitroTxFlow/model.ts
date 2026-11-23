export type ActorKind = 'process' | 'contract' | 'user';
export type Chain = 'child' | 'parent' | 'off-chain';
export type Finality = 'soft' | 'batch-posted' | 'soft-confirmation' | 'hard' | 'settled';

export interface Actor {
  id: string;
  label: string;
  tech: string;
  kind: ActorKind;
  chain: Chain;
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
  repo: 'nitro' | 'nitro-contracts';
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
  finality?: Finality;
  failure?: Failure;
  docs?: DocsLink;
  citations: CodeRef[];
  // Where the user's transaction is during this step; that chain's band is highlighted.
  txChain: 'child' | 'parent';
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
  detailsToggle: string;
  symptoms: string;
  impact: string;
  recovery: string;
  showFlag: boolean;
}

export const OPERATOR_CARD: CardLabels = {
  detailsToggle: 'Show operator details',
  symptoms: 'What the operator sees',
  impact: 'Impact on the transaction',
  recovery: 'Recovery',
  showFlag: true,
};

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
