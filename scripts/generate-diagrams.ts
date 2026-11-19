import { FINALITY_LABEL } from '../components/widgets/NitroTxFlow/brand.ts';
import type {
  Actor,
  ActorKind,
  CardLabels,
  Chain,
  CodeRef,
  Finality,
  Flow,
  Step,
} from '../components/widgets/NitroTxFlow/model.ts';
import type {
  CodeRef as DiagramCodeRef,
  DiagramFlow,
  DiagramStep,
  Part,
} from './diagrams/types.ts';

const KINDS: readonly string[] = ['process', 'contract', 'user'] satisfies ActorKind[];
const CHAINS: readonly string[] = ['child', 'parent', 'off-chain'] satisfies Chain[];
const REPOS: readonly string[] = ['nitro', 'nitro-contracts'] satisfies CodeRef['repo'][];
const CARD_KEYS = ['detailsToggle', 'symptoms', 'impact', 'recovery'] as const;

function toCodeRef(flow: DiagramFlow, step: DiagramStep, ref: DiagramCodeRef): CodeRef {
  if (!REPOS.includes(ref.repo)) {
    throw new Error(
      `${flow.file}: step "${step.id}" uses repo "${ref.repo}", which the widget lacks`,
    );
  }
  const repo = ref.repo as CodeRef['repo'];
  return ref.line === undefined
    ? { repo, path: ref.path }
    : { repo, path: ref.path, line: ref.line };
}

function toActor(flow: DiagramFlow, part: Part): Actor {
  if (part.tech === undefined) {
    throw new Error(`${flow.file}: part "${part.id}" needs a tech for the widget`);
  }
  if (!KINDS.includes(part.kind)) {
    throw new Error(
      `${flow.file}: part "${part.id}" has kind "${part.kind}", which the widget lacks`,
    );
  }
  if (!CHAINS.includes(part.lane)) {
    throw new Error(
      `${flow.file}: part "${part.id}" has lane "${part.lane}", which the widget lacks`,
    );
  }
  return {
    id: part.id,
    label: part.label,
    tech: part.tech,
    kind: part.kind as ActorKind,
    chain: part.lane as Chain,
  };
}

function toCard(flow: DiagramFlow, card: NonNullable<DiagramFlow['card']>): CardLabels {
  const labels: Partial<Record<(typeof CARD_KEYS)[number], string>> = {};
  for (const key of CARD_KEYS) {
    const value = card[key];
    if (typeof value !== 'string') {
      throw new Error(`${flow.file}: card.${key} must be a string`);
    }
    labels[key] = value;
  }
  const { showFlag } = card;
  if (typeof showFlag !== 'boolean')
    throw new Error(`${flow.file}: card.showFlag must be a boolean`);
  return { ...(labels as Record<(typeof CARD_KEYS)[number], string>), showFlag };
}

function toStep(flow: DiagramFlow, step: DiagramStep, all: Map<string, DiagramFlow>): Step {
  if (step.lane !== 'child' && step.lane !== 'parent') {
    throw new Error(`${flow.file}: step "${step.id}" lane "${step.lane}" must be child or parent`);
  }
  const { flag, finality, docs, failure } = step;
  const out: Step = {
    id: step.id,
    title: step.title,
    text: step.text,
    actors: step.parts,
    edges: step.edges,
    ...(flag === undefined ? {} : { flag }),
    ...(step.code === undefined ? {} : { code: toCodeRef(flow, step, step.code) }),
    ...(finality === undefined ? {} : { finality: toFinality(flow, step, finality) }),
    ...(failure === undefined ? {} : { failure: { ...failure } }),
    ...(docs === undefined ? {} : { docs: { href: docs.href, label: docs.label } }),
    citations: step.cites.map((ref) => toCodeRef(flow, step, ref)),
    txChain: step.lane,
  };
  if (step.detail) {
    const inner = all.get(step.detail.flow);
    if (!inner)
      throw new Error(
        `${flow.file}: step "${step.id}" detail flow "${step.detail.flow}" not found`,
      );
    out.detail = { actor: step.detail.part, flow: toFlow(inner, all) };
  }
  return out;
}

function toFinality(flow: DiagramFlow, step: DiagramStep, value: string): Finality {
  if (!(value in FINALITY_LABEL)) {
    throw new Error(`${flow.file}: step "${step.id}" has unknown finality "${value}"`);
  }
  return value as Finality;
}

/** Map a generic diagram flow to the `Flow` the NitroTxFlow widget reads. */
export function toFlow(flow: DiagramFlow, all: Map<string, DiagramFlow>): Flow {
  for (const edge of flow.edges) {
    if (edge.both || edge.style !== 'solid') {
      throw new Error(
        `${flow.file}: edge "${edge.id}" needs a solid, one-way arrow for the widget`,
      );
    }
  }
  return {
    id: flow.id,
    title: flow.title,
    ...(flow.showLanes ? {} : { showChains: false }),
    actors: flow.parts.map((part) => toActor(flow, part)),
    edges: flow.edges.map(({ id, source, target, label }) => ({ id, source, target, label })),
    steps: flow.steps.map((step) => toStep(flow, step, all)),
    ...(flow.paths === undefined
      ? {}
      : { paths: flow.paths.map(({ id, label, steps }) => ({ id, label, steps: [...steps] })) }),
    ...(flow.card === undefined ? {} : { card: toCard(flow, flow.card) }),
  };
}
