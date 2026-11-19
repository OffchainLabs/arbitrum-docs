import type { Yaml } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { frontmatter } from 'micromark-extension-frontmatter';
import path from 'node:path';

import { YamlSource, expectNumberPair, expectObj, expectString, isObj } from './schema.ts';
import type { DiagramEdge, EdgeStyle, FlowPath } from './types.ts';

export interface PartRef {
  id: string;
  label?: string;
  tech?: string;
  line: number;
}

/** What the YAML header of a flow file says, before it is checked against the parts. */
export interface FlowHeader {
  id: string;
  file: string;
  widget?: string;
  title: string;
  showLanes: boolean;
  partRefs: PartRef[];
  edges: (DiagramEdge & { line: number })[];
  paths?: FlowPath[];
  card?: Record<string, string | boolean>;
  static?: Record<string, [number, number]>;
  source: YamlSource;
}

const EDGE = /^(\S+)\s+(<->|->)\s+(\S+)(?:\s+"([^"]*)")?(?:\s+(dashed|dotted))?$/;

export function parseEdge(source: YamlSource, id: string, text: string, line: number) {
  const match = EDGE.exec(text.trim());
  if (!match) {
    throw new Error(
      `${source.file}:${line}: edge "${id}" must read <source> -> <target> "label" [dashed|dotted], got "${text}"`,
    );
  }
  const [, from, arrow, to, label, style] = match;
  const edge: DiagramEdge & { line: number } = {
    id,
    source: from!,
    target: to!,
    label: label ?? '',
    both: arrow === '<->',
    style: (style ?? 'solid') as EdgeStyle,
    line,
  };
  return edge;
}

function parsePartRefs(src: YamlSource, raw: unknown): PartRef[] {
  if (!Array.isArray(raw)) src.fail(['parts'], '"parts" must be a list');
  return raw.map((item, i) => {
    const at = ['parts', i];
    const line = src.line(at);
    if (typeof item === 'string') return { id: item, line };
    const map = expectObj(src, item, at, 'a part entry');
    const [id, ...rest] = Object.keys(map);
    if (id === undefined || rest.length > 0) {
      src.fail(at, 'a part override must be a mapping with one part id');
    }
    const override = expectObj(src, map[id], [...at, id], `override of part "${id}"`);
    const ref: PartRef = { id, line };
    for (const [key, value] of Object.entries(override)) {
      if (key !== 'label' && key !== 'tech') {
        src.fail([...at, id, key], `part "${id}" override may set label or tech, not "${key}"`);
      }
      ref[key] = expectString(src, value, [...at, id, key], `override ${key}`);
    }
    return ref;
  });
}

function parsePaths(src: YamlSource, raw: unknown): FlowPath[] {
  if (!Array.isArray(raw)) src.fail(['paths'], '"paths" must be a list');
  return raw.map((item, i) => {
    const at = ['paths', i];
    const map = expectObj(src, item, at, 'a path');
    const steps = map['steps'];
    if (!Array.isArray(steps) || !steps.every((s) => typeof s === 'string')) {
      src.fail([...at, 'steps'], 'path steps must be a list of step ids');
    }
    return {
      id: expectString(src, map['id'], [...at, 'id'], 'path id'),
      label: expectString(src, map['label'], [...at, 'label'], 'path label'),
      steps,
    };
  });
}

function parseCard(src: YamlSource, raw: unknown): Record<string, string | boolean> {
  const card = expectObj(src, raw, ['card'], '"card"');
  for (const [key, value] of Object.entries(card)) {
    if (typeof value !== 'string' && typeof value !== 'boolean') {
      src.fail(['card', key], `card "${key}" must be a string or a boolean`);
    }
  }
  return card as Record<string, string | boolean>;
}

function parseStatic(src: YamlSource, raw: unknown): Record<string, [number, number]> {
  const positions = expectObj(src, raw, ['static'], '"static"');
  const out: Record<string, [number, number]> = {};
  for (const [id, value] of Object.entries(positions)) {
    out[id] = expectNumberPair(src, value, ['static', id], `static position of "${id}"`);
  }
  return out;
}

function parseEdges(src: YamlSource): FlowHeader['edges'] {
  const seen = new Set<string>();
  return src.entries(['edges']).map(({ key, value, line }) => {
    if (seen.has(key)) throw new Error(`${src.file}:${line}: duplicate edge id "${key}"`);
    seen.add(key);
    return parseEdge(src, key, value, line);
  });
}

/** Read the YAML header of one flow file. The file name, without `.md`, is the flow id. */
export function parseFlowHeader(file: string, text: string): FlowHeader {
  const tree = fromMarkdown(text, {
    extensions: [frontmatter(['yaml'])],
    mdastExtensions: [frontmatterFromMarkdown(['yaml'])],
  });
  const [node] = tree.children;
  if (node?.type !== 'yaml')
    throw new Error(`${file}:1: a flow file must start with a YAML header`);
  const src = new YamlSource(file, (node as Yaml).value, node.position?.start.line ?? 1);
  const root = expectObj(src, src.value ?? {}, [], 'the header');
  const header: FlowHeader = {
    id: path.basename(file, '.md'),
    file,
    title: expectString(src, root['title'], ['title'], '"title"'),
    showLanes: root['showLanes'] === true,
    partRefs: parsePartRefs(src, root['parts']),
    edges: [],
    source: src,
  };
  if (root['showLanes'] !== undefined && typeof root['showLanes'] !== 'boolean') {
    src.fail(['showLanes'], '"showLanes" must be true or false');
  }
  if (root['edges'] !== undefined) {
    if (!isObj(root['edges'])) src.fail(['edges'], '"edges" must be a mapping of id to edge');
    header.edges = parseEdges(src);
  }
  if (root['widget'] !== undefined) {
    header.widget = expectString(src, root['widget'], ['widget'], '"widget"');
  }
  if (root['paths'] !== undefined) header.paths = parsePaths(src, root['paths']);
  if (root['card'] !== undefined) header.card = parseCard(src, root['card']);
  if (root['static'] !== undefined) header.static = parseStatic(src, root['static']);
  return header;
}
