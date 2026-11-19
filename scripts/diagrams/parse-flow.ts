import type { Heading, Paragraph, Yaml } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { frontmatter } from 'micromark-extension-frontmatter';
import path from 'node:path';
import { z } from 'zod';

import { YamlSource, numberPair, text } from './schema.ts';
import type {
  CodeRef,
  DiagramEdge,
  DiagramStep,
  EdgeStyle,
  FlowPath,
  ProjectConfig,
  StepFailure,
} from './types.ts';

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

/** Normalize line endings and drop trailing spaces. Line numbers stay the same. */
export function normalizeSource(source: string): string {
  return source.replaceAll('\r\n', '\n').replace(/[ \t]+$/gm, '');
}

function parseMarkdown(source: string) {
  return fromMarkdown(normalizeSource(source), {
    extensions: [frontmatter(['yaml'])],
    mdastExtensions: [frontmatterFromMarkdown(['yaml'])],
  });
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
  const [node] = parseMarkdown(text).children;
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

/** What a step is checked against. `flowIds` is filled by the loader for `detail`. */
export interface StepContext {
  config: ProjectConfig;
  partIds: Set<string>;
  edgeIds: Set<string>;
}

export interface ParsedSteps {
  steps: DiagramStep[];
  /** The file line of each step's `detail:` entry, by step id. */
  detailLines: Map<string, number>;
}

const KEYS = ['parts', 'edges', 'flag', 'code', 'cites', 'finality', 'lane', 'docs', 'detail'];
const KEY_PAIR = /^([a-z]+): (.*)$/;
const HEADING = /^(.*?)\s*\{#([^}\s]+)\}$/;
const POSITIVE = /^[1-9]\d*$/;

interface Entry {
  value: string;
  line: number;
}

interface Draft {
  id: string;
  title: string;
  line: number;
  paragraphs: { text: string; line: number }[];
  failure: { text: string; line: number }[] | undefined;
}

const collapse = (raw: string) => raw.replace(/[ \t]*\n[ \t]*/g, ' ').trim();

function isMetadata(lines: string[]): boolean {
  const known = lines.filter((l) => KEYS.some((k) => l.startsWith(`${k}: `)));
  return known.length > 0 && lines.every((l) => KEY_PAIR.test(l));
}

function readMetadata(file: string, raw: string, firstLine: number): Map<string, Entry> {
  const entries = new Map<string, Entry>();
  raw.split('\n').forEach((lineText, i) => {
    const line = firstLine + i;
    for (const pair of lineText.split(' · ')) {
      const match = KEY_PAIR.exec(pair);
      if (!match) throw new Error(`${file}:${line}: expected "key: value", got "${pair}"`);
      const [, key, value] = match as unknown as [string, string, string];
      if (!KEYS.includes(key)) throw new Error(`${file}:${line}: unknown key "${key}"`);
      if (entries.has(key)) throw new Error(`${file}:${line}: duplicate key "${key}"`);
      entries.set(key, { value: value.trim(), line });
    }
  });
  return entries;
}

const idList = z
  .string()
  .transform((value) => value.split(',').map((item) => item.trim()))
  .pipe(z.array(text));

const docsLink = z
  .string()
  .regex(/^\[[^\]]+\]\([^)\s]+\)$/, 'must read [label](href)')
  .transform((value) => {
    const [, label, href] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(value) as unknown as [
      string,
      string,
      string,
    ];
    return { label, href };
  });

const detailRef = z
  .string()
  .regex(/^\S+ -> \S+$/, 'must read <part> -> <flow-id>')
  .transform((value) => {
    const [part, flow] = value.split(' -> ') as [string, string];
    return { part, flow };
  });

const fields = {
  parts: idList,
  edges: idList,
  flag: text,
  code: text,
  cites: text,
  finality: text,
  lane: text,
  docs: docsLink,
  detail: detailRef,
};

interface Ref {
  repo: string | undefined;
  path: string;
  line: number | undefined;
}

/** Split `<repo>/<path>[:<line>]`, `<file>[:<line>]` or `<line>`. */
function splitRef(raw: string): Ref | string {
  if (/^\d+$/.test(raw)) {
    return POSITIVE.test(raw) ? { repo: undefined, path: '', line: Number(raw) } : badLine(raw);
  }
  const colon = raw.lastIndexOf(':');
  const pathText = colon === -1 ? raw : raw.slice(0, colon);
  const lineText = colon === -1 ? undefined : raw.slice(colon + 1);
  if (lineText !== undefined && !POSITIVE.test(lineText)) return badLine(lineText);
  const line = lineText === undefined ? undefined : Number(lineText);
  const slash = pathText.indexOf('/');
  if (slash === -1) return { repo: undefined, path: pathText, line };
  return { repo: pathText.slice(0, slash), path: pathText.slice(slash + 1), line };
}

const badLine = (value: string) => `line must be a positive integer, got "${value}"`;

function toCodeRef(repo: string, refPath: string, line: number | undefined): CodeRef {
  return line === undefined ? { repo, path: refPath } : { repo, path: refPath, line };
}

class StepFail {
  readonly file: string;
  readonly id: string;
  constructor(file: string, id: string) {
    this.file = file;
    this.id = id;
  }
  at(line: number, message: string): never {
    throw new Error(`${this.file}:${line}: step "${this.id}" ${message}`);
  }
}

function explicitRef(fail: StepFail, key: string, entry: Entry, raw: string, ctx: StepContext) {
  const ref = splitRef(raw);
  if (typeof ref === 'string') return fail.at(entry.line, `${key}: ${ref}`);
  if (ref.repo === undefined) {
    return fail.at(entry.line, `${key}: "${raw}" must read <repo>/<path>[:<line>]`);
  }
  if (!(ref.repo in ctx.config.repos)) {
    return fail.at(entry.line, `${key}: unknown repo "${ref.repo}"`);
  }
  return toCodeRef(ref.repo, ref.path, ref.line);
}

function resolveCites(
  fail: StepFail,
  entry: Entry,
  code: CodeRef | undefined,
  ctx: StepContext,
): CodeRef[] {
  const cites: CodeRef[] = [];
  for (const raw of entry.value.split(/\s*[,;]\s*/)) {
    const ref = splitRef(raw);
    const previous = cites.at(-1);
    if (typeof ref === 'string') return fail.at(entry.line, `cites: ${ref}`);
    if (ref.repo !== undefined) {
      cites.push(explicitRef(fail, 'cites', entry, raw, ctx));
    } else if (ref.path === '') {
      if (!previous) return fail.at(entry.line, `cites: "${raw}" has no previous entry to reuse`);
      cites.push(toCodeRef(previous.repo, previous.path, ref.line));
    } else {
      if (!code) return fail.at(entry.line, `cites: "${raw}" needs a code: entry to resolve it`);
      const dir = path.posix.dirname(code.path);
      const full = dir === '.' ? ref.path : `${dir}/${ref.path}`;
      cites.push(toCodeRef(code.repo, full, ref.line));
    }
  }
  return cites;
}

function readFailure(fail: StepFail, blocks: { text: string; line: number }[], line: number) {
  const found: Record<string, string> = {};
  for (const block of blocks) {
    const match = /^\*\*(Symptoms|Impact|Recovery)\.\*\*\s*([\s\S]*)$/.exec(block.text);
    if (!match)
      return fail.at(
        block.line,
        'failure paragraphs must start **Symptoms.**, **Impact.** or **Recovery.**',
      );
    const [, name, body] = match as unknown as [string, string, string];
    if (name in found) return fail.at(block.line, `failure has two **${name}.** paragraphs`);
    found[name] = collapse(body);
  }
  for (const name of ['Symptoms', 'Impact', 'Recovery']) {
    if (!(name in found)) return fail.at(line, `failure is missing **${name}.**`);
  }
  const failure: StepFailure = {
    symptoms: found['Symptoms']!,
    impact: found['Impact']!,
    recovery: found['Recovery']!,
  };
  return failure;
}

function checkIds(fail: StepFail, kind: string, entry: Entry, ids: string[], known: Set<string>) {
  for (const id of ids) {
    if (!known.has(id)) fail.at(entry.line, `${kind} "${id}" is not in the flow's ${kind}s`);
  }
}

function buildStep(
  file: string,
  draft: Draft,
  ctx: StepContext,
): [DiagramStep, number | undefined] {
  const fail = new StepFail(file, draft.id);
  const [first, ...rest] = draft.paragraphs;
  const metaFirst = first !== undefined && isMetadata(first.text.split('\n'));
  const entries = metaFirst ? readMetadata(file, first.text, first.line) : new Map<string, Entry>();
  const prose = (metaFirst ? rest : draft.paragraphs).map((p) => collapse(p.text));
  const values: Record<string, unknown> = {};
  for (const [key, entry] of entries) {
    const result = fields[key as keyof typeof fields].safeParse(entry.value);
    if (!result.success) fail.at(entry.line, `${key}: ${result.error.issues[0]!.message}`);
    values[key] = result.data;
  }
  const laneEntry = entries.get('lane');
  if (!laneEntry) return fail.at(draft.line, 'is missing lane');
  const lane = values['lane'] as string;
  if (!(lane in ctx.config.lanes)) fail.at(laneEntry.line, `has unknown lane "${lane}"`);
  const parts = (values['parts'] as string[] | undefined) ?? [];
  const edges = (values['edges'] as string[] | undefined) ?? [];
  if (entries.has('parts')) checkIds(fail, 'part', entries.get('parts')!, parts, ctx.partIds);
  if (entries.has('edges')) checkIds(fail, 'edge', entries.get('edges')!, edges, ctx.edgeIds);
  if (prose.length === 0) return fail.at(draft.line, 'has no text');
  const step: DiagramStep = {
    id: draft.id,
    title: draft.title,
    text: prose.join('\n\n'),
    parts,
    edges,
    cites: [],
    lane,
  };
  const codeEntry = entries.get('code');
  if (codeEntry) step.code = explicitRef(fail, 'code', codeEntry, codeEntry.value, ctx);
  const citesEntry = entries.get('cites');
  if (citesEntry) step.cites = resolveCites(fail, citesEntry, step.code, ctx);
  for (const key of ['flag', 'finality', 'docs'] as const) {
    if (key in values) Object.assign(step, { [key]: values[key] });
  }
  if (draft.failure) step.failure = readFailure(fail, draft.failure, draft.line);
  const detail = values['detail'] as { part: string; flow: string } | undefined;
  if (detail) {
    const detailEntry = entries.get('detail')!;
    if (!ctx.partIds.has(detail.part)) {
      fail.at(detailEntry.line, `detail part "${detail.part}" is not in the flow's parts`);
    }
    step.detail = detail;
  }
  return [step, entries.get('detail')?.line];
}

function heading(file: string, node: Heading, source: string, drafts: Draft[]): Draft | 'failure' {
  const line = node.position!.start.line;
  const raw = source.slice(node.position!.start.offset!, node.position!.end.offset!);
  const body = raw.replace(/^#+\s*/, '').trim();
  if (node.depth === 3 && body === 'Failure') return 'failure';
  if (node.depth !== 2)
    throw new Error(
      `${file}:${line}: only "## Title {#id}" and "### Failure" headings are allowed`,
    );
  const match = HEADING.exec(body);
  if (!match) throw new Error(`${file}:${line}: step heading "${body}" is missing {#id}`);
  const [, title, id] = match as unknown as [string, string, string];
  if (title === '') throw new Error(`${file}:${line}: step "${id}" has an empty title`);
  if (drafts.some((d) => d.id === id))
    throw new Error(`${file}:${line}: duplicate step id "${id}"`);
  return { id, title, line, paragraphs: [], failure: undefined };
}

/** Read the `## Title {#id}` sections after the YAML header of a flow file. */
export function parseSteps(file: string, source: string, ctx: StepContext): ParsedSteps {
  const normalized = normalizeSource(source);
  const drafts: Draft[] = [];
  for (const node of parseMarkdown(normalized).children.slice(1)) {
    const line = node.position!.start.line;
    const current = drafts.at(-1);
    if (node.type === 'heading') {
      const result = heading(file, node, normalized, drafts);
      if (result === 'failure') {
        if (!current) throw new Error(`${file}:${line}: "### Failure" must follow a step heading`);
        current.failure = [];
      } else {
        drafts.push(result);
      }
    } else if (node.type === 'paragraph') {
      if (!current) throw new Error(`${file}:${line}: text before the first step heading`);
      const para = node as Paragraph;
      const text = normalized.slice(para.position!.start.offset!, para.position!.end.offset!);
      (current.failure ?? current.paragraphs).push({ text, line });
    } else {
      throw new Error(
        `${file}:${line}: a ${node.type} is not allowed in a step section; use paragraphs`,
      );
    }
  }
  const steps: DiagramStep[] = [];
  const detailLines = new Map<string, number>();
  for (const draft of drafts) {
    const [step, detailLine] = buildStep(file, draft, ctx);
    steps.push(step);
    if (detailLine !== undefined) detailLines.set(step.id, detailLine);
  }
  return { steps, detailLines };
}
