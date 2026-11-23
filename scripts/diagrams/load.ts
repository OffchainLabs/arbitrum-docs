import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { type FlowHeader, parseFlowHeader, parseSteps } from './parse-flow.ts';
import { YamlSource, parseParts, parseProjectConfig } from './schema.ts';
import type { DiagramFlow, DiagramStep, LoadedProject, Part, ProjectConfig } from './types.ts';

function resolveFlow(header: FlowHeader, parts: Map<string, Part>): DiagramFlow {
  const { source } = header;
  const listed = new Map<string, Part>();
  for (const ref of header.partRefs) {
    if (listed.has(ref.id)) {
      throw new Error(`${header.file}:${ref.line}: part "${ref.id}" is listed twice`);
    }
    const base = parts.get(ref.id);
    if (!base) throw new Error(`${header.file}:${ref.line}: unknown part "${ref.id}"`);
    const part = { ...base };
    if (ref.label !== undefined) part.label = ref.label;
    if (ref.tech === null) delete part.tech;
    else if (ref.tech !== undefined) part.tech = ref.tech;
    listed.set(ref.id, part);
  }
  for (const edge of header.edges) {
    for (const end of [edge.source, edge.target]) {
      if (!listed.has(end)) {
        throw new Error(
          `${header.file}:${edge.line}: edge "${edge.id}" uses "${end}", ` +
            'which the flow does not list in parts',
        );
      }
    }
  }
  for (const id of Object.keys(header.static ?? {})) {
    if (!listed.has(id)) source.fail(['static', id], `static position for unlisted part "${id}"`);
  }
  const flow: DiagramFlow = {
    id: header.id,
    title: header.title,
    showLanes: header.showLanes,
    parts: [...listed.values()],
    edges: header.edges.map(({ line: _line, ...edge }) => edge),
    steps: [],
    file: header.file,
  };
  if (header.widget !== undefined) flow.widget = header.widget;
  if (header.paths) flow.paths = header.paths;
  if (header.card) flow.card = header.card;
  if (header.static) flow.static = header.static;
  if (header.svg !== undefined) flow.svg = header.svg;
  if (header.alt !== undefined) flow.alt = header.alt;
  return flow;
}

async function readYaml(dir: string, name: string): Promise<YamlSource> {
  const file = path.join(dir, name);
  return new YamlSource(file, await readFile(file, 'utf8'));
}

function checkPaths(header: FlowHeader, flow: DiagramFlow): void {
  const stepIds = new Set(flow.steps.map((step) => step.id));
  header.paths?.forEach((flowPath, i) => {
    const seen = new Set<string>();
    flowPath.steps.forEach((id, j) => {
      const where = (message: string) =>
        header.source.fail(['paths', i, 'steps', j], `path "${flowPath.id}" ${message}`);
      if (!stepIds.has(id)) where(`lists unknown step "${id}"`);
      if (seen.has(id)) where(`lists step "${id}" twice`);
      seen.add(id);
    });
  });
}

type DetailLines = Map<string, Map<string, number>>;

/** `detail.next` names a step of the flow that comes after the detail step on every path. */
function checkDetailNext(flow: DiagramFlow, step: DiagramStep, at: string): void {
  const next = step.detail!.next!;
  if (!flow.steps.some((other) => other.id === next)) {
    throw new Error(
      `${at}: step "${step.id}" detail next step "${next}" is not a step of the flow`,
    );
  }
  const paths = flow.paths ?? [{ id: 'default', steps: flow.steps.map((other) => other.id) }];
  for (const path of paths) {
    const from = path.steps.indexOf(step.id);
    if (from !== -1 && path.steps.indexOf(next) <= from) {
      throw new Error(
        `${at}: step "${step.id}" detail next step "${next}" does not come after it in path "${path.id}"`,
      );
    }
  }
}

function checkDetails(flows: Map<string, DiagramFlow>, lines: DetailLines): void {
  const targets = new Map<string, { step: DiagramStep; line: number }[]>();
  for (const flow of flows.values()) {
    const found: { step: DiagramStep; line: number }[] = [];
    for (const step of flow.steps) {
      if (!step.detail) continue;
      const line = lines.get(flow.id)!.get(step.id)!;
      if (!flows.has(step.detail.flow)) {
        throw new Error(
          `${flow.file}:${line}: step "${step.id}" detail flow "${step.detail.flow}" not found`,
        );
      }
      if (step.detail.next) checkDetailNext(flow, step, `${flow.file}:${line}`);
      found.push({ step, line });
    }
    targets.set(flow.id, found);
  }
  const visit = (id: string, stack: string[]): void => {
    for (const { step, line } of targets.get(id)!) {
      const next = step.detail!.flow;
      const at = stack.indexOf(next);
      if (at !== -1) {
        const cycle = [...stack.slice(at), next].map((f) => `${f}.md`).join(' -> ');
        throw new Error(`${flows.get(id)!.file}:${line}: detail cycle: ${cycle}`);
      }
      visit(next, [...stack, next]);
    }
  };
  for (const id of flows.keys()) visit(id, [id]);
}

function stepContext(flow: DiagramFlow, config: ProjectConfig) {
  return {
    config,
    partIds: new Set(flow.parts.map((p) => p.id)),
    edgeIds: new Set(flow.edges.map((e) => e.id)),
  };
}

/** Load `project.yaml`, `parts.yaml` and every `flows/*.md` file under `dir`. */
export async function loadProject(dir: string): Promise<LoadedProject> {
  const config = parseProjectConfig(await readYaml(dir, 'project.yaml'));
  const parts = parseParts(await readYaml(dir, 'parts.yaml'), config);
  const flowsDir = path.join(dir, 'flows');
  const names = (await readdir(flowsDir)).filter((n) => n.endsWith('.md')).sort();
  const flows = new Map<string, DiagramFlow>();
  const detailLines: DetailLines = new Map();
  for (const name of names) {
    const file = path.join(flowsDir, name);
    const source = await readFile(file, 'utf8');
    const header = parseFlowHeader(file, source);
    const flow = resolveFlow(header, parts);
    const parsed = parseSteps(file, source, stepContext(flow, config));
    flow.steps = parsed.steps;
    checkPaths(header, flow);
    detailLines.set(flow.id, parsed.detailLines);
    flows.set(flow.id, flow);
  }
  checkDetails(flows, detailLines);
  return { config, parts, flows };
}
