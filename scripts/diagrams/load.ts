import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

import { type FlowHeader, parseFlowHeader } from './parse-flow.ts';
import { YamlSource, parseParts, parseProjectConfig } from './schema.ts';
import type { DiagramFlow, LoadedProject, Part } from './types.ts';

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
    if (ref.tech !== undefined) part.tech = ref.tech;
    listed.set(ref.id, part);
  }
  for (const edge of header.edges) {
    for (const end of [edge.source, edge.target]) {
      if (!listed.has(end)) {
        throw new Error(
          `${header.file}:${edge.line}: edge "${edge.id}" uses "${end}", which the flow does not list in parts`,
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
  return flow;
}

async function readYaml(dir: string, name: string): Promise<YamlSource> {
  const file = path.join(dir, name);
  return new YamlSource(file, await readFile(file, 'utf8'));
}

/** Load `project.yaml`, `parts.yaml` and every `flows/*.md` header under `dir`. */
export async function loadProject(dir: string): Promise<LoadedProject> {
  const config = parseProjectConfig(await readYaml(dir, 'project.yaml'));
  const parts = parseParts(await readYaml(dir, 'parts.yaml'), config);
  const flowsDir = path.join(dir, 'flows');
  const names = (await readdir(flowsDir)).filter((n) => n.endsWith('.md')).sort();
  const flows = new Map<string, DiagramFlow>();
  for (const name of names) {
    const file = path.join(flowsDir, name);
    const header = parseFlowHeader(file, await readFile(file, 'utf8'));
    flows.set(header.id, resolveFlow(header, parts));
  }
  return { config, parts, flows };
}
