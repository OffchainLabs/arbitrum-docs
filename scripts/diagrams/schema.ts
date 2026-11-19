import { LineCounter, type Node, YAMLMap, isMap, isScalar, parseDocument } from 'yaml';

import type { Part, ProjectConfig } from './types.ts';

type Path = (string | number)[];
type Obj = Record<string, unknown>;

/** A YAML text that remembers where each node sits, so errors name a file and line. */
export class YamlSource {
  readonly file: string;
  readonly value: unknown;
  readonly #doc: ReturnType<typeof parseDocument>;
  readonly #lines: LineCounter;
  readonly #lineOffset: number;

  /** `lineOffset` is the number of file lines before the first YAML line. */
  constructor(file: string, text: string, lineOffset = 0) {
    this.file = file;
    this.#lineOffset = lineOffset;
    this.#lines = new LineCounter();
    this.#doc = parseDocument(text, { lineCounter: this.#lines, uniqueKeys: false });
    const [first] = this.#doc.errors;
    if (first) {
      const line = first.linePos?.[0].line ?? 1;
      throw new Error(`${file}:${line + lineOffset}: ${first.message.split('\n')[0]}`);
    }
    this.value = this.#doc.toJS();
  }

  line(path: Path): number {
    const node = this.#doc.getIn(path, true) as Node | undefined;
    const offset = node?.range?.[0] ?? 0;
    return this.#lines.linePos(offset).line + this.#lineOffset;
  }

  /** The key and string value of each pair in the map at `path`, duplicates included. */
  entries(path: Path): { key: string; value: string; line: number }[] {
    const map = this.#doc.getIn(path, true);
    if (!isMap(map)) return [];
    const out: { key: string; value: string; line: number }[] = [];
    for (const pair of (map as YAMLMap).items) {
      if (!isScalar(pair.key) || !isScalar(pair.value)) continue;
      const offset = pair.key.range?.[0] ?? 0;
      out.push({
        key: String(pair.key.value),
        value: String(pair.value.value),
        line: this.#lines.linePos(offset).line + this.#lineOffset,
      });
    }
    return out;
  }

  fail(path: Path, message: string): never {
    throw new Error(`${this.file}:${this.line(path)}: ${message}`);
  }
}

export function isObj(value: unknown): value is Obj {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function expectObj(src: YamlSource, value: unknown, path: Path, what: string): Obj {
  if (!isObj(value)) src.fail(path, `${what} must be a mapping`);
  return value;
}

export function expectString(src: YamlSource, value: unknown, path: Path, what: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    src.fail(path, `${what} must be a non-empty string`);
  }
  return value;
}

export function expectNumberPair(
  src: YamlSource,
  value: unknown,
  path: Path,
  what: string,
): [number, number] {
  const ok =
    Array.isArray(value) && value.length === 2 && value.every((n) => typeof n === 'number');
  if (!ok) src.fail(path, `${what} must be a pair of numbers`);
  return value as [number, number];
}

function expectNumbers(src: YamlSource, value: unknown, path: Path, what: string): number[] {
  if (!Array.isArray(value) || !value.every((n) => typeof n === 'number')) {
    src.fail(path, `${what} must be a list of numbers`);
  }
  return value as number[];
}

function parseLanes(src: YamlSource, raw: Obj): ProjectConfig['lanes'] {
  const lanes: ProjectConfig['lanes'] = {};
  for (const [id, value] of Object.entries(raw)) {
    const lane = expectObj(src, value, ['lanes', id], `lane "${id}"`);
    const label = expectString(src, lane['label'], ['lanes', id, 'label'], 'lane label');
    if (lane['svg'] === undefined) {
      lanes[id] = { label };
      continue;
    }
    const svg = expectObj(src, lane['svg'], ['lanes', id, 'svg'], 'lane svg');
    lanes[id] = {
      label,
      svg: {
        fill: expectString(src, svg['fill'], ['lanes', id, 'svg', 'fill'], 'lane fill'),
        stroke: expectString(src, svg['stroke'], ['lanes', id, 'svg', 'stroke'], 'lane stroke'),
      },
    };
  }
  return lanes;
}

function parseKinds(src: YamlSource, raw: Obj): ProjectConfig['kinds'] {
  const kinds: ProjectConfig['kinds'] = {};
  for (const [id, value] of Object.entries(raw)) {
    const kind = expectObj(src, value, ['kinds', id], `kind "${id}"`);
    const svg = expectObj(src, kind['svg'], ['kinds', id, 'svg'], 'kind svg');
    const at = (key: string): Path => ['kinds', id, 'svg', key];
    const out: ProjectConfig['kinds'][string]['svg'] = {
      fill: expectString(src, svg['fill'], at('fill'), 'kind fill'),
      title: expectString(src, svg['title'], at('title'), 'kind title color'),
      sub: expectString(src, svg['sub'], at('sub'), 'kind sub color'),
    };
    if (svg['stroke'] !== undefined) {
      out.stroke = expectString(src, svg['stroke'], at('stroke'), 'kind stroke');
    }
    kinds[id] = {
      label: expectString(src, kind['label'], ['kinds', id, 'label'], 'kind label'),
      svg: out,
    };
  }
  return kinds;
}

function parseRepos(src: YamlSource, raw: Obj): ProjectConfig['repos'] {
  const repos: ProjectConfig['repos'] = {};
  for (const [id, value] of Object.entries(raw)) {
    const repo = expectObj(src, value, ['repos', id], `repo "${id}"`);
    repos[id] = { url: expectString(src, repo['url'], ['repos', id, 'url'], 'repo url') };
  }
  return repos;
}

function parseSvg(src: YamlSource, raw: Obj): ProjectConfig['svg'] {
  const at = (key: string): Path => ['svg', key];
  const scale = raw['scale'];
  if (typeof scale !== 'number') src.fail(at('scale'), 'svg scale must be a number');
  return {
    theme: expectString(src, raw['theme'], at('theme'), 'svg theme'),
    canvas: expectNumberPair(src, raw['canvas'], at('canvas'), 'svg canvas'),
    cols: expectNumbers(src, raw['cols'], at('cols'), 'svg cols'),
    rows: expectNumbers(src, raw['rows'], at('rows'), 'svg rows'),
    box: expectNumberPair(src, raw['box'], at('box'), 'svg box'),
    scale,
    offset: expectNumberPair(src, raw['offset'], at('offset'), 'svg offset'),
  };
}

export function parseProjectConfig(src: YamlSource): ProjectConfig {
  const root = expectObj(src, src.value, [], 'project.yaml');
  const section = (key: string): Obj => expectObj(src, root[key], [key], `"${key}"`);
  return {
    lanes: parseLanes(src, section('lanes')),
    kinds: parseKinds(src, section('kinds')),
    repos: parseRepos(src, section('repos')),
    svg: parseSvg(src, section('svg')),
  };
}

export function parseParts(src: YamlSource, config: ProjectConfig): Map<string, Part> {
  const root = expectObj(src, src.value, [], 'parts.yaml');
  const parts = new Map<string, Part>();
  for (const [id, value] of Object.entries(root)) {
    const raw = expectObj(src, value, [id], `part "${id}"`);
    const label = expectString(src, raw['label'], [id, 'label'], `part "${id}" label`);
    const kind = expectString(src, raw['kind'], [id, 'kind'], `part "${id}" kind`);
    const lane = expectString(src, raw['lane'], [id, 'lane'], `part "${id}" lane`);
    if (!(kind in config.kinds)) src.fail([id, 'kind'], `part "${id}" has unknown kind "${kind}"`);
    if (!(lane in config.lanes)) src.fail([id, 'lane'], `part "${id}" has unknown lane "${lane}"`);
    const part: Part = { id, label, kind, lane };
    if (raw['tech'] !== undefined) {
      part.tech = expectString(src, raw['tech'], [id, 'tech'], `part "${id}" tech`);
    }
    parts.set(id, part);
  }
  return parts;
}
