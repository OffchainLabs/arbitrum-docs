import { LineCounter, type Node, isPair, isScalar, parseDocument, visit } from 'yaml';
import { z } from 'zod';

import type { Theme } from '../../components/widgets/FlowDiagram/model.ts';
import type { Part, ProjectConfig } from './types.ts';

type Path = (string | number)[];

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
    this.#rejectDuplicateKeys();
    this.value = this.#doc.toJS();
  }

  /** The line of the node at `path`, or of its nearest ancestor when the path is absent. */
  line(path: Path): number {
    for (let end = path.length; end >= 0; end--) {
      const node = this.#doc.getIn(path.slice(0, end), true) as Node | undefined;
      if (node?.range) return this.#lines.linePos(node.range[0]).line + this.#lineOffset;
    }
    return 1 + this.#lineOffset;
  }

  fail(path: Path, message: string): never {
    throw new Error(`${this.file}:${this.line(path)}: ${message}`);
  }

  /** Check `value` against `schema`. The first issue becomes a `<file>:<line>: <message>` error. */
  parse<T>(schema: z.ZodType<T>, value: unknown, base: Path = []): T {
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    const [issue] = result.error.issues;
    const path = [...base, ...(issue!.path as Path)];
    const where = issue!.path.length > 0 ? `${issue!.path.join('.')}: ` : '';
    return this.fail(path, `${where}${issue!.message}`);
  }

  #rejectDuplicateKeys(): void {
    visit(this.#doc, {
      Map: (_key, map, ancestors) => {
        const seen = new Set<string>();
        const inEdges = ancestors.some(
          (a) => isPair(a) && isScalar(a.key) && a.key.value === 'edges',
        );
        for (const pair of map.items) {
          if (!isScalar(pair.key)) continue;
          const key = String(pair.key.value);
          if (seen.has(key)) {
            const line = this.#lines.linePos(pair.key.range?.[0] ?? 0).line + this.#lineOffset;
            const what = inEdges ? 'edge id' : 'key';
            throw new Error(`${this.file}:${line}: duplicate ${what} "${key}"`);
          }
          seen.add(key);
        }
      },
    });
  }
}

export const text = z.string().trim().min(1, 'must not be empty');
export const numberPair = z.tuple([z.number(), z.number()]);

const textPair = z.tuple([text, text]);

const lane = z.strictObject({
  label: text,
  short: text.optional(),
  svg: z.strictObject({ fill: text, stroke: text, label: text.optional() }).optional(),
  widget: z.strictObject({ accent: text, fill: textPair, border: textPair }).optional(),
});

const kind = z.strictObject({
  label: text,
  svg: z.strictObject({
    fill: text,
    title: text,
    sub: text,
    stroke: text.optional(),
    key: text.optional(),
  }),
  widget: z
    .strictObject({
      fill: text,
      title: text,
      sub: text,
      offLane: z.strictObject({ lane: text, label: text }).optional(),
    })
    .optional(),
});

const projectConfig = z
  .strictObject({
    lanes: z.record(z.string(), lane),
    kinds: z.record(z.string(), kind),
    repos: z.record(z.string(), z.strictObject({ url: text, code: text.optional() })),
    finality: z
      .record(z.string(), z.strictObject({ label: text, term: text.optional() }))
      .optional(),
    card: z
      .strictObject({
        detailsToggle: text,
        symptoms: text,
        impact: text,
        recovery: text,
        showFlag: z.boolean(),
      })
      .optional(),
    svg: z.strictObject({
      canvas: numberPair,
      cols: z.array(z.number()),
      rows: z.array(z.number()),
      box: numberPair,
      scale: z.number(),
      offset: numberPair,
      background: text.optional(),
      reserve: z.strictObject({ x: numberPair, y: numberPair }).optional(),
    }),
  })
  .superRefine((config, ctx) => {
    for (const [id, kind] of Object.entries(config.kinds)) {
      const lane = kind.widget?.offLane?.lane;
      if (lane !== undefined && !(lane in config.lanes)) {
        ctx.addIssue({
          code: 'custom',
          path: ['kinds', id, 'widget', 'offLane', 'lane'],
          message: `kind "${id}" offLane has unknown lane "${lane}"`,
        });
      }
    }
  });

export function parseProjectConfig(src: YamlSource): ProjectConfig {
  return src.parse(projectConfig, src.value) as ProjectConfig;
}

const theme = z.strictObject({
  gradient: text,
  connector: text,
  active: text,
  activeGlow: text,
  startGlow: text,
  focus: text,
  chip: text,
  ink: text,
  badge: text,
  badgeText: text,
  font: text,
  dimmed: z.number().min(0).max(1),
});

export function parseTheme(src: YamlSource): Theme {
  return src.parse(theme, src.value);
}

const partFields = z.strictObject({
  label: text,
  tech: text.optional(),
  kind: text,
  lane: text,
  docs: z
    .string()
    .regex(/^\/[^\s#?]*$/, 'must be a root-absolute page path, such as /get-started')
    .optional(),
});

export function parseParts(src: YamlSource, config: ProjectConfig): Map<string, Part> {
  const schema = z.record(z.string(), partFields).superRefine((raw, ctx) => {
    for (const [id, part] of Object.entries(raw)) {
      if (!(part.kind in config.kinds)) {
        ctx.addIssue({
          code: 'custom',
          path: [id, 'kind'],
          message: `part "${id}" has unknown kind "${part.kind}"`,
        });
      }
      if (!(part.lane in config.lanes)) {
        ctx.addIssue({
          code: 'custom',
          path: [id, 'lane'],
          message: `part "${id}" has unknown lane "${part.lane}"`,
        });
      }
    }
  });
  const raw = src.parse(schema, src.value);
  const parts = new Map<string, Part>();
  for (const [id, part] of Object.entries(raw)) {
    const { tech, docs, ...rest } = part;
    parts.set(id, {
      id,
      ...rest,
      ...(tech === undefined ? {} : { tech }),
      ...(docs === undefined ? {} : { docs }),
    });
  }
  return parts;
}
