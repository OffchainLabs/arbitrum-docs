import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
  Actor,
  CardLabels,
  CodeRef,
  Flow,
  Project,
  Step,
} from '../components/widgets/FlowDiagram/model.ts';
import { docsPreviewRoute } from '../lib/shared.ts';
import { loadProject } from './diagrams/load.ts';
import { renderSvg } from './diagrams/render-svg.ts';
import type {
  CodeRef as DiagramCodeRef,
  DiagramFlow,
  DiagramStep,
  LoadedProject,
  Part,
  ProjectConfig,
} from './diagrams/types.ts';
import { buildIndex } from './lib/doc-links.ts';
import { isCheckMode, runScript, writeOrCheck } from './lib/generated-partial.ts';

const CARD_KEYS = ['detailsToggle', 'symptoms', 'impact', 'recovery'] as const;

/** The project.yaml and the flows that the widget mapping reads. */
interface Context {
  config: ProjectConfig;
  all: Map<string, DiagramFlow>;
}

function toCodeRef(
  flow: DiagramFlow,
  step: DiagramStep,
  ref: DiagramCodeRef,
  config: ProjectConfig,
): CodeRef {
  if (config.repos[ref.repo]?.code === undefined) {
    throw new Error(
      `${flow.file}: step "${step.id}" uses repo "${ref.repo}", which has no code link in ` +
        'project.yaml',
    );
  }
  const { repo } = ref;
  return ref.line === undefined
    ? { repo, path: ref.path }
    : { repo, path: ref.path, line: ref.line };
}

function toActor(flow: DiagramFlow, part: Part, config: ProjectConfig): Actor {
  if (config.kinds[part.kind]?.widget === undefined) {
    throw new Error(
      `${flow.file}: part "${part.id}" has kind "${part.kind}", which has no widget colors in ` +
        'project.yaml',
    );
  }
  if (flow.showLanes && config.lanes[part.lane]?.short === undefined) {
    throw new Error(
      `${flow.file}: part "${part.id}" has lane "${part.lane}", which has no short name in ` +
        'project.yaml',
    );
  }
  return {
    id: part.id,
    label: part.label,
    ...(part.tech === undefined ? {} : { tech: part.tech }),
    kind: part.kind,
    chain: part.lane,
    ...(part.docs === undefined
      ? {}
      : { docs: { href: part.docs, previewUrl: `${docsPreviewRoute}${part.docs}/preview.json` } }),
  };
}

/** Every part `docs` path is the URL of a page under content/docs. */
export function checkPartDocs(parts: Map<string, Part>, pageUrls: ReadonlySet<string>): void {
  for (const part of parts.values()) {
    if (part.docs !== undefined && !pageUrls.has(part.docs)) {
      throw new Error(
        `diagrams/parts.yaml: part "${part.id}" docs "${part.docs}" is not a docs page`,
      );
    }
  }
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

function stepOptionals(flow: DiagramFlow, step: DiagramStep, config: ProjectConfig) {
  const { flag, finality, docs, failure } = step;
  return {
    ...(flag === undefined ? {} : { flag }),
    ...(step.code === undefined ? {} : { code: toCodeRef(flow, step, step.code, config) }),
    ...(finality === undefined ? {} : { finality: toFinality(flow, step, finality, config) }),
    ...(failure === undefined ? {} : { failure: { ...failure } }),
    ...(docs === undefined ? {} : { docs: { href: docs.href, label: docs.label } }),
  };
}

function toStep(flow: DiagramFlow, step: DiagramStep, ctx: Context): Step {
  if (ctx.config.lanes[step.lane]?.widget === undefined) {
    throw new Error(
      `${flow.file}: step "${step.id}" lane "${step.lane}" has no widget band colors in ` +
        'project.yaml',
    );
  }
  const out: Step = {
    id: step.id,
    title: step.title,
    text: step.text,
    actors: step.parts,
    edges: step.edges,
    ...stepOptionals(flow, step, ctx.config),
    citations: step.cites.map((ref) => toCodeRef(flow, step, ref, ctx.config)),
    txChain: step.lane,
  };
  if (step.detail) {
    const inner = ctx.all.get(step.detail.flow);
    if (!inner) {
      throw new Error(
        `${flow.file}: step "${step.id}" detail flow "${step.detail.flow}" not found`,
      );
    }
    out.detail = { actor: step.detail.part, flow: toFlow(inner, ctx) };
    if (step.detail.next) out.detail.next = step.detail.next;
  }
  return out;
}

function toFinality(
  flow: DiagramFlow,
  step: DiagramStep,
  value: string,
  config: ProjectConfig,
): string {
  if (!Object.hasOwn(config.finality ?? {}, value)) {
    throw new Error(
      `${flow.file}: step "${step.id}" has finality "${value}", which project.yaml does not ` +
        'declare',
    );
  }
  return value;
}

/** Map a generic diagram flow to the `Flow` the FlowDiagram widget reads. */
export function toFlow(flow: DiagramFlow, ctx: Context): Flow {
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
    actors: flow.parts.map((part) => toActor(flow, part, ctx.config)),
    edges: flow.edges.map(({ id, source, target, label }) => ({ id, source, target, label })),
    steps: flow.steps.map((step) => toStep(flow, step, ctx)),
    ...(flow.paths === undefined
      ? {}
      : { paths: flow.paths.map(({ id, label, steps }) => ({ id, label, steps: [...steps] })) }),
    ...(flow.card === undefined ? {} : { card: toCard(flow, flow.card) }),
  };
}

const REPO_ROOT = path.join(import.meta.dirname, '..');
const OUTPUT_PATH = path.join(
  REPO_ROOT,
  'components',
  'widgets',
  'FlowDiagram',
  'flows.generated.ts',
);
const CONST_NAMES: Record<string, string> = {
  'transaction-submission-flow': 'transactionSubmission',
};
const DETAIL_PREFIX = '__detail:';

const constName = (id: string): string =>
  CONST_NAMES[id] ?? id.replace(/-(\w)/g, (_, char: string) => char.toUpperCase());

function emitConst(flow: Flow): string {
  const text = JSON.stringify(flow, (key, value: unknown) => {
    if (key !== 'flow' || typeof value !== 'object' || value === null) return value;
    return `${DETAIL_PREFIX}${(value as Flow).id}`;
  });
  const body = text.replace(new RegExp(`"${DETAIL_PREFIX}([^"]+)"`, 'g'), (_, id: string) =>
    constName(id),
  );
  return `export const ${constName(flow.id)}: Flow = ${body};`;
}

/** The part of project.yaml the widget reads: no SVG settings, and only kinds with widget colors. */
export function toProject(config: ProjectConfig): Project {
  if (config.card === undefined) throw new Error('diagrams/project.yaml: card is required');
  const lanes: Project['lanes'] = {};
  for (const [id, { svg: _svg, ...lane }] of Object.entries(config.lanes)) lanes[id] = lane;
  const kinds: Project['kinds'] = {};
  for (const [id, { label, widget }] of Object.entries(config.kinds)) {
    if (widget !== undefined) kinds[id] = { label, widget };
  }
  const repos: Project['repos'] = {};
  for (const [id, { code }] of Object.entries(config.repos)) {
    if (code !== undefined) repos[id] = { code };
  }
  return { lanes, kinds, finality: config.finality ?? {}, repos, card: config.card };
}

export function buildContent(flows: Map<string, DiagramFlow>, config: ProjectConfig): string {
  const consts: string[] = [];
  const emitted = new Set<string>();
  const keys: [string, string, boolean][] = [];
  const emit = (flow: DiagramFlow): void => {
    if (emitted.has(flow.id)) return;
    emitted.add(flow.id);
    for (const step of flow.steps) {
      if (step.detail) emit(flows.get(step.detail.flow)!);
    }
    consts.push(emitConst(toFlow(flow, { config, all: flows })));
    keys.push([flow.widget ?? flow.id, constName(flow.id), flow.widget !== undefined]);
  };
  for (const flow of flows.values()) {
    if (flow.steps.length > 0) emit(flow);
  }
  keys.sort((a, b) => Number(b[2]) - Number(a[2]));
  return (
    [
      '// AUTOGENERATED. Do not edit by hand. Run `pnpm diagrams:generate` after editing ' +
        'diagrams/.',
      "import type { Flow, Project } from './model.ts';",
      `export const PROJECT: Project = ${JSON.stringify(toProject(config))};`,
      consts.join('\n\n'),
      `export type FlowId = ${keys.map(([key]) => `'${key}'`).join(' | ')};`,
      `export const FLOWS: Record<FlowId, Flow> = {\n${keys
        .map(([key, name]) => `  '${key}': ${name},`)
        .join('\n')}\n};`,
    ].join('\n\n') + '\n'
  );
}

const DIAGRAMS_DIR = path.join(REPO_ROOT, 'diagrams');
const SVG_DIR = path.join(REPO_ROOT, 'public', 'img');

/** Render every flow with `static:` positions to `public/img/<svg>.svg`. */
async function writeStaticSvgs({ config, flows }: LoadedProject, check: boolean) {
  const written = new Set<string>();
  for (const flow of flows.values()) {
    if (flow.static === undefined && flow.svg === undefined) continue;
    if (flow.static === undefined || flow.svg === undefined) {
      throw new Error(`${flow.file}: a static SVG needs both static: and svg:`);
    }
    if (written.has(flow.svg)) throw new Error(`${flow.file}: svg "${flow.svg}" is used twice`);
    written.add(flow.svg);
    if (config.svg.background === undefined) {
      throw new Error(`${flow.file}: project.yaml svg.background is required to render an SVG`);
    }
    const background = await readFile(path.join(DIAGRAMS_DIR, config.svg.background), 'utf8');
    const file = path.join(SVG_DIR, `${flow.svg}.svg`);
    await writeOrCheck(file, renderSvg(flow, config, background), { check, format: false });
  }
}

async function main(): Promise<void> {
  const check = isCheckMode();
  const project = await loadProject(DIAGRAMS_DIR);
  checkPartDocs(project.parts, new Set(buildIndex(REPO_ROOT).byUrl.keys()));
  await writeOrCheck(OUTPUT_PATH, buildContent(project.flows, project.config), { check });
  await writeStaticSvgs(project, check);
  const wrote = path.relative(REPO_ROOT, OUTPUT_PATH);
  console.log(check ? 'diagrams: up to date.' : `diagrams: wrote ${wrote}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) runScript(main);
