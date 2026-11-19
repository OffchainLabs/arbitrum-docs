import type { Yaml } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { frontmatter } from 'micromark-extension-frontmatter';
import path from 'node:path';
import { z } from 'zod';

import { YamlSource, numberPair, text } from './schema.ts';
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

const override = z.strictObject({ label: text.optional(), tech: text.optional() });

const partEntry = z.union(
  [
    text,
    z
      .record(z.string(), override)
      .refine((entry) => Object.keys(entry).length === 1, 'a part override names exactly one part'),
  ],
  { error: 'a part entry must be a part id or a mapping of one part id to label or tech' },
);

const headerSchema = z.strictObject({
  title: text,
  widget: text.optional(),
  showLanes: z.boolean().default(true),
  parts: z.array(partEntry),
  edges: z
    .record(
      z.string(),
      z.string({ error: 'an edge must be a string: <source> -> <target> "label"' }),
    )
    .default({}),
  paths: z.array(z.strictObject({ id: text, label: text, steps: z.array(text) })).optional(),
  card: z.record(z.string(), z.union([z.string(), z.boolean()])).optional(),
  static: z.record(z.string(), numberPair).optional(),
});

function toPartRef(entry: z.infer<typeof partEntry>, line: number): PartRef {
  if (typeof entry === 'string') return { id: entry, line };
  const [[id, fields]] = Object.entries(entry) as [[string, z.infer<typeof override>]];
  const ref: PartRef = { id, line };
  if (fields.label !== undefined) ref.label = fields.label;
  if (fields.tech !== undefined) ref.tech = fields.tech;
  return ref;
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
  const data = src.parse(headerSchema, src.value ?? {});
  const header: FlowHeader = {
    id: path.basename(file, '.md'),
    file,
    title: data.title,
    showLanes: data.showLanes,
    partRefs: data.parts.map((entry, i) => toPartRef(entry, src.line(['parts', i]))),
    edges: Object.entries(data.edges).map(([id, value]) =>
      parseEdge(src, id, value, src.line(['edges', id])),
    ),
    source: src,
  };
  if (data.widget !== undefined) header.widget = data.widget;
  if (data.paths) header.paths = data.paths;
  if (data.card) header.card = data.card;
  if (data.static) header.static = data.static;
  return header;
}
